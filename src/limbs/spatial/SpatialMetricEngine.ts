import { createLogger } from '../../utils/logger.js';
import { SpatialSovereigntyLimb } from './SpatialSovereigntyLimb.js';

const logger = createLogger('SpatialMetricEngine');

// ── Collision Mode ──────────────────────────────────────────────────────────
/**
 * RADIAL_LEGACY  — Pre-2026 Refresh: Euclidean distance for movement & attack.
 * AABB_TILE_ALIGNED — Post-Refresh: Square footprint per NPC/player indicator change.
 */
export type CollisionMode = 'RADIAL_LEGACY' | 'AABB_TILE_ALIGNED';

// ── Entity Footprint ────────────────────────────────────────────────────────
/** Tile-aligned axis-aligned bounding box (minX/maxX inclusive tile indices). */
export interface AABB {
    minX: number;
    maxX: number;
    minZ: number; // Z == Y in RS tile space
    maxZ: number;
    plane: number;
}

export interface MetricProfile {
    polyCount: number;
    vertexCount: number;
    aabb: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number };
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
    volume: number;
    vertexDensity: number;
}

interface ModelData { meshes: any[]; bonecount?: number; miny?: number; maxy?: number; }

// ── Minimal entity interface needed by this engine ──────────────────────────
export interface SpatialEntity {
    x: number;
    y: number;   // RS tile Y (treated as Z axis in 3D)
    plane: number;
    /** Tile width derived from cache model or NPC size field. Default 1. */
    tileWidth?: number;
    /** Tile depth derived from cache model or NPC size field. Default 1. */
    tileDepth?: number;
    /** Body type — drives dynamic tile footprint for player avatars. */
    bodyType?: 'SLIM' | 'ATHLETIC' | 'CHUNKY';
    /** Optional radius for RADIAL_LEGACY fallback. */
    radius?: number;
}

// ── Follower Configuration ──────────────────────────────────────────────────
export type FollowerType = 'PET' | 'FAMILIAR' | 'NPC_ESCORT' | 'RANDOM_EVENT';
export type BeyondMaxBehavior = 'FREEZE' | 'DESPAWN' | 'RETURN_TO_OWNER' | 'TELEPORT_TO_LODESTONE';

export interface FollowerConfig {
    type: FollowerType;
    /** Minimum Chebyshev distance to trigger catch-up teleport. Default: 20. */
    catchUpMin: number;
    /** Maximum Chebyshev distance before beyondMaxBehavior fires. Default: 30. */
    catchUpMax: number;
    beyondMaxBehavior: BeyondMaxBehavior;
}

/** Tile coordinate returned by snapFollowerToPlayer spiral search. */
export interface SnapResult {
    tile: { x: number; y: number; plane: number };
    behavior: 'PATHFIND' | 'SNAP' | BeyondMaxBehavior;
}

// ── Body type → tile footprint map ─────────────────────────────────────────
// Cache model geometry (from kit_ analysis):
//   SLIM     → 1×1 tile  (~256 cache units wide)
//   ATHLETIC → 1×1 tile  (~384 cache units wide)
//   CHUNKY   → 2×2 tiles (~512 cache units wide, verified from kit_37641)
const BODY_TYPE_TILE_SIZE: Record<string, number> = {
    SLIM: 1,
    ATHLETIC: 1,
    CHUNKY: 2,
};

/**
 * SpatialMetricEngine — Post-Refresh RS3 Physics Resolver.
 *
 * Responsibilities:
 *  1. AABB entity footprint resolution from 3D cache geometry.
 *  2. Collision mode–aware movement, attack range, and overlap checks.
 *  3. Decoupled compass orientation (plane-agnostic atan2).
 *  4. Follower catch-up snap (20–30 tile pop) with configurable beyond-max behavior.
 *
 * Layering:
 *  Composes on top of SpatialSovereigntyLimb.isWalkable() for per-tile checks.
 *  Does NOT replace SovereignCollisionEngine (9-way adjacency); that feeds
 *  into the DirectionalPathfinder. This engine operates at the entity level.
 */
export class SpatialMetricEngine {
    private static instance: SpatialMetricEngine;
    private mode: CollisionMode;

    private constructor(mode: CollisionMode = 'AABB_TILE_ALIGNED') {
        this.mode = mode;
        logger.info({ mode }, '[SpatialMetricEngine] Physics resolver armed.');
    }

