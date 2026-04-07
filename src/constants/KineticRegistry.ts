// src/constants/KineticRegistry.ts
// Physical and Kinetic limits for POG2 entities to ensure temporal integrity

export interface JointLimit {
    min: number; // Degrees
    max: number; // Degrees
    axis: 'x' | 'y' | 'z' | 'all';
}

export interface MovementProfile {
    maxVelocity: number; // units/sec
    maxAcceleration: number; // units/sec^2
    allowedTransfers: string[]; // e.g., ["step", "jump"]
}

export interface SpeciesKinetics {
    species: string;
    joints: Record<string, JointLimit[]>;
    profiles: Record<string, MovementProfile>; // e.g., "walk", "run", "fly"
}

export const KineticRegistry: SpeciesKinetics[] = [
    {
        species: 'homo_sapiens',
        joints: {
            neck: [
                { min: -45, max: 45, axis: 'x' }, // Pitch
                { min: -80, max: 80, axis: 'y' }, // Yaw
                { min: -30, max: 30, axis: 'z' }  // Roll
            ],
            shoulder: [{ min: -180, max: 180, axis: 'all' }],
            elbow: [{ min: 0, max: 150, axis: 'x' }],
            knee: [{ min: -140, max: 0, axis: 'x' }],
            wrist: [{ min: -80, max: 80, axis: 'all' }],
            ankle: [{ min: -50, max: 30, axis: 'x' }]
        },
        profiles: {
            idle: { maxVelocity: 0, maxAcceleration: 0, allowedTransfers: ['walk'] },
            walk: { maxVelocity: 1.5, maxAcceleration: 0.5, allowedTransfers: ['idle', 'run', 'jump'] },
            run: { maxVelocity: 6.0, maxAcceleration: 3.0, allowedTransfers: ['walk', 'jump'] },
            jump: { maxVelocity: 4.0, maxAcceleration: 10.0, allowedTransfers: ['walk', 'run'] }
        }
    },
    {
        species: 'canis_familiaris', // Dog
        joints: {
            neck: [{ min: -60, max: 60, axis: 'all' }],
            spine: [{ min: -20, max: 20, axis: 'all' }],
            tail: [{ min: -90, max: 90, axis: 'all' }],
            legs_front: [{ min: -40, max: 120, axis: 'x' }],
            legs_back: [{ min: -100, max: 30, axis: 'x' }]
        },
        profiles: {
            idle: { maxVelocity: 0, maxAcceleration: 0, allowedTransfers: ['walk'] },
            walk: { maxVelocity: 2.0, maxAcceleration: 1.0, allowedTransfers: ['idle', 'run'] },
            run: { maxVelocity: 15.0, maxAcceleration: 5.0, allowedTransfers: ['walk'] }
        }
    },
    {
        species: 'felis_catus', // Cat
        joints: {
            neck: [{ min: -90, max: 90, axis: 'all' }],
            spine: [{ min: -45, max: 45, axis: 'all' }],
            tail: [{ min: -180, max: 180, axis: 'all' }],
            legs: [{ min: -120, max: 120, axis: 'x' }]
        },
        profiles: {
            idle: { maxVelocity: 0, maxAcceleration: 0, allowedTransfers: ['walk'] },
            walk: { maxVelocity: 1.2, maxAcceleration: 0.8, allowedTransfers: ['run', 'jump'] },
            run: { maxVelocity: 13.0, maxAcceleration: 8.0, allowedTransfers: ['walk', 'jump'] },
            jump: { maxVelocity: 8.0, maxAcceleration: 20.0, allowedTransfers: ['idle', 'walk'] }
        }
    },
    {
        species: 'dragon',
        joints: {
            neck: [{ min: -90, max: 90, axis: 'all' }],
            wings: [{ min: -60, max: 90, axis: 'z' }],
            tail: [{ min: -45, max: 45, axis: 'all' }],
            shoulders: [{ min: -90, max: 90, axis: 'all' }]
        },
        profiles: {
            idle: { maxVelocity: 0, maxAcceleration: 0, allowedTransfers: ['walk', 'fly'] },
            walk: { maxVelocity: 2.0, maxAcceleration: 0.5, allowedTransfers: ['idle', 'fly'] },
            fly: { maxVelocity: 35.0, maxAcceleration: 10.0, allowedTransfers: ['idle', 'walk'] }
        }
    }
];
