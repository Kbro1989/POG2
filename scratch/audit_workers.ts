import { CloudflareSyncLimb } from '../src/limbs/spatial/CloudflareSyncLimb.js';
import { SwitchboardLimb } from '../src/monitor/SwitchboardLimb.js';
import { createLogger } from '../src/utils/logger.js';
// Using global fetch or undici as needed

const logger = createLogger('WorkerAudit');

async function auditWorkerSubstrates() {
    console.log('🧬 POG2 Worker & Visual Substrate Audit');
    
    // 1. Check Switchboard (Dashboard Source)
    const switchboard = SwitchboardLimb.getInstance();
    const port = switchboard.getActivePort() || 8788;
    console.log(`Checking Switchboard Dashboard on port ${port}...`);
    
    try {
        const res = await fetch(`http://localhost:${port}/edge_radar.html`);
        if (res.ok) {
            console.log('✅ Switchboard Dashboard: ONLINE');
        } else {
            console.log(`❌ Switchboard Dashboard: ERROR ${res.status}`);
        }
    } catch (e) {
        console.log('❌ Switchboard Dashboard: OFFLINE (Is POG2 serve running?)');
    }

    // 2. Check Cloudflare Worker (Wrangler Dev)
    const cfLimb = new CloudflareSyncLimb();
    const workerUrl = 'http://127.0.0.1:8787';
    console.log(`Checking Cloudflare Worker on ${workerUrl}...`);
    
    try {
        const res = await fetch(`${workerUrl}/api/health`);
        if (res.ok) {
            console.log('✅ Cloudflare Worker: ONLINE');
        } else {
            // Some workers might not have /api/health, try root
            const rootRes = await fetch(workerUrl);
            if (rootRes.ok) {
                console.log('✅ Cloudflare Worker: ONLINE (Root only)');
            } else {
                console.log(`❌ Cloudflare Worker: ERROR ${res.status}`);
            }
        }
    } catch (e) {
        console.log('❌ Cloudflare Worker: OFFLINE (Is wrangler dev running?)');
    }

    // 3. Verify Sync Capability
    console.log('Testing Cloudflare Sync Capability...');
    const syncRes = await cfLimb.postVisualState({
        modelId: 'audit_test',
        colorModHex: '#00ff00'
    });
    
    if (syncRes) {
        console.log('✅ Cloudflare Sync: OPERATIONAL');
    } else {
        console.log('❌ Cloudflare Sync: FAILED');
    }
}

auditWorkerSubstrates().catch(console.error);
