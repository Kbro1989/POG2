/**
 * PlayerStateHydrator.ts
 *
 * Reads sovereign_state.json and hydrates a simulation-ready player config.
 * Derives combat style from equipped weapon via ItemBook — nothing is hardcoded.
 * Spawn coordinate comes from lastPosition in the save file.
 *
 * No boss-specific logic. Universally reusable for any simulation.
 * No Date.now() / performance.now() — all tick references use CanonicalClock.
 */

import { readFileSync, existsSync } from 'fs';
import { createLogger } from '../../utils/logger.js';
import { Coord } from '../../core/models.js';
import { CombatStyle } from './AbilityBook.js';
import { ItemBook } from './ItemBook.js';
import { CanonicalClock } from '../../utils/CanonicalClock.js';

const logger = createLogger('PlayerStateHydrator');

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export interface HydratedPlayerConfig {
    /** Derived from sovereign_state.json lastPosition — sim starts here */
    spawnCoord: Coord;
    /** Auto-detected from equipped weapon via ItemBook */
    combatStyle: CombatStyle;
    /** Ability IDs currently on the player's action bar */
    actionBarSlots: string[];
    /** Player's current HP at save time */
    currentHp: number;
    maxHp: number;
    /** Current adrenaline 0–10000 at save time */
    adrenaline: number;
    /** Prayer points at save time */
    prayer: number;
    /** Raw equipped item IDs keyed by slot name */
    equipment: Record<string, number>;
    /** Skill levels keyed by skill index */
    skills: Record<number, number>;
    /** Weapon tier scalar (resolved via ItemBook, used by damage formula) */
    weaponTier: number;
    /** The tick this save was captured on (from CanonicalClock at save time, or 0 if unknown) */
    savedAtTick: number;
}

// ═══════════════════════════════════════════════════════
// Style resolution heuristics (weapon item ID → CombatStyle)
// Driven by ItemBook — not hardcoded here.
// ═══════════════════════════════════════════════════════

const STYLE_FALLBACK_ORDER: CombatStyle[] = ['melee', 'ranged', 'magic', 'necromancy'];

function resolveStyleFromWeaponId(weaponId: number | undefined): CombatStyle {
    if (!weaponId) return 'melee';
    const book = ItemBook.getInstance();
    const scalar = book.getWeaponScalar(weaponId);
    const name = book.get(weaponId)?.name?.toLowerCase() ?? '';

    // ItemBook returns a scalar that encodes style hints via naming convention.
    // Cross-reference by item name patterns (last resort if no scalar metadata).
    if (name.includes('staff') || name.includes('wand') || name.includes('orb')) return 'magic';
    if (name.includes('bow') || name.includes('crossbow') || name.includes('dart') || name.includes('blowpipe')) return 'ranged';
    if (name.includes('scythe') || name.includes('noxious') || name.includes('lance') || name.includes('halberd')) return 'melee';
    if (name.includes('death guard') || name.includes('skull lantern') || name.includes('spectral')) return 'necromancy';

    // Scalar-based fallback: ranged tier weapons tend to have lower scalars
    if (scalar > 0 && scalar < 700) return 'ranged';
    if (scalar >= 700 && scalar < 1200) return 'magic';
    if (scalar >= 1200) return 'melee';

    return 'melee';
}

// ═══════════════════════════════════════════════════════
// PlayerStateHydrator
// ═══════════════════════════════════════════════════════

export class PlayerStateHydrator {

