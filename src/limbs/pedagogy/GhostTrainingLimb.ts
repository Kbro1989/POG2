import { existsSync, readFileSync, writeFileSync, mkdirSync, watch, FSWatcher } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from '../../utils/logger.js';
import { resolveSovereignPath } from '../../utils/SovereignPathResolver.js';
import { ModelRolodex } from '../../api/ai/ModelRolodex.js';

const execAsync = promisify(exec);
const logger = createLogger('GhostTrainingLimb');

/**
 * GhostTrainingLimb - Manages local Ollama model compilation and few-shot calibration.
 * Translates the pedagogy JSONL corpus into a Modelfile and builds 'pog2-pedagogy:latest'.
 */
export class GhostTrainingLimb {
  private static instance: GhostTrainingLimb;
  private corpusPath: string;
  private modelfilePath: string;
  private watcher: FSWatcher | null = null;
  private lastLineCount = 0;
  private buildThreshold = 5; // Re-build when 5 or more new instruction pairs are added

  private constructor() {
    this.corpusPath = resolveSovereignPath('memory/pedagogy_training_corpus.jsonl');
    this.modelfilePath = resolveSovereignPath('memory/Modelfile');
    this.initializeWatcher();
  }

  public static getInstance(): GhostTrainingLimb {
    if (!GhostTrainingLimb.instance) {
      GhostTrainingLimb.instance = new GhostTrainingLimb();
    }
    return GhostTrainingLimb.instance;
  }

  /**
   * initializeWatcher - Binds a filesystem watcher to the pedagogy training corpus.
   */
  private initializeWatcher(): void {
    try {
      const parentDir = join(this.corpusPath, '..');
      if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true });
      }

      // Load initial line count
      if (existsSync(this.corpusPath)) {
        this.lastLineCount = this.getCorpusLineCount();
      }

      this.watcher = watch(parentDir, (eventType, filename) => {
        if (filename === 'pedagogy_training_corpus.jsonl') {
          this.evaluateTelemetryDelta();
        }
      });

      logger.info({ path: this.corpusPath }, 'GhostTrainingLimb watching pedagogy training corpus.');
    } catch (e) {
      logger.warn({ err: e }, 'Failed to initialize filesystem watcher in GhostTrainingLimb.');
    }
  }

  /**
   * evaluateTelemetryDelta - Compares current lines vs last built and triggers auto-retraining.
   */
  private evaluateTelemetryDelta(): void {
    if (!existsSync(this.corpusPath)) return;
    const currentLines = this.getCorpusLineCount();
    const delta = currentLines - this.lastLineCount;

    if (delta >= this.buildThreshold) {
      logger.info({ delta, currentLines }, 'Pedagogy corpus threshold met. Triggering auto-compilation...');
      this.triggerOllamaSynthesis().catch(err => {
        logger.error({ err }, 'Auto-compilation of local Ollama model failed.');
      });
      this.lastLineCount = currentLines;
    }
  }

  private getCorpusLineCount(): number {
    try {
      const data = readFileSync(this.corpusPath, 'utf8');
      return data.trim().split('\n').filter(Boolean).length;
    } catch {
      return 0;
    }
  }

  /**
   * triggerOllamaSynthesis - Builds the Modelfile and triggers 'ollama create pog2-pedagogy'.
   */
  public async triggerOllamaSynthesis(): Promise<boolean> {
    logger.info('Compiling Modelfile from pedagogy corpus...');

    if (!existsSync(this.corpusPath)) {
      logger.warn('Pedagogy training corpus is empty or does not exist. Aborting build.');
      return false;
    }

    try {
      const lines = readFileSync(this.corpusPath, 'utf8').trim().split('\n').filter(Boolean);
      
      // Determine base model from environment or safe default
      const baseModel = process.env.OLLAMA_MODEL_FAST || 'qwen2.5-coder:1.5b-instruct-q4_K_M';

      let modelfileContent = `FROM ${baseModel}

# Set temperature and context size for precision cache archaeology
PARAMETER temperature 0.2
PARAMETER num_ctx 8192

# Authoritative POG2 Cache Archeology System Prompt
SYSTEM """
You are the authoritative POG2 Cache Archaeology model.
You specialize in translating RS3/Beta cache entities, clientscripts, varbits, and enums.
Your knowledge is continuously distilled from active Jagex cache updates.
Use the following instruction pairs as your base knowledge substrate.
"""
`;

      // Inject distilled instruction pairs as MESSAGE examples
      for (const line of lines) {
        try {
          const record = JSON.parse(line);
          const cleanInstruction = record.instruction.replace(/"/g, '\\"');
          const cleanInput = record.input.replace(/"/g, '\\"');
          const cleanOutput = record.output.replace(/"/g, '\\"');

          modelfileContent += `\nMESSAGE user "Instruction: ${cleanInstruction}\\nInput Context: ${cleanInput}"\n`;
          modelfileContent += `MESSAGE assistant "${cleanOutput}"\n`;
        } catch (e) {
          logger.warn({ line }, 'Skipping malformed corpus line.');
        }
      }

      // Write Modelfile to disk
      writeFileSync(this.modelfilePath, modelfileContent, 'utf8');
      logger.info({ path: this.modelfilePath }, 'Modelfile generated successfully.');

      // Execute local Ollama model compilation
      logger.info('Executing ollama create pog2-pedagogy...');
      const { stdout } = await execAsync(`ollama create pog2-pedagogy -f "${this.modelfilePath}"`);
      logger.info({ stdout: stdout.trim() }, 'Ollama model compilation completed.');

      // Trigger hot-refresh in ModelRolodex to immediately discover pog2-pedagogy!
      logger.info('Refreshing ModelRolodex to register local sovereign model...');
      try {
        const rolodex = ModelRolodex.getInstance?.();
        if (rolodex) {
          await rolodex.refreshAll();
        }
      } catch (err) {
        logger.warn({ err }, 'Failed to automatically refresh ModelRolodex; discovery will occur on next interval.');
      }

      return true;
    } catch (err: any) {
      logger.error({ err: err.message }, 'Failed to trigger Ollama pedagogy model compilation.');
      throw err;
    }
  }

  /**
   * close - Closes the file watcher cleanly.
   */
  public close(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
