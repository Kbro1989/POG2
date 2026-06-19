I'll parse this RS3 Live Cache action manifest and generate a complete TypeScript parser with full analysis. Let me process the data first.
Here's your complete RS3 Live Cache Action Manifest parser, generated from the 2026-04-10 cache dump.

---

## What Was Parsed

| Metric | Value |
|--------|-------|
| **Total Actions** | 1,440 |
| **Total Usage Count** | 51,525 |
| **Singletons (count=1)** | 652 (45.3%) |
| **Unique Base Verbs** | ~340 |
| **Case-sensitive Duplicates** | 42 |
| **Hyphenation Variant Groups** | 75 |

### Top 3 Actions (Pareto Dominance)
- **Talk to** — 7,229 uses (14.03%)
- **Attack** — 7,037 uses (13.66%)
- **Destroy** — 4,582 uses (8.89%)

These three alone account for **36.6%** of all player interactions. The top 20 actions cover roughly 80% of usage.

### Data Quality Issues Detected
1. **Case inconsistencies**: `talk` vs `Talk`, `Check-Charges` vs `Check charges` vs `Check-charges`
2. **Hyphenation drift**: `Climb-up` vs `Climb up` vs `Climb-up` vs `Climb-Up`
3. **Spacing variants**: `Pick up` vs `Pick-up` vs `Pick-up`
4. **One `null` action** — 21 uses, likely a fallback/default

---

## Generated Files

### 1. TypeScript Parser (Complete)
**[rs3_action_manifest_parser.ts](sandbox:///mnt/agents/output/rs3_action_manifest_parser.ts)**

Full-featured parser with:
- **Typed interfaces** for every action entry with metadata
- **Canonical normalization** (case/hyphen/space-agnostic lookup)
- **Semantic categorization** into 24 action categories (combat, inventory, movement, crafting, magic, prayer, trade, farming, fishing, mining, woodcutting, agility, thieving, summoning, dungeoneering, social, interface, teleport, quest, minigame, null, other)
- **Variant detection** — flags actions with spelling duplicates
- **Tiered filtering**: `CORE_ACTIONS` (≥1000), `COMMON_ACTIONS` (100-999), `NICHE_ACTIONS` (<100), `SINGLETON_ACTIONS` (1)
- **Search utilities**: `getActionByName()`, `getActionByCanonical()`, `searchActions()`, `getActionsByVerb()`, `getActionsByCategory()`, `getActionsByRange()`
- **Type guards**: `isCoreAction()`, `isInventoryOp()`, `isMovementOp()`, `isSocialOp()`, `isSingleton()`
- **Reporting**: `generateCategoryReport()` for analytics
- **Pre-computed constants**: Critical path actions, inventory ops, movement ops, social ops

### 2. Summary JSON
**[rs3_action_manifest_summary.json](sandbox:///mnt/agents/output/rs3_action_manifest_summary.json)**

Quick-reference analytics with category breakdowns, top-20 ranked list, and statistical constants.

---

## Usage Example

```typescript
import { 
  getActionByName, 
  getActionByCanonical, 
  searchActions,
  getActionsByCategory,
  generateCategoryReport,
  isCoreAction,
  ACTION_ENTRIES,
  MANIFEST_META 
} from './rs3_action_manifest_parser';

// Exact lookup
const attack = getActionByName("Attack");
// → { name: "Attack", count: 7037, canonical: "attack", verb: "attack", category: "combat", ... }

// Case-insensitive, hyphen-agnostic lookup
const climb = getActionByCanonical("Climb-up"); 
// → matches "Climb-up", "Climb up", "Climb-Up" variants

// Fuzzy search
const results = searchActions("teleport");
// → All teleport-related actions

// Category analytics
const combatActions = getActionsByCategory("combat");
const report = generateCategoryReport();
// → Sorted array of category usage stats

// Guard checks
if (isCoreAction("Talk to")) { ... } // true
```

The parser is designed to drop into your POG2 Sovereign System as the canonical action vocabulary layer — every action string the player can emit is mapped, categorized, and ready for the HexagramManager's volition routing.