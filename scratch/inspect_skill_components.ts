import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');
const { parse } = require('D:/rsmv_inspector/src/opdecoder.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    const id = 1314;
    console.log(`Dumping Interface ${id} around Necromancy...`);

    try {
        const archive = await cache.getArchiveById(3, id);
        for (const sub of archive) {
            if (sub.fileid >= 160 && sub.fileid <= 180) {
                const state = { buffer: sub.buffer, stack: [], hiddenstack: [], scan: 0, endoffset: sub.buffer.byteLength, args: { clientVersion: 1149 } };
                const comp = parse.interfaces.parser.read(state);
                console.log(`\nComponent ${sub.fileid}:`);
                console.log(`  Type: ${comp.type}`);
                console.log(`  Text: "${comp.textdata?.text || comp.text || ''}"`);
                console.log(`  Sprite: ${comp.spritedata?.spriteid || comp.spriteid || 'none'}`);
                console.log(`  Hidden: ${comp.hidden}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

main().catch(console.error);
