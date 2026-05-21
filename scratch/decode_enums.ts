import * as fs from 'fs';

const enumsPath = 'D:/sovereign/cache_pedagogy/json_dumps/enums.json';
const enums = JSON.parse(fs.readFileSync(enumsPath, 'utf8'));

// Decode enum 1195 — potential skin colour palette
console.log('=== ENUM 1195 (Potential Skin Colour Palette) ===');
const e1195 = enums['1195'];
if (e1195) {
    console.log(`KeyType: ${e1195.keyType}, ValType: ${e1195.valType}, Size: ${e1195.size}`);
    for (const [k, v] of Object.entries(e1195.map)) {
        // Decode as RGB colour
        const val = Number(v);
        const r = (val >> 16) & 0xFF;
        const g = (val >> 8) & 0xFF;
        const b = val & 0xFF;
        console.log(`  [${k}] = ${v} → RGB(${r}, ${g}, ${b}) #${val.toString(16).padStart(6, '0')}`);
    }
}

// Decode enum 711 — potential appearance kit
console.log('\n=== ENUM 711 (Potential Appearance Kit) ===');
const e711 = enums['711'];
if (e711) {
    console.log(`KeyType: ${e711.keyType}, ValType: ${e711.valType}, Size: ${e711.size}`);
    const entries = Object.entries(e711.map).slice(0, 30);
    for (const [k, v] of entries) {
        console.log(`  [${k}] = ${v}`);
    }
    if (Object.keys(e711.map).length > 30) console.log(`  ... (${Object.keys(e711.map).length} total)`);
}

// Decode enum 3482 and 5061 — also potential kits
for (const eid of ['3482', '5061']) {
    console.log(`\n=== ENUM ${eid} ===`);
    const e = enums[eid];
    if (e) {
        console.log(`KeyType: ${e.keyType}, ValType: ${e.valType}, Size: ${e.size}`);
        const entries = Object.entries(e.map).slice(0, 20);
        for (const [k, v] of entries) {
            console.log(`  [${k}] = ${v}`);
        }
        if (Object.keys(e.map).length > 20) console.log(`  ... (${Object.keys(e.map).length} total)`);
    }
}

// Decode enum 4189 — sequential keys 0-17+ 
console.log('\n=== ENUM 4189 (Sequential Kit IDs?) ===');
const e4189 = enums['4189'];
if (e4189) {
    console.log(`KeyType: ${e4189.keyType}, ValType: ${e4189.valType}, Size: ${e4189.size}`);
    const entries = Object.entries(e4189.map).slice(0, 25);
    for (const [k, v] of entries) {
        console.log(`  [${k}] = ${v}`);
    }
    if (Object.keys(e4189.map).length > 25) console.log(`  ... (${Object.keys(e4189.map).length} total)`);
}

// Now search for enums with 8 or fewer entries that could be skin tone (varbit 28557 = 3-bit = 8 options)
console.log('\n\n=== ENUMS WITH 7-8 ENTRIES (Potential Skin Tone Palettes) ===');
let colourCandidates = 0;
for (const [enumId, enumData] of Object.entries(enums) as [string, any][]) {
    const size = enumData.size || Object.keys(enumData.map || {}).length;
    if (size >= 7 && size <= 8) {
        const values = Object.values(enumData.map || {});
        // Check if values look like colours (large numbers, RGB range)
        const allColours = values.every((v: any) => typeof v === 'number' && v > 100000 && v < 16777216);
        if (allColours) {
            console.log(`\nEnum ${enumId} (${size} entries) — COLOUR PALETTE CANDIDATE:`);
            for (const [k, v] of Object.entries(enumData.map)) {
                const val = Number(v);
                const r = (val >> 16) & 0xFF;
                const g = (val >> 8) & 0xFF;
                const b = val & 0xFF;
                console.log(`  [${k}] = RGB(${r}, ${g}, ${b}) #${val.toString(16).padStart(6, '0')}`);
            }
            colourCandidates++;
        }
    }
}
if (colourCandidates === 0) {
    // Try broader search — values in colour range but any size
    console.log('No strict 8-entry colour palettes found. Searching broader...');
    for (const [enumId, enumData] of Object.entries(enums) as [string, any][]) {
        const size = enumData.size || Object.keys(enumData.map || {}).length;
        if (size >= 4 && size <= 16) {
            const values = Object.values(enumData.map || {}) as number[];
            const allColours = values.every((v: any) => typeof v === 'number' && v > 65536);
            if (allColours && values.length >= 4) {
                // Sample first value to see if it's RGB-like
                const first = values[0];
                const r = (first >> 16) & 0xFF;
                if (r > 50 && r < 250) { // Plausible skin tone range
                    const g = (first >> 8) & 0xFF;
                    const b = first & 0xFF;
                    if (Math.abs(r - g) < 80 && Math.abs(r - b) < 80) { // Skin-like: R≈G≈B or warm bias
                        console.log(`\nEnum ${enumId} (${size} entries) — Possible skin palette:`);
                        for (const [k, v] of Object.entries(enumData.map).slice(0, 10)) {
                            const val = Number(v);
                            const rr = (val >> 16) & 0xFF;
                            const gg = (val >> 8) & 0xFF;
                            const bb = val & 0xFF;
                            console.log(`  [${k}] = RGB(${rr}, ${gg}, ${bb}) #${val.toString(16).padStart(6, '0')}`);
                        }
                        colourCandidates++;
                        if (colourCandidates > 10) break;
                    }
                }
            }
        }
    }
}
