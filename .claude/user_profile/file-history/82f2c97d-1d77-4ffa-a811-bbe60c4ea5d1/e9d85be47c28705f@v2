import { writeFileSync, appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../../utils/logger.js';
import { CacheInvalidationListener, CacheWatcherLimb } from '../spatial/CacheWatcherLimb.js';
import { resolveSovereignPath } from '../../utils/SovereignPathResolver.js';
import { CompressionEngine } from '../../utils/CompressionEngine.js';

const logger = createLogger('PedagogyDistiller');

export interface InstructionPair {
  instruction: string;      // "What is the translation for male hairstyle 5?"
  input: string;            // Context from grounding registry or schema metadata
  output: string;           // Direct response
  source: string;           // Source identifier for provenance tracing
  confidence: number;       // Confidence score 0.0-1.0
  timestamp: number;
}

/**
 * PedagogyDistiller - Converts pedagogy observations and schema diffs into high-signal instruction pairs.
 * Acts as the continuous auto-distillation bridge to Workers AI LoRA training datasets.
 */
export class PedagogyDistiller implements CacheInvalidationListener {
  private static instance: PedagogyDistiller;
  private corpusPath: string;

  private constructor() {
    this.corpusPath = resolveSovereignPath('memory/pedagogy_training_corpus.jsonl');
    this.registerWithWatcher();
  }

  public static getInstance(): PedagogyDistiller {
    if (!PedagogyDistiller.instance) {
      PedagogyDistiller.instance = new PedagogyDistiller();
    }
    return PedagogyDistiller.instance;
  }

  private registerWithWatcher(): void {
    try {
      const watcher = CacheWatcherLimb.getInstance();
      // Listen to enums (17), clientscripts (11), and varbits (45)
      watcher.registerListener(17, this);
      watcher.registerListener(11, this);
      watcher.registerListener(45, this);
      logger.info('PedagogyDistiller registered successfully with CacheWatcherLimb for majors: 11, 17, 45.');
    } catch (e) {
      logger.warn({ err: e }, 'Failed to auto-register PedagogyDistiller with CacheWatcherLimb.');
    }
  }

  /**
   * addInstructionPair - Manually appends a structured instruction pair to the corpus.
   */
  public async addInstructionPair(pair: InstructionPair): Promise<void> {
    await this.appendPairsToCorpus([pair]);
    logger.info({ source: pair.source }, 'Manually added instruction pair to training corpus.');
  }

  /**
   * onCacheInvalidated - Satisfies the CacheInvalidationListener contract.
   * Converts detected invalidation events into structured instruction pairs.
   */
  public async onCacheInvalidated(majorIndex: number, details: string): Promise<void> {
    logger.info({ majorIndex, details }, 'PedagogyDistiller received cache invalidation signal. Beginning distillation...');
    
    let pairs: InstructionPair[] = [];

    switch (majorIndex) {
      case 17:
        pairs = await this.distillEnums(details);
        break;
      case 11:
        pairs = await this.distillClientscripts(details);
        break;
      case 45:
        pairs = await this.distillVarbits(details);
        break;
      default:
        pairs = [this.createGenericPair(majorIndex, details)];
    }

    if (pairs.length > 0) {
      await this.appendPairsToCorpus(pairs);
      logger.info({ count: pairs.length }, 'Successfully distilled and archived new instruction pairs in the training corpus.');
    }
  }

  /**
   * distillEnums - Distills active Jagex enum updates into semantic mappings instructions.
   */
  private async distillEnums(details: string): Promise<InstructionPair[]> {
    const pairs: InstructionPair[] = [];
    const timestamp = Date.now();

    try {
      // Dynamic import to fetch the newly generated AppearanceEnums mapping!
      const modulePath = '../../generated/cache-schemas/AppearanceEnums.js';
      const enums = await import(`${modulePath}?t=${timestamp}`);

      if (enums) {
        if (enums.FemaleHairStyles) {
          const count = Object.keys(enums.FemaleHairStyles).length;
          pairs.push({
            instruction: "Translate female hairstyle indexes to Jagex semantic style names.",
            input: `Active female hairstyle catalog containing ${count} entries.`,
            output: JSON.stringify(enums.FemaleHairStyles),
            source: "CacheWatcherLimb:major17:FemaleHairStyles",
            confidence: 1.0,
            timestamp
          });
        }
        if (enums.MaleHairStyles) {
          const count = Object.keys(enums.MaleHairStyles).length;
          pairs.push({
            instruction: "Translate male hairstyle indexes to Jagex semantic style names.",
            input: `Active male hairstyle catalog containing ${count} entries.`,
            output: JSON.stringify(enums.MaleHairStyles),
            source: "CacheWatcherLimb:major17:MaleHairStyles",
            confidence: 1.0,
            timestamp
          });
        }
        if (enums.BeardNames) {
          const count = Object.keys(enums.BeardNames).length;
          pairs.push({
            instruction: "Translate beard style indexes to Jagex semantic beard style names.",
            input: `Active beard style name catalog containing ${count} entries.`,
            output: JSON.stringify(enums.BeardNames),
            source: "CacheWatcherLimb:major17:BeardNames",
            confidence: 1.0,
            timestamp
          });
        }
        if (enums.BeardStyles) {
          const count = Object.keys(enums.BeardStyles).length;
          pairs.push({
            instruction: "Translate beard index values to direct physical model template IDs.",
            input: `Active beard index-to-model mapping containing ${count} entries.`,
            output: JSON.stringify(enums.BeardStyles),
            source: "CacheWatcherLimb:major17:BeardStyles",
            confidence: 0.95,
            timestamp
          });
        }
      }
    } catch (e) {
      logger.warn({ err: e }, 'Could not read generated appearance enums for distillation; utilizing details fallback.');
      pairs.push({
        instruction: "Predict cache enum updates based on cache invalidation telemetry.",
        input: `Enum update details: ${details}`,
        output: "Registering enum updates for target ids: FemaleHairStyles (6796), MaleHairStyles (16883), BeardStyles (17158).",
        source: "CacheWatcherLimb:major17:Fallback",
        confidence: 0.8,
        timestamp
      });
    }

    return pairs;
  }

  /**
   * distillClientscripts - Ingests checksum updates and script-level changes.
   */
  private async distillClientscripts(details: string): Promise<InstructionPair[]> {
    const timestamp = Date.now();
    return [{
      instruction: "Predict baseline clientscript telemetry drift from Jagex engine updates.",
      input: `Cache watchers detected active modifications in clientscripts archive: ${details}`,
      output: "Update script mappings: priority scripts 7888 (Varbit trigger), 7893 (Appearance selection), 28557 (Avatar randomizer) evaluated.",
      source: "CacheWatcherLimb:major11:ClientScripts",
      confidence: 0.9,
      timestamp
    }];
  }

  /**
   * distillVarbits - Generates layout expectations from varbit archives.
   */
  private async distillVarbits(details: string): Promise<InstructionPair[]> {
    const timestamp = Date.now();
    return [{
      instruction: "Retrieve player morphology varbit configuration layouts.",
      input: `Varbit archive modification detected: ${details}`,
      output: "Configure morphology control varbits under Varp 5745 (bits 0-2 for body base, 3-5 for torso legs, 6-8 for body gender).",
      source: "CacheWatcherLimb:major45:Varbits",
      confidence: 0.95,
      timestamp
    }];
  }

  private createGenericPair(majorIndex: number, details: string): InstructionPair {
    return {
      instruction: `Predict cache structure invalidations and transitions for major index ${majorIndex}.`,
      input: `Cache watcher event details: ${details}`,
      output: `Cache major index ${majorIndex} has been modified on disk. System state re-evaluated.`,
      source: `CacheWatcherLimb:major${majorIndex}:Generic`,
      confidence: 0.7,
      timestamp: Date.now()
    };
  }

  /**
   * appendPairsToCorpus - Formats and appends instruction pairs as JSONL records.
   */
  private async appendPairsToCorpus(pairs: InstructionPair[]): Promise<void> {
    try {
      const parentDir = join(this.corpusPath, '..');
      if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true });
      }

      const compressor = CompressionEngine.getInstance();

      for (const pair of pairs) {
        const compressedPair = compressor.compress(pair);
        const line = JSON.stringify(compressedPair) + '\n';
        appendFileSync(this.corpusPath, line, 'utf8');
      }
    } catch (e) {
      logger.error({ err: e, path: this.corpusPath }, 'Failed to append instruction pairs to training corpus.');
    }
  }

  /**
   * exportTrainingCorpus - Returns the corpus path and logs the size.
   */
  public exportTrainingCorpus(): string {
    if (existsSync(this.corpusPath)) {
      const content = readFileSync(this.corpusPath, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      logger.info({ count: lines.length, path: this.corpusPath }, 'Training corpus exported successfully.');
    }
    return this.corpusPath;
  }
}
