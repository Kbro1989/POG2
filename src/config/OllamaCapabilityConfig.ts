/**
 * OllamaCapabilityConfig — Parses .env.ollama into capability tiers.
 * Non-breaking additive. Zero runtime logic. Just structured config.
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('OllamaCapabilityConfig');

export interface OllamaCapability {
    readonly name: string;
    readonly preferredModel: string;
    readonly minCtx: number;
    readonly domain: 'reasoning' | 'code' | 'vision' | 'reflex' | 'embedding' | 'chat';
    readonly fallbackModels: readonly string[];
}

const _registry = new Map<string, OllamaCapability>();

function loadFromEnv(): void {
    const defs: Array<[string, OllamaCapability['domain'], string[]]> = [
        ['THINK', 'reasoning', ['deepseek-r1:8b']],
        ['CODE_HEAVY', 'code', ['deepseek-r1:32b', 'qwen2.5-coder:14b-instruct-q5_K_M', 'deepseek-r1:8b']],
        ['CODE_MID', 'code', ['gemma4:26b', 'qwen2.5-coder:7b-instruct-q4_K_M']],
        ['CODE_FAST', 'code', ['qwen2.5-coder:7b-instruct-q4_K_M', 'gemma4:26b']],
        ['FAST', 'reflex', ['gemma4:26b']],
        ['VISION', 'vision', ['moondream:latest', 'gemma4:26b']],
        ['EMBED', 'embedding', ['qwen3-embedding:latest', 'nomic-embed-text:latest']],
    ];

    for (const [suffix, domain, fallbacks] of defs) {
        const model = process.env[`OLLAMA_MODEL_${suffix}`];
        const ctx = parseInt(process.env[`OLLAMA_CTX_${suffix}`] || '4096', 10);
        if (!model) continue;
        _registry.set(suffix.toLowerCase(), Object.freeze({
            name: suffix.toLowerCase(),
            preferredModel: model,
            minCtx: isNaN(ctx) ? 4096 : ctx,
            domain,
            fallbackModels: Object.freeze([model, ...fallbacks.filter(f => f !== model)])
        }));
    }
    logger.info({ count: _registry.size }, 'Ollama capability registry loaded');
}

loadFromEnv();

export const getCapability = (tier: string): Readonly<OllamaCapability> | null =>
    _registry.get(tier.toLowerCase()) || null;

export const isCapabilityTier = (tier: string): boolean =>
    _registry.has(tier.toLowerCase());
