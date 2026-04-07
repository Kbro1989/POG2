import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from "../../utils/logger.js";
import { getSovereignRoot, resolveLogicFragment } from '../../utils/SovereignPathResolver.js';
import { VarbitSovereigntyLimb } from './VarbitSovereigntyLimb.js';
import { Result, ok, err, GameState, Direction, Coord, DirectionalCollision } from '../../core/models.js';
import { MechanicalSovereigntyLimb } from '../technical/MechanicalSovereigntyLimb.js';
import { DirectionalPathfinder } from './DirectionalPathfinder.js';
import { GeometryAnnotationLayer } from './GeometryAnnotationLayer.js';

// const logger = createLogger('SpatialSovereigntyLimb');
const logger = {
    info: (...args: any[]) => console.log('[INFO]', ...args),
    warn: (...args: any[]) => console.log('[WARN]', ...args),
    error: (...args: any[]) => console.log('[ERROR]', ...args)
};

export interface CollisionMatrix {
    [key: string]: number | DirectionalCollision; // "plane_x_y" -> bitmask OR directional object
}

// Spatial Authority Constants (Authoritative RS3/NXT Standard)
export const FLAG_BLOCKED   = 0x1;
export const FLAG_OVERLAY   = 0x2;   // Raised floor/Bridge participation
export const FLAG_ROOF      = 0x4;   // Visibility only
export const FLAG_FORCEDRAW = 0x8;
export const FLAG_WATER     = 0x80;  // NXT Water bit

export interface SurfaceLayer {
    type: 'terrain' | 'water' | 'object' | 'bridge';
    z: number;
    walkable: boolean;
    blocks: boolean;
    plane: number;
    metadata?: Record<string, any>;
}

export interface SurfaceStack {
    layers: SurfaceLayer[];
    highestWalkableZ: number;
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
    private static instance: SpatialSovereigntyLimb | undefined;
    private readonly atlasDir: string;
    private loadedMatrices: Map<string, SpatialLogicArtifact> = new Map();
    private loadedMapsquares: Map<string, { flags: Uint16Array, heights: Int16Array }> = new Map();
    private gal: GeometryAnnotationLayer;

    public static getInstance(): SpatialSovereigntyLimb {
        if (!this.instance) {
            this.instance = new SpatialSovereigntyLimb();
        }
        return this.instance;
    }

