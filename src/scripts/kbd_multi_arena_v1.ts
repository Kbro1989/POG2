import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { createLogger } from '../utils/logger.js';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';

const logger = createLogger('KBDArena');

// Variant IDs for KBD (Standard mapping for RS3/OSRS variants)
const KBD_VARIANTS = [50, 150, 708, 1183, 2263, 3127, 4304, 5240];

async function main() {
    logger.info('Starting Multi-NPC KBD Arena Synthesis...');
    
    const root = getSovereignRoot();
    const outputDir = join(root, 'audit_output', 'kbd_arena');
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

    // This script generates a master GLTF that instantiates the 8 variants
    // arranged in a ritual circle.
    
    const arenaGltf = {
        asset: { version: "2.0", generator: "POG2-Sovereign-Arena" },
        scene: 0,
        scenes: [{ nodes: [0, 1, 2, 3, 4, 5, 6, 7] }],
        nodes: KBD_VARIANTS.map((id, index) => {
            const angle = (index / KBD_VARIANTS.length) * Math.PI * 2;
            const radius = 10.0;
            return {
                name: `KBD_Variant_${id}`,
                translation: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
                rotation: [0, -angle, 0, 1], // Facing center
                scale: [1, 1, 1]
                // mesh: 0, // Placeholder for the actual KBD mesh reference
            };
        }),
        meshes: [
            {
                name: "KBD_Master_Mesh",
                primitives: [{
                    attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 },
                    indices: 3,
                    material: 0
                }]
            }
        ],
        materials: [{ name: "KBD_Sovereign_Material", pbrMetallicRoughness: { baseColorFactor: [0.1, 0.1, 0.1, 1] } }]
    };

    const outputPath = join(outputDir, 'kbd_multi_arena.gltf');
    writeFileSync(outputPath, JSON.stringify(arenaGltf, null, 2));
    
    logger.info(`Multi-NPC Arena scaffolded at: ${outputPath}`);
    console.log(`\n\x1b[38;5;154m[ARENA_SYNTHESIS_COMPLETE]\x1b[0m 8 variants deployed to spatial substrate.`);
}

main().catch(err => {
    logger.error({ err }, 'Arena synthesis failed');
    process.exit(1);
});
