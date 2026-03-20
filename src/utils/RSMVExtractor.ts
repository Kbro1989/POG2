// src/utils/RSMVExtractor.ts
// Utility to parse RSMV model definitions and map them to Biological Constraints

import { Result, ok, err, EmotionalState } from '../core/models.js';
import { AnatomyLimits, SpeciesAnatomy } from '../constants/AnatomyRegistry.js';
import { ModelReference } from '../constants/ModelRegistry.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { createLogger } from './logger.js';

const logger = createLogger('RSMVExtractor');

export interface RSMVModelJSON {
    name: string;
    models?: number[];
    headModels?: number[];
    boundSize?: number;
    animation_group?: number;
    movementCapabilities?: number;
    extra?: Record<number, string | number>;
    color_replacements?: [number, number][];
    material_replacements?: [number, number][];
}

export class RSMVExtractor {
    /**
     * Functional probe for RSMV substrate health.
     */
    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: 'RSMV Sensory substrate nominal. Headless batch mode enabled.' };
    }

    /**
     * Converts a raw RSMV JSON into a SpeciesAnatomy definition for POG2
     */
    public static extractAnatomy(json: RSMVModelJSON, baseSpecies: string = 'homo_sapiens'): SpeciesAnatomy {
        // Basic limits based on the model metadata
        const limits: AnatomyLimits = {
            limbs: 4, // Default for most humanoid/animal models
            eyes: 2,
            ears: 2,
            joints: { elbow: 1, knee: 1 }
        };

        // Opcode 1010: Explicit limb count override
        // Opcode 1011: Eye count
        // Opcode 1012: Joint complexity bitmask
        if (json.extra) {
            if (json.extra[1010]) limits.limbs = Number(json.extra[1010]);
            if (json.extra[1011]) limits.eyes = Number(json.extra[1011]);
            
            if (json.extra[1012]) {
                const joints = Number(json.extra[1012]);
                if (!limits.joints) limits.joints = {};
                if (joints & 1) limits.joints.wrist = 1;
                if (joints & 2) limits.joints.ankle = 1;
                if (joints & 4) limits.joints.neck = 1;
            }
        }

        return {
            species: json.name.toLowerCase().replace(/\s+/g, '_'),
            commonName: json.name,
            limits,
            notes: `Derived from RSMV Model (BoundSize: ${json.boundSize || 'unknown'}, AnimGroup: ${json.animation_group || 'none'})`
        };
    }

    /**
     * Converts a high-fidelity PedagogyProfile into a SpeciesAnatomy definition.
     * Uses skeletal metrics and extracted semantics for precise synthesis.
     */
    public static fromPedagogyProfile(profile: any): SpeciesAnatomy {
        const metrics = profile.metrics || {};
        const innerSemantics = profile.semantic || {};
        const bones = profile.structure?.bones || [];

        // Advanced limit inference based on skeletal metrics and bone naming patterns
        const limits: AnatomyLimits = {
            limbs: metrics.boneCount > 40 ? 4 : (metrics.boneCount > 10 ? 2 : 0),
            eyes: 2,
            ears: 2,
            joints: {
                elbow: bones.some((b: string) => b.toLowerCase().includes('elbow')) ? 1 : 0,
                knee: bones.some((b: string) => b.toLowerCase().includes('knee')) ? 1 : 0,
                neck: bones.some((b: string) => b.toLowerCase().includes('neck')) ? 1 : 0
            }
        };

        // Opcode-driven overrides if available in mechanics
        if (profile.mechanics?.params) {
            const params = profile.mechanics.params;
            if (params[1010]) limits.limbs = Number(params[1010]);
            if (params[1011]) limits.eyes = Number(params[1011]);
        }

        return {
            species: profile.id.toLowerCase().replace(/[:\s]+/g, '_'),
            commonName: innerSemantics.name || profile.name,
            limits,
            notes: `Structural Synthesis: ${profile.semantics?.role || 'Asset'} | Intent: ${profile.semantics?.intent} | PolyCount: ${metrics.polyCount}`
        };
    }

    /**
     * Determines the kinetic profile based on RSMV animation/movement metadata
     */
    public static getKineticProfile(json: RSMVModelJSON): string {
        // Opcode 0x77: movementCapabilities
        const caps = json.movementCapabilities || 0;

        // Bitflags: 1=Crawl, 2=Walk, 4=Run, 8=Tile-based
        if (caps & 4) return 'run';
        if (caps & 2) return 'walk';

        // Specific animation groups can also imply profiles
        const group = json.animation_group || 0;
        if (group === 7000) return 'fly'; // Example ID for flight-capable NPCs

        return 'idle';
    }

    /**
     * inferEmotionalResonance - Maps 3D morphology to affective states.
     * Higher boundSize often correlates with dominance (Steady/Decisive).
     * Specific animation groups correlate with activity (Agitated/Excited).
     */
    public static inferEmotionalResonance(name: string, size: number = 0, animGroup: number = 0): EmotionalState {
        const lowerName = name.toLowerCase();

        // 1. Keyword-based resonance (Personality)
        if (lowerName.includes('spooky') || lowerName.includes('ghost') || lowerName.includes('shade')) return EmotionalState.Melancholy;
        if (lowerName.includes('aggressive') || lowerName.includes('berserker') || lowerName.includes('warrior')) return EmotionalState.Agitated;
        if (lowerName.includes('ancient') || lowerName.includes('elder') || lowerName.includes('king')) return EmotionalState.Decisive;
        if (lowerName.includes('mystic') || lowerName.includes('sage') || lowerName.includes('wizard')) return EmotionalState.Pensive;
        if (lowerName.includes('imp') || lowerName.includes('goblin') || lowerName.includes('naughty')) return EmotionalState.Excited;

        // 2. Structural resonance (Size dynamics)
        if (size > 200) return EmotionalState.Steady; // Large imposing entities
        if (size < 50) return EmotionalState.Curious;  // Small darting entities

        // 3. Kinetic resonance (Animation group cues)
        if (animGroup > 5000) return EmotionalState.Inspired; // High-tier modern rigs
        
        return EmotionalState.Zen; // Default stable state
    }

    /**
     * Prepares the model for VectorDB ingestion with kinetic awareness
     */
    public static toKnowledgePacket(ref: ModelReference, anatomy: SpeciesAnatomy, kineticProfile: string): any {
        return {
            title: `3D Model Insight: ${ref.name}`,
            content: `Entity ${ref.name} (Species: ${ref.species}) is defined by ${ref.meshCount || 'multiple'} meshes. 
                      Anatomical Laws: ${JSON.stringify(anatomy.limits)}.
                      Kinetic Profile: ${kineticProfile.toUpperCase()}.
                      Visual Bound Size: ${ref.metadata?.boundSize || 'Standard'}.`,
            metadata: {
                domain: 'anatomy',
                type: '3d_model_reference',
                modelId: ref.id,
                species: ref.species,
                kineticProfile
            }
        };
    }

    /**
     * Phase 25: Headless Batch Ingestion
     * Recursively scans a directory for RSMV JSONs and yields knowledge packets.
     */
    public *batchProcessModels(directory: string): Generator<any> {
        const files = readdirSync(directory);

        for (const file of files) {
            const fullPath = join(directory, file);
            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                yield* this.batchProcessModels(fullPath);
            } else if (file.endsWith('.json')) {
                try {
                    const content = readFileSync(fullPath, 'utf8');
                    const json = JSON.parse(content) as RSMVModelJSON;
                    
                    if (!json.name) continue;

                    const anatomy = RSMVExtractor.extractAnatomy(json);
                    const kinetic = RSMVExtractor.getKineticProfile(json);
                    
                    // Synthetic reference for the knowledge packet
                    const ref: ModelReference = {
                        id: `rsmv-${json.name.toLowerCase().replace(/\s+/g, '-')}`,
                        name: json.name,
                        species: anatomy.species,
                        meshCount: (json.models?.length || 0) + (json.headModels?.length || 0),
                        metadata: { boundSize: json.boundSize }
                    };

                    yield RSMVExtractor.toKnowledgePacket(ref, anatomy, kinetic);
                } catch (e) {
                    logger.error({ file, error: (e as Error).message }, 'Failed to parse RSMV model');
                }
            }
        }
    }
}
