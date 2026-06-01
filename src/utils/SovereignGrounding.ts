// src/utils/SovereignGrounding.ts
// Ported from D:\sovereign\cache_pedagogy\rsmv_inspector\src\map\grounding_logic.ts
// Integrated into POG2 Sovereign Core

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getPedagogyPath } from './SovereignPathResolver.js';
import { createLogger } from './logger.js';

const logger = createLogger('SovereignGrounding');

export interface VarbitDefinition {
    varid: number;
    bits: [number, number];
}

export interface MapZoneBounds {
    plane: number;
    src: { xstart: number, zstart: number, xend: number, zend: number };
    dst: { xstart: number, zstart: number, xend: number, zend: number };
}

export interface MapZoneDefinition {
    internal_name: string;
    name: string;
    center: number;
    unpackedCenter: { x: number, z: number, plane: number };
    bounds: MapZoneBounds[];
}

/**
 * SovereignGrounding - The spatial-to-semantic bridge for POG2.
 * Resolves raw world coordinates into pedagogical Map Zones and identifies
 * varbit-gated entity relationships.
 */
export class SovereignGrounding {
    private varbits: Record<number, VarbitDefinition> = {};
    private mapzones: Record<number, MapZoneDefinition> = {};
    private synthesis: Record<number, { npcs: number[], objects: number[] }> = {};

    constructor(
        varbits: Record<number, VarbitDefinition> = {},
        mapzones: Record<number, MapZoneDefinition> = {},
        synthesis: Record<number, { npcs: number[], objects: number[] }> = {}
    ) {
        this.varbits = varbits;
        this.mapzones = mapzones;
        this.synthesis = synthesis;
    }

    /**
     * Finds the semantic map zone containing the given world coordinates.
     */
    public findMapZone(x: number, z: number, plane: number): MapZoneDefinition | null {
        for (const zone of Object.values(this.mapzones)) {
            for (const bound of zone.bounds) {
                if (bound.plane === plane &&
                    x >= bound.src.xstart && x <= bound.src.xend &&
                    z >= bound.src.zstart && z <= bound.src.zend) {
                    return zone;
                }
            }
        }
        return null;
    }

    /**
     * Resolves metadata for a specific coordinate.
     */
    public getRegionMetadata(x: number, z: number, plane: number = 0) {
        const zone = this.findMapZone(x, z, plane);
        if (!zone) return { id: -1, name: "Unknown Territory", archetype: "Wilderness" };

        return {
            id: zone.center,
            name: zone.name,
            archetype: zone.internal_name,
            center: zone.unpackedCenter
        };
    }

    /**
     * Returns the varbit definitions associated with a base config variable.
     */
    public getVarbitsForBaseVar(baseVarId: number): Record<number, VarbitDefinition> {
        const results: Record<number, VarbitDefinition> = {};
        for (const [id, def] of Object.entries(this.varbits)) {
            if (def.varid === baseVarId) {
                results[+id] = def;
            }
        }
        return results;
    }

    /**
     * Returns entities linked to a specific pedagogical varbit (e.g. Bosses, Objects).
     */
    public getEntitiesForVarbit(varbitId: number): { npcs: number[], objects: number[] } {
        return this.synthesis[varbitId] || { npcs: [], objects: [] };
    }

    /**
     * Factory: Loads the pedagogical substrate from the Sovereign memory layer.
     */
    public static async loadDefault(): Promise<SovereignGrounding> {
        const pedagogyDir = getPedagogyPath();

        const load = (file: string) => {
            const p = join(pedagogyDir, file);
            if (!existsSync(p)) {
                const err = `Pedagogical substrate file missing: ${file} at ${p}`;
                logger.error({ path: p }, err);
                throw new Error(err);
            }
            try {
                return JSON.parse(readFileSync(p, "utf-8"));
            } catch (e) {
                const err = `Failed to parse pedagogical file: ${file}. Error: ${(e as Error).message}`;
                logger.error({ path: p, error: (e as Error).message }, err);
                throw new Error(err);
            }
        };

        return new SovereignGrounding(
            load("varbits_registry.json"),
            load("mapzones_registry.json"),
            load("taxonomic_synthesis.json")
        );
    }

    /**
     * Unpacks a packed coordinate (Standard Jagex Format: plane << 28 | x << 14 | z).
     */
    public static unpackCoord(packed: number) {
        return {
            plane: (packed >>> 28),
            x: (packed >>> 14) & 0x3FFF,
            z: (packed & 0x3FFF)
        };
    }
}

