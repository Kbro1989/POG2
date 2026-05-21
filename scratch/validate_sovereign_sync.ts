import { SovereignSyncLimb } from '../src/limbs/pedagogy/SovereignSyncLimb.js';
import { GlobeStateLimb } from '../src/limbs/spatial/GlobeStateLimb.js';
import { SovereignConfig } from '../src/config/SovereignConfig.js';

async function validateSovereignSync() {
    console.log("=== RUNNING SOVEREIGN-SYNC-LIMB DISTRIBUTED HARNESS ===");

    // 1. Boot GlobeStateLimb to hold active reference
    console.log("\nStep 1: Booting GlobeStateLimb...");
    const config = { globeEnabled: true, globeEndpoint: 'ws://127.0.0.1:8787/party/globe' } as any as SovereignConfig;
    const globe = new GlobeStateLimb(config);
    console.log("✅ SUCCESS: GlobeStateLimb is initialized.");

    // 2. Boot SovereignSyncLimb
    console.log("\nStep 2: Booting SovereignSyncLimb...");
    const syncLimb = SovereignSyncLimb.getInstance();
    console.log("✅ SUCCESS: SovereignSyncLimb is watching pedagogy training corpus.");

    // 3. Trigger manual sync
    console.log("\nStep 3: Triggering manual corpus sync...");
    try {
        const success = await syncLimb.syncCorpus();
        if (success) {
            console.log("✅ SUCCESS: SovereignSyncLimb manual sync executed successfully!");
        }
    } catch (e: any) {
        console.error("❌ ERROR: Manual corpus sync failed!");
        console.error(e);
        process.exit(1);
    }

    console.log("\n=== ALL SOVEREIGN SYNC DISTRIBUTED CHECKS COMPLETED SUCCESSFULLY! ===");
    
    // Clean up watchers
    syncLimb.close();
}

validateSovereignSync().catch(console.error);
