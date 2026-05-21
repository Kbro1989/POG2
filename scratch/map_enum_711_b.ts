import * as fs from 'fs';
import * as path from 'path';

// Parse enum 711
const enumsPath = 'D:/sovereign/cache_pedagogy/json_dumps/enums.json';
const enums = JSON.parse(fs.readFileSync(enumsPath, 'utf8'));

const e711 = enums['711'];
const vals = Object.values(e711.map).slice(0, 50) as number[];

const itemsPath = 'D:/sovereign/cache_pedagogy/json_dumps/items.json';
if (fs.existsSync(itemsPath)) {
    const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
    console.log(`\nChecking if Enum 711 values map to Items...`);
    
    let matchedItem = 0;
    for (const val of vals) {
        if (items[val]) {
            console.log(`Match Item ${val}: ${items[val].name || 'Unnamed'}`);
            matchedItem++;
        }
    }
    console.log(`Matched ${matchedItem}/${vals.length} sample IDs against Items database.`);
}

const taxonomyPath = 'D:/sovereign/cache_pedagogy/json_dumps/system_taxonomy.json';
if (fs.existsSync(taxonomyPath)) {
    const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
    console.log(`\nChecking if Enum 711 values map to system_taxonomy (Structs)...`);
    
    let matchedTax = 0;
    for (const val of vals) {
        if (taxonomy[val]) {
            console.log(`Match Struct ${val}`);
            matchedTax++;
        }
    }
    console.log(`Matched ${matchedTax}/${vals.length} sample IDs against system_taxonomy.`);
}
