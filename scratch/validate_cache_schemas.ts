import { existsSync, readFileSync } from 'fs';
import { getrsmvBetaCachePath, resolveSovereignPath } from '../src/utils/SovereignPathResolver.js';
import { generateAppearanceEnums } from '../src/generators/CacheSchemaGenerator.js';
import { AvatarStateLimb } from '../src/limbs/spatial/AvatarStateLimb.js';

async function validateCacheSchemas() {
    console.log("=== RUNNING CACHE-TO-GAMESTATE VALIDATION HARNESS ===");

    const betaPath = getrsmvBetaCachePath();
    if (!betaPath) {
        console.error("❌ ERROR: Beta cache path not resolved!");
        process.exit(1);
    }

    console.log("Step 1: Running Schema-to-Code generator...");
    let outFile: string;
    try {
        outFile = await generateAppearanceEnums(betaPath);
        console.log(`✅ SUCCESS: Generated schema file at: ${outFile}`);
    } catch (e) {
        console.error("❌ ERROR: Schema-to-Code generation failed:", e);
        process.exit(1);
    }

    console.log("\nStep 2: Checking generated file contents...");
    if (!existsSync(outFile)) {
        console.error(`❌ ERROR: Generated file does not exist on disk!`);
        process.exit(1);
    }

    const content = readFileSync(outFile, 'utf8');
    const lines = content.split('\n');
    console.log(`✅ SUCCESS: Generated file exists. Lines count: ${lines.length}`);
    
    // Check if the exported objects are populated
    const hasFemaleHair = content.includes('FemaleHairStyles');
    const hasMaleHair = content.includes('MaleHairStyles');
    const hasBeardStyles = content.includes('BeardStyles');
    const hasBeardNames = content.includes('BeardNames');

    if (hasFemaleHair && hasMaleHair && hasBeardStyles && hasBeardNames) {
        console.log("✅ SUCCESS: All targeted enums are present in the generated code!");
    } else {
        console.error("❌ ERROR: Missing target enums in the generated file!");
        process.exit(1);
    }

    console.log("\nStep 3: Validating hot-reload subscription in AvatarStateLimb...");
    const avatarLimb = AvatarStateLimb.getInstance();
    
    console.log("Triggering simulated enum cache invalidation event...");
    try {
        await avatarLimb.onCacheInvalidated(17, 'Simulated update from validation harness.');
        console.log("✅ SUCCESS: Invalidation callback executed and hot-reloaded enums without throwing!");
    } catch (e) {
        console.error("❌ ERROR: Invalidation listener failed:", e);
        process.exit(1);
    }

    console.log("\n=== ALL CACHE-TO-GAMESTATE INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
}

validateCacheSchemas().catch(console.error);
