/**
 * Functional test: sql.js parse path against real NXT .jcache files.
 * Tests both the POG2 JagexCacheReader (sql.js) and a direct GameCacheLoader init.
 * Parses two ways:
 *  [A] JagexCacheReader (POG2 native layer)
 *  [B] GameCacheLoader via rsmv sqlite.ts
 */
import { JagexCacheReader } from '../src/utils/JagexCacheReader.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const CACHE_DIR = 'C:\\ProgramData\\Jagex\\RuneScape';
const MAJOR_OBJECTS = 16; // Object definitions
const TEST_MINOR = 0;     // First archive

async function runTest() {
    const pass: string[] = [];
    const fail: string[] = [];

    // ─── PATH A: POG2 JagexCacheReader ───────────────────────────────────────
    console.log('\n[A] POG2 JagexCacheReader (sql.js)');
    try {
        const reader = new JagexCacheReader(CACHE_DIR);
        await reader.init();
        const entry = reader.readEntry(MAJOR_OBJECTS, TEST_MINOR);
        if (entry && entry.decompressed && entry.decompressed.length > 0) {
            console.log(`  ✅ major=${MAJOR_OBJECTS} minor=${TEST_MINOR} compressed=${entry.data.length}B decompressed=${entry.decompressed.length}B crc=${entry.crc}`);
            pass.push('A: JagexCacheReader.readEntry');
        } else {
            console.log('  ❌ Entry returned null or empty decompressed');
            fail.push('A: JagexCacheReader.readEntry - null/empty');
        }
        reader.close();
    } catch (e: any) {
        console.error('  ❌', e.message);
        fail.push(`A: JagexCacheReader init/read - ${e.message}`);
    }

    // ─── PATH B: rsmv GameCacheLoader (sql.js) ───────────────────────────────
    console.log('\n[B] rsmv GameCacheLoader (sql.js)');
    let GameCacheLoader: any = null;
    try {
        ({ GameCacheLoader } = require('../../rsmv/src/cache/sqlite.js'));
    } catch (e: any) {
        console.error('  ❌ require GameCacheLoader failed:', e.message);
        fail.push(`B: require GameCacheLoader - ${e.message}`);
    }

    if (GameCacheLoader) {
        try {
            await GameCacheLoader.init();
            const loader = new GameCacheLoader(CACHE_DIR);
            const index = await loader.getCacheIndex(MAJOR_OBJECTS);
            const firstEntry = index[TEST_MINOR];
            if (firstEntry) {
                const arch = await loader.getFileArchive(firstEntry);
                console.log(`  ✅ major=${MAJOR_OBJECTS} minor=${TEST_MINOR} archive subfiles=${arch.length}`);
                pass.push('B: GameCacheLoader.getFileArchive');
            } else {
                console.log('  ❌ getCacheIndex returned no entry for minor 0');
                fail.push('B: GameCacheLoader.getCacheIndex - no entry');
            }
            loader.close();
        } catch (e: any) {
            console.error('  ❌', e.message);
            fail.push(`B: GameCacheLoader read - ${e.message}`);
        }
    }

    // ─── Avatar Buffer Parse Test ─────────────────────────────────────────────
    console.log('\n[C] Avatar Body Type Decode (chunky models)');
    const testCases: Array<{ byte: number, expectedGender: string, expectedType: string }> = [
        { byte: 0b000, expectedGender: 'male',   expectedType: 'slim'     },
        { byte: 0b010, expectedGender: 'male',   expectedType: 'athletic' },
        { byte: 0b100, expectedGender: 'male',   expectedType: 'chunky'   },
        { byte: 0b110, expectedGender: 'male',   expectedType: 'custom'   },
        { byte: 0b001, expectedGender: 'female', expectedType: 'slim'     },
        { byte: 0b011, expectedGender: 'female', expectedType: 'athletic' },
        { byte: 0b101, expectedGender: 'female', expectedType: 'chunky'   },
        { byte: 0b111, expectedGender: 'female', expectedType: 'custom'   },
    ];
    const bodyTypeNames = ['slim', 'athletic', 'chunky', 'custom'];
    let avatarOk = true;
    for (const tc of testCases) {
        const isFemale = !!(tc.byte & 1);
        const bodyType = (tc.byte >> 1) & 0x3;
        const gotGender = isFemale ? 'female' : 'male';
        const gotType   = bodyTypeNames[bodyType];
        const ok = gotGender === tc.expectedGender && gotType === tc.expectedType;
        console.log(`  ${ok ? '✅' : '❌'} byte=0b${tc.byte.toString(2).padStart(3,'0')} → gender=${gotGender} type=${gotType}`);
        if (!ok) avatarOk = false;
    }
    if (avatarOk) pass.push('C: Avatar body type decode (all 8 variants)');
    else fail.push('C: Avatar body type decode - mismatch');

    // ─── Summary ─────────────────────────────────────────────────────────────
    console.log('\n══════════════════ RESULTS ══════════════════');
    pass.forEach(p => console.log(`  ✅ PASS: ${p}`));
    fail.forEach(f => console.log(`  ❌ FAIL: ${f}`));
    console.log(`\n  ${pass.length} passed / ${fail.length} failed`);
    process.exit(fail.length > 0 ? 1 : 0);
}

runTest();
