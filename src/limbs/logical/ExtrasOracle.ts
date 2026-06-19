import * as fs from 'fs';
import * as path from 'path';
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';
import { CacheSpatialDecoder } from '../spatial/CacheSpatialDecoder.js';

export interface ExtraValue {
    key: number;
    value: number | string;
}

/**
 * ExtrasOracle - The semantic logic resolver for Cache-side metadata (Opcode 0xF9).
 * 
 * This limb provides answers to interaction hooks that are not hardcoded
 * in the client but served via high-fidelity server logic tables (DBRows).
 */
export class ExtrasOracle {
    private static instance: ExtrasOracle;
    private extrasIndex: Map<number, Map<number, number | string>> = new Map();
    private handlerRegistry: Map<number, string> = new Map();
    private spatialDecoder: CacheSpatialDecoder;

    private constructor() {
        this.spatialDecoder = CacheSpatialDecoder.getInstance();
    }

    public static getInstance(): ExtrasOracle {
        if (!ExtrasOracle.instance) {
            ExtrasOracle.instance = new ExtrasOracle();
        }
        return ExtrasOracle.instance;
    }

    /**
     * initialize - Loads the pre-computed extras index derived from the Jagex Cache.
     */
    public async initialize(): Promise<void> {
        const indexPaths = [
            path.join(getSovereignRoot(), 'atlas', 'logic', 'item_extras.json'),
            path.join(getSovereignRoot(), 'atlas', 'logic', 'object_extras.json')
        ];

        for (const p of indexPaths) {
            if (fs.existsSync(p)) {
                try {
                    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
                    Object.entries(data).forEach(([id, payload]: [string, any]) => {
                        const idNum = parseInt(id, 10);
                        if (!this.extrasIndex.has(idNum)) this.extrasIndex.set(idNum, new Map());
                        const entityMap = this.extrasIndex.get(idNum)!;
                        
                        // New specialized format from build_item_extras_index.ts
                        const extras = payload.extras || payload; 
                        
                        if (Array.isArray(extras)) {
                            extras.forEach((e: any) => {
                                if (e.key !== undefined && e.value !== undefined) {
                                    entityMap.set(e.key, e.value);
                                }
                            });
                        } else {
                            Object.entries(extras).forEach(([k, v]: [string, any]) => {
                                entityMap.set(parseInt(k, 10), v);
                            });
                        }

                        // Ingest Handler Hints
                        if (payload.handler) {
                            this.handlerRegistry.set(idNum, payload.handler);
                        }
                    });
                    console.log(`[ExtrasOracle] Ingested authoritative extras from ${path.basename(p)}`);
                } catch (e) {
                    console.error(`[ExtrasOracle] Failed to parse extras at ${p}`, e);
                }
            }
        }

        this.applyBootstrapOverrides();
    }

    private applyBootstrapOverrides() {
        // Globetrotter Outfit (Semantic Actions)
        const globetrotterIds = [41913, 41914, 41915, 41916, 41917];
        globetrotterIds.forEach(id => {
            this.injectExtra(id, 528, "Teleport");
            this.handlerRegistry.set(id, "GlobetrotterHandler");
        });

        // Sextant / Watch (DBRow Bindings)
        this.injectExtra(2574, 2655, 2353); 

        // Clue Scrolls (Packed Coordinates)
        this.injectExtra(2677, 4682, 321014930); 
    }

    private injectExtra(id: number, key: number, value: number | string) {
        if (!this.extrasIndex.has(id)) this.extrasIndex.set(id, new Map());
        this.extrasIndex.get(id)!.set(key, value);
    }

    /**
     * getLogicalContext - Returns all available metadata for a specific ID
     */
    public getLogicalContext(id: number) {
        return {
            extras: Object.fromEntries(this.extrasIndex.get(id) || new Map()),
            handler: this.handlerRegistry.get(id) || null
        };
    }

    public getExtra(id: number, key: number): number | string | null {
        return this.extrasIndex.get(id)?.get(key) ?? null;
    }

    public getActionHook(id: number): string | null {
        const hook = this.getExtra(id, 528);
        return typeof hook === 'string' ? hook : null;
    }
}

