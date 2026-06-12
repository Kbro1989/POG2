import * as fs from 'fs';
import * as path from 'path';

const ENUMS_PATH = 'D:/sovereign/cache_pedagogy/json_dumps/enums.json';

const ABILITY_NAMES = [
    'Havoc', 'Dismember', 'Fury', 'Punish', 'Backhand', 'Flurry', 'Hurricane',
    'Slaughter', 'Assault', 'Overpower', 'Meteor Strike', 'Berserk', 'Pulverise',
    'Chaos Roar', 'Barge', 'Decimate', 'Cleave', 'Sever', 'Slice', 'Smash', 'Quake', 'Destroy',
    'Piercing Shot', 'Snipe', 'Ricochet', 'Binding Shot', 'Corruption Shot',
    'Galeshot', 'Snap Shot', 'Rapid Fire', 'Shadow Tendrils', 'Bombardment',
    "Death's Swiftness", 'Deadshot', 'Imbue Shadows',
    'Dragon Breath', 'Sonic Wave', 'Concentrated Blast', 'Impact', 'Combust',
    'Chain', 'Asphyxiate', 'Wild Magic', 'Smoke Tendrils', 'Magma Tempest',
    'Corruption Blast', 'Sunshine', 'Omnipower', 'Runic Charge',
    'Touch of Death', 'Soul Sap', 'Soul Strike', 'Necrotic Burst',
    'Command Undead', 'Conjure Undead', 'Finger of Death', 'Volley of Souls',
    'Death Skulls', 'Living Death', 'Bloat', 'Spectral Scythe',
    'Resonance', 'Devotion', 'Debilitate', 'Reflect', 'Barricade',
    'Immortality', 'Rejuvenate', 'Surge', 'Escape', 'Bladed Dive'
];

const abilitySet = new Set(ABILITY_NAMES.map(n => n.toLowerCase()));

async function main() {
    if (!fs.existsSync(ENUMS_PATH)) {
        console.error(`Enums file not found: ${ENUMS_PATH}`);
        return;
    }

    console.log("Loading enums...");
    const enums = JSON.parse(fs.readFileSync(ENUMS_PATH, 'utf8'));
    console.log(`Loaded ${Object.keys(enums).length} enums.`);

    const found: any[] = [];

    for (const [enumId, enumData] of Object.entries(enums) as [string, any][]) {
        const map = enumData.map || enumData.values || {};
        const entries = Object.entries(map);
        
        let matchCount = 0;
        const matches: any[] = [];
        
        for (const [k, v] of entries) {
            if (typeof v === 'string' && abilitySet.has(v.trim().toLowerCase())) {
                matchCount++;
                matches.push({ key: k, value: v });
            }
        }
        
        if (matchCount > 0) {
            found.push({
                enumId,
                keyType: enumData.keyType || enumData.keytype,
                valType: enumData.valType || enumData.valtype,
                totalSize: entries.length,
                matches
            });
        }
    }

    console.log(`Found ${found.length} enums containing ability names:`);
    for (const item of found) {
        console.log(`\nEnum ${item.enumId} (keyType=${item.keyType}, valType=${item.valType}, size=${item.totalSize}):`);
        for (const m of item.matches) {
            console.log(`  [${m.key}] = "${m.value}"`);
        }
    }
}

main().catch(console.error);
