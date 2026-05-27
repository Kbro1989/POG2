/**
 * BossTemplateLoader.ts
 *
 * Loads and validates boss templates from D:\POG2\data\boss_templates\.
 * Templates define wave mechanics only — no player ability prescriptions.
 * All temporal references use CanonicalClock.getGameTick() — no Date.now().
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('BossTemplateLoader');

const TEMPLATE_DIR = join('D:', 'POG2', 'data', 'boss_templates');

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export interface NpcSpawnDefinition {
    npcId: number;
    name: string;
    hp: number;
    combatLevel: number;
    style: 'melee' | 'ranged' | 'magic' | 'necromancy';
    stunImmune: boolean;
    aggroRange: number;
    spawnOffset: { x: number; y: number };
    phaseTransitions?: PhaseTransition[];
}

export interface PhaseTransition {
    hpThreshold: number;   // 0.0–1.0 fraction of max HP
    mechanic: string;      // mechanic ID from template's mechanics map
}

export interface CompletionTrigger {
    type: 'all_dead' | 'boss_dead' | 'tick_elapsed' | 'mechanic_resolved';
    tickCount?: number;
    mechanicId?: string;
}

export interface WaveDefinition {
    wave: number;
    label: string;
    spawns: NpcSpawnDefinition[];
    mechanics: string[];               // IDs referencing root mechanics map
    completionTrigger: CompletionTrigger;
    startTick?: number;                // Absolute tick offset from sim start (optional override)
}

export interface MechanicDefinition {
    description: string;
    triggerCondition: string;
    playerActionRequired?: string;
    windowTicks?: number;
    safeTileOffset?: { x: number; y: number };
    durationTicks?: number;
    damage?: number;
    spawns?: NpcSpawnDefinition[];
    attackSpeedBonusTicks?: number;
    pillarCoord?: { x: number; y: number; plane: number };
}

export interface BossTemplate {
    _meta: {
        schema: string;
        id: string;
        name: string;
        location: string;
        worldCoord: { x: number; y: number; plane: number };
        notes: string;
    };
    waves: WaveDefinition[];
    mechanics: Record<string, MechanicDefinition>;
}

// ═══════════════════════════════════════════════════════
// BossTemplateLoader
// ═══════════════════════════════════════════════════════

export class BossTemplateLoader {
    private static cache: Map<string, BossTemplate> = new Map();

    /**
     * Load a boss template by ID.
     * Caches after first read — templates are immutable at runtime.
     */
    public static load(bossId: string): BossTemplate {
        if (this.cache.has(bossId)) {
            return this.cache.get(bossId)!;
        }

        const filePath = join(TEMPLATE_DIR, `${bossId}.json`);
        if (!existsSync(filePath)) {
            throw new Error(`[BossTemplateLoader] No template found for boss: "${bossId}" at ${filePath}`);
        }

        try {
            const raw = JSON.parse(readFileSync(filePath, 'utf8')) as BossTemplate;
            this.validate(raw, bossId);
            this.cache.set(bossId, raw);
            logger.info({ bossId, waves: raw.waves.length, mechanics: Object.keys(raw.mechanics).length },
                'Boss template loaded.');
            return raw;
        } catch (err) {
            throw new Error(`[BossTemplateLoader] Failed to parse template "${bossId}": ${err}`);
        }
    }

    /**
     * List all available boss template IDs in the template directory.
     */
    public static listAvailable(): string[] {
        const { readdirSync } = require('fs') as typeof import('fs');
        if (!existsSync(TEMPLATE_DIR)) return [];
        return readdirSync(TEMPLATE_DIR)
            .filter((f: string) => f.endsWith('.json'))
            .map((f: string) => f.replace('.json', ''));
    }

    private static validate(template: BossTemplate, bossId: string): void {
        if (!template.waves || template.waves.length === 0) {
            throw new Error(`[BossTemplateLoader] Template "${bossId}" has no waves defined.`);
        }
        if (!template.mechanics) {
            throw new Error(`[BossTemplateLoader] Template "${bossId}" has no mechanics map.`);
        }
        // Validate all mechanic references resolve
        for (const wave of template.waves) {
            for (const mechId of wave.mechanics) {
                if (!template.mechanics[mechId]) {
                    logger.warn({ bossId, wave: wave.wave, mechId },
                        'Wave references undefined mechanic — ignoring at runtime.');
                }
            }
        }
    }

    /**
     * Resolve which mechanics are currently active given NPC HP ratio.
     * Called each tick by BossWaveSpawner to check phase transitions.
     */
    public static resolveActiveMechanics(
        template: BossTemplate,
        mechIds: string[],
        npcHpRatio: number,     // 0.0–1.0 (currentHp / maxHp)
        alreadyTriggered: Set<string>
    ): string[] {
        const newly: string[] = [];
        for (const mechId of mechIds) {
            if (alreadyTriggered.has(mechId)) continue;
            const mech = template.mechanics[mechId];
            if (!mech) continue;

            const cond = mech.triggerCondition;
            let triggered = false;

            if (cond === 'always') {
                triggered = true;
            } else if (cond.startsWith('zuk_hp_below_')) {
                const threshold = parseFloat(cond.replace('zuk_hp_below_', '').replace('pct', '')) / 100;
                triggered = npcHpRatio <= threshold;
            } else if (cond.startsWith('wave_')) {
                triggered = true; // Wave-start mechanics always fire at wave entry
            }

            if (triggered) newly.push(mechId);
        }
        return newly;
    }
}
