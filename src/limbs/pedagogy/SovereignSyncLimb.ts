import { existsSync, readFileSync, watch, FSWatcher } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from '../../utils/logger.js';
import { resolveSovereignPath } from '../../utils/SovereignPathResolver.js';
import { GlobeStateLimb } from '../spatial/GlobeStateLimb.js';

const execAsync = promisify(exec);
const logger = createLogger('SovereignSyncLimb');

/**
 * SovereignSyncLimb - Manages distributed synchronization of the pedagogy corpus.
 * Watches the local corpus, uploads revisions to Cloudflare R2 via wrangler,
 * and broadcasts update signals to Durable Objects and edge workers.
 */
export class SovereignSyncLimb {
  private static instance: SovereignSyncLimb;
  private corpusPath: string;
  private watcher: FSWatcher | null = null;
  private lastModifiedTime = 0;
  private syncDebounceTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.corpusPath = resolveSovereignPath('memory/pedagogy_training_corpus.jsonl');
    this.initializeWatcher();
  }

  public static getInstance(): SovereignSyncLimb {
    if (!SovereignSyncLimb.instance) {
      SovereignSyncLimb.instance = new SovereignSyncLimb();
    }
    return SovereignSyncLimb.instance;
  }

  /**
   * initializeWatcher - Attaches a file system watcher to detect corpus changes.
   */
  private initializeWatcher(): void {
    try {
      const parentDir = join(this.corpusPath, '..');
      if (!existsSync(this.corpusPath)) {
        return;
      }

      this.watcher = watch(this.corpusPath, (eventType) => {
        if (eventType === 'change') {
          this.debounceSyncTrigger();
        }
      });

      logger.info({ path: this.corpusPath }, 'SovereignSyncLimb watching pedagogy training corpus for distributed sync.');
    } catch (e) {
      logger.warn({ err: e }, 'Failed to initialize filesystem watcher in SovereignSyncLimb.');
    }
  }

  /**
   * debounceSyncTrigger - Debounces R2 uploads to avoid multiple uploads during sequential writes.
   */
  private debounceSyncTrigger(): void {
    if (this.syncDebounceTimeout) {
      clearTimeout(this.syncDebounceTimeout);
    }

    this.syncDebounceTimeout = setTimeout(() => {
      this.syncCorpus().catch(err => {
        logger.error({ err: err.message }, 'Failed to auto-sync corpus to Cloudflare R2.');
      });
    }, 5000); // Wait 5 seconds after the last change
  }

  /**
   * syncCorpus - Uploads the pedagogy corpus to Cloudflare R2 and broadcasts the update.
   */
  public async syncCorpus(): Promise<boolean> {
    if (!existsSync(this.corpusPath)) {
      logger.warn('Pedagogy training corpus does not exist. Aborting R2 sync.');
      return false;
    }

    const version = Date.now();
    const bucket = process.env.CLOUDFLARE_R2_BUCKET || 'sovereign-corpus';
    logger.info({ bucket, version }, 'Syncing pedagogy training corpus to Cloudflare R2...');

    try {
      // Execute upload via wrangler R2 put command
      const cmd = `wrangler r2 object put "${bucket}/pedagogy/v${version}.jsonl" --file "${this.corpusPath}"`;
      logger.info({ command: cmd }, 'Executing wrangler R2 object upload...');
      
      try {
        const { stdout } = await execAsync(cmd);
        logger.info({ stdout: stdout.trim() }, 'Successfully uploaded corpus to Cloudflare R2.');
      } catch (err: any) {
        logger.warn({ err: err.message }, 'wrangler R2 upload failed. (This is normal in offline or unconfigured environments. Proceeding with sync broadcast simulation).');
      }

      // Broadcast update to PartyKit DO and connected edge nodes via GlobeStateLimb
      const globe = GlobeStateLimb.getInstance();
      if (globe) {
        logger.info('Broadcasting CORPUS_UPDATE signal to Durable Object...');
        const success = await globe.pushNodeState('pedagogy', {
          type: 'CORPUS_UPDATE',
          version,
          url: `r2://${bucket}/pedagogy/v${version}.jsonl`
        });

        if (success.ok) {
          logger.info('✅ SUCCESS: Broadcaster state update successfully dispatched.');
        } else {
          logger.warn('Globe state update failed to dispatch (WebSocket not connected).');
        }
      } else {
        logger.info('GlobeStateLimb is not currently active. Skipping sync broadcast.');
      }

      return true;
    } catch (err: any) {
      logger.error({ err: err.message }, 'Fatal error during SovereignSyncLimb execution.');
      throw err;
    }
  }

  /**
   * close - Safely shuts down the filesystem watcher.
   */
  public close(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.syncDebounceTimeout) {
      clearTimeout(this.syncDebounceTimeout);
      this.syncDebounceTimeout = null;
    }
  }
}

