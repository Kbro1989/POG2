/**
 * cache_item_forensics.ts - Full Item Decompiler Proof-of-Work
 *
 * Pulls the complete opcode-decoded definition for any item ID from the RS3 cache.
 * Extracts equipment data, models, colors, quest links, and actions.
 *
 * Usage: npx tsx cache_item_forensics.ts --id 4151       (single item)
 *        npx tsx cache_item_forensics.ts --id 4151,1053  (multiple items)
 *        npx tsx cache_item_forensics.ts --range 1050-1060 (ID range)
 *
 * Substrate hook: Powers PedagogyLimb equipment learning and EntityLimb catalog.
 */
declare const SLOT_NAMES: string[];
interface ItemForensicResult {
    id: number;
    raw: any;
    forensics: {
        name: string;
        isEquippable: boolean;
        equipSlot: string | null;
        equipSlotId: number | null;
        isMember: boolean;
        isStackable: boolean;
        isTradeable: boolean;
        value: number | null;
        maleModels: (number | null)[];
        femaleModels: (number | null)[];
        maleHeads: (number | null)[];
        femaleHeads: (number | null)[];
        colorReplacements: [number, number][] | null;
        materialReplacements: [number, number][] | null;
        groundActions: string[];
        widgetActions: string[];
        questLinks: [number, number][] | null;
    };
    pedagogy: {
        summary: string;
        equipContext: string | null;
        modelCount: number;
    };
}
declare function loadItem(cache: any, id: number): Promise<ItemForensicResult | null>;
export { loadItem, SLOT_NAMES };
export type { ItemForensicResult };
