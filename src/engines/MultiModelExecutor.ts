import pino from 'pino';
import { ModelClient } from '../clients/ModelClient.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import type { Result, EngineOutput, SovereignRecord } from '../core/models.js';
import type { Renderer } from '../ui/Renderer.js';

const logger = pino({ name: 'MultiModelExecutor', base: { hostname: 'POG2' } });

export interface TaskAssignment {
    id: string;
    model: string; // Ollama model name
    task: string;
    context?: string;
    systemPrompt?: string;
    temperature?: number;
}

export interface TaskResult {
    id: string;
    model: string;
    result: Result<{ output: string; data?: SovereignRecord }>;
    latency: number;
}

export interface ParallelExecution {
    tasks: TaskAssignment[];
    coordinatorPrompt?: string; // How to combine results
}

/**
 * MultiModelExecutor â€” Kimi's limbs/digits
 * Executes up to 4 Ollama models in parallel for task completion
 * Models work as tools under Kimi's coordination
 */
export class MultiModelExecutor {
    private readonly client: ModelClient;

    constructor(
        private readonly config: SovereignConfig,
        private readonly renderer: Renderer
    ) {
        this.client = new ModelClient(config);
    }

    /**
     * Execute multiple tasks in parallel across different Ollama models
     * Max 4 concurrent executions
     */
    async executeParallel(execution: ParallelExecution): Promise<Result<EngineOutput>> {
        const { tasks, coordinatorPrompt } = execution;

        if (tasks.length === 0) {
            return { ok: false, error: new Error('No tasks provided') };
        }

        if (tasks.length > 4) {
            return { ok: false, error: new Error('Maximum 4 parallel tasks allowed') };
        }

        this.renderer.info(`ðŸ¦¾ Deploying ${tasks.length} Ollama limb${tasks.length > 1 ? 's' : ''}...`);

        const startTime = Date.now();

        // Execute all tasks in parallel
        const promises = tasks.map(task => this.executeSingleTask(task));
        const results = await Promise.all(promises);

        const totalLatency = Date.now() - startTime;

        // Log results
        for (const r of results) {
            if (r.result.ok) {
                logger.info({ taskId: r.id, model: r.model, latency: r.latency }, 'Limb completed');
            } else {
                logger.error({ taskId: r.id, model: r.model, error: r.result.error.message }, 'Limb failed');
            }
        }

        // Combine results using coordinator prompt if provided
        if (coordinatorPrompt && tasks.length > 1) {
            return this.coordinateResults(results, coordinatorPrompt, totalLatency);
        }

        // Return individual results combined
        const combined = this.formatCombinedResults(results, totalLatency);
        return { ok: true, value: combined };
    }

    private async executeSingleTask(assignment: TaskAssignment): Promise<TaskResult> {
        const startTime = Date.now();

        const result = await this.client.call({
            model: assignment.model,
            prompt: assignment.task,
            systemPrompt: assignment.systemPrompt,
            temperature: assignment.temperature ?? 0.3
        });

        const latency = Date.now() - startTime;

        return {
            id: assignment.id,
            model: assignment.model,
            result: result.ok
                ? { ok: true, value: { output: result.value.response } }
                : { ok: false, error: result.error },
            latency
        };
    }

    /**
     * Coordinate multiple results through a synthesis model
     */
    private async coordinateResults(
        results: TaskResult[],
        coordinatorPrompt: string,
        totalLatency: number
    ): Promise<Result<EngineOutput>> {
        // Build combined context
        const combined = results.map(r => {
            const output = r.result.ok ? r.result.value.output : `ERROR: ${r.result.error.message}`;
            return `[${r.id} via ${r.model}]:\n${output}`;
        }).join('\n\n---\n\n');

        const synthesisPrompt = `${coordinatorPrompt}\n\nINPUTS:\n${combined}\n\nSYNTHESIZE:`;

        // Use the fast coding model for synthesis
        const synthesis = await this.client.call({
            model: this.config.codingFastModel,
            prompt: synthesisPrompt,
            temperature: 0.3
        });

        if (!synthesis.ok) {
            return synthesis as Result<EngineOutput>;
        }

        return {
            ok: true,
            value: {
                output: synthesis.value.response,
                data: {
                    parallelResults: results.map(r => ({
                        id: r.id,
                        model: r.model,
                        latency: r.latency,
                        success: r.result.ok
                    })),
                    totalLatency,
                    synthesisModel: this.config.codingFastModel
                }
            }
        };
    }

