import { CloudflareServices } from './src/services/CloudflareServices.js';
import { GhostLimb } from './src/limbs/metaphysical/GhostLimb.js';
import { loadConfig } from './src/config/SovereignConfig.js';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

async function verify() {
    const config = loadConfig('sovereign.json');
    const cf = new CloudflareServices(config);
    const ghost = new GhostLimb();

    console.log('--- Substrate Audit ---');
    const audit = await cf.auditAbilities();
    console.log('Audit Result:', JSON.stringify(audit, null, 2));

    const testDir = join(process.cwd(), 'test_output');
    if (!existsSync(testDir)) mkdirSync(testDir);

    console.log('\n--- Testing Cloudflare AI (MeloTTS) ---');
    try {
        const res = await cf.runAi<Buffer>('@cf/myshell-ai/melotts', {
            text: 'Cloudflare substrate online.',
            speaker: 'en-us-male-1'
        });
        if (res.ok) {
            const path = join(testDir, 'cf_test.wav');
            writeFileSync(path, res.value);
            console.log('SUCCESS: Cloudflare audio saved to', path, 'Size:', res.value.length);
        } else {
            console.log('FAILED: Cloudflare error:', res.error.message);
        }
    } catch (e: any) {
        console.log('CRITICAL: Cloudflare catch error:', e.message);
    }

    console.log('\n--- Testing Ghost Piper Fallback ---');
    try {
        const path = join(testDir, 'piper_test.wav');
        const res = await ghost.executePiperFallback('Sovereign fallback online.', path);
        if (res.ok) {
            console.log('SUCCESS: Piper audio saved to', path);
        } else {
            console.log('FAILED: Piper error:', res.error.message);
        }
    } catch (e: any) {
        console.log('CRITICAL: Piper catch error:', e.message);
    }
}

verify();
