import { CacheForensicsLimb } from './src/limbs/spatial/CacheForensicsLimb.js';
import path from 'path';

async function test() {
    console.log('--- Targeted Cache Parsing Audit ---');
    const taxonomiesPath = 'D:/sovereign/memory/pedagogy';
    const forensics = new CacheForensicsLimb('JS5_CACHE_PLACEHOLDER', taxonomiesPath);
    
    // @ts-ignore - accessing private for testing
    await forensics.loadPreservedStates(); 
    
    console.log('--- Query: King Black Dragon ---');
    const res = forensics.queryTaxonomy({ layer: 'npcs', term: 'King Black Dragon', queryType: 'partial' });
    console.log('Result:', JSON.stringify(res, null, 2));
    
    if (res.ok && res.value.length > 0) {
        console.log('--- [PASS] "All" parsing verified. King Black Dragon found. ---');
    } else {
        console.log('--- [FAIL] "All" parsing failed. King Black Dragon missing. ---');
    }

    console.log('--- Query: Items (Honest Report) ---');
    const itemRes = forensics.queryTaxonomy({ layer: 'items', term: 'Bronze' });
    console.log('Items found:', itemRes.ok ? itemRes.value.length : 'ERROR: ' + itemRes.error.message);
}

test().catch(console.error);
