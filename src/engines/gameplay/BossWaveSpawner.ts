/**
 * BossWaveSpawner.ts
 *
 * Generic wave controller driven entirely by a BossTemplate.
 * Registers NPCs with SimulationHarness on the correct game tick.
 * Evaluates completion triggers and mechanic phase transitions each tick.
 *
 * Works for any boss with a template — Zuk, Telos, Vorago, etc.
 * No boss-specific code lives here.
 *
 * Clock contract:
 *   - ALL time comparisons use CanonicalClock.getGameTick()
 *   - simulatedNow() used only for event timestamps
 *   - rng() used for mechanic damage rolls (seeded, deterministic)
 *   - Date.now() / performance.now() NEVER used inside tick boundaries
 */

import { createLogger } from '../../utils/logger.js';
import { CanonicalClock, RS_TICKS } from '../../utils/CanonicalClock.js';
import { Coord, GameState, NPC } from '../../core/models.js';
import {
    BossTemplate,
    WaveDefinition,
    NpcSpawnDefinition,
    MechanicDefinition,
    BossTemplateLoader,
} from './BossTemplateLoader.js';
import { NpcAgentConfig } from './NpcAgent.js';

const logger = createLogger('BossWaveSpawner');

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export interface SpawnedNpc {
    npcId: number;
    name: string;
    entityKey: string;
    currentHp: number;
    maxHp: number;
    spawnTick: number;      // CanonicalClock.getGameTick() at spawn
    coord: Coord;
    style: NpcSpawnDefinition['style'];
    stunImmune: boolean;
    dead: boolean;
}

export interface MechanicEvent {
    mechId: string;
    triggeredAtTick: number;    // CanonicalClock.getGameTick()
    triggeredAtTime: number;    // clock.simulatedNow()
    mechanic: MechanicDefinition;
    resolvedAtTick?: number;
}

export interface WaveResult {
    wave: number;
    label: string;
    startTick: number;
    endTick: number | null;     // null if still active
    durationTicks: number | null;
    npcsSpawned: number;
    mechanicsTriggered: MechanicEvent[];
    complete: boolean;
}

export interface SpawnerState {
    currentWave: number;
    waveResults: WaveResult[];
    activeNpcs: Map<string, SpawnedNpc>;
    complete: boolean;
    totalWaves: number;
}

// ═══════════════════════════════════════════════════════
// BossWaveSpawner
// ═══════════════════════════════════════════════════════

export class BossWaveSpawner {
    private template: BossTemplate;
    private baseCoord: Coord;
    private clock: CanonicalClock;

    private currentWaveIndex = 0;
    private waveResults: WaveResult[] = [];
    private activeNpcs: Map<string, SpawnedNpc> = new Map();
    private triggeredMechanics: Set<string> = new Set();
    private complete = false;
    private waveStartTick = 0;

    // Mechanic event log for the sim output report
    private mechanicLog: MechanicEvent[] = [];

