import { createRequire } from 'module';
import * as path from 'path';
const require = createRequire(import.meta.url);
let GameCacheLoader: any = null;
let parse: any = null;

import { Result, ok, err } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { getRSMVCachePath, getSovereignRoot, getRSMVSubstratePath } from '../../utils/SovereignPathResolver.js';
import * as fs from 'fs';

const RSMV = getRSMVSubstratePath();
try { ({ GameCacheLoader } = require(path.join(RSMV, 'src', 'cache', 'sqlite.js'))); } catch {}
try { ({ parse } = require(path.join(RSMV, 'src', 'opdecoder.js'))); } catch {}
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
    classification?: HUDClassification;
}

export interface HUDClassification {
    interfaceId: number;
    score: number;
    confidence: "HIGH" | "MEDIUM" | "LOW" | "FALSE_POSITIVE";
    category: "RIBBON" | "SETTINGS_PANEL" | "INVENTORY_HUD" | "CHAT_BOX" | "MINIMAP" | "SPRITE_OVERLAY" | "UNKNOWN";
    reasons: string[];
    structuralMetrics: {
        textRatio: number;
        spriteRatio: number;
        containerRatio: number;
        maxDepth: number;
        avgTextLength: number;
        totalComponents: number;
    };
}

/**
 * HUDForensicsLimb - Sovereign Interface Epistemology
 * 
 * Responsibilities:
 * 1. Real-time extraction of HUD/Interface data from Jagex Cache (Major 3).
 * 2. Forensic deconstruction of interface hierarchies.
 * 3. Structural + Lexical classification to eliminate false positives.
 */
export class HUDForensicsLimb {
    private readonly cachePath = getRSMVCachePath();
    private cache: any | null = null;
    private readonly pedagogyCandidateDir: string;

    // Anti-pattern lexicon — subtract score for tutorial/marketing content
    private readonly TUTORIAL_MARKERS = [
        /welcome/i, /tutorial/i, /html5/i, /new graphics/i,
        /world event/i, /join the/i, /first time/i, /getting started/i,
        /click here to/i, /try the new/i, /battle of/i, /now all in one place/i,
        /the fastest way/i, /all new/i
    ];

    // HUD structural signatures — what TRUE persistent HUDs look like
    private readonly HUD_STRUCTURAL_PROFILES = {
        RIBBON: {
            maxTextRatio: 0.25,           // Relaxed: ribbon labels (Inventory, Skills…) add ~15-25% text
            minContainerDepth: 2,
            minSpriteRatio: 0.30,
            lexicalTriggers: /ribbon|minimap|map|edit mode|customize|toolbar|action bar/i,
        },
        SPRITE_OVERLAY: {
            maxTextRatio: 0.0,             // Zero text — pure sprite fragments
            minContainerDepth: 1,
            minSpriteRatio: 1.0,           // 100% sprite only
            lexicalTriggers: /overlay|buff|debuff|icon|orb|status|aura/i,
        },
        SETTINGS_PANEL: {
            maxTextRatio: 0.40,
            minContainerDepth: 1,
            minSpriteRatio: 0.10,
            lexicalTriggers: /settings|audio|display|controls|interface|gameplay|graphics/i,
        },
        INVENTORY_HUD: {
            maxTextRatio: 0.10,
            minContainerDepth: 2,
            minSpriteRatio: 0.50,
            lexicalTriggers: /inventory|bank|item|slot|gear|worn equipment/i,
        },
        CHAT_BOX: {
            maxTextRatio: 0.60,
            minContainerDepth: 1,
            minSpriteRatio: 0.05,
            lexicalTriggers: /chat|message|friend|clan|public|private|trade|guest/i,
        },
        MINIMAP: {
            maxTextRatio: 0.05,
            minContainerDepth: 1,
            minSpriteRatio: 0.40,
            lexicalTriggers: /minimap|compass|run|energy|world map|home teleport/i,
        },
    };

    constructor() {
        this.pedagogyCandidateDir = path.join(getSovereignRoot(), 'cache_pedagogy', 'atlas', 'interfaces');

        try {
            if (GameCacheLoader) {
                this.cache = new GameCacheLoader(this.cachePath);
                this.cache.buildnr = 940;
                logger.info({ path: this.cachePath }, 'HUDForensicsLimb connected to Jagex Cache substrate.');
            } else {
                logger.warn('HUDForensicsLimb: GameCacheLoader not available.');
            }
        } catch (e) {
            logger.error({ error: (e as Error).message }, 'Failed to connect to GameCacheLoader.');
        }
    }

