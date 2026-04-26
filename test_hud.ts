import { HUDForensicsLimb } from './src/limbs/spatial/HUDForensicsLimb.js';

const limb = new HUDForensicsLimb();
const results = await limb.scanAtlas('d:/D-sovereign-/cache_pedagogy/atlas/interfaces');

// Print full breakdown by category
const byCategory: Record<string, typeof results> = {};
for (const r of results) {
    byCategory[r.category] = [...(byCategory[r.category] || []), r];
}

console.log('\n=== CATEGORY BREAKDOWN ===');
for (const [cat, items] of Object.entries(byCategory).sort()) {
    console.log(`\n[${cat}] — ${items.length} interfaces`);
    for (const r of items.slice(0, 5)) {
        console.log(`  #${r.interfaceId} | ${r.confidence} | score:${r.score} | depth:${r.structuralMetrics.maxDepth} | text:${(r.structuralMetrics.textRatio*100).toFixed(0)}% sprite:${(r.structuralMetrics.spriteRatio*100).toFixed(0)}%`);
    }
    if (items.length > 5) console.log(`  ... and ${items.length - 5} more`);
}

console.log('\n=== HIGH CONFIDENCE ===');
const highs = results.filter(r => r.confidence === 'HIGH');
if (highs.length === 0) {
    console.log('  (none yet — top MEDIUM candidates:)');
    results.filter(r => r.confidence === 'MEDIUM').slice(0, 8).forEach(r => {
        console.log(`  #${r.interfaceId} | ${r.category} | score:${r.score} | depth:${r.structuralMetrics.maxDepth}`);
    });
} else {
    highs.forEach(r => console.log(`  #${r.interfaceId} | ${r.category} | score:${r.score}`));
}

console.log(`\nTotal: ${results.length} | FP suppressed: ${results.filter(r => r.confidence === 'FALSE_POSITIVE').length}`);
process.exit(0);
