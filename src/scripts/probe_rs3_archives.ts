import { GameCacheLoader } from "rsmv/cache/sqlite";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    console.log("🚀 Sovereign RS3 Archive Probe — Locating Visual Substrates");
    const source = new GameCacheLoader(CACHE_DIR);

    // Major 20: Sequences?
    // Major 21: SpotAnims?
    // Major 13: Skeletons?
    // Major 14: Meshes?

    const majors = [2, 12, 13, 20, 21];
    for (const m of majors) {
        try {
            const index = await source.getCacheIndex(m);
            console.log(`Major ${m}: Found ${index.length} entries.`);
            if (index.length > 0) {
                const sample = index.find(i => i !== null);
                if (sample) {
                    const arch = await source.getFileArchive(sample);
                    console.log(`   - Sample Minor ${sample.minor} has ${arch.length} files.`);
                }
            }
        } catch (e) {
            console.log(`Major ${m}: FAILED or NOT FOUND.`);
        }
    }
}

run().catch(console.error);

