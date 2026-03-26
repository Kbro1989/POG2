import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { createLogger } from '../utils/logger.js';
import { ModelRolodex } from '../api/ai/ModelRolodex.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { QuotaTracker } from '../utils/QuotaTracker.js';
import { loadConfig } from '../config/SovereignConfig.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { ModelClient } from '../clients/ModelClient.js';
import { join } from 'path';
import { homedir } from 'os';
import { TaskScheduler } from '../routing/TaskScheduler.js';

const logger = createLogger('NSv2StressTest');

// ═══ LIVE RESEARCH CONFIG — Real calls, real telemetry ═══
const TOTAL_TASKS = 30;
const CONCURRENCY = 3;
const TASK_TIMEOUT_MS = 60000; // 60s hard timeout per diagnostic task

const TASK_WEIGHTS = [
    { type: 'text', weight: 0.4 },
    { type: 'coding', weight: 0.3 },
    { type: 'vision', weight: 0.15 },
    { type: 'embedding', weight: 0.15 }
];

const CHEAP_MODELS = ['tinyllama', 'phi', 'minilm', 'vibethinker', 'moondream:1.8b'];

function pickTaskType(): 'text' | 'coding' | 'vision' | 'embedding' {
    const r = Math.random();
    let cumulative = 0;
    for (const w of TASK_WEIGHTS) {
        cumulative += w.weight;
        if (r <= cumulative) return w.type as any;
    }
    return 'text';
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        p,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: Task exceeded ${ms}ms`)), ms)
        )
    ]);
}

function generatePrompt(type: 'text' | 'coding' | 'vision' | 'embedding'): string {
    switch (type) {
        case 'vision': return 'Describe the visual color palette for a Morrowind total conversion loading screen.';
        case 'coding': return 'Write a TypeScript interface for a Sovereign Nervous System routing gate.';
        case 'embedding': return 'POG2 identity is anchored in the .env as the absolute source of truth.';
        case 'text': return 'Briefly explain why routing logic is essential for a distributed AI substrate.';
    }
}

async function runStressTest() {
    logger.info('🚀 Initializing RESEARCH-GRADE CNS Diagnostic Probe — NO MOCKS');

    const configPath = join(homedir(), '.POG2-cli', 'config.json');
    const config = loadConfig(configPath);

    const quotaTracker = new QuotaTracker();
    const hexagram = new HexagramManager(null, process.cwd());
    await hexagram.initialize();

    const rolodex = new ModelRolodex(config);
    const router = new TernaryRouter(config);
    const client = new ModelClient(config, router);

    router.setModelClient(client);
    router.setRolodex(rolodex);
    router.setQuotaTracker(quotaTracker);
    client.setRolodex(rolodex);

    logger.info('🔄 Discovering real substrate providers...');
    await rolodex.refreshAll();
    const providers = rolodex.getAllProviderStatuses();
    const okProviders = providers.filter((p: any) => p.authenticated && !p.error).map((p: any) => p.provider);
    logger.info({ okProviders }, 'Discovery complete.');

    // 1️⃣ Fix: Task Prompt Mismatch (Synchronized Generation)
    const tasks = Array.from({ length: TOTAL_TASKS }).map((_, i) => {
        const type = pickTaskType();
        return {
            id: i,
            type,
            prompt: generatePrompt(type)
        };
    });

    logger.info(`🎯 Executing ${TOTAL_TASKS} synchronized diagnostic tasks...`);

    // 10️⃣ Reputation Delta Tracking: Capture start state
    const initialReputation = new Map<string, number>();
    for (const m of rolodex.getAllModels()) {
        initialReputation.set(m.id, m.reputation);
    }

    let index = 0;
    let completed = 0;
    let successCount = 0;
    let fallbackCount = 0;
    let firstChoiceSuccess = 0; // The Holy Grail: Picking right initially
    let cheapHits = 0;
    let triageHits = 0; // Correctly classified task type
    const latencies: number[] = [];
    const routingLatencies: number[] = [];
    const providerFailures: Record<string, number> = {};
    const providerCalls: Record<string, number> = {};
    const fallbackMetrics: Record<string, number> = {};

    const complexityMap: Record<string, string> = {
        text: 'Yin',
        coding: 'Yang',
        vision: 'YinYang',
        embedding: 'Yin'
    };
    
    function nextTask() {
        const i = index;
        index++;
        return i < tasks.length ? tasks[i] : null;
    }

    async function worker(workerId: number) {
        let task;
        while ((task = nextTask())) {
            const start = Date.now();
            // 1️⃣ Split Routing Latency
            const routingStart = Date.now();
            const complexity = await router.classify(task.prompt);
            const decision = await router.route(
                complexity,
                task.type === 'coding' ? 'text' : task.type,
                task.prompt
            );
            const routingLatency = Date.now() - routingStart;
            routingLatencies.push(routingLatency);

            const selectedProvider = ModelRolodex.toRolodexProvider(decision.model);
            const modelName = decision.model.split(':')[1] || decision.model;

            // 5️⃣ Triage Accuracy Metric: Modality Match (Real failure detection)
            const modelMetadata = rolodex.getAllModels().find(m => m.id === decision.model || `${m.provider}:${m.id}` === decision.model);
            if (modelMetadata) {
                const isVisionTask = task.type === 'vision';
                const isEmbeddingTask = task.type === 'embedding';
                const isTextTask = task.type === 'text' || task.type === 'coding';

                if ((isVisionTask && modelMetadata.isVision) || 
                    (isEmbeddingTask && modelMetadata.isEmbedding) || 
                    (isTextTask && modelMetadata.isText)) {
                    triageHits++;
                }
            }

            // 3️⃣ Orchestration: The scheduler handles gating and priority
            // No manual backpressure loop required anymore.

            if (decision.fallbackUsed) {
                fallbackCount++;
                fallbackMetrics[selectedProvider] = (fallbackMetrics[selectedProvider] || 0) + 1;
            }

            // 4️⃣ Efficiency Metric: Cheap model hit rate (normalized check)
            const normalized = modelName.toLowerCase();
            const cheapKeywords = CHEAP_MODELS.map(m => m.split(':')[0].toLowerCase());
            if (cheapKeywords.some(kw => normalized.startsWith(kw))) {
                cheapHits++;
            }

            // 2️⃣ Provider Call with Guaranteed Timeout (Promise.race)
            providerCalls[selectedProvider] = (providerCalls[selectedProvider] || 0) + 1;
            const executionStart = Date.now();
            let callResult;
            try {
                callResult = await withTimeout(
                    client.call({
                        model: decision.model,
                        prompt: task.prompt,
                        temperature: 0.7
                    }),
                    TASK_TIMEOUT_MS
                );
            } catch (err: any) {
                logger.error({ 
                    taskId: task.id, 
                    model: decision.model, 
                    error: err.message 
                }, 'Provider Substrate Trap (Guaranteed Timeout)');
                callResult = { ok: false, error: err };
            }

            const latencyMs = Date.now() - executionStart;
            const success = callResult.ok;
            
            latencies.push(latencyMs);
            if (!success) {
                providerFailures[selectedProvider] = (providerFailures[selectedProvider] || 0) + 1;
            }

            const tokens = success ? (callResult.value as any)?.tokensUsed || 100 : 0;

            rolodex.recordCallResult(
                modelName,
                selectedProvider,
                success,
                latencyMs,
                tokens
            );
            rolodex.decrementLoad(selectedProvider, modelName);

            if (selectedProvider !== 'ollama' && (selectedProvider as string) !== 'rsmv') {
                quotaTracker.recordUsage(selectedProvider as any, tokens, 1);
            }

            if (success) {
                successCount++;
                if (!decision.fallbackUsed) firstChoiceSuccess++;
            }
            completed++;

            logger.info({
                worker: workerId,
                taskId: task.id,
                type: task.type,
                complexity,
                model: decision.model,
                success,
                latencyMs,
                routingLatency,
                reputation: rolodex.getAllModels().find(m => m.id === decision.model || `${m.provider}:${m.id}` === decision.model)?.reputation.toFixed(3) || '1.000'
            }, 'Routing decision telemetry');

            if (completed % 5 === 0) {
                logger.info({ completed, total: tasks.length, successRate: `${Math.round((successCount/completed)*100)}%` }, '📊 Progress Update');
            }
        }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }).map((_, i) => worker(i)));

    // 5️⃣ Upgrades: Latency Distribution and Efficiency
    latencies.sort((a,b) => a - b);
    routingLatencies.sort((a,b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const rp50 = routingLatencies[Math.floor(routingLatencies.length * 0.5)];

    logger.info('═══════════════ FINAL CNS DIAGNOSTIC REPORT ═══════════════');
    const stabilitySummary: Record<string, string> = {};
    for (const p of Object.keys(providerCalls)) {
        const calls = providerCalls[p];
        const fails = providerFailures[p] || 0;
        stabilitySummary[p] = `${Math.round(((calls - fails) / calls) * 100)}% stability (${calls} calls)`;
    }

    const schedulerStatus = TaskScheduler.getInstance().getQueueStatus();

    logger.info({
        totalTasks: TOTAL_TASKS,
        successRate: `${Math.round((successCount / TOTAL_TASKS) * 100)}%`,
        routerPrecision: `${Math.round((firstChoiceSuccess / TOTAL_TASKS) * 100)}%`,
        modalityMatchRate: `${Math.round((triageHits / TOTAL_TASKS) * 100)}%`,
        cheapHitRate: `${Math.round((cheapHits / completed) * 100)}%`,
        latency: { p50, p95, routingP50: rp50 },
        fallbackCount,
        providerStability: stabilitySummary,
        scheduler: {
            queueDepthPeak: schedulerStatus.queueDepthPeak,
            effectiveThroughput: schedulerStatus.effectiveThroughput,
            avgWaitTimesMs: schedulerStatus.avgWaitTimesMs
        }
    }, '📊 Final CNS Metrics');

    const quotas = quotaTracker.getAllQuotaHealth();
    for (const q of quotas) {
        if (q.usedPct > 0) logger.info({ provider: q.provider, usedPct: q.usedPct, exhausted: q.exhausted }, 'FinOps: Quota Status');
    }

    const allModels = rolodex.getAllModels();
    const topModels = allModels
        .filter((m: any) => m.successCount > 0)
        .sort((a: any, b: any) => b.reputation - a.reputation)
        .slice(0, 5);

    logger.info('🏆 Leading Substrate Nodes (Reputation Board)');
    for (const m of topModels) {
        const initial = initialReputation.get(m.id) || 1.0;
        const delta = m.reputation - initial;
        const deltaStr = delta === 0 ? '±0' : (delta > 0 ? '+' : '') + delta.toFixed(4);
        logger.info({ 
            model: m.id, 
            reputation: m.reputation.toFixed(4), 
            delta: deltaStr,
            success: m.successCount, 
            tokens: m.totalTokensUsed, 
            avgLat: Math.round(m.avgLatencyMs) 
        });
    }
}

runStressTest().catch(console.error);

