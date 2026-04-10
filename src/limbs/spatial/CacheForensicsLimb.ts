import * as path from 'path';
import { Result, ok, err } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { getSovereignRoot, getRSMVCachePath, getCachePedagogyPath, getRSMVSubstratePath } from '../../utils/SovereignPathResolver.js';
import { rsmvBridge } from '../../utils/RSMVBridge.js';
import { WorldGroundingLimb } from '../world_grounding/WorldGroundingLimb.js';
import * as fs from 'fs';
import * as fsPromise from 'fs/promises';

const logger = createLogger('CacheForensicsLimb');

export interface VolatilityStatus {
    lastModified: Date;
    hasChanged: boolean;
}

/**
 * CacheForensicsLimb - Sovereign Epistemology Substrate
 * 
 * Responsibilities:
 * 1. Cache Volatility Monitoring (detecting if the physical JS5 cache updated).
 * 2. High-fidelity forensic decompilation of Items, NPCs, Objects, and Enums.
 * 3. Unified search across exported JSON catalogs.
 */
export class CacheForensicsLimb {
    private static instance: CacheForensicsLimb | undefined;
    private readonly cachePath = getRSMVCachePath();
    private cache: any | null = null;
    private readonly rootDir = getCachePedagogyPath(); // D:\sovereign\cache_pedagogy\json_dumps

    public static getInstance(): CacheForensicsLimb {
        if (!this.instance) {
            this.instance = new CacheForensicsLimb();
        }
        return this.instance;
    }

