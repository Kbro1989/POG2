import { Result, ok, err, YaoState, EmotionalState } from '../../core/models.js';
import type { PedagogyProfile } from '../../core/models.js';
export { PedagogyProfile }; // Re-export for dependent limbs
import { createLogger } from "../../utils/logger.js";
import { getSovereignRoot } from "../../utils/SovereignPathResolver.js";
import { CacheForensicsLimb } from './CacheForensicsLimb.js';
import { TopologyLimb, TopologicalProfile } from './TopologyLimb.js';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { writeFileSync } from 'fs';
import { join } from 'path';

import { TernaryRouter } from '../../routing/TernaryRouter.js';
import { VectorDB } from '../../utils/VectorDB.js';
import { RSMVExtractor } from '../../utils/RSMVExtractor.js';
import { WikiEnricher } from '../../utils/WikiEnricher.js';
import { VectorPedagogyLimb } from './VectorPedagogyLimb.js';
import { ModelClient } from '../../clients/ModelClient.js';

const logger = createLogger('PedagogyLimb');

/**
 * PedagogyLimb - Cognitive Curation & Learning Substrate
 * Orchestrates the "Learning Loop" by taking cache metrics (Forensics),
 * pushing them through the Topology organ (3D Mathematics), and
 * persisting the cognitive pedagogical profile into memory.
 */
export class PedagogyLimb {
    private readonly rootDir = process.cwd(); // pog-vibe-interactive/files
    private forensics!: CacheForensicsLimb;
    private topology!: TopologyLimb;
    private router!: TernaryRouter;
    private vectorDB!: VectorDB;
    private vectorIndex!: VectorPedagogyLimb;
    private client!: ModelClient;

    constructor(router: TernaryRouter, vectorDB: VectorDB, client: ModelClient) {
        this.forensics = new CacheForensicsLimb();
        this.topology = new TopologyLimb();
        this.router = router;
        this.vectorDB = vectorDB;
        this.client = client;
        this.vectorIndex = new VectorPedagogyLimb(client);
        logger.info('PedagogyLimb initialized. Linked to Forensics, Topology, Router, and Substrate.');
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const forensicHealth = await this.forensics.healthCheck();
        const topologyHealth = await this.topology.healthCheck();
        const ok = forensicHealth.online && topologyHealth.online;
        return {
            online: ok,
            details: `Pedagogy Loop: ${ok ? 'ONLINE' : 'DEGRADED'} (Forensics: ${forensicHealth.details} | Topology: ${topologyHealth.details})`
        };
    }

    /**
     * The core learning loop:
     * 1. Extract context from Forensics (what is this thing?)
     * 2. Trigger TopologyLimb (how is it structured?)
     * 3. Fuse data into a PedagogyProfile.
     */
    public async analyzeNpc(npcId: number, yaoState: YaoState = YaoState.OldYang): Promise<Result<any>> {
        logger.info({ npcId, yaoState }, 'Initiating Pedagogy Loop for NPC');

        const forensicRes = await this.forensics.getNpcDetails(npcId);
        if (!forensicRes.ok) return err(new Error(`Pedagogy aborted: Forensics failed for NPC ${npcId}`));

        const npcData = forensicRes.value;
        const bodyModels = npcData.forensics.models || [];
        const headModels = npcData.forensics.headModels || [];
        const modelIds = [...new Set([...bodyModels, ...headModels])];
        const topologicalProfiles: TopologicalProfile[] = [];

        for (const modelId of modelIds) {
            const topoRes = await this.topology.extractTopology(modelId);
            if (topoRes.ok) topologicalProfiles.push(topoRes.value);
        }

        const wikiRes = await WikiEnricher.enrich(npcData.forensics.name);
        const wikiData = wikiRes.ok ? wikiRes.value : null;

        const profile = this.synthesizeProfile(`NPC_${npcId}`, npcData.forensics.name, 'NPC', topologicalProfiles, {
            role: wikiData?.role || npcData.pedagogy.summary,
            race: wikiData?.race,
            intent: wikiData?.intent || npcData.pedagogy.classification,
            wikiUrl: wikiData?.url,
            wikiLore: wikiData?.intent // The extract we pulled earlier
        });

        this.anchorToMemory(profile);
        return ok(profile);
    }

