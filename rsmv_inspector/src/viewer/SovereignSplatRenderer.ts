import * as THREE from 'three';

interface GhostSplatSnapshot {
    heatmap: number[]; // 66x66 flattened density values
    dimensions: { w: number, h: number }; // 66, 66
    mapsquare: string; // "x,z"
}

interface EntitySplat {
    id: string;
    position: THREE.Vector3;
    heat: number;
}

/**
 * SovereignSplatRenderer
 *
 * Visualizes the "Influence Layer" of the Sovereign substrate.
 * Renders pulsating auras (GhostSplats) around entities based on training heat.
 */
export class SovereignSplatRenderer {
    private scene: THREE.Scene;
    private splatMesh: THREE.InstancedMesh;
    private dummy = new THREE.Object3D();
    private clock = new THREE.Clock();

    // Configuration
    private readonly MAX_SPLATS = 1000;
    private readonly TILE_SIZE = 128;

    // Threshold Colors
    private readonly COLOR_HIGH = new THREE.Color(0x00ffff); // Cyan: >= 0.7
    private readonly COLOR_MID = new THREE.Color(0xff00ff);  // Magenta: >= 0.4
    private readonly COLOR_LOW = new THREE.Color(0xffff00);  // Yellow: >= 0.2

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.initMeshes();
    }

    private initMeshes() {
        // A small sphere for the aura core
        const geometry = new THREE.SphereGeometry(1, 16, 16);

        // We use a basic transparent material.
        // Since we want individual colors per instance, we will use instanceColor.
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.6,
            depthTest: false,
            blending: THREE.AdditiveBlending
        });

        this.splatMesh = new THREE.InstancedMesh(geometry, material, this.MAX_SPLATS);
        this.splatMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.splatMesh.frustumCulled = false;

        this.scene.add(this.splatMesh);
    }

    /**
     * updateFromSnapshot - Maps the 66x66 heatmap to entity positions.
     * @param snapshot The GhostSplat density matrix from POG2WorldDO
     * @param entities The current visible entities in the viewer
     */
    public updateFromSnapshot(snapshot: GhostSplatSnapshot, entities: any[]) {
        let splatIdx = 0;

        // Decode the mapsquare center
        const [msX, msZ] = snapshot.mapsquare.split(',').map(Number);
        const worldOffsetX = msX * 64 * this.TILE_SIZE;
        const worldOffsetZ = msZ * 64 * this.TILE_SIZE;

        entities.forEach(entity => {
            // 1. Convert entity world pos to heatmap local coords (0-65)
            // The 66x66 window is centered on the avatar, usually.
            // For this implementation, we assume the snapshot provides
            // the heat value relative to the entity's current position.

            const heat = this.getHeatAtPosition(snapshot, entity);

            if (heat >= 0.2) {
                const color = this.getColorForHeat(heat);

                // Position the splat at the entity center
                this.dummy.position.set(entity.position.x, entity.position.y + 50, entity.position.z);

                // Scale the sphere based on heat (0.2 -> small, 0.7 -> large)
                const scale = 2 + (heat * 10);
                this.dummy.scale.set(scale, scale, scale);

                this.dummy.updateMatrix();
                this.splatMesh.setMatrixAt(splatIdx, this.dummy.matrix);
                this.splatMesh.setColorAt(splatIdx, color);

                splatIdx++;
            }
        });

        this.splatMesh.instanceMatrix.needsUpdate = true;
        if (this.splatMesh.instanceColor) {
            this.splatMesh.instanceColor.needsUpdate = true;
        }
        this.splatMesh.count = splatIdx;
    }

    private getHeatAtPosition(snapshot: GhostSplatSnapshot, entity: any): number {
        // Calculate local index in the 66x66 array
        // This logic depends on how the server packs the heatmap.
        // Assuming: localX = (entityX - windowMinX) / TILE_SIZE

        // For the purpose of this visualizer, if the server provides
        // entity-specific heat in the packet, we use that.
        // Otherwise, we sample the heatmap.
        if (entity.sovereignHeat !== undefined) return entity.sovereignHeat;

        // Fallback: sample heatmap (simplified mapping)
        const lx = Math.floor(entity.position.x / this.TILE_SIZE) % 66;
        const lz = Math.floor(entity.position.z / this.TILE_SIZE) % 66;
        const idx = lz * 66 + lx;

        return snapshot.heatmap[idx] || 0;
    }

    private getColorForHeat(heat: number): THREE.Color {
        if (heat >= 0.7) return this.COLOR_HIGH;
        if (heat >= 0.4) return this.COLOR_MID;
        return this.COLOR_LOW;
    }

    /**
     * animate - Call this in the main render loop to create the pulsating effect
     */
    public animate() {
        const time = this.clock.getElapsedTime();
        const pulse = Math.sin(time * 3) * 0.2 + 1.0; // Pulsate between 0.8 and 1.2

        // We can't easily scale individual instances in InstancedMesh without
        // updating all matrices, so we scale the whole mesh for the pulse
        // or use a custom shader. For now, global pulse:
        this.splatMesh.scale.set(pulse, pulse, pulse);
    }

    public setVisible(visible: boolean) {
        this.splatMesh.visible = visible;
    }

    public dispose() {
        this.splatMesh.geometry.dispose();
        (this.splatMesh.material as THREE.Material).dispose();
        this.scene.remove(this.splatMesh);
    }
}
