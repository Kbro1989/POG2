import { WikiEnricher } from './src/utils/WikiEnricher.js';

async function testDistillation() {
    console.log("🚀 Testing WikiDistillation with authoritative substrate...");
    
    // Test with a known NPC
    const npcName = "Hans";
    console.log(`🔍 Enriching: ${npcName}`);
    
    const result = await WikiEnricher.enrich(npcName);
    
    if (result.ok) {
        console.log("✅ Success!");
        console.log("Name:", result.value.name);
        console.log("Role:", result.value.role);
        console.log("Intent Snippet:", result.value.intent.substring(0, 50) + "...");
        
        if (result.value.pog2_interactions) {
            console.log("🎯 Found Substrate Interactions:", result.value.pog2_interactions);
        } else {
            console.log("⚠️ No substrate interactions found (expected if no mapping exists for this ID yet).");
        }
    } else {
        console.error("❌ Failed:", result.error);
    }
}

testDistillation().catch(console.error);
