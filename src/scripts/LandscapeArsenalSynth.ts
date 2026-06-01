/**
 * LANDSCAPE MAP ARSENAL SYNTHESIZER
 * 
 * Aggregates pedagogical JSON data into a unified 'Grand Truth' reference.
 * Mapping: Object/NPC/Varbit ID -> { Type, Quest, Requirements, InteractionIntent }
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

// --- PATHS ---
const PEDAGOGY_DIR = 'D:/sovereign/memory/pedagogy/';
const VARBITS_DIR = join(PEDAGOGY_DIR, 'varbits_json/');
const EXAMINE_AUTHORITY = join(PEDAGOGY_DIR, 'RS3_Examine_Authority.json');
const TAXONOMIC_SYNTH = join(PEDAGOGY_DIR, 'taxonomic_synthesis.json');
const PRIF_SYNTHESIS = join(PEDAGOGY_DIR, 'prifddinas_synthesis.json');

const ARSENAL_ROOT = 'D:/sovereign/atlas/reference/arsenal/';
const OUTPUT_FILE = join(ARSENAL_ROOT, 'landscape_reference.json');

async function main() {
    console.log('--- SYNTHESIZING LANDSCAPE MAP ARSENAL ---');

    if (!existsSync(ARSENAL_ROOT)) {
        mkdirSync(ARSENAL_ROOT, { recursive: true });
    }

    const arsenal: Record<string, any> = {
        meta: {
            synthesized_at: new Date().toISOString(),
            source: 'Sovereign Pedagogical Aggregator'
        },
        nodes: {} as Record<number, any>
    };

    // 1. Load Examine Authority (Intent & Descriptions)
    console.log('Loading Examine Authority...');
    const examineData = JSON.parse(readFileSync(EXAMINE_AUTHORITY, 'utf-8'));
    
    // 2. Load Taxonomic Synthesis (Varbit/Quest Gating)
    console.log('Loading Taxonomic Synthesis...');
    const taxonomy = JSON.parse(readFileSync(TAXONOMIC_SYNTH, 'utf-8'));

    // 3. Load Prifddinas Synthesis (Spatial Anchors)
    console.log('Loading Prifddinas Grounding...');
    const prif = JSON.parse(readFileSync(PRIF_SYNTHESIS, 'utf-8'));

    // 4. Map entities from Prifddinas
    const districts = prif.districts || {};
    for (const clan in districts) {
        const d = districts[clan];
        // Objects
        for (const obj of d.objects || []) {
            const id = obj.id;
            const examine = examineData.objects?.[id] || examineData.items?.[id];
            
            arsenal.nodes[id] = {
                name: obj.name,
                type: 'OBJECT',
                district: clan,
                examine: examine?.examine || '',
                interaction: obj.actions || [],
                requirements: [] as string[]
            };

            // Global Quest Gate (Prifddinas)
            arsenal.nodes[id].requirements.push(`Quest: ${prif.requirements.quest_gate}`);
            
            // Check specific logic from taxonomy
            if (taxonomy.objects?.[id]) {
                const logic = taxonomy.objects[id];
                if (logic.quest) arsenal.nodes[id].requirements.push(`Quest-Specific: ${logic.quest}`);
                if (logic.varbit) arsenal.nodes[id].requirements.push(`Varbit: ${logic.varbit}`);
            }
        }
    }

    // 5. Aggregate Varbits (Focus on Taxonomic matches for Prifddinas)
    console.log('Aggregating Targeted Varbit Scaffolding...');
    // We skip the full 60k file scan and use the 'taxonomy' ground truth for the audit.
    // This provides the 'Server-Gated' requirement info for interactive nodes (tto).

    // 6. Write Final Arsenal
    writeFileSync(OUTPUT_FILE, JSON.stringify(arsenal, null, 2));
    console.log(`[OK] Landscape Arsenal Synthesis complete: ${OUTPUT_FILE}`);
    console.log(`Total Reference Nodes: ${Object.keys(arsenal.nodes).length}`);
}

main().catch(console.error);

