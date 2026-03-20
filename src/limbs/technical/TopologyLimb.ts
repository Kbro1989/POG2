import { Result, ok, err, YaoState } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { GameCacheLoader } from '../../../tmp_rsmv_inspect/src/cache/sqlite.js';
import { parseOb3Model } from '../../../tmp_rsmv_inspect/src/3d/rt7model.js';

const logger = createLogger('TopologyLimb');

export interface TopologicalProfile {
    modelId: number;
    vertexCount: number;
    triangleCount: number;
    boneCount: number;
    hasUVs: boolean;
    hasVertexColors: boolean;
    hasSkinning: boolean;
    materials: number[];
    boundingBox: { miny: number; maxy: number };
}

/**
 * TopologyLimb - Sensory Organ for Structural Mathematics
 * Deconstructs raw RS3 3D models into learning heuristics for the Pedagogy Engine.
 */
export class TopologyLimb {
    private readonly cachePath = 'C:\\ProgramData\\Jagex\\RuneScape';
    private cache: any | null = null;

    constructor() {
        try {
            this.cache = new GameCacheLoader(this.cachePath);
            this.cache.buildnr = 940;
            logger.info('TopologyLimb initialized. Cache connection active.');
        } catch (e) {
            logger.error({ error: (e as Error).message }, 'Failed to initialize GameCacheLoader.');
        }
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const cacheValid = this.cache !== null;
        return {
            online: cacheValid,
            details: cacheValid ? `Topology Substrate: ONLINE (Archive 47 bound)` : 'Topology Substrate: OFFLINE (Cache unreachable)'
        };
    }

    /**
     * Extracts foundational topology heuristics from a raw model ID.
     */
    public async extractTopology(modelId: number): Promise<Result<TopologicalProfile>> {
        if (!this.cache) return err(new Error('Cache connection offline.'));

        try {
            // Major 47 = Models Archive (for RS3/NXT)
            // Note: Archive 7 is used for "Old Models" in some legacy/OSRS contexts.
            const buffer = await this.cache.getFile(47, modelId);
            if (!buffer) {
                logger.warn({ modelId }, 'Model not found in archive 47');
                return err(new Error(`Model ${modelId} not found in archive 47.`));
            }

            logger.debug({ modelId, bufferLength: buffer.length }, 'Model buffer acquired. Parsing...');
            // Parse full geometry
            const modelData = parseOb3Model(buffer, this.cache);
            logger.debug({ modelId, meshCount: modelData.meshes.length }, 'Model parsed.');
            
            let vertexCount = 0;
            let triangleCount = 0;
            let hasUVs = false;
            let hasVertexColors = false;
            let hasSkinning = false;
            const materials = new Set<number>();

            for (const mesh of modelData.meshes) {
                if (mesh.attributes.pos) vertexCount += mesh.attributes.pos.count;
                if (mesh.indices) triangleCount += Math.floor(mesh.indices.count / 3);
                
                if (mesh.attributes.texuvs) hasUVs = true;
                if (mesh.attributes.color) hasVertexColors = true;
                if (mesh.attributes.skinids || mesh.attributes.boneids) hasSkinning = true;
                
                materials.add(mesh.materialId);
            }

            const profile: TopologicalProfile = {
                modelId,
                vertexCount,
                triangleCount,
                boneCount: modelData.bonecount || 0,
                hasUVs,
                hasVertexColors,
                hasSkinning,
                materials: Array.from(materials),
                boundingBox: { miny: modelData.miny, maxy: modelData.maxy }
            };

            return ok(profile);
        } catch (e) {
            logger.error({ error: (e as Error).message, modelId }, 'Failed to extract topology.');
            return err(new Error(`Topology extraction failed: ${(e as Error).message}`));
        }
    }

    public close() {
        if (this.cache) {
            this.cache.close();
            this.cache = null;
        }
    }
}
