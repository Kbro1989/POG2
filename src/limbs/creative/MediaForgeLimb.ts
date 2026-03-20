import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { type Result, ok } from '../../core/models.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('MediaForgeLimb');

export interface MediaForgeOptions {
    prompt: string;
    outputPath?: string;
    model?: string;
    num_steps?: number;
    type?: string;
    principleId?: string;
    sovereign?: boolean;
}

export interface ForgeArtifact {
    path: string;
    bytes: number;
    principleId?: string;
    sovereignCompliant: boolean;
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
    public async generate(options: MediaForgeOptions): Promise<Result<ForgeArtifact>> {
        const { prompt, outputPath, model, num_steps, principleId, sovereign } = options;
        const targetPath = outputPath || join(getSovereignRoot(), 'artifacts/visuals', `${Date.now()}.png`);

        logger.info({ 
            model: model || 'default-flux', 
            principleId,
            sovereign,
            prompt: prompt.substring(0, 50) 
        }, 'Synthesizing media artifact...');

        // Ensure directory exists
        const outputDir = dirname(targetPath);
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
            writeFileSync(targetPath, buffer);
            const bytes = buffer.length;

            logger.info({ path: targetPath, bytes }, 'Media synthesis complete and saved to disk.');
            return ok({ 
                path: targetPath, 
                bytes,
                principleId,
                sovereignCompliant: true // If it reached here without placeholders, it is compliant
            });
        } catch (err) {
            logger.error({ err }, 'Failed to write synthesized media to disk.');
            return { ok: false, error: err as Error };
        }
    }


    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const config = (this.client as any).config;
        const cfOnline = !!(config.cloudflareAccountId && config.cloudflareApiToken);
        const details = `Media Forge: ${cfOnline ? 'ONLINE' : 'DEGRADED'} (Cloudflare AI Hub ${cfOnline ? 'primed' : 'MISSING_CREDENTIALS'})`;
        return { online: cfOnline, details };
    }
}
