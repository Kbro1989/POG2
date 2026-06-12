import { SovereignBridge } from "./SovereignBridge";
import * as fs from "fs";
import * as path from "path";
import { GameCacheLoader } from "../cache/sqlite";
import { parse } from "../opdecoder";
import { cacheMajors, cacheMapFiles } from "../constants";

/**
 * SovereignWorldLoader.ts
 * 
 * Bridges the "Gold Mine" (unified_extract/world_extract JSONs) 
 * into the interactive 3D Sovereign Engine.
 */

const UNIFIED_DIR = "D:\\sovereign\\atlas\\spatial\\unified_extract";
const WORLD_EXTRACT_DIR = "D:\\sovereign\\atlas\\spatial\\world_extract";

export interface SovereignEntity {
    id: number;
    type: 'npc' | 'object';
    name: string;
    x: number;
    y: number;
    plane: number;
    rotation?: number;
    wikiUrl?: string;
}

export interface CollisionTile {
    walkable: boolean;
    surfaceType: string;
    sourceFlags: number;
    edges: {
        northBlocked?: boolean;
        southBlocked?: boolean;
        eastBlocked?: boolean;
        westBlocked?: boolean;
    };
}

export interface RegionTruth {
    regionId: number;
    entities: SovereignEntity[];
    collisionMatrix: Record<string, CollisionTile>;
}

export class SovereignWorldLoader {
    private static instance: SovereignWorldLoader;
    private cache: Map<string, RegionTruth> = new Map();
    private cacheSubstrate: GameCacheLoader | null = null;

    static getInstance() {
        if (!this.instance) this.instance = new SovereignWorldLoader();
        return this.instance;
    }

    public setCacheSubstrate(loader: GameCacheLoader) {
        this.cacheSubstrate = loader;
        console.log(`[SovereignWorldLoader] Direct Cache Substrate Linked.`);
    }

