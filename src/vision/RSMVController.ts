import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { spawn } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import type { Result, ActuationResult } from '../core/models.js';
import { getRSMVCachePath } from '../utils/SovereignPathResolver.js';

const logger = createLogger('RSMVController');

export interface ModelModifications {
    replaceColors?: [from: number, to: number][];
    replaceMaterials?: [from: number, to: number][];
    lodLevel?: number;
    animationId?: number;
}

/**
 * RSMVController — CNS Bridge for the RSMV 3D substrate.
 * Manages the inspector child process and coordinates exports.
 */
export class RSMVController {
    private activeProcess: any = null;

    constructor() { }

    /**
     * Open a model in the RSMV viewer via one-shot CLI.
     */
    public async viewModel(modelId: string, mods?: ModelModifications): Promise<Result<ActuationResult>> {
        logger.info({ modelId, mods }, 'Requesting RSMV model view');

        try {
            const cachePath = getRSMVCachePath();
            const args = [
                'tsx', 'rsmv/src/headless/cli.ts',
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
    public async exportGltf(modelId: string, outputPath: string, mods?: ModelModifications): Promise<Result<ActuationResult>> {
        logger.info({ modelId, outputPath, mods }, 'Executing 3D export actuation');

        try {
            const cachePath = getRSMVCachePath();
            const args = [
                'tsx', 'rsmv/src/headless/cli.ts',
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
                env: { ...process.env, POG_RSMV_CACHE_DIR: cachePath }
            });

            return new Promise((resolve) => {
                subprocess.on('exit', async (code) => {
                    if (code === 0) {
                        try {
                            const profilePath = join(process.cwd(), 'rsmv', 'pedagogy_profile.json');
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

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        // Basic check: Ensure rsmv/src/cli.ts exists
        const { existsSync } = await import('fs');
        const { join } = await import('path');
        const substrateStatus = existsSync(join(process.cwd(), 'rsmv', 'src', 'headless', 'cli.ts'));
        return {
            online: substrateStatus,
            details: substrateStatus ? 'RSMV CLI substrate verified.' : 'RSMV CLI substrate missing or unlinked.'
        };
    }
}
