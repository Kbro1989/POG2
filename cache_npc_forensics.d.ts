/**
 * cache_npc_forensics.ts - Full NPC Decompiler Proof-of-Work
 *
 * Pulls the complete opcode-decoded definition for any NPC ID from the RS3 cache.
 * Extracts models, animations, actions, and combat data.
 * Special handling for Player NPC templates (15516-15524).
 *
 * Usage: npx tsx cache_npc_forensics.ts --id 50          (King Black Dragon)
 *        npx tsx cache_npc_forensics.ts --id 15516       (Player template)
 *        npx tsx cache_npc_forensics.ts --range 50-60    (range)
 *
 * Substrate hook: Powers EntityLimb.catalogEntity() and PedagogyLimb NPC learning.
 */
interface NpcForensicResult {
    id: number;
    raw: any;
    forensics: {
        name: string;
        combatLevel: number | null;
        isPlayerTemplate: boolean;
        models: number[];
        headModels: number[];
        actions: string[];
        boundSize: number | null;
        colorReplacements: [number, number][] | null;
        materialReplacements: [number, number][] | null;
        animationGroup: number | null;
        animations: {
            idle: number | null;
            walk: number | null;
            run: number | null;
            turnBack: number | null;
            turnLeft: number | null;
            turnRight: number | null;
        };
        isMinimapVisible: boolean | null;
    };
    pedagogy: {
        summary: string;
        classification: 'player_template' | 'combat_npc' | 'passive_npc' | 'scenery_npc' | 'unknown';
        modelComplexity: 'simple' | 'moderate' | 'complex';
    };
}
declare const PLAYER_TEMPLATE_IDS: Set<number>;
declare function loadNpc(cache: any, id: number): Promise<NpcForensicResult | null>;
export { loadNpc, PLAYER_TEMPLATE_IDS };
export type { NpcForensicResult };
