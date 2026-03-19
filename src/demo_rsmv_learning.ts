import { PedagogyLimb } from './limbs/technical/PedagogyLimb.js';
import { ForgeEngine, SynthesisTarget } from './engines/ForgeEngine.js';
import { YaoState } from './core/models.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('DemoRSMV');

/**
 * Demo: RSMV Learning Substrate Loop
 * Demonstrates: Deconstruction -> Pedagogy -> Synthesis
 */
async function runDemo() {
    logger.info('--- STARTING RSMV LEARNING DEMO ---');

    const pedagogy = new PedagogyLimb();
    const forge = new ForgeEngine();

    // 1. Analyze a "Pro" asset from the cache (e.g., King Black Dragon ID 50)
    const npcId = 50; 
    logger.info(`Phase 1: Learning from NPC ${npcId} (KBD)...`);
    const learnRes = await pedagogy.analyzeNpc(npcId, YaoState.OldYang);

    if (!learnRes.ok) {
        logger.error({ error: learnRes.error.message }, 'Demo aborted: Learning failed.');
        return;
    }

    const profile = learnRes.value;
    logger.info({ 
        name: profile.name, 
        tris: profile.metrics.polyCount,
        bones: profile.metrics.boneCount 
    }, 'Phase 1: Pedagogy Profile Acquired.');

    // 2. Synthesize a "Synthetic Dragon" asset based on the learned pedagogy
    const target: SynthesisTarget = {
        type: 'BLENDER_PY',
        id: 'synth_dragon_v1',
        metrics: {
            targetPolyCount: Math.floor(profile.metrics.polyCount * 0.8), // Generalize slightly
            targetBoneCount: profile.metrics.boneCount
        }
    };

    logger.info('Phase 2: Synthesizing new asset based on morphological rules...');
    const synthRes = await forge.synthesizeAsset(target, `NPC_${npcId}`);

    if (synthRes.ok) {
        logger.info({ 
            path: synthRes.value.path,
            format: target.type 
        }, 'Phase 2: Synthesis Complete. New asset generated.');
    } else {
        logger.error({ error: synthRes.error.message }, 'Phase 2: Synthesis failed.');
    }

    // Cleanup
    pedagogy.close();
    logger.info('--- DEMO COMPLETE ---');
}

runDemo().catch(err => {
    console.error('Demo failed:', err);
});