    public static getInstance(mode: CollisionMode = 'AABB_TILE_ALIGNED'): SpatialMetricEngine {
        if (!SpatialMetricEngine.instance) {
            SpatialMetricEngine.instance = new SpatialMetricEngine(mode);
        }
        return SpatialMetricEngine.instance;
    }

    public getMode(): CollisionMode {
        return this.mode;
    }

    public setMode(mode: CollisionMode): void {
        logger.info({ mode }, '[SpatialMetricEngine] Collision mode switched.');
        this.mode = mode;
    }

    // ── 0. Geometric Profiling (Legacy Support) ─────────────────────────────
    public static calculateProfile(model: ModelData): MetricProfile {
        let polyCount = 0;
        let vertexCount = 0;

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        for (const mesh of model.meshes) {
            if (mesh.indices) polyCount += mesh.indices.count / 3;
            const pos = mesh.attributes.pos;
            if (pos) {
                vertexCount += pos.count;
                for (let i = 0; i < pos.count; i++) {
                    const x = pos.getX(i);
                    const y = pos.getY(i);
                    const z = pos.getZ(i);

                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    if (z < minZ) minZ = z;
                    if (z > maxZ) maxZ = z;
                }
            }
        }

        if (minX === Infinity) minX = maxX = minY = maxY = minZ = maxZ = 0;

        const width = maxX - minX;
        const height = maxY - minY;
        const depth = maxZ - minZ;
        const volume = width * height * depth;
        const vertexDensity = volume > 0 ? vertexCount / volume : 0;

        return {
            polyCount: Math.round(polyCount),
            vertexCount,
            aabb: { minX, maxX, minY, maxY, minZ, maxZ },
            dimensions: { width, height, depth },
            volume,
            vertexDensity
        };
    }

    // ── 1. Entity Footprint ────────────────────────────────────────────────

    /**
     * getBounds — Dynamic AABB from entity metadata.
     *
     * Priority for tile size:
     *   1. Explicit `tileWidth` / `tileDepth` from NPC definition (size field).
     *   2. Player `bodyType` → cache model geometry mapping.
     *   3. Default 1×1.
     */
    public getBounds(entity: SpatialEntity): AABB {
        let width = 1;
        let depth = 1;

        if (entity.tileWidth !== undefined && entity.tileWidth > 0) {
            width = entity.tileWidth;
        } else if (entity.bodyType && BODY_TYPE_TILE_SIZE[entity.bodyType] !== undefined) {
            width = BODY_TYPE_TILE_SIZE[entity.bodyType];
        }

        if (entity.tileDepth !== undefined && entity.tileDepth > 0) {
            depth = entity.tileDepth;
        } else if (entity.bodyType && BODY_TYPE_TILE_SIZE[entity.bodyType] !== undefined) {
            depth = BODY_TYPE_TILE_SIZE[entity.bodyType];
        }

        return this.tileToAABB(entity.x, entity.y, entity.plane, width, depth);
    }

    private tileToAABB(x: number, y: number, plane: number, width: number, depth: number): AABB {
        return {
            minX: x - Math.floor(width / 2),
            maxX: x + Math.ceil(width / 2) - 1,
            minZ: y - Math.floor(depth / 2),
            maxZ: y + Math.ceil(depth / 2) - 1,
            plane,
        };
    }

    // ── 2. Orientation (Compass) ───────────────────────────────────────────

    /**
     * getOrientation — Pure atan2 bearing from source to target.
     *
     * Deliberately plane-agnostic and range-unlimited, modeling the observed
     * live-client "compass" / notepad bug behavior: the client always faces
     * the target regardless of plane separation or distance.
     *
     * Returns radians in (-π, π]. 0 = East, π/2 = North (RS Y+).
     */
    public getOrientation(source: SpatialEntity, target: SpatialEntity): number {
        return Math.atan2(target.y - source.y, target.x - source.x);
    }

    // ── 3. Movement ────────────────────────────────────────────────────────

