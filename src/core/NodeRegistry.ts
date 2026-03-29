import { createLogger } from '../utils/logger.js';

const logger = createLogger('NodeRegistry');

export interface NodeMetadata {
    moduleId: number;
    name: string;
    category: 'spatial' | 'decompression' | 'lookup' | 'rendering' | 'unknown';
    refillPath: string; // The path to the "Refilled" logic file in D:\sovereign\refilled
    description: string;
}

/**
 * NodeRegistry - Phase D: Master Node Identity Management.
 * 
 * Maps the "Unidentified" module IDs from the deconstructed viewer 
 * to their semantically "Refilled" functional logic in POG2.
 */
export class NodeRegistry {
    private static instance: NodeRegistry;
    private registry: Map<number, NodeMetadata> = new Map();

    private constructor() {
        this.initializeRefilledNodes();
    }

    public static getInstance(): NodeRegistry {
        if (!NodeRegistry.instance) {
            NodeRegistry.instance = new NodeRegistry();
        }
        return NodeRegistry.instance;
    }

    private initializeRefilledNodes(): void {
        // Core Refilled Nodes (Phase D initial set)
        
        // module-7244: The Master Spatial Node
        this.addNode(7244, 'MasterSpatialNode', 'spatial', 'D:\\sovereign\\refilled\\spatial_7244.ts', 'RGBA-to-Int unpacking and GLSL Master Node mapping');
        
        // module-1447: The Decompression Node
        this.addNode(1447, 'InflateEngine', 'decompression', 'D:\\sovereign\\refilled\\inflate_1447.ts', 'Pako/Zlib decompression for raw cache blocks');

        // module-1492: The Lookup Node
        this.addNode(1492, 'StringMatcher', 'lookup', 'D:\\sovereign\\refilled\\matcher_1492.ts', 'Fuzzy name matching for NPC/Object identification');

        logger.info({ nodeCount: this.registry.size }, 'NodeRegistry initialized with Refilled cache logic.');
    }

    private addNode(moduleId: number, name: string, category: NodeMetadata['category'], refillPath: string, description: string): void {
        this.registry.set(moduleId, {
            moduleId,
            name,
            category,
            refillPath,
            description
        });
    }

    /**
     * getNode - Retrieves the metadata for a refilled module.
     */
    public getNode(moduleId: number): NodeMetadata | undefined {
        return this.registry.get(moduleId);
    }

    /**
     * getAllNodes - Returns all registered refilled nodes.
     */
    public getAllNodes(): NodeMetadata[] {
        return Array.from(this.registry.values());
    }
}