    public async analyzeItem(itemId: number, yaoState: YaoState = YaoState.YoungYin): Promise<Result<any>> {
        logger.info({ itemId, yaoState }, 'Initiating Pedagogy Loop for ITEM');

        const forensicRes = await this.forensics.getItemDetails(itemId);
        if (!forensicRes.ok) return err(new Error(`Pedagogy aborted: Forensics failed for ITEM ${itemId}`));

        const itemData = forensicRes.value;
        const maleModels = (itemData.forensics.maleModels || []).filter((m: any) => m !== null) as number[];
        const femaleModels = (itemData.forensics.femaleModels || []).filter((m: any) => m !== null) as number[];
        const modelIds = [...new Set([...maleModels, ...femaleModels])];
        const topologicalProfiles: TopologicalProfile[] = [];

        for (const modelId of modelIds) {
            const topoRes = await this.topology.extractTopology(modelId);
            if (topoRes.ok) topologicalProfiles.push(topoRes.value);
        }

        const wikiRes = await WikiEnricher.enrich(itemData.forensics.name);
        const wikiData = wikiRes.ok ? wikiRes.value : null;

        const profile = this.synthesizeProfile(`ITEM_${itemId}`, itemData.forensics.name, 'ITEM', topologicalProfiles, {
            role: wikiData?.role || itemData.pedagogy.summary,
            intent: wikiData?.intent || (itemData.forensics.isEquippable ? 'equippable' : 'static'),
            wikiUrl: wikiData?.url,
            wikiLore: wikiData?.intent
        });

        this.anchorToMemory(profile);
        return ok(profile);
    }

    /**
     * Performs a broad sweep of a type (NPC, PLAYER, LOC, etc.) and generates a generalized profile.
     * Evolved to use Sovereign AI synthesis for the "Ideal Standard".
     */
    public async analyzeGroupByType(type: string, sampleSize: number = 20): Promise<Result<PedagogyProfile>> {
        logger.info({ type, sampleSize }, 'Synthesizing Sovereign Type Pedagogy via AI...');
        
        const typeMap: Record<string, any> = {
            'NPC': { poly: 1500, vert: 5000, bones: 20, mat: 4 },
            'LOC': { poly: 800, vert: 2500, bones: 0, mat: 2 },
            'ITEM': { poly: 400, vert: 1200, bones: 5, mat: 2 },
            'PLAYER': { poly: 3500, vert: 8000, bones: 80, mat: 12 }
        };

        const metrics = typeMap[type] || { poly: 1000, vert: 3000, bones: 10, mat: 1 };

        // Sovereign AI Synthesis of the "Ideal Standard"
        const prompt = `
You are the Sovereign Game Architect of POG2.
Synthesize the "Generative Standard" for a game entity type: ${type}.
Consider the technical constraints of 3D rendering vs. the cinematic needs of high-fidelity world-building.

PROMPT: Generate a 2-sentence profound generative rule for creating assets of type "${type}". 
The first sentence should define its architectural essence. 
The second should define its cinematic intent.
        `;

        const aiRes = await this.client.call({
            model: this.client.config.fastPathModel,
            prompt,
            systemPrompt: 'You are an advanced Game Architecture AI. Synthesize profound design wisdom.',
            temperature: 0.7
        });

        const generalizedRole = aiRes.ok ? aiRes.value.response.trim() : `Ideal standard for ${type} based on substrate heuristics.`;

        const profile: PedagogyProfile = {
            id: `GROUP_${type}`,
            name: `Generalized ${type} Template (Sovereign)`,
            type: 'GROUP',
            metrics: {
                polyCount: metrics.poly,
                vertexCount: metrics.vert,
                boneCount: metrics.bones,
                materialComplexity: metrics.mat,
                topologySummary: []
            },
            semantics: {
                role: generalizedRole,
                intent: 'type_summary'
            },
            timestamp: Date.now()
        };

        this.anchorToMemory(profile);
        return ok(profile);
    }

    /**
     * Synthesizes a pedagogy profile from forensic and topological data.
     */
    private synthesizeProfile(
        id: string,
        name: string,
        type: 'NPC' | 'ITEM' | 'OBJECT' | 'GROUP' | 'KINEMATIC' | 'DYNAMIC',
        topology: any[],
        semantics: { role: string, intent: string, race?: string, wikiUrl?: string, wikiLore?: string }
    ): PedagogyProfile {
        const totalPolyCount = topology.reduce((sum, p) => sum + p.triangleCount, 0);
        const totalVertexCount = topology.reduce((sum, p) => sum + p.vertexCount, 0);
        const maxBoneCount = Math.max(0, ...topology.map(p => p.boneCount));

        // Affective Inference (Phase 7)
        const resonance = RSMVExtractor.inferEmotionalResonance(name, totalPolyCount, 0);

        const structuralMetrics = {
            polyCount: totalPolyCount,
            vertexCount: totalVertexCount,
            boneCount: maxBoneCount,
            materialComplexity: topology.reduce((sum, p) => sum + p.materials.length, 0),
            topologySummary: topology.map(p => ({
                id: p.modelId,
                tris: p.triangleCount,
                verts: p.vertexCount,
                skinned: p.hasSkinning
            }))
        };

        const profile: PedagogyProfile = {
            id: id,
            name: name,
            type,
            metrics: structuralMetrics,
            semantics: {
                ...semantics,
                affectiveResonance: resonance,
                emotionalCharge: this.calculateEmotionalCharge(resonance)
            },
            timestamp: Date.now()
        };

        return profile;
    }

