import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../../utils/logger.js';
import type { GroundingManifest, GroundingEntry, GroundingHydrator } from '../../core/grounding.js';
import type { Result, Provenance } from '../../core/models.js';
import { ServerLogicRegistry } from '../../engines/gameplay/ServerLogicRegistry.js';
import { PedagogyForensicsLimb } from '../pedagogy/PedagogyForensicsLimb.js';
import { SpatialTransform } from '../../core/WorldTransform.js';
import { SpatialSovereigntyLimb } from '../spatial/SpatialSovereigntyLimb.js';
import * as fs from 'fs';


import type { WorldCoord, Region, ScreenCoord } from '../../core/WorldTransform.js';

const logger = createLogger('WorldGroundingLimb');

/**
 * WorldGroundingLimb â€” The Sovereign Resolution Layer.
 * 
 * Implements Option C: Manifest-based grounding. Bridges pedagogical vibes 
 * from D:/sovereign/memory/pedagogy with cache-authoritative truth.
 */
export class WorldGroundingLimb implements GroundingHydrator {
    private static instance: WorldGroundingLimb | undefined;
    private manifest: GroundingManifest;
    private readonly manifestPath: string;
    private cacheMapping: Record<string, any[]> = {};
    
    private lastSaveTime: number = Date.now();
    private readonly SAVE_INTERVAL = 300000; // 5 Minutes (RSC Style)
    private tickStaging: Map<string, any> = new Map();
    private npcSpawns: any[] = [];
    private npcsLoaded: boolean = false;


    protected constructor(substratePath: string = 'D:/sovereign') {
        if (WorldGroundingLimb.instance) {
            throw new Error('Singleton violation: use WorldGroundingLimb.getInstance()');
        }
        this.manifestPath = join(substratePath, 'memory', 'grounding_manifest.json');
        this.manifest = this.loadManifest();
        this.loadCacheMapping();

        // Initialize Auto-Save Loop
        setInterval(() => this.autoSave(), 60000); // Check every minute
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


    public static getInstance(): WorldGroundingLimb {
        if (!this.instance) {
            this.instance = new WorldGroundingLimb();
        }
        return this.instance;
    }

    public static resetInstance(): void {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('resetInstance is forbidden in production');
        }
        this.instance = undefined;
    }

    /**
     * reset - Clear staging and reload manifest.
     */
    public reset(): void {
        this.tickStaging.clear();
        this.manifest = this.loadManifest();
        logger.info('Grounding Kernel reset.');
    }

    private loadCacheMapping() {
        try {
            const mappingPath = 'D:/sovereign/atlas/system/cache_logic_mapping.json';
            if (existsSync(mappingPath)) {
                const data = readFileSync(mappingPath, 'utf8');
                this.cacheMapping = JSON.parse(data);
                logger.debug({ nodes: Object.values(this.cacheMapping).flat().length }, 'Authoritative Cache Mapping loaded into Grounding Limb.');
            }
        } catch (err) {
            logger.warn('Authoritative Cache Mapping unavailable for grounding fallback.');
        }
    }

