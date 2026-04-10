import { Result, ok, err, DirectionalCollision } from '../../core/models.js';
import { JagexCacheReader } from '../../utils/JagexCacheReader.js';
import { getRSMVCachePath } from '../../utils/SovereignPathResolver.js';
import { createLogger } from '../../utils/logger.js';
import { ByteReader } from '../../utils/ByteReader.js';
import { getBlockedDirections } from '../../utils/DirectionalRegistry.js';
import fs from 'fs';

const logger = createLogger('WorldForensicsLimb');

export interface WorldObservation {
    x: number;
    z: number;
    plane: number;
    collision: number;
    objects: GameObjectInstance[];
}

export interface GameObjectInstance {
    id: number;
    type: number;
    rotation: number;
    worldX: number;
    worldZ: number;
    plane: number;
}

export interface ObjectDefinition {
    id: number;
    name: string;
    type: number;
    width: number;
    length: number;
    blocksMovement: boolean;
    blocksSight: boolean;
    maybe_allows_lineofsight?: boolean;
    maybe_blocks_movement?: boolean;
    varbitId?: number;
    varpId?: number;
    transforms?: number[];
    defaultTransformId?: number;
}

/**
 * WorldForensicsLimb - The "SENSORY" substrate for real-time world observation.
 */
export class WorldForensicsLimb {
    private cache: JagexCacheReader | null = null;
    private readonly cachePath: string;
    private locationsCache: Map<number, GameObjectInstance[]> = new Map();
    private objectDefs: Map<number, ObjectDefinition> = new Map();

    constructor() {
        this.cachePath = getRSMVCachePath();
    }

    public async initialize(): Promise<Result<void>> {
        try {
            logger.info({ path: this.cachePath }, 'Initializing Multi-Archive World Observation substrate...');
            this.cache = new JagexCacheReader(this.cachePath);
            return ok(undefined);
        } catch (error) {
            logger.error({ error }, 'Failed to initialize WorldForensicsLimb.');
            return err(error as Error);
        }
    }

