#!/usr/bin/env node
/**
 * POG2 Sovereign Switchboard — Standalone Launcher
 * Boots the SwitchboardLimb WebSocket server on port 8788.
 * Run: npm run switchboard
 */

import { SwitchboardLimb } from './monitor/SwitchboardLimb.js';
import { rsmvBridge } from './utils/RSMVBridge.js';

const PORT = 8789;

// Minimal orchestrator stub — accepts commands and echoes acknowledgement.
const minimalOrchestrator = {
    async run(intent: string) {
        console.log(`[SWITCHBOARD] Received intent: ${intent}`);

        if (intent.startsWith('GET_LIVE_RSMV')) {
            const parts = intent.split(' ');
            const x = parseInt(parts[1] || '3200');
            const z = parseInt(parts[2] || '3200');
            const plane = parseInt(parts[3] || '0');

            console.log(`[SWITCHBOARD] ⚡ Requesting LIVE RSMV Extraction at [${x}, ${z}, ${plane}]`);
            const result = await rsmvBridge.getCollision(x, z, plane);

            if (result.ok) {
                return { ok: true, value: { type: 'LIVE_RSMV', ...result.value }, error: null };
            } else {
                return { ok: false, value: null, error: result.error.message };
            }
        }

        return { ok: true, value: { data: `ACK: ${intent}` }, error: null };
    }
};

async function main() {
    const switchboard = SwitchboardLimb.getInstance();
    switchboard.initialize();

    try {
        const result = await switchboard.startWithGracefulPort(minimalOrchestrator, PORT);
        console.log(`\x1b[32m[SWITCHBOARD] ✅ Sovereign Bridge ACTIVE on ${result.url}\x1b[0m`);
        console.log(`\x1b[36m[SWITCHBOARD] rsmv SovereignBridge can now connect.\x1b[0m`);
    } catch (err: any) {
        console.error(`\x1b[31m[SWITCHBOARD] ❌ Failed to start: ${err.message}\x1b[0m`);
        process.exit(1);
    }

    // Broadcast a tick + state_sync every 600ms to keep connected clients alive
    setInterval(() => {
        const switchboard = SwitchboardLimb.getInstance();
        const tick = Date.now();

        switchboard.broadcast({ type: 'tick_event', tick, events: [] });

        // Synthesize a state_sync so SovereignHUD renders immediately.
        // When a real game session is active, gameState is populated by syncGameState();
        // otherwise we emit a sentinel stub at the canonical spawn point.
        const gs = (switchboard as any).gameState;
        const avatar = gs?.avatar ?? {
            username: 'POG2_Sovereign',
            x: 3712, y: 3328, plane: 0,
            isBusy: false
        };
        switchboard.broadcast({
            type: 'state_sync',
            tick,
            state: {
                tick,
                avatar: {
                    ...avatar,
                    inventory: gs?.avatar?.inventory ?? Array(28).fill(null),
                    skills:    gs?.avatar?.skills    ?? {},
                    bank:      gs?.avatar?.bank      ?? [],
                    wallet:    gs?.avatar?.wallet     ?? {},
                    quests:    gs?.avatar?.quests     ?? { points: 0, completedCount: 0, quests: {} },
                    metadata:  gs?.avatar?.metadata   ?? {
                        combat_state: { necrosis: 0, souls: 0, adrenaline: 0 }
                    }
                },
                activeModule: gs?.activeModule ?? 'CNS'
            }
        });
    }, 600);


    process.on('SIGINT', async () => {
        console.log('\n[SWITCHBOARD] Closing DB substrates...');
        try {
            const { SovereignDBLifecycle } = await import('./utils/SovereignDBLifecycle.js');
            await SovereignDBLifecycle.getInstance().shutdown();
        } catch (err) {
            console.error(`[SWITCHBOARD] DB Lifecycle error: ${(err as Error).message}`);
        }
        console.log('[SWITCHBOARD] Shutting down...');
        process.exit(0);
    });
}

main();
