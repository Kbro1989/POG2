import * as fs from 'fs';
import * as path from 'path';

// Define expected paths
const REGISTRY_PATH = 'D:/sovereign/cache_pedagogy/json_dumps/varbits_registry_new.json';

interface VarBit {
    varid: number;
    bits: [number, number];
}

async function analyzeVarbits() {
    console.log(`Loading varbits registry from: ${REGISTRY_PATH}`);
    
    if (!fs.existsSync(REGISTRY_PATH)) {
        console.error("Registry file not found!");
        return;
    }
    
    const registry: Record<string, VarBit> = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
    
    // Convert to array and sort by varbit ID
    const varbits = Object.entries(registry)
        .map(([idStr, vb]) => ({
            id: parseInt(idStr, 10),
            varid: vb.varid,
            startBit: vb.bits[0],
            endBit: vb.bits[1],
            width: (vb.bits[1] - vb.bits[0]) + 1
        }))
        .sort((a, b) => a.id - b.id);
        
    console.log(`Loaded ${varbits.length} total varbits.`);
    
    // Width distribution
    const widthDistribution: Record<number, number> = {};
    const morphCandidates: any[] = [];
    const highFidelityCandidates: any[] = [];
    const refreshBlockCandidates: any[] = [];
    
    let currentBlock: { id: number; varid: number; startBit: number; endBit: number; width: number }[] = [];
    
    for (let i = 0; i < varbits.length; i++) {
        const vb = varbits[i];
        
        // Distribution
        widthDistribution[vb.width] = (widthDistribution[vb.width] || 0) + 1;
        
        // 8-bit body morphs (scale, muscle, fat, jaw, nose, etc.)
        if (vb.width >= 7 && vb.width <= 9) {
            morphCandidates.push(vb);
        }
        
        // Unusually large varbits (10+ bits, colors, packed features)
        if (vb.width >= 10) {
            highFidelityCandidates.push(vb);
        }
        
        // Look for contiguous blocks above 15000 with 8-bit precision
        if (vb.id >= 15000 && vb.width >= 5) {
            if (currentBlock.length === 0) {
                currentBlock.push(vb);
            } else {
                const prev = currentBlock[currentBlock.length - 1];
                if (vb.id === prev.id + 1 && vb.varid === prev.varid) {
                    currentBlock.push(vb);
                } else {
                    if (currentBlock.length >= 3) {
                        refreshBlockCandidates.push([...currentBlock]);
                    }
                    currentBlock = [vb];
                }
            }
        }
    }
    
    console.log("\n--- Bit-Width Distribution ---");
    const sortedWidths = Object.keys(widthDistribution).map(Number).sort((a, b) => a - b);
    for (const w of sortedWidths) {
        console.log(`${w}-bit width: ${widthDistribution[w]} varbits`);
    }
    
    console.log(`\n--- Potential Morphology Candidates (8-bit width) ---`);
    console.log(`Found ${morphCandidates.length} total. Filtering to high-ID range (> 15000)...`);
    const highIdMorphs = morphCandidates.filter(v => v.id >= 15000);
    console.log(`Found ${highIdMorphs.length} high-ID 8-bit candidates.`);
    
    console.log("\n--- Contiguous Feature Blocks (>15000, 5+ bits) ---");
    if (refreshBlockCandidates.length === 0) {
        console.log("No contiguous feature blocks found above ID 15000.");
    } else {
        refreshBlockCandidates.forEach(block => {
            console.log(`\nBlock [Varbit ${block[0].id} to ${block[block.length - 1].id}] - Varp ${block[0].varid}`);
            block.forEach((vb: any) => {
                console.log(`  Varbit ${vb.id}: bits ${vb.startBit}-${vb.endBit} (width ${vb.width})`);
            });
        });
    }
}

analyzeVarbits().catch(console.error);