    /**
     * Loads 1:1 world truth for a specific region.
     * Prioritizes 'unified_extract' (High Fidelity) over 'world_extract', 
     * and falls back to Direct Cache Materialization.
     */
    async loadRegionTruth(rx: number, ry: number): Promise<RegionTruth | null> {
        const cacheKey = `${rx}_${ry}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

        const fileName = `ms_${rx}_${ry}.json`;
        const paths = [
            path.join(UNIFIED_DIR, fileName),
            path.join(WORLD_EXTRACT_DIR, fileName)
        ];

        for (const p of paths) {
            if (fs.existsSync(p)) {
                try {
                    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
                    console.log(`🧬⚡ Hydro-Synthesized Region [${rx}, ${ry}] from ${p}`);
                    const truth = this.normalizeData(data);
                    this.cache.set(cacheKey, truth);
                    return truth;
                } catch (e) {
                    console.error(`  [ERR] Failed to parse world truth at ${p}:`, e);
                }
            }
        }

        // --- Direct Cache Materialization Baseline ---
        if (this.cacheSubstrate) {
            console.log(`[SovereignWorldLoader] No pre-synthesized truth for [${rx}, ${ry}]. Triggering Direct Cache Materialization...`);
            const truth = await this.materializeFromCache(rx, ry);
            if (truth) {
                this.cache.set(cacheKey, truth);
                return truth;
            }
        }

        console.warn(`  [WARN] No pre-synthesized truth found for region [${rx}, ${ry}]`);
        return null;
    }

    private async materializeFromCache(rx: number, ry: number): Promise<RegionTruth | null> {
        if (!this.cacheSubstrate) return null;

        const regionId = (rx << 8) | ry;
        try {
            const index = await this.cacheSubstrate.getCacheIndex(cacheMajors.mapsquares);
            const archive = index[regionId];

            if (!archive) {
                console.warn(`[SovereignWorldLoader] No cache archive for region ${regionId}`);
                return null;
            }

            const files = await this.cacheSubstrate.getFileArchive(archive);
            const terrainFile = files.find(f => f.fileid === cacheMapFiles.squares);
            const locationFile = files.find(f => f.fileid === cacheMapFiles.locations);

            if (!terrainFile || !locationFile) {
                console.warn(`[SovereignWorldLoader] Missing terrain/locations in cache archive ${regionId}`);
                return null;
            }

            // Using buildnr 927 as the standard 2026 baseline for now
            const terrain = parse.mapsquareTiles.read(terrainFile.buffer, this.cacheSubstrate, { clientVersion: 927 });
            const locations = parse.mapsquareLocations.read(locationFile.buffer, this.cacheSubstrate);

            const entities: SovereignEntity[] = [];
            const collisionMatrix: Record<string, CollisionTile> = {};
            const baseX = rx * 64;
            const baseY = ry * 64;
            const tilesPerLevel = 64 * 64;

            // 1. Build Collision from Terrain
            for (let plane = 0; plane < 4; plane++) {
                for (let ty = 0; ty < 64; ty++) {
                    for (let tx = 0; tx < 64; tx++) {
                        const tileIndex = (plane * tilesPerLevel) + (ty * 64) + tx;
                        const tile = terrain.tiles?.[tileIndex];
                        if (!tile) continue;

                        const worldX = baseX + tx;
                        const worldY = baseY + ty;
                        const key = `${worldX}_${worldY}`;

                        const settings = tile.settings ?? 0;
                        collisionMatrix[key] = {
                            walkable: (settings & 1) === 0,
                            surfaceType: 'terrain',
                            sourceFlags: settings,
                            edges: {}
                        };
                    }
                }
            }

            // 2. Build Entities and Update Collision from Locations
            for (const locGroup of locations.locations) {
                const objId = locGroup.id;
                let objDef: any;
                try {
                    objDef = await this.getObjectDef(objId);
                } catch { continue; }

                for (const use of locGroup.uses) {
                    const worldX = baseX + use.x;
                    const worldY = baseY + use.y;
                    const key = `${worldX}_${worldY}`;

                    entities.push({
                        id: objId,
                        type: 'object',
                        name: objDef.name || `Object_${objId}`,
                        x: worldX,
                        y: worldY,
                        plane: use.plane,
                        rotation: use.rotation
                    });

                    if (!collisionMatrix[key]) continue;

                    const rotation = use.rotation;
                    const type = use.type;

                    // Wall logic (Directional blocking)
                    if (type >= 0 && type <= 3) {
                        if (rotation === 0) collisionMatrix[key].edges.westBlocked = true;
                        if (rotation === 1) collisionMatrix[key].edges.northBlocked = true;
                        if (rotation === 2) collisionMatrix[key].edges.eastBlocked = true;
                        if (rotation === 3) collisionMatrix[key].edges.southBlocked = true;
                    }
                    // Solid object
                    else if (type === 10 && !objDef.probably_nocollision) {
                        collisionMatrix[key].walkable = false;
                    }
                }
            }

            console.log(`[SovereignWorldLoader] Direct Materialization Complete for [${rx}, ${ry}]: ${entities.length} entities.`);
            return { regionId, entities, collisionMatrix };
        } catch (e) {
            console.error(`[SovereignWorldLoader] Direct Materialization Failed for [${rx}, ${ry}]:`, e);
            return null;
        }
    }

    private async getObjectDef(id: number) {
        const data = await this.cacheSubstrate!.getFile(cacheMajors.objects, id);
        if (!data) return { name: `Object_${id}`, probably_nocollision: false };
        return parse.object.read(data, this.cacheSubstrate!);
    }

    /**
     * Normalizes different JSON formats into a standard Sovereign structure.
     */
    private normalizeData(data: any): RegionTruth {
        const entities: SovereignEntity[] = [];
        const collisionMatrix: Record<string, CollisionTile> = {};

        // Handle 'unified_extract' format (objects, tileFlags)
        if (data.objects) {
            data.objects.forEach((obj: any) => {
                entities.push({
                    id: obj.id,
                    type: 'object',
                    name: obj.name || `Object_${obj.id}`,
                    x: obj.worldX || obj.x,
                    y: obj.worldZ || obj.z,
                    plane: obj.plane,
                    rotation: obj.rotation,
                    wikiUrl: obj.wikiUrl
                });
            });
        }

        // Handle 'world_extract' format (entities array)
        if (data.entities) {
            data.entities.forEach((ent: any) => {
                entities.push({
                    id: ent.id,
                    type: ent.type,
                    name: ent.name,
                    x: ent.x,
                    y: ent.y,
                    plane: ent.plane,
                    rotation: ent.rotation,
                    wikiUrl: ent.wikiUrl
                });
            });
        }

        // Phase B3 collision_matrix (semantic edges + surface types)
        if (data.collision_matrix) {
            for (const [key, tile] of Object.entries(data.collision_matrix)) {
                const t = tile as any;
                collisionMatrix[key] = {
                    walkable: t.walkable ?? true,
                    surfaceType: t.surfaceType ?? 'terrain',
                    sourceFlags: t.sourceFlags ?? 0,
                    edges: {
                        northBlocked: t.edges?.northBlocked ?? false,
                        southBlocked: t.edges?.southBlocked ?? false,
                        eastBlocked: t.edges?.eastBlocked ?? false,
                        westBlocked: t.edges?.westBlocked ?? false,
                    }
                };
            }
        } else if (data.tileFlags) {
            // Legacy fallback: convert flat tileFlags to collision tiles
            this.buildMatrixFromFlags(data.tileFlags, collisionMatrix);
        }

        return {
            regionId: data.regionId || (data.chunkX << 8 | data.chunkZ),
            entities,
            collisionMatrix
        };
    }

    private buildMatrixFromFlags(flags: any[], out: Record<string, CollisionTile>) {
        if (!flags) return;
        flags.forEach(f => {
            const key = `${f.x}_${f.z}`;
            out[key] = {
                walkable: f.collision === 0,
                surfaceType: 'terrain',
                sourceFlags: f.collision || 0,
                edges: {}
            };
        });
    }
}

