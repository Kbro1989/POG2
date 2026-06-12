// ============================================================================
// Interface1841ActionBarMapping.ts
// POG2 Sovereign System — Cache-to-Agent Combat Bridge
// Generated from interface_1841_actionbar.json structural analysis
// ============================================================================

import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';
import { PlayerAgent } from '../../engines/gameplay/PlayerAgent.js';
import { CombatRotationEngine } from '../../engines/gameplay/CombatRotationEngine.js';
import { AdrenalineStateMachine } from '../combat/AdrenalineStateMachine.js';
import { AbilityDiscoveryLimb } from '../spatial/AbilityDiscoveryLimb.js';
import { GhostSplatEngine } from '../../substrates/GhostSplatEngine.js';
import { ServerLogicRegistry } from '../../engines/gameplay/ServerLogicRegistry.js';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS — Interface 1841 Structural IDs (from cache extraction)
// ─────────────────────────────────────────────────────────────────────────────

export const I1841 = {
  INTERFACE_ID: 1841,

  // Root hierarchy
  ROOT: 2,           // Component 2 — root container (parent=65535, load=[13138, -2147483645])
  SPACER_TOP: 3,     // Component 3 — top spacer (baseheight=32)
  SPACER_MID: 4,     // Component 4 — middle spacer (baseheight=32)
  MAIN_BAR: 5,       // Component 5 — main bar container (children: 1,7,8,9,10,11, optmask=8192)
  BAR_VISUAL: 6,     // Component 6 — visual bar (512×32, fixed width, bottom-aligned)

  // Main bar children (empty until runtime population)
  SLOT_ZONE_0: 1,    // Component 1 — dynamic slot zone
  SLOT_ZONE_1: 7,    // Component 7 — dynamic slot zone
  SLOT_ZONE_2: 8,    // Component 8 — dynamic slot zone
  DROP_TARGET: 9,    // Component 9 — drag-and-drop target (optmask=8192 = OPTARGET)
  SLOT_ZONE_3: 10,   // Component 10 — dynamic slot zone

  // Slot container hierarchy
  SLOT_CONTAINER: 11, // Component 11 — slot container (children: 0,12, load=[13133,...])
  SLOT_CHILD_0: 0,    // Component 0 — first slot child (parent=11)
  SLOT_CHILD_1: 12,   // Component 12 — second slot child (parent=11)

  // CS2 Script IDs (from cache extraction)
  SCRIPT_INIT: 13138,   // onLoad — bar initialization, config binding
  SCRIPT_SLOT_ARRANGE: 13133, // onSlotLoad — ability sprite arrangement, drag targets

  // Special operands
  SELF_REF: -2147483645,  // Interface self-reference operand
  BITPACK_COORD_A: 120651776,  // Sprite/coordinate bitpack A
  BITPACK_COORD_B: 120651788,  // Sprite/coordinate bitpack B
  SLOT_COUNT: 5,       // Script operand: slot count or bar index

  // Aspect type enums (RS3 client layout system)
  ASPECT: {
    X_ABSOLUTE: 0,     // aspectxtype=0 — absolute X positioning
    Y_ABSOLUTE: 0,     // aspectytype=0 — absolute Y positioning
    Y_BOTTOM: 2,       // aspectytype=2 — bottom-aligned (Component 6)
    WIDTH_FIXED: 0,    // aspectwidthtype=0 — fixed width
    WIDTH_RELATIVE: 1, // aspectwidthtype=1 — relative width
    HEIGHT_FIXED: 0,   // aspectheighttype=0 — fixed height
    HEIGHT_RELATIVE: 1 // aspectheighttype=1 — relative height
  },

  // optmask flags
  OPTMASK: {
    NONE: 0,
    CLICKTHROUGH: 8192,  // OPTARGET — accepts drag-and-drop
    HIDDEN: 1,
    NO_CLICK: 2
  }
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS — Interface 1841 Runtime State
// ─────────────────────────────────────────────────────────────────────────────

export interface ActionBarSlot {
  componentId: number;
  abilityId: number | null;      // null = empty slot
  abilityName: string | null;
  cooldownRemaining: number;     // ticks (600ms per tick)
  cooldownTotal: number;
  adrenalineCost: number;        // 0-100, or -1 for threshold abilities
  adrenalineThreshold: number;   // minimum adrenaline required
  isAvailable: boolean;            // cooldown + adrenaline + stun check
  isDragTarget: boolean;           // can receive drag-and-drop
  spriteId: number | null;
  varpBinding: number | null;    // player config varp that controls this slot
}

export interface ActionBarState {
  interfaceId: 1841;
  activeBarIndex: number;        // 1-15 (RS3 has 15 action bars)
  isLocked: boolean;             // bar locked from accidental modification
  adrenaline: number;            // 0-100
  adrenalineThreshold: any;      // Stubbed to avoid missing export error
  slots: ActionBarSlot[];        // 14 slots (RS3 standard)
  revolutionActive: boolean;     // revolution combat mode
  revolutionSlots: number[];     // which slots are in revolution rotation
  stunState: boolean;            // player stunned → all abilities locked
  globalCooldown: number;        // GCD remaining ticks
}

export interface I1841ComponentConfig {
  componentId: number;
  type: 'CONTAINER' | 'TEXT' | 'SPRITE' | 'MODEL';
  parentId: number;
  children: number[];
  baseposx: number;
  baseposy: number;
  basewidth: number;
  baseheight: number;
  aspectxtype: number;
  aspectytype: number;
  aspectwidthtype: number;
  aspectheighttype: number;
  optmask: number;
  hidden: boolean;
  scripts: {
    load: number[];
    mousehover: number[];
    mouseleave: number[];
    [key: string]: number[] | null;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE-TO-AGENT TRANSLATOR
// Maps raw interface JSON to typed ActionBarState for PlayerAgent consumption
// ─────────────────────────────────────────────────────────────────────────────

export class I1841CacheTranslator {

  /**
   * Translate raw cache-extracted interface JSON into runtime ActionBarState.
   * Called by CacheForensicsLimb after opcode decoding.
   */
  static translate(rawInterface: any): ActionBarState {
    const components: I1841ComponentConfig[] = rawInterface.components;

    // Find root and validate structure
    const root = components.find(c => c.componentId === I1841.ROOT);
    if (!root) throw new Error('I1841: Root component 2 not found');

    // Extract script operands for initialization
    const initScript = root.scripts.load;
    const barIndex = this.extractBarIndex(initScript);

    // Build slot map from SLOT_CONTAINER (11) and its children
    const slotContainer = components.find(c => c.componentId === I1841.SLOT_CONTAINER);
    const slots = this.buildSlots(components, slotContainer);

    return {
      interfaceId: 1841,
      activeBarIndex: barIndex,
      isLocked: false,
      adrenaline: 0,
      adrenalineThreshold: null,
      slots,
      revolutionActive: false,
      revolutionSlots: [],
      stunState: false,
      globalCooldown: 0
    };
  }

  private static extractBarIndex(script: number[]): number {
    if (script.length >= 2 && script[0] === I1841.SCRIPT_INIT) {
      return 1;
    }
    return 1;
  }

  private static buildSlots(
    components: I1841ComponentConfig[], 
    container: I1841ComponentConfig | undefined
  ): ActionBarSlot[] {
    const slots: ActionBarSlot[] = [];
    if (!container) return slots;

    const staticSlots = [I1841.SLOT_CHILD_0, I1841.SLOT_CHILD_1];

    for (let i = 0; i < 14; i++) {
      const compId = i < staticSlots.length 
        ? staticSlots[i] 
        : container.children[i] || (100 + i);

      slots.push({
        componentId: compId,
        abilityId: null,
        abilityName: null,
        cooldownRemaining: 0,
        cooldownTotal: 0,
        adrenalineCost: 0,
        adrenalineThreshold: 0,
        isAvailable: false,
        isDragTarget: false,
        spriteId: null,
        varpBinding: 767 + i
      });
    }

    return slots;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Integration Points
// ─────────────────────────────────────────────────────────────────────────────

export const I1841Integration = {
  Constants: I1841,
  Translator: I1841CacheTranslator
};

export default I1841Integration;

