import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { spawn } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import type { Result, ActuationResult } from '../core/models.js';
import { getrsmvCachePath, getrsmvSubstratePath } from '../utils/SovereignPathResolver.js';

const logger = createLogger('rsmvController');

export interface ModelModifications {
    replaceColors?: [from: number, to: number][];
    replaceMaterials?: [from: number, to: number][];
    lodLevel?: number;
    animationId?: number;
}

/**
 * rsmvController â€” CNS Bridge for the rsmv 3D substrate.
 * Manages the inspector child process and coordinates exports.
 */
export class RSMVController {
    private static instance: RSMVController | undefined;
    private activeProcess: any = null;

    private constructor() {
        if (RSMVController.instance) {
            throw new Error('Singleton violation: use RSMVController.getInstance()');
        }
    }

    public static getInstance(): RSMVController {
        if (!this.instance) {
            this.instance = new RSMVController();
        }
        return this.instance;
    }

    public static resetInstance(): void {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('resetInstance is forbidden in production');
        }
        this.instance = undefined;
    }

    /**
     * Open a model in the rsmv viewer via one-shot CLI.
     */
    public async viewModel(modelId: string, mods?: ModelModifications): Promise<Result<ActuationResult>> {
        logger.info({ modelId, mods }, 'Requesting rsmv model view');

        try {
            const cachePath = getrsmvCachePath();
            const args = [
                'tsx', join(getrsmvSubstratePath(), 'src', 'headless', 'cli.ts'),
                '--model', modelId,
                '--source', `cache:${cachePath}`,
                '--analyze'
            ];

            if (mods?.replaceColors) {
                args.push('--colors', JSON.stringify(mods.replaceColors));
            }
            if (mods?.replaceMaterials) {
                args.push('--materials', JSON.stringify(mods.replaceMaterials));
            }
            if (mods?.animationId !== undefined) {
                args.push('--anim', mods.animationId.toString());
            }

            const subprocess = spawn('npx', args, {
                stdio: 'inherit',
                shell: true,
                env: { ...process.env, POG_rsmv_CACHE_DIR: cachePath }
            });

            this.activeProcess = subprocess;

            subprocess.on('exit', (code) => {
                logger.info({ code }, 'rsmv process exited');
                this.activeProcess = null;
            });

            return {
                ok: true,
                value: { success: true, details: `rsmv launched for model ${modelId}` }
            };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Coordinate GLTF export from the 3D substrate.
     */
    public async exportGltf(modelId: string, outputPath: string, mods?: ModelModifications): Promise<Result<ActuationResult>> {
        logger.info({ modelId, outputPath, mods }, 'Executing 3D export actuation');

        try {
            const cachePath = getrsmvCachePath();
            const args = [
                'tsx', join(getrsmvSubstratePath(), 'src', 'headless', 'cli.ts'),
                '--model', modelId,
                '--source', `cache:${cachePath}`,
                '--analyze'
            ];

            if (mods?.replaceColors) {
                args.push('--colors', JSON.stringify(mods.replaceColors));
            }
            if (mods?.replaceMaterials) {
                args.push('--materials', JSON.stringify(mods.replaceMaterials));
            }
            if (mods?.animationId !== undefined) {
                args.push('--anim', mods.animationId.toString());
            }

            // Use the headless CLI with proper source mapping
            const subprocess = spawn('npx', args, {
                stdio: 'inherit',
                shell: true,
                env: { ...process.env, POG_rsmv_CACHE_DIR: cachePath }
            });

            return new Promise((resolve) => {
                subprocess.on('exit', async (code) => {
                    if (code === 0) {
                        try {
                            const profilePath = join(getrsmvSubstratePath(), 'pedagogy_profile.json');
                            let profile = null;
                            if (existsSync(profilePath)) {
                                const profileStr = await fs.readFile(profilePath, 'utf8');
                                profile = JSON.parse(profileStr);
                            }
                            resolve({
                                ok: true,
                                value: {
                                    success: true,
                                    details: `Exported model ${modelId} to ${outputPath}`,
                                    data: { profile }
                                }
                            });
                        } catch (e) {
                            resolve({
                                ok: true,
                                value: {
                                    success: true,
                                    details: `Exported model ${modelId} but profile capture failed: ${(e as Error).message}`
                                }
                            });
                        }
                    } else {
                        resolve({ ok: false, error: new Error(`Export failed with code ${code}`) });
                    }
                });
            });
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    public async healthCheck(): Promise<{ online: boolean; details: string; status?: string }> {
        const { existsSync } = await import('fs');
        const substrateRoot = getrsmvSubstratePath();
        const cliPath = join(substrateRoot, 'src', 'headless', 'cli.ts');

        const rootExists = existsSync(substrateRoot);
        const cliExists = existsSync(cliPath);

        if (cliExists) {
            return {
                online: true,
                status: 'ONLINE',
                details: 'rsmv CLI substrate verified.'
            };
        }

        if (rootExists) {
            return {
                online: true,
                status: 'DEGRADED',
                details: 'rsmv substrate folder found, but cli.ts is missing (Limited Perception).'
            };
        }

        return {
            online: false,
            status: 'OFFLINE',
            details: 'rsmv substrate missing or unlinked.'
        };
    }
}
