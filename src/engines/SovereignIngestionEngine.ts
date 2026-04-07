import { EventBus } from '../events/EventBus.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { GhostLimb } from '../limbs/metaphysical/GhostLimb.js';
import { MetabolicEngine } from './MetabolicEngine.js';
import { VectorDB } from '../utils/VectorDB.js';
import { ClinicalLogger } from '../monitor/ClinicalLogger.js';
import { INGESTION_TRIGGERS, HexagramIngestionProfile } from '../core/HexagramDefinitions.js';
import { YaoState } from '../core/models.js';
import { resolveSovereignPath } from '../utils/SovereignPathResolver.js';
import fs from 'fs/promises';
import crypto from 'crypto';
import path from 'path';

export interface IngestionBatch {
    source: 'cache_pedagogy' | 'atlas_spatial' | 'rolodex' | 'apos_bridge';
    path: string;
    payload: unknown;
    checksum: string;
    hexagramAffinity: number; // 1-64
    metabolicCost: number;
    priority: 'nourishment' | 'pushing' | 'distillation';
}

export class SovereignIngestionEngine {
    private static instance: SovereignIngestionEngine;
    private metabolicMonitor?: MetabolicEngine;
    private vectorStore: VectorDB;
    private eventBus: EventBus;
    private logger: ClinicalLogger;

    // Recursive feedback buffers
    private inputBuffer: IngestionBatch[] = [];
    private outputBuffer: IngestionBatch[] = [];

    // Metabolic constraints
    private readonly METABOLIC_CEILING = 0.85; // 85% VRAM threshold
    private currentLoad = 0;
    private isLoopActive = false;

    constructor(vectorStore: VectorDB) {
        this.vectorStore = vectorStore;
        this.eventBus = EventBus.getInstance();
        this.logger = new ClinicalLogger('SovereignIngestion');

        this.initializeFeedbackLoop();
    }

    public injectMetabolicMonitor(monitor: MetabolicEngine) {
        this.metabolicMonitor = monitor;
    }

    static getInstance(vectorStore: VectorDB): SovereignIngestionEngine {
        if (!SovereignIngestionEngine.instance) {
            SovereignIngestionEngine.instance = new SovereignIngestionEngine(vectorStore);
        }
        return SovereignIngestionEngine.instance;
    }

    private initializeFeedbackLoop(): void {
        this.logger.log('INFO', 'SovereignIngestion', 'Initializing ingestion feedback loop');

        // Subscribe to Hexagram state transitions
        HexagramManager.getInstance().on('cognitive_pulse', () => {
             const state = HexagramManager.getInstance().getInterpretation();
             this.handleHexagramTrigger(state.id);
        });
    }

    /**
     * Primary entry: Initiates controlled feedback loop
     * Routes input_side â†’ output_side with recursive distillation
     */
    async beginIngestionLoop(targets: string[]): Promise<void> {
        if (this.isLoopActive) {
            this.logger.log('WARN', 'SovereignIngestion', 'Ingestion loop already active. Extending queue.');
            return;
        }

        this.isLoopActive = true;
        this.logger.log('INFO', 'SovereignIngestion', `[SOVEREIGN_INGESTION] Loop initialized targets=${targets.join(',')}`);

        // Phase 1: Populate input buffer
        for (const target of targets) {
            const batches = await this.scanToBatches(target);
            this.inputBuffer.push(...batches);
        }

        // Phase 2: Route through TernaryRouter (Past â†’ Present â†’ Future)
        await this.executeTernaryFlow();

        // Phase 3: Mirror to GhostLimb (Removed due to context)
        this.logger.log('INFO', 'SovereignIngestion', 'Mirroring Output Buffer to internal cache...');

        this.isLoopActive = false;
        this.logger.log('INFO', 'SovereignIngestion', `[SOVEREIGN_INGESTION] Loop completed. processed=${this.outputBuffer.length} load=${this.currentLoad}`);
        
        // Clear outputs
        this.outputBuffer = [];
    }

