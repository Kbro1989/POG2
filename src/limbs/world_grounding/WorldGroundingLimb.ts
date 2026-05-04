import * as fs from 'fs';
import { join } from 'path';
import { getAtlasSystemPath, getAtlasSpatialPath } from '../../utils/SovereignPathResolver.js';
import { createLogger } from '../../utils/logger.js';
import type { GroundingManifest, GroundingEntry, GroundingHydrator } from '../../core/grounding.js';
import type { Result, Provenance } from '../../core/models.js';
import { ServerLogicRegistry } from '../../engines/gameplay/ServerLogicRegistry.js';
import { PedagogyForensicsLimb } from '../pedagogy/PedagogyForensicsLimb.js';
import { SpatialTransform } from '../../core/WorldTransform.js';
import { SpatialSovereigntyLimb } from '../spatial/SpatialSovereigntyLimb.js';

import type { WorldCoord } from '../../core/WorldTransform.js';

const logger = createLogger('WorldGroundingLimb');

/**
 * WorldGroundingLimb — The Sovereign Resolution Layer.
 * 
 * Implements Option C: Manifest-based grounding. Bridges pedagogical vibes 
 * from D:/sovereign/memory/pedagogy with cache-authoritative truth.
 */
export class WorldGroundingLimb implements GroundingHydrator {
    private static instance: WorldGroundingLimb | undefined;
    private manifest: GroundingManifest;
    private readonly manifestPath: string;
    private cacheMapping: Record<string, any[]> = {};
    
    // Era Layering State
    private currentEra: '2004' | 'RS3' | 'POG2' = 'POG2';
    private eraBaseDir: string;
    
    private lastSaveTime: number = Date.now();
    private readonly SAVE_INTERVAL = 300000; // 5 Minutes (RSC Style)
    private tickStaging: Map<string, any> = new Map();
    private npcSpawns: any[] = [];
    private npcsLoaded: boolean = false;

    public static getInstance(): WorldGroundingLimb {
        if (!this.instance) {
            this.instance = new WorldGroundingLimb();
        }
        return this.instance;
    }

    /**
     * resetInstance - Required for core bootstrap reset logic.
     */
    public static resetInstance(): void {
        this.instance = undefined;
    }

    protected constructor(substratePath: string = 'D:/sovereign') {
        if (WorldGroundingLimb.instance) {
            throw new Error('Singleton violation: use WorldGroundingLimb.getInstance()');
        }
        this.eraBaseDir = join(substratePath, 'memory', 'pedagogy');
        this.manifestPath = join(this.eraBaseDir, 'grounding_manifest.json');
        
        // Initial Grounding
        this.manifest = this.loadManifest();
        this.loadCacheMapping();

        // Initialize Auto-Save Loop
        setInterval(() => this.autoSave(), 60000); // Check every minute
    }

    /**
     * invokeEraVolley - Trigger a dynamic era-layer shift.
     * Re-hydrates the manifest and cache mappings based on the chosen progression era.
     */
    public async invokeEraVolley(era: '2004' | 'RS3' | 'POG2'): Promise<void> {
        logger.info({ from: this.currentEra, to: era }, 'âš¡ GROUNDING_VOLLEY: Re-orienting world substrate...');
        
        this.currentEra = era;
        
        // Dynamic Path Re-resolution
        // Era-specific nodes take precedence; fall back to root pedagogy if missing.
        const eraDir = era === 'POG2' ? this.eraBaseDir : join(this.eraBaseDir, 'eras', era.toLowerCase());
        
        if (!fs.existsSync(eraDir) && era !== 'POG2') {
            fs.mkdirSync(eraDir, { recursive: true });
            logger.warn({ eraDir }, 'Era substrate missing - initialized empty layer.');
        }

        // Re-hydrate Substrate
        this.manifest = this.loadManifest(eraDir);
        this.loadCacheMapping(eraDir);
        this.npcsLoaded = false;
        this.loadNpcSpawns(eraDir);

        logger.info({ era }, 'World Grounding Re-oriented Successfully.');
    }

