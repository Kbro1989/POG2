import { createLogger } from "../../utils/logger.js";
import { PADDED_SIZE } from "../../limbs/spatial/SpatialSovereigntyLimb.js";

const logger = createLogger('NecromancerBrain');

/**
 * NTX 66x66 Spatial Gaussian primitive.
 */
export interface SpatialGaussian {
    mu: [number, number, number];        // Position (RS3 world coords)
    sigma: number[][];                   // Covariance (3x3 ellipsoid)
    opacity: number;                     // 0.0 - 1.0
    sh_coeffs: Float32Array;             // Spherical Harmonics RGB (9 floats)
    tile_flags: number;                  // collision, walk, interact
    loc_id?: number;                     // object definition ID
    texture_id?: number;                 // overlay/underlay reference
}

export type NTXBuffer = SpatialGaussian[][]; // 66x66

/**
 * NecromancerBrain - Predictive temporal and lighting engine for 3DGS.
 * Implements Spherical Harmonics (SH) relighting and spatial "echo" boundary resolution.
 */
export class NecromancerBrain {
    private static instance: NecromancerBrain;

    private constructor() {}

    public static getInstance(): NecromancerBrain {
        if (!NecromancerBrain.instance) {
            NecromancerBrain.instance = new NecromancerBrain();
        }
        return NecromancerBrain.instance;
    }

    /**
     * Synchronizes padding between adjacent NTXBuffers to create the "echo" effect.
     * This blends the boundary Gaussians, ensuring seamless mapsquare transitions.
     */
    public syncPadding(buffer: NTXBuffer, neighbor: NTXBuffer, direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'): void {
        switch(direction) {
            case 'NORTH':
                for (let x = 0; x < PADDED_SIZE; x++) {
                    buffer[x][PADDED_SIZE - 1] = neighbor[x][1]; // Neighbor's core bottom row -> our top padding
                }
                break;
            case 'SOUTH':
                for (let x = 0; x < PADDED_SIZE; x++) {
                    buffer[x][0] = neighbor[x][PADDED_SIZE - 2]; // Neighbor's core top row -> our bottom padding
                }
                break;
            case 'EAST':
                for (let y = 0; y < PADDED_SIZE; y++) {
                    buffer[PADDED_SIZE - 1][y] = neighbor[1][y]; // Neighbor's core left col -> our right padding
                }
                break;
            case 'WEST':
                for (let y = 0; y < PADDED_SIZE; y++) {
                    buffer[0][y] = neighbor[PADDED_SIZE - 2][y]; // Neighbor's core right col -> our left padding
                }
                break;
        }
    }

    /**
     * Calculates the solar vector based on the game's time of day.
     */
    private calculateSunVector(timeOfDay: number): [number, number, number] {
        // Simplified: sun moves from East (0) to West (12) to East (24)
        const angle = (timeOfDay / 24) * Math.PI * 2;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        const z = -0.5; // Fixed height assumption
        
        const len = Math.sqrt(x*x + y*y + z*z);
        return [x/len, y/len, z/len];
    }

    /**
     * Evaluates Spherical Harmonics coefficients with a specific sun direction.
     */
    private evaluateSHWithSun(base_sh: Float32Array, sun_dir: [number, number, number]): Float32Array {
        const result = new Float32Array(9);
        // Approximation of SH relighting
        const intensity = Math.max(0.2, (sun_dir[0] + sun_dir[1] + sun_dir[2]) / 3);
        for(let i = 0; i < 9; i++) {
            result[i] = base_sh[i] * intensity;
        }
        return result;
    }

    /**
     * Predicts spatial lighting for the next N ticks.
     * Evaluates the Spherical Harmonics response function for dynamic time-of-day.
     */
    public predictLighting(buffer: NTXBuffer, tickDelta: number, timeOfDay: number = 12.0): NTXBuffer {
        // Clone buffer to avoid mutating authoritative truth
        const predicted: NTXBuffer = new Array(PADDED_SIZE);
        for (let i = 0; i < PADDED_SIZE; i++) {
            predicted[i] = [...buffer[i]];
        }

        const sun_dir = this.calculateSunVector(timeOfDay + (tickDelta / 100)); // Arbitrary time scale

        for (let x = 1; x < PADDED_SIZE - 1; x++) {
            for (let y = 1; y < PADDED_SIZE - 1; y++) {
                const gaussian = predicted[x][y];
                if (!gaussian) continue;

                // Clone gaussian to modify properties immutably
                const newGaussian = { ...gaussian, sh_coeffs: Float32Array.from(gaussian.sh_coeffs) as Float32Array };

                
                newGaussian.sh_coeffs = this.evaluateSHWithSun(gaussian.sh_coeffs, sun_dir);
                
                // Shadow occlusion via boundary flag interaction
                const occlusion = (gaussian.tile_flags & 0x1) ? 0.3 : 0.0;
                newGaussian.opacity *= (1.0 - occlusion);

                predicted[x][y] = newGaussian;
            }
        }

        return predicted;
    }
}
