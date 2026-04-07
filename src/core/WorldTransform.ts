import { createLogger } from '../utils/logger.js';
const logger = createLogger('WorldTransform');

export interface WorldCoord {
    x: number; // Cache X
    y: number; // Cache Y
    z: number; // Plane / height
}

export interface ScreenCoord {
    u: number; // horizontal pixel/grid
    v: number; // vertical pixel/grid
}

export interface Region {
    id: string;
    base: WorldCoord; // origin of region
    size: { width: number; height: number };
}

export interface CameraState {
    originX: number;
    originY: number;
    zoom: number; // optional scale factor
}

export class SpatialTransform {
    private static REGION_SIZE = 64; // Standard RS3 region width/height (approximate domain assumption)

    // Absolute world â†’ region + local offset
    public static worldToRegion(pos: WorldCoord): { regionId: string; localOffset: { dx: number; dy: number; dz: number } } {
        const regionX = Math.floor(pos.x / this.REGION_SIZE);
        const regionY = Math.floor(pos.y / this.REGION_SIZE);
        
        const regionId = `${regionX}_${regionY}`;
        const dx = pos.x % this.REGION_SIZE;
        const dy = pos.y % this.REGION_SIZE;
        
        return {
            regionId,
            localOffset: { dx, dy, dz: pos.z }
        };
    }

    // Region + local offset â†’ world coordinates
    public static regionToWorld(regionId: string, offset: { dx: number; dy: number; dz: number }): WorldCoord {
        const [rx, ry] = regionId.split('_').map(Number);
        
        return {
            x: (rx * this.REGION_SIZE) + offset.dx,
            y: (ry * this.REGION_SIZE) + offset.dy,
            z: offset.dz
        };
    }

    // World â†’ screen / vision grid
    public static worldToScreen(pos: WorldCoord, camera: CameraState): ScreenCoord {
        return {
            u: (pos.x - camera.originX) * camera.zoom,
            v: (pos.y - camera.originY) * camera.zoom - (pos.z * 10) // Basic z-height offset logic
        };
    }

    // Screen â†’ world
    public static screenToWorld(screen: ScreenCoord, camera: CameraState, baseZ: number = 0): WorldCoord {
        return {
            x: Math.round((screen.u / camera.zoom) + camera.originX),
            y: Math.round(((screen.v + (baseZ * 10)) / camera.zoom) + camera.originY),
            z: baseZ
        };
    }

    // Tick-level invariant assertion
    public static validateInvariant(pos: WorldCoord): boolean {
        const { regionId, localOffset } = this.worldToRegion(pos);
        const recon = this.regionToWorld(regionId, localOffset);
        
        if (pos.x === recon.x && pos.y === recon.y && pos.z === recon.z) {
            return true;
        }
        logger.error({ original: pos, reconstructed: recon }, 'Invariant Transform Failure: Spatial Desync!');
        return false;
    }
}
