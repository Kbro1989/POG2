import { type Result } from '../core/models.js';

const logger = createLogger('GoogleServices');

export interface GoogleServiceConfig {
    apiKey: string;
    projectId?: string;
    region?: string;
}

import { ImageAnnotatorClient } from '@google-cloud/vision';
import { v2 } from '@google-cloud/translate';
const { Translate } = v2;
import { LanguageServiceClient } from '@google-cloud/language';
import { createLogger } from "../utils/logger.js";

/**
 * GoogleServices - Unified Google API Substrate
 */
export class GoogleServices {
    protected readonly config: GoogleServiceConfig;
    private readonly visionClient?: ImageAnnotatorClient;
    private readonly translateClient?: unknown;
    private readonly nlClient?: LanguageServiceClient;

    constructor(config: GoogleServiceConfig) {
        this.config = config;

        const authOptions = config.apiKey ? { apiKey: config.apiKey } : {};

        // 1. Vision Client (gRPC)
        try {
            this.visionClient = new ImageAnnotatorClient(authOptions);
        } catch (e) {
            logger.warn({ error: (e as Error).message, client: 'Vision' }, 'GCloud Sensory Client failure - Fallback active');
        }

        // 2. Translate Client (REST v2)
        try {
            this.translateClient = new Translate(authOptions);
        } catch (e) {
            logger.warn({ error: (e as Error).message, client: 'Translate' }, 'GCloud Sensory Client failure - Fallback active');
        }

        // 3. NL Client (gRPC)
        try {
            this.nlClient = new LanguageServiceClient(authOptions);
        } catch (e) {
            logger.warn({ error: (e as Error).message, client: 'NL' }, 'GCloud Sensory Client failure - Fallback active');
        }
    }

    /**
     * Standardized error classification for Google APIs
     */
    protected classifyError(error: unknown): { isQuota: boolean; isAuth: boolean; message: string } {
        const message = error instanceof Error ? error.message : String(error);
        const lowerMessage = message.toLowerCase();

        return {
            isQuota: lowerMessage.includes('429') || lowerMessage.includes('quota'),
            isAuth: lowerMessage.includes('401') || lowerMessage.includes('403') || lowerMessage.includes('unauthorized'),
            message
        };
    }

    /**
     * Analyze image using Google Vision API
     */
    async analyzeImage(buffer: Buffer): Promise<Result<unknown>> {
        if (!this.visionClient) return { ok: false, error: new Error('Vision Client not initialized') };

        try {
            const [result] = await this.visionClient.annotateImage({
                image: { content: buffer },
                features: [
                    { type: 'TEXT_DETECTION' },
                    { type: 'LABEL_DETECTION' },
                    { type: 'OBJECT_LOCALIZATION' }
                ]
            });
            return { ok: true, value: result };
        } catch (error) {
            logger.error({ error }, 'Vision API call failed');
            return { ok: false, error: error as Error };
        }
    }

    /**
     * Translate text using Google Translation API
     */
    async translateText(text: string, target: string): Promise<Result<string>> {
        if (!this.translateClient) return { ok: false, error: new Error('Translate Client not initialized') };

        try {
            const [translation] = await (this.translateClient as any).translate(text, target);
            return { ok: true, value: translation };
        } catch (error) {
            logger.error({ error }, 'Translation API call failed');
            return { ok: false, error: error as Error };
        }
    }

    /**
     * Analyze entities using Google Natural Language API
     */
    async analyzeEntities(text: string): Promise<Result<unknown>> {
        if (!this.nlClient) return { ok: false, error: new Error('NL Client not initialized') };

        try {
            const [result] = await this.nlClient.analyzeEntities({
                document: {
                    content: text,
                    type: 'PLAIN_TEXT'
                }
            });
            return { ok: true, value: result };
        } catch (error) {
            logger.error({ error }, 'Natural Language API call failed');
            return { ok: false, error: error as Error };
        }
    }

    /**
     * Audit active Google capabilities and presently applied model routing.
     * Reflects the physical models used by ModelClient and the broader substrate.
     */
    async auditAbilities(): Promise<Result<{ services: string[], models: string[] }>> {
        try {
            logger.info('Auditing Google services abilities and model routing via environment...');
            const services: string[] = [];
            const models: string[] = [];

            // 1. Storage & CloudBuild rely on Application Credentials
            if (process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
                services.push('storage', 'cloudbuild', 'pubsub');
            }

            // 2. Generative Language (Gemini) presently applied routing parameters
            if (this.config.apiKey) {
                services.push('generativelanguage');
                
                // Active Gemini Routing paths used in ModelClient and embedding substrates
                models.push(
                    process.env.GEMINI_FLASH_MODEL || 'gemini-1.5-flash',
                    process.env.GEMINI_PRO_MODEL || 'gemini-1.5-pro',
                    'gemini-1.5-flash-001', // Explicit fallback in resilient routes
                    process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004'
                );
            }

            // 3. Region awareness
            if (this.config.region) {
                services.push(`region:${this.config.region}`);
            }

            // Formally report both the sensory APIs and the actively routed neural models
            if (this.visionClient) services.push('vision');
            if (this.translateClient) services.push('translate');
            if (this.nlClient) services.push('natural_language');

            return { ok: true, value: { services, models } };
        } catch (error) {
            return { ok: false, error: error as Error };
        }
    }

    /**
     * Terminate all active Google SDK clients
     */
    async cleanup(): Promise<void> {
        try {
            if (this.visionClient) {
                await this.visionClient.close();
            }
            if (this.nlClient) {
                await this.nlClient.close();
            }
            logger.info('GoogleServices cleanup complete');
        } catch (e) {
            logger.warn({ error: (e as Error).message }, 'Error during GoogleServices cleanup');
        }
    }
}
