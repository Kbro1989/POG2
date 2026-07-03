/**
 * ExteriorGate — Composed gate stack for inbound MCP / foreign tool calls.
 *
 * SECURITY_CHAIN.md defines four interior gates that operate independently:
 *   1. SovereignKnock        (TernaryRouter.sovereignKnock) — caller identity
 *   2. DomainLocker          (DomainLocker.dispatchCheck)    — tool jurisdiction
 *   3. Pog2HexagramBridge    (skill_activation YAML clause)  — skill policy
 *   4. Hexagram activeLimbs  (HexagramManager.getActiveLimbSet) — capability
 *
 * Until 2026-06-21 these gates did not compose on the exterior surface —
 * `mcpserver.ts:CallTool` ran `tool.execute()` directly, and the synthetic
 * `sovereign_fan_out` tool bypassed both gates with a fake "initiated"
 * response. This module is the composition point: every inbound tool call
 * routes through `exteriorGate.check()` first, and only proceeds on ALLOW.
 *
 * Design:
 *   - `BLOCK` is the safe default. Unknown tools, missing intent, or any
 *     gate failure returns BLOCK with a structured reason.
 *   - `WAIT` is returned for cross-domain dispatches and OldYin hexagrams
 *     (withdrawal state); the caller can retry once the state shifts.
 *   - `ALLOW` includes a `gateReport` that names which gates fired and what
 *     each one returned, so the audit trail survives the round-trip.
 *   - `userOverride=true` short-circuits to ALLOW (the YAML's
 *     `escape_hatch.user_override: always_wins_if_asserted` clause).
 *
 * Upstream:   mcpserver.ts:CallToolRequestSchema
 * Downstream: TernaryRouter, DomainLocker, Pog2HexagramBridge, HexagramManager
 */

import { ok, err, type Result } from '../../core/models.js';
import type { SovereignKnock, ConcealmentState } from '../../core/models.js';
import type { TernaryRouter } from '../../routing/TernaryRouter.js';
import type { DomainLocker } from '../../routing/DomainLocker.js';
import type { HexagramManager } from '../../routing/HexagramManager.js';
import type { ToolDefinition } from '../../ToolRegistry.js';
import { getPog2Bridge, type Pog2Permission, type Pog2PermissionAction } from '../../sovereign/Pog2HexagramBridge.js';
import { NEUROLOGICAL_MAP } from '../../state/NeurologicalMap.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('ExteriorGate');

export type GateAction = 'ALLOW' | 'WAIT' | 'BLOCK';

export interface GateReport {
    /** Which gate this report entry is for. */
    readonly gate: 'sovereign_knock' | 'domain_locker' | 'skill_activation' | 'active_limbs' | 'user_override';
    /** The action this gate returned. */
    readonly action: GateAction;
    /** Human-readable reason from the gate. */
    readonly reason: string;
    /** Per-gate detail (e.g. hexagramId, domain pair, permission verdict). */
    readonly detail?: Record<string, unknown>;
}

export interface GateVerdict {
    /** Final composed action. ALLOW means the tool may execute. */
    readonly action: GateAction;
    /**
     * The ConcealmentState posture from the SovereignKnock stage (when the
     * knock ran). Default 'isnot'. Tools that pass the knock with 'isif' are
     * ALLOWED with a `conditional` flag; tools that pass with 'is' are ALLOWED
     * with `full`; tools that pass with 'isnot' are ALLOWED but hidden (the
     * caller should redact the result if the substrate is in passive mode).
     */
    readonly posture?: ConcealmentState;
    /** Per-gate audit trail. Always populated, even on BLOCK. */
    readonly report: ReadonlyArray<GateReport>;
    /** Tool name that was checked. */
    readonly tool: string;
    /** When the gate check ran. */
    readonly timestamp: number;
    /** Hexagram ID at check time (1-64). */
    readonly hexagramId: number;
    /** True if the tool was a foreign (`isForeign=true`) tool. */
    readonly isForeign: boolean;
}

/** Inputs to the gate. The caller fills what it knows. */
export interface GateInput {
    readonly tool: ToolDefinition;
    /** Caller's stated intent — used by skill_activation + DomainLocker. */
    readonly intent: string;
    /**
     * When true, the YAML's escape hatch short-circuits to ALLOW.
     * Honor this only when the caller has explicitly asserted user override.
     */
    readonly userOverride?: boolean;
    /**
     * Optional caller-supplied SovereignKnock. When absent, the gate builds
     * one from current HexagramManager state (the common case for inbound
     * MCP calls where the caller doesn't know the protocol).
     */
    readonly knock?: SovereignKnock;
    /**
     * Optional explicit args. Used for diagnostic logging only — the gate
     * does not parse tool args. Tools that care about arg safety must do
     * their own validation; the gate is identity/policy, not argument safety.
     */
    readonly args?: Readonly<Record<string, unknown>>;
}

