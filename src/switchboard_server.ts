#!/usr/bin/env node
/**
 * POG2 Sovereign Switchboard — Standalone Launcher
 * Boots the SwitchboardLimb WebSocket server on port 8788.
 * Run: npm run switchboard
 */

import { SwitchboardLimb } from './monitor/SwitchboardLimb.js';

const PORT = 8788;

// Minimal orchestrator stub — accepts commands and echoes acknowledgement.
const minimalOrchestrator = {
    async run(intent: string) {
        console.log(`[SWITCHBOARD] Received intent: ${intent}`);
        return { ok: true, value: { data: `ACK: ${intent}` }, error: null };
    }
};

async function main() {
    const switchboard = SwitchboardLimb.getInstance();
    switchboard.initialize();

    try {
        const result = await switchboard.startWithGracefulPort(minimalOrchestrator, PORT);
        console.log(`\x1b[32m[SWITCHBOARD] ✅ Sovereign Bridge ACTIVE on ${result.url}\x1b[0m`);
        console.log(`\x1b[36m[SWITCHBOARD] rsmv_inspector SovereignBridge can now connect.\x1b[0m`);
    } catch (err: any) {
        console.error(`\x1b[31m[SWITCHBOARD] ❌ Failed to start: ${err.message}\x1b[0m`);
        process.exit(1);
    }

    // Broadcast a tick every 600ms to keep connected clients alive
    setInterval(() => {
        switchboard.broadcast({ type: 'tick_event', tick: Date.now(), events: [] });
    }, 600);

    process.on('SIGINT', () => {
        console.log('\n[SWITCHBOARD] Shutting down...');
        process.exit(0);
    });
}

main();
