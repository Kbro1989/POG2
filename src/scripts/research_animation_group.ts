import { GameCacheLoader } from "rsmv/cache/sqlite";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const ANIM_GROUP_ID = 1426;

async function run() {
    console.log(`🚀 Sovereign Animation Research — Group ${ANIM_GROUP_ID}`);
    const source = new GameCacheLoader(CACHE_DIR);

    // Sequence Groups are Major 2 / Minor 32
    const arch = await source.getArchiveById(2, 32);
    const file = arch.find(f => f.fileid === ANIM_GROUP_ID);

    if (file) {
        console.log(`🎬 Group ${ANIM_GROUP_ID} Hex: ${file.buffer.toString('hex')}`);
        // Typically: [Opcode 1 (2-byte ID)] = Idle, [Opcode 2 (2-byte ID)] = Walk, etc.
    } else {
        console.log(`❌ Animation Group ${ANIM_GROUP_ID} not found in Major 2 / Minor 32.`);
    }
}

run().catch(console.error);

