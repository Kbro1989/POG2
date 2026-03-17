import { spawn } from 'child_process';
import { createLogger } from '../utils/logger.js';
import type { Result, ActuationResult } from '../core/models.js';
import { getRSMVCachePath } from '../utils/SovereignPathResolver.js';

const logger = createLogger('RSMVController');

/**
 * RSMVController — CNS Bridge for the RSMV 3D substrate.
 * Manages the inspector child process and coordinates exports.
 */
export class RSMVController {
    private activeProcess: any = null;

    constructor() {}

    /**
     * Open a model in the RSMV viewer via one-shot CLI.
     */
    public async viewModel(modelId: string): Promise<Result<ActuationResult>> {
        logger.info({ modelId }, 'Requesting RSMV model view');
        
        try {
            const cachePath = getRSMVCachePath();
            // Use the headless CLI for automated rendering
            const subprocess = spawn('npx', ['tsx', 'tmp_rsmv_inspect/src/headless/cli.ts', '--model', modelId, '--source', `cache:${cachePath}`], {
                stdio: 'inherit',
                shell: true,
                env: { ...process.env, POG_RSMV_CACHE_DIR: cachePath }
            });

            this.activeProcess = subprocess;

            subprocess.on('exit', (code) => {
                logger.info({ code }, 'RSMV process exited');
                this.activeProcess = null;
            });

            return { 
                ok: true, 
                value: { success: true, details: `RSMV launched for model ${modelId}` } 
            };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Coordinate GLTF export from the 3D substrate.
     */
    public async exportGltf(modelId: string, outputPath: string): Promise<Result<ActuationResult>> {
        logger.info({ modelId, outputPath }, 'Executing 3D export actuation');
        
        try {
            const cachePath = getRSMVCachePath();
            // Use the headless CLI with proper source mapping
            const subprocess = spawn('npx', [
                'tsx', 'tmp_rsmv_inspect/src/headless/cli.ts', 
                '--model', modelId, 
                '--source', `cache:${cachePath}`
            ], {
                stdio: 'inherit',
                shell: true,
                env: { ...process.env, POG_RSMV_CACHE_DIR: cachePath }
            });

            return new Promise((resolve) => {
                subprocess.on('exit', (code) => {
                    if (code === 0) {
                        resolve({ ok: true, value: { success: true, details: `Exported model ${modelId} to ${outputPath}` } });
                    } else {
                        resolve({ ok: false, error: new Error(`Export failed with code ${code}`) });
                    }
                });
            });
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    public async healthCheck(): Promise<boolean> {
        // Basic check: Ensure tmp_rsmv_inspect/src/cli.ts exists
        const { existsSync } = await import('fs');
        const { join } = await import('path');
        return existsSync(join(process.cwd(), 'tmp_rsmv_inspect', 'src', 'cli.ts'));
    }
}
