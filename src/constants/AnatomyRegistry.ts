// src/constants/AnatomyRegistry.ts
// Hard constraints for anatomy validation in POG2

export type AnatomyLimits = {
    limbs: number;
    arms?: number;
    legs?: number;
    eyes?: number;
    ears?: number;
    wings?: number;
    tail?: boolean;
    joints?: Record<string, number>; // e.g., { elbow: 1, knee: 1 }
};

export interface SpeciesAnatomy {
    species: string;
    commonName: string;
    limits: AnatomyLimits;
    notes?: string; // Any special constraints
}

export const AnatomyRegistry: SpeciesAnatomy[] = [
    {
        species: 'homo_sapiens',
        commonName: 'Human',
        limits: {
            limbs: 4,
            arms: 2,
            legs: 2,
            eyes: 2,
            ears: 2,
            joints: {
                elbow: 1,
                knee: 1,
                shoulder: 1,
                hip: 1
            }
        },
        notes: 'Standard adult human anatomy.'
    },
    {
        species: 'canis_lupus_familiaris',
        commonName: 'Dog',
        limits: {
            limbs: 4,
            legs: 4,
            eyes: 2,
            ears: 2,
            tail: true,
            joints: {
                knee: 1,
                elbow: 1,
                shoulder: 1,
                hip: 1
            }
        },
        notes: 'Quadruped anatomy.'
    },
    {
        species: 'felis_catus',
        commonName: 'Cat',
        limits: {
            limbs: 4,
            legs: 4,
            eyes: 2,
            ears: 2,
            tail: true,
            joints: {
                knee: 1,
                elbow: 1,
                shoulder: 1,
                hip: 1
            }
        },
        notes: 'Domestic cat.'
    },
    {
        species: 'mus_musculus',
        commonName: 'Mouse',
        limits: {
            limbs: 4,
            legs: 4,
            eyes: 2,
            ears: 2,
            tail: true,
            joints: {
                knee: 1,
                elbow: 1,
                shoulder: 1,
                hip: 1
            }
        },
        notes: 'Standard lab mouse anatomy.'
    },
    // --- Fantasy / Substrate-Bending Entities ---
    {
        species: 'alfar_borealis',
        commonName: 'Elf',
        limits: {
            limbs: 4,
            arms: 2,
            legs: 2,
            eyes: 2,
            ears: 2, // Pointed / Elongated
            joints: {
                elbow: 1,
                knee: 1,
                shoulder: 1,
                hip: 1
            }
        },
        notes: 'Slender humanoid, hyper-articulated ears.'
    },
    {
        species: 'draco_ignis',
        commonName: 'Dragon',
        limits: {
            limbs: 6, // 4 legs + 2 wings
            legs: 4,
            wings: 2,
            eyes: 2,
            ears: 0, // Usually horns/slits
            tail: true,
            joints: {
                knee: 1,
                wing_joint: 2,
                tail_vertebrae: 12
            }
        },
        notes: 'Hexapedal mythical reptile with flight capacity.'
    },
    {
        species: 'orc_bellator',
        commonName: 'Orc',
        limits: {
            limbs: 4,
            arms: 2,
            legs: 2,
            eyes: 2,
            ears: 2,
            joints: {
                elbow: 1,
                knee: 1,
                shoulder: 1,
                hip: 1
            }
        },
        notes: 'Heavy humanoid, pronounced lower jaw/tusks.'
    },
    {
        species: 'centaurus_velox',
        commonName: 'Centaur',
        limits: {
            limbs: 6, // 4 horse legs + 2 human arms
            arms: 2,
            legs: 4,
            eyes: 2,
            ears: 2,
            joints: {
                elbow: 2,
                knee: 4,
                shoulder: 2,
                hip: 2
            }
        },
        notes: 'Hybrid anatomy. Human torso on Equine body.'
    },
    {
        species: 'harpyia_raptoris',
        commonName: 'Harpy',
        limits: {
            limbs: 4, // 2 bird legs + 2 wings (arms often integrated)
            legs: 2,
            wings: 2,
            arms: 0,
            eyes: 2,
            ears: 0,
            tail: true,
            joints: {
                knee: 2,
                wing_joint: 2
            }
        },
        notes: 'Avian-Humanoid hybrid. Arms are replaced by or integrated into wings.'
    }
];
