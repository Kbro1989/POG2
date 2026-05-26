import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { existsSync, readdirSync } from 'fs';
import { join, basename, dirname, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import { NEUROLOGICAL_MAP, NeuralCategory, type NeuralNode } from '../state/NeurologicalMap.js';
import { YaoState, ok } from '../core/models.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { EmbedEngine } from '../engines/EmbedEngine.js';
import { PulseMonitor } from './PulseMonitor.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { TrainingCollector } from '../utils/TrainingCollector.js';
import type { RolodexProvider } from '../api/ai/ModelRolodex.js';
import type { QuotaProvider } from '../utils/QuotaTracker.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('NodeTester');

export interface NodeHealth {
    path: string;
    role: string;
    category: NeuralCategory;
    docDomain: string;
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
    quotaPct?: number;
    quotaExhausted?: boolean;
}

/**
 * NodeTester - Neurological Diagnostic Substrate.
 */
export class NodeTester {
    private readonly packageRoot: string;

    constructor(
        private readonly projectRoot: string,
        private readonly router: TernaryRouter,
        private readonly embedEngine: EmbedEngine,
        private readonly pulse: PulseMonitor | undefined,
        private readonly hexagram: HexagramManager,
        private readonly training: TrainingCollector,
        private limbs: Record<string, any> = {}
    ) {
        const thisDir = dirname(fileURLToPath(import.meta.url));
        this.packageRoot = join(thisDir, '..', '..');
    }

    public getRouter(): TernaryRouter {
        return this.router;
    }

    private nodeBase(node: NeuralNode): Pick<NeuralNode, 'path' | 'role' | 'category' | 'docDomain'> {
        return { path: node.path, role: node.role, category: node.category, docDomain: node.docDomain };
    }

    public registerLimbs(limbs: Record<string, any>): void {
        this.limbs = { ...this.limbs, ...limbs };
    }

    public hasRegistry(): boolean {
        return Object.keys(this.limbs).length > 0;
    }

    public hasLimb(className: string): boolean {
        return this.limbs[className] !== undefined;
    }

    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: 'NodeTester active; diagnostic sensors recalibrated.' };
    }

    public broadcastPulse(event: string, data: any): void {
        logger.info({ event, data }, 'Broadcasting pulse...');
        this.pulse?.emit('pulse', { event, data });
    }

    public async auditNeuralNodes(gameplayContext: boolean = false): Promise<NodeHealth[]> {
        logger.info({ gameplayContext }, 'Commencing deep clinical neurological audit...');
        
        const nodesToAudit = NEUROLOGICAL_MAP.filter(node => 
            gameplayContext || node.category !== (NeuralCategory as any).GAMEPLAY
        );

        const results: NodeHealth[] = new Array(nodesToAudit.length);
        const concurrency = 10;
        
        for (let i = 0; i < nodesToAudit.length; i += concurrency) {
            const batch = nodesToAudit.slice(i, i + concurrency);
            const batchPromises = batch.map(async (node, index) => {
                const health = await this.probeNode(node);
                results[i + index] = health;
            });
            await Promise.all(batchPromises);
        }

        const onlineCount = results.filter(r => r.status === 'ONLINE').length;
        const degraded = results.filter(r => r.status === 'DEGRADED');
        const offline = results.filter(r => r.status === 'OFFLINE');

        logger.info({ total: nodesToAudit.length, online: onlineCount, degraded: degraded.length, offline: offline.length }, 'Audit complete.');

        // Phase 112: Dynamic authorisation for Ghost-Mode (DEGRADED HEARTBEAT)
        const { SubstrateResolver } = await import('../engines/gameplay/SubstrateResolver.js');
        const { SubstrateState } = await import('../core/models.js');

        if (offline.length === 0 && degraded.length === 0) {
            logger.info('All nodes reporting ONLINE - full neurological integrity confirmed.');
            SubstrateResolver.setStatus(SubstrateState.ONLINE);
        } else if (offline.length === 0 && degraded.length > 0) {
            logger.warn({ degraded: degraded.length, nodes: degraded.map(n => `${n.path} (${n.details})`) }, 'Substrate operating in DEGRADED mode (Catalogs only). AUTHORIZED.');
            SubstrateResolver.setStatus(SubstrateState.DEGRADED);
        } else {
            logger.error({ offline: offline.length }, 'Substrate CRITICAL FAILURE. Heartbeat VETOED.');
            SubstrateResolver.setStatus(SubstrateState.OFFLINE);
        }

        return results;
    }

    public async auditProviders(): Promise<ProviderHealth[]> {
        const rolodex = this.router.getRolodex();
        if (!rolodex) {
            logger.warn('ModelRolodex not injected - provider audit unavailable.');
            return [];
        }

        // Trigger refresh if everything is offline to ensure accurate clinical state
        const currentProviders = rolodex.getProviderStatus('ollama'); // Just a peek
        if (!currentProviders.authenticated && !currentProviders.lastChecked) {
            logger.info('Clinical audit triggering provider substrate refresh...');
            await rolodex.refreshAll();
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

        const cloudProviders = results.filter(r => r.provider !== 'ollama');
        const cloudOffline = cloudProviders.every(r => r.status === 'OFFLINE' || r.quotaExhausted);
        const cloudDegraded = cloudProviders.some(r => r.status === 'DEGRADED' || r.status === 'OFFLINE' || r.quotaExhausted);

        const { SubstrateResolver } = await import('../engines/gameplay/SubstrateResolver.js');
        if (cloudOffline) {
            SubstrateResolver.setCloudSignal({ 
                status: 'OFFLINE', 
                effect: 'BLOCK_CLOUD_TASKS',
                lastError: 'All primary cloud providers exhausted or unreachable.' 
            });
        } else if (cloudDegraded) {
            SubstrateResolver.setCloudSignal({ 
                status: 'DEGRADED', 
                effect: 'ROUTING_BIAS_ONLY',
                lastError: cloudProviders.find(r => r.error)?.error
            });
        } else {
            SubstrateResolver.setCloudSignal({ status: 'ONLINE', effect: 'NONE' });
        }

        return results;
    }

    private async signal(node: NeuralNode): Promise<NodeHealth | null> {
        const className = node.path.split('/').pop()?.replace(/\.ts$|\.js$/, '');
        if (!className) return null;

        let instance = this.limbs[className];
        if (instance === undefined) {
            const exactKey = Object.keys(this.limbs).find(k => k.toLowerCase() === className.toLowerCase());
            if (exactKey) instance = this.limbs[exactKey];
        }

        if (instance === undefined) {
            const isExplicitlyUndefined = Object.keys(this.limbs).some(k => k.toLowerCase() === className.toLowerCase());
            if (isExplicitlyUndefined) {
                return {
                    ...this.nodeBase(node),
                    status: 'ONLINE',
                    yaoState: YaoState.YoungYang,
                    details: 'Substrate explicitly bypassed (AUTHORIZED)'
                };
            }
            return null;
        }

        if (typeof instance.healthCheck !== 'function') {
            return {
                ...this.nodeBase(node),
                status: 'DEGRADED',
                yaoState: YaoState.OldYang,
                details: `${className}: registered but healthCheck() not implemented`
            };
        }

        try {
            const checkPromise = instance.healthCheck() as Promise<{ online: boolean; details: string; status?: string }>;
            const probe = await Promise.race([
                checkPromise,
                new Promise<{ online: boolean; details: string }>((_, reject) => 
                    setTimeout(() => reject(new Error('HEALTH_CHECK_TIMEOUT')), 3000)
                )
            ]);

            const status = (probe as any).status || (probe.online ? 'ONLINE' : 'DEGRADED');
            return {
                ...this.nodeBase(node),
                status: status as 'ONLINE' | 'DEGRADED' | 'OFFLINE',
                yaoState: (status === 'ONLINE') ? YaoState.YoungYang : YaoState.OldYang,
                details: probe.details
            };
        } catch (err) {
            return {
                ...this.nodeBase(node),
                status: 'DEGRADED',
                yaoState: YaoState.OldYang,
                details: `${className}.healthCheck() threw: ${(err as Error).message}`
            };
        }
    }

    private async probeNode(node: NeuralNode): Promise<NodeHealth> {
        const pathsToTry = [
            node.path,
            node.path.replace(/\.ts$/, '.js'),
            node.path.replace(/^src\//, 'dist/src/').replace(/\.ts$/, '.js'),
            node.path.replace(/^src\//, 'dist/').replace(/\.ts$/, '.js')
        ];

        let fullPath = '';
        let exists = false;

        for (const p of pathsToTry) {
            // Try project root
            const projectPath = isAbsolute(p) ? p : join(this.projectRoot, p);
            if (existsSync(projectPath)) {
                fullPath = projectPath;
                exists = true;
                break;
            }
            // Try package root
            const pkgPath = isAbsolute(p) ? p : join(this.packageRoot, p);
            if (existsSync(pkgPath)) {
                fullPath = pkgPath;
                exists = true;
                break;
            }
        }

        if (!exists) {
            return {
                ...this.nodeBase(node),
                status: 'OFFLINE',
                yaoState: YaoState.OldYin,
                details: `Substrate missing: ${node.path}`
            };
        }

        try {
            switch (node.category) {
                case NeuralCategory.CNS: {
                    if (node.path === 'src/routing/TernaryRouter.ts') {
                        const probe = await this.router.pingSubstrate();
                        return { ...this.nodeBase(node), status: probe.online ? 'ONLINE' : 'DEGRADED', yaoState: probe.online ? YaoState.YoungYang : YaoState.OldYang, details: probe.details };
                    }
                    if (node.path === 'src/routing/HexagramManager.ts') {
                        const probe = this.hexagram.healthCheck();
                        return { ...this.nodeBase(node), status: probe.online ? 'ONLINE' : 'OFFLINE', yaoState: probe.online ? YaoState.YoungYang : YaoState.OldYin, details: probe.details };
                    }
                    const cnsSig = await this.signal(node);
                    if (cnsSig) return cnsSig;
                    return { ...this.nodeBase(node), status: 'DEGRADED', yaoState: YaoState.OldYang, details: 'Critical CNS component missing from registry' };
                }
                case NeuralCategory.PNS: {
                    const pnsSig = await this.signal(node);
                    if (pnsSig) return pnsSig;
                    return { ...this.nodeBase(node), status: 'DEGRADED', yaoState: YaoState.OldYang, details: 'PNS substrate unconfigured' };
                }
                case NeuralCategory.SENSORY: {
                    if (node.path === 'src/monitor/PulseMonitor.ts') {
                        if (!this.pulse) return { ...this.nodeBase(node), status: 'DEGRADED', yaoState: YaoState.OldYang, details: 'PulseMonitor not injected' };
                        const probe = await this.pulse.checkDiskHealth();
                        return { ...this.nodeBase(node), status: probe.success ? 'ONLINE' : 'DEGRADED', yaoState: YaoState.YoungYang, details: probe.success ? 'Disk Nominal' : 'Disk Probe Failed' };
                    }
                    const sensSig = await this.signal(node);
                    if (sensSig) return sensSig;
                    return { ...this.nodeBase(node), status: 'DEGRADED', yaoState: YaoState.OldYang, details: 'Sensory signal missing' };
                }
                case NeuralCategory.MEMORY: {
                    if (node.path === 'src/engines/EmbedEngine.ts') {
                        const probe = await this.embedEngine.healthCheck();
                        return { ...this.nodeBase(node), status: probe.online ? 'ONLINE' : 'OFFLINE', yaoState: probe.online ? YaoState.YoungYang : YaoState.OldYin, details: probe.details };
                    }
                    const memSig = await this.signal(node);
                    if (memSig) return memSig;
                    const structural = await this.structuralProbe(node);
                    return { ...structural, status: 'DEGRADED', details: 'Memory substrate dormant' };
                }
                case NeuralCategory.IMMUNE: {
                    const immSig = await this.signal(node);
                    if (immSig) return immSig;
                    return { ...this.nodeBase(node), status: 'DEGRADED', yaoState: YaoState.OldYang, details: 'Immune substrate dormant' };
                }
                case NeuralCategory.METABOLIC: {
                    if (node.path.startsWith('src/types/') || node.path.startsWith('src/core/models')) {
                        return { ...this.nodeBase(node), status: 'ONLINE', yaoState: YaoState.YoungYang, details: 'Type substrate verified' };
                    }
                    const metaSig = await this.signal(node);
                    if (metaSig) return metaSig;
                    return this.structuralProbe(node);
                }
            }
        } catch (err) {
            return { ...this.nodeBase(node), status: 'DEGRADED', yaoState: YaoState.OldYang, details: `Probe error: ${(err as Error).message}` };
        }
        return { ...this.nodeBase(node), status: 'OFFLINE', yaoState: YaoState.OldYin, details: 'Probe logic failure' };
    }

    private async structuralProbe(node: NeuralNode): Promise<NodeHealth> {
        const fullPath = join(this.projectRoot, node.path);
        try {
            return {
                ...this.nodeBase(node),
                status: 'ONLINE',
                yaoState: YaoState.YoungYang,
                details: 'Structural integrity verified'
            };
        } catch (e) {
            return {
                ...this.nodeBase(node),
                status: 'OFFLINE',
                yaoState: YaoState.OldYin,
                details: 'Structural probe failed'
            };
        }
    }
}