    /**
     * senseLocalArea - Returns a detailed world-state for a local 64x64 grid.
     */
    public async senseLocalArea(x: number, z: number, plane: number): Promise<Result<WorldObservation[]>> {
        const mapsquareX = x >> 6;
        const mapsquareZ = z >> 6;
        
        const observations: WorldObservation[] = [];
        const grid: number[][][] = Array.from({ length: 4 }, () => 
            Array.from({ length: 64 }, () => new Array(64).fill(0))
        );

        // --- PHASE 43.8: JSON-FIRST SOVEREIGNTY ---
        const jsonPath = `D:\\sovereign\\atlas\\spatial\\world_extract\\ms_${mapsquareX}_${mapsquareZ}.json`;
        
        try {
            if (fs.existsSync(jsonPath)) {
                const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

                // Schema A: tileFlags array (SovereignWorldExtract output)
                if (data.tileFlags && Array.isArray(data.tileFlags)) {
                    for (const tile of data.tileFlags) {
                        if (tile && tile.plane < 4 && tile.x < 64 && tile.z < 64) {
                            // NXT flags: bit 1 (0x02) = blocking. NOT bit 0 (0x01 = visible).
                            grid[tile.plane][tile.x][tile.z] = (tile.collision & 0x02) !== 0 ? 1 : 0;
                        }
                    }
                }

                // Schema B: collision_matrix keyed by "x_z" (public heatmap output)
                if (data.collision_matrix) {
                    for (const [key, val] of Object.entries(data.collision_matrix)) {
                        const cm = val as any;
                        if (cm && cm.sourceFlags !== undefined) {
                            const parts = key.split('_').map(Number);
                            const tx = parts.length === 3 ? parts[1] - (mapsquareX << 6) : parts[0] - (mapsquareX << 6);
                            const tz = parts.length === 3 ? parts[2] - (mapsquareZ << 6) : parts[1] - (mapsquareZ << 6);
                            const tp = parts.length === 3 ? parts[0] : 0;
                            if (tp < 4 && tx >= 0 && tx < 64 && tz >= 0 && tz < 64) {
                                // NXT sourceFlags: bit 1 (0x02) = blocking
                                grid[tp][tx][tz] = (cm.sourceFlags & 0x02) !== 0 ? 1 : 0;
                            }
                        }
                    }
                }

                // Schema C: tiles array (legacy format)
                if (data.tiles && Array.isArray(data.tiles)) {
                    for (const tile of data.tiles) {
                        if (tile && tile.plane < 4 && tile.x < 64 && tile.z < 64) {
                            grid[tile.plane][tile.x][tile.z] = (tile.collision & 0x02) !== 0 ? 1 : 0;
                        }
                    }
                }

                for (let curX = 0; curX < 64; curX++) {
                    for (let curZ = 0; curZ < 64; curZ++) {
                        const worldX = (mapsquareX << 6) + curX;
                        const worldZ = (mapsquareZ << 6) + curZ;
                        observations.push({
                            x: worldX,
                            z: worldZ,
                            plane: plane,
                            collision: grid[plane][curX][curZ],
                            objects: []
                        });
                    }
                }
                return ok(observations);
            }
        } catch (e) {
            console.log(`[WorldForensicsLimb] JSON Truth error for [${mapsquareX},${mapsquareZ}]:`, e);
        }

        // --- CACHE FALLBACK: NXT Format (mapsquare_tiles_nxt.jsonc) ---
        // Per mapsquare_tiles_nxt.jsonc from Kbro1989/rsmv:
        //   4 levels × 4356 (66×66) tiles, each tile = struct {
        //     flags: ubyte   → bit0=visible/has_rest, bit1=blocking(0x02), bit2=bridge, bit3=roofed, bit4=water
        //     height: ushort (buildnr >= 936)
        //     rest: [conditional on flags bit 0] {
        //       waterheight: ushort (if flags & 0x10)
        //       underlay: ushort
        //       overlay: ushort
        //       shape: ubyte
        //     }
        //   }
        if (!this.cache) return err(new Error('Limb not initialized'));
        const fileId = (mapsquareX << 8) | mapsquareZ;
        const terrain = this.cache.readSubEntry(5, fileId, 3); 
        
        if (!terrain) {
            return err(new Error(`Mapsquare terrain data missing for [${mapsquareX}, ${mapsquareZ}] (Sub 3 ID: ${fileId})`));
        }

        const reader = new ByteReader(terrain);

        // NXT header: "JAGX\x01" (4 bytes magic + 1 byte version) for buildnr >= 936
        if (terrain.length > 5 && terrain.slice(0, 4).toString() === 'JAGX') {
            reader.skip(5); // Skip magic (4) + version (1)
        }

        // 4 levels: level0, level1, level2, level3
        for (let level = 0; level < 4; level++) {
            // 4356 tiles per level (66 × 66 = padded mapsquare)
            for (let i = 0; i < 4356; i++) {
                if (!reader.hasRemaining()) break;

                const flags = reader.readU8();
                const height = reader.readU16(); // ushort for buildnr >= 936

                // "rest" data: present when flags bit 0 is set
                if (flags & 0x01) {
                    // waterheight: present when flags bit 4 (0x10) is set
                    if (flags & 0x10) {
                        reader.readU16(); // waterheight (ushort for buildnr >= 936)
                    }
                    reader.readU16(); // underlay (ushort for buildnr >= 936)
                    reader.readU16(); // overlay (ushort for buildnr >= 936)
                    reader.readU8();  // shape (ubyte)
                }

                // Map padded 66×66 index to (tx, tz) coordinates
                const tx = Math.floor(i / 66); // column within the 66-wide row
                const tz = i % 66;             // row position

                // Core playable tiles are at padded indices [1..64].
                // Index 0 and 65 are neighbor-bleed padding.
                if (tx >= 1 && tx <= 64 && tz >= 1 && tz <= 64) {
                    const coreX = tx - 1; // 0-63 in world-local space
                    const coreZ = tz - 1; // 0-63 in world-local space

                    // NXT Blocking: bit 1 (0x02) is the authoritative blocking flag
                    grid[level][coreX][coreZ] = (flags & 0x02) !== 0 ? 1 : 0;

                    if (level === plane) {
                        const worldX = (mapsquareX << 6) + coreX;
                        const worldZ = (mapsquareZ << 6) + coreZ;
                        observations.push({
                            x: worldX,
                            z: worldZ,
                            plane: level,
                            collision: grid[level][coreX][coreZ],
                            objects: []
                        });
                    }
                }
            }
        }

        return ok(observations);
    }