    public static resetInstance(): void {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('resetInstance is forbidden in production');
        }
        this.instance = undefined;
    }

    private constructor() {
        if (SpatialSovereigntyLimb.instance) {
            throw new Error('Singleton violation: use SpatialSovereigntyLimb.getInstance()');
        }
        this.atlasDir = path.join(getSovereignRoot(), 'atlas', 'spatial');
        this.gal = new GeometryAnnotationLayer();
    }

    /**
     * getGAL - Expose the annotation layer for external tools (renderer overlay, etc.)
     */
    public getGAL(): GeometryAnnotationLayer {
        return this.gal;
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
     * Aligned with Phase 44: Sovereign Path Authority resolution.
     */
    public async loadLogic(name: string): Promise<Result<void>> {
        // Resolve path via Sovereign Authority (Priority: D:\atlas\spatial -> D:\atlas\logic)
        const fullPath = resolveLogicFragment(name);
        
        if (!fullPath || !fs.existsSync(fullPath)) {
            // Fallback to internal name resolution if authority fails
            let filename = name.endsWith('.json') ? name : `${name}_logic.json`;
            const fallbackPath = path.join(this.atlasDir, filename);
            if (!fs.existsSync(fallbackPath)) {
                return err(new Error(`Spatial Authority: fragment '${name}' not resolved.`));
            }
            return this.performLoad(fallbackPath);
        }

        return this.performLoad(fullPath);
    }

    private performLoad(fullPath: string): Result<void> {
        try {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as SpatialLogicArtifact;
            this.loadedMatrices.set(data.city.toLowerCase(), data);
            
            // Log once per successful ingestion
            logger.info({ city: data.city, path: fullPath }, 'Ingested Sovereignty Artifact.');
            return ok(undefined);
        } catch (error) {
            return err(error as Error);
        }
    }

    /**
     * loadMapsquare - Ingests a raw mapsquare fragment (ms_X_Z.json) from world_extract.
     * Implements "Composite Bitwise Ingestion Merge" (Phase 41).
     */
    public async loadMapsquare(x: number, z: number): Promise<Result<void>> {
        const key = `${x}_${z}`;
        if (this.loadedMapsquares.has(key)) return ok(undefined);

        const worldExtractDir = path.join(this.atlasDir, 'world_extract');
        const fullPath = path.join(worldExtractDir, `ms_${x}_${z}.json`);

        if (!fs.existsSync(fullPath)) {
            return err(new Error(`Mapsquare fragment not found: ${fullPath}`));
        }

        try {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            
            // --- Composite Ingestion Merge (Phase 41) ---
            const flags = new Uint16Array(4 * 64 * 64);
            const heights = new Int16Array(4 * 64 * 64);

            if (data.tiles) {
                for (const tile of data.tiles) {
                    const tx = tile.x;
                    const tz = tile.z;
                    const plane = tile.plane;
                    if (tile.x < 0 || tile.x > 63 || tile.z < 0 || tile.z > 63 || plane < 0 || plane > 3) continue;

                    const index = (plane << 12) | (tx << 6) | tz;
                    
                    // Bitwise OR Merge (collision fragments)
                    flags[index] |= (tile.collision || 0);
                    
                    // Max Height Merge (Z-Inheritance Truth)
                    if (tile.height !== null && tile.height !== undefined) {
                        heights[index] = Math.max(heights[index], tile.height);
                    }
                }
            }

            this.loadedMapsquares.set(key, { flags, heights });
            logger.info({ x, z }, 'Ingested Authoritative Mapsquare Fragment (v41 Merged).');
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
     * resolveSurfaceStack - Volumetric Resolution of a coordinate.
     * Maps RSC cache fragments to a single authoritative surface per plane.
     * Implements "Safe Hybrid Z" (Phase 41 logic - Option C).
     */
    public resolveSurfaceStack(x: number, y: number): SurfaceStack {
        const msX = x >> 6;
        const msZ = y >> 6;
        const msKey = `${msX}_${msZ}`;
        const ms = this.loadedMapsquares.get(msKey);

        const stack: SurfaceStack = {
            layers: [],
            highestWalkableZ: 0
        };

        if (!ms) return stack;

        const tx = x & 0x3F;
        const tz = y & 0x3F;

        // RSC Pattern: 4 authoritative planes (0-3)
        for (let plane = 0; plane < 4; plane++) {
            const index = (plane << 12) | (tx << 6) | tz;
            const flag = ms.flags[index];
            const terrainHeight = ms.heights[index];
            
            // Absolute Priority Resolver (Overlay > Water > Terrain)
            const isOverlay = (flag & FLAG_OVERLAY) !== 0;  // 0x2
            const isWater   = (flag & FLAG_WATER) !== 0;    // 0x80
            const isBlocked = (flag & FLAG_BLOCKED) !== 0;  // 0x1

            // --- Phase 41: Safe Hybrid Z (Option C) ---
            // deterministic overlay height sourcing
            let baseZ = terrainHeight * 32;
            let z = baseZ;

            let type: 'terrain' | 'water' | 'bridge' = 'terrain';
            let walkable = !isBlocked;

            // Priority Logic (The Absolute Truth)
            if (isOverlay) {
                type = 'bridge';
                walkable = true; // Overlay ALWAYS replaces base collision
                // Bridge Z is authoritative from the cache heightmap
                z = baseZ; 
            } else if (isWater) {
                type = 'water';
                walkable = false; 
                // Option C Epsilon: max(terrainZ, waterZ + 0.1)
                z = baseZ + 0.1;
            } else {
                // Standard Terrain
                z = baseZ;
            }

            stack.layers.push({
                type,
                z,
                walkable,
                blocks: !walkable,
                plane
            });

            if (walkable && z > stack.highestWalkableZ) {
                stack.highestWalkableZ = z;
            }
        }

        return stack;
    }


    /**
     * isWalkable - Unified Navigation Arbiter (Phase 41)
     * Checks authority layers in order:
     * 1. GAL (Geometry Annotation Layer - Human Override)
     * 2. Matrix (Sovereign Logic Artifacts)
     * 3. Surface Stack (Volumetric Cache Substrate)
     */
    public isWalkable(plane: number, x: number, y: number, direction?: Direction | string): boolean {
        // --- LAYER 0: Geometry Annotation Layer (Sovereign Instruction) ---
        const galResult = this.gal.isNavigable(x, y, plane);
        if (galResult !== null) return galResult;

        // --- LAYER 1: Logic Matrix (Decoded Artifacts) ---
        const matrix = this.findMatrixForCoords(x, y);
        if (matrix) {
            const key = `${plane}_${x}_${y}`;
            const collision = matrix.collision_matrix[key];
            if (collision !== undefined) {
                if (typeof collision === 'number') return (collision & 0x1) === 0;
            }
        }

        // --- LAYER 2: Surface Stack (Absolute Deterministic Resolution) ---
        const surfaces = this.resolveSurfaceStack(x, y);
        const planeSurface = surfaces.layers.find(l => l.plane === plane);
        
        return planeSurface ? planeSurface.walkable : false;
    }

    /**
     * resolveEntitySurface - Plane-Constrained Z-Resolution.
     * Primary rule: Plane selects the layer -> Z resolves within that layer.
     */
    public resolveEntitySurface(x: number, y: number, plane: number): number {
        const stack = this.resolveSurfaceStack(x, y);
        const planeLayer = stack.layers.find(l => l.plane === plane && l.walkable);
        
        if (planeLayer) return planeLayer.z;
        return stack.highestWalkableZ; // Fallback to highest available surface
    }

    /**
     * getAltitude - Forensic Altitude Retrieval (Heightmap Grounding)
     * Utilizes Plane-Constrained Z-Resolution to prevent clipping and roof-climbing.
     */
    public getAltitude(plane: number, x: number, y: number): number {
        const msX = x >> 6;
        const msZ = y >> 6;
        const ms = this.loadedMapsquares.get(`${msX}_${msZ}`);
        if (!ms) return 0;

        const tx = x & 0x3F;
        const tz = y & 0x3F;
        const index = (plane << 12) | (tx << 6) | tz;
        
        return ms.heights[index] * 32;
    }

    /**
     * ensureMapsquare - Pre-fetches a mapsquare fragment if not loaded.
     * Essential for A* pathfinding blocks where we need O(1) sync access.
     */
    public async ensureMapsquare(x: number, y: number): Promise<void> {
        const msX = x >> 6;
        const msZ = y >> 6;
        await this.loadMapsquare(msX, msZ);
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
                return false; // Blocked by dynamic entity
            }
        }

        // 4. Check for dynamic Objects (Locked doors, etc.)
        const index = y * 64 + x; // RS mapsquares are 64x64
        const objectsOnTile = context.objectMap.get(index); 
        if (objectsOnTile) {
            const varbitLimb = VarbitSovereigntyLimb.getInstance();
            // Since we're in a sync loop, we might need to handle this differently
            // but for now we'll assume we can resolve the definition.
            // Note: resolveCurrentObjectId is async. 
            // This suggests isWalkableContextual might need to be async or we pre-resolve.
            
            // For now, if it's a known object, we resolve its state.
            // (In a real game engine, this is pre-calculated per tick).
        }

        return true;
    }

    /**
     * getLogicAt - Returns the raw collision data at a coordinate.
     */
    public getLogicAt(plane: number, x: number, y: number): number | DirectionalCollision {
        const matrix = this.findMatrixForCoords(x, y);
        if (matrix) {
            const key = `${plane}_${x}_${y}`;
            return matrix.collision_matrix[key] || 0;
        }

        const msX = x >> 6;
        const msZ = y >> 6;
        const ms = this.loadedMapsquares.get(`${msX}_${msZ}`);
        if (ms) {
            const tx = x & 0x3F;
            const tz = y & 0x3F;
            const index = (plane << 12) | (tx << 6) | tz;
            const tile = ms.flags[index];
            return tile || 0;
        }

        return -1;
    }

    /**
     * getLegacyMask - Returns strictly the numeric bitmask (for backward compat).
     */
    public getLegacyMask(plane: number, x: number, y: number): number {
        const raw = this.getLogicAt(plane, x, y);
        if (typeof raw === 'number') return raw;
        let mask = 0;
        if (!raw.north || !raw.south || !raw.east || !raw.west) mask |= 0x100;
        return mask;
    }

    /**
     * auditTile - POG2 Autonomous Spatial Audit.
     * Aligned with Phase 41 refined bitmasks.
     */
    public auditTile(plane: number, x: number, y: number): {
        coord: Coord;
        walkable: boolean;
        collisionType: 'legacy_bitmask' | 'directional' | 'unmapped' | 'mapsquare_fragment';
        raw: any;
        directional?: { north: boolean; south: boolean; east: boolean; west: boolean };
        npcOnlyBlocks?: Direction[];
        region?: string;
        ms?: string;
        stack?: SurfaceStack;
    } {
        const coord: Coord = { x, y, plane };
        const matrix = this.findMatrixForCoords(x, y);

        if (matrix) {
            const key = `${plane}_${x}_${y}`;
            const raw = matrix.collision_matrix[key];
            if (!raw) return { coord, walkable: true, collisionType: 'legacy_bitmask', raw: 0, region: matrix.city };

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

            const blocked = (raw & 0x100) !== 0 || (raw & 0x200000) !== 0;
            return { coord, walkable: !blocked, collisionType: 'legacy_bitmask', raw, region: matrix.city };
        }

        // Mapsquare Fragment Audit (Volumetric Truth)
        const stack = this.resolveSurfaceStack(x, y);
        const walkable = this.isWalkable(plane, x, y);
        const msX = x >> 6;
        const msZ = y >> 6;
        
        return {
            coord,
            walkable,
            collisionType: 'mapsquare_fragment',
            raw: stack, 
            ms: `${msX}_${msZ}`,
            stack
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
