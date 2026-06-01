import fs from 'fs';

const STRUCTS_PATH = 'D:/sovereign/atlas/system/struct_definitions.json';

async function diagnose() {
    console.log("Analyzing Struct Definitions for semantic patterns...");
    const structs = JSON.parse(fs.readFileSync(STRUCTS_PATH, 'utf8'));
    
    const propFrequencies: Record<number, number> = {};
    const propSamples: Record<number, any[]> = {};
    const propTypes: Record<number, Set<string>> = {};

    structs.slice(0, 1000).forEach((s: any) => {
        if (!s.extra) return;
        s.extra.forEach((p: any) => {
            propFrequencies[p.prop] = (propFrequencies[p.prop] || 0) + 1;
            
            if (!propSamples[p.prop]) propSamples[p.prop] = [];
            if (propSamples[p.prop].length < 3) {
                propSamples[p.prop].push(p.stringvalue || p.intvalue);
            }

            if (!propTypes[p.prop]) propTypes[p.prop] = new Set();
            propTypes[p.prop].add(p.stringvalue !== null ? 'string' : 'int');
        });
    });

    console.log("TOP 20 FREQUENT PROPERTIES:");
    const sorted = Object.entries(propFrequencies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    sorted.forEach(([id, freq]) => {
        const type = Array.from(propTypes[Number(id)]).join('/');
        console.log(`Prop ${id}: ${freq} instances [${type}] - Samples: ${JSON.stringify(propSamples[Number(id)])}`);
    });
}

diagnose().catch(console.error);

