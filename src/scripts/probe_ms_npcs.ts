import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import { cacheMajors } from "../rsmv/constants.js";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    const source = new GameCacheLoader(CACHE_DIR);
    // Lumbridge Castle is ms_50_50
    // In Major 5, groups are indexed by (mx << 7) | mz
    const groupid = (50 << 8) | 50; 
    
    console.log(`🔍 Probing Mapsquare 50,50 (Group ${groupid})...`);
    
    const index = await source.getCacheIndex(cacheMajors.mapsquares);
    const group = index.find(g => g.minor === groupid);
    
    if (!group) {
        console.error("❌ ms_50_50 not found in index");
        return;
    }
    
    const arch = await source.getFileArchive(group);
    console.log(`✅ Group ${groupid} has ${arch.length} subfiles.`);
    
    for (const file of arch) {
        console.log(`  File ${file.fileid}: ${file.buffer.length} bytes | Hex: ${file.buffer.slice(0, 16).toString('hex')}`);
    }
}

run().catch(console.error);
