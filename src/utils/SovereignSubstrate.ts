/**
 * SovereignSubstrate.ts
 *
 * Interface for live substrate extraction from the cache via rsmv forensics.
 * Used by NpcCollector and ItemCollector to ensure data is dynamic and cache-accurate.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export class SovereignSubstrate {
    private static RSMV_ROOT = 'D:\\pog2\\rsmv_inspector';

    /**
     * Executes a low-level cache extraction script to fetch real-time entity data.
     */
    public static async extractEntityData<T>(scriptName: string, type: string, entityId: number): Promise<T | null> {
        const scriptPath = path.join(this.RSMV_ROOT, 'src', 'scripts', scriptName);
        
        try {
            // Invokes the script via ts-node with the new type argument.
            const { stdout } = await execAsync(`npx ts-node ${scriptPath} --type ${type} --id ${entityId}`);
            return JSON.parse(stdout) as T;
        } catch (e) {
            console.error(`[SovereignSubstrate] Extraction failed for ${type}/${entityId} via ${scriptName}:`, e);
            return null;
        }
    }
}