    /**
     * autoSave - Automated world checkpointing.
     */
    private async autoSave(): Promise<void> {
        const now = Date.now();
        if (now - this.lastSaveTime > this.SAVE_INTERVAL) {
            logger.info('Auto-saving world grounding manifest (Clinical Checkpoint)...');
            await this.saveManifest();
            this.lastSaveTime = now;
        }
    }

    /**
     * reset - Clear staging and reload manifest.
     */
    public reset(): void {
        this.tickStaging.clear();
        this.manifest = this.loadManifest();
        logger.info('Grounding Kernel reset.');
    }

    private loadCacheMapping(targetDir?: string) {
        try {
            const base = targetDir ?? this.eraBaseDir;
            const mappingPath = join(base, 'cache_logic_mapping.json');
            
            // Fallback to absolute system mapping if era-specific mapping missing
            const systemRoot = getAtlasSystemPath();
            const fallbackPath = join(systemRoot, 'cache_logic_mapping.json');
            const effectivePath = fs.existsSync(mappingPath) ? mappingPath : fallbackPath;

            if (fs.existsSync(effectivePath)) {
                const data = fs.readFileSync(effectivePath, 'utf8');
                this.cacheMapping = JSON.parse(data);
                logger.debug({ nodes: Object.values(this.cacheMapping).flat().length, source: effectivePath }, 'Authoritative Cache Mapping loaded.');
            }
        } catch (err) {
            logger.warn('Authoritative Cache Mapping unavailable for grounding fallback.');
        }
    }

    private loadManifest(targetDir?: string): GroundingManifest {
        try {
            const base = targetDir ?? this.eraBaseDir;
            const eraManifestPath = join(base, 'grounding_manifest.json');
            
            // Phase 116: Prioritize public/grounding_manifest.json for breakthrough tests
            const publicManifest = join(process.cwd(), 'public', 'grounding_manifest.json');
            const target = fs.existsSync(publicManifest) ? publicManifest : (fs.existsSync(eraManifestPath) ? eraManifestPath : this.manifestPath);

            if (fs.existsSync(target)) {
                const data = fs.readFileSync(target, 'utf8');
                logger.info({ source: target }, 'Grounding manifest loaded from authoritative breakthrough source.');
                return JSON.parse(data);
            }
        } catch (err) {
            logger.error({ err }, 'Failed to load grounding manifest.');
        }

        return {
            version: '1.0.0',
            project: 'pog2-sovereign',
            entities: {}
        };
    }

    private async saveManifest(): Promise<void> {
        try {
            const data = JSON.stringify(this.manifest, null, 2);
            fs.writeFileSync(this.manifestPath, data, 'utf8');
        } catch (err) {
            logger.error({ err }, 'Failed to save grounding manifest.');
            throw err;
        }
    }

    /**
     * Hydrate a pedagogical object with grounded truth.
     */
    public hydrate<T>(entityId: string, pedagogy: T): T {
        const entry = this.manifest.entities[entityId];
        if (!entry) {
            const [type, idStr] = entityId.split('_');
            const cacheResult = this.getAuthoritativeLogic(type, idStr);
            
            if (cacheResult) {
                return {
                    ...pedagogy,
                    _grounding: {
                        timestamp: Date.now(),
                        confidence: 0.9,
                        authoritativeSource: 'CACHE',
                        lineageDeltas: [`Synchronized via Cache Logic Mapping: ${cacheResult.keyword}`]
                    }
                } as T;
            }

            return pedagogy;
        }

        return {
            ...pedagogy,
            ...entry.grounded.data,
            _grounding: {
                timestamp: entry.grounded.timestamp,
                confidence: entry.grounded.confidence,
                authoritativeSource: entry.grounded.authoritativeSource,
                lineageDeltas: entry.deltas
            }
        } as T;
    }

    public async record(entityId: string, entry: GroundingEntry): Promise<void> {
        this.manifest.entities[entityId] = entry;
        await this.saveManifest();
    }

    public getEntry(entityId: string): GroundingEntry | null {
        return this.manifest.entities[entityId] || null;
    }