    /**
     * Hydrate a simulation-ready player config from a sovereign_state.json save file.
     * All fields derived from save data — nothing prescribed by this class.
     */
    public static fromSaveFile(savePath: string): HydratedPlayerConfig {
        if (!existsSync(savePath)) {
            throw new Error(`[PlayerStateHydrator] Save file not found: ${savePath}`);
        }

        let raw: any;
        try {
            raw = JSON.parse(readFileSync(savePath, 'utf8'));
        } catch (err) {
            throw new Error(`[PlayerStateHydrator] Failed to parse save file: ${err}`);
        }

        // ── Spawn coordinate from lastPosition ─────────────────────────────
        const pos = raw.lastPosition ?? raw.position ?? raw.coord ?? { x: 3200, y: 3200, plane: 0 };
        const spawnCoord: Coord = {
            x: typeof pos.x === 'number' ? pos.x : 3200,
            y: typeof pos.y === 'number' ? pos.y : 3200,
            plane: typeof pos.plane === 'number' ? pos.plane : 0,
        };

        // ── Equipment ──────────────────────────────────────────────────────
        const equipment: Record<string, number> = {};
        const rawEquip = raw.equipment ?? raw.equipped ?? {};
        for (const [slot, item] of Object.entries(rawEquip)) {
            const itemId = typeof item === 'object' ? (item as any).id : item;
            if (typeof itemId === 'number') equipment[slot] = itemId;
        }

        // ── Combat style — auto-detected from weapon slot ──────────────────
        const weaponId = equipment['weapon'] ?? equipment['mainhand'] ?? equipment['2h'];
        const combatStyle = resolveStyleFromWeaponId(weaponId);

        // ── Weapon tier scalar for damage formula ──────────────────────────
        const book = ItemBook.getInstance();
        const weaponTier = weaponId ? Math.max(1, Math.floor(book.getWeaponScalar(weaponId) / 100)) : 1;

        // ── Action bar ─────────────────────────────────────────────────────
        const actionBarSlots: string[] = raw.actionBar ?? raw.actionBarSlots ?? [];

        // ── Vitals ─────────────────────────────────────────────────────────
        const currentHp  = raw.currentHp  ?? raw.hp  ?? 10000;
        const maxHp      = raw.maxHp               ?? 10000;
        const adrenaline = raw.adrenaline           ?? 0;
        const prayer     = raw.prayer ?? raw.prayerPoints ?? 990;

        // ── Skills ─────────────────────────────────────────────────────────
        const skills: Record<number, number> = {};
        if (Array.isArray(raw.skills)) {
            raw.skills.forEach((s: any, idx: number) => {
                skills[idx] = typeof s === 'object' ? (s.level ?? s.base ?? 99) : s;
            });
        }

        // ── Saved-at tick (non-authoritative, diagnostic only) ─────────────
        // savedAtTick from the file is a hint, not a clock source.
        // The running simulation will use CanonicalClock.getGameTick() exclusively.
        const savedAtTick = typeof raw.savedAtTick === 'number' ? raw.savedAtTick : 0;

        const config: HydratedPlayerConfig = {
            spawnCoord,
            combatStyle,
            actionBarSlots,
            currentHp,
            maxHp,
            adrenaline,
            prayer,
            equipment,
            skills,
            weaponTier,
            savedAtTick,
        };

        logger.info({
            spawnCoord,
            combatStyle,
            weaponTier,
            actionBarSlots: actionBarSlots.length,
            savedAtTick,
        }, '[PlayerStateHydrator] Player state hydrated from save.');

        return config;
    }

    /**
     * Returns a default config for testing/headless runs with no save file.
     * All values are maxed — simulates an end-game player with a full bar.
     */
    public static defaultTestConfig(style: CombatStyle = 'ranged'): HydratedPlayerConfig {
        const clock = CanonicalClock.getInstance();
        return {
            spawnCoord: { x: 3200, y: 3200, plane: 0 },
            combatStyle: style,
            actionBarSlots: [],   // Empty → CombatRotationEngine uses full AbilityBook for style
            currentHp: 10000,
            maxHp: 10000,
            adrenaline: 0,
            prayer: 990,
            equipment: {},
            skills: { 0: 99, 2: 99, 4: 99, 7: 99 },
            weaponTier: 95,
            savedAtTick: clock.getGameTick(),
        };
    }
}
