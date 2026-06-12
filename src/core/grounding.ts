import { Provenance } from './models.js';

/**
 * Sovereign Grounding Layer â€” Option C: Manifest Architecture.
 * 
 * Defines the contract between "Vibe" (Pedagogical Synthesis) and "Truth" (Substrate/Cache).
 */


export interface LineageDelta {
    readonly path: string;       // JSONPath to the modified field (e.g., "$.stats.hp")
    readonly original: any;      // The "Vibe" value from POG2 synthesis
    readonly grounded: any;      // The "Truth" value from Cache/Substrate
    readonly reason: string;     // Why the change occurred (e.g., "Cache Mismatch", "ID Resolution")
}

export type AuthorityLevel = 'ABSOLUTE' | 'DERIVED' | 'EXPERIMENTAL';

export interface GroundingEntry {
    readonly id?: string;        // Elevated identity for hot-path indexing
    readonly coord?: any;        // Elevated spatial truth (WorldCoord format)
    readonly pedigree: string;   // Path to original D:/sovereign/memory/pedagogy/*.json
    readonly authorityLevel: AuthorityLevel;
    readonly provenance?: Provenance;
    readonly grounded: {
        readonly timestamp: number;
        readonly confidence: number; // 0.0 to 1.0
        readonly authoritativeSource: 'CACHE' | 'VISUAL' | 'MEMORY';
        readonly data: Record<string, any>;
    };
    readonly deltas: LineageDelta[];
}


export interface GroundingManifest {
    readonly version: string;
    readonly project: string;
    readonly entities: Record<string, GroundingEntry>; // ID -> Entry
}

/**
 * Hydrator â€” The functional bridge for Limbs.
 */
export interface GroundingHydrator {
    /**
     * Hydrate a pedagogical object with grounded truth from the manifest.
     */
    hydrate<T>(entityId: string, pedagogy: T): T;

    /**
     * Record a new grounding decision and its lineage deltas.
     */
    record(entityId: string, entry: GroundingEntry): Promise<void>;
}

