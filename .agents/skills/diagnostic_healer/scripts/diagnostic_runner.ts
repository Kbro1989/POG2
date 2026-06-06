import { resolve } from 'path';
import { execSync } from 'child_process';
import { ClinicalAuditTool } from '../../../../src/utils/ClinicalAuditTool.js';
import { existsSync, readFileSync } from 'fs';

// Domain map — each domain key maps to its src subdirectory
const DOMAIN_MAP: Record<string, string[]> = {
    engines:  ['src/engines'],
    routing:  ['src/routing'],
    limbs:    ['src/limbs'],
    core:     ['src/core'],
    clients:  ['src/clients'],
    monitor:  ['src/monitor'],
    utils:    ['src/utils'],
    // Default: all critical domains
    all:      ['src/engines', 'src/routing', 'src/limbs', 'src/core', 'src/clients'],
};

interface DiagnosticViolation {
    filePath: string;
    violationCount: number;
    domain: string;
    patterns: string[];
}

interface DiagnosticResult {
    compilationOk: boolean;
    compilationErrors: string[];
    degradedCount: number;
    vetoCount: number;
    violations: DiagnosticViolation[];
    domain: string;
    rulesViolations: string[];
}

async function runDiagnosis() {
    // Parse --domain flag from argv
    const domainArg = (() => {
        const idx = process.argv.indexOf('--domain');
        return idx !== -1 ? process.argv[idx + 1] : 'all';
    })();

    const domain = DOMAIN_MAP[domainArg] ? domainArg : 'all';
    const scanPaths = DOMAIN_MAP[domain];
    const projectRoot = process.cwd();

    console.log(`=== SOVEREIGN DIAGNOSTIC RUNNER [domain: ${domain}] ===`);

    const result: DiagnosticResult = {
        compilationOk: true,
        compilationErrors: [],
        degradedCount: 0,
        vetoCount: 0,
        violations: [],
        domain,
        rulesViolations: [],
    };

    // [1] Structural Compilation Check
    console.log('\n[1] Structural Compilation Check...');
    try {
        execSync('npm run typecheck', { cwd: projectRoot, encoding: 'utf-8', stdio: 'pipe' });
        console.log('✅ Structural Integrity: NOMINAL');
    } catch (e: any) {
        result.compilationOk = false;
        const errors = (e.stdout as string ?? '').split('\n')
            .filter((l: string) => l.includes('error TS'))
            .slice(0, 10);
        result.compilationErrors = errors;
        console.log('❌ Structural Break Detected:');
        errors.forEach((err: string) => console.log(' ', err));
    }

    // [2] Clinical Substrate Audit — scoped to domain
    console.log(`\n[2] Clinical Audit [${scanPaths.join(', ')}]...`);
    try {
        const auditor = new ClinicalAuditTool();
        for (const subPath of scanPaths) {
            const audit = await auditor.auditDirectory(resolve(projectRoot, subPath));
            if (!audit.ok) { console.log(`  Audit failed for ${subPath}:`, audit.error); continue; }
            for (const res of audit.value) {
                if (!res.isClinical) {
                    const domainLabel = subPath.split('/')[1] ?? domain;
                    result.violations.push({
                        filePath: res.filePath,
                        violationCount: res.violations.length,
                        domain: domainLabel,
                        patterns: [...new Set(res.violations.map(v => v.pattern))],
                    });
                    result.degradedCount++;
                    console.log(`  - DEGRADED [${domainLabel}]: ${res.filePath} (${res.violations.length} violations)`);
                }
            }
        }
        if (result.degradedCount === 0) console.log('  ✅ Clinical Substrate: NOMINAL');
    } catch (e) {
        console.log('  Error running clinical audit:', e);
    }

    // [3] Rules.md Enforcement Check
    console.log('\n[3] Sovereign Rules.md Check...');
    const rulesPath = resolve(projectRoot, 'rules.md');
    if (existsSync(rulesPath)) {
        const rules = readFileSync(rulesPath, 'utf-8');
        // Check each rule is nominally addressable
        const ruleLines = rules.split('\n').filter(l => l.startsWith('##'));
        ruleLines.forEach(r => console.log(`  Rule: ${r.trim()}`));
        // Flag if any violations match rules (mocks, todos, console.log)
        const ruleBreakers = result.violations.filter(v =>
            v.patterns.some(p => p.includes('Mock') || p.includes('todo') || p.includes('console.log'))
        );
        if (ruleBreakers.length > 0) {
            ruleBreakers.forEach(v => result.rulesViolations.push(v.filePath));
            console.log(`  ❌ ${ruleBreakers.length} file(s) violate Sovereign Law directly.`);
        } else {
            console.log('  ✅ Rules.md: No direct rule violations in scanned domain.');
        }
    }

    // [4] Veto / Heartbeat Log Check
    console.log('\n[4] Hexagram Veto Check...');
    const logPath = resolve(projectRoot, 'logs/pog2.log');
    if (existsSync(logPath)) {
        const logs = readFileSync(logPath, 'utf-8').split('\n').slice(-500);
        const vetoes = logs.filter(l => l.includes('VETO'));
        result.vetoCount = vetoes.length;
        if (vetoes.length > 0) {
            console.log(`  ❌ ${vetoes.length} recent VETO events. Last: ${vetoes[vetoes.length - 1]?.substring(0, 120)}`);
        } else {
            console.log('  ✅ Heartbeat Rhythm: NOMINAL');
        }
    } else {
        console.log('  ✅ No veto log found (nominal).');
    }

    // Emit machine-parseable result for SkillsLimb to extract and pass to SelfHealingEngine
    console.log('\n[DIAGNOSTIC COMPLETE] Passing to Head Agent for Hexagram Gate.');
    console.log(`DIAGNOSTIC_RESULT:${JSON.stringify(result)}`);
}

runDiagnosis().catch(console.error);
