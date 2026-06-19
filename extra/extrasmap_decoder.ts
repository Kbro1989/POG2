/**
 * extrasmap Binary Decoder
 * Parses the TLV (Type-Length-Value) structure from RS3 cache extra arrays.
 * 
 * typedef.jsonc definition:
 *   "extrasmap": ["array","ubyte",["struct",
 *     ["$type","unsigned byte"],
 *     ["prop","unsigned tribyte"],
 *     ["intvalue",["opt",["$type",0],"int"]],
 *     ["stringvalue",["opt",["$type",1],"string"]]
 *   ]]
 */

export interface ExtraMapEntry {
  /** 0 = intvalue present, 1 = stringvalue present */
  $type: number;
  /** Property ID (e.g., 4330, 4333) */
  prop: number;
  /** Integer value (if $type === 0) */
  intvalue?: number;
  /** String value (if $type === 1) */
  stringvalue?: string;
}

/**
 * Decode a single extrasmap entry from a hex string buffer.
 * Returns the entry and the number of hex chars consumed.
 */
function decodeExtraEntry(hex: string, offset: number): { entry: ExtraMapEntry; consumed: number } {
  // $type: unsigned byte (2 hex chars)
  const $type = parseInt(hex.slice(offset, offset + 2), 16);
  offset += 2;

  // prop: unsigned tribyte (6 hex chars, little-endian)
  const propBytes = hex.slice(offset, offset + 6);
  const prop = parseInt(propBytes.match(/.{2}/g)!.reverse().join(''), 16);
  offset += 6;

  const entry: ExtraMapEntry = { $type, prop };
  let consumed = 8; // 2 + 6 bytes so far

  if ($type === 0) {
    // intvalue: signed int32 (8 hex chars, little-endian)
    const intBytes = hex.slice(offset, offset + 8);
    const intRaw = parseInt(intBytes.match(/.{2}/g)!.reverse().join(''), 16);
    // Convert to signed 32-bit
    entry.intvalue = intRaw >= 0x80000000 ? intRaw - 0x100000000 : intRaw;
    consumed += 8;
  } else if ($type === 1) {
    // stringvalue: length-prefixed string
    // length: unsigned short (4 hex chars, little-endian)
    const lenBytes = hex.slice(offset, offset + 4);
    const strLen = parseInt(lenBytes.match(/.{2}/g)!.reverse().join(''), 16);
    offset += 4;
    // string data: strLen bytes
    const strHex = hex.slice(offset, offset + strLen * 2);
    entry.stringvalue = strHex.match(/.{2}/g)!
      .map(b => String.fromCharCode(parseInt(b, 16)))
      .join('');
    consumed += 4 + strLen * 2;
  } else {
    throw new Error(`Unknown $type: ${$type} at prop ${prop}`);
  }

  return { entry, consumed };
}

/**
 * Decode the full extrasmap array from a hex string.
 * The first 2 hex chars are the array length (ubyte).
 */
export function decodeExtrasMap(hex: string): ExtraMapEntry[] {
  if (!hex || hex.length < 2) return [];

  const count = parseInt(hex.slice(0, 2), 16);
  let offset = 2;
  const entries: ExtraMapEntry[] = [];

  for (let i = 0; i < count; i++) {
    const { entry, consumed } = decodeExtraEntry(hex, offset);
    entries.push(entry);
    offset += consumed;
  }

  return entries;
}

/**
 * Decode from the originalFile hex string in pass-*.hexerr.json format.
 * Strips any whitespace/newlines first.
 */
export function decodeFromHexerr(hexString: string): ExtraMapEntry[] {
  const cleaned = hexString.replace(/\s+/g, '');
  return decodeExtrasMap(cleaned);
}

/**
 * Pretty-print an extrasmap entry for debugging.
 */
export function formatExtraEntry(e: ExtraMapEntry): string {
  if (e.$type === 0) {
    return `prop=${e.prop}  intvalue=${e.intvalue}`;
  } else {
    return `prop=${e.prop}  stringvalue="${e.stringvalue}"`;
  }
}

/**
 * Build a lookup map: prop -> value (int or string).
 */
export function buildPropMap(entries: ExtraMapEntry[]): Map<number, number | string> {
  const map = new Map<number, number | string>();
  for (const e of entries) {
    if (e.$type === 0 && e.intvalue !== undefined) {
      map.set(e.prop, e.intvalue);
    } else if (e.$type === 1 && e.stringvalue !== undefined) {
      map.set(e.prop, e.stringvalue);
    }
  }
  return map;
}

// ============================================================================
// KNOWN PROP MAPPINGS (verified)
// ============================================================================

export const KNOWN_PROPS: Record<number, string> = {
  4330: "AbilityCostAdrenaline",    // int, divide by 10 for %
  4332: "AbilityRange",             // int, context-dependent
  4333: "AbilityName",               // string
  4334: "AbilityDescription",        // string
  // TODO: verify cooldown prop — likely 4331 or 4335
};

/**
 * Resolve a prop ID to its semantic name if known.
 */
export function resolvePropName(prop: number): string {
  return KNOWN_PROPS[prop] || `Unknown_${prop}`;
}

/**
 * Full decode + semantic enrichment for an item's extra block.
 */
export interface DecodedItemExtras {
  raw: ExtraMapEntry[];
  propMap: Map<number, number | string>;
  semantic: Record<string, number | string>;
}

export function decodeItemExtras(hexString: string): DecodedItemExtras {
  const raw = decodeFromHexerr(hexString);
  const propMap = buildPropMap(raw);

  const semantic: Record<string, number | string> = {};
  for (const [prop, value] of propMap) {
    const name = resolvePropName(prop);
    // Apply known transforms
    if (prop === 4330 && typeof value === 'number') {
      semantic[name] = value / 10;  // 400 -> 40.0%
    } else {
      semantic[name] = value;
    }
  }

  return { raw, propMap, semantic };
}

// ============================================================================
// MASS-SCAN COOLDOWN HUNTER
// ============================================================================

export interface CooldownCandidate {
  itemId: number;
  itemName: string;
  props: ExtraMapEntry[];
  potentialCooldownProp?: number;
  potentialCooldownValue?: number;
}

/**
 * Scan decoded extras for potential cooldown props.
 * Looks for int props near 4330-4334 that aren't already mapped.
 */
export function findCooldownCandidates(
  items: Array<{ id: number; name: string; extraHex: string }>
): CooldownCandidate[] {
  const candidates: CooldownCandidate[] = [];

  for (const item of items) {
    try {
      const props = decodeFromHexerr(item.extraHex);
      const knownProps = new Set([4330, 4332, 4333, 4334]);
      const unknownIntProps = props.filter(
        p => p.$type === 0 && !knownProps.has(p.prop)
      );

      if (unknownIntProps.length > 0) {
        // Pick the most likely: closest to 4330-4334 range
        const closest = unknownIntProps.sort(
          (a, b) => Math.abs(a.prop - 4331) - Math.abs(b.prop - 4331)
        )[0];

        candidates.push({
          itemId: item.id,
          itemName: item.name,
          props,
          potentialCooldownProp: closest.prop,
          potentialCooldownValue: closest.intvalue
        });
      }
    } catch (e) {
      // Skip malformed entries
    }
  }

  return candidates;
}

export default {
  decodeExtrasMap,
  decodeFromHexerr,
  formatExtraEntry,
  buildPropMap,
  decodeItemExtras,
  resolvePropName,
  KNOWN_PROPS,
  findCooldownCandidates
};