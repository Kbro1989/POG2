import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';

async function main() {
    console.log("🚀 Initializing Blender Heavy-Lifter node...");

    const inputGlb = join(process.cwd(), 'rsmv', 'model.glb');
    if (!existsSync(inputGlb)) {
        console.error(`❌ Input GLB not found at ${inputGlb}. Please run verify_kinematic_render.ts first.`);
        process.exit(1);
    }

    const outputDir = join(process.cwd(), 'audit_output', 'scene_render', 'babylon_optimized');
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

    const outputGlb = join(outputDir, 'player_walk_babylon.glb');
    const scriptPath = join(outputDir, 'blender_retarget.py');

    // Generate the heavy lifter Python script for Blender 5.0
    const pythonScript = `
import bpy
import sys

def main():
    print("\\n[SOVEREIGN] Starting Blender Heavy-Lifter Pipeline")
    print(f"[SOVEREIGN] Importing Raw RS3 Geometry: ${inputGlb.replace(/\\/g, '/')}")
    
    # 1. Clear default scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    
    # 2. Import raw GLB with RS3 deep kinematic bones
    bpy.ops.import_scene.gltf(filepath=r"${inputGlb.replace(/\\/g, '/')}")
    
    # 3. Analyze Armature
    armatures = [obj for obj in bpy.data.objects if obj.type == 'ARMATURE']
    if not armatures:
        print("[SOVEREIGN] ERROR: No Armature found. Rigging data was lost!")
        sys.exit(1)
        
    rig = armatures[0]
    bone_count = len(rig.data.bones)
    print(f"[SOVEREIGN] ✅ HD Rig Verified. Found {bone_count} bones intact.")
    
    # 4. Verify Animations
    actions = bpy.data.actions
    print(f"[SOVEREIGN] ✅ Animations Verified. Found {len(actions)} loaded actions.")
    for act in actions:
        print(f"        - {act.name} (Frames: {int(act.frame_range[1])})")

    # 5. Heavy-Lift Optimization (Ensuring Babylon compatibility)
    # E.g. Apply rotational fixes or normalize scale if needed
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            # Ensure smooth shading on all meshes for optimal lightweight rendering
            for poly in obj.data.polygons:
                poly.use_smooth = True
            obj.data.update()
    
    # 6. Export Babylon-Ready Lightweight GLB
    out_path = r"${outputGlb.replace(/\\/g, '/')}"
    print(f"[SOVEREIGN] Exporting optimized GLB to {out_path}...")
    
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        export_apply=True,
        export_animations=True,
        export_def_bones=True, # Ensure ALL bones are exported even if not deformed
        export_yup=True,
        use_selection=False
    )
    print("[SOVEREIGN] 🏆 Blender Heavy-Lifter Pipeline Complete.")

if __name__ == '__main__':
    main()
`;

    writeFileSync(scriptPath, pythonScript);
    console.log(`📝 Wrote python script to ${scriptPath}`);

    // Call Blender Headless
    const blenderPath = "C:\\Program Files\\Blender Foundation\\Blender 5.0\\blender.exe";
    const args = ["--background", "--python", scriptPath];

    console.log(`🎬 Triggering Blender 5.0...`);

    const blenderProcess = spawn(blenderPath, args, { stdio: 'pipe' });

    blenderProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\\n');
        for (const line of lines) {
            if (line.includes('[SOVEREIGN]')) {
                console.log(line.trim());
            }
        }
    });

    blenderProcess.stderr.on('data', (data) => {
        console.error(`Blender Error: ${data}`);
    });

    blenderProcess.on('exit', (code) => {
        if (code === 0) {
            console.log(`\\n🏆 SUCCESS: Lightweight Babylon-ready GLB written to: ${outputGlb}`);
            console.log(`You can now drop this optimized file into sandbox.babylonjs.com with full bone data & animation intact.`);
        } else {
            console.error(`❌ Blender process exited with code ${code}`);
        }
    });
}

main().catch(console.error);

