import { Result, ok, err, YaoState } from '../../core/models.js';
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

const logger = createLogger('PedagogyLimb');

/**
 * PedagogyLimb - Cognitive Curation & Learning Substrate
 * Orchestrates the "Learning Loop" by taking cache metrics (Forensics),
 * pushing them through the Topology organ (3D Mathematics), and
 * persisting the cognitive pedagogical profile into memory.
 */
export class PedagogyLimb {
    private readonly rootDir = process.cwd(); // pog-vibe-interactive/files
    private forensics: CacheForensicsLimb;
    private topology: TopologyLimb;

    constructor() {
        this.forensics = new CacheForensicsLimb();
        this.topology = new TopologyLimb();
        logger.info('PedagogyLimb initialized. Linked to Forensics and Topology.');
    }

    public healthCheck(): { online: boolean; details: string } {
        const forensicHealth = this.forensics.healthCheck();
        const topologyHealth = this.topology.healthCheck();
        return {
            online: forensicHealth.online && topologyHealth.online,
            details: `Pedagogy Loop Active. Forensics: ${forensicHealth.details} | Topology: ${topologyHealth.details}`
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

        const profile = this.synthesizeProfile(`NPC_${npcId}`, npcData.forensics.name, 'NPC', topologicalProfiles, {
            role: npcData.pedagogy.summary,
            intent: npcData.pedagogy.classification
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

        const profile = this.synthesizeProfile(`ITEM_${itemId}`, itemData.forensics.name, 'ITEM', topologicalProfiles, {
            role: itemData.pedagogy.summary,
            intent: itemData.forensics.isEquippable ? 'equippable' : 'static'
        });

        this.anchorToMemory(profile);
        return ok(profile);
    }

    /**
     * Performs a broad sweep of a type (NPC, PLAYER, LOC, etc.) and generates a generalized profile.
     */
    public async analyzeGroupByType(type: string, sampleSize: number = 20): Promise<Result<PedagogyProfile>> {
        logger.info({ type, sampleSize }, 'Synthesizing Generalized Type Pedagogy');
        
        // Logical mapping of types to cache archives/heuristics
        const typeMap: Record<string, { desc: string, poly: number, vert: number, bones: number, mat: number }> = {
            'NPC': { desc: 'Combat vs passive vs scenery NPC heuristics.', poly: 1500, vert: 5000, bones: 20, mat: 4 },
            'LOC': { desc: 'Static vs interactive object topology (materials, UV wrapping).', poly: 800, vert: 2500, bones: 0, mat: 2 },
            'ITEM': { desc: 'Inventory and equippable entity standards.', poly: 400, vert: 1200, bones: 5, mat: 2 },
            'PLAYER': { desc: 'Avatar chassis standards (bone density, attachment points).', poly: 3500, vert: 8000, bones: 80, mat: 12 },
            'MODEL': { desc: 'Raw mesh heuristics (triangle quality, point cloud density).', poly: 1000, vert: 3000, bones: 10, mat: 1 },
            'MAP': { desc: 'Environmental structural mathematics (tile geometry, heightfield resolution).', poly: 25000, vert: 100000, bones: 0, mat: 64 },
            'MATERIAL': { desc: 'Texture layering and shader complexity standards.', poly: 0, vert: 0, bones: 0, mat: 1 },
            'SPOTANIM': { desc: 'Particle and GFX mesh standards (short lived effects).', poly: 200, vert: 500, bones: 5, mat: 1 },
            'SCENARIO': { desc: 'Linking 3D heuristics to logic patterns and world events.', poly: 0, vert: 0, bones: 0, mat: 0 },
            'SCRIPTS': { desc: 'ClientScript/ServerScript logic-to-mesh interaction rules.', poly: 0, vert: 0, bones: 0, mat: 0 },
            'PEDAGOGY': { desc: 'Overarching cognitive rules for 3D learning and synthesis.', poly: 0, vert: 0, bones: 0, mat: 0 }
        };

        const config = typeMap[type];
        if (!config) return err(new Error(`Generalization aborted: Unsupported type ${type}`));

        // For now, return a synthesized "ideal" profile for the type
        const profile: PedagogyProfile = {
            id: `GROUP_${type}`,
            name: `Generalized ${type} Template`,
            type: 'GROUP',
            metrics: {
                polyCount: config.poly,
                vertexCount: config.vert,
                boneCount: config.bones,
                materialComplexity: config.mat,
                topologySummary: []
            },
            semantics: {
                role: config.desc,
                intent: 'type_summary' // Changed intent to 'type_summary' as per the provided snippet's intent
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
        semantics: { role: string, intent: string }
    ): PedagogyProfile {
        const totalPolyCount = topology.reduce((sum, p) => sum + p.triangleCount, 0);
        const totalVertexCount = topology.reduce((sum, p) => sum + p.vertexCount, 0);
        const maxBoneCount = Math.max(0, ...topology.map(p => p.boneCount));

        // For material complexity, if it's a group or if forensic data isn't available for individual items,
        // we might default to topology-based material count or a heuristic.
        // For individual items/npcs, we can use forensicData.forensics.colorReplacements if available.
        // Since forensicData is no longer passed directly, we'll use topology for material complexity.
        const materialComplexity = topology.reduce((sum, p) => sum + p.materials.length, 0);

        const structuralMetrics = {
            polyCount: totalPolyCount,
            vertexCount: totalVertexCount,
            boneCount: maxBoneCount,
            materialComplexity: materialComplexity,
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
            semantics: semantics,
            timestamp: Date.now()
        };

        return profile;
    }

    private anchorToMemory(profile: PedagogyProfile) {
        const memoryPath = path.join(getSovereignRoot(), 'memory', 'pedagogy', `${profile.type}_${profile.id}.json`);
        try {
            const dir = path.dirname(memoryPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(memoryPath, JSON.stringify(profile, null, 2));
            logger.info({ memoryPath }, 'Pedagogy anchored successfully to Sovereign memory.');
        } catch (e) {
            logger.error({ path: memoryPath }, 'Failed to anchor pedagogy to memory.');
        }
    }

    /**
     * Integrates large external JSON datasets (from the user's manual pulls)
     * as pedagogical reference lessons.
     */
    public async analyzeKinematics(sequenceId: number): Promise<Result<PedagogyProfile>> {
        const kinematicsLimb = new (await import('./KinematicsLimb.js')).KinematicsLimb();
        const res = await kinematicsLimb.extractKinematics(sequenceId);
        if (res.ok) {
            this.anchorToMemory(res.value);
        }
        return res;
    }

    public async analyzeDynamics(spotAnimId: number): Promise<Result<PedagogyProfile>> {
        const dynamicsLimb = new (await import('./DynamicsLimb.js')).DynamicsLimb();
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
