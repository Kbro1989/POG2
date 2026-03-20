import { Result } from '../../core/models.js';
import { createLogger } from '../../utils/logger.js';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

const logger = createLogger('CacheForensics');

export interface VolatilityStatus {
    lastModified: Date;
    hasChanged: boolean;
}

export interface CachedEntityInfo {
    id: number;
    name: string;
    description?: string;
    combatLevel?: number;
    category?: string;
}

export interface ForensicQuery {
    layer: 'models' | 'npcs' | 'items' | 'objects' | 'quests';
    queryType: 'exact' | 'partial' | 'regex';
    term: string;
    limit?: number;
}

/**
 * CacheForensicsLimb
 * Sovereign Epistemology Central Router.
 * 
 * Responsibilities:
 * 1. Cache Volatility Monitoring (detecting if the physical JS5 cache updated).
 * 2. Hierarchical Routing across preserved JSON taxonomy states.
 * 3. Cross-referencing entities (e.g., finding the exact Model IDs for an NPC query).
 */
export class CacheForensicsLimb {
    private mainCachePath: string;
    private taxonomiesPath: string;

    // Preserved States (Layer 2)
    private states: Record<string, CachedEntityInfo[]> = {
        npcs: [],
        items: [],
        objects: [],
        quests: []
    };

    private lastCacheStat: number = 0;

    constructor(cacheDir: string, taxonomiesDir: string) {
        const legacyPath = path.join(cacheDir, 'main_file_cache.dat2');
        const modernPath = path.join(cacheDir, 'js5-47.jcache'); // Major 47 is usually models
        
        this.mainCachePath = fsSync.existsSync(legacyPath) ? legacyPath : modernPath;
        this.taxonomiesPath = taxonomiesDir;
    }

    /**
     * Boot Sequence
     * Checks cache health and loads preserved states.
     */
    public async initialize(): Promise<Result<boolean>> {
        try {
            logger.info('Booting CacheForensicsLimb (Epistemology Router)...');

            // 1. Initial Volatility Check
            const volatility = await this.checkCacheVolatility();
            if (volatility.ok && volatility.value.hasChanged) {
                logger.warn('Initial cache state indicates recent modifications. An automated extraction sweep should be orchestrated.');
                // Trigger sweeping sequence via orchestration later.
            }

            // 2. Load Preserved JSON States into memory
            await this.loadPreservedStates();

            logger.info('CacheForensicsLimb sequence active.');
            return { ok: true, value: true };
        } catch (error) {
            logger.error({ error }, 'Failed to initialize CacheForensicsLimb.');
            return { ok: false, error: error as Error };
        }
    }

    /**
     * Checks the physical mtime of the main_file_cache.dat2 to detect Jagex updates.
     */
    public async checkCacheVolatility(): Promise<Result<VolatilityStatus>> {
        try {
            const stat = await fs.stat(this.mainCachePath);
            const currentMTime = stat.mtimeMs;

            const hasChanged = this.lastCacheStat > 0 && currentMTime > this.lastCacheStat;
            this.lastCacheStat = currentMTime;

            return {
                ok: true,
                value: {
                    lastModified: stat.mtime,
                    hasChanged
                }
            };
        } catch (error) {
            logger.error({ error }, `Cache probe failed at ${this.mainCachePath}`);
            return { ok: false, error: error as Error };
        }
    }

    private async loadPreservedStates(): Promise<void> {
        const layers = ['npcs', 'items', 'objects', 'quests'];

        // 1. Load Group Reference Files
        for (const layer of layers) {
            const possibleNames = [
                `${layer}.json`,
                `GROUP_REFERENCE_${layer}.json`,
                `${layer.toUpperCase()}.json`
            ];
            
            let foundPath: string | null = null;
            // Check Sovereign storage first, then fall back to CWD
            const searchDirs = [this.taxonomiesPath, process.cwd(), path.join(process.cwd(), 'src', 'opcodes')];

            for (const dir of searchDirs) {
                for (const name of possibleNames) {
                    const p = path.join(dir, name);
                    if (fsSync.existsSync(p)) {
                        foundPath = p;
                        break;
                    }
                }
                if (foundPath) break;
            }

            if (foundPath) {
                try {
                    const data = await fs.readFile(foundPath, 'utf-8');
                    const parsed = JSON.parse(data);
                    this.states[layer] = Array.isArray(parsed) ? parsed : [parsed];
                    logger.info({ layer, path: path.basename(foundPath), count: this.states[layer].length }, `Sovereign taxonomy layer loaded.`);
                } catch (e) {
                    logger.error({ layer, foundPath, e }, 'Corrupted preserved state detected.');
                }
            } else {
                logger.warn(`Preserved substrate missing for layer: ${layer}. (Searched in ${searchDirs.join(', ')})`);
            }
        }

        // 2. Aggregate Individual Entity Files (NPC_50.json etc)
        try {
            const files = fsSync.readdirSync(this.taxonomiesPath);
            for (const file of files) {
                const match = file.match(/^(NPC|ITEM|OBJECT|QUEST)_(\d+)\.json$/i);
                if (match) {
                    const type = match[1].toLowerCase();
                    const layer = type === 'quest' ? 'quests' : type + 's';
                    if (!this.states[layer]) continue;

                    try {
                        const data = await fs.readFile(path.join(this.taxonomiesPath, file), 'utf-8');
                        const entity = JSON.parse(data);
                        // Avoid duplicates from group files
                        if (!this.states[layer].find(e => e.id === entity.id)) {
                            this.states[layer].push(entity);
                            logger.debug({ layer, entity: entity.name, id: entity.id }, 'Aggregate entity loaded.');
                        }
                    } catch (e) {
                        logger.error({ file, e }, 'Failed to load aggregate entity.');
                    }
                }
            }
            logger.info('Taxonomy aggregation complete.');
        } catch (e) {
            logger.error({ e }, 'Failed to scan for aggregate entities.');
        }
    }