    constructor(template: BossTemplate, baseCoord: Coord) {
        this.template = template;
        this.baseCoord = baseCoord;
        this.clock = CanonicalClock.getInstance();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public get state(): SpawnerState {
        return {
            currentWave: this.currentWaveIndex + 1,
            waveResults: this.waveResults,
            activeNpcs: this.activeNpcs,
            complete: this.complete,
            totalWaves: this.template.waves.length,
        };
    }

    public isComplete(): boolean {
        return this.complete;
    }

    /**
     * tick() — Called once per T1 game tick (600ms) by the simulation runner.
     * Returns NpcAgentConfig entries for any NPCs spawned this tick.
     * Emits mechanic events when phase transition conditions are met.
     *
     * @param gameState  Current GameState (npcMap updated here)
     * @returns          Array of [entityKey, NpcAgentConfig] for newly spawned NPCs
     */
    public tick(gameState: GameState): Array<[string, NPC, NpcAgentConfig]> {
        if (this.complete) return [];

        const currentTick = this.clock.getGameTick();
        const currentWave = this.template.waves[this.currentWaveIndex];
        if (!currentWave) {
            this.complete = true;
            return [];
        }

        // ── Wave entry: spawn NPCs on first tick of the wave ─────────────────
        const freshSpawns: Array<[string, NPC, NpcAgentConfig]> = [];

        if (this.waveResults.length <= this.currentWaveIndex) {
            // First tick of this wave
            this.waveStartTick = currentTick;
            logger.info({ wave: currentWave.wave, label: currentWave.label, tick: currentTick },
                '[BossWaveSpawner] Wave starting.');

            this.triggeredMechanics.clear();

            for (const spawn of currentWave.spawns) {
                const result = this.spawnNpc(spawn, gameState, currentTick);
                freshSpawns.push(result);
            }

            this.waveResults.push({
                wave: currentWave.wave,
                label: currentWave.label,
                startTick: currentTick,
                endTick: null,
                durationTicks: null,
                npcsSpawned: currentWave.spawns.length,
                mechanicsTriggered: [],
                complete: false,
            });
        }

        // ── Phase transition checks ───────────────────────────────────────────
        this.evaluateMechanics(currentWave, gameState, currentTick);

        // ── Completion check ──────────────────────────────────────────────────
        if (this.isWaveComplete(currentWave, gameState)) {
            const result = this.waveResults[this.waveResults.length - 1];
            result.endTick = currentTick;
            result.durationTicks = currentTick - this.waveStartTick;
            result.complete = true;
            result.mechanicsTriggered = this.mechanicLog.filter(
                m => m.triggeredAtTick >= this.waveStartTick && m.triggeredAtTick <= currentTick
            );

            logger.info({
                wave: currentWave.wave,
                durationTicks: result.durationTicks,
                durationMs: result.durationTicks * RS_TICKS.GAME_TICK_MS,
            }, '[BossWaveSpawner] Wave complete.');

            this.currentWaveIndex++;

            if (this.currentWaveIndex >= this.template.waves.length) {
                this.complete = true;
                logger.info({ boss: this.template._meta.name, totalTicks: currentTick },
                    '[BossWaveSpawner] All waves complete. Encounter finished.');
            }
        }

        return freshSpawns;
    }

    // ── NPC Spawning ──────────────────────────────────────────────────────────

    private spawnNpc(
        spawnDef: NpcSpawnDefinition,
        gameState: GameState,
        spawnTick: number
    ): [string, NPC, NpcAgentConfig] {
        const rng = this.clock.rng();
        const entityKey = rng.id(`npc_${spawnDef.npcId}`);

        const coord: Coord = {
            x: this.baseCoord.x + (spawnDef.spawnOffset?.x ?? 0),
            y: this.baseCoord.y + (spawnDef.spawnOffset?.y ?? 0),
            plane: this.baseCoord.plane,
        };

        const spawnedNpc: SpawnedNpc = {
            npcId: spawnDef.npcId,
            name: spawnDef.name,
            entityKey,
            currentHp: spawnDef.hp,
            maxHp: spawnDef.hp,
            spawnTick,
            coord,
            style: spawnDef.style,
            stunImmune: spawnDef.stunImmune,
            dead: false,
        };

        this.activeNpcs.set(entityKey, spawnedNpc);

        // Build GameState NPC record
        const npc: NPC = {
            id: spawnDef.npcId,
            name: spawnDef.name,
            x: coord.x,
            y: coord.y,
            plane: coord.plane,
            coord,
            combat: spawnDef.combatLevel,
            adrenaline: 0,
            necrosisStacks: 0,
            residualSouls: 0,
            lastCombatTick: spawnTick,
            cooldowns: {},
            combatStats: { currentHp: spawnDef.hp, maxHp: spawnDef.hp },
            metadata: {
                stunImmune: spawnDef.stunImmune,
                aggroRange: spawnDef.aggroRange,
                combatStyle: spawnDef.style,
                weaponDamage: spawnDef.combatLevel * 10,
                spawnedAtTick: spawnTick,       // CanonicalClock tick — not wall time
                entityKey,
            },
        } as any;

        gameState.npcMap.set(entityKey as any, npc);

        // NpcAgent config — archetype derived from boss style (not hardcoded)
        const archetype = spawnDef.style === 'melee' ? 'aggressive'
            : spawnDef.style === 'magic' ? 'methodical'
            : spawnDef.style === 'ranged' ? 'predator'
            : 'aggressive';

        const agentConfig: NpcAgentConfig = {
            behavior: 'stationary',
            tacticalArchetype: archetype,
            combatStyle: spawnDef.style,
        };

        logger.info({
            name: spawnDef.name,
            entityKey,
            coord,
            hp: spawnDef.hp,
            spawnTick,
            simTime: this.clock.simulatedNow(),
        }, '[BossWaveSpawner] NPC spawned.');

        return [entityKey, npc, agentConfig];
    }

    // ── Mechanic Evaluation ───────────────────────────────────────────────────

    private evaluateMechanics(wave: WaveDefinition, gameState: GameState, currentTick: number): void {
        // Find primary boss NPC for HP ratio checks
        const bossNpc = this.getPrimaryBossNpc(gameState);
        const hpRatio = bossNpc
            ? ((bossNpc as any).combatStats?.currentHp ?? 0) / ((bossNpc as any).combatStats?.maxHp ?? 1)
            : 1.0;

        const newlyTriggered = BossTemplateLoader.resolveActiveMechanics(
            this.template,
            wave.mechanics,
            hpRatio,
            this.triggeredMechanics
        );

        for (const mechId of newlyTriggered) {
            this.triggeredMechanics.add(mechId);
            const mech = this.template.mechanics[mechId];
            if (!mech) continue;

            const event: MechanicEvent = {
                mechId,
                triggeredAtTick: currentTick,
                triggeredAtTime: this.clock.simulatedNow(),
                mechanic: mech,
            };

            this.mechanicLog.push(event);

            logger.info({ mechId, hpRatio, tick: currentTick, simTime: this.clock.simulatedNow() },
                '[BossWaveSpawner] Mechanic triggered.');

            // Mechanic spawns (e.g. healer_spawn_at_50pct)
            if (mech.spawns && mech.spawns.length > 0) {
                for (const healerSpawn of mech.spawns) {
                    this.spawnNpc(healerSpawn, gameState, currentTick);
                }
                logger.info({ mechId, count: mech.spawns.length }, '[BossWaveSpawner] Mechanic spawned additional NPCs.');
            }
        }
    }

    // ── Completion Logic ──────────────────────────────────────────────────────

    private isWaveComplete(wave: WaveDefinition, gameState: GameState): boolean {
        const trigger = wave.completionTrigger;

        if (trigger.type === 'all_dead') {
            // All active NPCs from this wave must be dead or removed from gameState
            for (const [key, spawnedNpc] of this.activeNpcs) {
                const liveNpc = gameState.npcMap.get(key as any);
                if (liveNpc) {
                    const hp = (liveNpc as any).combatStats?.currentHp ?? 1;
                    if (hp > 0) return false;
                }
            }
            return true;
        }

        if (trigger.type === 'boss_dead') {
            const bossNpc = this.getPrimaryBossNpc(gameState);
            if (!bossNpc) return true;
            const hp = (bossNpc as any).combatStats?.currentHp ?? 0;
            return hp <= 0;
        }

        if (trigger.type === 'tick_elapsed' && trigger.tickCount) {
            return (this.clock.getGameTick() - this.waveStartTick) >= trigger.tickCount;
        }

        return false;
    }

    private getPrimaryBossNpc(gameState: GameState): NPC | undefined {
        // Primary boss: highest HP entity or the one matching the template name
        let best: NPC | undefined;
        let bestHp = 0;
        for (const [, npc] of gameState.npcMap) {
            const hp = (npc as any).combatStats?.maxHp ?? 0;
            if (hp > bestHp && npc.name?.toLowerCase().includes(this.template._meta.name.toLowerCase().split(' ')[0].toLowerCase())) {
                bestHp = hp;
                best = npc;
            }
        }
        return best;
    }

    public getMechanicLog(): MechanicEvent[] {
        return this.mechanicLog;
    }

    public getWaveResults(): WaveResult[] {
        return this.waveResults;
    }
}