    /**
     * Load the grounding manifest from disk.
     */
    private loadManifest(): GroundingManifest {
        try {
            if (existsSync(this.manifestPath)) {
                const data = readFileSync(this.manifestPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (err) {
            logger.error({ err }, 'Failed to load grounding manifest. Falling back to empty.');
        }

        return {
            version: '1.0.0',
            project: 'pog2-sovereign',
            entities: {}
        };
    }

    /**
     * Save the manifest back to disk.
     */
    private async saveManifest(): Promise<void> {
        try {
            const data = JSON.stringify(this.manifest, null, 2);
            writeFileSync(this.manifestPath, data, 'utf8');
        } catch (err) {
            logger.error({ err }, 'Failed to save grounding manifest.');
            throw err;
        }
    }

    /**
     * Hydrate a pedagogical object with grounded truth.
     * 
     * @param entityId The unique identifier for the entity (e.g., "npc_3141")
     * @param pedagogy The original synthesized data from POG2
     * @returns The "Up-Leveled" data merged with cache truth
     */
    public hydrate<T>(entityId: string, pedagogy: T): T {
        const entry = this.manifest.entities[entityId];
        if (!entry) {
            // Check for Authoritative Cache Fallback
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

            return pedagogy; // Fallback to "Vibe"
        }

        logger.debug({ entityId, confidence: entry.grounded.confidence }, 'Hydrating pedagogical entity with grounded truth');

        // Merging logic: The grounded data takes precedence
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

    /**
     * Record a new grounding decision.
     */
    public async record(entityId: string, entry: GroundingEntry): Promise<void> {
        logger.info({ entityId, deltas: entry.deltas.length }, 'Recording new grounding entry');
        
        this.manifest.entities[entityId] = entry;
        await this.saveManifest();
    }

    /**
     * Get a specific grounding entry by ID.
     */
    public getEntry(entityId: string): GroundingEntry | null {
        return this.manifest.entities[entityId] || null;
    }

    /**
     * Get authoritative logic finding from the cache mapping.
     * Enhanced to provide clinical provenance.
     */
    public getAuthoritativeLogic(type: string, id: string): (any & { provenance?: Provenance }) | null {
        const category = type.toLowerCase() === 'npc' ? 'npc' : type.toLowerCase() === 'item' ? 'item' : 'other';
        const classFindings = this.cacheMapping[category];
        
        if (!classFindings) return null;

        const match = classFindings.find(f => f.context.includes(` ${id}`) || f.context.includes(`ID: ${id}`));
        if (!match) return null;

        // Attach Canonical Provenance
        const provenance = ServerLogicRegistry.getCanonicalProvenance(
            type.toUpperCase() as 'NPC' | 'ITEM' | 'OBJECT' | 'SCENE',
            id
        );

        return { ...match, provenance };
    }


    /**
     * Return the full manifest (for auditing).
     */
    public getManifest(): GroundingManifest {
        return this.manifest;
    }

    /**
     * setManifest - Direct injection for testing/manual override.
     */
    public setManifest(manifest: GroundingManifest): void {
        this.manifest = manifest;
        logger.debug('Grounding Manifest injected/overridden.');
    }

    /**
     * Hook 1: Returns the canonical coordinate contract layer.
     */
    public getWorldTransform() {
        return SpatialTransform;
    }

    /**
     * Hook 2: Fetch spatial layout of a region
     */
    public getSpatialTruth(regionId: string): any {
        return this.manifest.entities[`region_${regionId}`] || null;
    }

    /**
     * Hook 3: Fetch Systemic Logic (Hexagrams, Triggers, Travel Graphs)
     */
    public getSystemicLogic(logicId: string): any {
        return this.manifest.entities[`logic_${logicId}`] || null;
    }

    /**
     * Hook 4: Centralized Coordinate Resolution
     */
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
                source: entry.grounded.authoritativeSource as 'CACHE' | 'VISUAL' | 'MEMORY'
            };
        }

        // Check Cache Authority Fallback
        const [type, id] = entityId.split('_');
        const cacheMatch = this.getAuthoritativeLogic(type, id);
        if (cacheMatch) {
            return { position: null, regionId: null, collision: false, source: 'CACHE' };
        }

        return { position: null, regionId: null, collision: false, source: 'MEMORY' };
    }

    /**
     * beginTick - Start an atomic transaction boundary.
     */
    public beginTick(): Map<string, any> {
        return new Map();
    }

    /**
     * commitTick - Atomically publish staged changes to the live manifest.
     */
    public async commitTick(tx: Map<string, any>): Promise<void> {
        if (tx.size === 0) return;
        
        logger.debug({ updates: tx.size }, 'Committing atomic tick transaction...');
        for (const [id, data] of tx) {
            const existing = this.manifest.entities[id];
            if (existing) {
                // Functional Update
                const updatedGrounded = {
                    ...existing.grounded,
                    data: { ...existing.grounded.data, ...data },
                    timestamp: Date.now()
                };
                
                this.manifest.entities[id] = {
                    ...existing,
                    grounded: updatedGrounded,
                    provenance: data.provenance || existing.provenance || ServerLogicRegistry.getCanonicalProvenance(
                        id.split('_')[0].toUpperCase() as any,
                        id.split('_')[1]
                    )
                };
            } else {
                // New entity creation
                const [type, entId] = id.split('_');
                const substrateProv = ServerLogicRegistry.getCanonicalProvenance(
                    (type || 'OTHER').toUpperCase() as any,
                    entId || '0'
                );

                // Build enriched provenance (Cache -> Pedagogy)
                const provenance = PedagogyForensicsLimb.getInstance().buildProvenance(id, substrateProv);

                this.manifest.entities[id] = {
                    pedigree: 'D:/sovereign/memory/pedagogy/generated_logic.json',
                    authorityLevel: 'ABSOLUTE',
                    provenance,
                    grounded: {
                        data,
                        confidence: 1.0,
                        timestamp: Date.now(),
                        authoritativeSource: 'CACHE'
                    },

                    deltas: [{
                        path: '$',
                        original: null,
                        grounded: data,
                        reason: 'Manifested via Godhead Kernel Volley'
                    }]
                };
            }

        }
        await this.saveManifest();
    }

    /**
     * applyWorldTransform - Stage a spatial shift within a transaction.
     */
    public async applyWorldTransform(tx: Map<string, any>, coords: { x: number; y: number; z: number }): Promise<void> {
        // Phase 38: Ensure spatial substrate is loaded for this coordinate
        const spatial = SpatialSovereigntyLimb.getInstance();
        await spatial.ensureMapsquare(coords.x, coords.y);
        
        tx.set('player_avatar', { spatial: coords });
    }

    /**
     * getEntityManifest - Retrieve definition from cache mapping or manifest.
     */
    public getEntityManifest(entityId: string): any {
        const entry = this.getEntry(entityId);
        if (entry) return entry.grounded.data;
        
        const [type, id] = entityId.split('_');
        return this.getAuthoritativeLogic(type ?? 'other', id ?? '0');
    }

    /**
     * spawnEntity - Stage an entity manifestation within a transaction.
     */
    public async spawnEntity(tx: Map<string, any>, entityDef: any): Promise<void> {
        const id = entityDef.id || `entity_${Date.now()}`;
        
        // Phase 38: Ensure spatial substrate is loaded for spawn point
        if (entityDef.coord) {
            const spatial = SpatialSovereigntyLimb.getInstance();
            await spatial.ensureMapsquare(entityDef.coord.x, entityDef.coord.y);
        }

        tx.set(id, entityDef);
    }

    /**
     * groundEntity - Aligns an entity's altitude with the forensic heightmap.
     */
    public groundEntity(entity: { spatial: { x: number, y: number, z: number, plane: number } }): void {
        const spatial = SpatialSovereigntyLimb.getInstance();
        const altitude = spatial.getAltitude(
            entity.spatial.plane || 0,
            entity.spatial.x,
            entity.spatial.y // Source Y is Game Z (North)
        );
        entity.spatial.z = altitude; // In POG2, Z is often Up (Renderer dependent)
        logger.debug({ id: (entity as any).id, altitude }, 'Forensic Grounding Applied.');
    }

    /**
     * loadNpcSpawns - Hydrates the authoritative manifestation database.
     */
    private loadNpcSpawns() {
        if (this.npcsLoaded) return;
        try {
            const spawnsPath = 'D:/sovereign/atlas/spatial/npc_extract/npc_spawns.json';
            if (fs.existsSync(spawnsPath)) {
                const data = fs.readFileSync(spawnsPath, 'utf8');
                this.npcSpawns = JSON.parse(data);
                this.npcsLoaded = true;
                logger.info({ count: this.npcSpawns.length }, 'NPC Spawns Hydrated.');
            }
        } catch (err) {
            logger.warn('NPC Spawns database unavailable.');
        }
    }

    /**
     * manifestNearbyEntities - Populates the world with authoritative NPCs.
     */
    public async manifestNearbyEntities(chunkX: number, chunkZ: number): Promise<void> {
        this.loadNpcSpawns();
        const minX = chunkX << 6;
        const minZ = chunkZ << 6;
        const maxX = minX + 63;
        const maxZ = minZ + 63;

        const localSpawns = this.npcSpawns.filter(s => 
            s.worldX >= minX && s.worldX <= maxX &&
            s.worldZ >= minZ && s.worldZ <= maxZ
        );

        if (localSpawns.length === 0) return;

        logger.info({ chunkX, chunkZ, count: localSpawns.length }, 'Manifesting Local RS NPCs...');
        
        const tx = this.beginTick();
        const spatial = SpatialSovereigntyLimb.getInstance();

        for (const spawn of localSpawns) {
            const entId = `npc_${spawn.npcId}_${spawn.worldX}_${spawn.worldZ}`;
            if (this.manifest.entities[entId]) continue;

            const altitude = spatial.getAltitude(spawn.plane, spawn.worldX, spawn.worldZ);
            
            tx.set(entId, {
                id: entId,
                npcId: spawn.npcId,
                name: spawn.npcName,
                spatial: {
                    x: spawn.worldX,
                    y: spawn.worldZ, // Internal Y is North
                    z: altitude,      // Internal Z is Up
                    plane: spawn.plane
                },
                behavior: 'STATIC_FORENSIC'
            });
        }

        await this.commitTick(tx);
    }

    /**
     * healthCheck - Clinical audit probe.
     */
    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        this.loadNpcSpawns();
        const entityCount = Object.keys(this.manifest.entities).length;
        const online = this.npcsLoaded;
        return {
            online,
            details: `World Architect: ${entityCount} entities grounded | NPCs: ${this.npcsLoaded ? 'LOADED' : 'UNAVAILABLE'}`
        };
    }
}