    /**
     * Hexagram-governed ingestion rhythm
     */
    private async handleHexagramTrigger(hexagramId: number): Promise<void> {
        const profile = INGESTION_TRIGGERS[hexagramId];
        if (!profile) return; // not an ingestion trigger

        if (hexagramId === 27) {
            await this.executeNourishmentProtocol(profile);
        } else if (hexagramId === 46) {
            await this.executePushingProtocol(profile);
        } else if (hexagramId === 23) {
            await this.emergencyDistillation();
        }
    }

    private async executeNourishmentProtocol(profile: HexagramIngestionProfile): Promise<void> {
        this.logger.log('INFO', 'SovereignIngestion', '[HEXAGRAM_27] Nourishment protocol engaged');
        let index = 0;

        while (index < this.inputBuffer.length && this.currentLoad < this.METABOLIC_CEILING) {
            const batch = this.inputBuffer[index];
            
            // Metabolic check
            const available = this.metabolicMonitor ? this.metabolicMonitor.healthCheck() : { online: true, details: '' };
            const assumedLoad = available.online ? 0.5 : 1.0;
            if (assumedLoad > this.METABOLIC_CEILING) {
                await this.breathe(profile.breathCycle);
                continue;
            }

            const digested = await this.digestBatch(batch, profile.recursionDepth);
            this.outputBuffer.push(digested);
            
            const docId = `cache_${batch.checksum}`;
            this.vectorStore.addLesson({
                id: docId,
                text: typeof digested.payload === 'string' ? digested.payload : JSON.stringify(digested.payload),
                embedding: new Float32Array(0),
                projectId: 'sovereign_ingestion',
                domainNamespace: batch.source,
                createdAt: Date.now(),
                metadata: { type: 'ingested_cache', source: batch.source, rawBlob: JSON.stringify(batch.payload) }
            });
            
            this.currentLoad += batch.metabolicCost * 0.1; 
            index++;
            
            await this.breathe(profile.breathCycle);
        }
    }

    private async executePushingProtocol(profile: HexagramIngestionProfile): Promise<void> {
        this.logger.log('INFO', 'SovereignIngestion', '[HEXAGRAM_46] Pushing Upward protocol engaged');
        const chunks = this.chunkArray(this.inputBuffer, profile.maxConcurrent);
        
        for (const chunk of chunks) {
            const promises = chunk.map(batch => this.pushBatch(batch));
            await Promise.all(promises);
            await this.breathe(profile.breathCycle);
        }
    }

    private async digestBatch(batch: IngestionBatch, depth: number): Promise<IngestionBatch> {
        if (depth <= 0) return batch;

        const distilled = {
            ...batch,
            payload: this.distillStructure(batch.payload, batch.source),
            recursionDepth: depth - 1
        };

        if (depth > 1) {
            return this.digestBatch(distilled, depth - 1);
        }
        return distilled;
    }

    private async pushBatch(batch: IngestionBatch): Promise<void> {
        this.outputBuffer.push(batch);
        const docId = `push_${batch.checksum}`;
        this.vectorStore.addLesson({
            id: docId,
            text: typeof batch.payload === 'string' ? batch.payload : JSON.stringify(batch.payload),
            embedding: new Float32Array(0),
            projectId: 'sovereign_ingestion',
            domainNamespace: batch.source,
            createdAt: Date.now(),
            metadata: { type: 'ingested_cache', source: batch.source, rawBlob: JSON.stringify(batch.payload) }
        });
        this.eventBus.publish({ type: 'sovereign:ingestion:push', payload: { id: batch.checksum, timestamp: Date.now() }, source: 'SovereignIngestionEngine' });
    }

