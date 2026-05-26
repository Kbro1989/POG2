export enum InteractionCategory {
    DIALOGUE = 'DIALOGUE',         // talk, talk-to, talk at
    MECHANICAL = 'MECHANICAL',     // open, close, push, pull
    TRANSVERSAL = 'TRANSVERSAL',   // enter, climb, squeeze-through
    FORENSIC = 'FORENSIC',         // search, look, examine
    ECONOMY = 'ECONOMY',           // trade, shop, buy
    UNKNOWN = 'UNKNOWN'
}

/**
 * Sovereign Vocabulary Limb
 * Translates raw jagex interaction strings into standardized AI mechanical states.
 */
export class SovereignVocabularyLimb {
    
    constructor() {
        console.log("SovereignVocabularyLimb: Semantic translation initialized.");
    }

    /**
     * Normalizes a raw string (e.g., 'Talk-to', 'talk', 'Talk at') into a core handle.
     */
    public normalizeHandle(rawAction: string | null | undefined): string {
        if (!rawAction) return '';
        
        // Lowercase, trim, replace hyphens with spaces
        const normalized = rawAction.toLowerCase().trim().replace(/-/g, ' ');

        return normalized;
    }

    /**
     * Categorizes a normalized handle into an actionable AI state.
     */
    public categorize(action: string | null | undefined): InteractionCategory {
        const handle = this.normalizeHandle(action);
        if (!handle) return InteractionCategory.UNKNOWN;

        if (handle.startsWith('talk')) return InteractionCategory.DIALOGUE;
        if (handle.startsWith('trade') || handle.includes('shop') || handle.includes('store')) return InteractionCategory.ECONOMY;
        if (handle.startsWith('open') || handle.startsWith('close') || handle === 'push' || handle === 'pull') return InteractionCategory.MECHANICAL;
        if (handle.startsWith('enter') || handle.startsWith('climb') || handle.includes('squeeze') || handle.includes('jump')) return InteractionCategory.TRANSVERSAL;
        if (handle.startsWith('search') || handle.startsWith('look') || handle.startsWith('examine') || handle.startsWith('read')) return InteractionCategory.FORENSIC;

        return InteractionCategory.UNKNOWN;
    }
    
    /**
     * Determines if the action dictates shifting the physical state of the entity (e.g., opening a door).
     */
    public isStateShiftingAction(action: string | null | undefined): boolean {
        return this.categorize(action) === InteractionCategory.MECHANICAL;
    }

    /**
     * Determines if the action dictates moving the probe's coordinate or plane.
     */
    public isTransversalAction(action: string | null | undefined): boolean {
        return this.categorize(action) === InteractionCategory.TRANSVERSAL;
    }
}
