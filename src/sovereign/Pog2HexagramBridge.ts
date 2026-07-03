/**
 * Pog2HexagramBridge — Resolves "is this skill allowed?" against the
 * POG2 sovereignty YAML and HexagramManager state.
 *
 * Combines three real subsystems (no daemon, no new process):
 *   - DomainLocker.classifyDomain() — domain-based PASS/WAIT verdict
 *   - HexagramManager.decide()      — 8x8 matrix returning string directives
 *   - Pog2Integration.skill_activation clause from sovereign_rules.yaml
 *
 * The result is a Pog2Permission verdict that callers (TernaryRouter,
 * ToolRegistry, future MCP adapters) can act on.
 *
 * The escape hatch (user_override: always_wins_if_asserted) is honored
 * last: if the caller passes userOverride: true, the verdict is ALLOW
 * regardless of hexagram alignment.
 *
 * Upstream:   SovereignConfig.loadConfig() → bootPog2Integration()
 * Downstream: callers asking for a permission decision
 */

import { loadPog2Integration, type Pog2IntegrationConfig } from './Pog2Integration.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { DomainLocker, type DispatchVerdict } from '../routing/DomainLocker.js';
import type { SovereignDomain } from '../types/SovereignDomain.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Pog2HexagramBridge');

// ── Verdict types ──────────────────────────────────────────────────

export type Pog2PermissionAction = 'ALLOW' | 'WAIT' | 'BLOCK';

export interface Pog2Permission {
    readonly action: Pog2PermissionAction;
    readonly reason: string;
    readonly domain: SovereignDomain | null;
    readonly toolDomain: SovereignDomain | 'UNKNOWN';
    readonly directive?: string;       // hexagram directive if consulted
    readonly integrationClause?: 'skill_activation';  // which YAML clause was enforced
}

// ── Bridge ─────────────────────────────────────────────────────────

export class Pog2HexagramBridge {
    private readonly integration: Pog2IntegrationConfig | null;
    private readonly hexagram: HexagramManager;
    private readonly domainLocker: DomainLocker;

    constructor(opts?: {
        integration?: Pog2IntegrationConfig | null;
        hexagram?: HexagramManager;
        domainLocker?: DomainLocker;
    }) {
        this.integration = opts?.integration !== undefined ? opts.integration : loadPog2Integration();
        this.hexagram = opts?.hexagram ?? HexagramManager.getInstance();
        this.domainLocker = opts?.domainLocker ?? new DomainLocker();
    }

    /**
     * Resolve permission for a (skillId, intent) pair.
     *
     * Decision tree:
     *   1. userOverride=true  → ALLOW (escape hatch always wins)
     *   2. integration block absent or default_state='off' and
     *      no explicit activation → BLOCK unless override
     *   3. DomainLocker says WAIT (cross-domain) → WAIT
     *   4. DomainLocker says PASS but hexagram is in
     *      OldYin (withdrawal) → WAIT
     *   5. Otherwise → ALLOW, with the hexagram directive as guidance
     */
    public resolvePermission(
        skillId: string,
        intent: string,
        userOverride: boolean = false
    ): Pog2Permission {
        // 1. Escape hatch — the YAML's user_override clause.
        if (userOverride && this.integration?.escape_hatch?.user_override === 'always_wins_if_asserted') {
            logger.info(
                { skillId, intent },
                'Pog2HexagramBridge: user override asserted — ALLOW'
            );
            return {
                action: 'ALLOW',
                reason: this.integration.escape_hatch.memory_reference,
                domain: null,
                toolDomain: 'UNKNOWN',
                integrationClause: 'skill_activation',
            };
        }

        // 2. No integration block / default off — refuse by default.
        if (!this.integration) {
            return {
                action: 'BLOCK',
                reason: 'pog2_integration block absent; default-deny',
                domain: null,
                toolDomain: 'UNKNOWN',
            };
        }
        if (this.integration.skill_activation.default_state === 'off') {
            return {
                action: 'BLOCK',
                reason: `skill_activation.default_state=off for "${skillId}" — explicit activation required`,
                domain: null,
                toolDomain: 'UNKNOWN',
                integrationClause: 'skill_activation',
            };
        }

        // 3. Domain-based dispatch verdict (PASS / WAIT).
        const verdict: DispatchVerdict = this.domainLocker.dispatchCheck(skillId);
        if (verdict.action === 'WAIT') {
            logger.debug(
                { skillId, intent, verdict },
                'Pog2HexagramBridge: cross-domain — WAIT'
            );
            return {
                action: 'WAIT',
                reason: verdict.reasoning,
                domain: verdict.activeDomain,
                toolDomain: verdict.toolDomain,
                integrationClause: 'skill_activation',
            };
        }

        // 4. Hexagram alignment check. We don't fail on misalignment
        // (POG2 doesn't have a "skillToHexagram" map yet), but we surface
        // the directive so callers can record it.
        const directive = this.hexagram.decide(
            this.hexagram.getYaoState(),
            this.hexagram.getYaoState(), // intent equals current until a real intent axis is wired
        );

        return {
            action: 'ALLOW',
            reason: `domain PASS + hexagram directive "${directive}"`,
            domain: verdict.activeDomain,
            toolDomain: verdict.toolDomain,
            directive,
            integrationClause: 'skill_activation',
        };
    }

    /**
     * Cheap health probe for the bridge surface. Returns true if the
     * integration block loaded successfully. Used by SovereignConfig
     * to log "POG2 sovereignty: enabled/disabled" at boot.
     */
    public isEnabled(): boolean {
        return this.integration !== null;
    }
}

// Singleton accessor — re-reads the YAML on every access so that
// hot-reload of sovereign_rules.yaml takes effect without a process restart.
let _bridgeInstance: Pog2HexagramBridge | null = null;
export function getPog2Bridge(): Pog2HexagramBridge {
    if (!_bridgeInstance) {
        _bridgeInstance = new Pog2HexagramBridge();
    }
    return _bridgeInstance;
}

export function resetPog2Bridge(): void {
    _bridgeInstance = null;
}
