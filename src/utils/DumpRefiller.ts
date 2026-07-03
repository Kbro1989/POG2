import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from './logger.js';
import { NodeRegistry, NodeMetadata } from '../core/NodeRegistry.js';
import { resolveSovereignPath } from './SovereignPathResolver.js';

const logger = createLogger('DumpRefiller');

/**
 * DumpRefiller - Phase D: Master Node Re-hydration.
 * 
 * Automates the process of reading raw "unidentified" modules from the 
 * deconstructed viewer and re-mapping them into functional POG2 logic nodes.
 */
export class DumpRefiller {
    private sourceDir: string = resolveSovereignPath('resources/webviewer-deconstructed/unidentified');
    private targetDir: string = resolveSovereignPath('refilled');
    private registry: NodeRegistry;

    constructor() {
        this.registry = NodeRegistry.getInstance();
        this.ensureDirectories();
    }

    private ensureDirectories(): void {
        if (!fs.existsSync(this.targetDir)) {
            fs.mkdirSync(this.targetDir, { recursive: true });
        }
    }

    /**
     * refillNode - Re-hydrates a specific module ID.
     */
    public async refillNode(moduleId: number): Promise<boolean> {
        const metadata = this.registry.getNode(moduleId);
        if (!metadata) {
            logger.error({ moduleId }, 'No metadata found for module in registry.');
            return false;
        }

        const sourcePath = path.join(this.sourceDir, `module-${moduleId.toString().padStart(4, '0')}.js`);
        if (!fs.existsSync(sourcePath)) {
            logger.error({ sourcePath }, 'Source module file not found.');
            return false;
        }

        logger.info({ moduleId, name: metadata.name }, 'Begging refill of Master Node...');

        try {
            const rawContent = fs.readFileSync(sourcePath, 'utf8');
            let refilledContent = '';

            // Apply Semantic Transformation based on category
            switch (metadata.category) {
                case 'spatial':
                    refilledContent = this.transformSpatial(rawContent, metadata);
                    break;
                case 'decompression':
                    refilledContent = this.transformDecompression(rawContent, metadata);
                    break;
                case 'lookup':
                    refilledContent = this.transformLookup(rawContent, metadata);
                    break;
                default:
                    refilledContent = rawContent; // Passthrough for unknown
            }

            fs.writeFileSync(metadata.refillPath, refilledContent);
            logger.info({ path: metadata.refillPath }, 'Refilled node written to persistent substrate.');
            return true;
        } catch (err) {
            logger.error({ err, moduleId }, 'Refill failed.');
            return false;
        }
    }

    private transformSpatial(content: string, meta: NodeMetadata): string {
        // Refill mapping for module-7244 logic (Coordinate & Shader Mastery)
        // We inject the semantic variable names found in classicmap.ts
        return `
/**
 * REFILLED NODE: ${meta.name} (${meta.moduleId})
 * Description: ${meta.description}
 * Source: ${meta.refillPath}
 */
export const UnpackRGBAToIntegerFloat = (r: number, g: number, b: number, a: number): number => {
    // Semantic Refill from module-7244.js logic pass
    return Math.floor(r * 255 + 0.5) * 16777216 + 
           Math.floor(g * 255 + 0.5) * 65536 + 
           Math.floor(b * 255 + 0.5) * 256 + 
           Math.floor(a * 255 + 0.5);
};

// Raw Logic Pass-through (Targeted Refill)
${content}
`;
    }

    private transformDecompression(content: string, meta: NodeMetadata): string {
        // Refill mapping for module-1447 (Inflate/Zlib logic)
        return `
/**
 * REFILLED NODE: ${meta.name} (${meta.moduleId})
 * Description: ${meta.description}
 */
import { inflate } from 'pako'; // Using internal pako mapping from module logic


export const decompressCacheBlock = (buffer: Buffer): Buffer => {
    // Logic Refill: module-1447 uses a custom pako-like inflate for 0x5a blocks
    // This node allows POG2 to decompress modern SQLite cache blobs
    return Buffer.from(inflate(buffer));
};

// Raw Logic Pass-through
${content}
`;
    }

    private transformLookup(content: string, meta: NodeMetadata): string {
        return `
/**
 * REFILLED NODE: ${meta.name} (${meta.moduleId})
 * Description: ${meta.description}
 */
export const fuzzyMatch = (input: string, list: string[]): string | null => {
    // Logic Refill: fuzzy string matching from module-1492
    // Implementation here...
    return null; 
};

${content}
`;
    }
}

