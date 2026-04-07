/**
 * UnifiedWorldProbe v3 - Sovereign Chain Audit
 * 
 * Hierarchy: God Head (ID) -> God Body (Location) -> Execution (Who/What/When/Where/Why)
 * Pulse: 600ms / Cycle: 6000ms
 * 
 * High-fidelity NPC logic including animation_groups and action_cursors.
 */

import * as fs from 'fs';
import * as path from 'path';

interface EntityExecution {
    name: string;
    actions: string[];
    cursors: number[];
    examine: string;
    requirements: string[];
    animation_group?: number;
    extra?: any[];
    combat?: number;
}

interface SovereignNode {
    id: string; // God Head
    locations: { x: number; y: number; z: number; district?: string }[]; // God Body
    execution: EntityExecution;
}

class SovereignChainProbe {
    private landscapePath = 'D:/sovereign/atlas/reference/arsenal/landscape_reference.json';
    private synthesisPath = 'D:/sovereign/memory/pedagogy/prifddinas_synthesis.json';
    private kineticPath = 'D:/sovereign/atlas/spatial/pathing_theory/kinetic_targets/';
    private examinePath = 'D:/sovereign/memory/pedagogy/RS3_Examine_Authority.json';
    private outputPath = 'D:/sovereign/atlas/spatial/pathing_theory/pog2_logical_chain_audit.json';

    async runAudit(districtFocus: string = 'ALL') {
        console.log(`[CNS] Initializing Sovereign Chain Audit [God Head -> God Body -> Execution]`);
        
        if (!fs.existsSync(this.landscapePath)) {
            console.error(`Arsenal missing at ${this.landscapePath}`);
            return;
        }

        // 1. Load God Head Base (landscape reference)
        const landscape = JSON.parse(fs.readFileSync(this.landscapePath, 'utf8'));
        const synthesis = fs.existsSync(this.synthesisPath) ? JSON.parse(fs.readFileSync(this.synthesisPath, 'utf8')) : { districts: {} };
        const examineData = fs.existsSync(this.examinePath) ? JSON.parse(fs.readFileSync(this.examinePath, 'utf8')) : { npcs: {}, items: {} };
        
        // 2. Load Kinetic Substrate (Actions/Cursors/Animation Groups)
        const kineticMap = new Map<string, any>();
        if (fs.existsSync(this.kineticPath)) {
            const kineticFiles = fs.readdirSync(this.kineticPath).filter(f => f.endsWith('.json') && !f.startsWith('.'));
            for (const file of kineticFiles) {
                const batch = JSON.parse(fs.readFileSync(path.join(this.kineticPath, file), 'utf8'));
                if (batch.files) {
                    batch.files.forEach((f: any) => {
                        kineticMap.set(f.$fileid.toString(), f);
                    });
                }
            }
        }

        const chainAudit: SovereignNode[] = [];

        // 3. Build the Sovereign Chain
        // For each ID in the landscape (God Head)
        for (const [id, meta] of Object.entries(landscape.nodes || landscape)) {
            const typedMeta = meta as any;
            if (districtFocus !== 'ALL' && typedMeta.district !== districtFocus) continue;

            const kinetic = kineticMap.get(id);
            const examine = examineData.npcs?.[id] || examineData.items?.[id] || { examine: "" };

            // Find God Body Locations (from synthesis)
            const locations: { x: number; y: number; z: number; district?: string }[] = [];
            for (const districtName in synthesis.districts) {
                const d = synthesis.districts[districtName];
                const instances = (d.objects || []).filter((obj: any) => obj.id.toString() === id);
                instances.forEach((inst: any) => {
                    locations.push({ x: inst.x, y: inst.y, z: 0, district: districtName });
                });
            }

            // Extract execution attributes
            const actions: string[] = [];
            const cursors: number[] = [];
            if (kinetic) {
                for (let i = 0; i < 5; i++) {
                    if (kinetic[`actions_${i}`]) actions.push(kinetic[`actions_${i}`]);
                    if (kinetic[`action_cursors_${i}`]) cursors.push(kinetic[`action_cursors_${i}`]);
                }
            }

            const node: SovereignNode = {
                id: id,
                locations: locations, // God Body (multiples)
                execution: {
                    name: typedMeta.name,
                    actions: actions.length > 0 ? actions : (typedMeta.interaction || []),
                    cursors: cursors,
                    examine: examine.examine || typedMeta.examine || "",
                    requirements: typedMeta.requirements || [],
                    animation_group: kinetic?.animation_group,
                    extra: kinetic?.extra,
                    combat: kinetic?.combat
                }
            };
            
            chainAudit.push(node);
        }

        fs.writeFileSync(this.outputPath, JSON.stringify(chainAudit, null, 2));
        console.log(`[CNS] Audit Complete. ${chainAudit.length} Sovereign Chains generated.`);
        this.generateSpatialGrid(chainAudit);
    }

    private generateSpatialGrid(nodes: SovereignNode[]) {
        const gridDim = 50;
        let grid = Array(gridDim).fill(0).map(() => Array(gridDim).fill('.'));

        // Map God Body locations to the grid (clipping to grid center)
        nodes.forEach(node => {
            node.locations.forEach(loc => {
                const gx = Math.floor(loc.x % gridDim);
                const gy = Math.floor(loc.y % gridDim);
                
                if (node.execution.actions.length > 0) {
                    grid[gy][gx] = 'O'; // Interactive (God Head has 'What')
                } else if (node.execution.requirements.length > 0) {
                    grid[gy][gx] = 'X'; // Gated (God Head has 'Why')
                } else {
                    grid[gy][gx] = 'T'; // Static
                }
            });
        });

        const gridPath = 'D:/sovereign/atlas/spatial/pathing_theory/prifddinas_audit_grid.txt';
        const gridStr = grid.reverse().map(row => row.join(' ')).join('\n');
        fs.writeFileSync(gridPath, gridStr);
        console.log(`[CNS] High-Fidelity Spatial Grid Refined (God Body Grounding): ${gridPath}`);
    }
}

const probe = new SovereignChainProbe();
// Execution for tsx/esm environment
probe.runAudit('ALL').catch(console.error);

export default SovereignChainProbe;
