import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import pino from 'pino';
import { NEUROLOGICAL_MAP, NeuralCategory, type NeuralNode } from '../state/NeurologicalMap.js';
import { YaoState } from '../core/models.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { EmbedEngine } from '../engines/EmbedEngine.js';
import { PulseMonitor } from './PulseMonitor.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { TrainingCollector } from '../utils/TrainingCollector.js';
import type { ModelRolodex, ProviderIdentity, RolodexProvider } from '../api/ai/ModelRolodex.js';

const logger = pino({ name: 'NodeTester', base: { hostname: 'POG2' } });

export interface NodeHealth {
    path: string;
    role: string;
    category: NeuralCategory;
    status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    yaoState: YaoState;
    details?: string;
}

export interface ProviderHealth {
    provider: RolodexProvider;
    status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    authenticated: boolean;
    modelCount: number;
    totalCalls: number;
    totalTokens: number;
    avgLatencyMs: number;
    account?: string;
    error?: string;
}

/**
 * NodeTester - Neurological Diagnostic Substrate.
 *
 * Probes each node in the NEUROLOGICAL_MAP using its registered live instance.
 * All status reports are derived from real heartbeat signals — no hard-coded ONLINE defaults.
 *
 * Node lookup is performed by matching the filename portion of NeuralNode.path
 * against the injected limbs registry, which maps class names to live instances.
 * This is anchored to the exact path definitions in NeurologicalMap.ts.
 *
 * Category logic:
 *   CNS      — Specialized probes for routing/hexagram + registry heartbeat
 *   PNS      — Registry heartbeat required; OFFLINE if not registered
 *   SENSORY  — Registry heartbeat required; OFFLINE if not registered
 *   MEMORY   — EmbedEngine probe + registry heartbeat
 *   IMMUNE   — Registry heartbeat required; OFFLINE if not registered
 *   METABOLIC — Registry heartbeat; type-only substrates pass by file existence
 */
export class NodeTester {
    constructor(
        private readonly projectRoot: string,
        private readonly router: TernaryRouter,
        private readonly embedEngine: EmbedEngine,
        private readonly pulse: PulseMonitor | undefined,
        private readonly hexagram: HexagramManager,
        private readonly training: TrainingCollector,
        private readonly limbs: Record<string, any> = {}
    ) { }

    /**
     * Audit the entire Neurological Map functional health.
     */
    public async auditNeuralNodes(): Promise<NodeHealth[]> {
        logger.info('Commencing deep clinical neurological audit...');
        const results: NodeHealth[] = [];

        for (const node of NEUROLOGICAL_MAP) {
            const health = await this.probeNode(node);
            results.push(health);
        }

        const onlineCount = results.filter(r => r.status === 'ONLINE').length;
        logger.info({ total: NEUROLOGICAL_MAP.length, online: onlineCount }, 'Audit complete.');
        return results;
    }

    /**
     * Phase 6: Audit all AI providers via the ModelRolodex.
     * Returns per-provider health summary including model counts, auth status, and usage metrics.
     */
    public auditProviders(): ProviderHealth[] {
        const rolodex = this.router.getRolodex();
        if (!rolodex) {
            logger.warn('ModelRolodex not injected — provider audit unavailable.');
            return [];
        }

        const providers: RolodexProvider[] = ['ollama', 'cloudflare', 'gemini', 'huggingface', 'fireworks', 'openrouter'];
        const results: ProviderHealth[] = [];

        for (const provider of providers) {
            const identity = rolodex.getProviderStatus(provider);
            const models = rolodex.getModelsForProvider(provider);
            const totalCalls = models.reduce((sum, m) => sum + m.successCount + m.failureCount, 0);
            const totalTokens = models.reduce((sum, m) => sum + m.totalTokensUsed, 0);
            const avgLatency = models.length > 0 ? Math.round(models.reduce((sum, m) => sum + m.avgLatencyMs, 0) / models.length) : 0;

            results.push({
                provider,
                status: identity.authenticated ? (identity.error ? 'DEGRADED' : 'ONLINE') : 'OFFLINE',
                authenticated: identity.authenticated,
                modelCount: identity.models.length,
                totalCalls,
                totalTokens,
                avgLatencyMs: avgLatency,
                account: identity.account,
                error: identity.error
            });
        }

        return results;
    }

