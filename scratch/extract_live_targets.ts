import { GameCacheLoader } from 'rsmv/cache/sqlite.js';
import { cacheMajors } from 'rsmv/constants.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function extractSpecificScripts() {
    const livePath = 'C:\\ProgramData\\Jagex\\RuneScape';
    const outputDir = 'POG2/scratch/live_extracts';

    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

    const targets = [7937, 11195];
    const loader = new GameCacheLoader(livePath);

    console.log(`=== Extracting scripts from ${livePath} ===`);

    for (const id of targets) {
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, id);
            const filePath = join(outputDir, `script_${id}.bin`);
            writeFileSync(filePath, buf);
            console.log(`✅ Extracted script ${id} (${buf.length} bytes) -> ${filePath}`);
        } catch (e) {
            console.error(`❌ Failed to extract script ${id}:`, e);
        }
    }
}

extractSpecificScripts().catch(err => {
    console.error("Extraction failed:", err);
    process.exit(1);
});
