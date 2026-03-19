import { Result, ok, err, YaoState } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';
import { CacheForensicsLimb } from './CacheForensicsLimb.js';
import { TopologyLimb, TopologicalProfile } from './TopologyLimb.js';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

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

        const profile = this.synthesizeProfile(npcData, 'NPC', yaoState, topologicalProfiles);
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

        const profile = this.synthesizeProfile(itemData, 'ITEM', yaoState, topologicalProfiles);
        return ok(profile);
    }

    /**
     * Synthesizes a pedagogy profile from forensic and topological data.
     */
    private synthesizeProfile(forensicData: any, type: 'NPC' | 'ITEM' | 'OBJECT', yao: YaoState, topology: TopologicalProfile[]) {
        const totalPolyCount = topology.reduce((sum, p) => sum + p.triangleCount, 0);
        const totalVertexCount = topology.reduce((sum, p) => sum + p.vertexCount, 0);
        const maxBoneCount = Math.max(0, ...topology.map(p => p.boneCount));

        const structuralMetrics = {
            polyCount: totalPolyCount,
            vertexCount: totalVertexCount,
            boneCount: maxBoneCount,
            materialComplexity: forensicData.forensics.colorReplacements ? forensicData.forensics.colorReplacements.length : topology.reduce((sum, p) => sum + p.materials.length, 0),
            topologySummary: topology.map(p => ({
                id: p.modelId,
                tris: p.triangleCount,
                verts: p.vertexCount,
                skinned: p.hasSkinning
            }))
        };

        const profile = {
            id: String(forensicData.id),
            name: forensicData.forensics.name,
            type,
            metrics: structuralMetrics,
            semantics: {
                role: forensicData.pedagogy.summary,
                classification: forensicData.pedagogy.classification || 'unknown',
                yaoState: yao 
            },
            timestamp: Date.now()
        };

        this.anchorPedagogyToMemory(profile);
        return profile;
    }

    private anchorPedagogyToMemory(profile: any) {
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

    public close() {
        this.topology.close();
        this.forensics.close();
    }
}
