import { HUDForensicsLimb } from '../src/limbs/spatial/HUDForensicsLimb.js';

async function main() {
    const forensics = new HUDForensicsLimb();
    let success = 0, fail = 0;
    const failures: number[] = [];
    
    for (let id = 1800; id <= 2000; id++) {
        const res = await forensics.getInterface(id);
        if (res.ok) {
            success++;
        } else {
            fail++;
            failures.push(id);
        }
    }
    
    console.log(`\n=== SCAN RESULTS ===`);
    console.log(`Success: ${success}, Fail: ${fail}`);
    console.log(`Failed IDs: ${failures.join(', ')}`);
    
    // Now check 1420 and 1946 specifically
    for (const id of [703, 1420, 1946]) {
        const res = await forensics.getInterface(id);
        if (res.ok) {
            console.log(`\n[OK] Interface ${id}: ${res.value.totalComponents} components, ${res.value.parseErrors} errors`);
            console.log(`  Text: ${res.value.textLabels.slice(0, 5).join(' | ')}`);
            console.log(`  Types: ${JSON.stringify(res.value.typeDistribution)}`);
        } else {
            console.log(`\n[FAIL] Interface ${id}: ${res.error.message}`);
        }
    }
}

main().catch(console.error);
