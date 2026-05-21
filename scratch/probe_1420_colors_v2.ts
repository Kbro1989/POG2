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

for (const comp of comps) {
    if (comp.scripts?.load) {
        const loadScript = comp.scripts.load[0];
        if (loadScript === 7893 || loadScript === 7901 || loadScript === 10896) {
            console.log(`\nComp ${comp.componentId} | type: ${comp.type} | name: ${comp.name} | text: ${comp.text}`);
            console.log(`  Load Script: ${JSON.stringify(comp.scripts.load)}`);
            comp.scripts.load.forEach((arg: any) => {
                if (typeof arg === 'number' && arg > 100 && arg < 65000) {
                    const vb = getVarbit(arg);
                    if (vb) console.log(`    Found varbit ${arg}: varid=${vb.varid} bits=[${vb.bits[0]},${vb.bits[1]}]`);
                }
            });
        }
    }
}
