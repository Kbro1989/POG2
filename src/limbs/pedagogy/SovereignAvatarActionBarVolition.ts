// ============================================================================
// SovereignAvatarActionBarVolition.ts
// POG2 Production Bridge — HTML Prototype → TypeScript Combat Runtime
// Generated from action_bar_volition.html structural analysis
// ============================================================================

import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';
import { PlayerAgent } from '../../engines/gameplay/PlayerAgent.js';
import { CombatRotationEngine } from '../../engines/gameplay/CombatRotationEngine.js';
import { AdrenalineStateMachine } from '../combat/AdrenalineStateMachine.js';
import { AbilityDiscoveryLimb } from '../spatial/AbilityDiscoveryLimb.js';
import { GhostSplatEngine } from '../../substrates/GhostSplatEngine.js';
import { TemporalHeartbeatLimb } from '../core/TemporalHeartbeatLimb.js';
import { I1841Integration, ActionBarState, ActionBarSlot } from './Interface1841ActionBarMapping.js';

// ─────────────────────────────────────────────────────────────────────────────
// ABILITY DEFINITIONS — RS3 Canonical Ability Library
// Maps to ABILITIES constant from HTML prototype
// ─────────────────────────────────────────────────────────────────────────────

export interface AbilityDefinition {
  id: string;                    // Canonical ID (e.g., 'SLICE')
  name: string;                  // Display name
  tier: 'BASIC' | 'THRESHOLD' | 'ULTIMATE';
  cooldown: number;              // Ticks (600ms per tick)
  adrenGain: number;             // Internal units: 80 = +8%, 500 = 50%, 1000 = 100%
  adrenReq: number;              // Minimum adrenaline to use (internal units)
  damageRange: [number, number]; // [min, max] ability damage %
  skillReqs: { skillId: number; level: number }[];
  weaponReqs: string[];          // Compatible weapon types
  style: 'MELEE' | 'RANGED' | 'MAGIC' | 'ANY';
  isChannelled: boolean;         // True if ability channels over multiple ticks
  channelTicks: number;          // Duration if channelled
}

