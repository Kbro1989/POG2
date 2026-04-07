import { SoundtrackLimb } from './limbs/creative/SoundtrackLimb.js';
import { loadConfig } from './config/SovereignConfig.js';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

async function test() {
    console.log('--- Initializing Advanced SoundtrackLimb Verification ---');
    const config = loadConfig('config.json');
    const limb = new SoundtrackLimb(config);

    const testCases = [
        {
            name: 'Pure Yang (Creative/Expansion)',
            prosody: { chaos: 0.9, whimsy: 0.9, darkTone: 0.1, coherence: 0.8 },
            duration: 5
        },
        {
            name: 'Pure Yin (Receptive/Stabilization)',
            prosody: { chaos: 0.1, whimsy: 0.1, darkTone: 0.9, coherence: 0.9 },
            duration: 5
        },
        {
            name: 'High Chaos (Difficulty at Beginning)',
            prosody: { chaos: 1.0, whimsy: 0.3, darkTone: 0.5, coherence: 0.2 },
            duration: 5
        }
    ];

    for (const tc of testCases) {
        console.log(`\nTesting Case: ${tc.name}`);
        const outPath = `test_advanced_${tc.name.replace(/\s+/g, '_').toLowerCase()}.wav`;
        if (existsSync(outPath)) unlinkSync(outPath);

        const res = await limb.generateScore(tc.prosody, tc.duration, outPath);
        if (res.ok) {
            console.log(`SUCCESS: Generated ${outPath}`);
            console.log(`Substrate: ${(res.value as any).substrate || (res.value as any).output}`);
        } else {
            console.log(`FAILED: ${res.error?.message || 'Unknown error'}`);
        }
    }
}

test().catch(console.error);
