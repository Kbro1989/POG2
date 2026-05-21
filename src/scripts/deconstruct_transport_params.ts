import { GameCacheLoader } from "rsmv/cache/sqlite";
import { parse } from "rsmv/opdecoder";
import { cacheMajors } from "rsmv/constants";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

// Teleport Endpoints we want to find coordinates for
const targetDbRows = new Set([16902, 16903, 16904, 16905]);

// Transport World Objects we want to find 'op' or 'params' for
const targetObjects = new Set([102315, 28094, 22376, 22425, 24824, 72781, 72782, 37618]);

async function findInEnums(source: GameCacheLoader) {
    console.log("\n📡 Deconstructing ENUMS (Major 17)...");
    const enumIndices = await source.getCacheIndex(cacheMajors.enums);
    let found = 0;

    // We only want to find enums that refer to our targetDbRows
    // (e.g. an enum that maps a coordinate to 16902, or maps 16902 to a coordinate pack)
    for (const index of enumIndices) {
        if (!index) continue;
        try {
            const arch = await source.getFileArchive(index);
            for (const file of arch) {
                const enumDef = parse.enums.read(file.buffer, source);
                // Check if any of the values or keys match our target DBRows
                let hasMatch = false;
                const maps = [enumDef.intArrayValue1, enumDef.stringArrayValue1, enumDef.intArrayValue2?.values, enumDef.stringArrayValue2?.values];
                for (const map of maps) {
                    if (map && Array.isArray(map)) {
                        for (const entry of map) {
                            if (Array.isArray(entry) && entry.length >= 2) {
                                const [k, v] = entry;
                                if (targetDbRows.has(Number(k)) || targetDbRows.has(Number(v))) {
                                    hasMatch = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (hasMatch) break;
                }

                if (hasMatch) {
                    console.log(`[ENUM ${index.minor}_${file.fileid}] Contains DbRow reference!`);
                    console.log(JSON.stringify(enumDef, null, 2));
                    found++;
                }
            }
        } catch (_error) {
            // [SILENT NECROSIS LOGGER]
            console.warn("[SILENT NECROSIS] Caught in deconstruct_transport_params: ", _error);
        }
    }
    console.log(`✅ Scanned Enums. Found ${found} direct DBRow references.`);
}

async function findInStructs(source: GameCacheLoader) {
    console.log("\n📡 Deconstructing STRUCTS (Major 22)...");
    const structIndices = await source.getCacheIndex(cacheMajors.structs);
    let found = 0;

    for (const index of structIndices) {
        if (!index) continue;
        try {
            const arch = await source.getFileArchive(index);
            for (const file of arch) {
                const structDef = parse.structs.read(file.buffer, source);
                if (!structDef.extra) continue;

                let hasMatch = false;
                for (const param of (structDef.extra || [])) {
                    if (param.intvalue !== undefined && param.intvalue !== null && targetDbRows.has(param.intvalue)) {
                        hasMatch = true;
                    }
                    // Struct might BE the coordinate payload, let's also just check if the ID matches 
                    if (targetDbRows.has(index.minor) || targetDbRows.has(file.fileid)) {
                        hasMatch = true;
                    }
                }

                if (hasMatch) {
                    console.log(`[STRUCT ${index.minor}_${file.fileid}] MATCH:`);
                    console.log(JSON.stringify(structDef, null, 2));
                    found++;
                }
            }
        } catch (_error) {
            // [SILENT NECROSIS LOGGER]
            console.warn("[SILENT NECROSIS] Caught in deconstruct_transport_params: ", _error);
        }
    }
    console.log(`✅ Scanned Structs. Found ${found} matches.`);
}

async function findInObjects(source: GameCacheLoader) {
    console.log("\n📡 Deconstructing TARGET OBJECTS (Major 16)...");
    const objIndices = await source.getCacheIndex(cacheMajors.objects);

    for (const objId of targetObjects) {
        // RS3 objects are packed by fileid = objId & 0xFF, archive = objId >>> 8
        const archiveId = objId >>> 8;
        const fileId = objId & 0xFF;

        const index = objIndices[archiveId];
        if (!index) {
            console.log(`[OBJECT ${objId}] Archive ${archiveId} not found.`);
            continue;
        }

        try {
            const arch = await source.getFileArchive(index);
            let found = false;
            for (const file of arch) {
                if (file.fileid === fileId) {
                    found = true;
                    const objDef = parse.object.read(file.buffer, source);
                    console.log(`\n[OBJECT TARGET MATCH] ID: ${objId} - ${objDef.name || 'Null'}`);

                    let opOutput = "None";
                    const actions = [objDef.actions_0, objDef.actions_1, objDef.actions_2, objDef.actions_3, objDef.actions_4].filter(x => x);
                    if (actions.length > 0) opOutput = JSON.stringify(actions);

                    console.log(`  Actions/Op: ${opOutput}`);
                    console.log(`  Extra/Params: ${JSON.stringify(objDef.extra || 'None')}`);
                }
            }
            if (!found) {
                console.log(`[OBJECT ${objId}] Not found in archive ${archiveId}. (Files present: ${arch.map(f => f.fileid).join(', ')})`);
            }
        } catch (e) {
            console.log(`[OBJECT ${objId}] Error parsing: ${e}`);
        }
    }
}

async function run() {
    console.log("🚀 Sovereign Server: Deep Cache Parameter Deconstruction");
    const source = new GameCacheLoader(CACHE_DIR);

    try {
        await findInObjects(source);
        await findInEnums(source);
        await findInStructs(source);
    } catch (e) {
        console.error(e);
    }

    source.close();
}

run().catch(console.error);
