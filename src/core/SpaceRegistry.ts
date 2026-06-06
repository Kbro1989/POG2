import { createLogger } from '../utils/logger.js';

const logger = createLogger('SpaceRegistry');

export interface SpaceMetadata {
    regionId: number;
    spaceId: string; // The "Expected Space ID" which maps to the logic filename
    name: string;
    mapsquare: { x: number; y: number };
}

/**
 * SpaceRegistry - Phase C1: Deterministic Region-to-Space Mapping.
 * 
 * Provides the "Expected Space ID" for any given coordinate, allowing 
 * the FragmentOrchestrator to load the correct logic substrate.
 */
export class SpaceRegistry {
    private static instance: SpaceRegistry;
    private registry: Map<number, SpaceMetadata> = new Map();

    private constructor() {
        this.initializeKnownSpaces();
    }

    public static getInstance(): SpaceRegistry {
        if (!SpaceRegistry.instance) {
            SpaceRegistry.instance = new SpaceRegistry();
        }
        return SpaceRegistry.instance;
    }

    private initializeKnownSpaces(): void {
        // Core regional anchors (Phase C1 initial set)
        
        // Barrows: Mapsquare (55, 51) -> RegionID (55 << 8 | 51) = 14131
        this.addSpace(55, 51, 'barrows', 'Barrows Crypt');
        
        // Neighbor of Barrows (South): (55, 50) -> 14130
        this.addSpace(55, 50, 'm_55_50', 'Barrows South Corridor');

        // Prifddinas: Mapsquare (33, 51) -> RegionID (33 << 8 | 51) = 8501
        this.addSpace(33, 51, 'prifddinas', 'Prifddinas Lodestone');

        // Additional common regions for Global Discovery (C2/C3)
        this.addSpace(50, 50, 'lumbridge', 'Lumbridge');
        this.addSpace(51, 53, 'varrock', 'Varrock Center');
        this.addSpace(46, 54, 'falador', 'Falador');
        this.addSpace(38, 54, 'ardougne', 'Ardougne');
    }

    private addSpace(mx: number, my: number, spaceId: string, name: string): void {
        const regionId = (mx << 8) | my;
        this.registry.set(regionId, {
            regionId,
            spaceId,
            name,
            mapsquare: { x: mx, y: my }
        });
    }

    /**
     * getSpaceForCoords - Deterministically maps world coords to a Space ID.
     */
    public getSpaceForCoords(x: number, y: number): SpaceMetadata | null {
        const mx = x >> 6;
        const my = y >> 6;
        const regionId = (mx << 8) | my;
        
        const metadata = this.registry.get(regionId);
        if (metadata) return metadata;

        // Default: Return a generic coordinate-based space ID
        return {
            regionId,
            spaceId: `m_${mx}_${my}`,
            name: `Mapsquare (${mx}, ${my})`,
            mapsquare: { x: mx, y: my }
        };
    }

    /**
     * getRegionName - Logic-naming helper for FragmentOrchestrator.
     */
    public getRegionName(mx: number, my: number): string {
        const regionId = (mx << 8) | my;
        const metadata = this.registry.get(regionId);
        return metadata ? metadata.spaceId : `m_${mx}_${my}`;
    }

    /**
     * getRegionID - Standard Jagex RegionID calculation.
     */
    public static getRegionID(x: number, y: number): number {
        return ((x >> 6) << 8) | (y >> 6);
    }
}

