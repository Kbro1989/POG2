import { exec } from 'child_process';
import { promisify } from 'util';
import pino from 'pino';

const execAsync = promisify(exec);
const logger = pino({ name: 'SovereignShell', base: { hostname: 'POG2' } });

/**
 * $ — The Sovereign Shell Utility.
 * A template literal tag for executing shell commands with a clean syntax.
 * Example: await $`wrangler whoami`
 */
export async function $(strings: TemplateStringsArray, ...values: any[]): Promise<{ stdout: string; stderr: string }> {
    const command = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
    
    logger.info({ command }, 'Executing Sovereign Shell command');
    
    try {
        const result = await execAsync(command, { timeout: 15000 });
        return {
            stdout: result.stdout.trim(),
            stderr: result.stderr.trim()
        };
    } catch (error: any) {
        logger.error({ command, error: error.message }, 'Shell command failed');
        return {
            stdout: (error.stdout || '').trim(),
            stderr: (error.stderr || '').trim()
        };
    }
}
