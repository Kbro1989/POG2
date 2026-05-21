import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function main() {
    console.log('CS2 VM Bridge Smoke Test');
    try {
        const inspectorPath = 'D:/sovereign/cache_pedagogy/rsmv_inspector';
        
        // Dynamically import from the sovereign substrate
        const { renderClientScript } = require(path.join(inspectorPath, 'src', 'clientscript', 'index.ts'));
        const { GameCacheLoader } = require(path.join(inspectorPath, 'src', 'cache', 'sqlite.ts'));

        const cachePath = 'C:/ProgramData/Jagex/RuneScape-BETA';
        console.log(`Connecting to Sovereign BETA Cache at ${cachePath}`);
        const source = new GameCacheLoader(cachePath);
        
        const SCRIPT_ID = 10896;
        const CACHE_MAJOR_CLIENTSCRIPT = 12;

        console.log(`Fetching script ${SCRIPT_ID} from major ${CACHE_MAJOR_CLIENTSCRIPT}...`);
        const buf = await source.getFileById(CACHE_MAJOR_CLIENTSCRIPT, SCRIPT_ID);
        
        console.log(`Decompiling script ${SCRIPT_ID}...`);
        const result = await renderClientScript(source, buf, SCRIPT_ID);
        
        console.log('\n--- Script 10896 (Truncated) ---\n');
        console.log(result.substring(0, 1000));
        console.log('\n--------------------------------');
        console.log('Smoke test passed. Bridge is solid.');
    } catch (e) {
        console.error('Error during CS2 decompression:', e);
    }
}

main();
