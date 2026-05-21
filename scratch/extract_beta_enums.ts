import { pathToFileURL } from 'url';
import { join } from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs';

function findrsmvPath(): string {
    const candidates = [
        'D:\\rsmv_inspector',
        'D:\\rsmv_clone', 
        'D:\\rsmv-master\\rsmv-master',
        'D:\\D-sovereign-\\cache_pedagogy\\rsmv_inspector'
    ];
    for (const p of candidates) {
        if (existsSync(join(p, 'src', 'cache', 'sqlite.ts'))) return p;
    }
    throw new Error('No rsmv substrate found');
}

const RSMV_PATH = findrsmvPath();

async function main() {
    const sqliteUrl = pathToFileURL(join(RSMV_PATH, 'src', 'cache', 'sqlite.ts')).href;
    const constantsUrl = pathToFileURL(join(RSMV_PATH, 'src', 'constants.ts')).href;
    const opdecoderUrl = pathToFileURL(join(RSMV_PATH, 'src', 'opdecoder.ts')).href;

    const { GameCacheLoader } = await import(sqliteUrl);
    const { cacheMajors } = await import(constantsUrl);
    const { parse } = await import(opdecoderUrl);

    // Using the secured backup cache
    const cachePath = "D:\\sovereign\\cache_pedagogy\\RuneScape-BETA-Backup";
    console.log(`Loading cache from: ${cachePath}`);
    const loader = new GameCacheLoader(cachePath);

    // Enums are typically in index 17 (cacheMajors.enums)
    console.log(`Attempting to extract enums...`);
    // Attempting to extract enums...
    
    const outPath = 'D:/POG2/scratch/beta_enums_dump.json';
    const enumsData: any[] = [];
    
    // We iterate through archives. Usually each enum is its own file in an archive, or grouped.
    // In typical opdecoder usage, enums are grouped in chunks. Let's try to extract all of them.
    console.log(`Extracting enums...`);
    try {
        const enumFiles = await parse.enums.read(loader);
        for (const enumObj of enumFiles) {
            enumsData.push(enumObj);
        }
    } catch (e) {
        console.error("Failed using bulk read, trying fallback...", e);
    }

    fs.writeFileSync(outPath, JSON.stringify(enumsData, null, 2));
    console.log(`Saved ${enumsData.length} enums to ${outPath}`);
}

main().catch(console.error);
