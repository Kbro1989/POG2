import * as fs from 'fs';
import * as path from 'path';
import { HexagramManager, YaoState } from '../../src/routing/HexagramManager.js';
import { UniversalSovereignSynthesizer } from '../../rsmv_inspector/src/UniversalSovereignSynthesizer.js';

async function fetchToHead(rx: number, ry: number) {
    console.log(`\x1b[36m[Sovereign Ingest]\x1b[0m Initializing brain...`);

    // Initialize the brain in simulation mode for the driver
    HexagramManager.initializeSimulation();
    const brain = HexagramManager.getInstance();

    console.log(`\x1b[36m[Sovereign Ingest]\x1b[0m Synthesizing Region [${rx}, ${ry}]...`);
    const synth = new UniversalSovereignSynthesizer();

    try {
        await synth.synthesizeRegion(rx, ry);

        // The synthesizer writes to a specific directory
        // Based on UniversalSovereignSynthesizer.ts:
        // const OUTPUT_DIR = path.resolve(__dirname, "../../pog-vibe-interactive/files/data/substrate");
        // We need to find where it actually wrote the file.
        const expectedFile = path.join(process.cwd(), 'rsmv_inspector', '..', '..', 'pog-vibe-interactive', 'files', 'data', 'substrate', `ms_${rx}_${ry}.logic.json`);

        // If the directory doesn't exist or file is missing, we try to find it via a glob or check relative to current dir
        let logicData;
        if (fs.existsSync(expectedFile)) {
            logicData = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));
        } else {
            // Fallback: search for the file in the project root just in case the relative path in the class was different
            console.log(`\x1b[33m[WARN]\x1b[0m Logic file not found at ${expectedFile}. Searching for alternative...`);
            // For the driver, we can just try to read from the output path specified in the class
            // but since we are in a container, we'll just simulate the "head" update if the file is missing
            // or use the synthesize output if it were returned (it currently is void).
            throw new Error(`Could not locate synthesized logic file for region [${rx}, ${ry}]`);
        }

        console.log(`\x1b[32m[Sovereign Ingest]\x1b[0m Synthesis complete. Entities found: ${logicData.metadata.total_entities}`);

        // Pin the primary summary to Line 1 (Foundation)
        await brain.pinCard(1, 'Spatial Synthesis', `Region [${rx}, ${ry}] stabilized. Total entities: ${logicData.metadata.total_entities}.`, YaoState.YoungYang);

        // Pin the first interesting entity to Line 3 (Transition/Activity)
        const entity = logicData.entities[0];
        if (entity) {
            await brain.pinCard(3, 'Entity Focus', `Active focus: ${entity.name} (ID: ${entity.id}) at [${entity.x}, ${entity.y}]`, YaoState.YoungMixed);
        } else {
            await brain.pinCard(3, 'Void Space', 'No entities detected in this region.', YaoState.YoungYin);
        }

        // Pin the overall metabolic state to Line 6 (Culmination)
        await brain.pinCard(6, 'Cognitive State', 'Sovereign head updated with regional substrate data.', YaoState.SovereignEngine);

        console.log(`\n\x1b[35m--- FINAL SOVEREIGN HEAD STATE ---\x1b[0m`);
        console.log(brain.formatForPrompt());
        console.log(`\x1b[35m-----------------------------------\x1b[0m\n`);

    } catch (error) {
        console.error(`\x1b[31m[CRITICAL ERR]\x1b[0m ${error}`);
        process.exit(1);
    } finally {
        await synth.close();
    }
}

const [,, rxArg, ryArg] = process.argv;
if (!rxArg || !ryArg) {
    console.log('Usage: tsx driver.ts <rx> <ry>');
    process.exit(1);
}

fetchToHead(parseInt(rxArg), parseInt(ryArg));