    /**
     * canMoveTo — Tile-level movement arbiter.
     *
     * Checks (in order):
     *  1. Plane match (cross-plane movement requires a portal transition).
     *  2. Destination tile walkability via SpatialSovereigntyLimb (3-layer authority).
     *  3. AABB overlap: the full entity footprint must fit in walkable tiles.
     *
     * In RADIAL_LEGACY mode the footprint check is skipped (1×1 only).
     */
    public canMoveTo(
        entity: SpatialEntity,
        dest: { x: number; y: number; plane: number },
        direction?: string
    ): boolean {
        const spatial = SpatialSovereigntyLimb.getInstance();

        // Rule 1: Plane must match (portals are explicit movement events)
        if (entity.plane !== dest.plane) return false;

        // Rule 2: Primary tile walkability
        if (!spatial.isWalkable(dest.plane, dest.x, dest.y, direction)) return false;

        // Rule 3: AABB footprint — all tiles covered by the entity must be walkable
        if (this.mode === 'AABB_TILE_ALIGNED') {
            const bounds = this.tileToAABB(
                dest.x,
                dest.y,
                dest.plane,
                entity.tileWidth ?? (entity.bodyType ? BODY_TYPE_TILE_SIZE[entity.bodyType] ?? 1 : 1),
                entity.tileDepth ?? (entity.bodyType ? BODY_TYPE_TILE_SIZE[entity.bodyType] ?? 1 : 1)
            );

            for (let tx = bounds.minX; tx <= bounds.maxX; tx++) {
                for (let tz = bounds.minZ; tz <= bounds.maxZ; tz++) {
                    if (!spatial.isWalkable(dest.plane, tx, tz, direction)) return false;
                }
            }
        }

        return true;
    }

    // ── 4. Attack Range ────────────────────────────────────────────────────

    /**
     * inAttackRange — Combat distance arbiter.
     *
     * AABB_TILE_ALIGNED: Chebyshev distance (= square "radius", matching the
     *   new square selection indicator observed in-game post-2026 Refresh).
     * RADIAL_LEGACY: Euclidean distance (pre-Refresh circular hitbox).
     *
     * Cross-plane attacks are never possible (returns false).
     */
    public inAttackRange(
        attacker: SpatialEntity,
        target: SpatialEntity,
        range: number
    ): boolean {
        if (attacker.plane !== target.plane) return false;

        if (this.mode === 'AABB_TILE_ALIGNED') {
            // Chebyshev: max(|dx|, |dy|) — a square of `range` tiles
            const dx = Math.abs(attacker.x - target.x);
            const dy = Math.abs(attacker.y - target.y);
            return Math.max(dx, dy) <= range;
        }

        // Euclidean fallback
        const dx = attacker.x - target.x;
        const dy = attacker.y - target.y;
        const radiusA = attacker.radius ?? 0.5;
        const radiusB = target.radius ?? 0.5;
        return Math.sqrt(dx * dx + dy * dy) < (range + radiusA + radiusB);
    }

    // ── 5. AABB Overlap ────────────────────────────────────────────────────

    /**
     * aabbOverlap — Checks whether two entity footprints intersect.
     * Used for position-based collision (e.g., heatmap hit detection).
     */
    public aabbOverlap(a: AABB, b: AABB): boolean {
        if (a.plane !== b.plane) return false;
        return (
            a.minX <= b.maxX && a.maxX >= b.minX &&
            a.minZ <= b.maxZ && a.maxZ >= b.minZ
        );
    }

    // ── 6. Follower Catch-Up Snap ──────────────────────────────────────────

    /**
     * chebyshevDistance — Grid distance metric (same as post-Refresh attack range).
     */
    public chebyshevDistance(a: SpatialEntity, b: SpatialEntity): number {
        return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
    }

