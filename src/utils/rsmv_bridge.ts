/**
 * rsmv BRIDGE â€” ESM Subprocess Bridge
 * 
 * Called as a subprocess by CacheForensicsLimb, TopologyLimb, and KinematicsLimb.
 * Bridges the ESM/CommonJS boundary by running inside tsx (full ESM support)
 * and returning JSON to stdout.
 * 
 * Usage (called internally by rsmvBridge.ts):
 *   npx tsx src/utils/rsmv_bridge.ts <operation> <arg1> [arg2]
 * 
 * Operations:
 *   item <id>          â†’ full item definition
 *   npc <id>           â†’ full NPC definition  
 *   object <id>        â†’ full object definition (with actions, params, models)
 *   model <id>         â†’ topology profile (vertex/tri/bone counts)
 *   sequence <id>      â†’ kinematic sequence profile
 *   health             â†’ cache connectivity test
 */

import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync } from 'fs';
import { getrsmvCachePath } from './SovereignPathResolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// â”€â”€ Substrate Discovery Logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function findrsmvSubstrate(): string {
    // 1. Operational External Substrate (Verified Working)
    const externalPath = getrsmvSubstratePath();
    if (existsSync(externalPath)) return externalPath;

    // 2. Local Workspace Fallback
    const localWorkspace = resolve(__dirname, '..', '..', 'rsmv_inspector');
    if (existsSync(localWorkspace)) return localWorkspace;

    return externalPath;
}

const rsmv_PATH = findrsmvSubstrate();
const CACHE_PATH = getrsmvCachePath();

const subFolder = existsSync(join(rsmv_PATH, 'src')) ? 'src' : '';

async function loadrsmv() {
    // Check for source files in detected path
    const sqlitePath = pathToFileURL(join(rsmv_PATH, subFolder, 'cache', 'sqlite.ts')).href;
    const opdecoderPath = pathToFileURL(join(rsmv_PATH, subFolder, 'opdecoder.ts')).href;
    const constantsPath = pathToFileURL(join(rsmv_PATH, subFolder, 'constants.ts')).href;

    try {
        if (!existsSync(join(rsmv_PATH, subFolder, 'cache', 'sqlite.ts'))) {
            throw new Error(`rsmv Substrate not found at ${rsmv_PATH}`);
        }
        const { GameCacheLoader } = await import(sqlitePath);
        const { parse } = await import(opdecoderPath);
        const { cacheMajors, cacheConfigPages, cacheMapFiles } = await import(constantsPath);

        return { GameCacheLoader, parse, cacheMajors, cacheConfigPages, cacheMapFiles };
    } catch (e: any) {
        console.error(`rsmvBridge import failed: ${e.message}`);
        return null;
    }
}

async function getCacheLoader() {
    const mods = await loadrsmv();
    if (!mods) return null;
    try {
        const loader = new mods.GameCacheLoader(CACHE_PATH);
        loader.buildnr = 940;
        return { loader, parse: mods.parse, cacheMajors: mods.cacheMajors, cacheConfigPages: mods.cacheConfigPages, cacheMapFiles: mods.cacheMapFiles };
    } catch {
        return null;
    }
}

const [, , operation, ...args] = process.argv;

