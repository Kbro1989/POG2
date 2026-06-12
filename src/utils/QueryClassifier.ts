/**
 * QueryClassifier.ts
 *
 * High-precision router for RS3 entity resolution.
 * Distinguishes between Structural (Cache-exclusive), Semantic (Wiki-based),
 * and Hybrid queries to optimize enrichment paths and prevent wasteful API calls.
 *
 * Domain Boundary:
 * - Structural: Enums, DBRows, Varps, Varbits, Pure IDs. Resolved via CacheForensicsLimb.
 * - Semantic: Names, Lore, Descriptions. Resolved via WikiEnricher / Official APIs.
 * - Spatial: Area IDs, Regions. Resolved via CacheForensicsLimb / Spatial limbs.
 */

export type QueryType =
  | 'structural_enum'
  | 'structural_dbrow'
  | 'structural_dbtable'
  | 'structural_varp'
  | 'structural_varbit'
  | 'structural_id'      // Pure number, ambiguous
  | 'spatial_area'
  | 'spatial_region'
  | 'semantic_name'      // Text, likely item/NPC/place
  | 'semantic_lore'      // Text, likely quest/story
  | 'hybrid'             // Mixed (e.g., "Abyssal demon 1615")
  | 'unknown';

export interface ClassifiedQuery {
  raw: string;
  type: QueryType;
  confidence: number;     // 0-1, based on pattern match strength
  extractedIds: number[];   // Any numbers found in query
  extractedNames: string[]; // Any text tokens
}

export class QueryClassifier {
  private static readonly STRUCTURAL_PREFIXES =
    /^(enum|dbrow|dbcolumn|dbtable|varp|varbit|struct|params)\s*(\d+)$/i;

  private static readonly SPATIAL_PREFIXES =
    /^(area|region|mapsquare|square|plane|coordinate)\s*([\d,]+)$/i;

  private static readonly ID_ONLY = /^\d+$/;

  /**
   * Classifies a raw query string into a specific resolution path.
   * @param query The raw user input or system query.
   */
  public static classify(query: string): ClassifiedQuery {
    const trimmed = query.trim().toLowerCase();

    // 1. Structural prefix match (e.g., "enum 1234")
    const structMatch = trimmed.match(this.STRUCTURAL_PREFIXES);
    if (structMatch) {
      return {
        raw: query,
        type: `structural_${structMatch[1].toLowerCase()}` as QueryType,
        confidence: 0.95,
        extractedIds: [parseInt(structMatch[2])],
        extractedNames: []
      };
    }

    // 2. Spatial prefix match (e.g., "area 50,50")
    const spatialMatch = trimmed.match(this.SPATIAL_PREFIXES);
    if (spatialMatch) {
      return {
        raw: query,
        type: 'spatial_area',
        confidence: 0.9,
        extractedIds: spatialMatch[2].split(',').map(id => parseInt(id.trim())),
        extractedNames: []
      };
    }

    // 3. Pure number = ambiguous ID
    if (this.ID_ONLY.test(trimmed)) {
      return {
        raw: query,
        type: 'structural_id',
        confidence: 0.6,  // Low confidence — could be an ID or a simple count
        extractedIds: [parseInt(trimmed)],
        extractedNames: []
      };
    }

    // 4. Text = semantic
    // Check if it contains numbers (hybrid)
    const numbers = trimmed.match(/\d+/g)?.map(Number) || [];
    if (numbers.length > 0) {
      return {
        raw: query,
        type: 'hybrid',
        confidence: 0.8,
        extractedIds: numbers,
        extractedNames: [trimmed.replace(/\d+/g, '').trim()]
      };
    }

    // Default to semantic name
    return {
      raw: query,
      type: 'semantic_name',
      confidence: 0.7,
      extractedIds: [],
      extractedNames: [trimmed]
    };
  }
}

