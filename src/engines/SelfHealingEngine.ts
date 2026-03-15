import pino from 'pino';
import { exec } from 'child_process';
import { promisify } from 'util';
import { type TSCError, CognitiveChoice, YaoState, BuildStatus, HealthStatus, type ExecutionPlan } from '../core/models.js';
import { ModelClient as ModelExecutor } from '../clients/ModelClient.js';
import { ArchitectureDigest } from '../core/ArchitectureDigest.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { basename } from 'path';

// Biological Limbs for Holistic Immunology
import type { VisionEngine } from './VisionEngine.js';
import type { SpatialVisionEngine } from './SpatialVisionEngine.js';
import type { ChromanumberEngine } from './ChromanumberEngine.js';
import type { CodeEngine } from './CodeEngine.js';
import type { ShellEngine } from './ShellEngine.js';

const execAsync = promisify(exec);

const logger = pino({
    name: 'SelfHealingEngine',
    base: { hostname: 'POG2' }
});

/**
 * SelfHealingEngine - Codifies ternary diagnostic logic for project errors.
 */
export class SelfHealingEngine {
    private readonly architectureDigest: ArchitectureDigest;

    constructor(
        projectRoot: string,
        private readonly executor: ModelExecutor,
        private readonly hexagramManager: HexagramManager,
        private readonly correctionModel: string = 'qwen2.5-coder:7b-instruct-q4_K_M',
        // Optional Biological Limbs
        private readonly visionEngine?: VisionEngine,
        private readonly spatialVisionEngine?: SpatialVisionEngine,
        private readonly chromaEngine?: ChromanumberEngine,
        private readonly codeEngine?: CodeEngine,
        private readonly shellEngine?: ShellEngine
    ) {
        this.architectureDigest = new ArchitectureDigest(projectRoot);
    }

    async diagnose(error: TSCError, plan?: ExecutionPlan): Promise<{ decision: CognitiveChoice; reasoning: string }> {
        const filePath = error.file;
        const yao = this.hexagramManager.getYaoState?.() || YaoState.YoungYang;
        const isYin = this.hexagramManager.isYin?.() || false;
        
        logger.info({ code: error.code, file: filePath, yao, isYin }, 'Diagnosing error with Cognitive Immunology rules');

        // Cognitive Immunology Phase 1: Chaos Constraint
        if (yao === YaoState.OldMixed) {
            await this.hexagramManager.pinCard(4, 'Immunology Restraint', `Refusing algorithmic auto-repair of [${filePath || error.code}] due to chaotic OldMixed emotional state.`, yao);
            return {
                decision: CognitiveChoice.META,
                reasoning: `Cognitive Immunology Restraint: The node is currently in a chaotic transition (OldMixed). Active architectural rewriting is suspended to prevent runaway entropy.`
            };
        }


        const isPlanned = filePath && (this.isFilePlanned(filePath, plan) || this.isModulePlanned(error.message, plan));
        if (isPlanned) {
            const status = BuildStatus.Passed;
            await this.hexagramManager.pinCard(3, 'Planned Drift', `Acknowledged error in ${filePath} as part of active plan.`, YaoState.YoungYang);
            return {
                decision: CognitiveChoice.SIMPLE,
                reasoning: `Planned Drift: File/Module related to [${filePath}] is referenced in future plan steps. ${status}.`
            };
        }

        const senseCheck = await this.performSenseCheck(error);
        const manifesto = this.architectureDigest.getManifest();
        const domainFiles = Object.values(manifesto.domainModel);
        const isStructural = filePath && domainFiles.some(m => filePath.includes(m.file));

        if (isStructural && senseCheck.severity === 'critical') {
            await this.hexagramManager.pinCard(1, 'Structural Breach', `Critical fault in ${filePath}: ${senseCheck.analysis}`, YaoState.OldYin);
            
            // Cognitive Immunology Phase 2: Meditative Constraints
            if (isYin) {
                 logger.info('System is highly Yin (Receptive). Downgrading critical auto-repair severity to observational.');
                 return {
                     decision: CognitiveChoice.META,
                     reasoning: `Observational Restraint: Critical structural break in [${filePath}], but system is highly Yin. Prioritizing manual developer observation or Read-Only Shell diagnostics over aggressive auto-patching.`
                 };
            }
            
            return {
                decision: CognitiveChoice.META,
                reasoning: `Critical Structural Break: ${error.message} in core manifest file [${filePath}]. Health: ${HealthStatus.Critical}.`
            };
        }

        // Cognitive Immunology Phase 3: Holistic Visual Diagnostic for UI
        const isUI = filePath?.toLowerCase().includes('renderer') || filePath?.toLowerCase().includes('ui') || filePath?.toLowerCase().includes('dashboard');
        if (isUI && !isYin && (this.visionEngine || this.spatialVisionEngine) && this.chromaEngine) {
             logger.info('UI fault detected during assertive Yang state. Invoking Visual/Spatial Sensory array.');
             await this.hexagramManager.pinCard(3, 'Visual Diagnostic', `Deploying Chromanumber and SpatialVision to physically inspect failure in ${filePath}`, yao);
             // We do not await full vision execution here, we just shape the decision heuristic to request physical inspection
             return {
                 decision: CognitiveChoice.EXTERNAL,
                 reasoning: `Somatic Diagnostic Required: Flaw detected in visual component [${filePath}]. Invoking SpatialVisionEngine & Chromanumber UI inspection before attempting an algorithmic patch.`
             };
        }

        await this.hexagramManager.pinCard(3, 'Neural Repair', `Healing ${filePath || 'system'}: ${senseCheck.analysis}`, YaoState.OldYang);

        return {
            decision: CognitiveChoice.SIMPLE,
            reasoning: `Correction Needed: ${senseCheck.analysis}. Status: ${BuildStatus.Warning}. Triggering auto-patch turn via ${this.correctionModel}.`
        };
    }

