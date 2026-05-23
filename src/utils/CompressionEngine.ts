import { createLogger } from './logger.js';

const logger = createLogger('CompressionEngine');

export class CompressionEngine {
    private static instance: CompressionEngine;

    private constructor() {}

    public static getInstance(): CompressionEngine {
        if (!CompressionEngine.instance) {
            CompressionEngine.instance = new CompressionEngine();
        }
        return CompressionEngine.instance;
    }

    /**
     * Compresses large payloads to prevent training substrate overflow.
     * Currently implements a structural truncation and whitespace removal.
     */
    public compress(payload: any): any {
        if (typeof payload !== 'object' || payload === null) {
            return payload;
        }

        // Deep clone to avoid mutating original traffic
        const compressed = JSON.parse(JSON.stringify(payload));

        const traverse = (obj: any) => {
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    // Remove excessive whitespace and truncate very long strings (e.g. > 10k chars)
                    obj[key] = obj[key].trim().replace(/\s+/g, ' ');
                    if (obj[key].length > 10000) {
                        obj[key] = obj[key].substring(0, 10000) + '... [TRUNCATED]';
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    traverse(obj[key]);
                }
            }
        };

        traverse(compressed);
        return compressed;
    }

    /**
     * High-fidelity compression for critical training paths.
     */
    public compressFidelity(payload: any, level: 'low' | 'medium' | 'high'): any {
        // Future implementation for different compression levels
        return this.compress(payload);
    }
}
