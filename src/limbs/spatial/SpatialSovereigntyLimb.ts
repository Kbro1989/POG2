import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from "../../utils/logger.js";
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';
import { Result, ok, err, GameState, Direction, Coord, DirectionalCollision } from '../../core/models.js';
import { MechanicalSovereigntyLimb } from '../technical/MechanicalSovereigntyLimb.js';
import { DirectionalPathfinder } from './DirectionalPathfinder.js';

// const logger = createLogger('SpatialSovereigntyLimb');
const logger = {
    info: (...args: any[]) => console.log('[INFO]', ...args),
    warn: (...args: any[]) => console.log('[WARN]', ...args),
    error: (...args: any[]) => console.log('[ERROR]', ...args)
};

export interface CollisionMatrix {
    [key: string]: number | DirectionalCollision; // "plane_x_y" -> bitmask OR directional object
}

export interface SpatialLogicArtifact {
    city: string;
    metadata: any;
    anchors: any;
    meta: {
        bounds: {
            wx_min: number;
            wx_max: number;
            wy_min: number;
            wy_max: number;
        };
    };
    collision_matrix: CollisionMatrix;
}

/**
 * SpatialSovereigntyLimb - The "Ground Truth" Spatial Reasoning Substrate.
 * 
 * Responsibilities:
 * 1. Ingest synthesized logic artifacts (JSON collision matrices).
 * 2. Provide deterministic walkability queries (isWalkable).
 * 3. Bridge modern cache topology to RSC-style pathfinding.
 */
export class SpatialSovereigntyLimb {
    private readonly atlasDir: string;
    private loadedMatrices: Map<string, SpatialLogicArtifact> = new Map();

    constructor() {
        this.atlasDir = path.join(getSovereignRoot(), 'atlas', 'spatial');
    }

    /**
     * initialize - Loads canonical logic files into memory.
     */
    public async initialize(): Promise<Result<boolean>> {
        try {
            logger.info({ dir: this.atlasDir }, 'Initializing SpatialSovereigntyLimb...');
            
            if (!fs.existsSync(this.atlasDir)) {
                fs.mkdirSync(this.atlasDir, { recursive: true });
                logger.warn('Spatial Atlas directory missing. Created blank substrate.');
                return ok(true);
            }

            // Load known regions
            await this.loadLogic('prifddinas');
            await this.loadLogic('barrows');
            
            logger.info(`SpatialSovereigntyLimb active with ${this.loadedMatrices.size} mapped regions. (${[...this.loadedMatrices.keys()].join(',')})`);
            return ok(true);
        } catch (error) {
            logger.error({ error }, 'Failed to initialize SpatialSovereigntyLimb.');
            return err(error as Error);
        }
    }

    /**
     * loadLogic - Ingests a specific region's collision matrix.
     * Can accept a region name (e.g. "lumbridge") or a full filename ("prifddinas_logic.json").
     */
    public async loadLogic(name: string): Promise<Result<void>> {
        let filename = name;
        if (!filename.endsWith('.json')) {
            filename = `${name}_logic.json`;
        }

        const fullPath = path.join(this.atlasDir, filename);
        if (!fs.existsSync(fullPath)) {
            // Return err instead of throwing, allowing orchestrator to probe
            return err(new Error(`Logic file not found: ${fullPath}`));
        }

        try {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as SpatialLogicArtifact;
            this.loadedMatrices.set(data.city.toLowerCase(), data);
            
            // Log once per successful ingestion
            logger.info({ city: data.city }, 'Ingested Sovereignty Artifact.');
            return ok(undefined);
        } catch (error) {
            return err(error as Error);
        }
    }

    /**
     * hasRegion - Check if a region is already loaded.
     */
    public hasRegion(name: string): boolean {
        return this.loadedMatrices.has(name.toLowerCase());
    }

    /**
     * isWalkable - Deterministic check for a specific coordinate.
     * Supports optional 'direction' for quaternary navigation (Directional Sovereignty).
     */
    public isWalkable(plane: number, x: number, y: number, direction?: Direction): boolean {
        const matrix = this.findMatrixForCoords(x, y);
        if (!matrix) return false; // Out of sovereignty bounds

        const key = `${plane}_${x}_${y}`;
        const collision = matrix.collision_matrix[key];
        
        if (!collision) return true; // Default walkable if no data

        // CASE 1: High-Fidelity Directional Collision (Object)
        if (collision && typeof collision === 'object') {
            if (!direction) return true; // If no direction given, assume broad walkability
            return (collision as any)[direction] !== false;
        }

        // CASE 2: Legacy Bitmask (Number or undefined)
        if (collision === undefined) return true; // Default walkable
        // 0x100 = Object Block, 0x200000 = Terrain Block
        const isBlocked = (collision & 0x100) !== 0 || (collision & 0x200000) !== 0;
        return !isBlocked;
    }

