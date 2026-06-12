import * as fs from 'fs';
import * as path from 'path';

const dump = JSON.parse(fs.readFileSync('D:/POG2/scratch/interface_1420_dump.json', 'utf8'));
const comps: any[] = dump.components || dump;

const VARBITS_DIR = 'D:/sovereign/memory/pedagogy/varbits_json';

const varbitCache = new Map<number, any>();
function getVarbit(id: number): any {
    if (varbitCache.has(id)) return varbitCache.get(id);
    const filePath = path.join(VARBITS_DIR, `varbits-${id}.json`);
    try {
        if (!fs.existsSync(filePath)) { varbitCache.set(id, null); return null; }
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        varbitCache.set(id, data);
        return data;
    } catch { return null; }
}

console.log("=== Component 128 (Randomize All) ===");
const comp128 = comps.find(c => c.componentId === 128);
if (comp128) {
    console.log(`Scripts Load: ${JSON.stringify(comp128.scripts?.load)}`);
    console.log(`Varbit 2830 Info: ${JSON.stringify(getVarbit(2830))}`);
}

console.log("\n=== Color Picker Components (e.g. 105, 113) ===");
const colorComps = [105, 113];
for (const cid of colorComps) {
    const comp = comps.find(c => c.componentId === cid);
    if (comp) {
        console.log(`Comp ${cid} Scripts Load: ${JSON.stringify(comp.scripts?.load)}`);
        if (comp.scripts?.load) {
            comp.scripts.load.forEach((arg: any) => {
                if (typeof arg === 'number' && arg > 100 && arg < 65000) {
                    const vb = getVarbit(arg);
                    if (vb) console.log(`  Found varbit ${arg}: ${JSON.stringify(vb)}`);
                }
            });
        }
    }
}

console.log("\n=== Appearance Category Rows (e.g. 70, 74, 78, 82, 86, 90) ===");
const categoryRows = [70, 74, 78, 82, 86, 90];
for (const cid of categoryRows) {
    const comp = comps.find(c => c.componentId === cid);
    if (comp) {
        console.log(`Comp ${cid} text: ${comp.text}`);
        console.log(`Comp ${cid} Scripts Load: ${JSON.stringify(comp.scripts?.load)}`);
        if (comp.scripts?.load) {
            comp.scripts.load.forEach((arg: any) => {
                if (typeof arg === 'number' && arg > 100 && arg < 65000) {
                    const vb = getVarbit(arg);
                    if (vb) console.log(`  Found varbit ${arg}: ${JSON.stringify(vb)}`);
                }
            });
        }
    }
}
