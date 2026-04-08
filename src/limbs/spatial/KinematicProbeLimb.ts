import { InteractionPair, isTransversal, getInteractionResult } from '../../forensics/ObjectBinaryStore.js';
import { SovereignInteractionLimb } from './SovereignInteractionLimb.js';

export interface KinematicProbe {
    id: number;
    type: 'MOUSE' | 'PLATYPUS';
    coords: { x: number, z: number, plane: number };
    velocity: { dx: number, dz: number };
    isWoundUp: boolean;
}

/**
 * Kinematic Probe Limb
 * Locomotion engine for autonomous spatial probes.
 */
export class KinematicProbeLimb {
    private probes: Map<number, KinematicProbe> = new Map();
    private collisionMap: any = null;
    private interactionLimb: SovereignInteractionLimb | null = null;

    constructor() {
        console.log("KinematicProbeLimb: Locomotion initialized.");
    }

    public setInteractionLimb(limb: SovereignInteractionLimb) {
        this.interactionLimb = limb;
    }

    /**
     * Injects the local mapsquare collision substrate.
     */
    public setCollisionMap(map: any) {
        this.collisionMap = map;
    }

    /**
     * Updates the position of all active probes.
     */
    public update(deltaTime: number) {
        for (const [id, probe] of this.probes) {
            this.processMovement(probe, deltaTime);
        }
    }

    private processMovement(probe: KinematicProbe, deltaTime: number) {
        if (probe.type === 'MOUSE' && !probe.isWoundUp) return;

        // 1. Calculate prospective next tile
        const nextX = Math.round(probe.coords.x + probe.velocity.dx);
        const nextZ = Math.round(probe.coords.z + probe.velocity.dz);

        // 2. Perform Collision Check (Abstracted)
        // In the real system, this queries the SpatialSovereigntyLimb
        const collision = this.checkCollision(nextX, nextZ, probe.coords.plane);

        if (collision) {
            this.handleCollision(probe, collision.objectId);
        } else {
            probe.coords.x = nextX;
            probe.coords.z = nextZ;
        }
    }

    private handleCollision(probe: KinematicProbe, objectId: number) {
        console.log(`Probe ${probe.id}: Bumper hit on Object ${objectId}`);
        
        if (this.interactionLimb) {
            this.interactionLimb.notifyBump(probe.id, objectId);
        }

        // Check for Transversal (Ladders/Caves)
        if (isTransversal(objectId)) {
            this.performTransversal(probe, objectId);
        }
    }

    private performTransversal(probe: KinematicProbe, objectId: number) {
        const interaction = getInteractionResult(objectId);
        if (!interaction) return;

        console.log(`Probe ${probe.id}: Transversal triggered (${interaction.type})`);

        if (interaction.type === 'LADDER') {
            if (interaction.action.includes('up')) probe.coords.plane++;
            if (interaction.action.includes('down')) probe.coords.plane--;
            console.log(`Probe ${probe.id}: Plane shifted to ${probe.coords.plane}`);
        } else if (interaction.type === 'CAVE' || interaction.type === 'PORTAL') {
            // Teleport logic (Forensic link)
            console.log(`Probe ${probe.id}: Entering Portal/Cave logic...`);
        }
    }

    /**
     * Authentic collision check against the 10/10 spatial heatmap.
     */
    private checkCollision(x: number, z: number, plane: number): { objectId: number } | null {
        if (!this.collisionMap || !this.collisionMap.tiles) return null;

        // Search for a matching wall tile in the sparse array
        const tile = this.collisionMap.tiles.find((t: any) => 
            t.x === x && t.z === z && t.plane === plane && (t.collision & 128)
        );

        if (tile) {
            return { objectId: tile.objectId || 99999 }; // Fallback to unknown bumper ID
        }

        return null;
    }

    public spawnProbe(id: number, type: 'MOUSE' | 'PLATYPUS', coords: { x: number, z: number, plane: number }) {
        this.probes.set(id, {
            id,
            type,
            coords,
            velocity: { dx: 1, dz: 0 },
            isWoundUp: true
        });
    }
}
