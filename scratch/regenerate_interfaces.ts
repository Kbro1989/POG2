import { HUDForensicsLimb } from '../src/limbs/spatial/HUDForensicsLimb.js';

async function main() {
    console.log("Initializing HUDForensicsLimb for full-depth extraction...");
    const hud = new HUDForensicsLimb();
    
    console.log("Starting batch extraction of interfaces 0-2000...");
    const result = await hud.extractAllInterfaces({
        range: [0, 2000],
        outputDir: 'D:/sovereign/cache_pedagogy/atlas/interfaces',
        force: true,
        onProgress: (current, total, found, errors) => {
            if (current % 100 === 0 || current === total) {
                console.log(`[Progress] ${current}/${total} | Extracted: ${found} | Errors: ${errors}`);
            }
        }
    });

    console.log("\n--- Extraction Complete ---");
    console.log(`Total Extracted: ${result.extracted}`);
    console.log(`Total Skipped: ${result.skipped}`);
    console.log(`Total Errors: ${result.errors}`);
    
    // Write out the errored IDs just in case
    if (result.errors > 0) {
        console.log(`Error IDs: ${result.errorIds.slice(0, 20).join(', ')}${result.errorIds.length > 20 ? '...' : ''}`);
    }
}

main().catch(console.error);
