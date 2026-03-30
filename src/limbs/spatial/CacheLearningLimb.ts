import { createRequire } from 'module';
import * as path from 'path';
const require = createRequire(import.meta.url);
// Graceful substrate imports — these may not exist in all environments
let GameCacheLoader: any = null;
let EngineCache: any = null;
let ThreejsSceneCache: any = null;
let renderAppearance: any = null;
let SpatialMetricEngine: any = null;

import { getRSMVSubstratePath } from '../../utils/SovereignPathResolver.js';
const RSMV = getRSMVSubstratePath();
try { ({ GameCacheLoader } = require(path.join(RSMV, 'src', 'cache', 'sqlite.js'))); } catch { /* RSMV substrate not linked */ }
try { ({ EngineCache, ThreejsSceneCache } = require(path.join(RSMV, 'src', '3d', 'modeltothree.js'))); } catch { /* RSMV 3D substrate not linked */ }
try { ({ renderAppearance } = require(path.join(RSMV, 'src', 'headless', 'api.js'))); } catch { /* RSMV headless substrate not linked */ }
try { ({ SpatialMetricEngine } = require("../../engines/SpatialMetricEngine.js")); } catch { /* SpatialMetricEngine not available */ }

import { type Result, type DataType, type CacheData, err, ok } from '../../core/models.js';
import { createLogger } from '../../utils/logger.js';
import { JagexCacheReader } from '../../utils/JagexCacheReader.js';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { CacheForensicsLimb } from './CacheForensicsLimb.js';

const logger = createLogger('CacheLearning');

interface ModelMetadata {
    semanticName: string;
    modelId: number;
    equipSlotId?: number;
}

/**
 * CacheLearningLimb - Sovereign Ontological Mapper
 * 
 * Responsibilities:
 * 1. Learning 3D assets from the Jagex cache.
 * 2. Translating raw buffers into semantic models.
 * 3. Calculating spatial metrics and taxonomic signatures.
 */
export class CacheLearningLimb {
    /**
     * extract - High-level substrate extraction wrapper.
     */
    public async extract(cachePath: string, entityId: number, type: 'npc' | 'item' | 'object'): Promise<Result<any>> {
        logger.info({ entityId, type }, 'Sovereign Extraction initiated via substrate wrapper.');
        // Ensure path matches or update it
        if (cachePath !== this.cachePath) {
            this.cachePath = cachePath;
            const effectivePath = existsSync(cachePath) && path.extname(cachePath) === ''
                ? path.join(cachePath, 'js5-47.jcache')
                : cachePath;
            this.cacheReader = new JagexCacheReader(effectivePath);
            this.engineCache = null; // Force re-init of headless pipeline
        }
        return this.learnSpatialModel(type, entityId);
    }
    private cacheReader: JagexCacheReader;
    private forensics: CacheForensicsLimb;
    private extractionDir: string;
    private cachePath: string;

    // Headless Rendering Substrate hooks
    private engineCache: any = null;
    private sceneCache: any = null;

    constructor(cachePath: string, forensicsLimb: CacheForensicsLimb, extractionDir: string) {
        this.cachePath = cachePath;

        // Ensure effective substrate selection
        let effectivePath = cachePath;
        if (existsSync(cachePath) && path.extname(cachePath) === '') {
            const modelPath = path.join(cachePath, 'js5-47.jcache');
            if (existsSync(modelPath)) {
                effectivePath = modelPath;
            }
        }

        this.cacheReader = new JagexCacheReader(effectivePath);
        this.forensics = forensicsLimb;
        this.extractionDir = extractionDir;
    }

    private async ensureHeadlessPipeline() {
        if (!GameCacheLoader || !EngineCache || !ThreejsSceneCache) {
            throw new Error('RSMV headless substrate not available. Ensure rsmv modules are built and linked.');
        }
        if (!this.engineCache) {
            logger.info('Booting headless JS5 Translation Pipeline...');
            const source = new GameCacheLoader(this.cachePath);
            this.engineCache = await EngineCache.create(source);
            this.sceneCache = await ThreejsSceneCache.create(this.engineCache);
            logger.info('JS5 3D Rendering Pipeline Armed.');
        }
    }

    /**
     * learnSpatialModel - Extracts and analyzes a 3D model with high-fidelity metrics.
     */
    public async learnSpatialModel(type: 'npc' | 'item' | 'object', id: number): Promise<Result<any>> {
        try {
            await this.ensureHeadlessPipeline();

            // 1. Resolve Model ID from Config (if needed)
            // For substrate-level extraction, we often use the model ID directly.
            // But we'll attempt to resolve via forensics for semantic naming.
            const modelData = await this.sceneCache.getModelData(id);
            if (!modelData) return err(new Error(`Failed to extract model data for ${type}:${id}`));

            // 2. Calculate Spatial Metrics (Phase 15 Addition)
            if (!SpatialMetricEngine) {
                return ok({ type, id, metrics: null, meshes: modelData.meshes?.length || 0, raw: modelData, timestamp: Date.now(), warning: 'SpatialMetricEngine not available' });
            }
            const metrics = SpatialMetricEngine.calculateProfile(modelData);

            logger.info({ type, id, metrics }, 'Spatial learning completed for asset.');

            return ok({
                type,
                id,
                metrics,
                meshes: modelData.meshes.length,
                raw: modelData,
                timestamp: Date.now()
            });
        } catch (error) {
            logger.error({ type, id, error }, 'Spatial learning failed.');
            return err(error as Error);
        }
    }

    /**
     * translateToObj - Translates cache model to .gltf with metric verification.
     */
    public async translateToObj(semanticName: string, idOverride?: number): Promise<Result<string>> {
        try {
            await this.ensureHeadlessPipeline();

            // Resolve ID
            let targetId = idOverride;
            let cleanName = semanticName.replace(/[^a-zA-Z0-9]/g, '_');

            if (targetId === undefined) {
                const res = await this.forensics.crossReferenceItem(semanticName);
                if (!res.ok || res.value.rawModelIds.length === 0) return err(new Error(`Could not resolve ${semanticName}`));
                targetId = res.value.rawModelIds[0];
                cleanName = res.value.itemContext.name.replace(/[^a-zA-Z0-9]/g, '_');
            }

            logger.info({ id: targetId, name: cleanName }, 'Physically translating model to GLTF substrate...');

            // Extract and calculate metrics first (Verification)
            const modelData = await this.sceneCache.getModelData(targetId);
            const metrics = SpatialMetricEngine.calculateProfile(modelData);

            // Real-time render
            if (!renderAppearance) {
                return err(new Error('renderAppearance not available — RSMV headless substrate not linked.'));
            }
            const rendered = await renderAppearance(this.sceneCache, "item", targetId.toString());

            const outPath = path.join(this.extractionDir, `${cleanName}_${targetId}.gltf`);
            await fs.mkdir(this.extractionDir, { recursive: true });
            await fs.writeFile(outPath, rendered.modelfile);

            logger.info({ outPath, metrics }, 'Physical 3D translation successful.');

            return ok(outPath);
        } catch (error) {
            logger.error({ semanticName, error }, 'Failed physical 3D translation.');
            return err(error as Error);
        }
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const substrateOk = existsSync(this.cachePath);
        const details = `CacheLearning substrate: ${substrateOk ? 'NOMINAL' : 'FAULT'} (Path: ${this.cachePath})`;
        return { online: substrateOk, details };
    }
}
