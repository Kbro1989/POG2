import { createLogger } from "../utils/logger.js";
import type { ModelData } from "../../rsmv/src/3d/rt7model.js";

const logger = createLogger('SpatialMetricEngine');

export interface AABB {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
}

export interface MetricProfile {
    polyCount: number;
    vertexCount: number;
    aabb: AABB;
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
    volume: number;
    vertexDensity: number;
}

/**
 * SpatialMetricEngine — High-fidelity 3D geometric forensics
 * Calculates metrics directly from extracted ModelData buffers
 */
export class SpatialMetricEngine {
    
    /**
     * Calculates a comprehensive metric profile for a given 3D model
     */
    public static calculateProfile(model: ModelData): MetricProfile {
        let polyCount = 0;
        let vertexCount = 0;
        
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        for (const mesh of model.meshes) {
            // Polygon Count
            if (mesh.indices) {
                polyCount += mesh.indices.count / 3;
            }

            // Vertex Metrics & Bounding Box
            const pos = mesh.attributes.pos;
            if (pos) {
                vertexCount += pos.count;
                for (let i = 0; i < pos.count; i++) {
                    const x = pos.getX(i);
                    const y = pos.getY(i);
                    const z = pos.getZ(i);

                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    if (z < minZ) minZ = z;
                    if (z > maxZ) maxZ = z;
                }
            }
        }

        // Handle empty models
        if (minX === Infinity) {
            minX = maxX = minY = maxY = minZ = maxZ = 0;
        }

        const width = maxX - minX;
        const height = maxY - minY;
        const depth = maxZ - minZ;
        const volume = width * height * depth;
        const vertexDensity = volume > 0 ? vertexCount / volume : 0;

        return {
            polyCount: Math.round(polyCount),
            vertexCount,
            aabb: { minX, maxX, minY, maxY, minZ, maxZ },
            dimensions: { width, height, depth },
            volume,
            vertexDensity
        };
    }

    /**
     * Diagnostic probe for system integrity
     */
    public healthCheck(): { online: boolean; details: string } {
        return {
            online: true,
            details: 'SpatialMetricEngine operational; geometric forensic substrate active.'
        };
    }
}
