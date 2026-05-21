import * as fs from 'fs';

const dump = JSON.parse(fs.readFileSync('D:/POG2/scratch/interface_1420_dump.json', 'utf8'));
const comps: any[] = dump.components || dump;
const compMap = new Map<number, any>();
for (const comp of comps) compMap.set(comp.componentId, comp);

// Decode packed component references from script args
function decodeComponentRef(packed: number): { interfaceId: number; componentId: number } | null {
    if (packed < 0 || packed > 0x7FFFFFFF) return null;
    const interfaceId = (packed >>> 16) & 0xFFFF;
    const componentId = packed & 0xFFFF;
    if (interfaceId === 0 || interfaceId > 3000) return null;
    return { interfaceId, componentId };
}

console.log('=== DECODING SCRIPT ARGS AS COMPONENT REFERENCES ===\n');

// All script load invocations
for (const comp of comps) {
    if (!comp.scripts?.load || comp.scripts.load.length < 2) continue;
    const scriptId = comp.scripts.load[0];
    const args = comp.scripts.load.slice(1) as number[];
    
    const decodedArgs: string[] = [];
    for (const arg of args) {
        if (typeof arg === 'string') {
            decodedArgs.push(`"${arg}"`);
            continue;
        }
        const ref = decodeComponentRef(arg);
        if (ref && ref.interfaceId === 1420) {
            const target = compMap.get(ref.componentId);
            const targetText = target?.text || target?.type || '?';
            decodedArgs.push(`iface${ref.interfaceId}:comp${ref.componentId}(${targetText})`);
        } else if (arg === -2147483645) {
            decodedArgs.push('COMPONENT_SELF');
        } else if (arg === -2147483643) {
            decodedArgs.push('COMPONENT_PARENT');
        } else if (arg === -1) {
            decodedArgs.push('NULL');
        } else {
            decodedArgs.push(String(arg));
        }
    }
    
    console.log(`comp=${comp.componentId} script=${scriptId} → [${decodedArgs.join(', ')}]`);
}

// Now look at the enums dump for skin-colour related entries
console.log('\n\n=== SEARCHING ENUMS FOR SKIN/COLOUR/APPEARANCE ===\n');

const enumsPath = 'D:/sovereign/cache_pedagogy/json_dumps/enums.json';
if (fs.existsSync(enumsPath)) {
    const enums = JSON.parse(fs.readFileSync(enumsPath, 'utf8'));
    
    // Search for enums with skin/colour/appearance in their values
    let found = 0;
    for (const [enumId, enumData] of Object.entries(enums) as [string, any][]) {
        const values = enumData.values || enumData.entries || [];
        const allValues = JSON.stringify(values).toLowerCase();
        
        if (allValues.includes('skin') || allValues.includes('colour') || 
            allValues.includes('appearance') || allValues.includes('hair') ||
            allValues.includes('body type') || allValues.includes('gender')) {
            console.log(`Enum ${enumId}:`);
            if (Array.isArray(values)) {
                for (const v of values.slice(0, 10)) {
                    console.log(`  ${JSON.stringify(v)}`);
                }
                if (values.length > 10) console.log(`  ... (${values.length} total)`);
            } else {
                const keys = Object.keys(values).slice(0, 10);
                for (const k of keys) {
                    console.log(`  [${k}] = ${JSON.stringify(values[k])}`);
                }
            }
            found++;
            if (found > 20) { console.log('... truncated'); break; }
        }
    }
    if (found === 0) console.log('No matching enums found. Trying raw value scan...');
} else {
    console.log('Enums dump not found at: ' + enumsPath);
}

// Also scan for enum entries referencing varbit 28557 or 2830
console.log('\n\n=== ENUMS REFERENCING VARBITS 28557, 2830 ===\n');
if (fs.existsSync(enumsPath)) {
    const enums = JSON.parse(fs.readFileSync(enumsPath, 'utf8'));
    for (const [enumId, enumData] of Object.entries(enums) as [string, any][]) {
        const raw = JSON.stringify(enumData);
        if (raw.includes('28557') || raw.includes('2830')) {
            console.log(`Enum ${enumId} references target varbits:`);
            console.log(`  ${raw.slice(0, 200)}`);
        }
    }
}