    /**
     * Hook 2: Fetch spatial layout of a region.
     */
    public getSpatialTruth(regionId: string): any {
        return this.manifest.entities[`region_${regionId}`] || null;
    }

    /**
     * Hook 3: Fetch Systemic Logic (Hexagrams, Triggers, Travel Graphs).
     */
    public getSystemicLogic(logicId: string): any {
        return this.manifest.entities[`logic_${logicId}`] || null;
    }

    public getAuthoritativeLogic(type: string, id: string): (any & { provenance?: Provenance }) | null {
        const category = type.toLowerCase() === 'npc' ? 'npc' : type.toLowerCase() === 'item' ? 'item' : 'other';
        const classFindings = this.cacheMapping[category];
        if (!classFindings) return null;

        const match = classFindings.find(f => f.context.includes(` ${id}`) || f.context.includes(`ID: ${id}`));
        if (!match) return null;

        const provenance = ServerLogicRegistry.getCanonicalProvenance(
            type.toUpperCase() as any,
            id
        );

        return { ...match, provenance };
    }

    /**
     * getState - Return the full manifest (required for diagnostic tests).
     */
    public getState(): GroundingManifest {
        return this.manifest;
    }

    public getManifest(): GroundingManifest {
        return this.manifest;
    }

    public setManifest(manifest: GroundingManifest): void {
        this.manifest = manifest;
        logger.debug('Grounding Manifest injected.');
    }

    public getWorldTransform() {
        return SpatialTransform;
    }

    public resolveSpatialContext(entityId: string): { position: WorldCoord | null; regionId: string | null; collision: boolean; source: 'CACHE' | 'VISUAL' | 'MEMORY' } {
        const entry = this.getEntry(entityId);
        if (entry && entry.grounded.data && entry.grounded.data.spatial) {
            const { x, y, z } = entry.grounded.data.spatial;
            const pos = { x, y, z: z || 0 };
            const { regionId } = SpatialTransform.worldToRegion(pos);

            return {
                position: pos,
                regionId,
                collision: !!entry.grounded.data.collision,
                source: entry.grounded.authoritativeSource as any
            };
        }
        return { position: null, regionId: null, collision: false, source: 'MEMORY' };
    }

    public beginTick(): Map<string, any> {
        return new Map();
    }

    public async commitTick(tx: Map<string, any>): Promise<void> {
        if (tx.size === 0) return;
        
        for (const [id, data] of tx) {
            const existing = this.manifest.entities[id];
            
            // Elevate critical spatial/identity data for hot-path access
            const topId = data.id || existing?.id || id;
            const topCoord = data.coord || data.spatial || existing?.coord || null;

            if (existing) {
                this.manifest.entities[id] = {
                    ...existing,
                    id: topId,
                    coord: topCoord,
                    grounded: {
                        ...existing.grounded,
                        data: { ...existing.grounded.data, ...data },
                        timestamp: Date.now()
                    }
                };
            } else {
                const [type, entId] = id.split('_');
                const pedagogy = PedagogyForensicsLimb.getInstance();
                const provenance = pedagogy.buildProvenance(
                    id, 
                    ServerLogicRegistry.getCanonicalProvenance((type || 'OTHER').toUpperCase() as any, entId || '0')
                );

                this.manifest.entities[id] = {
                    id: topId,
                    coord: topCoord,
                    pedigree: 'D:/sovereign/memory/pedagogy/generated_logic.json',
                    authorityLevel: 'ABSOLUTE',
                    provenance,
                    grounded: {
                        data,
                        confidence: 1.0,
                        timestamp: Date.now(),
                        authoritativeSource: 'CACHE'
                    },
                    deltas: [{ path: '$', original: null, grounded: data, reason: 'Manifested via Godhead' }]
                } as any;
            }
        }
        await this.saveManifest();
    }

    public async applyWorldTransform(tx: Map<string, any>, coords: { x: number; y: number; z: number }): Promise<void> {
        const spatial = SpatialSovereigntyLimb.getInstance();
        await spatial.ensureMapsquare(coords.x, coords.y);
        tx.set('player_avatar', { spatial: coords });
    }

