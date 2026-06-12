
import { ConfidenceStressTester } from "../src/tools/ConfidenceStressTester.js";

async function runTests() {
    console.log("🧪 Starting Sovereign Confidence Stress Test Suite...");
    const tester = new ConfidenceStressTester();
    const results = await tester.runSuite(0.75);
    
    console.table(results);
    
    const allPassed = results.every((r: any) => r.pass);
    if (allPassed) {
        console.log("\n✅ ALL SCENARIOS PASSED. Spatial Substrate is stable.");
    } else {
        console.error("\n❌ TEST SUITE FAILED. Parity discrepancies detected.");
        process.exit(1);
    }
}

runTests().catch(console.error);