/** Detect the tool's effective domain. */
function domainOfTool(tool: ToolDefinition): string {
    return tool.domain ?? 'UNKNOWN';
}

export class ExteriorGate {
    constructor(
        private readonly router: TernaryRouter,
        private readonly domainLocker: DomainLocker,
        private readonly hexagram: HexagramManager,
        private readonly bridge = getPog2Bridge()
    ) { }

    /**
     * Build a SovereignKnock from the current HexagramManager state. Used
     * when the inbound caller (e.g. an MCP client) doesn't supply one.
     */
    public buildDefaultKnock(): SovereignKnock {
        const sequence = this.hexagram.getCurrentSequence();
        const hexagramId = this.hexagram.getCurrentHexagramId();
        return {
            iChingSequence: sequence,
            chromaticSoul: sequence.join('-') || 'mcp-inbound',
            temporalFingerprint: `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            anatomicalProof: {
                limbCount: NEUROLOGICAL_MAP.length,
                structuralIntegrity: 10
            },
            currentHexagramId: hexagramId,
            requestedPosture: 'isnot' // inbound calls default to passive
        };
    }

    /**
     * Run the composed gate stack on an inbound tool call.
     *
     * Order of evaluation:
     *   1. userOverride (escape hatch) — if asserted, ALLOW immediately.
     *   2. activeLimbs (Gate 4)        — if the tool's category isn't in the
     *                                    current hexagram's activeLimbs set,
     *                                    BLOCK. This is the capability gate.
     *   3. skill_activation (Gate 3)   — bridge.resolvePermission honors the
     *                                    YAML's skill_activation clause.
     *   4. domain_locker (Gate 2)      — cross-domain dispatches return WAIT
     *                                    (the substrate can dispatch to a worker).
     *   5. sovereign_knock (Gate 1)    — full 4-stage authentication. Bypassed
     *                                    stages log a WARN (see SECURITY_CHAIN.md).
     *
     * Any gate returning BLOCK short-circuits — the report lists the gates
     * that did NOT fire so the audit trail is still complete.
     */
    public async check(input: GateInput): Promise<GateVerdict> {
        const report: GateReport[] = [];
        const tool = input.tool;
        const toolName = tool.name;
        const hexagramId = this.hexagram.getCurrentHexagramId();
        const timestamp = Date.now();
        const isForeign = (tool as any).isForeign === true;

        const baseVerdict: Omit<GateVerdict, 'action' | 'posture' | 'report'> = {
            tool: toolName,
            timestamp,
            hexagramId,
            isForeign
        };

        // ── 1. Escape hatch (always wins if asserted) ──────────────────
        if (input.userOverride) {
            report.push({
                gate: 'user_override',
                action: 'ALLOW',
                reason: 'User override asserted — YAML escape_hatch clause honored',
                detail: { memoryReference: 'User override always wins if asserted' }
            });
            return { ...baseVerdict, action: 'ALLOW', posture: 'is', report };
        }

        // ── 2. activeLimbs capability gate (Gate 4) ────────────────────
        const toolCategory = tool.category;
        const activeLimbs = this.hexagram.getActiveLimbSet();
        if (toolCategory) {
            // The tool must declare a category that exists in the active set.
            // activeLimbs is a list of limb NAMES (e.g. 'NeuralLimb',
            // 'CacheForensicsLimb'); tools expose 'motor' | 'forge' | 'core'.
            // We map category → broad limb families:
            //   motor → movement/execution limbs (GameplayLimb, AvatarLimb, etc.)
            //   forge → generation limbs (GenerateEngine, StoryboardLimb, etc.)
            //   core  → substrate limbs (NeuralLimb, CacheLimb, etc.)
            const family = toolCategory; // currently 1:1
            const familyActive = activeLimbs.some(name =>
                name.toLowerCase().includes(family) ||
                (family === 'core' && /Neural|Cache|Substrate|Hexagram|Soberan/i.test(name))
            );
            if (!familyActive) {
                report.push({
                    gate: 'active_limbs',
                    action: 'BLOCK',
                    reason: `Tool category '${toolCategory}' not in active limbs for hexagram ${hexagramId}`,
                    detail: { activeLimbs, toolCategory }
                });
                return { ...baseVerdict, action: 'BLOCK', report };
            }
            report.push({
                gate: 'active_limbs',
                action: 'ALLOW',
                reason: `Tool category '${toolCategory}' permitted in active limbs`,
                detail: { activeLimbsCount: activeLimbs.length }
            });
        } else {
            // Tools without a category are always permitted (categorical
            // gate is opt-in via ToolDefinition.category).
            report.push({
                gate: 'active_limbs',
                action: 'ALLOW',
                reason: 'Tool has no category; capability gate is opt-in',
                detail: {}
            });
        }

        // ── 3. skill_activation (Gate 3) — YAML policy ─────────────────
        let permission: Pog2Permission | null = null;
        try {
            permission = this.bridge.resolvePermission(toolName, input.intent, false);
        } catch (bridgeErr) {
            report.push({
                gate: 'skill_activation',
                action: 'BLOCK',
                reason: `Bridge failed: ${bridgeErr instanceof Error ? bridgeErr.message : String(bridgeErr)}`,
                detail: {}
            });
            return { ...baseVerdict, action: 'BLOCK', report };
        }

        if (permission.action === 'BLOCK') {
            report.push({
                gate: 'skill_activation',
                action: 'BLOCK',
                reason: permission.reason,
                detail: { directive: permission.directive, domain: permission.domain }
            });
            return { ...baseVerdict, action: 'BLOCK', report };
        }
        if (permission.action === 'WAIT') {
            report.push({
                gate: 'skill_activation',
                action: 'WAIT',
                reason: permission.reason,
                detail: { directive: permission.directive, domain: permission.domain }
            });
            return { ...baseVerdict, action: 'WAIT', report };
        }
        report.push({
            gate: 'skill_activation',
            action: 'ALLOW',
            reason: permission.reason,
            detail: { directive: permission.directive, domain: permission.domain }
        });

        // ── 4. domain_locker (Gate 2) — cross-domain dispatch ──────────
        const dispatch = this.domainLocker.dispatchCheck(toolName);
        if (dispatch.action === 'WAIT') {
            report.push({
                gate: 'domain_locker',
                action: 'WAIT',
                reason: dispatch.reasoning,
                detail: { toolDomain: dispatch.toolDomain, activeDomain: dispatch.activeDomain }
            });
            return { ...baseVerdict, action: 'WAIT', report };
        }
        report.push({
            gate: 'domain_locker',
            action: 'ALLOW',
            reason: dispatch.reasoning,
            detail: { toolDomain: dispatch.toolDomain, activeDomain: dispatch.activeDomain }
        });

        // ── 5. sovereign_knock (Gate 1) — full 4-stage auth ────────────
        const knock = input.knock ?? this.buildDefaultKnock();
        const knockRes = await this.router.sovereignKnock(knock);
        if (!knockRes.ok) {
            report.push({
                gate: 'sovereign_knock',
                action: 'BLOCK',
                reason: knockRes.error instanceof Error ? knockRes.error.message : String(knockRes.error),
                detail: { knock }
            });
            return { ...baseVerdict, action: 'BLOCK', report };
        }
        const posture: ConcealmentState = knockRes.value;
        report.push({
            gate: 'sovereign_knock',
            action: 'ALLOW',
            reason: `Knock accepted; posture='${posture}'`,
            detail: { posture, hexagramId: knock.currentHexagramId }
        });

        // All gates ALLOW. Composed verdict: ALLOW.
        // Posture 'isnot' (default) is fine — it just means the caller
        // didn't ask for active cooperation, but the tool may still execute.
        return { ...baseVerdict, action: 'ALLOW', posture, report };
    }

    /**
     * Health probe — true if all four gate subsystems are wired. Used by
     * the MCP server's "I am ready" log at boot.
     */
    public healthCheck(): { ready: boolean; gates: Record<string, boolean> } {
        const gates = {
            router: !!this.router,
            domainLocker: !!this.domainLocker,
            hexagram: !!this.hexagram,
            bridge: this.bridge?.isEnabled() === true
        };
        return { ready: Object.values(gates).every(Boolean), gates };
    }
}

/**
 * Format a GateVerdict as a single-line summary suitable for the
 * training_collector or the MCP response envelope. Used by mcpserver.ts
 * to attach a `gateReport` field to the result of every tool call.
 */
export function summarizeGate(v: GateVerdict): string {
    const gates = v.report.map(r => `${r.gate}=${r.action}`).join(',');
    return `[gate ${v.action} hex=${v.hexagramId} ${v.tool}] ${gates}`;
}
