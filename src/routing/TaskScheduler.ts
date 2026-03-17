import { createLogger } from '../utils/logger.js';
import { type YaoState, type Result } from '../core/models.js';

const logger = createLogger('TaskScheduler');

export interface ScheduledTask<T> {
    id: string;
    priority: number;
    provider: string;
    execute: () => Promise<T>;
    timeoutMs: number;
    submittedAt: number;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
}

const PROVIDER_LIMITS: Record<string, number> = {
    ollama: 1,      // Local models are strictly serial to avoid VRAM thrashing
    gemini: 10,     // Cloud APIs can handle more concurrency
    cloudflare: 5,
    fireworks: 8,
    openrouter: 10,
    huggingface: 3,
    pipeline: 1,    // Production runs are heavy; keep at 1 to prevent resource starvation
    vision: 1       // Puppeteer instances are resource-heavy
};

/**
 * TaskScheduler - Non-blocking priority orchestrator for the Sovereign CNS.
 * Prevents slow local models from stalling the entire nervous system.
 */
export class TaskScheduler {
    private queue: ScheduledTask<any>[] = [];
    private activeCount: Map<string, number> = new Map();
    private waitTimes: Map<string, number[]> = new Map(); // Rolling window of last 10 wait times
    private readonly WINDOW_SIZE = 10;
    private queueDepthPeak = 0;
    private completedTasks = 0;
    private taskCounter = 0;
    private readonly startTime = Date.now();
    private static instance: TaskScheduler;

    private constructor() {}

    public static getInstance(): TaskScheduler {
        if (!TaskScheduler.instance) {
            TaskScheduler.instance = new TaskScheduler();
        }
        return TaskScheduler.instance;
    }

    /**
     * Map YaoState to numeric priority.
     * OldYang (Evolution/Stability) = 4
     * YoungYang (Action) = 3
     * YoungYin (Stability) = 2
     * OldYin (Refinement) = 1
     */
    public static mapPriority(state: YaoState): number {
        const priorityMap: Record<number, number> = {
            3: 4, // OldYang (Change/Highest)
            2: 3, // YoungYang (Stable/Action)
            0: 2, // YoungYin (Stable/Stability)
            1: 1, // OldYin (Change/Refinement)
            4: 4, // OldMixed (Chaotic/High)
            5: 2  // YoungMixed (Emerging/Low)
        };
        return priorityMap[state] || 2;
    }

    /**
     * Schedule a task for execution.
     * Returns a promise that resolves when the task is complete.
     */
    public async schedule<T>(
        provider: string,
        priority: number,
        execute: () => Promise<T>,
        timeoutMs: number = 60000
    ): Promise<T> {
        const id = `task-${++this.taskCounter}-${Math.random().toString(36).substring(7)}`;
        
        return new Promise<T>((resolve, reject) => {
            const task: ScheduledTask<T> = {
                id,
                priority,
                provider,
                execute,
                timeoutMs,
                submittedAt: Date.now(),
                resolve,
                reject
            };

            this.queue.push(task);
            this.sortQueue();
            
            if (this.queue.length > this.queueDepthPeak) {
                this.queueDepthPeak = this.queue.length;
            }

            if (this.queue.length > 25) {
                logger.warn({ queueSize: this.queue.length }, 'CNS Congestion Detected: Queue depth exceeds threshold');
            }
            
            logger.debug({ id, provider, priority, queueSize: this.queue.length }, 'Task scheduled');
            
            this.processQueue();
        });
    }

    private sortQueue(): void {
        // Sort by priority (desc) then by submission time (asc)
        this.queue.sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return a.submittedAt - b.submittedAt;
        });
    }

    private async processQueue(): Promise<void> {
        if (this.queue.length === 0) return;

        for (let i = 0; i < this.queue.length; i++) {
            const task = this.queue[i];
            const currentActive = this.activeCount.get(task.provider) || 0;
            const limit = PROVIDER_LIMITS[task.provider] || 2;

            if (currentActive < limit) {
                // Remove from queue and start execution
                this.queue.splice(i, 1);
                
                // Track wait time
                const waitTime = Date.now() - task.submittedAt;
                const times = this.waitTimes.get(task.provider) || [];
                times.push(waitTime);
                if (times.length > this.WINDOW_SIZE) times.shift();
                this.waitTimes.set(task.provider, times);

                const avgWait = times.reduce((a, b) => a + b, 0) / times.length;
                if (avgWait > 2000) {
                    logger.warn({ provider: task.provider, avgWait }, 'CNS Congestion Signal: High provider wait time detected');
                }

                this.runTask(task);
                i--; // Adjust index after splice
            }
        }
    }

    private async runTask<T>(task: ScheduledTask<T>): Promise<void> {
        const provider = task.provider;
        this.activeCount.set(provider, (this.activeCount.get(provider) || 0) + 1);

        let finished = false;
        const releaseLane = () => {
            if (finished) return;
            finished = true;
            this.activeCount.set(provider, (this.activeCount.get(provider) || 1) - 1);
            // Process queue again to pick up new tasks
            setImmediate(() => this.processQueue());
        };

        const timeoutId = setTimeout(() => {
            if (!finished) {
                logger.error({ id: task.id, provider }, `Task exceeded hard timeout (${task.timeoutMs}ms) - rejecting`);
                task.reject(new Error(`Task ${task.id} timed out after ${task.timeoutMs}ms`));
                // We keep the lane occupied until the process actually finishes or throws, 
                // to prevent over-saturating local substrates like Ollama.
            }
        }, task.timeoutMs);

        try {
            logger.debug({ id: task.id, provider }, 'Task starting execution');
            const result = await task.execute();
            clearTimeout(timeoutId);
            if (!finished) {
                this.completedTasks++;
                task.resolve(result);
            }
        } catch (err) {
            clearTimeout(timeoutId);
            if (!finished) {
                logger.error({ id: task.id, provider, error: (err as Error).message }, 'Task execution failed');
                task.reject(err);
            }
        } finally {
            releaseLane();
        }
    }

    /** Status for diagnostics */
    public getQueueStatus() {
        const providerBacklog: Record<string, number> = {};
        for (const task of this.queue) {
            providerBacklog[task.provider] = (providerBacklog[task.provider] || 0) + 1;
        }

        const avgWaitTimes: Record<string, number> = {};
        for (const [provider, times] of this.waitTimes.entries()) {
            avgWaitTimes[provider] = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        }

        return {
            totalPending: this.queue.length,
            queueDepthPeak: this.queueDepthPeak,
            effectiveThroughput: Number((this.completedTasks / ((Date.now() - this.startTime) / 1000)).toFixed(2)),
            providerBacklog,
            activeCount: Object.fromEntries(this.activeCount),
            avgWaitTimesMs: avgWaitTimes,
            limits: PROVIDER_LIMITS
        };
    }
}