    public getEntityManifest(entityId: string): any {
        const entry = this.getEntry(entityId);
        if (entry) return entry.grounded.data;
        const [type, id] = entityId.split('_');
        return this.getAuthoritativeLogic(type ?? 'other', id ?? '0');
    }

    public async spawnEntity(tx: Map<string, any>, entityDef: any): Promise<void> {
        const id = entityDef.id || `entity_${Date.now()}`;
        if (entityDef.coord) {
            await SpatialSovereigntyLimb.getInstance().ensureMapsquare(entityDef.coord.x, entityDef.coord.y);
        }
        tx.set(id, entityDef);
    }

    public groundEntity(entity: { spatial: { x: number, y: number, z: number, plane: number } }): void {
        const spatial = SpatialSovereigntyLimb.getInstance();
        entity.spatial.z = spatial.getAltitude(entity.spatial.plane || 0, entity.spatial.x, entity.spatial.y);
    }

    private loadNpcSpawns(targetDir?: string) {
        if (this.npcsLoaded) return;
        try {
            // Phase 116: Check public/authentic_spawn_manifest.json for breakthrough tests
            const publicSpawns = join(process.cwd(), 'public', 'authentic_spawn_manifest.json');
            
            const spatialRoot = getAtlasSpatialPath();
            const base = targetDir ?? join(spatialRoot, 'npc_extract');
            const spawnsPath = join(base, 'npc_spawns.json');
            
            // Absolute fallback for global NPC truth
            const fallbackPath = join(spatialRoot, 'npc_extract', 'npc_spawns.json');
            const effectivePath = fs.existsSync(publicSpawns) ? publicSpawns : (fs.existsSync(spawnsPath) ? spawnsPath : fallbackPath);

            if (fs.existsSync(effectivePath)) {
                const data = fs.readFileSync(effectivePath, 'utf8');
                const parsed = JSON.parse(data);
                // Support both raw array and { entities: [...] } manifest formats
                this.npcSpawns = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.entities) ? parsed.entities : []);
                this.npcsLoaded = true;
                logger.debug({ count: this.npcSpawns.length, source: effectivePath }, 'NPC Spawns grounded via Breakthrough Manifest.');
            }
        } catch (err) {
            logger.warn('NPC Spawns database unavailable.');
        }
    }

    public async manifestNearbyEntities(chunkX: number, chunkZ: number): Promise<void> {
        this.loadNpcSpawns();
        const minX = chunkX << 6;
        const minZ = chunkZ << 6;
        const maxX = minX + 63;
        const maxZ = minZ + 63;

        const localSpawns = this.npcSpawns.filter(s => {
            const x = s.worldX ?? s.coord?.x;
            const z = s.worldZ ?? s.coord?.z ?? s.coord?.y;
            return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
        });
        if (localSpawns.length === 0) return;

        const tx = this.beginTick();
        const spatial = SpatialSovereigntyLimb.getInstance();

        for (const spawn of localSpawns) {
            const x = spawn.worldX ?? spawn.coord?.x;
            const z = spawn.worldZ ?? spawn.coord?.z ?? spawn.coord?.y;
            const plane = spawn.plane ?? spawn.coord?.plane ?? 0;
            const npcId = spawn.npcId ?? spawn.entityId;
            const npcName = spawn.npcName ?? spawn.title ?? `Entity ${npcId}`;

            const entId = `npc_${npcId}_${x}_${z}`;
            if (this.manifest.entities[entId]) continue;
            tx.set(entId, {
                id: entId,
                npcId: npcId,
                name: npcName,
                spatial: { x: x, y: z, z: spatial.getAltitude(plane, x, z), plane: plane },
                behavior: 'STATIC_FORENSIC'
            });
        }
        await this.commitTick(tx);
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        this.loadNpcSpawns();
        return {
            online: this.npcsLoaded,
            details: `World Architect: ${Object.keys(this.manifest.entities).length} entities grounded | NPCs: ${this.npcsLoaded ? 'LOADED' : 'UNAVAILABLE'}`
        };
    }
}
