import { CacheWatcherLimb } from '../src/limbs/spatial/CacheWatcherLimb.ts';

async function testLivePull() {
    console.log("=== TESTING LIVE CACHE PULL (C:\\ProgramData\\Jagex\\RuneScape) ===");

    const watcherLimb = CacheWatcherLimb.getInstance();
    const livePath = 'C:\\ProgramData\\Jagex\\RuneScape';

    console.log(`Forcing scan on path: ${livePath}`);
    try {
        const scriptScan = await watcherLimb.forceScan(livePath);
        console.log("\n--- SCAN RESULT ---");
        console.log(scriptScan);
        console.log("-------------------\n");
    } catch (e) {
        console.error("Live pull failed:", e);
    }
}

testLivePull().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
