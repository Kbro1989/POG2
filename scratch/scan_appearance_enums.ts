import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

const CACHE_DIR = 'D:/sovereign/cache_pedagogy/RuneScape-BETA-Backup';
const OUTPUT_PATH = 'D:/sovereign/cache_pedagogy/beta_enum_analysis.json';

async function main() {
    console.log(`🤖 Scanning RuneScape-BETA enums using Jagex GameCacheLoader...`);

    // Dynamically import rsmv inspector modules using file:// URLs for bulletproof compatibility on Windows
    const sqlitePath = pathToFileURL(path.resolve('D:/rsmv_inspector/src/cache/sqlite.ts')).href;
    const opdecoderPath = pathToFileURL(path.resolve('D:/rsmv_inspector/src/opdecoder.ts')).href;

    console.log(`Loading sqlite module from: ${sqlitePath}`);
    const sqliteMod = await import(sqlitePath);
    const GameCacheLoader = sqliteMod.GameCacheLoader;

    console.log(`Loading opdecoder module from: ${opdecoderPath}`);
    const opdecoderMod = await import(opdecoderPath);
    const parse = opdecoderMod.parse;

    const loader = new GameCacheLoader(CACHE_DIR);

    // Load the index for Major 17 (enums)
    console.log("Loading cache index...");
    const enumIndex = await loader.getCacheIndex(17);
    console.log(`Found ${enumIndex.length} archives in Major 17.`);

    const report: any[] = [];
    let processedCount = 0;

    for (let archiveId = 0; archiveId < enumIndex.length; archiveId++) {
        const indexEntry = enumIndex[archiveId];
        if (!indexEntry) continue;

        try {
            // Retrieve all unpacked files from this archive
            const files = await loader.getFileArchive(indexEntry);
            const parsedEnums: any[] = [];

            for (const file of files) {
                try {
                    const enumData = parse.enums.read(file.buffer, loader) as any;
                    const entryList: any[] = [];

                    // Extract entries from all possible array/value lists in enums type
                    if (enumData.stringArrayValue1) {
                        for (const entry of enumData.stringArrayValue1) {
                            entryList.push({ key: entry[0], val: entry[1] });
                        }
                    }
                    if (enumData.intArrayValue1) {
                        for (const entry of enumData.intArrayValue1) {
                            entryList.push({ key: entry[0], val: entry[1] });
                        }
                    }
                    if (enumData.stringArrayValue2 && enumData.stringArrayValue2.values) {
                        for (const entry of enumData.stringArrayValue2.values) {
                            entryList.push({ key: entry[0], val: entry[1] });
                        }
                    }
                    if (enumData.intArrayValue2 && enumData.intArrayValue2.values) {
                        for (const entry of enumData.intArrayValue2.values) {
                            entryList.push({ key: entry[0], val: entry[1] });
                        }
                    }

                    const keyType = enumData.key_type1 ?? enumData.key_type2 ?? null;
                    const valType = enumData.value_type1 ?? enumData.value_type2 ?? null;

                    parsedEnums.push({
                        enumId: archiveId * 256 + file.fileid,
                        subFileId: file.fileid,
                        keyType,
                        valType,
                        defaultInt: enumData.intValue ?? null,
                        defaultString: enumData.stringValue ?? null,
                        entries: entryList,
                        totalEntries: entryList.length
                    });
                } catch (e) {
                    // Not a valid enum or failed decoding
                }
            }

            if (parsedEnums.length > 0) {
                console.log(`Archive ${archiveId} (enums ${archiveId * 256}-${archiveId * 256 + 255}): loaded ${files.length} files, decoded ${parsedEnums.length} enums.`);
                report.push({
                    archiveId,
                    totalFiles: files.length,
                    decodedCount: parsedEnums.length,
                    enums: parsedEnums
                });
                processedCount += parsedEnums.length;
            }
        } catch (e) {
            // Failed to load archive
        }
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));
    console.log(`\n✅ Decoded ${processedCount} enums in total! Detailed analysis written to: ${OUTPUT_PATH}`);
}

main().catch(console.error);
