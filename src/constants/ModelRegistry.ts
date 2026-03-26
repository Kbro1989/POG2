import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// src/constants/ModelRegistry.ts
// Maps 3D Model IDs and Entity names to Species and Anatomical Constraints

export interface ModelReference {
    id?: string | number;
    name: string;
    species: string; // Key in AnatomyRegistry
    rsmvPath?: string; // Path to .jsonc or .stl files
    meshCount?: number;
    kineticProfile?: string; // walk, run, fly, idle
    metadata?: Record<string, any>;
}

export const ModelRegistry: ModelReference[] = [
    {
        name: 'Woman',
        species: 'homo_sapiens',
        kineticProfile: 'walk',
        metadata: {
            kitSlots: ['face', 'hair', 'body', 'arms', 'hands', 'legs', 'feet'],
            baseAnatomy: 'human'
        }
    },
    {
        name: 'Man',
        species: 'homo_sapiens',
        kineticProfile: 'walk',
        metadata: {
            kitSlots: ['face', 'beard', 'body', 'arms', 'hands', 'legs', 'feet'],
            baseAnatomy: 'human'
        }
    },
    {
        name: 'Guard',
        species: 'homo_sapiens',
        id: 9,
        kineticProfile: 'walk',
        metadata: {
            armor: true,
            limbs: 4
        }
    },
    {
        name: 'Alice',
        species: 'homo_sapiens',
        kineticProfile: 'walk',
        metadata: {
            identity: 'Alice',
            visualStyle: 'character'
        }
    },
    {
        name: 'Dragon',
        species: 'dragon',
        id: 7000,
        kineticProfile: 'fly',
        metadata: {
            wings: 2,
            tail: true
        }
    }
];
