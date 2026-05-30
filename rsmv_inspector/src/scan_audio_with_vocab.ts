import { EngineCache } from "./3d/modeltothree";
import { cacheMajors } from "./constants";
import { GameCacheLoader } from "./cache/sqlite";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Enhanced Systematic Audio Extraction Scanner
 * Scans all cache majors related to audio, cross-references with interaction_vocabulary.json,
 * and extracts raw audio buffers with associated interaction metadata.
 */
async function run() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape";
    const outputPath = join(process.cwd(), "audit_output", "audio_extraction");
    const vocabPath = join(process.cwd(), "public", "interaction_vocabulary.json");
    
    if (!existsSync(outputPath)) {
        mkdirSync(outputPath, { recursive: true });
    }

    const vocab = JSON.parse(readFileSync(vocabPath, 'utf8'));
    const actions = vocab.actions.map((a: [string, number]) => ({ name: a[0], id: a[1] }));

    const loader = new GameCacheLoader(cachePath);
    const engine = new EngineCache(loader);
    
    // Audio-related majors
    const audioMajors = [
        cacheMajors.music,
        cacheMajors.soundeffects,
        cacheMajors.vorbis,
        cacheMajors.cutscenes
    ];

    for (const major of audioMajors) {
        console.log(`Scanning Major ${major}...`);
        
        const index = await engine.getArchiveById(cacheMajors.index, major);
        if (!index) continue;

        // Iterate through valid IDs (would ideally be pulled from archive index)
        for (let i = 0; i < 65535; i++) {
            try {
                const file = await engine.getFileById(major, i);
                if (file) {
                    // Placeholder: Logic to correlate minor ID to NPC/Object interaction ID
                    // This will eventually query the Bestiary/NPC definitions
                    const interaction = actions.find(a => a.id === i);
                    const tag = interaction ? interaction.name.replace(/\s+/g, '_') : 'unlinked';
                    
                    const fileName = join(outputPath, `major_${major}_id_${i}_${tag}.wav`);
                    writeFileSync(fileName, file);
                    console.log(`Extracted: ${fileName}`);
                }
            } catch (e) {
                continue;
            }
        }
    }
    console.log("Audio extraction with vocabulary tagging complete.");
}

run().catch(console.error);
