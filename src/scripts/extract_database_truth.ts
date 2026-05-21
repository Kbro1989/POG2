import { GameCacheLoader } from "rsmv/cache/sqlite";
import { parse } from "rsmv/opdecoder";
import { cacheMajors, cacheConfigPages } from "rsmv/constants";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const OUT_DIR = "D:\\sovereign\\atlas\\system";

async function run() {
    console.log("🚀 Sovereign Server: Database/Quest Extraction Engine");
    const source = new GameCacheLoader(CACHE_DIR);

    try {
        const indices = await source.getCacheIndex(cacheMajors.config);

        // 1. DBTables (Config Page 40)
        console.log("\n📡 Extracting DBTables...");
        const tableArch = await source.getFileArchive(indices[cacheConfigPages.dbtables]!);
        const tables: any[] = [];
        for (const f of tableArch) {
            try {
                tables.push({ id: f.fileid, ...parse.dbtables.read(f.buffer, source) });
            } catch (_error) {
                // [SILENT NECROSIS LOGGER]
                console.warn("[SILENT NECROSIS] Caught in extract_database_truth: ", _error);
            }
        }
        fs.writeFileSync(path.join(OUT_DIR, "dbtables.json"), JSON.stringify(tables, null, 2));
        console.log(`✅ Extracted ${tables.length} DBTables`);

        // 2. DBRows (Config Page 41)
        console.log("\n📡 Extracting DBRows...");
        const rowArch = await source.getFileArchive(indices[cacheConfigPages.dbrows]!);
        const rows: any[] = [];
        for (const f of rowArch) {
            try {
                rows.push({ id: f.fileid, ...parse.dbrows.read(f.buffer, source) });
            } catch (_error) {
                // [SILENT NECROSIS LOGGER]
                console.warn("[SILENT NECROSIS] Caught in extract_database_truth: ", _error);
            }
        }
        fs.writeFileSync(path.join(OUT_DIR, "dbrows.json"), JSON.stringify(rows, null, 2));
        console.log(`✅ Extracted ${rows.length} DBRows`);

        console.log("\n🧪 Running Semantic Heuristic to identify Quest Rows...");
        // A row or table with quest-sounding strings
        const questCandidates = rows.filter(r => {
            const strval = JSON.stringify(r).toLowerCase();
            // Finding rows that have "quest complete", "quest point", or typical quest journal jargon
            return strval.includes("quest point") || strval.includes("quest complete") ||
                (strval.includes("recipe for disaster") && strval.includes("cook's assistant"));
        });

        if (questCandidates.length > 0) {
            fs.writeFileSync(path.join(OUT_DIR, "quest_candidates.json"), JSON.stringify(questCandidates, null, 2));
            console.log(`🎯 Identified ${questCandidates.length} potential Quest/Journal rows!`);
        } else {
            console.log(`⚠️ No immediate quest strings found in dbrows. We will check enums instead.`);
        }

    } catch (e) {
        console.error(e);
    }

    source.close();
}

run().catch(console.error);
