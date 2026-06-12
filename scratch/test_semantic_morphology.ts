import { SovereignAvatarEntity } from '../src/core/SovereignAvatar.js';
import { AvatarStateLimb } from '../src/limbs/spatial/AvatarStateLimb.ts';

async function testSemanticMorphology() {
    console.log("=== RUNNING SEMANTIC MORPHOLOGY TELEMETRY TEST ===");

    // Create mock entity
    const entity = new SovereignAvatarEntity('TestPlayer');

    // Get AvatarStateLimb instance and bind entity
    const stateLimb = AvatarStateLimb.getInstance();
    stateLimb.bindEntity(entity);

    // Initial state
    console.log("Initial semantic state:", stateLimb.getRenderState().semantic);

    console.log("\nSetting body type to refresh_female (varbit 28556 = 1)...");
    stateLimb.setBodyType('refresh_female');

    console.log("Writing varbit HEAD (28547) = 5 (Long straight)...");
    stateLimb.writeVarBit(28547, 5);

    console.log("Writing varbit BEARD (28551) = 2 (Handlebar)...");
    stateLimb.writeVarBit(28551, 2);

    console.log("Writing skin color index = 7 (Zaros Purple)...");
    stateLimb.writeVarBit(2827, 7);

    console.log("Writing hair color index = 2 (Ruby vermillion)...");
    stateLimb.writeVarBit(2828, 2);

    // Trigger sync
    stateLimb.syncFromVarps();

    const finalState = stateLimb.getRenderState();
    console.log("\n=== SYNCHRONIZED STATE RESULTS ===");
    console.log("Body Type:    ", finalState.morphology.bodyType);
    console.log("Head Index:   ", finalState.morphology.categoryIndices.head);
    console.log("Beard Index:  ", finalState.morphology.categoryIndices.beard);
    console.log("Skin Color Id:", finalState.morphology.appearanceIndices.skinColor);
    console.log("Hair Color Id:", finalState.morphology.appearanceIndices.shoeColor); // shoeColor is actually mapped in the last field of 524476 but appearanceIndices has hairColor

    console.log("\n=== RESOLVED SEMANTIC TRANSLATIONS ===");
    console.log("Resolved Head Style: ", finalState.semantic?.headStyle);
    console.log("Resolved Beard Style:", finalState.semantic?.beardStyle);
    console.log("Resolved Skin Color: ", finalState.semantic?.skinColor);
    console.log("Resolved Hair Color: ", finalState.semantic?.hairColor);

    // Verify
    if (finalState.semantic?.headStyle === "Long straight" &&
        finalState.semantic?.beardStyle === "Handlebar" &&
        finalState.semantic?.skinColor === "Zaros Purple" &&
        finalState.semantic?.hairColor === "Ruby vermillion") {
        console.log("\n✅ SUCCESS: Semantic translation and telemetry mapping work flawlessly!");
    } else {
        console.error("\n❌ FAILURE: Semantic translation mapped incorrectly.");
        process.exit(1);
    }
}

testSemanticMorphology().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