    /**
     * Query Engine (Layer 2)
     * Replaces hardcoded strings with dynamic capability.
     */
    public queryTaxonomy(query: ForensicQuery): Result<CachedEntityInfo[]> {
        const targetLayer = this.states[query.layer];
        if (!targetLayer || targetLayer.length === 0) {
            return { ok: false, error: new Error(`No data loaded for layer: ${query.layer}`) };
        }

        const limit = query.limit || 50;
        const results: CachedEntityInfo[] = [];
        const lowerTerm = query.term.toLowerCase();

        for (const entity of targetLayer) {
            if (!entity.name) continue;

            const lowerName = entity.name.toLowerCase();
            let isMatch = false;

            if (query.queryType === 'exact' && lowerName === lowerTerm) {
                isMatch = true;
            } else if (query.queryType === 'partial' && lowerName.includes(lowerTerm)) {
                isMatch = true;
            } else if (query.queryType === 'regex') {
                try {
                    isMatch = new RegExp(query.term, 'i').test(entity.name);
                } catch { }
            }

            if (isMatch) {
                results.push(entity);
                if (results.length >= limit) break;
            }
        }

        return { ok: true, value: results };
    }

    /**
     * Deep Cross-Reference (Layer 3)
     * e.g., Finds an item dynamically, then tries to cross reference it with equipment lists.
     */
    public async crossReferenceItem(partialName: string): Promise<Result<{ itemContext: CachedEntityInfo, rawModelIds: number[] }>> {
        // Find the base item via Layer 2 dynamic search
        const qRes = this.queryTaxonomy({ layer: 'items', queryType: 'partial', term: partialName, limit: 1 });
        if (!qRes.ok || qRes.value.length === 0) return { ok: false, error: new Error(`Item "${partialName}" not found in taxonomy.`) };

        const baseItem = qRes.value[0];
        const rawModelIds: number[] = [];

        // Cross-reference resolved item IDs with equipment model mappings.
        const equipPath = path.join(this.taxonomiesPath, 'equipment_by_slot.json');
        if (fsSync.existsSync(equipPath)) {
            const equipData = JSON.parse(await fs.readFile(equipPath, 'utf8'));
            for (const slotKey in equipData.equipment) {
                const slot = equipData.equipment[slotKey];
                for (const item of slot.items) {
                    if (item.id === baseItem.id && item.maleModelId) {
                        rawModelIds.push(item.maleModelId);
                    }
                }
            }
        }

        return { ok: true, value: { itemContext: baseItem, rawModelIds } };
    }

    /**
     * Retrieves the raw payload and metadata for an entity.
     * Used by the Sovereign Extraction bridge.
     */
    public async getRawPayload(type: string, id: number): Promise<{ buffer: Buffer, crc: number, version: number, fields: any }> {
        logger.info({ type, id }, 'Retrieving raw payload from forensics substrate...');

        // In a production scenario, this reads from the localized JSON snapshots or the physical cache.
        // For now, we search the memory states for the fields.
        const layer = type.toLowerCase() + 's';
        const entity = this.states[layer]?.find((e: any) => e.id === id);

        if (!entity) {
            throw new Error(`Forensics failed: Entity ${id} not found in ${layer} taxonomy.`);
        }

    // Return a structural payload based on the taxonomy metadata
        return {
            buffer: Buffer.from(JSON.stringify(entity)),
            crc: 0,
            version: 1,
            fields: entity
        };
    }

    public healthCheck(): { online: boolean; details: string; status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' } {
        const cacheExists = fsSync.existsSync(this.mainCachePath);
        const layers = Object.keys(this.states).filter(k => this.states[k].length > 0);
        const missingLayers = ['npcs', 'items', 'objects'].filter(l => this.states[l].length === 0);
        
        let status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' = 'ONLINE';
        let details = `Cache: ${cacheExists ? 'NOMINAL' : 'MISSING'} (${path.basename(this.mainCachePath)}). ${layers.length}/4 layers loaded.`;

        if (!cacheExists) {
            status = 'OFFLINE';
            details += " CRITICAL: Physical JS5 substrate unreachable.";
        } else if (missingLayers.length > 0) {
            status = 'DEGRADED';
            details += ` WARNING: Missing taxonomies: ${missingLayers.join(', ')}. Extraction required.`;
        }

        return { online: cacheExists, details, status };
    }
}
