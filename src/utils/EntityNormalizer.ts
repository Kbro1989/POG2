/**
 * EntityNormalizer
 * 
 * Maps raw API/Cache data into the standardized, type-safe format
 * required by the simulation substrate.
 */
export const EntityNormalizer = {
    normalizeNpc: (rawApiData: any): Record<string, any> => {
        return {
            name: rawApiData.name,
            combatLevel: typeof rawApiData.level === 'number' ? rawApiData.level : parseInt(rawApiData.level) || 0,
            lifePoints: typeof rawApiData.lifepoints === 'number' ? rawApiData.lifepoints : parseInt(rawApiData.lifepoints) || 0,
            defence: typeof rawApiData.defence === 'number' ? rawApiData.defence : parseInt(rawApiData.defence) || 0,
            isAggressive: !!rawApiData.aggressive,
            weakness: rawApiData.weakness || "None",
            xpValue: typeof rawApiData.xp === 'number' ? rawApiData.xp : parseFloat(rawApiData.xp) || 0,
            // ... Add fields from the user-provided JSON format ...
            boundSize: rawApiData.size || 1,
        };
    }
};
