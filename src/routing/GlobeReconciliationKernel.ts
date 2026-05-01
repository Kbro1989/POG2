import { createLogger } from '../utils/logger.js';
import { type WorldDelta, type ReconciliationResult, type Result, ok, err } from '../core/models.js';
import { SubstrateResolver } from '../engines/gameplay/SubstrateResolver.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const logger = createLogger('GlobeReconciliationKernel');

/**
 * GlobeReconciliationKernel
 * 
 * Job: Distributed Belief Reconciliation Surface.
 * Merges ms_x_y chunks with live CNS deltas to produce a unified,
 * uncertainty-aware world view for the Globe perception layer.
 */
export class GlobeReconciliationKernel {
    private static instance: GlobeReconciliationKernel | undefined;
    
    // Memory-mapped belief state (ms_x_y.json chunks)
    private beliefCache: Map<string, any> = new Map();
    private activeDeltas: Map<string, WorldDelta[]> = new Map();
    
    private readonly UNCERTAINTY_THRESHOLD = 0.4;

    public static getInstance(): GlobeReconciliationKernel {
        if (!this.instance) this.instance = new GlobeReconciliationKernel();
        return this.instance;
    }

    private constructor() {}

    /**
     * ingestDelta - Push a live mutation into the reconciliation surface.
     */
    public ingestDelta(delta: WorldDelta): void {
        const key = `${delta.x},${delta.y},${delta.z}`;
        const deltas = this.activeDeltas.get(key) || [];
        deltas.push(delta);
        
        // Keep only recent deltas (Phase 81: Temporal pruning)
        if (deltas.length > 5) deltas.shift();
        
        this.activeDeltas.set(key, deltas);
        logger.debug({ key, type: delta.type, source: delta.source }, 'Delta ingested into reconciliation surface');
    }

    /**
     * reconcileTile - Calculate the authoritative state of a single tile.
     * Compares CNS decisions against historical belief and static cache definitions.
     */
    public async reconcileTile(x: number, y: number, z: number): Promise<ReconciliationResult> {
        const key = `${x},${y},${z}`;
        const deltas = this.activeDeltas.get(key) || [];
        const belief = await this.getBeliefAt(x, y, z);
        
        // 1. Identify layers
        const layers = [];
        
        // Layer: Static Cache (via ms_x_y)
        if (belief) {
            layers.push({
                source: "CACHE",
                value: belief.type === 'object' ? 'BLOCKED' : 'WALKABLE',
                confidence: 0.9 // High confidence in static geometry
            });
        }

        // Layer: CNS decisions (POG2)
        const cnsDeltas = deltas.filter(d => d.source === "POG2");
        if (cnsDeltas.length > 0) {
            const latest = cnsDeltas[cnsDeltas.length - 1];
            layers.push({
                source: "POG2",
                value: latest.type,
                confidence: latest.confidence
            });
        }

        // 2. Determine Consensus & Uncertainty
        let consensus: ReconciliationResult['consensus'] = "STABLE";
        let uncertainty = 0;
        let primarySource: ReconciliationResult['primarySource'] = "CACHE";

        if (layers.length > 1) {
            const p2 = layers.find(l => l.source === "POG2");
            const cache = layers.find(l => l.source === "CACHE");

            if (p2 && cache && p2.value !== cache.value) {
                // Conflict detected: CNS disagrees with Cache
                consensus = "INSTABILITY_FIELD";
                uncertainty = 1.0 - Math.min(p2.confidence, cache.confidence);
                primarySource = "POG2"; // CNS is authoritative
            }
        } else if (layers.length === 1) {
            primarySource = layers[0].source as any;
        }

        return {
            tile: { x, y, z },
            consensus,
            primarySource,
            uncertainty,
            layers
        };
    }

    /**
     * getBeliefAt - Retrieve the best guess of reality from the ms_x_y chunks.
     */
    private async getBeliefAt(x: number, y: number, z: number): Promise<any | null> {
        const rx = Math.floor(x / 64);
        const ry = Math.floor(y / 64);
        const chunkKey = `ms_${rx}_${ry}`;

        let chunk = this.beliefCache.get(chunkKey);
        if (!chunk) {
            chunk = await this.loadChunk(rx, ry);
            if (chunk) this.beliefCache.set(chunkKey, chunk);
        }

        if (!chunk) return null;

        // Find entity on this tile
        return chunk.entities.find((e: any) => e.x === x && e.y === y && e.z === z) || null;
    }

    private async loadChunk(rx: number, ry: number): Promise<any | null> {
        const path = join(process.cwd(), 'public', 'unified', `ms_${rx}_${ry}.json`);
        if (!existsSync(path)) return null;

        try {
            const data = readFileSync(path, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            logger.error({ rx, ry, error: (e as Error).message }, 'Failed to load belief chunk');
            return null;
        }
    }
}