    /**
     * snapFollowerToPlayer — Models the NPC/pet catch-up teleport mechanic.
     *
     * Observationally confirmed thresholds (live client, 20+ years play):
     *   <  catchUpMin tiles → Normal pathfinding, return null.
     *   <= catchUpMax tiles → Spiral outward from player, find nearest valid tile.
     *   >  catchUpMax tiles → beyondMaxBehavior fires (configurable per type).
     *
     * The spiral search respects:
     *   - Same plane as player (cross-plane snaps never occur).
     *   - SpatialSovereigntyLimb.isWalkable (3-layer authority: GAL → Matrix → Surface).
     *   - N/S/E/W directional wall validation via isWalkable `direction` param.
     *
     * Returns a SnapResult describing what the engine should do.
     */
    public snapFollowerToPlayer(
        follower: SpatialEntity,
        player: SpatialEntity,
        config: FollowerConfig
    ): SnapResult | null {
        const dist = this.chebyshevDistance(follower, player);

        // Zone 1: Normal follow — defer to pathfinding
        if (dist < config.catchUpMin) {
            return { tile: { x: follower.x, y: follower.y, plane: follower.plane }, behavior: 'PATHFIND' };
        }

        // Zone 2: Catch-up teleport — spiral search near player
        if (dist <= config.catchUpMax) {
            const target = this.findNearestValidTile(player, 2);
            if (target) {
                logger.info(
                    { followerType: config.type, dist, target },
                    '[SpatialMetricEngine] Follower catch-up snap resolved.'
                );
                return { tile: target, behavior: 'SNAP' };
            }
            // No valid tile found within offset — fall through to beyondMaxBehavior
            logger.warn({ config, dist }, '[SpatialMetricEngine] Spiral search found no valid tile — escalating to beyondMaxBehavior.');
        }

        // Zone 3: Beyond max — behavior depends on follower type
        logger.warn(
            { followerType: config.type, dist, behavior: config.beyondMaxBehavior },
            '[SpatialMetricEngine] Follower beyond catch-up range.'
        );
        return { tile: { x: follower.x, y: follower.y, plane: follower.plane }, behavior: config.beyondMaxBehavior };
    }

    /**
     * findNearestValidTile — Spiral outward from center to find the nearest
     * walkable tile on the same plane within maxOffset tiles.
     *
     * Validates four cardinal directional walls to avoid snapping through edges.
     */
    private findNearestValidTile(
        center: SpatialEntity,
        maxOffset: number
    ): { x: number; y: number; plane: number } | null {
        const spatial = SpatialSovereigntyLimb.getInstance();

        for (let r = 1; r <= maxOffset; r++) {
            for (let dx = -r; dx <= r; dx++) {
                for (let dz = -r; dz <= r; dz++) {
                    // Only check ring border (skip interior — already checked at smaller r)
                    if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;

                    const cx = center.x + dx;
                    const cz = center.y + dz;

                    // Must match player's plane
                    if (!spatial.isWalkable(center.plane, cx, cz)) continue;

                    // Directional wall check: ensure approach from center is not wall-blocked
                    const dir = this.approachDirection(dx, dz);
                    if (dir && !spatial.isWalkable(center.plane, cx, cz, dir)) continue;

                    return { x: cx, y: cz, plane: center.plane };
                }
            }
        }
        return null;
    }

    /**
     * approachDirection — Returns the cardinal direction of approach from the
     * given delta so we can validate the N/S/E/W edge of the destination tile.
     */
    private approachDirection(dx: number, dz: number): string | null {
        if (dx === 0 && dz > 0) return 'north';
        if (dx === 0 && dz < 0) return 'south';
        if (dx > 0 && dz === 0) return 'east';
        if (dx < 0 && dz === 0) return 'west';
        return null; // Diagonal — no single directional wall applies
    }

    // ── 7. Health Check ────────────────────────────────────────────────────

    public healthCheck(): { online: boolean; details: string; mode: CollisionMode } {
        return {
            online: true,
            mode: this.mode,
            details: `SpatialMetricEngine operational. Mode: ${this.mode}.`,
        };
    }
}

// ── Default Follower Configs ────────────────────────────────────────────────
/** Canonical FollowerConfig presets per type, based on live client observation. */
export const FOLLOWER_CONFIGS: Record<FollowerType, FollowerConfig> = {
    PET: {
        type: 'PET',
        catchUpMin: 20,
        catchUpMax: 30,
        beyondMaxBehavior: 'RETURN_TO_OWNER',
    },
    FAMILIAR: {
        type: 'FAMILIAR',
        catchUpMin: 20,
        catchUpMax: 30,
        beyondMaxBehavior: 'DESPAWN',
    },
    NPC_ESCORT: {
        type: 'NPC_ESCORT',
        catchUpMin: 20,
        catchUpMax: 30,
        beyondMaxBehavior: 'FREEZE',
    },
    RANDOM_EVENT: {
        type: 'RANDOM_EVENT',
        catchUpMin: 15,
        catchUpMax: 25,
        beyondMaxBehavior: 'DESPAWN',
    },
};