    private formatCombinedResults(results: TaskResult[], totalLatency: number): EngineOutput {
        const outputs: string[] = [];

        for (const r of results) {
            const status = r.result.ok ? 'âœ“' : 'âœ—';
            outputs.push(`[${status}] ${r.id} (${r.model}) - ${r.latency}ms`);
            if (r.result.ok) {
                outputs.push(r.result.value.output);
            } else {
                outputs.push(`ERROR: ${r.result.error.message}`);
            }
            outputs.push('');
        }

        return {
            output: outputs.join('\n'),
            data: {
                parallelResults: results.map(r => ({
                    id: r.id,
                    model: r.model,
                    latency: r.latency,
                    success: r.result.ok
                })),
                totalLatency
            }
        };
    }

    /**
     * Execute a coding task using the heavy + fast model approach
     * Heavy model plans, fast models implement in parallel
     */
    async executeCodingTask(task: string, context?: string): Promise<Result<EngineOutput>> {
        // Step 1: Planning (heavy model)
        this.renderer.info('ðŸ§  Heavy model planning...');
        const planResult = await this.client.call({
            model: this.config.codingHeavyModel,
            prompt: `TASK: ${task}\n\n${context ? `CONTEXT:\n${context}\n\n` : ''}Create a detailed implementation plan. Break into up to 4 parallel subtasks.`,
            temperature: 0.2
        });

        if (!planResult.ok) return planResult as Result<EngineOutput>;

        const plan = planResult.value.response;

        // Step 2: Extract subtasks (simplified - in reality use structured parsing)
        const subtasks = this.extractSubtasks(plan, task);

        // Step 3: Execute subtasks in parallel
        this.renderer.info(`ðŸ¦¾ Executing ${subtasks.length} subtasks in parallel...`);

        return this.executeParallel({
            tasks: subtasks,
            coordinatorPrompt: 'Synthesize these parallel coding outputs into a cohesive final implementation.'
        });
    }

    private extractSubtasks(plan: string, originalTask: string): TaskAssignment[] {
        // Simple extraction - could be enhanced with JSON parsing
        const lines = plan.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('1.') || l.trim().startsWith('2.'));

        if (lines.length < 2) {
            // No clear subtasks, just execute original
            return [{
                id: 'implementation',
                model: this.config.codingFastModel,
                task: originalTask
            }];
        }

        // Create up to 4 subtasks
        const subtasks: TaskAssignment[] = [];
        const models = [
            this.config.codingFastModel,
            this.config.codingHeavyModel,
            this.config.orchestratorModel,
            this.config.codingFastModel // reuse fast for 4th
        ];

        for (let i = 0; i < Math.min(lines.length, 4); i++) {
            subtasks.push({
                id: `subtask_${i + 1}`,
                model: models[i] ?? this.config.codingFastModel,
                task: `Execute this subtask as part of larger goal:\nORIGINAL TASK: ${originalTask}\n\nYOUR SUBTASK: ${lines[i]}`,
                systemPrompt: 'You are a specialized coding assistant. Implement only your assigned subtask precisely.'
            });
        }

        return subtasks;
    }

    /**
     * Get available Ollama models for Kimi to choose from
     */
    async getAvailableModels(): Promise<Result<string[]>> {
        try {
            const response = await fetch(`${this.config.ollamaBaseUrl}/api/tags`);
            if (!response.ok) {
                return { ok: false, error: new Error(`Ollama API error: ${response.status}`) };
            }

            const data = await response.json() as { models?: Array<{ name: string }> };
            const models = data.models?.map(m => m.name) ?? [];

            return { ok: true, value: models };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    public healthCheck(): { online: boolean; details: string } {
        return { 
            online: true, 
            details: 'MultiModelExecutor parallel muscle fibers active.' 
        };
    }
}
