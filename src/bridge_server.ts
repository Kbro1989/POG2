#!/usr/bin/env node
/**
 * POG2 CombatHUDBridge — Standalone Launcher
 * Boots the WebSocket bridge on port 8080 so unified_diagnostic.html can connect.
 * Run: npx tsx src/bridge_server.ts
 * 
 * In standalone mode, emits simulated tick data so the diagnostic UI
 * can render without the full PlayerAgent/SimulationHarness stack.
 */

import { CombatHUDBridge } from './utils/CombatHUDBridge.js';

async function main() {
    console.log(`\x1b[38;5;33m[ POG2 COMBAT HUD BRIDGE ]\x1b[0m`);
    console.log(`\x1b[38;5;244m─────────────────────────────────\x1b[0m`);

    const bridge = CombatHUDBridge.getInstance();

    console.log(`\x1b[32m✅ CombatHUDBridge active on ws://localhost:8080\x1b[0m`);
    console.log(`\x1b[36m   Health endpoint: http://localhost:8080/health\x1b[0m`);
    console.log(`\x1b[38;5;244m   Open unified_diagnostic.html in browser to connect.\x1b[0m`);
    console.log(`\x1b[38;5;244m─────────────────────────────────\x1b[0m\n`);

    // Heartbeat: emit simulated state every 600ms so the UI stays alive
    let tick = 0;
    const archetypes = ['aggressive', 'defensive', 'balanced', 'evasive'];
    const phases = ['Smoke Phase', 'Shadow Phase', 'Blood Phase', 'Ice Phase', 'Zaros Phase'];
    const kernelPhases = ['STABLE', 'EXPLORING', 'FALSE_STABILITY', 'ANOMALY'];
    const abilities = ['Galeshot', 'Ricochet', 'Snap Shot', 'Rapid Fire', 'Bombardment', 'Shadow Tendrils'];

    setInterval(() => {
        tick++;
        const adrenaline = Math.min(1000, Math.floor(Math.random() * 1000));
        const archetype = archetypes[Math.floor(tick / 10) % archetypes.length];
        const phase = phases[Math.floor(tick / 15) % phases.length];
        const kernel = kernelPhases[Math.floor(Math.random() * kernelPhases.length)];
        const nextAbility = abilities[Math.floor(Math.random() * abilities.length)];

        bridge.updateState(
            adrenaline,
            archetype,
            `Tick ${tick}: auto-attack`,
            'PVME Nex Rotation',
            nextAbility,
            'ranged',
            phase,
            200000 - (tick * 100),
            kernel
        );

        // Occasional hitsplat
        if (tick % 3 === 0) {
            const dmg = Math.floor(Math.random() * 800) + 100;
            bridge.hitsplat(dmg, Math.random() > 0.7 ? 'CRIT' : 'DAMAGE', 'nex');
        }

        if (tick % 10 === 0) {
            console.log(`[Bridge] Tick ${tick} | Clients: check /health`);
        }
    }, 600);

    process.on('SIGINT', () => {
        console.log('\n[Bridge] Shutting down...');
        process.exit(0);
    });
}

main();
