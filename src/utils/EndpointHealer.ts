import pino from 'pino';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { TrainingCollector } from './TrainingCollector.js';

import { HexagramManager } from '../routing/HexagramManager.js';
import { YaoState } from '../core/models.js';

// Biological Limbs for Somatic Recovery
import type { CodeEngine } from '../engines/CodeEngine.js';
import type { ShellEngine } from '../engines/ShellEngine.js';

const execAsync = promisify(exec);
const logger = pino({ name: 'EndpointHealer', base: { hostname: 'POG2' } });

export interface HealerDiagnostic {
    provider: string;
    checks: DiagnosticCheck[];
    resolved: boolean;
    resolution?: string;
}

interface DiagnosticCheck {
    name: string;
    command: string;
    result: string;
    passed: boolean;
}

/**
 * EndpointHealer â€” Immune system auto-repair for failed cloud endpoints.
 * When a provider fails (HF/CF/Gemini/Ollama), this limb uses shell commands
 * to diagnose the issue by inspecting global variables, CLI auth states,
 * and service health. It can attempt automatic resolution.
 */
export class EndpointHealer {
    constructor(
        private readonly hexagram: HexagramManager,
        private readonly collector?: TrainingCollector,
        // Optional Biological Limbs
        private readonly codeEngine?: CodeEngine,
        private readonly shellEngine?: ShellEngine
    ) { }

    async diagnoseAndHeal(provider: string, error: string, model?: string): Promise<HealerDiagnostic> {
        logger.info({ provider, error, model }, 'Endpoint healer activated');

        const yao = this.hexagram.getYaoState?.() || YaoState.YoungYang;

        // Cognitive Immunology Phase 1: Deep Dormancy & Chaos Restraints
        if (yao === YaoState.OldYin || yao === YaoState.OldMixed) {
            logger.warn({ provider, yao }, 'Immunology Restraint: Endpoint Healer refusing active shell recovery due to dormant/chaotic state.');
            await this.hexagram.pushLine({
                lineIndex: 0,
                importance: 0.9,
                title: 'Healer Suppressed',
                content: `Refused aggressive restart of ${provider}. Operating in local/dormant state.`,
                state: yao
            });
            return { provider, checks: [], resolved: false, resolution: `Suppressed recovery loop: Cognitive state is ${yao}.` };
        }

        // Pin diagnostic start to Hexagram
        await this.hexagram.pushLine({
            lineIndex: 0,
            importance: 0.8,
            title: 'Neural Diagnosis',
            content: `Analyzing ${provider} failure${model ? ` for ${model}` : ''}...`,
            state: YaoState.OldYang
        });

        const diagnostic: HealerDiagnostic = {
            provider,
            checks: [],
            resolved: false
        };

        switch (provider) {
            case 'ollama':
                await this.diagnoseOllama(diagnostic, model);
                break;
            case 'cloudflare':
                await this.diagnoseCloudflare(diagnostic);
                break;
            case 'huggingface':
                await this.diagnoseHuggingFace(diagnostic);
                break;
            case 'gemini':
                await this.diagnoseGemini(diagnostic);
                break;
            default:
                await this.diagnoseGeneric(diagnostic);
        }

        // Log diagnostic to training data
        if (this.collector) {
            await this.collector.recordHistory('error', `EndpointHealer: ${provider} diagnostic`, {
                provider,
                originalError: error,
                checksRun: diagnostic.checks.length,
                resolved: diagnostic.resolved,
                resolution: diagnostic.resolution
            });
        }

        // Update Hexagram with result
        await this.hexagram.pushLine({
            lineIndex: 0,
            importance: 0.8,
            title: diagnostic.resolved ? 'Neural Repair' : 'Diagnostic Yield',
            content: diagnostic.resolution || `Diagnosis complete for ${provider}.`,
            state: diagnostic.resolved ? YaoState.YoungYang : YaoState.OldYang
        });

        return diagnostic;
    }

    // â•â•â• Ollama Diagnostics (God State) â•â•â•

