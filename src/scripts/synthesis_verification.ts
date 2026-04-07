import { PhotoBoothHandler } from '../logic/handlers/PhotoBoothHandler.js';
import { LogicBrainLimb } from '../limbs/technical/LogicBrainLimb.js';
import { NecromancyHandler } from '../logic/handlers/NecromancyHandler.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('SynthesisVerification');

async function verify() {
    logger.info('--- Commencing Sovereign Logic Synthesis Verification ---');

    // 1. Check Logic Brain
    const brain = LogicBrainLimb.getInstance();
    const brainHealth = await brain.healthCheck();
    logger.info({ brainHealth }, 'LogicBrainLimb Health Status');

    // 2. Check Necromancy Handler
    const necro = NecromancyHandler.getInstance();
    const necroHealth = await necro.healthCheck();
    logger.info({ necroHealth }, 'NecromancyHandler Health Status');

    // 3. Test Skill Requirement Resolution
    const attackReq = brain.getSkillRequirement('Attack', 99);
    logger.info({ attackReq }, 'Skill Requirement Resolution: Attack 99');

    // 4. Test Necromancy Calculation
    const state = { necrosisStacks: 6, residualSouls: 0, adrenaline: 100, commandCooldowns: {} };
    const finger = necro.computeFingerOfDeath(state);
    logger.info({ finger }, 'Necromancy Calculation: Finger of Death (6 Stacks)');

    logger.info('--- Synthesis Verification Complete ---');
}

verify().catch(console.error);
