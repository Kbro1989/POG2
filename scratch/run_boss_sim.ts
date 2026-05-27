/**
 * run_boss_sim.ts — Headless Boss Simulation Runner
 *
 * Usage:
 *   npx ts-node --esm scratch/run_boss_sim.ts --boss tzkal_zuk
 *   npx ts-node --esm scratch/run_boss_sim.ts --boss tzkal_zuk --save D:\sovereign\memory\sovereign_state.json
 *   npx ts-node --esm scratch/run_boss_sim.ts --boss tzkal_zuk --save <path> --seed 42 --max-ticks 5000
 *
 * Clock contract (STRICT):
 *   - CanonicalClock.bootstrap(seed) called exactly once at entry
 *   - All tick advancement via clock.pulse(TickTier.GAME)
 *   - simulatedNow() for event timestamps only
 *   - rng() for all random rolls (seeded, deterministic)
 *   - Date.now() / performance.now() ONLY in top-level diagnostics (outside tick boundary)
 *   - Wall time is NEVER stored in state or output events
 */

import { existsSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { performance } from 'perf_hooks';

import { CanonicalClock, TickTier, RS_TICKS } from '../src/utils/CanonicalClock.js';
import { BossTemplateLoader } from '../src/engines/gameplay/BossTemplateLoader.js';
import { BossWaveSpawner } from '../src/engines/gameplay/BossWaveSpawner.js';
import { PlayerStateHydrator, HydratedPlayerConfig } from '../src/engines/gameplay/PlayerStateHydrator.js';
import { AbilityBook } from '../src/engines/gameplay/AbilityBook.js';
import { CombatRotationEngine, CombatEvaluationContext, CombatDecisionTrace } from '../src/engines/gameplay/CombatRotationEngine.js';
import { PVMERotationLimb } from '../src/limbs/gameplay/PVMERotationLimb.js';
import { GameState, Coord } from '../src/core/models.js';
import { createLogger } from '../src/utils/logger.js';

const logger = createLogger('BossSimRunner');

// ═══════════════════════════════════════════════════════
// CLI args
// ═══════════════════════════════════════════════════════

function parseArgs(): { boss: string; savePath: string | null; seed: number; maxTicks: number; simMode: boolean } {
    const args = process.argv.slice(2);
    const get = (flag: string) => {
        const idx = args.indexOf(flag);
        return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
    };
    const has = (flag: string) => args.includes(flag);
    const boss = get('--boss') ?? 'tzkal_zuk';
    const savePath = get('--save') ?? null;
    const seed = parseInt(get('--seed') ?? '0', 10);
    const maxTicks = parseInt(get('--max-ticks') ?? '10000', 10);
    const simMode = has('--sim-mode') || has('--god-mode');
    return { boss, savePath, seed, maxTicks, simMode };
}

// ═══════════════════════════════════════════════════════
// Minimal GameState factory for headless sim
// ═══════════════════════════════════════════════════════

function createHeadlessGameState(): GameState {
    return {
        tick: 0,
        tickNumber: 0,
        players: new Map(),
        npcMap: new Map(),
        objectMap: new Map(),
        npcSpatialIndex: new Map(),
        groundItems: new Map(),
        messages: [],
    } as any;
}

// ═══════════════════════════════════════════════════════
// Adrenaline trace entry (clock-keyed)
// ═══════════════════════════════════════════════════════

interface AdrenalineEntry {
    gameTick: number;
    simTimeMs: number;    // clock.simulatedNow() — NOT wall time
    adrenaline: number;   // 0–10000
}

// ═══════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════

async function main() {
    const wallStart = performance.now(); // diagnostics only — never enters state
    const { boss: bossId, savePath, seed, maxTicks, simMode } = parseArgs();

    // ── 1. Bootstrap the clock — exactly once ───────────────────────────────
    CanonicalClock.bootstrap(seed);
    const clock = CanonicalClock.getInstance();

    logger.info({ bossId, savePath, seed, maxTicks }, '[SimRunner] Bootstrapped. Deterministic lattice anchored.');

    // ── 2. Load boss template ────────────────────────────────────────────────
    const template = BossTemplateLoader.load(bossId);
    logger.info({ name: template._meta.name, waves: template.waves.length }, '[SimRunner] Template loaded.');

    // ── 3. Hydrate player from save (or default test config) ─────────────────
    const DEFAULT_SAVE = resolve('D:', 'sovereign', 'memory', 'sovereign_state.json');
    const effectiveSave = savePath ?? (existsSync(DEFAULT_SAVE) ? DEFAULT_SAVE : null);

    let playerConfig: HydratedPlayerConfig;
    if (effectiveSave && existsSync(effectiveSave) && !simMode) {
        playerConfig = PlayerStateHydrator.fromSaveFile(effectiveSave);
        
        // Auto-escalation: If this is Zuk and stats/progression are insufficient, promote to god-mode Simulation State
        if (bossId === 'tzkal_zuk') {
            const { ProgressionValidator, ZUK_GATE } = await import('../src/core/ProgressionValidator.js');
            // Build temporary state object in ProgressionValidator expected format
            const stateForGate = {
                skills: playerConfig.skills,
                inventory: playerConfig.equipment ? Object.entries(playerConfig.equipment).map(([slot, id]) => ({ id, equipped: true })) : [],
                bank: [],
                questStages: {}
            };
            if (!ProgressionValidator.canEnter(ZUK_GATE, stateForGate)) {
                logger.warn('[SimRunner] Save file has insufficient levels/progression for TzKal-Zuk. Automatically upgrading session to high-level god-mode Simulation State to avoid death loop.');
                playerConfig = PlayerStateHydrator.defaultTestConfig(playerConfig.combatStyle);
            }
        }
    } else {
        logger.warn('[SimRunner] Initialising in god-mode Simulation State (max stats).');
        playerConfig = PlayerStateHydrator.defaultTestConfig('ranged');
    }

    // ── 4. Initialise simulation state ───────────────────────────────────────
    const gameState = createHeadlessGameState();
    const spawnCoord: Coord = playerConfig.spawnCoord;

    // Spawner uses the boss world coord as base, not player coord
    const bossBaseCoord: Coord = {
        x: template._meta.worldCoord.x,
        y: template._meta.worldCoord.y,
        plane: template._meta.worldCoord.plane,
    };

    const spawner = new BossWaveSpawner(template, bossBaseCoord);
    const book = AbilityBook.getInstance();
    const rotationEngine = CombatRotationEngine.getInstance();

    // Seed PVMERotationLimb with any ingested rotation (optional — falls back to archetype)
    const pvme = PVMERotationLimb.getInstance();

    // ── 5. Build player combat context template ───────────────────────────────
    // Derived from playerConfig — not hardcoded
    const availableAbilities = playerConfig.actionBarSlots.length > 0
        ? playerConfig.actionBarSlots
            .map(id => book.get(id) ?? book.getByName(id))
            .filter(Boolean) as ReturnType<AbilityBook['getAll']>
        : book.getByStyle(playerConfig.combatStyle);

    // ── 6. Trace accumulators ─────────────────────────────────────────────────
    const decisionTraces: CombatDecisionTrace[] = [];
    const adrenalineTrace: AdrenalineEntry[] = [];
    const abilityUsageCounts: Map<string, number> = new Map();

    let currentAdrenaline = playerConfig.adrenaline;
    const cooldowns: Record<string, number> = {};
    let gcdEndTick = 0;
    let channelEndTick = 0;

    // ── 7. Tick loop ─────────────────────────────────────────────────────────
    logger.info({ maxTicks, spawnCoord, bossBaseCoord }, '[SimRunner] Entering tick loop.');

    for (let t = 0; t < maxTicks; t++) {
        // T1 boundary: advance clock — world reduces, ledger commits
        const coord = clock.pulse(TickTier.GAME);
        const currentTick = clock.getGameTick();

        // Sync GameState tick counter (uses CanonicalClock — not Date.now())
        gameState.tick = currentTick;
        gameState.tickNumber = currentTick;

        // ── Wave spawner tick ──────────────────────────────────────────────
        const freshSpawns = spawner.tick(gameState);

        // ── Record adrenaline on game tick boundary ────────────────────────
        // simulatedNow() is the authoritative time — not wall clock
        adrenalineTrace.push({
            gameTick: currentTick,
            simTimeMs: clock.simulatedNow(),
            adrenaline: currentAdrenaline,
        });

        // ── Decay adrenaline out of combat (5% per tick outside combat)
        // (simplified: in a boss encounter the player is always in combat)

        // ── Combat rotation evaluation ─────────────────────────────────────
        // Find primary target
        let primaryTarget = null;
        for (const [, npc] of gameState.npcMap) {
            const hp = (npc as any).combatStats?.currentHp ?? 0;
            if (hp > 0) { primaryTarget = npc; break; }
        }

        if (primaryTarget) {
            const ctx: CombatEvaluationContext = {
                adrenaline: currentAdrenaline,
                cooldowns,
                coord: spawnCoord,
                currentTick,
                gcdEndTick,
                channelEndTick,
                combatStyle: playerConfig.combatStyle,
                archetype: 'aggressive',
                state: {
                    adrenaline: currentAdrenaline,
                    hp: playerConfig.currentHp,
                    maxHp: playerConfig.maxHp,
                    bloodlustStacks: 0,
                    animaCharged: false,
                    searingWindsTicksRemaining: 0,
                    shadowImbuedTicksRemaining: 0,
                    stunCharges: {},
                    lastCombatTick: currentTick,
                    cooldowns,
                    messages: [],
                },
                availableAbilities,
            };

            const target = {
                entityId: String((primaryTarget as any).id),
                name: primaryTarget.name,
                coord: primaryTarget.coord ?? { x: bossBaseCoord.x, y: bossBaseCoord.y, plane: 0 },
                currentHp: (primaryTarget as any).combatStats?.currentHp ?? 0,
                stunImmunityEndTick: (primaryTarget as any).metadata?.stunImmune ? Number.MAX_SAFE_INTEGER : 0,
            };

            const trace = rotationEngine.evaluateRotation(ctx, target);

            if (trace?.intent?.action === 'execute_ability') {
                const intent = trace.intent;
                decisionTraces.push(trace);

                // Track usage counts
                const count = abilityUsageCounts.get(intent.abilityName) ?? 0;
                abilityUsageCounts.set(intent.abilityName, count + 1);

                // Advance adrenaline — using clock's rng for determinism
                const ability = book.getByName(intent.abilityName);
                if (ability) {
                    if (ability.adrenalineCost > 0) {
                        currentAdrenaline = Math.max(0, currentAdrenaline - ability.adrenalineCost);
                    } else if (ability.adrenalineGain > 0) {
                        currentAdrenaline = Math.min(10000, currentAdrenaline + ability.adrenalineGain);
                    }
                    // Set GCD — RS_TICKS.GLOBAL_ABILITY_COOLDOWN is 3 ticks
                    gcdEndTick = currentTick + RS_TICKS.GLOBAL_ABILITY_COOLDOWN;
                    if (ability.cooldownTicks > 0) {
                        cooldowns[ability.id] = currentTick + ability.cooldownTicks;
                    }
                    if (ability.isChanneled) {
                        channelEndTick = currentTick + ability.channelTicks;
                    }
                }
            }
        }

        if (spawner.isComplete()) {
            logger.info({ finalTick: currentTick, simTimeMs: clock.simulatedNow() },
                '[SimRunner] Encounter complete.');
            break;
        }
    }

    // ── 8. Build output report ────────────────────────────────────────────────
    const finalTick = clock.getGameTick();

    // Ability bar recommendation: sort by usage frequency
    const barRecommendation = Array.from(abilityUsageCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count, pctOfActions: ((count / decisionTraces.length) * 100).toFixed(1) + '%' }));

    // Mechanic interaction log
    const mechanicLog = spawner.getMechanicLog().map(ev => ({
        mechId: ev.mechId,
        triggeredAtTick: ev.triggeredAtTick,
        triggeredAtSimMs: ev.triggeredAtTime,
        description: ev.mechanic.description,
    }));

    const report = {
        _meta: {
            boss: bossId,
            bossName: template._meta.name,
            savePath: effectiveSave,
            seed,
            combatStyle: playerConfig.combatStyle,
            weaponTier: playerConfig.weaponTier,
            spawnCoord,
            simulationDurationTicks: finalTick,
            simulationDurationMs: finalTick * RS_TICKS.GAME_TICK_MS,
            // Wall-time only for diagnostics — never enters state
            wallTimeMs: Math.round(performance.now() - wallStart),
        },
        waveResults: spawner.getWaveResults(),
        mechanicLog,
        adrenalineTrace,
        abilityBarRecommendation: barRecommendation,
        totalAbilityFirings: decisionTraces.length,
        clockHealthAtEnd: clock.healthCheck(),
    };

    // ── 9. Write output ────────────────────────────────────────────────────────
    const outDir = resolve('scratch');
    const outFile = join(outDir, `sim_output_${bossId}_tick${finalTick}.json`);
    writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8');

    console.log(`\n✅ Simulation complete.`);
    console.log(`   Boss:     ${template._meta.name}`);
    console.log(`   Ticks:    ${finalTick} (${(finalTick * RS_TICKS.GAME_TICK_MS / 1000).toFixed(1)}s simulated)`);
    console.log(`   Abilities fired: ${decisionTraces.length}`);
    console.log(`   Output:   ${outFile}`);
    console.log(`\n📊 Ability Bar Recommendation (by frequency):`);
    barRecommendation.slice(0, 10).forEach((a, i) =>
        console.log(`   ${(i + 1).toString().padStart(2)}. ${a.name.padEnd(25)} ${a.pctOfActions} (${a.count}x)`)
    );
    console.log(`\n⚡ Mechanic Log:`);
    mechanicLog.forEach(m =>
        console.log(`   T${m.triggeredAtTick.toString().padStart(4)} [${m.mechId}] ${m.description.slice(0, 60)}`)
    );
}

main().catch(err => {
    console.error('[SimRunner] Fatal error:', err);
    process.exit(1);
});