    private async diagnoseOllama(diag: HealerDiagnostic, model?: string): Promise<void> {
        // Check if Ollama process is running
        const processCheck = await this.runCheck('Ollama Process', 'tasklist /FI "IMAGENAME eq ollama.exe" /NH');
        diag.checks.push(processCheck);

        // Check if specific model exists if provided
        if (model) {
            const modelInventory = await this.runCheck('Model Inventory', 'ollama list');
            diag.checks.push(modelInventory);

            const modelExists = modelInventory.result.includes(model);
            if (!modelExists && modelInventory.passed) {
                diag.resolution = `Substrate Reconstruction: Model "${model}" is missing. Execute "ollama pull ${model}" to restore.`;
                diag.resolved = false; // Cannot auto-pull yet due to bandwidth/time constraints

                await this.hexagram.pushLine({
                    lineIndex: 0,
                    importance: 0.9,
                    title: 'Substrate Missing',
                    content: `Model ${model} not found in local inventory.`,
                    state: YaoState.OldYin
                });
                return;
            }
        }

        // Check available models
        const modelCheck = await this.runCheck('Ollama Models', 'ollama list');
        diag.checks.push(modelCheck);

        // Check Ollama serve status
        const serveCheck = await this.runCheck('Ollama API', 'curl -s http://localhost:11434/api/tags');
        diag.checks.push(serveCheck);

        // If process is not running, attempt restart
        if (!processCheck.passed || !serveCheck.passed) {
            const restart = await this.runCheck('Ollama Restart', 'start /B ollama serve');
            diag.checks.push(restart);
            if (restart.passed) {
                diag.resolved = true;
                diag.resolution = 'Restarted Ollama serve process';
            }
        }
    }

    // â•â•â• Cloudflare Diagnostics â•â•â•

    private async diagnoseCloudflare(diag: HealerDiagnostic): Promise<void> {
        const whoami = await this.runCheck('Wrangler Auth', 'npx wrangler whoami');
        diag.checks.push(whoami);

        const envCheck = await this.runCheck('CF API Token', 'echo %CLOUDFLARE_API_TOKEN%');
        diag.checks.push(envCheck);

        if (!whoami.passed) {
            diag.resolution = 'Cloudflare auth failed. Run "npx wrangler login" to re-authenticate.';
        }
    }

    // â•â•â• HuggingFace Diagnostics â•â•â•

    private async diagnoseHuggingFace(diag: HealerDiagnostic): Promise<void> {
        const envCheck = await this.runCheck('HF API Key', 'echo %HUGGINGFACE_API_KEY%');
        diag.checks.push(envCheck);

        const curlCheck = await this.runCheck('HF API Health', 'curl -s -o NUL -w "%{http_code}" https://router.huggingface.co/models');
        diag.checks.push(curlCheck);

        if (!envCheck.passed) {
            diag.resolution = 'HuggingFace API key not found in environment. Set HUGGINGFACE_API_KEY.';
        } else if (curlCheck.result.includes('429')) {
            diag.resolution = 'HuggingFace rate limited (429). Waiting for cooldown.';
        }
    }

    // â•â•â• Gemini Diagnostics â•â•â•

    private async diagnoseGemini(diag: HealerDiagnostic): Promise<void> {
        const envCheck = await this.runCheck('Google API Key', 'echo %GOOGLE_API_KEY%');
        diag.checks.push(envCheck);

        const gcloudCheck = await this.runCheck('GCloud Auth', 'gcloud auth list --format=json');
        diag.checks.push(gcloudCheck);

        const gitCheck = await this.runCheck('Git Config', 'git config --global --list');
        diag.checks.push(gitCheck);

        if (!envCheck.passed) {
            diag.resolution = 'Google API key not set. Set GOOGLE_API_KEY or run "gcloud auth application-default login".';
        }
    }

    // â•â•â• Generic Diagnostics â•â•â•

    private async diagnoseGeneric(diag: HealerDiagnostic): Promise<void> {
        const netCheck = await this.runCheck('Network', 'ping -n 1 8.8.8.8');
        diag.checks.push(netCheck);

        const dnsCheck = await this.runCheck('DNS', 'nslookup api.openai.com');
        diag.checks.push(dnsCheck);

        if (!netCheck.passed) {
            diag.resolution = 'Network connectivity failed. Check internet connection.';
        }
    }

    // â•â•â• Shell Command Runner â•â•â•

    private async runCheck(name: string, command: string): Promise<DiagnosticCheck> {
        try {
            const { stdout, stderr } = await execAsync(command, { timeout: 10000 });
            const output = (stdout || stderr || '').trim();
            const passed = output.length > 0 && !output.toLowerCase().includes('error');

            logger.debug({ name, command, passed }, 'Diagnostic check complete');

            return { name, command, result: output.substring(0, 500), passed };
        } catch (error) {
            const msg = (error as Error).message || 'Command failed';
            logger.debug({ name, command, error: msg }, 'Diagnostic check failed');

            return { name, command, result: msg.substring(0, 500), passed: false };
        }
    }

    public healthCheck(): { online: boolean; details: string } {
        const hexOk = !!this.hexagram;
        return {
            online: hexOk,
            details: hexOk ? 'Immune response active and pinned to Hexagram.' : 'Metabolic friction: Hexagram not found.'
        };
    }
}