    /**
     * getInterface(id) - Extracts and deconstructs an interface from the cache.
     * Now includes structural classification.
     */
    public async getInterface(id: number): Promise<Result<InterfaceForensics>> {
        if (!this.cache) return err(new Error('Cache substrate not connected.'));
        if (!parse) return err(new Error('HUDForensicsLimb: parse not available.'));

        try {
            const rawBuffer = await this.cache.getFile(3, id);

            // ─── Version Gate ───
            const firstByte = rawBuffer[0];
            if (firstByte === 0x01) {
                logger.info({ id, size: rawBuffer.byteLength }, 'iftype2 interface detected — needs post-932 decoder');
                const isLikelyRibbon = rawBuffer.byteLength > 50000; // 98KB ribbon
                return ok({
                    interfaceId: id,
                    components: [],
                    textLabels: [],
                    isHudCandidate: isLikelyRibbon,
                    classification: {
                        interfaceId: id,
                        score: isLikelyRibbon ? 80 : 0,
                        confidence: isLikelyRibbon ? "MEDIUM" : "LOW",
                        category: isLikelyRibbon ? "RIBBON" : "UNKNOWN",
                        reasons: [`iftype2 format (post-932) — ${rawBuffer.byteLength} bytes, needs decoder`],
                        structuralMetrics: { textRatio: 0, spriteRatio: 0, containerRatio: 0, maxDepth: 0, avgTextLength: 0, totalComponents: 0 }
                    }
                });
            }

            const state = {
                isWrite: false,
                buffer: rawBuffer,
                stack: [],
                hiddenstack: [],
                scan: 0,
                endoffset: rawBuffer.byteLength,
                args: {
                    ...this.cache.getDecodeArgs(),
                    clientVersion: 940
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
                    break;
                }
            }

            for (const comp of components) {
                comp.children = parentToIndex.get(comp.componentId) || [];
            }

            // Legacy flat check (kept for backward compat)
            const isHudCandidate = textLabels.some(t =>
                /inventory|skill|chat|map|quest|ability|friend|clan/i.test(t)
            );

            // NEW: Structural classification
            const classification = this.classifyInterface(id, components, textLabels);

            let wikiContext: WikiData | undefined;
            if (classification.confidence === "HIGH" && textLabels.length > 0) {
                const query = textLabels.sort((a, b) => b.length - a.length)[0];
                const wikiRes = await WikiEnricher.enrich(query);
                if (wikiRes.ok) wikiContext = wikiRes.value;
            }

            return ok({
                interfaceId: id,
                components,
                textLabels,
                isHudCandidate,
                wikiContext,
                classification
            });
        } catch (error) {
            logger.error({ interfaceId: id, error }, 'Failed to decompile interface.');
            return err(error as Error);
        }
    }

