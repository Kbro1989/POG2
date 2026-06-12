import { type Result, ok, err, type EngineOutput, YaoState } from '../core/models.js';
import { type ToolDefinition } from '../ToolRegistry.js';
import { SovereignDomain } from '../types/SovereignDomain.js';
import { spawn } from 'child_process';
import path from 'path';

export const ollamaTierBridge: ToolDefinition = {
    name: 'ollama_tier_bridge',
    description: 'Bridges cognitive tasks to local Ollama hardware using tiered model routing based on .env.ollama configuration.',
    humanDescription: 'Executes AI tasks directly on your local hardware using optimized models to avoid cloud latency.',
    jargonDescription: 'Spawns a child process invoking the ollama_bridge.mjs script, mapping the payload to hardware-specific tiers.',
    idealYaoState: YaoState.OldYin,
    domain: SovereignDomain.RESEARCH,
    category: 'core',
    parameters: {
        tier: {
            type: 'string',
            description: 'The target tier (THINK, CODE_HEAVY, CODE_MID, CODE_FAST, FAST, VISION, EMBED, EMBED_HEAVY, MEDICAL, VOICE)',
            required: true
        },
        prompt: {
            type: 'string',
            description: 'The prompt or input to send to the local model',
            required: true
        }
    },
    execute: async (args: Readonly<Record<string, unknown>>): Promise<Result<EngineOutput>> => {
        const tier = args['tier'] as string;
        const prompt = args['prompt'] as string;

        if (!tier || !prompt) {
            return err(new Error('Missing required parameters: tier or prompt.'));
        }

        return new Promise((resolve) => {
            // Adjust path depending on OS / user setup, pointing to the bridge
            const bridgeScriptPath = 'C:\\\\Users\\\\krist\\\\.gemini\\\\scratch\\\\ollama_bridge.mjs';
            
            const proc = spawn('node', [
                bridgeScriptPath,
                '--tier',
                tier.toLowerCase(),
                prompt
            ]);

            let output = '';
            let errorOutput = '';

            proc.stdout.on('data', (data: Buffer) => {
                output += data.toString();
            });

            proc.stderr.on('data', (data: Buffer) => {
                errorOutput += data.toString();
            });

            proc.on('close', (code: number | null) => {
                if (code !== 0) {
                    resolve(err(new Error(`Ollama Bridge failed with code ${code}: ${errorOutput}`)));
                } else {
                    resolve(ok({ output: output.trim(), logs: [] }));
                }
            });
            
            proc.on('error', (e: Error) => {
                resolve(err(new Error(`Failed to spawn Ollama Bridge: ${e.message}`)));
            });
        });
    }
};

