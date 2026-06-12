import * as fs from 'fs';
import * as path from 'path';
import { Coord } from '../core/models.js';
import { createLogger } from './logger.js';

const logger = createLogger('LocationResolver');

export interface LocationMatch {
    id: string;
    name: string;
    coord: Coord;
    exact: boolean;
    source: 'TELEPORT' | 'LANDMARK' | 'ENTITY';
}

export interface GroundingEntity {
    id: string;
    title?: string;
    name?: string;
    npcName?: string;
    coord?: Coord;
    meta?: {
        isLandmark?: boolean;
        wikiNote?: string;
    };
}

export interface GroundingTeleport {
    name: string;
    dest: Coord | null;
}

/**
 * LocationResolver
 * 
 * Implements a dynamic cache-based lookup for spatial coordinates, mirroring the `itemIndex` 
 * architecture from alt1-ai. Prevents hardcoding of coordinates (e.g. 50,50,1,1) and 
 * resolves pathing targets authoritatively from pedagogical JSON files.
 */
export class LocationResolver {
    private static instance: LocationResolver | null = null;
    
    private teleportManifest: Record<string, GroundingTeleport> = {};
    private entitiesManifest: GroundingEntity[] = [];
    private indexLoaded: boolean = false;

    private constructor() {
        this.loadIndexes();
    }

    public static getInstance(): LocationResolver {
        if (!this.instance) {
            this.instance = new LocationResolver();
        }
        return this.instance;
    }

    private loadIndexes(): void {
        try {
            // 1. Load Teleport Grounding
            const teleportPath = path.join(process.cwd(), 'public', 'teleport_grounding.json');
            if (fs.existsSync(teleportPath)) {
                this.teleportManifest = JSON.parse(fs.readFileSync(teleportPath, 'utf8'));
            }

            // 2. Load General Grounding Manifest (Entities & Landmarks)
            const groundingPath = path.join(process.cwd(), 'public', 'grounding_manifest.json');
            if (fs.existsSync(groundingPath)) {
                const data = JSON.parse(fs.readFileSync(groundingPath, 'utf8'));
                if (data.entities && Array.isArray(data.entities)) {
                    this.entitiesManifest = data.entities;
                }
            }

            this.indexLoaded = true;
            logger.debug(`Loaded cache location index. Teleports: ${Object.keys(this.teleportManifest).length}, Entities: ${this.entitiesManifest.length}`);
        } catch (err) {
            logger.error(err, 'Failed to load cache location index manifests');
        }
    }

    /**
     * Resolves a coordinate from cache by fuzzy-searching its name.
     */
    public resolveLocationByName(query: string): Coord | null {
        if (!query) return null;
        if (!this.indexLoaded) this.loadIndexes();

        const matches = this.searchLocations(query, 1);
        if (matches.length > 0) {
            return matches[0].coord;
        }

        return null;
    }

    /**
     * Searches all authoritative caches for coordinates matching the query string.
     */
    public searchLocations(query: string, limit: number = 10): LocationMatch[] {
        if (!this.indexLoaded) this.loadIndexes();
        
        const q = query.toLowerCase().trim();
        if (!q) return [];

        const exactMatches: LocationMatch[] = [];
        const startsWithMatches: LocationMatch[] = [];
        const containsMatches: LocationMatch[] = [];

        // 1. Search Teleports
        for (const [key, tpt] of Object.entries(this.teleportManifest)) {
            if (!tpt.dest) continue;
            
            const lower = tpt.name.toLowerCase();
            const match: LocationMatch = {
                id: `teleport_${key}`,
                name: tpt.name,
                coord: tpt.dest,
                exact: false,
                source: 'TELEPORT'
            };

            if (lower === q) {
                match.exact = true;
                exactMatches.push(match);
            } else if (lower.startsWith(q)) {
                startsWithMatches.push(match);
            } else if (lower.includes(q)) {
                containsMatches.push(match);
            }
        }

        // 2. Search Grounding Entities (Landmarks > General NPCs)
        for (const ent of this.entitiesManifest) {
            if (!ent.coord) continue;

            const name = ent.title || ent.name || ent.npcName || ent.id;
            const lower = name.toLowerCase();
            const isLandmark = ent.meta?.isLandmark;

            const match: LocationMatch = {
                id: ent.id,
                name: name,
                coord: ent.coord,
                exact: false,
                source: isLandmark ? 'LANDMARK' : 'ENTITY'
            };

            if (lower === q || ent.id.toLowerCase() === q) {
                match.exact = true;
                exactMatches.push(match);
            } else if (lower.startsWith(q)) {
                startsWithMatches.push(match);
            } else if (lower.includes(q)) {
                containsMatches.push(match);
            }
        }

        // Combine and prioritize: Exact > StartsWith > Contains.
        // Within groups, prioritize Landmarks and Teleports over standard entities.
        const combined = [...exactMatches, ...startsWithMatches, ...containsMatches];
        
        // Return top N
        return combined.slice(0, limit);
    }
}