    /**
     * classifyInterface - Structural + Lexical epistemology.
     * Eliminates tutorial false positives by verifying topology, not just text.
     */
    public classifyInterface(
        interfaceId: number,
        components: InterfaceComponent[],
        textLabels: string[]
    ): HUDClassification {
        const totalComponents = components.length;
        const textComponents = components.filter(c => c.type === "TEXT").length;
        const spriteComponents = components.filter(c => c.type === "SPRITE").length;
        const containerComponents = components.filter(c => c.type === "CONTAINER").length;

        const allText = textLabels.join(" ").toLowerCase();
        const textRatio = totalComponents > 0 ? textComponents / totalComponents : 0;
        const spriteRatio = totalComponents > 0 ? spriteComponents / totalComponents : 0;
        const containerRatio = totalComponents > 0 ? containerComponents / totalComponents : 0;
        const maxDepth = this.computeMaxDepth(components);
        const avgTextLength = textLabels.length > 0
            ? textLabels.reduce((a, b) => a + b.length, 0) / textLabels.length
            : 0;

        // ─── Minimum Component Thresholds ───
        // Bare stub containers (1-4 components, zero text, zero sprite) are scaffolding,
        // not real HUDs. Force LOW confidence to avoid RIBBON over-population.
        const MIN_COMPONENTS: Record<string, number> = {
            RIBBON: 10,          // Real ribbon has tab icons, buttons, containers
            SPRITE_OVERLAY: 1,   // Single sprite is valid
            SETTINGS_PANEL: 5,
            INVENTORY_HUD: 8,
            CHAT_BOX: 4,
            MINIMAP: 3,
        };

        // ─── Anti-Pattern Penalty ───
        let tutorialPenalty = 0;
        const tutorialHits = this.TUTORIAL_MARKERS.filter(re => re.test(allText)).length;
        if (tutorialHits >= 2) tutorialPenalty += 40;
        if (avgTextLength > 80) tutorialPenalty += 20;
        if (textComponents > 50) tutorialPenalty += 15;
        if (allText.includes("world event") || allText.includes("battle of")) tutorialPenalty += 25;

        // ─── Category Scoring ───
        const scores: Record<string, number> = {};
        const reasons: string[] = [];

        for (const [category, profile] of Object.entries(this.HUD_STRUCTURAL_PROFILES)) {
            let score = 50;

            const lexMatches = (allText.match(profile.lexicalTriggers) || []).length;
            score += lexMatches * 10;

            if (textRatio <= profile.maxTextRatio) score += 15;
            else score -= 20;

            if (spriteRatio >= profile.minSpriteRatio) score += 10;
            if (maxDepth >= profile.minContainerDepth) score += 10;

            // Minimum component gate — stub frames below threshold get penalized
            const minComps = MIN_COMPONENTS[category] ?? 1;
            if (totalComponents < minComps) score -= 30;

            score -= tutorialPenalty;
            scores[category] = Math.max(0, score);
        }

        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const [topCategory, topScore] = sorted[0];
        const runnerUpScore = sorted[1]?.[1] || 0;

        let confidence: HUDClassification["confidence"];
        if (tutorialPenalty > 50) {
            confidence = "FALSE_POSITIVE";
            reasons.push(`TUTORIAL_PENALTY: ${tutorialPenalty} — likely welcome/marketing screen`);
        } else if (topScore - runnerUpScore > 20 && topScore > 60) {
            confidence = "HIGH";
        } else if (topScore > 40) {
            confidence = "MEDIUM";
        } else {
            confidence = "LOW";
        }

        reasons.push(
            `textRatio: ${(textRatio * 100).toFixed(1)}% (max: ${(this.HUD_STRUCTURAL_PROFILES[topCategory as keyof typeof this.HUD_STRUCTURAL_PROFILES]?.maxTextRatio || 0) * 100}%)`,
            `spriteRatio: ${(spriteRatio * 100).toFixed(1)}%`,
            `containerRatio: ${(containerRatio * 100).toFixed(1)}%`,
            `maxDepth: ${maxDepth}`,
            `avgTextLength: ${avgTextLength.toFixed(0)} chars`,
            `textComponents: ${textComponents}`,
            `lexMatches: ${(allText.match(this.HUD_STRUCTURAL_PROFILES[topCategory as keyof typeof this.HUD_STRUCTURAL_PROFILES]?.lexicalTriggers || /(?:)/) || []).length}`
        );

        return {
            interfaceId,
            score: topScore,
            confidence,
            category: confidence === "FALSE_POSITIVE" ? "UNKNOWN" : (topCategory as HUDClassification["category"]),
            reasons,
            structuralMetrics: {
                textRatio,
                spriteRatio,
                containerRatio,
                maxDepth,
                avgTextLength,
                totalComponents
            }
        };
    }

    /**
     * searchInterfaces(query) - Forensic scan across interface text labels.
     * Now uses structural classification to filter false positives.
     */
    public async searchInterfaces(query: string, limit: number = 10): Promise<Result<InterfaceForensics[]>> {
        if (!this.cache) return err(new Error('Cache substrate not connected.'));

        const results: InterfaceForensics[] = [];
        const regex = new RegExp(query, 'i');

        for (let id = 0; id < 2000; id++) {
            try {
                const res = await this.getInterface(id);
                if (res.ok) {
                    const forensics = res.value;
                    const hasLexicalHit = forensics.textLabels.some(t => regex.test(t));
                    
                    // NEW: Only promote to results if lexical hit AND not false positive
                    if (hasLexicalHit && forensics.classification?.confidence !== "FALSE_POSITIVE") {
                        results.push(forensics);
                        if (results.length >= limit) break;
                    }
                }
            } catch {
                continue;
            }
        }

        // Sort by classification score descending
        results.sort((a, b) => (b.classification?.score || 0) - (a.classification?.score || 0));
        return ok(results);
    }

