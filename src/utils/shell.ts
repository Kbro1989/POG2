import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from "./logger.js";

const execAsync = promisify(exec);
const logger = createLogger('SovereignShell');

// â•â•â• ENVIRONMENT SANITIZATION â•â•â•

/**
 * Sensitive key patterns that MUST NOT leak to child processes.
 * Matched against process.env key names (case-insensitive prefix/contains).
 */
const SENSITIVE_PREFIXES = [
    'GEMINI_', 'GOOGLE_API', 'GOOGLE_APPLICATION',
    'OPENROUTER_API', 'FIREWORKS_API', 'HUGGINGFACE_API',
    'CLOUDFLARE_API', 'CLOUDFLARE_AUTH',
    'YOUTUBE_CLIENT', 'YOUTUBE_TOKEN', 'YOUTUBE_API',
    'SSH_KEY', 'PRIMARY_CLOUD_API', 'SECONDARY_CLOUD_API',
    'POG_SECRET', 'CHROMANUMBER_AUTH',
];

const SENSITIVE_CONTAINS = [
    'API_KEY', 'API_TOKEN', 'SECRET', '_TOKEN',
    'CREDENTIALS', 'AUTH_EMAIL',
];

/**
 * Build a sanitized copy of process.env with all sensitive keys removed.
 * POG2 internals already read these into SovereignConfig at boot â€”
 * child shell commands never need them.
 */
function getSanitizedEnv(): NodeJS.ProcessEnv {
    const env = { ...process.env };
    const redacted: string[] = [];

    for (const key of Object.keys(env)) {
        const upper = key.toUpperCase();
        const isSensitive =
            SENSITIVE_PREFIXES.some(p => upper.startsWith(p)) ||
            SENSITIVE_CONTAINS.some(c => upper.includes(c));

        if (isSensitive) {
            delete env[key];
            redacted.push(key);
        }
    }

    if (redacted.length > 0) {
        logger.debug({ count: redacted.length }, 'Redacted sensitive env vars from child process');
    }

    return env;
}

/**
 * $ â€” The Sovereign Shell Utility.
 * A template literal tag for executing shell commands with a clean syntax.
 * Example: await $`wrangler whoami`
 *
 * SECURITY: Child processes receive a SANITIZED copy of process.env.
 * API keys, tokens, and secrets are stripped. POG2 internals use
 * SovereignConfig (loaded at boot) and are unaffected.
 */
export async function $(strings: TemplateStringsArray, ...values: any[]): Promise<{ stdout: string; stderr: string }> {
    const command = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');

    logger.info({ command }, 'Executing Sovereign Shell command');

    try {
        const result = await execAsync(command, {
            timeout: 15000,
            env: getSanitizedEnv()
        });
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
