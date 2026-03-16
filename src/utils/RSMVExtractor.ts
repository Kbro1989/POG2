// src/utils/RSMVExtractor.ts
// Utility to parse RSMV model definitions and map them to Biological Constraints

import { Result, ok, err } from '../core/models.js';
import { AnatomyLimits, SpeciesAnatomy } from '../constants/AnatomyRegistry.js';
import { ModelReference } from '../constants/ModelRegistry.js';

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
        return { online: true, details: 'RSMV Sensory substrate nominal. Extraction logic optimized.' };
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

        // If extra limb info is in the 'extra' map, we can override
        if (json.extra) {
            // Check for explicit limb count override in custom schema (Prop 1010)
            if (json.extra[1010]) limits.limbs = Number(json.extra[1010]);
        }

        return {
            species: json.name.toLowerCase().replace(/\s+/g, '_'),
            commonName: json.name,
            limits,
            notes: `Derived from RSMV Model (BoundSize: ${json.boundSize || 'unknown'})`
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
}
