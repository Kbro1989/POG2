/**
 * FireInjectionRouter — Named primitive for the I-Ching ternary routing
 * with mechanical-swan-style fire injections and returns.
 *
 * "Fire injection" is the substrate's term for a foreign entry that
 * crosses the gate stack:
 *
 *   1. Hexagram alignment   — does the caller's claimed identity match
 *                             the substrate's authoritative hexagram?
 *   2. Chroma validation    — is the chromatic signature coherent?
 *   3. Nonce / temporal     — is the temporal fingerprint fresh and
 *                             not replayed?
 *   4. Anatomical proof     — does the substrate have the expected
 *                             number of limbs and structural integrity?
 *   5. skill_activation     — does the YAML permit this skill?
 *   6. domain dispatch      — is this tool within the active domain?
 *   7. capability           — does the current hexagram's activeLimbs
 *                             permit this tool's category?
 *
 * The previous surface scattered this across TernaryRouter.sovereignKnock,
 * ToolRegistry.wrapWithSecurity, Pog2HexagramBridge.resolvePermission,
 * DomainLocker.dispatchCheck, and HexagramManager.getActiveLimbSet.
 * FireInjectionRouter is the single call that composes them all, plus
 * the I-Ching ternary classification (Yang/YinYang/Yin).
 *
 * "Returns" — every injection either returns ALLOW (with the path the
 * tool can take), WAIT (cross-domain, Kimi dispatches), or BLOCK (with
 * the gate that rejected). The result type carries the per-gate report
 * so the caller can surface it to the operator.
 *
 * "Mechanical swan" — the substrate's behavior under this primitive is
 * like a swan's neck: graceful on the surface, mechanical underneath.
 * The gates are deterministic; the path through them is not. The
 *          fire injects → gate fires → gate fires → gate fires →
 *                              (path narrows)
 *                              return → tool executes → result returns
 *
 * Why this exists: the gameplay overlay, the MCP server, and any
 * external orchestrator that wants to use the gate stack as a single
 * primitive shouldn't have to know that it spans six subsystems. This
 * class is the substrate-facing API for "inject this and tell me what
 * comes back".
 *
 * Upstream:   gameplay overlay, mcpserver.ts:CallTool
 * Downstream: TernaryRouter, DomainLocker, Pog2HexagramBridge,
 *             HexagramManager, MemoryConsolidationEngine, ChromaLimb,
 *             BioIntelligenceLimb
 */

import type { Result } from '../core/models.js';
import type { SovereignKnock, ConcealmentState, RoutingComplexity } from '../core/models.js';
import type { TernaryRouter, RouteDecision } from './TernaryRouter.js';
import type { DomainLocker } from './DomainLocker.js';
import type { HexagramManager } from './HexagramManager.js';
import type { ToolDefinition } from '../ToolRegistry.js';
import { getPog2Bridge, type Pog2Permission } from '../sovereign/Pog2HexagramBridge.js';
import { SovereignClockController } from '../utils/SovereignClockController.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('FireInjectionRouter');

export type FireAction = 'ALLOW' | 'WAIT' | 'BLOCK';

export interface FireInjectionReport {
    readonly gate: 'hexagram_alignment' | 'chroma' | 'nonce' | 'anatomy' | 'skill_activation' | 'domain_dispatch' | 'capability' | 'ternary_classification' | 'user_override';
    readonly action: FireAction;
    readonly reason: string;
    readonly detail?: Record<string, unknown>;
}

export interface FireInjectionResult {
    /** Composed action. ALLOW means the tool may execute. */
    readonly action: FireAction;
    /** Ternary classification of the inbound call. */
    readonly complexity: RoutingComplexity;
    /** ConcealmentState from the SovereignKnock posture. */
    readonly posture: ConcealmentState;
    /** Route decision if ALLOW. */
    readonly route?: RouteDecision;
    /** Per-gate audit trail. */
    readonly report: ReadonlyArray<FireInjectionReport>;
    /** Tool name. */
    readonly tool: string;
    /** Hexagram ID at injection time. */
    readonly hexagramId: number;
    /** Simulation timestamp at injection. */
    readonly simulatedAt: number;
}

