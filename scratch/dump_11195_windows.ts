import { GameCacheLoader } from "../rsmv/dist/cache/sqlite.js";
import { cacheMajors } from "../rsmv/dist/constants.js";

async function main() {
    const scriptId = 11195;
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const buf = await loader.getFileById(cacheMajors.clientscript, scriptId);

    const offsets = [977, 979, 985, 987];
    console.log(`=== Bytecode Windows for Script ${scriptId} ===`);

    offsets.forEach(off => {
        const start = Math.max(0, off - 5);
        const end = Math.min(buf.length, off + 10);
        const window = buf.slice(start, end).toString('hex').match(/.{1,2}/g)?.join(' ');
        console.log(`Offset ${off}: ${window}`);
    });
}

main().catch(console.error);
