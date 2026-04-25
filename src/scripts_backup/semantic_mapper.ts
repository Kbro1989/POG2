import * as fs from "fs";
import * as path from "path";

// RS3 Known Param Definitions (Sovereign Core Map)
const PARAM_MAP: Record<number, { key: string, type: 'number' | 'string' | 'boolean', label?: string }> = {
    // Requirements
    749: { key: "req_attack", type: "number" },
    750: { key: "req_defence", type: "number" },
    751: { key: "req_strength", type: "number" },
    752: { key: "req_ranged", type: "number" },
    753: { key: "req_magic", type: "number" },
    
    // Combat Stats (EoC)
    2195: { key: "melee_strength_bonus", type: "number" },
    644: { key: "combat_style_id", type: "number" }, // usually 1578 for melee, etc
    641: { key: "accuracy_bonus", type: "number" },
    14: { key: "weapon_speed", type: "number" },
    3267: { key: "armor_bonus", type: "number" },
    686: { key: "life_point_bonus", type: "number" },
    118: { key: "prayer_bonus", type: "number" },
    
    // Special Attack
    4332: { key: "special_attack_cost", type: "number" },
    4333: { key: "special_attack_name", type: "string" },
    4334: { key: "special_attack_desc", type: "string" },

    // GE/Economy
    2825: { key: "ge_tradeable", type: "number" },
    2820: { key: "grand_exchange_value", type: "number" },
    5551: { key: "high_alch_value", type: "number" },
};

const SYSTEM_DIR = "D:\\sovereign\\atlas\\system";
const ITEM_DB = "D:\\sovereign\\atlas\\item\\item_definitions.json";
const OBJECT_DB = "D:\\sovereign\\atlas\\spatial\\system_taxonomy\\object_definitions.json";

function enrich(data: any[], type: string): any[] {
    console.log(`Enriching ${data.length} ${type}s...`);
    const enriched = data.map(entry => {
        if (!entry.extra) return entry;
        
        const semanticStats: Record<string, any> = {};
        const unknownParams: Record<number, any> = {};
        
        entry.extra.forEach((param: any) => {
            const mapped = PARAM_MAP[param.prop];
            const value = param.stringvalue !== null && param.stringvalue !== undefined ? param.stringvalue : param.intvalue;
            
            if (mapped) {
                semanticStats[mapped.key] = value;
            } else {
                unknownParams[param.prop] = value;
            }
        });

        return {
            ...entry,
            semanticStats: Object.keys(semanticStats).length > 0 ? semanticStats : undefined,
            unknownParams: Object.keys(unknownParams).length > 0 ? unknownParams : undefined,
            extra: undefined // Remove old obfuscated array
        };
    });
    
    return enriched;
}

function run() {
    console.log("🚀 Sovereign Semantic Mapper");
    
    if (fs.existsSync(ITEM_DB)) {
        const items = JSON.parse(fs.readFileSync(ITEM_DB, "utf8"));
        const enrichedItems = enrich(items, "Item");
        fs.writeFileSync(ITEM_DB.replace(".json", "_enriched.json"), JSON.stringify(enrichedItems, null, 2));
        console.log(`✅ Output to items_definitions_enriched.json`);
    }

    if (fs.existsSync(OBJECT_DB)) {
        const objs = JSON.parse(fs.readFileSync(OBJECT_DB, "utf8"));
        const enrichedObjs = enrich(objs, "Object");
        fs.writeFileSync(OBJECT_DB.replace(".json", "_enriched.json"), JSON.stringify(enrichedObjs, null, 2));
        console.log(`✅ Output to object_definitions_enriched.json`);
    }
}

run();