export interface FireInjectionInput {
    /** The tool being injected. */
    readonly tool: ToolDefinition;
    /** Caller's stated intent. */
    readonly intent: string;
    /** Optional caller-supplied SovereignKnock. Built from HexagramManager
     *  state when absent (the common case). */
    readonly knock?: SovereignKnock;
    /** When true, the YAML escape hatch short-circuits to ALLOW. */
    readonly userOverride?: boolean;
    /** The raw prompt / payload — used for ternary complexity classification. */
    readonly prompt?: string;
    /** Task type hint for the ternary router. */
    readonly taskType?: string;
}

export class FireInjectionRouter {
    constructor(
        private readonly router: TernaryRouter,
        private readonly domainLocker: DomainLocker,
        private readonly hexagram: HexagramManager
    ) { }

    /**
     * Inject — Run the full fire-injection gate stack on an inbound call.
     *
     * Steps:
     *   1. Pause T3 cognitive for fire_injection (so a planning window
     *      can't open during gate evaluation).
     *   2. userOverride → ALLOW if asserted.
     *   3. hexagram_alignment (currentHexagramId match).
     *   4. chroma validation (SovereignKnock stage 2).
     *   5. nonce validation (SovereignKnock stage 3) — TTL-bound.
     *   6. anatomy validation (SovereignKnock stage 4).
     *   7. skill_activation (Pog2HexagramBridge).
     *   8. domain_dispatch (DomainLocker).
     *   9. capability (activeLimbs).
     *  10. ternary_classification → Yang / YinYang / Yin (then route()).
     */
    public async inject(input: FireInjectionInput): Promise<Result<FireInjectionResult>> {
        const pauseId = SovereignClockController.getInstance().pause('fire_injection');
        const hexagramId = this.hexagram.getCurrentHexagramId();
        const simulatedAt = Date.now(); // EXTERNAL only for tracing; state uses simulatedNow elsewhere
        const report: FireInjectionReport[] = [];

        try {
            const baseContext = { tool: input.tool.name, intent: input.intent, hexagramId };

            // ── 2. Escape hatch ─────────────────────────────────────
            if (input.userOverride) {
                report.push({
                    gate: 'user_override',
                    action: 'ALLOW',
                    reason: 'YAML escape_hatch: user_override asserted',
                    detail: { memory: 'User override always wins if asserted' }
                });
                const route = await this.router.route('YinYang', input.taskType, input.prompt);
                return {
                    ok: true,
                    value: {
                        action: 'ALLOW',
                        complexity: 'YinYang',
                        posture: 'is',
                        route,
                        report,
                        tool: input.tool.name,
                        hexagramId,
                        simulatedAt
                    }
                };
            }

            // ── 3-6. SovereignKnock (4 stages) ───────────────────────
            const knock = input.knock ?? this.buildDefaultKnock(hexagramId);
            const knockRes = await this.router.sovereignKnock(knock);
            if (!knockRes.ok) {
                const errMsg = knockRes.error instanceof Error ? knockRes.error.message : String(knockRes.error);
                report.push({
                    gate: 'hexagram_alignment',
                    action: 'BLOCK',
                    reason: errMsg,
                    detail: { knock }
                });
                return { ok: true, value: { action: 'BLOCK', complexity: 'Yin', posture: 'isnot', report, ...baseContext, simulatedAt } };
            }
            const posture = knockRes.value;
            report.push({
                gate: 'hexagram_alignment',
                action: 'ALLOW',
                reason: `SovereignKnock accepted; posture='${posture}'`,
                detail: { posture, hexagramId }
            });

            // ── 7. skill_activation ──────────────────────────────────
            const bridge = getPog2Bridge();
            let permission: Pog2Permission | null = null;
            try {
                permission = bridge.resolvePermission(input.tool.name, input.intent, false);
            } catch (bridgeErr) {
                report.push({
                    gate: 'skill_activation',
                    action: 'BLOCK',
                    reason: `bridge failed: ${bridgeErr instanceof Error ? bridgeErr.message : String(bridgeErr)}`,
                    detail: {}
                });
                return { ok: true, value: { action: 'BLOCK', complexity: 'Yin', posture, report, ...baseContext, simulatedAt } };
            }
            if (permission.action === 'BLOCK') {
                report.push({ gate: 'skill_activation', action: 'BLOCK', reason: permission.reason, detail: { directive: permission.directive } });
                return { ok: true, value: { action: 'BLOCK', complexity: 'Yin', posture, report, ...baseContext, simulatedAt } };
            }
            if (permission.action === 'WAIT') {
                report.push({ gate: 'skill_activation', action: 'WAIT', reason: permission.reason, detail: { directive: permission.directive } });
                return { ok: true, value: { action: 'WAIT', complexity: 'Yin', posture, report, ...baseContext, simulatedAt } };
            }
            report.push({ gate: 'skill_activation', action: 'ALLOW', reason: permission.reason, detail: { directive: permission.directive } });

            // ── 8. domain_dispatch ───────────────────────────────────
            const dispatch = this.domainLocker.dispatchCheck(input.tool.name);
            if (dispatch.action === 'WAIT') {
                report.push({ gate: 'domain_dispatch', action: 'WAIT', reason: dispatch.reasoning, detail: { toolDomain: dispatch.toolDomain, activeDomain: dispatch.activeDomain } });
                return { ok: true, value: { action: 'WAIT', complexity: 'Yin', posture, report, ...baseContext, simulatedAt } };
            }
            report.push({ gate: 'domain_dispatch', action: 'ALLOW', reason: dispatch.reasoning, detail: { toolDomain: dispatch.toolDomain, activeDomain: dispatch.activeDomain } });

            // ── 9. capability (activeLimbs) ──────────────────────────
            const activeLimbs = this.hexagram.getActiveLimbSet();
            const toolCategory = input.tool.category;
            const capabilityOk = !toolCategory || activeLimbs.some(name => {
                const n = name.toLowerCase();
                if (n.includes(toolCategory)) return true;
                if (toolCategory === 'core' && /Neural|Cache|Substrate|Hexagram|Sovereign/i.test(name)) return true;
                return false;
            });
            if (!capabilityOk) {
                report.push({ gate: 'capability', action: 'BLOCK', reason: `category '${toolCategory}' not in active limbs`, detail: { activeLimbs, toolCategory } });
                return { ok: true, value: { action: 'BLOCK', complexity: 'Yin', posture, report, ...baseContext, simulatedAt } };
            }
            report.push({ gate: 'capability', action: 'ALLOW', reason: `category '${toolCategory ?? 'uncategorized'}' permitted`, detail: { activeLimbsCount: activeLimbs.length } });

            // ── 10. ternary_classification + route() ──────────────────
            const complexity = await this.router.classify(input.prompt ?? input.intent);
            report.push({ gate: 'ternary_classification', action: 'ALLOW', reason: `complexity=${complexity}`, detail: { complexity } });
            const route = await this.router.route(complexity, input.taskType, input.prompt);

            logger.info({
                tool: input.tool.name,
                action: 'ALLOW',
                complexity,
                posture,
                routeModel: route?.model
            }, 'FireInjectionRouter: ALLOW');

            return {
                ok: true,
                value: {
                    action: 'ALLOW',
                    complexity,
                    posture,
                    route,
                    report,
                    ...baseContext,
                    simulatedAt
                }
            };
        } catch (err) {
            return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
        } finally {
            SovereignClockController.getInstance().resume(pauseId);
        }
    }

    /**
     * Build a default SovereignKnock from the current HexagramManager state.
     * Used when the caller doesn't supply one (the common case for inbound
     * MCP / foreign tool calls).
     */
    public buildDefaultKnock(hexagramId?: number): SovereignKnock {
        const sequence = this.hexagram.getCurrentSequence();
        const id = hexagramId ?? this.hexagram.getCurrentHexagramId();
        return {
            iChingSequence: sequence,
            chromaticSoul: sequence.join('-') || 'fire-injection',
            temporalFingerprint: `fire-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            anatomicalProof: { limbCount: 33, structuralIntegrity: 10 },
            currentHexagramId: id,
            requestedPosture: 'isnot'
        };
    }

    /**
     * Summarize a FireInjectionResult for logging / operator display.
     */
    public static summarize(r: FireInjectionResult): string {
        const gates = r.report.map(g => `${g.gate}=${g.action}`).join(',');
        return `[fire ${r.action} ${r.complexity} posture=${r.posture} hex=${r.hexagramId} tool=${r.tool}] ${gates}`;
    }
}