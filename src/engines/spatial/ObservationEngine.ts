import { Result, ok, err, Coord, DirectionalCollision } from '../../core/models.js';
import { WorldForensicsLimb, WorldObservation } from '../../limbs/spatial/WorldForensicsLimb.js';
import { SovereignGrounding } from '../../utils/SovereignGrounding.js';
import { createLogger } from '../../utils/logger.js';
import { getBlockedDirections } from '../../utils/DirectionalRegistry.js';

const logger = createLogger('ObservationEngine');

export interface ObservationReport {
    center: Coord;
    regionName: string;
    archetype: string;
    grid: ObservationTile[][];
    discrepancies: string[];
}

export interface ObservationTile {
    x: number;
    z: number;
    walkable: boolean;
    hasObject: boolean;
    isDiscrepancy: boolean;
    label: string;
    directional?: DirectionalCollision;
}

/**
 * ObservationEngine - The "Brain" (CNS) for world awareness.
 * 
 * Responsibilities:
 * 1. Orchestrate sensing via WorldForensicsLimb.
 * 2. Compare live cache mappings against pedagogical knowledge.
 * 3. Generate high-level observation reports for the renderer.
 */
export class ObservationEngine {
    private limb: WorldForensicsLimb;
    private grounding: SovereignGrounding | null = null;

    constructor() {
        this.limb = WorldForensicsLimb.getInstance();
    }

    public async initialize(): Promise<Result<void>> {
        const limbRes = await this.limb.initialize();
        if (!limbRes.ok) return limbRes;

        this.grounding = await SovereignGrounding.loadDefault();
        return ok(undefined);
    }

    /**
     * observe - Performs a spatial-weighted observation around a coordinate.
     */
    public async observe(
        x: number, 
        z: number, 
        plane: number, 
        radius: number = 5, 
        directionality: boolean = false
    ): Promise<Result<ObservationReport>> {
        if (!this.grounding) return err(new Error('Engine not initialized'));

        const minMX = (x - radius) >> 6;
        const maxMX = (x + radius) >> 6;
        const minMZ = (z - radius) >> 6;
        const maxMZ = (z + radius) >> 6;

        const observations: WorldObservation[] = [];
        for (let mx = minMX; mx <= maxMX; mx++) {
            for (let mz = minMZ; mz <= maxMZ; mz++) {
                const senseRes = await this.limb.senseLocalArea(mx << 6, mz << 6, plane);
                if (senseRes.ok) {
                    observations.push(...senseRes.value);
                }
            }
        }

        const metadata = this.grounding.getRegionMetadata(x, z, plane);
        
        const report: ObservationReport = {
            center: { x, y: z, plane },
            regionName: metadata.name,
            archetype: metadata.archetype,
            grid: [],
            discrepancies: []
        };

        // Convert the 1D observation list to a 2D local grid
        const size = (radius * 2) + 1;
        for (let i = 0; i < size; i++) {
            report.grid[i] = [];
            for (let j = 0; j < size; j++) {
                const curX = x - radius + j;
                const curZ = z + radius - i; // Top-down coordinate system

                const obs = observations.find(o => o.x === curX && o.z === curZ);
                const isWalkable = obs ? (obs.collision === 0 || obs.collision === 2) : false;
                
                let directional: DirectionalCollision | undefined = undefined;
                if (directionality) {
                    const maskRes = await this.limb.buildDirectionalMask(curX, curZ, plane);
                    if (maskRes.ok) directional = maskRes.value;
                }

                const isDiscrepancy = !obs;

                report.grid[i][j] = {
                    x: curX,
                    z: curZ,
                    walkable: isWalkable,
                    hasObject: obs ? obs.objects.length > 0 : false,
                    isDiscrepancy: isDiscrepancy,
                    label: this.getTileLabel(curX, curZ, x, z, isWalkable, !!obs, directional),
                    directional
                };
            }
        }

        return ok(report);
    }

    private getTileLabel(
        x: number, 
        z: number, 
        startX: number, 
        startZ: number, 
        walkable: boolean, 
        exists: boolean, 
        directional?: DirectionalCollision
    ): string {
        if (x === startX && z === startZ) return 'P'; // Player
        if (!exists) return '?';

        if (directional) {
            if (!directional.north && !directional.east && !directional.south && !directional.west) return 'X'; // Full block
            
            // Render priority for directional arrows
            // If only one direction is blocked, show that arrow as "Warning: wall here"
            if (!directional.north) return '^';
            if (!directional.south) return 'v';
            if (!directional.east) return '>';
            if (!directional.west) return '<';
        }

        return walkable ? '.' : 'X';
    }

    public close(): void {
        this.limb.close();
    }
}
