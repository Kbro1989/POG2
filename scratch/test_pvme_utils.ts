import { WikiEnricher } from '../src/utils/WikiEnricher.js';

async function test() {
    console.log("Testing WikiEnricher Sanitization...");
    const raw = "@Tag with {{Ability link|Fragmentation Shot}}";
    const sanitized = WikiEnricher.sanitizeAbilityName(raw);
    console.log(`Raw: ${raw}`);
    console.log(`Sanitized: ${sanitized}`);

    if (sanitized === "Fragmentation Shot") {
        console.log("SUCCESS: Sanitization works.");
    } else {
        console.log("FAILURE: Sanitization mismatch.");
    }

    console.log("Testing fetchRotations for Nex...");
    const rotations = await WikiEnricher.fetchRotations("Nex");
    console.log(`Found ${rotations.length} rotations for Nex.`);
}

test().catch(console.error);