    /**
     * scanAtlas - Batch classify all decomposed JSON manifests in atlas directory.
     */
    public async scanAtlas(atlasDir?: string): Promise<HUDClassification[]> {
        const dir = atlasDir || this.pedagogyCandidateDir;
        const files = await fs.promises.readdir(dir);
        const jsonFiles = files.filter(f => f.endsWith('_decomposed.json'));

        const results: HUDClassification[] = [];
        for (const file of jsonFiles) {
            try {
                const raw = await fs.promises.readFile(path.join(dir, file), 'utf-8');
                const manifest = JSON.parse(raw);
                const components: InterfaceComponent[] = manifest.components || [];
                const textLabels = components
                    .filter((c: any) => c.type === "TEXT")
                    .map((c: any) => c.text || "")
                    .filter(Boolean);

                const id = parseInt(file.match(/interface_(\d+)_decomposed/)?.[1] || "0", 10);
                const classification = this.classifyInterface(id, components, textLabels);
                results.push(classification);
            } catch (e) {
                logger.warn({ file, error: (e as Error).message }, 'Failed to classify atlas manifest.');
            }
        }

        const confOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, FALSE_POSITIVE: 3 };
        return results.sort((a, b) => {
            if (confOrder[a.confidence] !== confOrder[b.confidence]) {
                return confOrder[a.confidence] - confOrder[b.confidence];
            }
            return b.score - a.score;
        });
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
     * Compute maximum nesting depth of component hierarchy.
     */
    private computeMaxDepth(components: InterfaceComponent[]): number {
        const idMap = new Map<number, InterfaceComponent>();
        components.forEach(c => { if (c.componentId !== undefined) idMap.set(c.componentId, c); });

        function getDepth(id: number, visited = new Set<number>()): number {
            if (visited.has(id)) return 0;
            visited.add(id);
            const comp = idMap.get(id);
            if (!comp || comp.parentId === -1 || comp.parentId === 65535) return 1;
            return 1 + getDepth(comp.parentId, visited);
        }

        let max = 0;
        components.forEach(c => {
            if (c.componentId !== undefined) {
                max = Math.max(max, getDepth(c.componentId));
            }
        });
        return max;
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

    /**
     * extractAllInterfaces - Bulk extract and decompose all Major 3 interfaces to disk.
     * Writes interface_<id>_decomposed.json for every interface with >0 components.
     * Skips IDs where the file already exists unless force=true.
     */
    public async extractAllInterfaces(options: {
        range?: [number, number];
        outputDir?: string;
        force?: boolean;
        onProgress?: (current: number, total: number, found: number, errors: number) => void;
    } = {}): Promise<{ extracted: number; skipped: number; errors: number; errorIds: number[] }> {
        if (!this.cache) throw new Error('Cache substrate not connected.');
        if (!parse) throw new Error('HUDForensicsLimb: parse not available.');

        const [start, end] = options.range ?? [0, 2000];
        const outputDir = options.outputDir ?? this.pedagogyCandidateDir;
        const force = options.force ?? false;
        const total = end - start + 1;

        await fs.promises.mkdir(outputDir, { recursive: true });

        let extracted = 0;
        let skipped = 0;
        let errors = 0;
        const errorIds: number[] = [];

        for (let id = start; id <= end; id++) {
            const outPath = path.join(outputDir, `interface_${id}_decomposed.json`);

            // Skip if already exists and not forcing
            if (!force && fs.existsSync(outPath)) {
                skipped++;
                options.onProgress?.(id - start + 1, total, extracted, errors);
                continue;
            }

            const res = await this.getInterface(id);

            if (res.ok && res.value.components.length > 0) {
                // Compute type distribution for the manifest
                const comps = res.value.components;
                const typeDistribution: Record<string, number> = {};
                for (const c of comps) {
                    typeDistribution[c.type] = (typeDistribution[c.type] || 0) + 1;
                }

                const manifest = {
                    interfaceId: res.value.interfaceId,
                    totalComponents: comps.length,
                    parsedComponents: comps.length,
                    parseErrors: 0,
                    spriteReferences: [...new Set(comps.map(c => c.spriteId).filter(Boolean))],
                    modelReferences: [...new Set(comps.map(c => c.modelId).filter(Boolean))],
                    textLabels: res.value.textLabels,
                    typeDistribution,
                    classification: res.value.classification,
                    components: comps,
                    extractedAt: new Date().toISOString(),
                };

                await fs.promises.writeFile(outPath, JSON.stringify(manifest, null, 2));
                extracted++;
                logger.info({ id, components: comps.length }, 'Interface extracted.');
            } else if (!res.ok) {
                errors++;
                errorIds.push(id);
            }
            // Empty interfaces (0 components) are valid skips — not errors

            options.onProgress?.(id - start + 1, total, extracted, errors);
        }

        return { extracted, skipped, errors, errorIds };
    }
}
