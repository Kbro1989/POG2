import { Result, ok, err } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { getSovereignRoot, getRSMVCachePath } from '../../utils/SovereignPathResolver.js';
import * as fs from 'fs';
import * as path from 'path';

// Import forensic core functions
import { loadItem, type ItemForensicResult } from '../../../cache_item_forensics.js';
import { loadNpc, type NpcForensicResult } from '../../../cache_npc_forensics.js';
import { search, type SearchResult } from '../../../cache_name_search.js';
import { GameCacheLoader } from '../../../tmp_rsmv_inspect/src/cache/sqlite.js';

const logger = createLogger('CacheForensicsLimb');

/**
 * CacheForensicsLimb - Substrate Integration
 * Connects the POG2 nervous system to the RS3 cache via forensic decompilers.
 */
export class CacheForensicsLimb {
    private readonly cachePath = getRSMVCachePath();
    private cache: any | null = null;

    private readonly rootDir = path.resolve(process.cwd()); // pog-vibe-interactive/files
    
    // Cached JSON files
    private equipmentBySlot: any = null;
    private quests: any = null;

    constructor() {
        try {
            this.cache = new GameCacheLoader(this.cachePath);
            this.cache.buildnr = 940;
            logger.info('CacheForensicsLimb initialized. Cache connection active.');
        } catch (e) {
            logger.error({ error: (e as Error).message }, 'Failed to initialize GameCacheLoader.');
        }

        // Lazy load the huge JSON exports
        this.loadJsonData();
    }

    private loadJsonData() {
        try {
            const eqPath = path.join(this.rootDir, 'equipment_by_slot.json');
            if (fs.existsSync(eqPath)) {
                this.equipmentBySlot = JSON.parse(fs.readFileSync(eqPath, 'utf8'));
                logger.debug('Loaded equipment_by_slot.json');
            }

            const questPath = path.join(this.rootDir, 'quests.json');
            if (fs.existsSync(questPath)) {
                this.quests = JSON.parse(fs.readFileSync(questPath, 'utf8'));
                logger.debug('Loaded quests.json');
            }
        } catch (e) {
            logger.warn({ error: (e as Error).message }, 'Failed to load forensic JSON caches.');
        }
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const cacheValid = this.cache !== null;
        let details = cacheValid 
            ? `Cache connection active at ${this.cachePath}`
            : 'Cache connection FAILED.';
        
        details += ` | Equipment maps: ${this.equipmentBySlot ? 'READY' : 'MISSING'}`;
        details += ` | Quest maps: ${this.quests ? 'READY' : 'MISSING'}`;

        return {
            online: cacheValid,
            details
        };
    }

    /**
     * Search for an entity by name across all exported JSON catalogs.
     */
    public searchByName(query: string, type: 'npc' | 'item' | 'object' | 'all' = 'all'): Result<SearchResult[]> {
        try {
            const types = type === 'all' ? ['npc', 'item', 'object'] : [type];
            // search() function uses fs to read the npcs.json etc from the cwd
            const results = search(types, query, 'partial', 20);
            return ok(results);
        } catch (e) {
            logger.error({ error: (e as Error).message, query }, 'Forensic Name Search failed.');
            return err(new Error(`Search failed: ${(e as Error).message}`));
        }
    }

    /**
     * Decompile the full item definition from the active cache.
     */
    public async getItemDetails(id: number): Promise<Result<ItemForensicResult>> {
        if (!this.cache) return err(new Error('Cache connection offline.'));

        try {
            const result = await loadItem(this.cache, id);
            if (!result) return err(new Error(`Item ID ${id} not found in cache.`));
            return ok(result);
        } catch (e) {
            logger.error({ error: (e as Error).message, id }, 'Item Forensic Decompile failed.');
            return err(new Error(`Decompile failed: ${(e as Error).message}`));
        }
    }

    /**
     * Decompile the full NPC definition from the active cache.
     */
    public async getNpcDetails(id: number): Promise<Result<NpcForensicResult>> {
        if (!this.cache) return err(new Error('Cache connection offline.'));

        try {
            const result = await loadNpc(this.cache, id);
            if (!result) return err(new Error(`NPC ID ${id} not found in cache.`));
            return ok(result);
        } catch (e) {
            logger.error({ error: (e as Error).message, id }, 'NPC Forensic Decompile failed.');
            return err(new Error(`Decompile failed: ${(e as Error).message}`));
        }
    }

    /**
     * Get all equippable items for a specific avatar slot.
     */
    public getEquipmentBySlot(slotName: string): Result<any[]> {
        if (!this.equipmentBySlot) return err(new Error('equipment_by_slot.json not loaded.'));

        const slotData = this.equipmentBySlot.equipment[slotName];
        if (!slotData) return err(new Error(`Slot '${slotName}' does not exist.`));

        return ok(slotData.items);
    }

    /**
     * Get a specific quest and its full prerequisite chain.
     */
    public getQuestChain(questId: number): Result<{ quest: any, chainPath: number[] }> {
        if (!this.quests) return err(new Error('quests.json not loaded.'));

        const quest = this.quests.quests.find((q: any) => q.id === questId);
        if (!quest) return err(new Error(`Quest ID ${questId} not found.`));

        // Simple BFS to find the full prerequisite chain needed
        const chainPath: number[] = [];
        const visited = new Set<number>();
        const stack = [...quest.prerequisiteQuests];
        
        while (stack.length > 0) {
            const next = stack.pop()!;
            if (visited.has(next)) continue;
            visited.add(next);
            chainPath.push(next);

            const nextQuest = this.quests.quests.find((q: any) => q.id === next);
            if (nextQuest && nextQuest.prerequisiteQuests) {
                stack.push(...nextQuest.prerequisiteQuests);
            }
        }

        return ok({ quest, chainPath: chainPath.reverse() });
    }

    /**
     * Gracefully close the database connection.
     */
    public close() {
        if (this.cache) {
            try {
                this.cache.close();
                this.cache = null;
                logger.info('CacheForensicsLimb cache connection closed.');
            } catch (e) {
                logger.error({ error: (e as Error).message }, 'Error closing cache.');
            }
        }
    }
}
