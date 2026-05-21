/**
 * test_state_provider_integrity.ts
 *
 * Verifies the three hardening patches applied to StateProvider:
 *   1. Deduplication — concurrent getVarbit(457) calls fire only one bridge subprocess
 *   2. Bitmask integrity — setVarbit/getVarbit respects bit-window extraction (lsb/msb)
 *   3. Synthetic registry — markSynthetic(99999) prevents any cache lookup for that ID
 */

import { StateProvider } from '../src/utils/StateProvider.js';
import { GameState } from '../src/core/models.js';

function makeState(): GameState {
    return {
        varps: new Map(),
        varbits: new Map(),
        objectMap: new Map(),      // Required by remanifestAffectedObjects
        npcMap: new Map(),
        npcSpatialIndex: new Map(),
        plane: 0,
        players: new Map(),
        varcs: new Map()
    } as unknown as GameState;
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
    if (condition) {
        console.log(`  ✅ PASS: ${name}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${name}${detail ? ` — ${detail}` : ''}`);
        failed++;
    }
}

async function test() {
    const sp = StateProvider.getInstance();
    const state = makeState();

    // ─── Test 1: Deduplication ────────────────────────────────────────────────
    console.log('\n[Test 1] Duplicate resolution deduplication for varbit 457 (Barrows crypt progress)');
    let callCount = 0;
    const origResolve = (sp as any).resolveFromBridge.bind(sp);
    (sp as any).resolveFromBridge = async (id: number) => { callCount++; return origResolve(id); };

    const [a, b] = await Promise.all([
        sp.ensureVarbitDefinition(457),
        sp.ensureVarbitDefinition(457)
    ]);

    (sp as any).resolveFromBridge = origResolve; // Restore

    assert(callCount <= 1, 'Only one bridge call for two concurrent requests', `callCount=${callCount}`);
    assert(a !== null, 'Resolution returned a definition');
    assert(JSON.stringify(a) === JSON.stringify(b), 'Both calls received identical definitions');

    if (a) {
        console.log(`     Resolved: parentVarpId=${a.parentVarpId}, lsb=${a.lsb}, msb=${a.msb}`);
    }

    // ─── Test 2: Bitmask integrity ────────────────────────────────────────────
    console.log('\n[Test 2] Bitmask integrity for varbit 457 (lsb=24, msb=30)');
    await sp.setVarbit(457, 3, state);
    const readBack = sp.getVarbit(457, state);
    assert(readBack === 3, `getVarbit(457) returns 3 after setVarbit(457, 3)`, `got ${readBack}`);

    // Verify parent varp was set correctly: 3 << 24 = 50331648
    const parentVarp = state.varps.get(a?.parentVarpId ?? 168) ?? 0;
    const expectedVarp = 3 << (a?.lsb ?? 24);
    assert(parentVarp === expectedVarp, `Parent varp ${a?.parentVarpId} = ${expectedVarp}`, `got ${parentVarp}`);

    // Test that setting a second value doesn't corrupt the bit window
    await sp.setVarbit(457, 5, state);
    const readBack2 = sp.getVarbit(457, state);
    assert(readBack2 === 5, `getVarbit(457) returns 5 after setVarbit(457, 5)`, `got ${readBack2}`);

    // ─── Test 3: Synthetic registry ───────────────────────────────────────────
    console.log('\n[Test 3] Synthetic varbit bypass (ID 99999 — engine-computed, not in RS3 cache)');
    const state3 = makeState();

    assert(!sp.isSynthetic(99999), 'Before markSynthetic: isSynthetic(99999) is false');
    sp.markSynthetic(99999);
    assert(sp.isSynthetic(99999), 'After markSynthetic: isSynthetic(99999) is true');

    // setVarbit on synthetic should write directly to GameState.varbits
    // and NOT hit the bridge (bridge would fail with "not found" for 99999)
    let bridgeCalled = false;
    const origBridge = (sp as any).resolveFromBridge.bind(sp);
    (sp as any).resolveFromBridge = async (id: number) => { bridgeCalled = true; return origBridge(id); };
    
    await sp.setVarbit(99999, 42, state3);
    
    (sp as any).resolveFromBridge = origBridge; // Restore

    assert(!bridgeCalled, 'Bridge was NOT called for synthetic varbit');
    assert(state3.varbits.get(99999) === 42, 'Synthetic value stored directly in GameState.varbits', `got ${state3.varbits.get(99999)}`);
    assert(sp.getVarbit(99999, state3) === 42, 'getVarbit returns synthetic value via varbits Map fallback');

    // ─── Test 4: objectMap null guard ─────────────────────────────────────────
    console.log('\n[Test 4] objectMap null guard — setVarbit on minimal state (no objectMap) must not throw');
    const bareState = { varps: new Map(), varbits: new Map() } as unknown as GameState;
    
    let threw = false;
    try {
        // Re-use already-resolved varbit 457 so no bridge call needed
        await sp.setVarbit(457, 1, bareState);
    } catch {
        threw = true;
    }
    assert(!threw, 'setVarbit on bare state (no objectMap) does not throw');

    // ─── Summary ──────────────────────────────────────────────────────────────
    const diag = sp.getDiagnostics();
    console.log(`\n[Diagnostics] ${JSON.stringify(diag)}`);

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

test().catch(e => {
    console.error('[FATAL]', e);
    process.exit(1);
});
