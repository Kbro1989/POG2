import * as fs from "fs";
import * as path from "path";

const DIR_VARBITS = "D:\\sovereign\\memory\\pedagogy\\varbits_json";
const DIR_LOGIC = "D:\\sovereign\\memory\\pedagogy\\logic";
const DIR_MANIFESTS = "D:\\sovereign\\memory\\pedagogy\\manifests";
const OUT_FILE = "D:\\sovereign\\atlas\\system\\pedagogy_brain.json";

function loadVarbits() {
    console.log("Loading Varbits...");
    const varbits: Record<string, any> = {};
    if (!fs.existsSync(DIR_VARBITS)) {
        console.log(`Directory not found: ${DIR_VARBITS}`);
        return varbits;
    }

    const files = fs.readdirSync(DIR_VARBITS).filter(f => f.endsWith(".json") && f !== ".schema-varbits.json");
    for (const file of files) {
        try {
            // filename format: "varbits-ID.json"
            const varbitId = file.replace("varbits-", "").replace(".json", "");
            const raw = fs.readFileSync(path.join(DIR_VARBITS, file), "utf8");
            const data = JSON.parse(raw);
            // Strip the schema to save size, map varp instead of varid for clarity
            varbits[varbitId] = {
                varp: data.varid,
                bits: data.bits
            };
        } catch (e) {
            console.error(`Failed to parse varbit: ${file}`, e);
        }
    }
    console.log(`Loaded ${Object.keys(varbits).length} Varbits.`);
    return varbits;
}

function loadLogic(filename: string) {
    const fullPath = path.join(DIR_LOGIC, filename);
    if (!fs.existsSync(fullPath)) {
        console.log(`Missing logic file: ${filename}`);
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(fullPath, "utf8"));
    } catch (e) {
        console.error(`Failed to parse ${filename}:`, e);
        return {};
    }
}

function checkManifests() {
    console.log("Checking manifests for logic overrides...");
    if (!fs.existsSync(DIR_MANIFESTS)) {
        return { empty: true, count: 0 };
    }
    const files = fs.readdirSync(DIR_MANIFESTS).filter(f => f.endsWith(".json"));
    let emptyCount = 0;
    let actualCount = 0;
    
    for (const file of files) {
        const raw = fs.readFileSync(path.join(DIR_MANIFESTS, file), "utf8");
        const data = JSON.parse(raw);
        
        // The manifests we explored only had { id: X, models: [] }
        if (data.models && data.models.length === 0 && Object.keys(data).length <= 2) {
            emptyCount++;
        } else {
            actualCount++;
        }
    }
    console.log(`Manifests audit: ${emptyCount} empty template files, ${actualCount} files with actual logic overrides.`);
    return { emptyCount, actualCount };
}

function synthesize() {
    console.log("🚀 Sovereign Server Logic Synthesis - Starting");

    // 1. Check manifests based on user inquiry "check them for logic needed."
    const manifestsAudit = checkManifests();
    if (manifestsAudit.actualCount === 0) {
        console.log("-> Confirmed: The 793 files in 'manifests' contain NO logic. They are empty templates. Skipping them.");
    } else {
        console.log(`-> Warning: Found ${manifestsAudit.actualCount} manifest files with logic! We should parse them eventually.`);
    }

    // 2. Synthesize true logic
    const brain = {
        meta: {
            generatedAt: new Date().toISOString(),
            version: "2026.04.01",
            notice: "Sovereign Synthesized Pedagogy Engine"
        },
        varbits: loadVarbits(),
        quests: loadLogic("quest_manifest.json"),
        skills: loadLogic("skill_manifest.json"),
        achievements: loadLogic("achievement_manifest.json"),
        necromancy: loadLogic("necromancy_logic.json"),
        equipment: loadLogic("equipment_requirements.json"),
        training: loadLogic("training_strategies.json")
    };

    fs.writeFileSync(OUT_FILE, JSON.stringify(brain, null, 2));
    console.log(`✅ Synthesis Complete. Brain written to ${OUT_FILE}`);
    console.log(`Brain size: ${(fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
}

synthesize();

