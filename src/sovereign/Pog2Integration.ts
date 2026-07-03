/**
 * Pog2Integration — Loads the `pog2_integration:` block from
 * hermes-agent/config/sovereign_rules.yaml and exposes it as a typed object.
 *
 * The YAML is the source of truth (Hermes validates it at every CLI boot
 * via sovereign_rules_loader.py). POG2 reads it once at SovereignConfig
 * load time and caches the parsed object for the rest of the process.
 *
 * Fail-loud: if the YAML is missing or unparseable, the loader throws.
 * SovereignConfig.loadConfig() catches and degrades to "integration
 * disabled" — POG2 still boots without the bridge, just with reduced
 * guardrails.
 *
 * Upstream:   SovereignConfig.loadConfig()
 * Downstream: Pog2HexagramBridge, any subsystem asking
 *             "is this skill allowed?"
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Pog2Integration');

// ── Types ──────────────────────────────────────────────────────────

export type Pog2Root = 'POG2';

export type Pog2VramTier = 'mini' | 'puppeteer' | 'pro' | 'cpu';

export interface Pog2InferenceClause {
    readonly provider_routing: 'TernaryRouter';
    readonly overflow_shim: string;        // python module path
    readonly vram_tier_source: string;     // env var name
    readonly hard_fallback: string;        // substrate name
}

export interface Pog2SkillActivationClause {
    readonly default_state: 'off' | 'on';
    readonly activation_requires: string;
    readonly report_to: string;
}

export interface Pog2EscapeHatchClause {
    readonly user_override: 'always_wins_if_asserted';
    readonly assertion_method: string;
    readonly memory_reference: string;
}

export interface Pog2AuditClause {
    readonly pre_session: readonly string[];
    readonly output_format: string;
}

export interface Pog2IntegrationConfig {
    readonly root_of_trust: Pog2Root;
    readonly pog2_home: string;
    readonly inference: Pog2InferenceClause;
    readonly skill_activation: Pog2SkillActivationClause;
    readonly escape_hatch: Pog2EscapeHatchClause;
    readonly audit: Pog2AuditClause;
}

export interface Pog2SovereignRules {
    readonly rules_version: number;
    readonly sovereign_laws: Readonly<Record<string, string>>;
    readonly prohibited_patterns: readonly string[];
    readonly pog2_integration?: Pog2IntegrationConfig;
}

// ── Path resolution ────────────────────────────────────────────────

/**
 * Locate the sovereign_rules.yaml file.
 *
 * Search order:
 *   1. POG2_SOVEREIGN_RULES env var (explicit override)
 *   2. <repo>/hermes-agent/config/sovereign_rules.yaml
 *      (relative to this source file, which lives at src/sovereign/)
 *   3. <process cwd>/hermes-agent/config/sovereign_rules.yaml
 */
export function findSovereignRulesPath(): string | null {
    const fromEnv = process.env.POG2_SOVEREIGN_RULES;
    if (fromEnv && existsSync(fromEnv)) return fromEnv;

    // src/sovereign/Pog2Integration.ts → repo root is ../../../
    const here = dirname(fileURLToPath(import.meta.url));
    const repoRoot = resolve(here, '..', '..');
    const candidate1 = join(repoRoot, 'hermes-agent', 'config', 'sovereign_rules.yaml');
    if (existsSync(candidate1)) return candidate1;

    const candidate2 = join(process.cwd(), 'hermes-agent', 'config', 'sovereign_rules.yaml');
    if (existsSync(candidate2)) return candidate2;

    return null;
}

// ── Loader ─────────────────────────────────────────────────────────

let _cache: Pog2SovereignRules | null = null;
let _cachePath: string | null = null;

/**
 * Load and cache the sovereign rules YAML. Idempotent: subsequent calls
 * return the same object. To force a re-read, call `clearCache()`.
 *
 * Throws if the file is missing or unparseable. The sovereign laws check
 * is left to the Python side (it's stricter — fails closed if the 5
 * required laws are absent). POG2 just reads what's there.
 */
export function loadSovereignRules(forceReload = false): Pog2SovereignRules {
    if (_cache && !forceReload) return _cache;

    const path = findSovereignRulesPath();
    if (!path) {
        throw new Error(
            'sovereign_rules.yaml not found. Searched POG2_SOVEREIGN_RULES env, ' +
            'repo/hermes-agent/config/, and cwd/hermes-agent/config/.'
        );
    }

    let parsed: unknown;
    try {
        const raw = readFileSync(path, 'utf8');
        parsed = yaml.load(raw);
    } catch (err) {
        throw new Error(
            `Failed to parse sovereign_rules.yaml at ${path}: ${err instanceof Error ? err.message : String(err)}`
        );
    }

    if (!parsed || typeof parsed !== 'object') {
        throw new Error(`sovereign_rules.yaml at ${path} is empty or not a YAML mapping`);
    }

    const obj = parsed as Record<string, unknown>;
    const pog2Block = obj.pog2_integration;
    if (!pog2Block || typeof pog2Block !== 'object') {
        logger.warn(
            { path },
            'sovereign_rules.yaml loaded but has no pog2_integration block — POG2 sovereignty disabled'
        );
    }

    _cache = {
        rules_version: Number(obj.rules_version ?? 1),
        sovereign_laws: (obj.sovereign_laws as Record<string, string>) ?? {},
        prohibited_patterns: (obj.prohibited_patterns as string[]) ?? [],
        pog2_integration: pog2Block as Pog2IntegrationConfig | undefined,
    };
    _cachePath = path;
    logger.info(
        { path, version: _cache.rules_version, hasPog2Block: !!_cache.pog2_integration },
        'sovereign_rules.yaml loaded'
    );

    return _cache;
}

/**
 * Returns the pog2_integration block, or null if the YAML has no such block.
 * Convenience wrapper that never throws — if the YAML is missing, returns
 * null and logs once. Callers can then degrade gracefully.
 */
export function loadPog2Integration(): Pog2IntegrationConfig | null {
    try {
        const rules = loadSovereignRules();
        return rules.pog2_integration ?? null;
    } catch (err) {
        logger.warn(
            { err: err instanceof Error ? err.message : String(err) },
            'Pog2Integration unavailable — falling back to defaults'
        );
        return null;
    }
}

/**
 * Where the cached rules were loaded from. Null if not loaded yet.
 */
export function getSovereignRulesPath(): string | null {
    return _cachePath;
}

/**
 * Drop the cache. Test helper; not used in production.
 */
export function clearCache(): void {
    _cache = null;
    _cachePath = null;
}