async function main() {
    if (operation === 'health') {
        const cs = await getCacheLoader();
        if (!cs) {
            console.log(JSON.stringify({ online: false, reason: 'GameCacheLoader unavailable' }));
            process.exit(0);
        }
        try {
            // Try reading a known object to confirm cache is live
            const buf = await cs.loader.getFileById(cs.cacheMajors.objects || 16, 1);

            // Check for Authoritative Master Index (255)
            const rootIndexExists = cs.loader.opentables.has(255);
            const status = rootIndexExists ? 'ONLINE (Authoritative)' : 'ONLINE (Standalone)';

            console.log(JSON.stringify({
                online: !!buf,
                status,
                substrate: 'NXT_JCACHE',
                cacheVersion: cs.loader.buildnr
            }));
        } catch (e: any) {
            console.log(JSON.stringify({ online: false, reason: e.message }));
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'object') {
        const id = parseInt(args[0]);
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const MAJOR = cs.cacheMajors.objects || 16;
            const ARCH_SIZE = 256;
            const archiveId = Math.floor(id / ARCH_SIZE);
            const fileId = id % ARCH_SIZE;
            const archive = await cs.loader.getArchiveById(MAJOR, archiveId);
            const file = archive.find((f: any) => f.fileid === fileId);
            if (!file) { console.log(JSON.stringify({ error: `Object ${id} not found` })); process.exit(1); }
            const raw = cs.parse.object.read(file.buffer, cs.loader);
            console.log(JSON.stringify({
                id,
                name: raw.name ?? `OBJECTS ${id}`,
                actions: [raw.actions_0, raw.actions_1, raw.actions_2, raw.actions_3, raw.actions_4].filter(Boolean),
                members_action_1: raw.members_action_1,
                members_action_2: raw.members_action_2,
                models: raw.models,
                params: raw.params,
                dummy_45: raw.dummy_45,
                mapscene: raw.mapscene,
                sizeX: raw.width,
                sizeZ: raw.length,
                maybe_blocks_movement: raw.maybe_blocks_movement,
                probably_nocollision: raw.probably_nocollision,
                raw
            }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'npc') {
        const id = parseInt(args[0]);
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const MAJOR = cs.cacheMajors.npcs || 18;
            const ARCH_SIZE = 128;
            const archiveId = Math.floor(id / ARCH_SIZE);
            const fileId = id % ARCH_SIZE;
            const archive = await cs.loader.getArchiveById(MAJOR, archiveId);
            const file = archive.find((f: any) => f.fileid === fileId);
            if (!file) { console.log(JSON.stringify({ error: `NPC ${id} not found` })); process.exit(1); }
            const raw = cs.parse.npc.read(file.buffer, cs.loader);
            console.log(JSON.stringify({
                id,
                name: raw.name ?? `NPCS ${id}`,
                combatLevel: raw.combat ?? null,
                models: raw.models ?? [],
                headModels: raw.headModels ?? [],
                actions: [raw.actions_0, raw.actions_1, raw.actions_2, raw.actions_3, raw.actions_4].filter(Boolean),
                boundSize: raw.boundSize ?? null,
                walkRange: raw.walkRange ?? null,
                movementType: raw.movementType ?? null,
                raw
            }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'item') {
        const id = parseInt(args[0]);
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const MAJOR = cs.cacheMajors.items || 19;
            const ARCH_SIZE = 256;
            const archiveId = Math.floor(id / ARCH_SIZE);
            const fileId = id % ARCH_SIZE;
            const archive = await cs.loader.getArchiveById(MAJOR, archiveId);
            const file = archive.find((f: any) => f.fileid === fileId);
            if (!file) { console.log(JSON.stringify({ error: `Item ${id} not found` })); process.exit(1); }
            const raw = cs.parse.item.read(file.buffer, cs.loader);
            console.log(JSON.stringify({
                id,
                name: raw.name ?? `ITEMS ${id}`,
                isEquippable: raw.equipSlotId !== undefined,
                equipSlotId: raw.equipSlotId ?? null,
                isMember: !!raw.members,
                maleModels: [raw.maleModels_0?.id ?? null, raw.maleModels_1 ?? null, raw.maleModels_2 ?? null],
                femaleModels: [raw.femaleModels_0?.id ?? null, raw.femaleModels_1 ?? null, raw.femaleModels_2 ?? null],
                actions: [raw.widget_actions_0, raw.widget_actions_1, raw.widget_actions_2, raw.widget_actions_3, raw.widget_actions_4].filter(Boolean),
                raw
            }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'model') {
        const id = parseInt(args[0]);
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const buffer = await cs.loader.getFileById(cs.cacheMajors.models || 47, id);
            if (!buffer) { console.log(JSON.stringify({ error: `Model ${id} not found` })); process.exit(1); }

            // Try parseOb3Model from rsmv
            let modelData: any = null;
            try {
                const rt7Path = pathToFileURL(join(rsmv_PATH, subFolder, '3d', existsSync(join(rsmv_PATH, subFolder, '3d', 'rt7model.ts')) ? 'rt7model.ts' : 'rt7model.js')).href;
                const { parseOb3Model } = await import(rt7Path);
                modelData = parseOb3Model(buffer, cs.loader);
            } catch (err) {
                console.error('Failed to parse model:', err);
            }

            if (modelData) {
                let vertexCount = 0, triangleCount = 0;
                const materials = new Set<number>();
                for (const mesh of (modelData.meshes || [])) {
                    if (mesh.attributes?.pos) vertexCount += mesh.attributes.pos.count;
                    if (mesh.indices) triangleCount += Math.floor(mesh.indices.count / 3);
                    if (mesh.materialId !== undefined) materials.add(mesh.materialId);
                }
                console.log(JSON.stringify({
                    modelId: id,
                    vertexCount,
                    triangleCount,
                    boneCount: modelData.bonecount || 0,
                    hasUVs: modelData.meshes?.some((m: any) => m.attributes?.texuvs) ?? false,
                    hasSkinning: modelData.meshes?.some((m: any) => m.attributes?.skinids || m.attributes?.boneids) ?? false,
                    materials: Array.from(materials),
                    miny: modelData.miny,
                    maxy: modelData.maxy
                }));
            } else {
                console.log(JSON.stringify({ modelId: id, vertexCount: 0, triangleCount: 0, boneCount: 0, hasUVs: false, hasSkinning: false, materials: [], error: 'parse_unavailable' }));
            }
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'sequence') {
        const id = parseInt(args[0]);
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const buffer = await cs.loader.getFileById(cs.cacheMajors.sequences || 25, id);
            if (!buffer) { console.log(JSON.stringify({ error: `Sequence ${id} not found` })); process.exit(1); }
            const sequence = cs.parse.sequences.read(buffer, cs.loader);
            const frameCount = sequence.frames?.length || 0;
            const isSkeletal = sequence.skeletal_animation !== undefined || sequence.skeletal_range !== undefined;
            let totalDuration = 0;
            if (sequence.frames) {
                for (const f of sequence.frames) totalDuration += (f.framelength || 0) * 0.020;
            }
            console.log(JSON.stringify({ id, frameCount, isSkeletal, totalDuration: parseFloat(totalDuration.toFixed(3)), raw: sequence }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'interface') {
        const id = parseInt(args[0]);
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const MAJOR = 3; // Archive 3: Interfaces
            const buffer = await cs.loader.getFileById(MAJOR, id);
            if (!buffer) { console.log(JSON.stringify({ error: `Interface ${id} not found` })); process.exit(1); }
            const raw = cs.parse.interfaces.read(buffer, cs.loader);
            console.log(JSON.stringify({ id, raw }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'dbtables' || operation === 'dbrows') {
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const MAJOR = 2; // Config major
            const MINOR = operation === 'dbtables' ? 40 : 41;
            const tableIdFilter = args[0] ? parseInt(args[0]) : null;
            const archive = await cs.loader.getArchiveById(MAJOR, MINOR);
            const results: any[] = [];
            for (const file of archive) {
                try {
                    const parsed = cs.parse[operation].read(file.buffer, cs.loader);
                    if (tableIdFilter !== null && parsed.tableId !== tableIdFilter) continue;
                    results.push({ id: file.fileid, tableId: parsed.tableId, data: parsed });
                } catch (e) {
                    // Skip malformed
                }
            }
            console.log(JSON.stringify({ operation, filter: tableIdFilter, count: results.length, results }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'varplayer') {
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const MAJOR = 2; // Config
            const MINOR = cs.cacheConfigPages.varplayer || 60;
            const archive = await cs.loader.getArchiveById(MAJOR, MINOR);
            const results: any[] = [];
            for (const file of archive) {
                // varplayer usually doesn't have a complex decoder, it's often just a type ubyte
                // But we'll try to use the parser if it exists
                try {
                    const parsed = cs.parse.varplayer ? cs.parse.varplayer.read(file.buffer, cs.loader) : { raw: file.buffer.toString('hex') };
                    results.push({ id: file.fileid, ...parsed });
                } catch (e) {
                    results.push({ id: file.fileid, raw: file.buffer.toString('hex') });
                }
            }
            console.log(JSON.stringify({ operation, count: results.length, results }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'varbit') {
        const id = parseInt(args[0]);
        if (isNaN(id)) { console.log(JSON.stringify({ error: 'varbit requires a numeric id' })); process.exit(1); }
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const MAJOR = 2; // Config
            const MINOR = cs.cacheConfigPages.varbits || 69;
            const archive = await cs.loader.getArchiveById(MAJOR, MINOR);
            const file = archive.find((f: any) => f.fileid === id);
            if (!file) { console.log(JSON.stringify({ error: `Varbit ${id} not found in config archive` })); process.exit(1); }
            const parsed = cs.parse.varbits.read(file.buffer, cs.loader);
            console.log(JSON.stringify({ id, ...parsed }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'varbits') {
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const MAJOR = 2; // Config
            const MINOR = cs.cacheConfigPages.varbits || 69;
            const archive = await cs.loader.getArchiveById(MAJOR, MINOR);
            const results: any[] = [];
            for (const file of archive) {
                try {
                    const parsed = cs.parse.varbits.read(file.buffer, cs.loader);
                    results.push({ id: file.fileid, ...parsed });
                } catch (e) {
                    // Skip malformed
                }
            }
            console.log(JSON.stringify({ operation, count: results.length, results }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'sprite') {
        const id = parseInt(args[0]);
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const MAJOR = 8; // Archive 8: Sprites
            const buffer = await cs.loader.getFileById(MAJOR, id);
            if (!buffer) { console.log(JSON.stringify({ error: `Sprite ${id} not found` })); process.exit(1); }
            // Sprites are usually a collection of sub-sprites. 
            // We return basic metadata for the interwoven graph.
            console.log(JSON.stringify({ id, size: buffer.byteLength, authoritativeSource: 'CACHE' }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'enum') {
        const id = parseInt(args[0]);
        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const MAJOR = 17; // Archive 17: Enums
            const buffer = await cs.loader.getFileById(MAJOR, id);
            if (!buffer) { console.log(JSON.stringify({ error: `Enum ${id} not found` })); process.exit(1); }
            const raw = cs.parse.enums.read(buffer, cs.loader);
            console.log(JSON.stringify({ id, raw }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'collision') {
        const x = parseInt(args[0]);
        const z = parseInt(args[1]);
        const plane = parseInt(args[2]);
        const xsize = parseInt(args[3] || '64');
        const zsize = parseInt(args[4] || '64');

        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const mapsquarePath = pathToFileURL(join(rsmv_PATH, subFolder, '3d', existsSync(join(rsmv_PATH, subFolder, '3d', 'mapsquare.ts')) ? 'mapsquare.ts' : 'mapsquare.js')).href;
            const { parseMapsquare } = await import(mapsquarePath);

            // We need a padded area to ensure blending works at the edges
            const rect = { x: (x >> 6), z: (z >> 6), xsize: 1, zsize: 1 };
            const chunk = await parseMapsquare(cs.loader, rect.x, rect.z, { collision: true });

            if (!chunk || !chunk.grid) {
                throw new Error(`Failed to parse mapsquare [${rect.x}, ${rect.z}]`);
            }

            const collisionFile = chunk.grid.getHeightCollisionFile(x, z, plane, xsize, zsize, true);

            console.log(JSON.stringify({
                x, z, plane, xsize, zsize,
                data: Array.from(collisionFile)
            }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    if (operation === 'mapsquare_tiles') {
        const chunkX = parseInt(args[0]);
        const chunkZ = parseInt(args[1]);

        const cs = await getCacheLoader();
        if (!cs) { console.log(JSON.stringify({ error: 'no_cache' })); process.exit(1); }
        try {
            const WORLD_STRIDE = 128;
            const sqIndex = chunkX + chunkZ * WORLD_STRIDE;
            const index = await cs.loader.getCacheIndex(cs.cacheMajors.mapsquares);
            const sq = index.find((p: any) => p && p.minor === sqIndex);

            if (!sq) {
                throw new Error(`Mapsquare index ${sqIndex} not found in cache index`);
            }

            const chunkArch = await cs.loader.getFileArchive(sq);
            const nxtTilesSubIdx = sq.subindices.indexOf(cs.cacheMapFiles.square_nxt);
            const legacyTilesSubIdx = sq.subindices.indexOf(cs.cacheMapFiles.squares);

            const tiles: { x: number, z: number, plane: number, collision: number, height: number | null }[] = [];

            if (nxtTilesSubIdx !== -1 && chunkArch[nxtTilesSubIdx]) {
                const tilesNxt = cs.parse.mapsquareTilesNxt.read(chunkArch[nxtTilesSubIdx].buffer, cs.loader) as any;
                if (tilesNxt) {
                    for (let plane = 0; plane < 4; plane++) {
                        const levelArray = tilesNxt[`level${plane}`];
                        if (!levelArray) continue;
                        for (let i = 0; i < levelArray.length; i++) {
                            const tile = levelArray[i];
                            if (!tile) continue;
                            tiles.push({
                                x: Math.floor(i / 66),
                                z: i % 66,
                                plane: plane,
                                collision: tile.flags ?? 0,
                                height: (tile.flags & 16 ? tile.rest?.waterheight : tile.height) ?? null
                            });
                        }
                    }
                }
            } else if (legacyTilesSubIdx !== -1 && chunkArch[legacyTilesSubIdx]) {
                const legacyTiles = cs.parse.mapsquareTiles.read(chunkArch[legacyTilesSubIdx].buffer, cs.loader) as any;
                if (legacyTiles && legacyTiles.tiles) {
                    for (const tile of legacyTiles.tiles) {
                        tiles.push({
                            x: tile.x ?? 0,
                            z: tile.z ?? 0,
                            plane: tile.plane ?? 0,
                            collision: tile.flags ?? 0,
                            height: tile.height ?? null
                        });
                    }
                }
            }

            console.log(JSON.stringify({ chunkX, chunkZ, tiles }));
        } catch (e: any) {
            console.log(JSON.stringify({ error: e.message }));
            process.exit(1);
        }
        cs.loader.close?.();
        process.exit(0);
    }

    console.log(JSON.stringify({ error: `Unknown operation: ${operation}` }));
    process.exit(1);
}

main();

