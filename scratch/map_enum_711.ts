import * as fs from 'fs';
import * as path from 'path';

// Parse enum 711
const enumsPath = 'D:/sovereign/cache_pedagogy/json_dumps/enums.json';
const enums = JSON.parse(fs.readFileSync(enumsPath, 'utf8'));

const e711 = enums['711'];
if (!e711) {
    console.error('Enum 711 not found');
    process.exit(1);
}

console.log(`=== ENUM 711 APPEARANCE KIT MAP ===`);
console.log(`ValType: ${e711.valType} (Likely Struct, Item, or IdentityKit ID)`);

const vals = Object.values(e711.map).slice(0, 50) as number[];
console.log('Sample mapped IDs:', vals);

// Identity kits are usually in major 3, archive 3.
// Let's check if we have a dump of idks or structs.
const idkPath = 'D:/sovereign/cache_pedagogy/json_dumps/idk.json';
if (fs.existsSync(idkPath)) {
    const idks = JSON.parse(fs.readFileSync(idkPath, 'utf8'));
    console.log(`\nLoaded ${Object.keys(idks).length} Identity Kits (IDK). Checking if Enum 711 values map to IDKs...`);
    
    let matchedIdk = 0;
    for (const val of vals) {
        if (idks[val]) {
            console.log(`Match IDK ${val}:`, JSON.stringify(idks[val]).slice(0, 100) + '...');
            matchedIdk++;
        }
    }
    console.log(`Matched ${matchedIdk}/${vals.length} sample IDs against IDK database.`);
} else {
    console.log('\nNo idk.json found.');
}

const structPath = 'D:/sovereign/cache_pedagogy/json_dumps/structs.json';
if (fs.existsSync(structPath)) {
    const structs = JSON.parse(fs.readFileSync(structPath, 'utf8'));
    console.log(`\nLoaded ${Object.keys(structs).length} Structs. Checking if Enum 711 values map to Structs...`);
    
    let matchedStruct = 0;
    for (const val of vals) {
        if (structs[val]) {
            console.log(`Match Struct ${val}:`, JSON.stringify(structs[val]).slice(0, 100) + '...');
            matchedStruct++;
        }
    }
    console.log(`Matched ${matchedStruct}/${vals.length} sample IDs against Struct database.`);
} else {
    console.log('\nNo structs.json found.');
}
