/**
 * test_ability_discovery.ts
 *
 * Validates the Phase 2 discovery-driven combat pipeline:
 *   1. AbilityDiscoveryLimb discovers abilities from AbilityBook (fallback path)
 *   2. Infers combat style from weapon name
 *   3. Builds an optimal rotation given current adrenaline
 *   4. Verifies the rotation respects adrenaline cost/gain ordering
 */

import { AbilityDiscoveryLimb } from '../src/limbs/spatial/AbilityDiscoveryLimb.js';
import { AbilityBook } from '../src/engines/gameplay/AbilityBook.js';

async function main() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  Phase 2: Ability Discovery & Dynamic Rotation Builder   ");
    console.log("═══════════════════════════════════════════════════════════\n");

    const discovery = AbilityDiscoveryLimb.getInstance();

    // ── Test 1: AbilityBook Discovery ──
    console.log("[TEST 1] Discover abilities from AbilityBook (melee)...");
    const meleeAbilities = discovery.discoverFromAbilityBook('melee');
    console.log(`  Found ${meleeAbilities.length} melee abilities`);
    
    const basics = meleeAbilities.filter(a => a.category === 'basic');
    const thresholds = meleeAbilities.filter(a => a.category === 'enhanced');
    const ultimates = meleeAbilities.filter(a => a.category === 'ultimate');
    console.log(`  Basics: ${basics.length}, Thresholds: ${thresholds.length}, Ultimates: ${ultimates.length}`);
    
    if (basics.length > 0) {
        console.log(`  \x1b[32m✓ Basics discovered\x1b[0m`);
    } else {
        console.log(`  \x1b[31m✗ No basics found!\x1b[0m`);
    }

    // ── Test 2: Style Inference ──
    console.log("\n[TEST 2] Infer combat style from weapon name...");
    const tests: [string, string][] = [
        ['Abyssal whip', 'melee'],
        ['Ascension crossbow', 'ranged'],
        ['Virtus wand', 'magic'],
        ['Omni guard', 'necromancy'],
        ['Bronze dagger', 'melee'],
        ['Seren godbow', 'ranged'],
        ['Staff of Sliske', 'magic'],
        ['Death guard', 'necromancy'],
    ];

    let stylePass = 0;
    for (const [weapon, expected] of tests) {
        const inferred = discovery.inferStyleFromWeapon(weapon);
        const ok = inferred === expected;
        if (ok) stylePass++;
        console.log(`  ${ok ? '✓' : '✗'} "${weapon}" → ${inferred} (expected: ${expected})`);
    }
    console.log(`  \x1b[${stylePass === tests.length ? '32' : '31'}m${stylePass}/${tests.length} style inferences correct\x1b[0m`);

    // ── Test 3: Rotation from zero adrenaline ──
    console.log("\n[TEST 3] Build optimal rotation from 0 adrenaline (melee)...");
    const rotation = discovery.buildOptimalRotation(meleeAbilities, 0, 'melee');
    
    console.log(`  Rotation length: ${rotation.length} steps`);
    let simAdren = 0;
    for (const step of rotation) {
        const before = simAdren;
        if (step.ability.category === 'basic') {
            simAdren += step.ability.adrenalineGain;
        } else {
            simAdren -= step.ability.adrenalineCost;
        }
        console.log(`  [${before.toString().padStart(5)} → ${simAdren.toString().padStart(5)}] ${step.ability.name} (${step.ability.category}) — ${step.reason}`);
    }

    // Verify rotation structure: basics first, then threshold
    const firstThreshold = rotation.findIndex(r => r.ability.category === 'enhanced');
    const hasBasicsBeforeThreshold = firstThreshold === -1 || rotation.slice(0, firstThreshold).every(r => r.ability.category === 'basic');
    
    if (hasBasicsBeforeThreshold) {
        console.log(`  \x1b[32m✓ Rotation correctly builds adrenaline before spending\x1b[0m`);
    } else {
        console.log(`  \x1b[31m✗ Rotation structure invalid — threshold before basics\x1b[0m`);
    }

    // ── Test 4: Rotation with high adrenaline ──
    console.log("\n[TEST 4] Build rotation at 5000 adrenaline (should fire threshold immediately)...");
    const highAdrenRotation = discovery.buildOptimalRotation(meleeAbilities, 5000, 'melee');
    
    if (highAdrenRotation.length > 0 && (highAdrenRotation[0].ability.category === 'enhanced' || highAdrenRotation[0].ability.category === 'special')) {
        console.log(`  \x1b[32m✓ First action is threshold: ${highAdrenRotation[0].ability.name}\x1b[0m`);
    } else if (highAdrenRotation.length > 0) {
        console.log(`  First action: ${highAdrenRotation[0].ability.name} (${highAdrenRotation[0].ability.category})`);
    }

    // ── Test 5: Multi-style discovery ──
    console.log("\n[TEST 5] Discover all styles...");
    for (const style of ['melee', 'ranged', 'magic', 'necromancy'] as const) {
        const abilities = discovery.discoverFromAbilityBook(style);
        console.log(`  ${style.padEnd(12)}: ${abilities.length} abilities`);
    }

    // ── Health Check ──
    console.log("\n[HEALTH] AbilityDiscoveryLimb status:");
    const health = discovery.healthCheck();
    console.log(`  Online: ${health.online}`);
    console.log(`  ${health.details}`);

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  Phase 2 Discovery Pipeline: COMPLETE");
    console.log("═══════════════════════════════════════════════════════════");
}

main().catch(console.error);
