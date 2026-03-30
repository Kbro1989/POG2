import { Coord } from '../../core/models.js';
import { SpatialSovereigntyLimb } from './SpatialSovereigntyLimb.js';
import { SpaceRegistry, SpaceMetadata } from '../../core/SpaceRegistry.js';
import { createLogger } from '../../utils/logger.js';
import * as fs from 'fs';
import * as path from 'path';
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';

const logger = createLogger('FragmentOrchestrator');

/**
 * FragmentOrchestrator - Phase C1: The "Logistics" of Regional Sovereignty.
 * 
 * Responsibilities:
 * 1. Monitor avatar position relative to mapsquare boundaries.
 * 2. Proactively load neighboring logic fragments from disk.
 * 3. Handle hysteresis to prevent redundant disk I/O on borders.
 */
export class FragmentOrchestrator {
    private spatial: SpatialSovereigntyLimb;
    private registry: SpaceRegistry;
    private loadedRegions: Set<string> = new Set();
    private atlasDir: string;
    
    // Hysteresis: Only check for new regions when moving significant distance
    private lastCheckCoord: Coord | null = null;
    private readonly checkThreshold = 8; // tiles

    constructor(spatial: SpatialSovereigntyLimb) {
        this.spatial = spatial;
        this.registry = SpaceRegistry.getInstance();
        this.atlasDir = path.join(getSovereignRoot(), 'atlas', 'spatial');
    }

    /**
     * update - Heartbeat for regional loading.
     * Checks if the 3x3 mapsquare view around the avatar is fully loaded.
     */
    public async update(avatar: Coord): Promise<void> {
        if (this.shouldSkipCheck(avatar)) return;

        const centerX = avatar.x >> 6;
        const centerY = avatar.y >> 6;

        const loadPromises: Promise<any>[] = [];

        // Scan 5x5 grid (radius 2) for missing logic - Phase E: World-Scale Reach
        for (let mx = centerX - 2; mx <= centerX + 2; mx++) {
            for (let my = centerY - 2; my <= centerY + 2; my++) {
                // 1. Resolve deterministic "Expected Space ID"
                // Use a world coordinate in the center of the mapsquare for registry lookup
                const mapsquareCenter = { x: (mx << 6) + 32, y: (my << 6) + 32 };
                const space = this.registry.getSpaceForCoords(mapsquareCenter.x, mapsquareCenter.y);
                
                if (space && !this.loadedRegions.has(space.spaceId)) {
                    loadPromises.push(this.attemptLoad(space));
                }
            }
        }

        if (loadPromises.length > 0) {
            logger.info({ count: loadPromises.length }, 'Triggering proactive regional logic loads.');
            await Promise.all(loadPromises);
        }

        this.lastCheckCoord = { ...avatar };
    }

    /**
     * attemptLoad - Locates and ingests a logic fragment using its Space ID.
     */
    private async attemptLoad(space: SpaceMetadata): Promise<void> {
        // Priority 1: Space ID-based logic (e.g. "barrows_logic.json")
        let success = await this.spatial.loadLogic(space.spaceId);
        
        // Priority 2: Coordinate fallback (e.g. "m_55_51_logic.json")
        if (!success.ok) {
            const coordName = `m_${space.mapsquare.x}_${space.mapsquare.y}`;
            success = await this.spatial.loadLogic(coordName);
        }

        if (success.ok) {
            logger.info({ spaceId: space.spaceId, region: space.name }, 'Proactive Space Logic applied.');
        } else {
            logger.debug({ spaceId: space.spaceId }, 'No logic fragment found for Expected Space ID.');
        }

        this.loadedRegions.add(space.spaceId);
    }

    private getRegionName(mx: number, my: number): string {
        return `${mx}_${my}`;
    }

    private shouldSkipCheck(avatar: Coord): boolean {
        if (!this.lastCheckCoord) return false;
        const dist = Math.abs(avatar.x - this.lastCheckCoord.x) + Math.abs(avatar.y - this.lastCheckCoord.y);
        return dist < this.checkThreshold;
    }

    /**
     * getLoadedCount - Metrics for Phase C validation.
     */
    public getLoadedCount(): number {
        return this.loadedRegions.size;
    }
}