export const ABILITY_LIBRARY: Record<string, AbilityDefinition> = {
  SLICE: {
    id: 'SLICE', name: 'Slice', tier: 'BASIC', cooldown: 3, adrenGain: 80, adrenReq: 0,
    damageRange: [12, 30], skillReqs: [{ skillId: 0, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  FURY: {
    id: 'FURY', name: 'Fury', tier: 'BASIC', cooldown: 3, adrenGain: 80, adrenReq: 0,
    damageRange: [16, 38], skillReqs: [{ skillId: 1, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: true, channelTicks: 3
  },
  SEVER: {
    id: 'SEVER', name: 'Sever', tier: 'BASIC', cooldown: 15, adrenGain: 80, adrenReq: 0,
    damageRange: [37, 188], skillReqs: [{ skillId: 0, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  SMASH: {
    id: 'SMASH', name: 'Smash', tier: 'BASIC', cooldown: 10, adrenGain: 80, adrenReq: 0,
    damageRange: [25, 125], skillReqs: [{ skillId: 0, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  SLAUGHTER: {
    id: 'SLAUGHTER', name: 'Slaughter', tier: 'THRESHOLD', cooldown: 30, adrenGain: -150, adrenReq: 150,
    damageRange: [100, 250], skillReqs: [{ skillId: 0, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  HURRICANE: {
    id: 'HURRICANE', name: 'Hurricane', tier: 'THRESHOLD', cooldown: 30, adrenGain: -150, adrenReq: 150,
    damageRange: [66, 219], skillReqs: [{ skillId: 0, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  QUAKE: {
    id: 'QUAKE', name: 'Quake', tier: 'THRESHOLD', cooldown: 30, adrenGain: -150, adrenReq: 150,
    damageRange: [43, 219], skillReqs: [{ skillId: 0, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  DISMEMBER: {
    id: 'DISMEMBER', name: 'Dismember', tier: 'BASIC', cooldown: 15, adrenGain: 80, adrenReq: 0,
    damageRange: [20, 100], skillReqs: [{ skillId: 0, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  CLEAVE: {
    id: 'CLEAVE', name: 'Cleave', tier: 'BASIC', cooldown: 3, adrenGain: 80, adrenReq: 0,
    damageRange: [14, 34], skillReqs: [{ skillId: 1, level: 1 }], weaponReqs: ['melee', '2h'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  ASSAULT: {
    id: 'ASSAULT', name: 'Assault', tier: 'THRESHOLD', cooldown: 30, adrenGain: -500, adrenReq: 500,
    damageRange: [94, 217], skillReqs: [{ skillId: 0, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: true, channelTicks: 4
  },
  DESTROY: {
    id: 'DESTROY', name: 'Destroy', tier: 'THRESHOLD', cooldown: 25, adrenGain: -500, adrenReq: 500,
    damageRange: [50, 120], skillReqs: [{ skillId: 1, level: 1 }], weaponReqs: ['melee', '2h'], style: 'MELEE',
    isChannelled: true, channelTicks: 3
  },
  METEOR: {
    id: 'METEOR', name: 'Meteor', tier: 'ULTIMATE', cooldown: 100, adrenGain: -1000, adrenReq: 1000,
    damageRange: [200, 400], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic', '2h'], style: 'MAGIC',
    isChannelled: false, channelTicks: 0
  },
  BERSERK: {
    id: 'BERSERK', name: 'Berserk', tier: 'ULTIMATE', cooldown: 100, adrenGain: -1000, adrenReq: 1000,
    damageRange: [0, 0], skillReqs: [{ skillId: 1, level: 1 }], weaponReqs: ['melee', '2h'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  BACKHAND: {
    id: 'BACKHAND', name: 'Backhand', tier: 'BASIC', cooldown: 3, adrenGain: 80, adrenReq: 0,
    damageRange: [10, 25], skillReqs: [{ skillId: 0, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  FORCEFUL_BACKHAND: {
    id: 'FORCEFUL_BACKHAND', name: 'Forceful Backhand', tier: 'THRESHOLD', cooldown: 30, adrenGain: -500, adrenReq: 500,
    damageRange: [80, 190], skillReqs: [{ skillId: 0, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  OVERPOWER: {
    id: 'OVERPOWER', name: 'Overpower', tier: 'ULTIMATE', cooldown: 100, adrenGain: -1000, adrenReq: 1000,
    damageRange: [300, 500], skillReqs: [{ skillId: 0, level: 1 }], weaponReqs: ['melee'], style: 'MELEE',
    isChannelled: false, channelTicks: 0
  },
  PIERCING_SHOT: {
    id: 'PIERCING_SHOT', name: 'Piercing Shot', tier: 'BASIC', cooldown: 3, adrenGain: 80, adrenReq: 0,
    damageRange: [10, 25], skillReqs: [{ skillId: 3, level: 1 }], weaponReqs: ['ranged'], style: 'RANGED',
    isChannelled: false, channelTicks: 0
  },
  SNAP_SHOT: {
    id: 'SNAP_SHOT', name: 'Snap Shot', tier: 'THRESHOLD', cooldown: 30, adrenGain: -500, adrenReq: 500,
    damageRange: [70, 160], skillReqs: [{ skillId: 3, level: 1 }], weaponReqs: ['ranged'], style: 'RANGED',
    isChannelled: false, channelTicks: 0
  },
  DEADSHOT: {
    id: 'DEADSHOT', name: 'Deadshot', tier: 'ULTIMATE', cooldown: 100, adrenGain: -1000, adrenReq: 1000,
    damageRange: [150, 300], skillReqs: [{ skillId: 3, level: 1 }], weaponReqs: ['ranged'], style: 'RANGED',
    isChannelled: false, channelTicks: 0
  },
  WRACK: {
    id: 'WRACK', name: 'Wrack', tier: 'BASIC', cooldown: 3, adrenGain: 80, adrenReq: 0,
    damageRange: [10, 25], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: false, channelTicks: 0
  },
  DRAGON_BREATH: {
    id: 'DRAGON_BREATH', name: "Dragon Breath", tier: 'BASIC', cooldown: 10, adrenGain: 80, adrenReq: 0,
    damageRange: [37, 188], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: false, channelTicks: 0
  },
  SONIC_WAVE: {
    id: 'SONIC_WAVE', name: 'Sonic Wave', tier: 'BASIC', cooldown: 5, adrenGain: 80, adrenReq: 0,
    damageRange: [33, 157], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: false, channelTicks: 0
  },
  CONC_BLAST: {
    id: 'CONC_BLAST', name: 'Concentrated Blast', tier: 'BASIC', cooldown: 5, adrenGain: 80, adrenReq: 0,
    damageRange: [25, 125], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: true, channelTicks: 3
  },
  COMBUST: {
    id: 'COMBUST', name: 'Combust', tier: 'BASIC', cooldown: 15, adrenGain: 80, adrenReq: 0,
    damageRange: [20, 100], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: false, channelTicks: 0
  },
  ASPHYXIATE: {
    id: 'ASPHYXIATE', name: 'Asphyxiate', tier: 'THRESHOLD', cooldown: 30, adrenGain: -150, adrenReq: 150,
    damageRange: [100, 200], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: true, channelTicks: 4
  },
  SUNSHINE: {
    id: 'SUNSHINE', name: 'Sunshine', tier: 'ULTIMATE', cooldown: 100, adrenGain: -1000, adrenReq: 1000,
    damageRange: [0, 0], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: false, channelTicks: 0
  },
  TSUNAMI: {
    id: 'TSUNAMI', name: 'Tsunami', tier: 'ULTIMATE', cooldown: 100, adrenGain: -1000, adrenReq: 1000,
    damageRange: [200, 300], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: false, channelTicks: 0
  },
  DETONATE: {
    id: 'DETONATE', name: 'Detonate', tier: 'THRESHOLD', cooldown: 30, adrenGain: -150, adrenReq: 150,
    damageRange: [100, 350], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: true, channelTicks: 5
  },
  CHAIN: {
    id: 'CHAIN', name: 'Chain', tier: 'BASIC', cooldown: 10, adrenGain: 80, adrenReq: 0,
    damageRange: [20, 100], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: false, channelTicks: 0
  },
  WILD_MAGIC: {
    id: 'WILD_MAGIC', name: 'Wild Magic', tier: 'THRESHOLD', cooldown: 30, adrenGain: -500, adrenReq: 500,
    damageRange: [80, 180], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: false, channelTicks: 0
  },
  OMNIPOWER: {
    id: 'OMNIPOWER', name: 'Omnipower', tier: 'ULTIMATE', cooldown: 100, adrenGain: -1000, adrenReq: 1000,
    damageRange: [250, 450], skillReqs: [{ skillId: 5, level: 1 }], weaponReqs: ['magic'], style: 'MAGIC',
    isChannelled: false, channelTicks: 0
  },
  GALESHOT: {
    id: 'GALESHOT', name: 'Galeshot', tier: 'BASIC', cooldown: 12, adrenGain: 80, adrenReq: 0,
    damageRange: [20, 40], skillReqs: [{ skillId: 3, level: 1 }], weaponReqs: ['ranged'], style: 'RANGED',
    isChannelled: false, channelTicks: 0
  },
  RICOCHET: {
    id: 'RICOCHET', name: 'Ricochet', tier: 'BASIC', cooldown: 17, adrenGain: 80, adrenReq: 0,
    damageRange: [20, 60], skillReqs: [{ skillId: 3, level: 1 }], weaponReqs: ['ranged'], style: 'RANGED',
    isChannelled: false, channelTicks: 0
  },
  SNIPE: {
    id: 'SNIPE', name: 'Snipe', tier: 'BASIC', cooldown: 17, adrenGain: 80, adrenReq: 0,
    damageRange: [125, 219], skillReqs: [{ skillId: 3, level: 1 }], weaponReqs: ['ranged'], style: 'RANGED',
    isChannelled: true, channelTicks: 3
  },
  CORR_SHOT: {
    id: 'CORR_SHOT', name: 'Corruption Shot', tier: 'THRESHOLD', cooldown: 25, adrenGain: -200, adrenReq: 200,
    damageRange: [33, 100], skillReqs: [{ skillId: 3, level: 1 }], weaponReqs: ['ranged'], style: 'RANGED',
    isChannelled: false, channelTicks: 0
  },
  RAPID_FIRE: {
    id: 'RAPID_FIRE', name: 'Rapid Fire', tier: 'THRESHOLD', cooldown: 34, adrenGain: -150, adrenReq: 150,
    damageRange: [45, 94], skillReqs: [{ skillId: 3, level: 1 }], weaponReqs: ['ranged'], style: 'RANGED',
    isChannelled: true, channelTicks: 6
  },
  S_TENDRILS: {
    id: 'S_TENDRILS', name: 'Shadow Tendrils', tier: 'THRESHOLD', cooldown: 75, adrenGain: -150, adrenReq: 150,
    damageRange: [66, 333], skillReqs: [{ skillId: 3, level: 1 }], weaponReqs: ['ranged'], style: 'RANGED',
    isChannelled: false, channelTicks: 0
  },
  BOMBARDMENT: {
    id: 'BOMBARDMENT', name: 'Bombardment', tier: 'THRESHOLD', cooldown: 50, adrenGain: -150, adrenReq: 150,
    damageRange: [43, 219], skillReqs: [{ skillId: 3, level: 1 }], weaponReqs: ['ranged'], style: 'RANGED',
    isChannelled: false, channelTicks: 0
  },
  DEATHS_SWIFT: {
    id: 'DEATHS_SWIFT', name: "Death's Swift", tier: 'ULTIMATE', cooldown: 100, adrenGain: -1000, adrenReq: 1000,
    damageRange: [0, 0], skillReqs: [{ skillId: 3, level: 1 }], weaponReqs: ['ranged'], style: 'RANGED',
    isChannelled: false, channelTicks: 0
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMBAT STATE MACHINE — Production-grade port from HTML prototype
// ─────────────────────────────────────────────────────────────────────────────

export interface CombatTickState {
  tick: number;                  // Global tick counter
  adrenaline: number;            // 0-1000 internal (0-100% display)
  cooldowns: Map<string, number>; // abilityId → ticks remaining
  globalCooldown: number;        // GCD remaining ticks
  stunState: boolean;            // True if stunned
  channelState: {                // Active channel info
    abilityId: string | null;
    ticksRemaining: number;
    ticksTotal: number;
  };
  lastAutoAttackTick: number;    // For auto-attack timing
  combatStyle: 'MELEE' | 'RANGED' | 'MAGIC';
  activeBar: ActionBarState | null;
}

export class CombatTickEngine {

  private state: CombatTickState;
  private listeners: Set<(state: CombatTickState) => void> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly TICK_MS = 600; // RS3 standard tick

  constructor(initialStyle: 'MELEE' | 'RANGED' | 'MAGIC' = 'MELEE') {
    this.state = {
      tick: 0,
      adrenaline: 0,
      cooldowns: new Map(),
      globalCooldown: 0,
      stunState: false,
      channelState: { abilityId: null, ticksRemaining: 0, ticksTotal: 0 },
      lastAutoAttackTick: 0,
      combatStyle: initialStyle,
      activeBar: null
    };

    // Initialize all cooldowns to 0
    for (const id of Object.keys(ABILITY_LIBRARY)) {
      this.state.cooldowns.set(id, 0);
    }
  };

// removed misaligned import

// ... (existing class structure)

  private isTicking: boolean = false;

  start(): void {
    if (this.isTicking) return;
    this.isTicking = true;
    CanonicalClock.getInstance().registerPulse({
      domain: 'INFERENCE', // Aligned with reflex loop
      callback: (tick: number) => this.tick(),
      priority: 2, // after Adrenaline/CNS
      name: 'SovereignAvatarActionBarVolition'
    });
  }

  stop(): void {
    this.isTicking = false;
  }


  private tick(): void {
    this.state.tick++;

    if (!this.state.stunState) {
      this.state.adrenaline = Math.min(1000, this.state.adrenaline + 80);
    }

    for (const [id, cd] of this.state.cooldowns) {
      if (cd > 0) this.state.cooldowns.set(id, cd - 1);
    }

    if (this.state.globalCooldown > 0) this.state.globalCooldown--;

    if (this.state.channelState.abilityId && this.state.channelState.ticksRemaining > 0) {
      this.state.channelState.ticksRemaining--;
      if (this.state.channelState.ticksRemaining <= 0) {
        this.state.channelState.abilityId = null;
      }
    }

    if (this.state.tick - this.state.lastAutoAttackTick >= 3 && !this.state.channelState.abilityId) {
      this.executeAutoAttack();
    }

    this.notifyListeners();
  }

  private executeAutoAttack(): void {
    this.state.lastAutoAttackTick = this.state.tick;
    const damage = Math.floor(Math.random() * 20) + 5;
    this.emitEvent({ type: 'AUTO_ATTACK', damage, adrenalineDelta: 0 });
  }

  useAbility(abilityId: string): boolean {
    const ability = ABILITY_LIBRARY[abilityId];
    if (!ability) return false;

    if (this.state.stunState) {
      this.emitEvent({ type: 'BLOCKED', reason: 'STUNNED', abilityId });
      return false;
    }

    if (this.state.channelState.abilityId) {
      this.emitEvent({ type: 'BLOCKED', reason: 'CHANNELING', abilityId });
      return false;
    }

    const cd = this.state.cooldowns.get(abilityId) || 0;
    if (cd > 0) {
      this.emitEvent({ type: 'BLOCKED', reason: 'COOLDOWN', abilityId, cooldownRemaining: cd });
      return false;
    }

    if (this.state.adrenaline < ability.adrenReq) {
      this.emitEvent({ type: 'BLOCKED', reason: 'ADRENALINE', abilityId, 
        current: this.state.adrenaline, required: ability.adrenReq });
      return false;
    }

    if (this.state.globalCooldown > 0) {
      this.emitEvent({ type: 'BLOCKED', reason: 'GCD', abilityId, gcdRemaining: this.state.globalCooldown });
      return false;
    }

    const prevAdren = this.state.adrenaline;
    this.state.adrenaline = Math.max(0, Math.min(1000, this.state.adrenaline + ability.adrenGain));
    this.state.cooldowns.set(abilityId, ability.cooldown);
    this.state.globalCooldown = 1;

    let damage = 0;
    if (ability.damageRange[0] > 0) {
      damage = Math.floor(Math.random() * (ability.damageRange[1] - ability.damageRange[0] + 1)) 
               + ability.damageRange[0];
    }

    if (ability.isChannelled) {
      this.state.channelState = {
        abilityId,
        ticksRemaining: ability.channelTicks,
        ticksTotal: ability.channelTicks
      };
    }

    this.emitEvent({
      type: 'ABILITY',
      abilityId,
      tier: ability.tier,
      damage,
      adrenalineBefore: prevAdren,
      adrenalineAfter: this.state.adrenaline,
      isChannelled: ability.isChannelled,
      channelTicks: ability.channelTicks
    });

    this.notifyListeners();
    return true;
  }

  setActionBar(barState: ActionBarState): void {
    this.state.activeBar = barState;
    this.notifyListeners();
  }

  applyStun(durationTicks: number): void {
    this.state.stunState = true;
    setTimeout(() => { this.state.stunState = false; }, durationTicks * this.TICK_MS);
    this.emitEvent({ type: 'STUN', duration: durationTicks });
  }

  private eventListeners: Set<(event: CombatEvent) => void> = new Set();

  onEvent(listener: (event: CombatEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private emitEvent(event: CombatEvent): void {
    for (const listener of this.eventListeners) {
      try { listener(event); } catch (e) { console.error('Combat event error:', e); }
    }
  }

  getState(): Readonly<CombatTickState> { return this.state; }

  onStateChange(listener: (state: CombatTickState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try { listener(this.state); } catch (e) { console.error('State listener error:', e); }
    }
  }
}

export type CombatEvent =
  | { type: 'ABILITY'; abilityId: string; tier: string; damage: number; adrenalineBefore: number; adrenalineAfter: number; isChannelled: boolean; channelTicks: number }
  | { type: 'AUTO_ATTACK'; damage: number; adrenalineDelta: number }
  | { type: 'BLOCKED'; reason: 'STUNNED' | 'COOLDOWN' | 'ADRENALINE' | 'GCD' | 'CHANNELING'; abilityId: string; cooldownRemaining?: number; current?: number; required?: number; gcdRemaining?: number }
  | { type: 'STUN'; duration: number };

// ─────────────────────────────────────────────────────────────────────────────
// GHOST SPLAT BRIDGE — Production port from HTML prototype
// Maps combat events to GhostSplatEngine projections
// ─────────────────────────────────────────────────────────────────────────────

export class GhostSplatBridge {

  private ghostSplat: GhostSplatEngine;
  private combatEngine: CombatTickEngine;
  private unsubscribe: (() => void) | null = null;

  constructor(ghostSplat: GhostSplatEngine, combatEngine: CombatTickEngine) {
    this.ghostSplat = ghostSplat;
    this.combatEngine = combatEngine;
  }

  connect(): void {
    this.unsubscribe = this.combatEngine.onEvent((event) => {
      switch (event.type) {
        case 'ABILITY':
          this.projectAbilitySplat(event);
          break;
        case 'AUTO_ATTACK':
          this.projectAutoAttackSplat(event.damage);
          break;
        case 'BLOCKED':
          break;
        case 'STUN':
          this.projectStunOverlay(event.duration);
          break;
      }
    });
  }

  disconnect(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private projectAbilitySplat(event: Extract<CombatEvent, { type: 'ABILITY' }>): void {
    const tierMap: Record<string, string> = {
      'BASIC': 'damage',
      'THRESHOLD': 'damage',
      'ULTIMATE': 'crit'
    };

    const colorMap: Record<string, string> = {
      'BASIC': '#aaa',
      'THRESHOLD': '#aa88ff',
      'ULTIMATE': '#ffaa00'
    };

    const sizeMap: Record<string, number> = {
      'BASIC': 30,
      'THRESHOLD': 40,
      'ULTIMATE': 50
    };

    // Using any for emit payload to avoid missing type errors
    (this.ghostSplat as any).emit({
      type: tierMap[event.tier] || 'damage',
      value: event.damage > 0 ? event.damage.toString() : event.abilityId,
      color: colorMap[event.tier] || '#ff4444',
      size: sizeMap[event.tier] || 30,
      position: this.randomSplatPosition(),
      velocity: { x: 0, y: 0.5, z: 0 },
      lifetime: 2000,
      fadeRate: 0.015
    });
  }

  private projectAutoAttackSplat(damage: number): void {
    (this.ghostSplat as any).emit({
      type: 'damage',
      value: damage.toString(),
      color: '#aaa',
      size: 25,
      position: this.randomSplatPosition(),
      velocity: { x: 0, y: 0.3, z: 0 },
      lifetime: 1500,
      fadeRate: 0.02
    });
  }

  private projectStunOverlay(duration: number): void {
    (this.ghostSplat as any).emit({
      type: 'status',
      value: 'STUNNED',
      color: '#ff4444',
      size: 60,
      position: { x: 0, y: 150, z: -10 },
      velocity: { x: 0, y: 0, z: 0 },
      lifetime: duration * 600,
      fadeRate: 0.005
    });
  }

  private randomSplatPosition(): any {
    return {
      x: (Math.random() - 0.5) * 60,
      y: 120 + Math.random() * 30,
      z: -20
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION BAR RENDERER — DOM bridge for HTML prototype parity
// ─────────────────────────────────────────────────────────────────────────────

export interface ActionBarRenderer {
  render(barState: ActionBarState, combatState: CombatTickState): void;
  log(message: string, cssClass?: string): void;
  destroy(): void;
}

export class DOMActionBarRenderer implements ActionBarRenderer {

  private container: HTMLElement;
  private slotElements: HTMLElement[] = [];
  private adrenalineFill: HTMLElement | null = null;
  private adrenalineText: HTMLElement | null = null;
  private tickCounter: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;

  constructor(containerId: string = 'action-bar') {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Action bar container #${containerId} not found`);
    this.container = el;
    this.initDOM();
  }

  private initDOM(): void {
    this.container.innerHTML = '';
    this.slotElements = [];

    for (let i = 0; i < 14; i++) {
      const slot = document.createElement('div');
      slot.className = 'ability-slot empty-slot';
      slot.id = `slot-${i}`;
      this.container.appendChild(slot);
      this.slotElements.push(slot);
    }

    this.adrenalineFill = document.getElementById('adrenaline-fill');
    this.adrenalineText = document.getElementById('adrenaline-text');
    this.tickCounter = document.getElementById('tick-counter');
    this.logContainer = document.getElementById('log-entries');
  }

  render(barState: ActionBarState, combatState: CombatTickState): void {
    if (this.adrenalineFill && this.adrenalineText) {
      const pct = combatState.adrenaline / 10;
      this.adrenalineFill.style.height = pct + '%';
      this.adrenalineText.textContent = Math.floor(pct) + '%';
      this.adrenalineText.style.color = pct >= 100 ? '#ffaa00' : pct >= 50 ? '#aa88ff' : '#fff';
    }

    if (this.tickCounter) {
      this.tickCounter.textContent = combatState.tick.toString();
    }

    for (let i = 0; i < 14; i++) {
      const slot = barState.slots[i];
      const el = this.slotElements[i];
      if (!el) continue;

      if (!slot || !slot.abilityId) {
        el.className = 'ability-slot empty-slot';
        el.style.backgroundImage = 'none';
        el.innerHTML = '';
        continue;
      }

      const ability = ABILITY_LIBRARY[slot.abilityId];
      if (!ability) continue;

      const cd = combatState.cooldowns.get(slot.abilityId.toString()) || 0;
      const canUse = combatState.adrenaline >= ability.adrenReq && cd === 0 && !combatState.stunState;

      const classes = ['ability-slot', `tier-${ability.tier}`];
      if (cd > 0) classes.push('cooldown');
      else if (canUse) classes.push('ready');
      else classes.push('unavailable');

      el.className = classes.join(' ');

      const iconName = ability.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      el.style.backgroundImage = `url('icons/${iconName}.png')`;

      const tierBadge = ability.tier === 'ULTIMATE' ? 'U' : ability.tier === 'THRESHOLD' ? 'T' : 'B';
      let html = `
        <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85)); border-radius: 3px; z-index: 1;"></div>
        <span class="ability-name">${ability.name}</span>
        <span class="tier-badge">${tierBadge}</span>
      `;

      if (cd > 0) {
        html += `<div class="cooldown-overlay">${cd}</div>`;
      }

      el.innerHTML = html;
    }
  }

  log(message: string, cssClass: string = ''): void {
    if (!this.logContainer) return;
    const div = document.createElement('div');
    div.className = 'log-entry ' + cssClass;
    div.textContent = '> ' + message;
    this.logContainer.insertBefore(div, this.logContainer.firstChild);
    while (this.logContainer.children.length > 12) {
      const last = this.logContainer.lastChild;
      if (last) this.logContainer.removeChild(last);
    }
  }

  destroy(): void {
    this.container.innerHTML = '';
    this.slotElements = [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SOVEREIGN AVATAR VOLITION LAYER — Top-level orchestrator
// ─────────────────────────────────────────────────────────────────────────────

export class SovereignAvatarVolition {

  private agent: PlayerAgent;
  private combatEngine: CombatTickEngine;
  private adrenalineSM: AdrenalineStateMachine;
  private rotationEngine: CombatRotationEngine;
  private abilityLimb: AbilityDiscoveryLimb;
  private ghostSplat: GhostSplatEngine;
  private ghostBridge: GhostSplatBridge;
  private renderer: ActionBarRenderer | null = null;

  private combatUnsub: (() => void) | null = null;
  private tickUnsub: (() => void) | null = null;

  constructor(deps: {
    agent: PlayerAgent;
    adrenalineSM: AdrenalineStateMachine;
    rotationEngine: CombatRotationEngine;
    abilityLimb: AbilityDiscoveryLimb;
    ghostSplat: GhostSplatEngine;
  }) {
    this.agent = deps.agent;
    this.adrenalineSM = deps.adrenalineSM;
    this.rotationEngine = deps.rotationEngine;
    this.abilityLimb = deps.abilityLimb;
    this.ghostSplat = deps.ghostSplat;

    const style = this.detectCombatStyle();
    this.combatEngine = new CombatTickEngine(style);
    this.ghostBridge = new GhostSplatBridge(this.ghostSplat, this.combatEngine);
  }

  initialize(): void {
    this.ghostBridge.connect();

    this.combatUnsub = this.combatEngine.onEvent((event) => {
      if (this.renderer && 'type' in event) {
        switch (event.type) {
          case 'ABILITY':
            const tierCls = event.tier.toLowerCase();
            this.renderer.log(
              `${event.abilityId} → ${event.damage > 0 ? event.damage + ' dmg' : 'ACTIVE'}`,
              tierCls === 'basic' ? 'basic' : tierCls
            );
            break;
          case 'BLOCKED':
            this.renderer.log(
              `${event.abilityId}: ${event.reason} (${event.cooldownRemaining || event.current || event.gcdRemaining || ''})`,
              'system'
            );
            break;
          case 'STUN':
            this.renderer.log(`STUNNED for ${event.duration} ticks`, 'system');
            break;
        }
      }
    });

    this.tickUnsub = this.combatEngine.onStateChange((state) => {
      if (this.renderer && state.activeBar) {
        this.renderer.render(state.activeBar, state);
      }
    });

    this.combatEngine.start();
  }

  bindRenderer(renderer: ActionBarRenderer): void {
    this.renderer = renderer;
  }

  loadActionBar(rawInterface1841: any): void {
    const barState = I1841Integration.Translator.translate(rawInterface1841);
    this.combatEngine.setActionBar(barState);
  }

  executeAbility(abilityId: string): boolean {
    return this.combatEngine.useAbility(abilityId);
  }

  executeRotationSlot(slotIndex: number): boolean {
    const bar = this.combatEngine.getState().activeBar;
    if (!bar || !bar.slots[slotIndex]) return false;

    const abilityId = bar.slots[slotIndex].abilityId;
    if (!abilityId) return false;

    return this.combatEngine.useAbility(abilityId.toString());
  }

  applyStun(durationTicks: number): void {
    this.combatEngine.applyStun(durationTicks);
  }

  destroy(): void {
    this.combatEngine.stop();
    this.ghostBridge.disconnect();
    if (this.combatUnsub) this.combatUnsub();
    if (this.tickUnsub) this.tickUnsub();
    if (this.renderer) this.renderer.destroy();
  }

  private detectCombatStyle(): 'MELEE' | 'RANGED' | 'MAGIC' {
    // Fallback to MELEE if getSkillVector fails or is missing
    try {
      const skills = (this.agent as any).getSkillVector();
      if (skills) {
        const melee = skills[0] + skills[1];
        const ranged = skills[3] * 2;
        const magic = skills[5] * 2;

        if (ranged > melee && ranged > magic) return 'RANGED';
        if (magic > melee && magic > ranged) return 'MAGIC';
      }
    } catch (e) {
      // Ignore and use default
    }
    return 'MELEE';
  }

  getCombatState(): Readonly<CombatTickState> {
    return this.combatEngine.getState();
  }

  getAdrenaline(): number {
    return this.combatEngine.getState().adrenaline;
  }

  isChanneling(): boolean {
    return this.combatEngine.getState().channelState.abilityId !== null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const SovereignAvatarVolitionSystem = {
  AbilityLibrary: ABILITY_LIBRARY,
  CombatTickEngine,
  GhostSplatBridge,
  DOMActionBarRenderer,
  SovereignAvatarVolition
};

export default SovereignAvatarVolitionSystem;
