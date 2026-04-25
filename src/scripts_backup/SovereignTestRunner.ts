/**
 * SovereignTestRunner.ts — Sequential Test Suite Executor with Domain Deduplication.
 *
 * Discovers all test files in src/tests/, categorizes them by domain,
 * and runs them sequentially (one at a time, with configurable wait).
 * Newer tests supersede older ones in the same domain.
 *
 * Usage:
 *   npx tsx src/scripts/SovereignTestRunner.ts
 *   npx tsx src/scripts/SovereignTestRunner.ts --domain=pathfinding
 *   npx tsx src/scripts/SovereignTestRunner.ts --all --wait=2000
 *
 * Neurological Map: SENSORY → Diagnostic self-test probe
 */

import { readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { execFileSync, ExecFileSyncOptions } from 'child_process';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('SovereignTestRunner');

// ═══════════════════════════════════════════════════════════════
// DOMAIN TAXONOMY
// Each test file is tagged to a domain. Newer tests in the same
// domain supersede older ones (dedup). Unknown tests go to 'misc'.
// ═══════════════════════════════════════════════════════════════
const DOMAIN_MAP: Record<string, string> = {
    // Pathfinding & Movement
    'pathfinding_minimal':          'pathfinding',
    'pathfinding_barrows':          'pathfinding',
    'pathing_archaeologist':        'pathfinding',
    'pathing_archaeologist_cs2':    'pathfinding',
    'pathing_archaeologist_deep':   'pathfinding',
    'validate_diagonal_edges':      'pathfinding.edges',  // Sub-domain: won't supersede base pathfinding
    'world_walk_morytania':         'pathfinding.traversal',
    'bridge_navigation_c3':         'pathfinding.traversal',

    // Collision & Spatial
    'havenhythe_collision_bake':    'collision',
    'lumbridge_bumper_test':        'collision.bumper',
    'refill_audit':                 'collision.refill',
    'refill_validation':            'collision.refill',

    // Interaction & State
    'interaction_state_test':       'interaction',

    // Tick Simulation
    'verify_tick_causality':        'tick_simulation',

    // Synthesis & Grounding
    'GreatSynthesisAudit':          'synthesis',
    'LumbridgeUnleashedAudit':      'synthesis.lumbridge',
    'LumbridgeTTOExtractor':        'synthesis.lumbridge',
    'BottomLayerReconciliation':    'synthesis.reconciliation',
    'UnifiedWorldProbe':            'synthesis.world',
    'WikiPlaceTest':                'synthesis.wiki',

    // Rendering & Kinematics
    'verify_kinematic_render':      'rendering',
    'triple_view_c1':               'rendering.views',
    'kbd_roar_cinema':              'rendering.cinematic',

    // Memory & Persistence
    'persistence_b3b':              'memory',
    'lesson_learning_b3a':          'memory.learning',

    // Discovery
    'discovery_minimal':            'discovery',
    'global_discovery_c2':          'discovery',
    'exploration_barrows':          'discovery.exploration',

    // Authority
    'test_absolute_authority':      'authority',

    // System
    'test_bootstrap':               'bootstrap',
    'verify_phase34':               'phase34',
    'verify_vertical_doors':        'spatial.doors',
};

interface TestEntry {
    filename: string;
    domain: string;
    mtime: number;              // Last modified timestamp (ms)
    sizeBytes: number;
    path: string;
    superseded: boolean;        // If true, a newer test in same domain exists
    supersededBy?: string;      // Which test superseded this one
}

interface TestResult {
    filename: string;
    domain: string;
    status: 'PASS' | 'FAIL' | 'SKIP' | 'TIMEOUT';
    durationMs: number;
    error?: string;
}

// ═══════════════════════════════════════════════════════════════
// DISCOVERY
// ═══════════════════════════════════════════════════════════════
function discoverTests(testsDir: string): TestEntry[] {
    const files = readdirSync(testsDir)
        .filter(f => f.endsWith('.ts') && !f.startsWith('.'));

    const entries: TestEntry[] = files.map(f => {
        const fpath = join(testsDir, f);
        const stat = statSync(fpath);
        const stem = basename(f, '.ts');
        return {
            filename: f,
            domain: DOMAIN_MAP[stem] || 'misc',
            mtime: stat.mtimeMs,
            sizeBytes: stat.size,
            path: fpath,
            superseded: false,
        };
    });

    // Sort newest first (highest mtime first)
    entries.sort((a, b) => b.mtime - a.mtime);

    return entries;
}

// ═══════════════════════════════════════════════════════════════
// DEDUPLICATION
// Newer tests in the EXACT same domain supersede older ones.
// Sub-domains (e.g., 'pathfinding.edges') are NOT superseded
// by their parent ('pathfinding').
// ═══════════════════════════════════════════════════════════════
function deduplicateByDomain(entries: TestEntry[]): TestEntry[] {
    const seenDomains = new Map<string, string>(); // domain → first (newest) filename

    for (const entry of entries) {
        if (seenDomains.has(entry.domain)) {
            entry.superseded = true;
            entry.supersededBy = seenDomains.get(entry.domain);
        } else {
            seenDomains.set(entry.domain, entry.filename);
        }
    }

    return entries;
}

// ═══════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════
function runTest(entry: TestEntry, timeoutMs: number): TestResult {
    const start = Date.now();

    try {
        const opts: ExecFileSyncOptions = {
            cwd: join(entry.path, '..', '..', '..'),
            timeout: timeoutMs,
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, NODE_OPTIONS: '--experimental-specifier-resolution=node' },
            shell: true // Required for npx resolution on Windows
        };

        execFileSync('npx', ['tsx', entry.path], opts);

        return {
            filename: entry.filename,
            domain: entry.domain,
            status: 'PASS',
            durationMs: Date.now() - start,
        };
    } catch (err: any) {
        const duration = Date.now() - start;
        const isTimeout = err.killed || (err.signal === 'SIGTERM');

        return {
            filename: entry.filename,
            domain: entry.domain,
            status: isTimeout ? 'TIMEOUT' : 'FAIL',
            durationMs: duration,
            error: isTimeout ? `Exceeded ${timeoutMs}ms` : (err.stderr?.toString().slice(-300) || err.message),
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
    const args = process.argv.slice(2);
    const runAll = args.includes('--all');
    const domainFilter = args.find(a => a.startsWith('--domain='))?.split('=')[1];
    const waitMs = parseInt(args.find(a => a.startsWith('--wait='))?.split('=')[1] || '1000');
    const timeoutMs = parseInt(args.find(a => a.startsWith('--timeout='))?.split('=')[1] || '120000');

    const testsDir = join(process.cwd(), 'src', 'tests');
    let entries = discoverTests(testsDir);
    entries = deduplicateByDomain(entries);

    // Filter by domain if requested
    if (domainFilter) {
        entries = entries.filter(e => e.domain.startsWith(domainFilter));
    }

    const activeTests = runAll ? entries : entries.filter(e => !e.superseded);
    const skippedTests = entries.filter(e => e.superseded && !runAll);

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  SOVEREIGN TEST RUNNER — Sequential Domain Validation  ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.log(`  Tests discovered:  ${entries.length}`);
    console.log(`  Active (to run):   ${activeTests.length}`);
    console.log(`  Superseded (skip): ${skippedTests.length}`);
    console.log(`  Wait between:      ${waitMs}ms`);
    console.log(`  Timeout per test:  ${timeoutMs}ms`);
    if (domainFilter) console.log(`  Domain filter:     ${domainFilter}`);
    console.log('');

    // Show supersession map
    if (skippedTests.length > 0) {
        console.log('── Superseded Tests (opt-out) ─────────────────────────');
        for (const s of skippedTests) {
            console.log(`  ⊘ ${s.filename.padEnd(40)} superseded by ${s.supersededBy}`);
        }
        console.log('');
    }

    // Run active tests sequentially
    console.log('── Execution ──────────────────────────────────────────');
    const results: TestResult[] = [];

    for (let i = 0; i < activeTests.length; i++) {
        const entry = activeTests[i];
        const label = `[${i + 1}/${activeTests.length}]`;

        if (entry.superseded) {
            results.push({
                filename: entry.filename,
                domain: entry.domain,
                status: 'SKIP',
                durationMs: 0,
                error: `Superseded by ${entry.supersededBy}`,
            });
            console.log(`  ⊘ ${label} SKIP  ${entry.filename} (superseded)`);
            continue;
        }

        console.log(`  ▶ ${label} RUN   ${entry.filename} [${entry.domain}]`);
        const result = runTest(entry, timeoutMs);
        results.push(result);

        const icon = result.status === 'PASS' ? '✅' : (result.status === 'TIMEOUT' ? '⏱' : '❌');
        console.log(`  ${icon} ${label} ${result.status.padEnd(5)} ${entry.filename} (${result.durationMs}ms)`);
        if (result.error) {
            const shortened = result.error.split('\n').slice(0, 3).join('\n    ');
            console.log(`    └─ ${shortened}`);
        }

        // Wait between tests (except after the last one)
        if (i < activeTests.length - 1) {
            await new Promise(resolve => setTimeout(resolve, waitMs));
        }
    }

    // ═══════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════
    const passed = results.filter(r => r.status === 'PASS');
    const failed = results.filter(r => r.status === 'FAIL');
    const timeouts = results.filter(r => r.status === 'TIMEOUT');
    const skipped = results.filter(r => r.status === 'SKIP');

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log(`║  RESULTS: ${passed.length} passed, ${failed.length} failed, ${timeouts.length} timeout, ${skipped.length} skipped`);
    console.log('╚══════════════════════════════════════════════════════════╝');

    if (failed.length > 0) {
        console.log('\n  ❌ FAILED TESTS:');
        for (const f of failed) {
            console.log(`     - ${f.filename} [${f.domain}]`);
        }
    }

    // Domain coverage report
    const domainSet = new Set(results.filter(r => r.status === 'PASS').map(r => r.domain));
    console.log(`\n  🧬 Domains validated: ${domainSet.size}`);
    for (const d of Array.from(domainSet).sort()) {
        console.log(`     ✓ ${d}`);
    }

    const totalDuration = results.reduce((sum, r) => sum + r.durationMs, 0);
    console.log(`\n  ⏱ Total execution: ${(totalDuration / 1000).toFixed(1)}s`);

    process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('❌ Test runner fatal:', err);
    process.exit(1);
});