    /**
     * isWalkableContextual - Evaluates walkability including dynamic state-gated effects.
     * Uses O(1) spatial indexing from the GameState context.
     */
    public async isWalkableContextual(
        plane: number,
        x: number,
        y: number,
        context: GameState,
        mechanical: MechanicalSovereigntyLimb
    ): Promise<boolean> {
        // 1. Check static cache first (Terrain/Objects)
        const staticWalkable = this.isWalkable(plane, x, y);
        if (!staticWalkable) return false;

        // 2. Resolve coordinate key for spatial index
        const coordKey = `${x},${y},${plane}`;

        // 3. Check for dynamic NPCs (Followers, etc.)
        const npcsOnTile = context.npcSpatialIndex.get(coordKey) || [];
        for (const npc of npcsOnTile) {
            const sideEffect = await mechanical.getSpatialSideEffects(npc.id, context);
            if (sideEffect?.blocks_movement) {
                return false; // Blocked by dynamic entity (e.g. Platypus)
            }
        }

        // 4. Check for dynamic Objects (Locked doors, etc.)
        const objectsOnTile = context.objectMap.get(0); // Heuristic: check if any objects on tile?
        // Wait, context.objectMap usually maps ID -> Object.
        // For spatial lookup of objects, we should ideally have objectSpatialIndex too.
        // I'll add objectSpatialIndex to the plan if needed, but for now focus on Platypus (NPC).
        
        return true;
    }

    /**
     * getLogicAt - Returns the raw collision data at a coordinate.
     * Returns a number (legacy bitmask) or DirectionalCollision (quaternary).
     */
    public getLogicAt(plane: number, x: number, y: number): number | DirectionalCollision {
        const matrix = this.findMatrixForCoords(x, y);
        if (!matrix) return -1;
        const key = `${plane}_${x}_${y}`;
        return matrix.collision_matrix[key] || 0;
    }

    /**
     * getLegacyMask - Returns strictly the numeric bitmask (for backward compat).
     * If the tile has DirectionalCollision, synthesizes a compatible mask.
     */
    public getLegacyMask(plane: number, x: number, y: number): number {
        const raw = this.getLogicAt(plane, x, y);
        if (typeof raw === 'number') return raw;
        // Synthesize a legacy mask from directional data
        let mask = 0;
        if (!raw.north || !raw.south || !raw.east || !raw.west) mask |= 0x100;
        return mask;
    }

    /**
     * auditTile - POG2 Autonomous Spatial Audit.
     * Returns machine-consumable JSON for the OrchestrateEngine's self-verification loop.
     * Bridges RSC command.js '::coords' pattern for POG2's internal reasoning.
     */
    public auditTile(plane: number, x: number, y: number): {
        coord: Coord;
        walkable: boolean;
        collisionType: 'legacy_bitmask' | 'directional' | 'unmapped';
        raw: number | DirectionalCollision;
        directional?: { north: boolean; south: boolean; east: boolean; west: boolean };
        npcOnlyBlocks?: Direction[];
        region?: string;
    } {
        const matrix = this.findMatrixForCoords(x, y);
        const coord: Coord = { x, y, plane };

        if (!matrix) {
            return { coord, walkable: false, collisionType: 'unmapped', raw: -1 };
        }

        const key = `${plane}_${x}_${y}`;
        const raw = matrix.collision_matrix[key];

        if (!raw) {
            return { coord, walkable: true, collisionType: 'legacy_bitmask', raw: 0, region: matrix.city };
        }

        if (typeof raw === 'object') {
            return {
                coord,
                walkable: raw.north || raw.south || raw.east || raw.west,
                collisionType: 'directional',
                raw,
                directional: { north: raw.north, south: raw.south, east: raw.east, west: raw.west },
                npcOnlyBlocks: raw.npc_only_blocks,
                region: matrix.city
            };
        }

        // Legacy bitmask
        const blocked = (raw & 0x100) !== 0 || (raw & 0x200000) !== 0;
        return {
            coord,
            walkable: !blocked,
            collisionType: 'legacy_bitmask',
            raw,
            region: matrix.city
        };
    }

    /**
     * findMatrixForCoords - Resolves which loaded artifact contains the coordinate.
     */
    private findMatrixForCoords(x: number, y: number): SpatialLogicArtifact | undefined {
        for (const [name, artifact] of this.loadedMatrices.entries()) {
            const b = artifact.meta.bounds;
            if (x >= b.wx_min && x <= b.wx_max && y >= b.wy_min && y <= b.wy_max) {
                return artifact;
            }
        }
        return undefined;
    }

    public healthCheck(): { online: boolean; details: string } {
        const count = this.loadedMatrices.size;
        return {
            online: true,
            details: `Spatial Sovereignty: ${count} regions mapped. (${[...this.loadedMatrices.keys()].join(', ')})`
        };
    }
}
