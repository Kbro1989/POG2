import { pathToFileURL } from 'url';
import { join } from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs';

// Locate rsmv substrate dynamically
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
    const clientscriptUrl = pathToFileURL(join(RSMV_PATH, 'src', 'clientscript', 'index.ts')).href;

    const { GameCacheLoader } = await import(sqliteUrl);
    const { cacheMajors } = await import(constantsUrl);
    const { renderClientScript } = await import(clientscriptUrl);

    // Using the secured backup cache
    const cachePath = "D:\\sovereign\\cache_pedagogy\\RuneScape-BETA-Backup";
    console.log(`Loading cache from: ${cachePath}`);
    const loader = new GameCacheLoader(cachePath);

    const scripts = [7894, 7875];

    for (const id of scripts) {
        console.log(`Decompiling ClientScript ${id}...`);
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, id);
            const code = await renderClientScript(loader, buf, id);
            const outPath = `D:/POG2/scratch/script_${id}_decompiled.ts`;
            fs.writeFileSync(outPath, code);
            console.log(`Saved decompiled script to ${outPath}`);
        } catch (e) {
            console.error(`Error decompiling script ${id}:`, e);
        }
    }
}

main().catch(console.error);
