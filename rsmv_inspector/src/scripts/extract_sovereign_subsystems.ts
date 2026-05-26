import { GameCacheLoader } from "rsmv_inspector/cache/sqlite";
import { parse } from "rsmv_inspector/opdecoder";
import { cacheMajors, cacheConfigPages } from "rsmv_inspector/constants";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const OUT_DIR_ITEMS = "D:\\sovereign\\atlas\\item";
const OUT_DIR_OBJECTS = "D:\\sovereign\\atlas\\spatial\\system_taxonomy";
const OUT_DIR_SYSTEM = "D:\\sovereign\\atlas\\system";

async function run() {
    console.log("🚀 Sovereign Subsystem Forensic — Bulk Extractions");
    const source = new GameCacheLoader(CACHE_DIR);

    // Ensure output directories exist
    [OUT_DIR_ITEMS, OUT_DIR_OBJECTS, OUT_DIR_SYSTEM].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // 1. Items (Major 19)
    console.log("\n📡 Extracting Items (Major 19)...");
    const items: any[] = [];
    for (let id = 0; id < 60000; id++) {
        try {
            const buf = await source.getFileById(cacheMajors.items, id);
            const item = parse.item.read(buf, source);
            // Include ID
            items.push({ id, ...item });
        } catch (_error) {
            // [SILENT NECROSIS LOGGER]
            console.warn("[SILENT NECROSIS] Caught in extract_sovereign_subsystems: ", _error);
        }
        if (id % 10000 === 0 && id > 0) console.log(`   Read ${id} items...`);
    }
    fs.writeFileSync(path.join(OUT_DIR_ITEMS, "item_definitions.json"), JSON.stringify(items, null, 2));
    console.log(`✅ Extracted ${items.length} Items -> ${OUT_DIR_ITEMS}\\item_definitions.json`);

    // 2. Objects (Major 16)
    console.log("\n📡 Extracting Objects (Major 16)...");
    const objects: any[] = [];
    for (let id = 0; id < 150000; id++) {
        try {
            const buf = await source.getFileById(cacheMajors.objects, id);
            const obj = parse.object.read(buf, source);
            // Keep it somewhat lightweight if too large, but let's dump all for now
            objects.push({ id, ...obj });
        } catch (_error) {
            // [SILENT NECROSIS LOGGER]
            console.warn("[SILENT NECROSIS] Caught in extract_sovereign_subsystems: ", _error);
        }
        if (id % 25000 === 0 && id > 0) console.log(`   Read ${id} objects...`);
    }
    fs.writeFileSync(path.join(OUT_DIR_OBJECTS, "object_definitions.json"), JSON.stringify(objects, null, 2));
    console.log(`✅ Extracted ${objects.length} Objects -> ${OUT_DIR_OBJECTS}\\object_definitions.json`);

    // 3. Achievements (Major 57)
    console.log("\n📡 Extracting Achievements (Major 57)...");
    const achievements: any[] = [];
    for (let id = 0; id < 10000; id++) {
        try {
            const buf = await source.getFileById(cacheMajors.achievements, id);
            const ach = parse.achievement.read(buf, source);
            achievements.push({ id, ...ach });
        } catch (_error) {
            // [SILENT NECROSIS LOGGER]
            console.warn("[SILENT NECROSIS] Caught in extract_sovereign_subsystems: ", _error);
        }
    }
    fs.writeFileSync(path.join(OUT_DIR_SYSTEM, "achievements.json"), JSON.stringify(achievements, null, 2));
    console.log(`✅ Extracted ${achievements.length} Achievements -> ${OUT_DIR_SYSTEM}\\achievements.json`);

    // 4. Structs (Major 22) - Abilities / etc
    console.log("\n📡 Extracting Structs (Major 22)...");
    const structs: any[] = [];
    for (let id = 0; id < 25000; id++) {
        try {
            const buf = await source.getFileById(cacheMajors.structs, id);
            const strct = parse.structs.read(buf, source);
            structs.push({ id, ...strct });
        } catch (_error) {
            // [SILENT NECROSIS LOGGER]
            console.warn("[SILENT NECROSIS] Caught in extract_sovereign_subsystems: ", _error);
        }
        if (id % 5000 === 0 && id > 0) console.log(`   Read ${id} structs...`);
    }
    fs.writeFileSync(path.join(OUT_DIR_SYSTEM, "struct_definitions.json"), JSON.stringify(structs, null, 2));
    console.log(`✅ Extracted ${structs.length} Structs -> ${OUT_DIR_SYSTEM}\\struct_definitions.json`);

    // 5. IdentityKit (Config 2, Page 3)
    console.log("\n📡 Extracting IdentityKit (Config 2, Page 3)...");
    const identityKits: any[] = [];
    try {
        const idkitIndices = await source.getCacheIndex(cacheMajors.config);
        const idkitPage = idkitIndices[cacheConfigPages.identityKit];
        if (idkitPage) {
            const arch = await source.getFileArchive(idkitPage);
            for (const file of arch) {
                try {
                    const idkit = parse.identitykit.read(file.buffer, source);
                    identityKits.push({ id: file.fileid, ...idkit });
                } catch (_error) {
                    // [SILENT NECROSIS LOGGER]
                    console.warn("[SILENT NECROSIS] Caught in extract_sovereign_subsystems: ", _error);
                }
            }
        }
    } catch (_error) {
        // [SILENT NECROSIS LOGGER]
        console.warn("[SILENT NECROSIS] Caught in extract_sovereign_subsystems: ", _error);
    }
    fs.writeFileSync(path.join(OUT_DIR_SYSTEM, "identitykit_definitions.json"), JSON.stringify(identityKits, null, 2));
    console.log(`✅ Extracted ${identityKits.length} IdentityKits -> ${OUT_DIR_SYSTEM}\\identitykit_definitions.json`);

    source.close();
}

run().catch(console.error);