    private isFilePlanned(filePath: string, plan?: ExecutionPlan): boolean {
        if (!plan) return false;
        return plan.steps.some(step =>
            JSON.stringify(step.args).includes(basename(filePath)) ||
            (step.reasoning && step.reasoning.includes(basename(filePath)))
        );
    }

    private isModulePlanned(errorMessage: string, plan?: ExecutionPlan): boolean {
        if (!plan) return false;
        const match = errorMessage.match(/module '(.+?)'/);
        if (!match) return false;
        const moduleName = match[1]!;
        return plan.steps.some(step =>
            JSON.stringify(step.args).includes(moduleName) ||
            (step.reasoning && step.reasoning.includes(moduleName))
        );
    }

    private async performSenseCheck(error: TSCError): Promise<{ severity: string; analysis: string }> {
        const prompt = `Analyze this TSC error:
        Error: ${error.file}:${error.line} - [${error.code}] ${error.message}
        Determine if this is a minor type fix or a major structural break.
        Format: JSON { "severity": "low|medium|high|critical", "analysis": "concise explanation" }`;

        const result = await this.executor.call({ model: this.correctionModel, prompt });
        if (!result.ok) {
            return { severity: 'medium', analysis: 'Correction handler unavailable.' };
        }

        try {
            const jsonStr = result.value.response.match(/\{[\s\S]*\}/)?.[0] || '{}';
            const json = JSON.parse(jsonStr);
            return {
                severity: json.severity || 'medium',
                analysis: json.analysis || 'Generic type mismatch suspected.'
            };
        } catch {
            return { severity: 'medium', analysis: 'Failed to parse correction analysis.' };
        }
    }

    public async healWithProcess(projectRoot: string): Promise<{ healed: boolean; output: string }> {
        logger.info({ projectRoot }, 'Running biological verification (healWithProcess)');
        try {
            const { stdout, stderr } = await execAsync('npm run build', { cwd: projectRoot, timeout: 60000 });
            return { healed: true, output: stdout + stderr };
        } catch (error: unknown) {
            const err = error as { stdout?: string; stderr?: string };
            return { healed: false, output: (err.stdout || '') + (err.stderr || '') };
        }
    }

    public healthCheck(): { online: boolean; details: string } {
        const digOk = !!this.architectureDigest;
        const hexOk = !!this.hexagramManager;
        return {
            online: digOk && hexOk,
            details: `T-Cell Repair: Digest(${digOk}), Hexagram(${hexOk})`
        };
    }
}
