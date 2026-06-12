import { join } from 'path';
import { getrsmvBetaCachePath } from '../src/utils/SovereignPathResolver.js';

async function testEnumDecoding() {
    console.log("=== TESTING ENUM DECODING VIA RSMV SUBSTRATE ===");
    
    const { GameCacheLoader } = await import('rsmv/cache/sqlite.js');
    const { cacheMajors } = await import('rsmv/constants.js');
    const { parse } = await import('rsmv/opdecoder.js');

    const betaPath = getrsmvBetaCachePath();
    if (!betaPath) {
        console.error("Beta cache path not resolved!");
        return;
    }

    console.log("Loading cache from:", betaPath);
    const loader = new GameCacheLoader(betaPath);

    // Try decoding beard styles (Enum 17158)
    const enumId = 17158;
    try {
        const buf = await loader.getFileById(cacheMajors.enums, enumId);
        console.log(`Loaded enum ${enumId} raw buffer of length: ${buf.byteLength} bytes.`);

        const decoded = parse.enums.read(buf, {
            getDecodeArgs() {
                return { clientVersion: 1000 };
            }
        } as any);

        console.log("Decoded Enum Structure:");
        console.dir(decoded, { depth: null });
    } catch (e) {
        console.error(`Failed to decode enum ${enumId}:`, e);
    }
}

testEnumDecoding().catch(console.error);
