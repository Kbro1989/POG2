/**
 * RSMV BRIDGE â€” ESM Subprocess Bridge
 * 
 * Called as a subprocess by CacheForensicsLimb, TopologyLimb, and KinematicsLimb.
 * Bridges the ESM/CommonJS boundary by running inside tsx (full ESM support)
 * and returning JSON to stdout.
 * 
 * Usage (called internally by RSMVBridge.ts):
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
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve rsmv substrate
const RSMV_PATH = 'D:\\sovereign\\cache_pedagogy\\rsmv_inspector';
const CACHE_PATH = 'C:\\ProgramData\\Jagex\\RuneScape';

async function loadRSMV() {
    const sqlitePath = pathToFileURL(join(RSMV_PATH, 'src', 'cache', 'sqlite.ts')).href;
    const opdecoderPath = pathToFileURL(join(RSMV_PATH, 'src', 'opdecoder.ts')).href;
    const constantsPath = pathToFileURL(join(RSMV_PATH, 'src', 'constants.ts')).href;
    
    try {
        const { GameCacheLoader } = await import(sqlitePath);
        const { parse } = await import(opdecoderPath);
        const { cacheMajors } = await import(constantsPath);
        
        return { GameCacheLoader, parse, cacheMajors };
    } catch (e: any) {
        console.error(`RSMVBridge import failed: ${e.message}`);
        return null;
    }
}

async function getCacheLoader() {
    const mods = await loadRSMV();
    if (!mods) return null;
    try {
        const loader = new mods.GameCacheLoader(CACHE_PATH);
        loader.buildnr = 940;
        return { loader, parse: mods.parse, cacheMajors: mods.cacheMajors };
    } catch {
        return null;
    }
}

const [,, operation, ...args] = process.argv;

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
            console.log(JSON.stringify({ online: !!buf, cacheVersion: cs.loader.buildnr }));
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
                const rt7Path = pathToFileURL(join(RSMV_PATH, 'src', '3d', 'rt7model.js')).href;
                const { parseOb3Model } = await import(rt7Path);
                modelData = parseOb3Model(buffer, cs.loader);
            } catch {}

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

    console.log(JSON.stringify({ error: `Unknown operation: ${operation}` }));
    process.exit(1);
}

main();
