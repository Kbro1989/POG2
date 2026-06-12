import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');
const { parse } = require('D:/rsmv_inspector/src/opdecoder.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    const targetInterface = 1314;
    console.log(`Dumping Text from Interface ${targetInterface}...`);

    try {
        const archive = await cache.getArchiveById(3, targetInterface);
        const labels: string[] = [];
        for (const sub of archive) {
            const state = { 
                buffer: sub.buffer, 
                stack: [], 
                hiddenstack: [], 
                scan: 0, 
                endoffset: sub.buffer.byteLength, 
                args: { clientVersion: 1149 } 
            };
            try {
                const comp = parse.interfaces.parser.read(state);
                const text = comp.textdata?.text || comp.text;
                if (text) {
                    labels.push(`[${sub.fileid}] ${text}`);
                }
            } catch (e) {}
        }
        console.log(labels.join('\n'));
    } catch (e) {
        console.error(e);
    }
}

main().catch(console.error);