    /**
     * getTerrainFlags - Specific tile terrain query.
     */
    public async getTerrainFlags(x: number, z: number, plane: number): Promise<number> {
        const res = await this.senseLocalArea(x, z, plane);
        if (!res.ok) return 0;
        const obs = res.value.find(o => o.x === x && o.z === z);
        return obs ? obs.collision : 0;
    }

    /**
     * senseLocations - Extracts game objects from Archive 5, Sub 0.
     */
    public async senseLocations(mapsquareX: number, mapsquareZ: number, plane: number): Promise<Result<GameObjectInstance[]>> {
        if (!this.cache) return err(new Error('Limb not initialized'));
        const mapsquareId = (mapsquareX << 8) | mapsquareZ;
        
        if (this.locationsCache.has(mapsquareId)) {
            return ok(this.locationsCache.get(mapsquareId)!.filter(l => l.plane === plane));
        }

        const buffer = this.cache.readSubEntry(5, mapsquareId, 0); // Sub 0 = Locations
        if (!buffer || buffer.length === 0) return ok([]);

        const reader = new ByteReader(buffer);
        const instances: GameObjectInstance[] = [];
        let objectId = -1;

        while (reader.hasRemaining()) {
            const idDelta = reader.readTailedVarUShort();
            if (idDelta === 0) break;
            objectId += idDelta;

            let locationData = 0;
            while (reader.hasRemaining()) {
                const locationDelta = reader.readVarUShort();
                if (locationDelta === 0) break;
                locationData += locationDelta - 1;

                const attributes = reader.readU8();
                const type = attributes >> 2;
                const rotation = attributes & 0x3;
                const hasExtra = attributes & 0x80;
                
                const curPlane = (locationData >> 12) & 0x3;
                const localX = (locationData >> 6) & 0x3F;
                const localZ = locationData & 0x3F;

                if (hasExtra) {
                    const flags = reader.readU8();
                    if (flags & 0x01) reader.skip(8); // Custom rotation (4 shorts)
                    if (flags & 0x02) reader.skip(2); // TranslateX
                    if (flags & 0x04) reader.skip(2); // TranslateY
                    if (flags & 0x08) reader.skip(2); // TranslateZ
                    if (flags & 0x10) reader.skip(2); // Scale (unsigned short)
                    if (flags & 0x20) reader.skip(2); // ScaleX
                    if (flags & 0x40) reader.skip(2); // ScaleY
                    if (flags & 0x80) reader.skip(2); // ScaleZ
                }

                instances.push({
                    id: objectId,
                    type,
                    rotation,
                    worldX: (mapsquareX << 6) + localX,
                    worldZ: (mapsquareZ << 6) + localZ,
                    plane: curPlane
                });
            }
        }

        this.locationsCache.set(mapsquareId, instances);
        return ok(instances.filter(l => l.plane === plane));
    }

    /**
     * getObjectsAt - Specific tile location query with metadata.
     */
    public async getObjectsAt(x: number, z: number, plane: number): Promise<Array<{ id: number; name: string; type: number }>> {
        const mx = x >> 6;
        const mz = z >> 6;
        const res = await this.senseLocations(mx, mz, plane);
        if (!res.ok) return [];

        const matches = res.value.filter(l => l.worldX === x && l.worldZ === z);
        const results = [];
        for (const m of matches) {
            const def = await this.getObjectDefinition(m.id);
            results.push({ id: m.id, name: def.name, type: m.type });
        }
        return results;
    }

