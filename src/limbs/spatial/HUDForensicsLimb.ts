import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require("../../../rsmv/src/cache/sqlite.js");
const { parse } = require("../../../rsmv/src/opdecoder.js");

import { Result, ok, err } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { getRSMVCachePath, getSovereignRoot } from '../../utils/SovereignPathResolver.js';
import * as fs from 'fs';
import * as path from 'path';
import { WikiEnricher, WikiData } from '../../utils/WikiEnricher.js';

const logger = createLogger('HUDForensicsLimb');

export interface InterfaceComponent {
    componentId: number;
    type: string;
    text?: string;
    spriteId?: number;
    modelId?: number;
    hidden: boolean;
    parentId: number;
    children: number[];
}

export interface InterfaceForensics {
    interfaceId: number;
    components: InterfaceComponent[];
    textLabels: string[];
    isHudCandidate: boolean;
    wikiContext?: WikiData;
}

/**
 * HUDForensicsLimb - Sovereign Interface Epistemology
 * 
 * Responsibilities:
 * 1. Real-time extraction of HUD/Interface data from Jagex Cache (Major 3).
 * 2. Forensic deconstruction of interface hierarchies.
 * 3. Semantic mapping of interface components to Atlas principles.
 */
export class HUDForensicsLimb {
    private readonly cachePath = getRSMVCachePath();
    private cache: any | null = null;
    private readonly pedagogyCandidateDir: string;

    constructor() {
        this.pedagogyCandidateDir = path.join(getSovereignRoot(), 'cache_pedagogy', 'atlas', 'interfaces');
        
        try {
            this.cache = new GameCacheLoader(this.cachePath);
            this.cache.buildnr = 940; // RS3 Build
            logger.info({ path: this.cachePath }, 'HUDForensicsLimb connected to Jagex Cache substrate.');
        } catch (e) {
            logger.error({ error: (e as Error).message }, 'Failed to connect to GameCacheLoader.');
        }
    }

    /**
     * getInterface(id) - Extracts and deconstructs an interface from the cache.
     */
    public async getInterface(id: number): Promise<Result<InterfaceForensics>> {
        if (!this.cache) return err(new Error('Cache substrate not connected.'));

        try {
            const rawBuffer = await this.cache.getFile(3, id); // Major 3 is Interfaces
            
            // Use internal parser and state for multi-component iteration
            const state = {
                isWrite: false,
                buffer: rawBuffer,
                stack: [],
                hiddenstack: [],
                scan: 0,
                endoffset: rawBuffer.byteLength,
                args: { 
                    ...this.cache.getDecodeArgs(),
                    clientVersion: 940 // Explicitly force RS3/NXT context
                }
            };

            const components: InterfaceComponent[] = [];
            const textLabels: string[] = [];
            const parentToIndex = new Map<number, number[]>();
            let compId = 0;

            while (state.scan < state.endoffset) {
                const startScan = state.scan;
                try {
                    const comp = parse.interfaces.parser.read(state);
                    // Forensic check: Log if we see a weird type or version
                    if (compId === 0) {
                        logger.info({ id, version: comp.version, type: comp.type, firstByte: rawBuffer[startScan] }, 'First component forensic header.');
                    }

                    const component: InterfaceComponent = {
                        componentId: compId,
                        type: comp.type !== undefined ? this.mapTypeIdToName(comp.type) : 'UNKNOWN',
                        text: comp.textdata?.text || comp.text,
                        spriteId: comp.spritedata?.spriteid || comp.spriteid,
                        modelId: comp.modeldata?.modelid || comp.modelid,
                        hidden: !!comp.hidden,
                        parentId: comp.parentid !== undefined ? comp.parentid : -1,
                        children: []
                    };

                    if (component.text) textLabels.push(component.text);
                    components.push(component);

                    if (component.parentId !== -1 && component.parentId !== 65535) {
                        const children = parentToIndex.get(component.parentId) || [];
                        children.push(compId);
                        parentToIndex.set(component.parentId, children);
                    }
                    compId++;
                } catch (err: any) {
                    const dumpStart = Math.max(0, state.scan - 20);
                    const dumpEnd = Math.min(rawBuffer.byteLength, state.scan + 20);
                    const hexDump = rawBuffer.subarray(dumpStart, dumpEnd).toString('hex');
                    const pointer = ' '.repeat((state.scan - dumpStart) * 2) + '^^';
                    
                    logger.error({ 
                        id, 
                        scan: state.scan, 
                        hexAround: hexDump,
                        pointerAtHex: pointer,
                        error: err.message 
                    }, 'Forensic decompile failure detected.');
                    // Forensic salvage: If we can't parse more, we return what we have
                    break;
                }
            }

            // Fill children
            for (const comp of components) {
                comp.children = parentToIndex.get(comp.componentId) || [];
            }

            // Check if HUD candidate (has specific text hits or structure)
            const isHudCandidate = textLabels.some(t => 
                /inventory|skill|chat|map|quest|ability|friend|clan/i.test(t)
            );

            let wikiContext: WikiData | undefined;
            if (isHudCandidate && textLabels.length > 0) {
                // Take the most descriptive text label (longest for now)
                const query = textLabels.sort((a,b) => b.length - a.length)[0];
                const wikiRes = await WikiEnricher.enrich(query);
                if (wikiRes.ok) wikiContext = wikiRes.value;
            }

            return ok({
                interfaceId: id,
                components,
                textLabels,
                isHudCandidate,
                wikiContext
            });
        } catch (error) {
            logger.error({ interfaceId: id, error }, 'Failed to decompile interface.');
            return err(error as Error);
        }
    }

    /**
     * searchInterfaces(query) - Forensic scan across interface text labels.
     */
    public async searchInterfaces(query: string, limit: number = 10): Promise<Result<InterfaceForensics[]>> {
        if (!this.cache) return err(new Error('Cache substrate not connected.'));
        
        const results: InterfaceForensics[] = [];
        const regex = new RegExp(query, 'i');

        // Note: Scanning all interfaces (0-1600+) can be slow. 
        // We scan first 2000 as a standard range for RS3.
        for (let id = 0; id < 2000; id++) {
            try {
                const res = await this.getInterface(id);
                if (res.ok && res.value.textLabels.some(t => regex.test(t))) {
                    results.push(res.value);
                    if (results.length >= limit) break;
                }
            } catch {
                continue;
            }
        }

        return ok(results);
    }

    /**
     * Map internal numeric types to semantic names.
     */
    private mapTypeIdToName(typeId: number): string {
        const types: Record<number, string> = {
            0: 'CONTAINER',
            3: 'FIGURE',
            4: 'TEXT',
            5: 'SPRITE',
            6: 'MODEL',
            9: 'LINE',
            10: 'TYPE_10',
            11: 'TYPE_11',
            12: 'TYPE_12',
            13: 'TYPE_13',
            14: 'TYPE_14',
            15: 'TYPE_15',
            16: 'TYPE_16'
        };
        return types[typeId] || `UNKNOWN_${typeId}`;
    }

    /**
     * Diagnostic probe.
     */
    public healthCheck(): { online: boolean; details: string } {
        return {
            online: !!this.cache,
            details: this.cache ? 'HUDForensicsLimb active; Major 3 connected.' : 'HUDForensicsLimb OFFLINE; cache path invalid.'
        };
    }
}
