import { CacheWatcherLimb } from '../src/limbs/spatial/CacheWatcherLimb.ts';

async function testLiveCacheWatcher() {
    console.log("=== RUNNING LIVE CACHE WATCHER INTEGRATION TEST ===");

    const watcherLimb = CacheWatcherLimb.getInstance();
    
    // Register change handler to print out any detected events
    watcherLimb.onCacheChange = (event) => {
        console.log("\n🔥 [WATCHER EVENT DETECTED] 🔥");
        console.log("Filename:     ", event.filename);
        console.log("Major Index:  ", event.majorIndex);
        console.log("Delta Summary:", event.deltaSummary);
    };

    console.log("Starting dual cache watchers...");
    const started = watcherLimb.startWatching();
    
    if (started) {
        console.log("✅ SUCCESS: Watcher initialized successfully!");
    } else {
        console.log("⚠️ WARNING: Watcher not started (no cache directories found on this system).");
    }

    // Get current priority script status baselines
    console.log("\n=== PRIORITY SCRIPT BASELINE STATUS ===");
    const status = watcherLimb.getBaselineStatus();
    for (const s of status) {
        console.log(`Script ${s.scriptId}: exists=${s.exists}, size=${s.length} bytes, hash=${s.hash}`);
    }

    // Force a manual scan to verify SQLite extraction of priority scripts
    console.log("\nExecuting forced script extraction scan...");
    try {
        const scriptScan = await watcherLimb.forceScan();
        console.log("Script scan outcome:", scriptScan);
    } catch (e) {
        console.error("Script scan failed:", e);
    }

    // Clean up watchers
    console.log("\nStopping watchers...");
    watcherLimb.stopWatching();
    console.log("Watchers stopped.");
}

testLiveCacheWatcher().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
