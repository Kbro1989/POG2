import * as fs from 'fs';

// 1. Load enums
const enumsPath = 'D:/sovereign/cache_pedagogy/json_dumps/enums.json';
const enums = JSON.parse(fs.readFileSync(enumsPath, 'utf8'));

// 2. Load items
const itemsPath = 'D:/sovereign/cache_pedagogy/json_dumps/items.json';
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

// 3. Extract model IDs for Avatar Refresh kit
// Let's use Enum 3482, 5061, and 4189, as well as 711.
const enumsToCheck = ['3482', '5061', '4189'];

console.log('=== APPEARANCE KIT → MODEL ID EXTRACTOR ===\n');

for (const enumId of enumsToCheck) {
    const e = enums[enumId];
    if (!e) continue;
    
    console.log(`\nEnum ${enumId} (${e.size} entries) - Checking Item Definitions:`);
    
    let matchedModels = 0;
    const entries = Object.entries(e.map).slice(0, 10);
    
    for (const [key, itemId] of entries) {
        const item = items[String(itemId)];
        if (item) {
            console.log(`  [${key}] Item ${itemId}: "${item.name || 'Unnamed'}"`);
            
            // Log models
            if (item.maleModel0) console.log(`      Male Model: ${item.maleModel0}`);
            if (item.femaleModel0) console.log(`      Female Model: ${item.femaleModel0}`);
            if (item.inventoryModel) console.log(`      Inv Model: ${item.inventoryModel}`);
            
            if (item.maleModel0 || item.femaleModel0) matchedModels++;
        }
    }
    console.log(`  (Sampled 10 entries: ${matchedModels} had character models)`);
}

// Let's check a few Avatar Refresh items manually if we know their names
console.log('\n=== SEARCHING FOR AVATAR REFRESH BASE MESHES ===\n');
let foundBase = 0;
for (const [id, item] of Object.entries(items) as [string, any][]) {
    if (item.name && item.name.toLowerCase().includes('base')) {
        // Just print a few
        if (foundBase < 5) {
            // console.log(`Item ${id}: ${item.name}`);
            // foundBase++;
        }
    }
}