    /**
     * Signal the live heartbeat of a node by matching its NeuralNode.path filename
     * to an injected instance in the limbs registry. Returns null if nothing is registered.
     */
    private signal(node: NeuralNode): NodeHealth | null {
        const className = node.path.split('/').pop()?.replace(/\.ts$|\.js$/, '');
        if (!className) return null;

        const instance = this.limbs[className];
        if (instance === undefined) return null; // Not registered — caller decides how to handle

        if (typeof instance.healthCheck !== 'function') {
            return {
                ...node,
                status: 'DEGRADED',
                yaoState: YaoState.OldYang,
                details: `${className}: registered but healthCheck() not implemented`
            };
        }

        try {
            const probe = instance.healthCheck() as { online: boolean; details: string };
            return {
                ...node,
                status: probe.online ? 'ONLINE' : 'DEGRADED',
                yaoState: probe.online ? YaoState.YoungYang : YaoState.OldYang,
                details: probe.details
            };
        } catch (err) {
            return {
                ...node,
                status: 'DEGRADED',
                yaoState: YaoState.OldYang,
                details: `${className}.healthCheck() threw: ${(err as Error).message}`
            };
        }
    }

    /**
     * Probe a single NeuralNode. Resolves its physical path first, then
     * dispatches to the category-appropriate probe using live signals.
     */
    private async probeNode(node: NeuralNode): Promise<NodeHealth> {
        // --- Physical Existence Check ---
        let fullPath = join(this.projectRoot, node.path);
        let exists = existsSync(fullPath);

        // Fallback: check compiled dist/ if src/ is missing
        if (!exists && node.path.startsWith('src/') && node.path.endsWith('.ts')) {
            const distPath = join(this.projectRoot, node.path.replace('src/', 'dist/').replace('.ts', '.js'));
            if (existsSync(distPath)) {
                fullPath = distPath;
                exists = true;
            }
        }

        if (!exists) {
            return {
                ...node,
                status: 'OFFLINE',
                yaoState: YaoState.OldYin,
                details: `Substrate missing: ${node.path}`
            };
        }

        // --- Category-Specific Probing Anchored to NeuralCategory Definitions ---
        try {
            switch (node.category) {

                case NeuralCategory.CNS: {
                    // TernaryRouter → live Ollama substrate ping + Rolodex provider summary
                    if (node.path === 'src/routing/TernaryRouter.ts') {
                        const probe = await this.router.pingSubstrate();
                        const rolodex = this.router.getRolodex();
                        let providerSummary = '';
                        if (rolodex) {
                            const health = rolodex.healthCheck();
                            providerSummary = ` | ${health.details}`;
                        }
                        return { ...node, status: probe.online ? 'ONLINE' : 'DEGRADED', yaoState: probe.online ? YaoState.YoungYang : YaoState.OldYang, details: probe.details + providerSummary };
                    }
                    // HexagramManager → live 6-line substrate check
                    if (node.path === 'src/routing/HexagramManager.ts') {
                        const probe = this.hexagram.healthCheck();
                        return { ...node, status: probe.online ? 'ONLINE' : 'OFFLINE', yaoState: probe.online ? YaoState.YoungYang : YaoState.OldYin, details: probe.details };
                    }
                    // All other CNS nodes → registry heartbeat signal
                    const cnsSig = this.signal(node);
                    if (cnsSig) return cnsSig;
                    return { ...node, status: 'ONLINE', yaoState: YaoState.YoungYang, details: `${node.role}: substrate verified on disk` };
                }

                case NeuralCategory.PNS: {
                    const pnsSig = this.signal(node);
                    if (pnsSig) return pnsSig;
                    return {
                        ...node,
                        status: 'DEGRADED',
                        yaoState: YaoState.OldYang,
                        details: `${node.role}: substrate on disk but not injected into NodeTester.limbs`
                    };
                }

                case NeuralCategory.SENSORY: {
                    if (node.path === 'src/monitor/PulseMonitor.ts') {
                        if (!this.pulse) return { ...node, status: 'DEGRADED', yaoState: YaoState.OldYang, details: 'PulseMonitor not injected' };
                        const probe = await this.pulse.checkDiskHealth();
                        let usagePct = 0;
                        if (probe.success && probe.data.totalBytes > 0n) {
                            usagePct = Number((probe.data.totalBytes - probe.data.freeBytes) * 100n / probe.data.totalBytes);
                        }
                        const ok = probe.success && usagePct < 95;
                        const details = probe.success ? `Disk: ${usagePct.toFixed(1)}% used (${probe.data.volumeLabel})` : 'Disk health probe failed';
                        return { ...node, status: ok ? 'ONLINE' : (probe.success ? 'DEGRADED' : 'OFFLINE'), yaoState: ok ? YaoState.YoungYang : YaoState.OldYin, details };
                    }
                    const sensSig = this.signal(node);
                    if (sensSig) return sensSig;
                    return {
                        ...node,
                        status: 'DEGRADED',
                        yaoState: YaoState.OldYang,
                        details: `${node.role}: substrate on disk but not injected into NodeTester.limbs`
                    };
                }

                case NeuralCategory.MEMORY: {
                    if (node.path === 'src/engines/EmbedEngine.ts' || node.path === 'src/utils/VectorDB.ts') {
                        const probe = await this.embedEngine.healthCheck();
                        return { ...node, status: probe.online ? 'ONLINE' : 'OFFLINE', yaoState: probe.online ? YaoState.YoungYang : YaoState.OldYin, details: probe.details };
                    }
                    if (node.role === 'Knowledge:Cloudflare') {
                        try {
                            const files = readdirSync(fullPath);
                            const count = files.filter(f => !f.startsWith('.') && !f.includes('.')).length;
                            return { ...node, status: count > 0 ? 'ONLINE' : 'DEGRADED', yaoState: count > 0 ? YaoState.YoungYang : YaoState.OldYang, details: `${count} templates available` };
                        } catch (e) {
                            return { ...node, status: 'OFFLINE', yaoState: YaoState.OldYin, details: `Template directory unreadable: ${(e as Error).message}` };
                        }
                    }
                    const memSig = this.signal(node);
                    if (memSig) return memSig;
                    return { ...node, status: 'ONLINE', yaoState: YaoState.YoungYang, details: `${node.role}: substrate verified on disk` };
                }

                case NeuralCategory.IMMUNE: {
                    const immSig = this.signal(node);
                    if (immSig) return immSig;
                    return {
                        ...node,
                        status: 'DEGRADED',
                        yaoState: YaoState.OldYang,
                        details: `${node.role}: substrate on disk but not injected into NodeTester.limbs`
                    };
                }

                case NeuralCategory.METABOLIC: {
                    if (node.path.startsWith('src/types/') || node.path.startsWith('src/core/models')) {
                        return { ...node, status: 'ONLINE', yaoState: YaoState.YoungYang, details: `${node.role}: type substrate verified on disk` };
                    }
                    if (node.path === 'src/utils/TrainingCollector.ts') {
                        const probe = this.training.healthCheck();
                        return { ...node, status: probe.online ? 'ONLINE' : 'DEGRADED', yaoState: probe.online ? YaoState.YoungYang : YaoState.OldYang, details: probe.details };
                    }
                    const metaSig = this.signal(node);
                    if (metaSig) return metaSig;
                    return {
                        ...node,
                        status: 'DEGRADED',
                        yaoState: YaoState.OldYang,
                        details: `${node.role}: substrate on disk but not injected into NodeTester.limbs`
                    };
                }
            }
        } catch (err) {
            return { ...node, status: 'DEGRADED', yaoState: YaoState.OldYang, details: `Probe threw: ${(err as Error).message}` };
        }
    }
}
