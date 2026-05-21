#!/usr/bin/env node
/**
 * PlayerAgent CLI Runner
 * 
 * Entry point for launching the autonomous PlayerAgent in the POG2 sandbox.
 * Supports the --env=beta-2026 and --hub=wendlewick flags for the Avatar Beta.
 */

import { SovereignAvatarEntity } from './core/SovereignAvatar.js';
import { PlayerAgent } from './engines/gameplay/PlayerAgent.js';
import { SimulationHarness } from './engines/gameplay/SimulationHarness.js';
import { CanonicalClock } from './utils/CanonicalClock.js';
import { createLogger } from './utils/logger.js';

import { InteractionGateway } from './limbs/logical/InteractionGateway.js';

const logger = createLogger('PlayerAgentRunner');

async function main() {
    const args = process.argv.slice(2);
    const isBeta = args.includes('--env=beta-2026');
    const hub = args.find(a => a.startsWith('--hub='))?.split('=')[1] || 'lumbridge';
    const objective = args.find(a => a.startsWith('--objective='))?.split('=')[1];
    const iterations = parseInt(args.find(a => a.startsWith('--iterations='))?.split('=')[1] || '10');
    const debugOverlay = args.includes('--debug-overlay=true');

    console.log(`\n\x1b[38;5;33m[ POG2 PLAYER AGENT ]\x1b[0m`);
    console.log(`\x1b[38;5;244m─────────────────────────────────\x1b[0m`);
    console.log(`Environment: ${isBeta ? '\x1b[38;5;46mBeta 2026\x1b[0m' : 'Vanilla'}`);
    console.log(`Target Hub:  \x1b[38;5;220m${hub.toUpperCase()}\x1b[0m`);
    console.log(`Objective:   \x1b[38;5;201m${objective || 'None'}\x1b[0m`);
    console.log(`Iterations:  ${iterations}`);
    console.log(`Debug Mode:  ${debugOverlay ? 'ON' : 'OFF'}`);
    console.log(`\x1b[38;5;244m─────────────────────────────────\x1b[0m\n`);

    // Bootstrap Clock
    CanonicalClock.bootstrap(42);

    // Phase 259: Bootstrap Substrates for Standalone Training Run
    const config = (await import('./config/SovereignConfig.js')).getDefaultSovereignConfig();
    const { HexagramManager } = await import('./routing/HexagramManager.js');
    const { TernaryRouter } = await import('./routing/TernaryRouter.js');
    const { ModelClient } = await import('./clients/ModelClient.js');
    const { WorkforceManifest } = await import('./routing/WorkforceManifest.js');
    const { AIDispatcher } = await import('./api/ai/Dispatcher.js');
    const { WorldGroundingLimb } = await import('./limbs/world_grounding/WorldGroundingLimb.js');
    const { EntityLimb } = await import('./limbs/technical/EntityLimb.js');
    const { SwitchboardLimb } = await import('./monitor/SwitchboardLimb.js');

    HexagramManager.initializeMock();
    const hexManager = HexagramManager.getInstance();
    const router = new TernaryRouter(config);
    const client = new ModelClient(config, router);
    const workforce = new WorkforceManifest(config);
    const dispatcher = new AIDispatcher(client, workforce);
    
    const worldGrounding = WorldGroundingLimb.getInstance();
    const entityLimb = EntityLimb.getInstance();
    const switchboard = SwitchboardLimb.getInstance();

    const harness = SimulationHarness.bootstrap(worldGrounding, hexManager, dispatcher, entityLimb, switchboard);

    const avatar = new SovereignAvatarEntity('Sovereign');
    
    // Position Grounding
    if (hub === 'wendlewick') {
        avatar.coord = { x: 3000, y: 3000, plane: 0 };
        avatar.x = 3000;
        avatar.y = 3000;
    }
    
    harness.setAvatar(avatar);

    // Phase 119: Spatial Proprioception Sync
    const { SpatialVisionEngine } = await import('./engines/SpatialVisionEngine.js');
    SpatialVisionEngine.getInstance(config, (harness as any).renderer).setAvatar(avatar);

    const agent = new PlayerAgent(avatar);

    logger.info('Substrate initialized. Commencing heartbeat (600ms pulses).');

    let currentIteration = 0;
    let objectiveMet = false;

    // Main Heartbeat Loop (Recursive Pulse to prevent collisions)
    const runPulse = async () => {
        try {
            currentIteration++;
            if (currentIteration > iterations) {
                console.log(`\n\x1b[38;5;214m[ TRAINING CYCLE COMPLETE ]\x1b[0m`);
                console.log(`Total Iterations: ${currentIteration - 1}`);
                console.log(`Objective Met:    ${objectiveMet ? '\x1b[38;5;46mYES\x1b[0m' : '\x1b[38;5;196mNO\x1b[0m'}`);
                process.exit(0);
            }

            const state = avatar.state;
            state.tickNumber = (state.tickNumber ?? 0) + 1;

            // 1. Simulation Step (Forensic Script 15627/6488 Bypass)
            await harness.processTick(state.tickNumber, state, avatar);

            // 2. Interaction Logic: Trigger Survey Script (10905) if objective is survey_complete
            if (objective === 'survey_complete' && !objectiveMet) {
                // Simulate an interaction with the Beta Host
                const gateway = new InteractionGateway();
                const dialogueEvents = gateway.handleDialogueScript(10905, avatar);
                
                if (avatar.metadata.surveyCompleted) {
                    objectiveMet = true;
                    dialogueEvents.forEach((e: string) => console.log(`\x1b[38;5;46m[EVENT]\x1b[0m ${e}`));
                }
            }

            // 3. Cognitive Step (Tactical Evasion / Objective Seeking)
            agent.evaluateTacticalPosition({ 
                heatmap: new Uint8Array(4356),
                safespots: [],
                projections: new Map() 
            } as any);

            if (debugOverlay && state.tickNumber % 5 === 0) {
                console.log(`[Tick ${state.tickNumber}] Pos: [${avatar.x}, ${avatar.y}] | HP: ${avatar.currentHp}/${avatar.maxHp} | Adrenaline: ${avatar.adrenalinePercent} | AnimID: ${avatar.animationId} | Iter: ${currentIteration}/${iterations}`);
            }
        } catch (err) {
            logger.error({ err }, 'Heartbeat failure.');
        } finally {
            // Schedule next pulse only after current one finishes
            setTimeout(runPulse, 600);
        }
    };

    runPulse();
}

main().catch(err => {
    console.error(`\x1b[38;5;196m[FATAL]\x1b[0m`, err);
    process.exit(1);
});
