import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import pino from 'pino';
import { type Result, ok } from '../../core/models.js';
import { ModelClient } from '../../clients/ModelClient.js';

const logger = pino({ name: 'MediaForgeLimb', base: { hostname: 'POG2' } });

export interface MediaForgeOptions {
    prompt: string;
    outputPath: string;
    model?: string;
    num_steps?: number;
}

/**
 * MediaForgeLimb - Sovereign Media Synthesis
 * Implements real Flux/SD image generation substrate.
 * NO MOCKS. NO PLACEHOLDERS.
 */
export class MediaForgeLimb {
    constructor(private readonly client: ModelClient) { }

    /**
     * generate - Synthesizes a new image from a text prompt.
     */
    public async generate(options: MediaForgeOptions): Promise<Result<{ path: string; bytes: number }>> {
        const { prompt, outputPath, model, num_steps } = options;

        logger.info({ model: model || 'default-flux', prompt: prompt.substring(0, 50) }, 'Synthesizing media artifact...');

        // Ensure directory exists
        const outputDir = dirname(outputPath);
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        // Call Cloudflare AI via ModelClient
        const result = await this.client.callCloudflareImageGen({
            prompt,
            model,
            num_steps
        });

        if (!result.ok) {
            logger.error({ error: result.error?.message }, 'Media synthesis failed.');
            return { ok: false, error: result.error };
        }

        const buffer = result.value;
        try {
            writeFileSync(outputPath, buffer);
            const bytes = buffer.length;

            logger.info({ path: outputPath, bytes }, 'Media synthesis complete and saved to disk.');
            return ok({ path: outputPath, bytes });
        } catch (err) {
            logger.error({ err }, 'Failed to write synthesized media to disk.');
            return { ok: false, error: err as Error };
        }
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        // We can't easily check 'Flux' health without a call, 
        // but we can check if credentials exist in the client.
        const config = this.client.config;
        const hasCredentials = !!(config.cloudflareAccountId && config.cloudflareApiToken);

        return {
            online: true,
            details: hasCredentials
                ? 'Cloudflare AI Substrate: CONFIGURED'
                : 'Cloudflare AI Substrate: DORMANT (Missing Credentials)'
        };
    }
}
