import { EngineCache } from "./3d/modeltothree";
import { cacheMajors } from "./constants";
import { GameCacheLoader } from "./cache/sqlite";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

/**
 * Systematic Audio Extraction Scanner
 * Scans all cache majors related to audio, identifies valid ID ranges, 
 * and extracts raw audio buffers to a structured audit directory.
 */
async function run() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape"; // Pointing to the directory containing the cache files
    const outputPath = join(process.cwd(), "audit_output", "audio_extraction");
    
    if (!existsSync(outputPath)) {
        mkdirSync(outputPath, { recursive: true });
    }

    const loader = new GameCacheLoader(cachePath);
    const engine = new EngineCache(loader);
    
    // Audio-related majors (based on standard RS3 cache structure)
    const audioMajors = [
        cacheMajors.music,
        cacheMajors.soundeffects,
        cacheMajors.vorbis,
        cacheMajors.cutscenes
    ];

    for (const major of audioMajors) {
        console.log(`Scanning Major ${major}...`);
        
        const index = await engine.getArchiveById(cacheMajors.index, major);
        if (!index) {
            console.log(`Could not find index for Major ${major}`);
            continue;
        }

        // The index file maps minor IDs to their metadata (including length/existence)
        // We iterate through entries to find valid minor IDs
        for (let i = 0; i < 65535; i++) {
            try {
                const file = await engine.getFileById(major, i);
                if (file) {
                    const fileName = join(outputPath, `major_${major}_id_${i}.wav`);
                    writeFileSync(fileName, file);
                    console.log(`Extracted: ${fileName}`);
                }
            } catch (e) {
                // Ignore errors for invalid IDs (this is expected in sparse caches)
                continue;
            }
        }
    }
    console.log("Audio extraction scan complete.");
}

run().catch(console.error);
