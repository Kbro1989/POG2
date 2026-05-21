import * as fs from 'fs';

const dump = JSON.parse(fs.readFileSync('D:/POG2/scratch/interface_1420_dump.json', 'utf8'));
const comps: any[] = dump.components || dump;

const targetComps = [70, 71, 74, 75, 78, 79, 82, 83, 86, 87, 90, 91];
for (const c of comps) {
    if (targetComps.includes(c.componentId)) {
        console.log(`--- COMP ${c.componentId} ---`);
        console.log(JSON.stringify(c, null, 2));
    }
}

// Check what parent container 68 (Appearance tab init) calls:
const c68 = comps.find((c: any) => c.componentId === 68);
if (c68) {
    console.log('\n--- COMP 68 (Init script 7888) ---');
    console.log(JSON.stringify(c68, null, 2));
}

// Let's also decode the Enum 1195 to save it as the official color mapping.
const enums = JSON.parse(fs.readFileSync('D:/sovereign/cache_pedagogy/json_dumps/enums.json', 'utf8'));
const e1195 = enums['1195'];
if (e1195) {
    fs.writeFileSync('D:/POG2/scratch/enum_1195_colors.json', JSON.stringify(e1195, null, 2));
}