    private calculateEmotionalCharge(resonance: EmotionalState): number {
        const mapping: Record<EmotionalState, number> = {
            [EmotionalState.Inspired]: 0.8,
            [EmotionalState.Steady]: 0.2,
            [EmotionalState.Agitated]: -0.6,
            [EmotionalState.Curious]: 0.4,
            [EmotionalState.Quiet]: -0.1,
            [EmotionalState.Surprised]: 0.7,
            [EmotionalState.Decisive]: 0.9,
            [EmotionalState.Zen]: 0.0,
            [EmotionalState.Excited]: 0.85,
            [EmotionalState.Frustrated]: -0.7,
            [EmotionalState.Pensive]: 0.3,
            [EmotionalState.Melancholy]: -0.4
        };
        return mapping[resonance] || 0;
    }

    private anchorToMemory(profile: PedagogyProfile) {
        const memoryPath = path.join(getSovereignRoot(), 'memory', 'pedagogy', `${profile.type}_${profile.id}.json`);
        try {
            const dir = path.dirname(memoryPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(memoryPath, JSON.stringify(profile, null, 2));
            logger.info({ memoryPath }, 'Pedagogy anchored successfully to Sovereign memory.');
            
            // Phase 8: Vector Ingestion
            this.vectorIndex.ingestProfile(profile).catch((err: Error) => {
                logger.error({ id: profile.id, error: err.message }, 'Failed to vectorize pedagogy profile.');
            });
        } catch (e) {
            logger.error({ path: memoryPath }, 'Failed to anchor pedagogy to memory.');
        }
    }

    /**
     * Integrates large external JSON datasets (from the user's manual pulls)
     * as pedagogical reference lessons.
     */
    public async analyzeKinematics(sequenceId: number): Promise<Result<PedagogyProfile>> {
        const kinematicsLimb = new (await import('./KinematicsLimb.js')).KinematicsLimb(this.router, this.vectorDB);
        const res = await kinematicsLimb.extractKinematics(sequenceId);
        if (res.ok) {
            this.anchorToMemory(res.value);
        }
        return res;
    }

    public async analyzeDynamics(spotAnimId: number): Promise<Result<PedagogyProfile>> {
        const dynamicsLimb = new (await import('./DynamicsLimb.js')).DynamicsLimb(this.router, this.vectorDB);
        const res = await dynamicsLimb.extractDynamics(spotAnimId);
        if (res.ok) {
            this.anchorToMemory(res.value);
        }
        return res;
    }
    public async analyzeReferenceDataset(fileName: string, data: any): Promise<Result<PedagogyProfile>> {
        logger.info({ fileName }, 'Analyzing External Reference Dataset for Pedagogy');

        const profile: PedagogyProfile = {
            id: `REFERENCE_${fileName.replace(/\.[^/.]+$/, "")}`,
            name: `Pedagogical Reference: ${fileName}`,
            type: 'GROUP',
            metrics: {
                polyCount: 0,
                vertexCount: 0,
                boneCount: 0,
                materialComplexity: 0,
                topologySummary: []
            },
            semantics: {
                role: `High-density reference data extracted from ${fileName}. Used for broader context window construction.`,
                intent: 'reference_atlas'
            },
            timestamp: Date.now()
        };

        // Attach snippet or summary to metrics if needed.
        // For now, we anchor the profile and return.
        this.anchorToMemory(profile);
        return ok(profile);
    }

    /**
     * Aggregates metrics from a specific group of IDs into a generalized profile.
     */
    public async analyzeGroup(label: string, type: 'NPC' | 'ITEM' | 'OBJECT', ids: number[], yaoState: YaoState): Promise<Result<PedagogyProfile>> {
        logger.info({ label, type, count: ids.length }, 'Initiating Group Pedagogy Analysis');
        
        const profiles: TopologicalProfile[] = [];
        
        for (const id of ids) {
            const res = type === 'NPC' ? await this.analyzeNpc(id, yaoState) :
                        type === 'ITEM' ? await this.analyzeItem(id, yaoState) :
                        ok(null); // Objects not implemented yet
            
            if (res.ok && res.value) {
                // Profile analysis already happened, we just need the topology
                // But analyzeNpc returns a PedagogyProfile which doesn't directly expose the array of TopologicalProfiles 
                // unless we change the internal storage.
                // For now, let's assume we want to re-extract raw topology for the group.
                // TODO: Optimize this by caching individual IDs
            }
        }
        
        // This is a stub for the heavy lifting: sampling and averaging metrics.
        // In the interest of efficiency, we'll implement a fast-path that identifies
        // the "Standard" for the group based on the IDs provided.
        
        return err(new Error('analyzeGroup implementation in progress.'));
    }

    public close(): void {
        this.topology.close();
        this.forensics.close();
    }
}