    public static resetInstance(): void {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('resetInstance is forbidden in production');
        }
        this.instance = undefined;
    }

    // Volatility tracking
    private lastCacheStat: number = 0;
    private mainCacheFile: string;

    // Cached JSON files
    private equipmentBySlot: any = null;
    private quests: any = null;
    private npcs: any[] | null = null;
    private items: any[] | null = null;
    private objects: any[] | null = null;

    // Grounding & Pedagogy
    private grounding: WorldGroundingLimb;
    private readonly pedagogyDir = path.join('D:/sovereign', 'memory', 'pedagogy');

    private readonly SLOT_NAMES = [
        'helm', 'cape', 'necklace', 'weapon', 'body', 'offhand',
        'arms', 'legs', 'face', 'gloves', 'boots', 'beard',
        'ring', 'ammo', 'aura', 'slot15'
    ];

    protected constructor() {
        if (CacheForensicsLimb.instance) {
            throw new Error('Singleton violation: use CacheForensicsLimb.getInstance()');
        }
        // Track the main cache file for volatility checks
        // Track the main cache file for volatility checks (Dynamically find Major 255 or the largest bundle)
        const legacyPath = path.join(this.cachePath, 'main_file_cache.dat2');
        const rootIndexPath = path.join(this.cachePath, 'js5-index.jcache');
        
        if (fs.existsSync(rootIndexPath)) {
            this.mainCacheFile = rootIndexPath;
        } else if (fs.existsSync(legacyPath)) {
            this.mainCacheFile = legacyPath;
        } else {
            // Heuristic Fallback: Find any high-major jcache bundle (likely NXT God Bundle)
            const files = fs.readdirSync(this.cachePath).filter(f => f.endsWith('.jcache'));
            const bundles = files.map(f => ({ name: f, major: parseInt(f.match(/\d+/)?.[0] || '0') }))
                               .sort((a, b) => b.major - a.major);
            this.mainCacheFile = bundles.length > 0 ? path.join(this.cachePath, bundles[0].name) : 'OFFLINE';
        }

        // Initialize grounding resolver
        this.grounding = WorldGroundingLimb.getInstance();

        // Lazy load basic catalogs
        this.loadCatalogData();
    }

    /**
     * initialize - Boot sequence for the forensic substrate.
     */
    public async initialize(): Promise<Result<boolean>> {
        try {
            const manifestsDir = path.join(this.pedagogyDir, 'manifests');
            const scanDirs = [this.pedagogyDir, manifestsDir];

            logger.info('Booting CacheForensicsLimb (Epistemology substrate)...');

            // Initial volatility check
            const volatility = await this.checkCacheVolatility();
            if (volatility.ok && volatility.value.hasChanged) {
                logger.warn('Initial cache state indicates recent modifications. Substrate may be out of sync.');
            }

            logger.info('CacheForensicsLimb sequence ACTIVE.');
            return ok(true);
        } catch (error) {
            return err(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * isAuthoritative - Confirms if the substrate is grounded in the 11GB Live Cache.
     */
    public async isAuthoritative(): Promise<boolean> {
        try {
            const health = await rsmvBridge.healthCheck();
            // Statuses like 'ONLINE (Authoritative)' or 'ONLINE' against the live path confirm authority.
            return health.ok && health.value.online;
        } catch {
            return false;
        }
    }

    private loadCatalogData() {
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
            logger.warn({ error: (e as Error).message }, 'Failed to load forensic JSON catalogs.');
        }
    }

    /**
     * Checks the physical mtime of the cache to detect Jagex updates.
     */
    public async checkCacheVolatility(): Promise<Result<VolatilityStatus>> {
        try {
            if (!fs.existsSync(this.mainCacheFile)) {
                return err(new Error(`Cache file not found: ${this.mainCacheFile}`));
            }
            const stat = await fsPromise.stat(this.mainCacheFile);
            const currentMTime = stat.mtimeMs;

            const hasChanged = this.lastCacheStat > 0 && currentMTime > this.lastCacheStat;
            this.lastCacheStat = currentMTime;

            return ok({
                lastModified: stat.mtime,
                hasChanged
            });
        } catch (error) {
            logger.error({ error }, `Cache volatility probe failed at ${this.mainCacheFile}`);
            return err(error as Error);
        }
    }

    /**
     * Search for an entity by name across all exported JSON catalogs.
     */
    public searchByName(query: string, type: 'npc' | 'item' | 'object' | 'all' = 'all'): Result<any[]> {
        try {
            const types = type === 'all' ? ['npc', 'item', 'object'] : [type];
            const results: any[] = [];
            const lowerQuery = query.toLowerCase();

            for (const t of types) {
                const entries = this.getEntries(t as any);
                for (const entry of entries) {
                    const score = this.scoreMatch(entry.name, lowerQuery);
                    if (score > 0) {
                        results.push({
                            id: entry.id,
                            name: entry.name,
                            type: t,
                            matchScore: score
                        });
                    }
                }
            }

            results.sort((a, b) => b.matchScore - a.matchScore || a.id - b.id);
            return ok(results.slice(0, 50));
        } catch (e) {
            logger.error({ error: (e as Error).message, query }, 'Forensic Name Search failed.');
            return err(new Error(`Search failed: ${(e as Error).message}`));
        }
    }

    private getEntries(type: 'npc' | 'item' | 'object'): any[] {
        if (type === 'npc') {
            if (!this.npcs) {
                const p = path.join(this.rootDir, 'npcs.json');
                this.npcs = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
            }
            return this.npcs!;
        }
        if (type === 'item') {
            if (!this.items) {
                const p = path.join(this.rootDir, 'items.json');
                this.items = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
            }
            return this.items!;
        }
        if (type === 'object') {
            if (!this.objects) {
                const p = path.join(this.rootDir, 'objects.json');
                this.objects = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
            }
            return this.objects!;
        }
        return [];
    }

    private scoreMatch(name: string, lowerQuery: string): number {
        if (!name) return 0;
        const lowerName = name.toLowerCase();
        if (lowerName === lowerQuery) return 1.0;
        if (lowerName.includes(lowerQuery)) return 0.7;
        return 0.0;
    }

    public async getItemDetails(id: number): Promise<Result<any>> {
        const res = await rsmvBridge.getItem(id);
        
        let raw: any;
        if (!res.ok) {
            logger.warn({ id, err: res.error.message }, 'Live bridge failed. Falling back to JSON substrate...');
            const entries = this.getEntries('item');
            raw = entries.find((e: any) => e.id === id);
            if (!raw) return err(new Error(`Item ID ${id} not found in any substrate.`));
        } else {
            raw = res.value;
        }

        const SLOT_NAMES = this.SLOT_NAMES;
        const baseData = {
            id,
            raw: raw.raw || raw,
            forensics: {
                name: raw.name,
                isEquippable: raw.isEquippable ?? (raw.equipSlotId !== undefined),
                equipSlot: (raw.equipSlotId !== null && raw.equipSlotId !== undefined && raw.equipSlotId < SLOT_NAMES.length) ? SLOT_NAMES[raw.equipSlotId] : null,
                equipSlotId: raw.equipSlotId ?? null,
                isMember: raw.isMember ?? !!raw.members,
                maleModels: raw.maleModels ?? [],
                femaleModels: raw.femaleModels ?? [],
                actions: raw.actions ?? [raw.widget_actions_0, raw.widget_actions_1, raw.widget_actions_2, raw.widget_actions_3, raw.widget_actions_4].filter(Boolean)
            },
            pedagogy: {
                summary: raw.name,
                classification: 'item_entity'
            }
        };

        // Option C Hydration
        const pedagogy = this.getPedagogicalContext(`item_${id}`);
        return ok(this.grounding.hydrate(`item_${id}`, { ...baseData, ...pedagogy }));
    }

    /**
     * Decompile the full NPC definition from the active cache.
     */
    public async getNpcDetails(id: number): Promise<Result<any>> {
        const res = await rsmvBridge.getNpc(id);
        
        let raw: any;
        if (!res.ok) {
            logger.warn({ id, err: res.error.message }, 'Live bridge failed. Falling back to JSON substrate...');
            const entries = this.getEntries('npc');
            raw = entries.find((e: any) => e.id === id);
            if (!raw) return err(new Error(`NPC ID ${id} not found in any substrate.`));
        } else {
            raw = res.value;
        }

        const baseData = {
            id,
            raw: raw.raw || raw,
            forensics: {
                name: raw.name,
                combatLevel: raw.combatLevel ?? raw.combat ?? null,
                models: raw.models ?? [],
                headModels: raw.headModels ?? [],
                actions: raw.actions ?? [raw.actions_0, raw.actions_1, raw.actions_2, raw.actions_3, raw.actions_4].filter(Boolean),
                boundSize: (raw.boundSize ?? raw.raw?.boundSize) ?? null,
                animationGroup: (raw.animationGroup ?? raw.raw?.animation_group) ?? null
            },
            pedagogy: {
                summary: raw.name,
                classification: (raw.combatLevel || raw.combat) ? 'combat_npc' : 'passive_npc'
            }
        };

        // Option C Hydration: If we have pedagogical records, overlay the grounded truth
        const pedagogy = this.getPedagogicalContext(`npc_${id}`);
        return ok(this.grounding.hydrate(`npc_${id}`, { ...baseData, ...pedagogy }));
    }

    /**
     * getPedagogicalContext - Fetches the original POG2 synthesis for an entity.
     */
    public getPedagogicalContext(entityKey: string): any {
        try {
            const [type, id] = entityKey.split('_');
            let filename = '';
            if (type === 'npc') filename = `NPC_${id}.json`;
            else if (type === 'item') filename = `ITEM_ITEM_${id}.json`;
            else if (type === 'object') filename = `OBJ_${id}.json`;
            
            // Check manifests subdirectory first
            let pedagogyPath = path.join(this.pedagogyDir, 'manifests', filename);
            if (!fs.existsSync(pedagogyPath)) {
                // Fallback to root
                pedagogyPath = path.join(this.pedagogyDir, filename);
            }

            if (fs.existsSync(pedagogyPath)) {
                return JSON.parse(fs.readFileSync(pedagogyPath, 'utf8'));
            }

            // Fallback for variant naming
            if (type === 'item') {
                const altPath = path.join(this.pedagogyDir, `ITEM_${id}.json`);
                if (fs.existsSync(altPath)) return JSON.parse(fs.readFileSync(altPath, 'utf8'));
            }
        } catch (err) {
            logger.debug({ entityKey }, 'No pedagogical context found.');
        }
        return null;
    }

    public async getObjectDetails(id: number): Promise<Result<any>> {
        const res = await rsmvBridge.getObject(id);
        
        let raw: any;
        if (!res.ok) {
            logger.warn({ id, err: res.error.message }, 'Live bridge failed. Falling back to JSON substrate...');
            const entries = this.getEntries('object');
            raw = entries.find((e: any) => e.id === id);
            if (!raw) return err(new Error(`Object ID ${id} not found in any substrate.`));
        } else {
            raw = res.value;
        }

        const baseData = {
            id,
            raw: raw.raw || raw,
            forensics: {
                name: raw.name,
                actions: raw.actions ?? [raw.actions_0, raw.actions_1, raw.actions_2, raw.actions_3, raw.actions_4].filter(Boolean),
                models: raw.models ?? [],
                sizeX: raw.sizeX ?? raw.width ?? 1,
                sizeZ: raw.sizeZ ?? raw.length ?? 1,
                maybeBlocksMovement: raw.maybe_blocks_movement ?? true,
                probablyNoCollision: raw.probably_nocollision ?? false,
                params: raw.params ?? {}
            },
            pedagogy: {
                summary: raw.name,
                classification: 'world_object'
            }
        };

        // Option C Hydration
        const pedagogy = this.getPedagogicalContext(`object_${id}`);
        return ok(this.grounding.hydrate(`object_${id}`, { ...baseData, ...pedagogy }));
    }

    /**
     * Get the full ENUM definition from the cache.
     */
    public async getEnumDetails(id: number): Promise<Result<any>> {
        if (!this.cache) return err(new Error('Cache connection offline.'));
        try {
            const MAJOR_ENUMS = 17;
            const ARCH_SIZE = 128;
            const archiveId = Math.floor(id / ARCH_SIZE);
            const fileId = id % ARCH_SIZE;

            const archive = await this.cache.getArchiveById(MAJOR_ENUMS, archiveId);
            const file = archive.find((f: any) => f.fileid === fileId);
            if (!file) return err(new Error(`Enum ID ${id} not found in archive ${archiveId}`));

            const def = this.decodeEnum(file.buffer);
            return ok({ id, ...def });
        } catch (e) {
            logger.error({ error: (e as Error).message, id }, 'Enum Forensic Decompile failed.');
            return err(new Error(`Decompile failed: ${(e as Error).message}`));
        }
    }

    private decodeEnum(buffer: Buffer): any {
        let offset = 0;
        const def: any = { map: {} };
        while (offset < buffer.length) {
            const opcode = buffer.readUInt8(offset++);
            if (opcode === 0) break;
            switch (opcode) {
                case 1: def.keyType = buffer.readUInt8(offset++); break;
                case 2: def.valType = buffer.readUInt8(offset++); break;
                case 3: def.defaultString = this.readString(buffer, offset); offset += def.defaultString.length + 1; break;
                case 4: def.defaultInt = buffer.readInt32BE(offset); offset += 4; break;
                case 5: {
                    const size = buffer.readUInt16BE(offset); offset += 2;
                    for (let i = 0; i < size; i++) {
                        const key = buffer.readInt32BE(offset); offset += 4;
                        const val = this.readString(buffer, offset); offset += val.length + 1;
                        def.map[key] = val;
                    }
                    break;
                }
                case 6: {
                    const size = buffer.readUInt16BE(offset); offset += 2;
                    for (let i = 0; i < size; i++) {
                        const key = buffer.readInt32BE(offset); offset += 4;
                        const val = buffer.readInt32BE(offset); offset += 4;
                        def.map[key] = val;
                    }
                    break;
                }
            }
        }
        return def;
    }

    private readString(buffer: Buffer, offset: number): string {
        let end = offset;
        while (end < buffer.length && buffer[end] !== 0) end++;
        return buffer.slice(offset, end).toString('utf-8');
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
     * Get a specific quest definition.
     */
    public getQuestDetails(questId: number): Result<any> {
        if (!this.quests) return err(new Error('quests.json not loaded.'));
        const quest = this.quests.quests.find((q: any) => q.id === questId);
        if (!quest) return err(new Error(`Quest ID ${questId} not found.`));
        return ok(quest);
    }

    /**
     * Get the full prerequisite chain for a quest.
     */
    public getQuestChain(questId: number): Result<{ quest: any, chainPath: number[] }> {
        if (!this.quests) return err(new Error('quests.json not loaded.'));

        const quest = this.quests.quests.find((q: any) => q.id === questId);
        if (!quest) return err(new Error(`Quest ID ${questId} not found.`));

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
     * findItemSlot - Resolves which equipment slot an item belongs to using JSON substrate.
     */
    public findItemSlot(itemId: number): string | null {
        if (!this.equipmentBySlot || !this.equipmentBySlot.equipment) return null;
        for (const [slot, data] of Object.entries(this.equipmentBySlot.equipment)) {
            const items = (data as any).items || [];
            if (items.some((item: any) => item.id === itemId)) return slot;
        }
        return null;
    }

    /**
     * getRawPayload - Interface for learning substrates.
     */
    public async getRawPayload(type: string, id: number): Promise<{ buffer: Buffer, crc: number, version: number, fields: any }> {
        const layer = type.toLowerCase() + 's';
        const entries = this.getEntries(type as any);
        const entity = entries.find((e: any) => e.id === id);

        if (!entity) {
            throw new Error(`Forensics failed: Entity ${id} not found in ${layer} substrate.`);
        }

        return {
            buffer: Buffer.from(JSON.stringify(entity)),
            crc: 0,
            version: 1,
            fields: entity
        };
    }

    public async getInterfaceDetails(id: number): Promise<Result<any>> {
        const res = await rsmvBridge.getInterface(id);
        if (!res.ok) return err(res.error);
        return ok(res.value);
    }

    /**
     * getInterfaceRelianceGraph - Deep dependency analysis of Archive 3.
     */
    public async getInterfaceRelianceGraph(id: number): Promise<Result<{ id: number, reliance: any[] }>> {
        const details = await this.getInterfaceDetails(id);
        if (!details.ok) return err(details.error);

        const reliance: any[] = [];
        const raw = details.value.raw;

        // Recursive scanner for interface components
        const scan = (node: any) => {
            if (!node) return;
            
            // 1. Sprite Reliance (Archive 8)
            if (node.spriteid !== undefined && node.spriteid !== -1) {
                reliance.push({ type: 'SPRITE', id: node.spriteid, source: 'ARCHIVE_8' });
            }
            // 2. Model Reliance (Archive 54)
            if (node.modelid !== undefined && node.modelid !== -1) {
                reliance.push({ type: 'MODEL', id: node.modelid, source: 'ARCHIVE_54' });
            }
            // 3. Animation Reliance (Archive 54)
            if (node.animid !== undefined && node.animid !== -1) {
                reliance.push({ type: 'SEQUENCE', id: node.animid, source: 'ARCHIVE_54' });
            }
            // 4. Font Reliance (Archive 2)
            if (node.fontid !== undefined && node.fontid !== -1) {
                reliance.push({ type: 'FONT', id: node.fontid, source: 'ARCHIVE_2_G13' });
            }

            if (node.children) {
                for (const child of node.children) scan(child);
            }
        };

        scan(raw);
        return ok({ id, reliance });
    }

    /**
     * queryTaxonomy - Interface for CLI tools.
     */
    public queryTaxonomy(query: { layer: string, term: string, queryType?: string, limit?: number }): Result<any[]> {
        const typeMap: Record<string, string> = { npcs: 'npc', items: 'item', objects: 'object' };
        const t = typeMap[query.layer] || 'all';
        return this.searchByName(query.term, t as any);
    }

    /**
     * crossReferenceItem - Deep matching for model IDs.
     */
    public async crossReferenceItem(partialName: string): Promise<Result<{ id: number, name: string, itemContext: any, rawModelIds: number[] }>> {
        const qRes = this.searchByName(partialName, 'item');
        if (!qRes.ok || qRes.value.length === 0) return err(new Error(`Item "${partialName}" not found.`));

        const baseItem = qRes.value[0];
        const rawModelIds: number[] = [];

        if (this.equipmentBySlot) {
            for (const slotKey in this.equipmentBySlot.equipment) {
                const slot = this.equipmentBySlot.equipment[slotKey];
                for (const item of slot.items) {
                    if (item.id === baseItem.id && item.maleModelId) {
                        rawModelIds.push(item.maleModelId);
                    }
                }
            }
        }

        return ok({ id: baseItem.id, name: baseItem.name, itemContext: baseItem, rawModelIds });
    }

    /**
     * crossReferenceNpc - Resolves NPC by name.
     */
    public async crossReferenceNpc(partialName: string): Promise<Result<{ id: number, name: string, raw: any }>> {
        const qRes = this.searchByName(partialName, 'npc');
        if (!qRes.ok || qRes.value.length === 0) return err(new Error(`NPC "${partialName}" not found.`));

        const baseNpc = qRes.value[0];
        const details = await this.getNpcDetails(baseNpc.id);
        if (!details.ok) return err(details.error);

        return ok({ id: baseNpc.id, name: baseNpc.name, raw: details.value.raw });
    }

    public async healthCheck(): Promise<{ online: boolean; details: string; status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' }> {
        const catalogReady = this.equipmentBySlot !== null;
        // Probe the live cache via RSMVBridge
        const bridgeRes = await rsmvBridge.healthCheck();
        const cacheOnline = bridgeRes.ok && bridgeRes.value.online;

        const status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' =
            cacheOnline && catalogReady ? 'ONLINE' :
            catalogReady ? 'DEGRADED' : 'OFFLINE';

        const details = `Cache: ${cacheOnline ? 'NOMINAL' : 'OFFLINE'}. Catalogs: ${catalogReady ? 'READY' : 'MISSING'}.`;
        return { online: cacheOnline || catalogReady, details, status };
    }

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