    private async scanToBatches(targetPath: string): Promise<IngestionBatch[]> {
        const fullPath = resolveSovereignPath(targetPath);
        const entities: Array<{filePath: string, data: unknown, type: string}> = [];
        
        try {
            const stat = await fs.stat(fullPath);
            if (stat.isDirectory()) {
                const files = await fs.readdir(fullPath);
                for (const file of files) {
                    const fp = path.join(fullPath, file);
                    if (file.endsWith('.json')) {
                        const data = JSON.parse(await fs.readFile(fp, 'utf8'));
                        entities.push({ filePath: fp, data, type: file.replace('.json', '') });
                    } else if (file.endsWith('.txt')) {
                        const str = await fs.readFile(fp, 'utf8');
                        const lines = str.split('\\n').filter(l => l.trim().length > 0);
                        for (const line of lines) {
                            try {
                                const data = JSON.parse(line);
                                entities.push({ filePath: fp, data, type: 'apos_event' });
                            } catch {
                                entities.push({ filePath: fp, data: { text: line, timestamp: Date.now(), state: 'UNKNOWN' }, type: 'apos_event' });
                            }
                        }
                    }
                }
            } else if (fullPath.endsWith('.json')) {
                const data = JSON.parse(await fs.readFile(fullPath, 'utf8'));
                entities.push({ filePath: fullPath, data, type: path.basename(fullPath, '.json') });
            }
        } catch (e) {
            this.logger.log('ERROR', 'SovereignIngestion', `Failed to scan ${targetPath}: ${(e as Error).message}`);
        }

        return entities.map(entity => ({
            source: targetPath.includes('atlas') ? 'atlas_spatial' : targetPath.includes('apos') ? 'apos_bridge' : 'cache_pedagogy',
            path: entity.filePath,
            payload: entity.data,
            checksum: this.computeChecksum(entity.data),
            hexagramAffinity: this.calculateAffinity(entity.data),
            metabolicCost: this.estimateMetabolicCost(entity.data),
            priority: ['npc', 'npcs', 'objects'].includes(entity.type) ? 'nourishment' : 'distillation'
        }));
    }

    private async executeTernaryFlow(): Promise<void> {
        // Synthesizing the flow based on Hexagram Temporal state
        const state = HexagramManager.getInstance().getInterpretation();
        
        if (state.name.includes('Return') || state.name.includes('Wait')) {
            // PAST state filtering
            this.inputBuffer = this.inputBuffer.filter(b => b.metabolicCost < 2);
        } else if (state.name.includes('Creative')) {
            // FUTURE state enrichment
        }
    }

    private async emergencyDistillation(): Promise<void> {
        this.logger.log('WARN', 'SovereignIngestion', '[HEXAGRAM_23] Emergency distillation triggered. Dropping buffers.');
        
        this.inputBuffer = [];
        this.currentLoad = 0;
    }

    private calculateAffinity(data: unknown): number {
        if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            if (keys.includes('npcs') || keys.includes('items')) return 27; 
            if (keys.includes('spatial') || keys.includes('coordinates')) return 46; 
        }
        return 1;
    }

    private estimateMetabolicCost(data: unknown): number {
        const size = JSON.stringify(data).length;
        return Math.min(size / 1000000, 10);
    }

    private distillStructure(payload: unknown, source: string): unknown {
        if (typeof payload !== 'object' || payload === null) return payload;
        
        const p = payload as Record<string, any>;
        
        if (source === 'atlas_spatial') {
            const city = p.city || p.name || 'Unknown Zone';
            const wiki = `https://runescape.wiki/w/${encodeURIComponent(city)}`;
            
            const distilled = {
                pedagogy: `Spatial logic domain anchor mapping for ${city}`,
                semantic_map: { anchors: p.anchors, bounds: p.meta?.bounds },
                rs3_wiki_endpoint: wiki
            };
            return typeof p.collision_matrix !== 'undefined' ? distilled : payload;
        }

        if (source === 'apos_bridge') {
            const time = p.timestamp || Date.now();
            const state = p.state || 'UNKNOWN';
            const text = p.text || '';
            const cityContext = p.metadata?.loc ? ` at location ${JSON.stringify(p.metadata.loc)}` : '';
            return `[APOS ${state} @ ${time}${cityContext}] ${text}`;
        }

        const distilled: Record<string, unknown> = {};
        const structuralKeys = ['id', 'name', 'type', 'coordinates', 'interfaces', 'models'];
        
        for (const key of structuralKeys) {
            if (key in p) {
                distilled[key] = p[key];
            }
        }
        return Object.keys(distilled).length > 0 ? distilled : payload;
    }

    private async breathe(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private chunkArray<T>(arr: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }

    private computeChecksum(data: unknown): string {
        return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
    }
}