    /**
     * getObjectDefinition - Parses Archive 16 for object metadata using opcodes.
     */
    public async getObjectDefinition(id: number): Promise<ObjectDefinition> {
        if (!this.cache) throw new Error('Limb not initialized');
        if (this.objectDefs.has(id)) return this.objectDefs.get(id)!;

        const def: ObjectDefinition = {
            id,
            name: 'Object',
            type: 10, // Default solid
            width: 1,
            length: 1,
            blocksMovement: true,
            blocksSight: false
        };

        const entry = this.cache.readEntry(16, id);
        if (!entry || !entry.decompressed) return def;

        const reader = new ByteReader(entry.decompressed);
        while (reader.hasRemaining()) {
            const opcode = reader.readU8();
            if (opcode === 0) break;

            switch (opcode) {
                case 1: reader.readU8(); break;
                case 2: def.name = "parsed_object"; break; 
                case 14: def.width = reader.readU8(); break;
                case 15: def.length = reader.readU8(); break;
                case 17: def.blocksMovement = false; break;
                case 18: def.blocksMovement = false; break;
                case 19: reader.readU8(); break;
                case 27: def.type = 1; break;
                case 24: reader.readU16(); break;
                case 28: reader.readU8(); break;
                case 60: reader.readU16(); break;
                case 77: { // Varbit Transformation
                    def.varbitId = reader.readU16();
                    if (def.varbitId === 0xFFFF) def.varbitId = -1;
                    def.varpId = reader.readU16();
                    if (def.varpId === 0xFFFF) def.varpId = -1;
                    def.defaultTransformId = reader.readU16();
                    if (def.defaultTransformId === 0xFFFF) def.defaultTransformId = -1;
                    const count = reader.readU8();
                    def.transforms = [];
                    for (let i = 0; i <= count; i++) {
                        const tid = reader.readU16();
                        def.transforms.push(tid === 0xFFFF ? -1 : tid);
                    }
                    break;
                }
                case 92: { // Varp Transformation (Alternative)
                    def.varbitId = reader.readU16();
                    if (def.varbitId === 0xFFFF) def.varbitId = -1;
                    def.varpId = reader.readU16();
                    if (def.varpId === 0xFFFF) def.varpId = -1;
                    def.defaultTransformId = reader.readU16();
                    if (def.defaultTransformId === 0xFFFF) def.defaultTransformId = -1;
                    const count = reader.readU8();
                    def.transforms = [];
                    for (let i = 0; i <= count; i++) {
                        const tid = reader.readU16();
                        def.transforms.push(tid === 0xFFFF ? -1 : tid);
                    }
                    break;
                }
                case 163: reader.readU8(); reader.readU8(); reader.readU8(); reader.readU8(); break;
                default: break;
            }
        }

        this.objectDefs.set(id, def);
        return def;
    }

    /**
     * buildDirectionalMask - Merges terrain and object data into a quaternary mask.
     */
    public async buildDirectionalMask(x: number, z: number, plane: number): Promise<Result<DirectionalCollision>> {
        const mx = x >> 6;
        const mz = z >> 6;
        
        const observationsRes = await this.senseLocalArea(x, z, plane);
        if (!observationsRes.ok) return err(observationsRes.error || new Error('Unknown error'));

        const obs = observationsRes.value.find(o => o.x === x && o.z === z);
        const mask: DirectionalCollision = {
            north: true, east: true, south: true, west: true,
            npc_only_blocks: []
        };

        // Terrain blocking
        if (obs && (obs.collision & 0x1)) {
            mask.north = mask.east = mask.south = mask.west = false;
            return ok(mask);
        }

        // Object blocking
        const locsRes = await this.senseLocations(mx, mz, plane);
        if (locsRes.ok && locsRes.value) {
            const tileObjects = locsRes.value.filter(l => l.worldX === x && l.worldZ === z);
            for (const obj of tileObjects) {
                const def = await this.getObjectDefinition(obj.id);
                if (!def.blocksMovement) continue;

                const blocked = getBlockedDirections(obj.type, obj.rotation, def.width);
                for (const dir of blocked) {
                    (mask as any)[dir] = false;
                }
            }
        }

        return ok(mask);
    }

    public close(): void {
        this.cache?.close();
    }

    public getCache(): JagexCacheReader | null {
        return this.cache;
    }
}
