import { createLogger } from './logger.js';
import type { Result } from '../core/models.js';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { CanonicalClock } from './CanonicalClock.js';

const logger = createLogger('WikiEnricher');
const clock = CanonicalClock.getInstance();

// Load authoritative interaction mapping
const INTERACTION_MAPPING_PATH = join(process.cwd(), 'audit_output', 'interaction_mapping_full.json');
let interactionMapping: any = null;
if (existsSync(INTERACTION_MAPPING_PATH)) {
    try {
        interactionMapping = JSON.parse(readFileSync(INTERACTION_MAPPING_PATH, 'utf8'));
    } catch (e) {
        logger.error({ err: e }, 'Failed to load authoritative interaction mapping.');
    }
}

export interface WikiData {
    name: string;
    role: string;
    race?: string;
    intent: string;
    url: string;
    imageUrl?: string;
    variables?: Record<string, string>;
    pog2_interactions?: string[];
}

// Build reverse interaction index for fast lookup
const entityInteractionIndex: Record<string, Record<string, string[]>> = {
    npc: {}, item: {}, object: {}
};
if (interactionMapping) {
    for (const [actionId, data] of Object.entries(interactionMapping)) {
        const { action, entities } = data as any;
        for (const entity of entities) {
            const idKey = entity.id.toString();
            if (!entityInteractionIndex[entity.type][idKey]) {
                entityInteractionIndex[entity.type][idKey] = [];
            }
            entityInteractionIndex[entity.type][idKey].push(action);
        }
    }
}

export interface WikiRotation {
    section: string;
    label: string;
    abilities: {
        name: string;
        predicate?: string;
    }[];
}

/**
 * WikiEnricher â€” Contextualizes professional assets via RuneScape Wiki.
 */
export class WikiEnricher {
    private static API_URL = 'https://runescape.wiki/api.php';

    /**
     * Enrich a model's semantic context by first checking authoritative cache mapping,
     * then falling back to wiki search.
     */
    public static async enrich(name: string, entityId?: number, entityType?: string): Promise<Result<WikiData>> {
        let pog2_interactions: string[] | undefined;

        // 1. Authoritative Cache Lookup
        if (entityId !== undefined && entityType && entityInteractionIndex[entityType]?.[entityId.toString()]) {
            pog2_interactions = entityInteractionIndex[entityType][entityId.toString()];
        }

        if (!name || name === 'unknown') {
            return {
                ok: true,
                value: {
                    name: 'Unknown Asset',
                    role: 'Background Prop',
                    intent: 'Generic environment filler',
                    url: 'https://runescape.wiki',
                    pog2_interactions
                }
            };
        }

        logger.info({ name }, 'Fetching wiki context');

        try {
            // 1. Search for the best page match
            const searchParams = new URLSearchParams({
                action: 'query',
                format: 'json',
                list: 'search',
                srsearch: name,
                srlimit: '1',
                origin: '*'
            });

            const headers = {
                'User-Agent': 'SovereignVisionBot/1.1 (https://github.com/POG2; admin@pog2.internal)'
            };

            const fetchWithRetry = async (url: string, options: any, retries = 3): Promise<Response> => {
                // Canonical pacing: Wait at least 3 game ticks (1800ms) to maintain simulation determinism
                const delayTicks = 3; 
                await new Promise(resolve => setTimeout(resolve, delayTicks * clock.getGameTickMs()));
                
                for (let i = 0; i < retries; i++) {
                    try {
                        const res = await fetch(url, options);
                        if (res.ok) return res;
                        if (res.status === 429) {
                            const delayMs = parseInt(res.headers.get('Retry-After') || '5') * 1000;
                            await new Promise(resolve => setTimeout(resolve, delayMs));
                            continue;
                        }
                    } catch (err) {
                        if (i === retries - 1) throw err;
                        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
                    }
                }
                throw new Error('Fetch failed after retries');
            };

            const searchResponse = await fetchWithRetry(`${this.API_URL}?${searchParams.toString()}`, { headers });
            const searchData = await searchResponse.json() as any;

            const searchResult = searchData.query?.search?.[0];
            if (!searchResult) {
                return {
                    ok: true,
                    value: {
                        name,
                        role: 'Uncategorized',
                        intent: 'Production asset without wiki mapping',
                        url: 'https://runescape.wiki',
                        pog2_interactions
                    }
                };
            }

            const pageTitle = searchResult.title;
            
            // 2. Fetch the actual content extract (Summary)
            const contentParams = new URLSearchParams({
                action: 'query',
                format: 'json',
                prop: 'extracts',
                exintro: '1',
                explaintext: '1',
                titles: pageTitle,
                origin: '*'
            });

            const contentResponse = await fetchWithRetry(`${this.API_URL}?${contentParams.toString()}`, { headers });
            const contentData = await contentResponse.json() as any;
            
            const pages = contentData.query?.pages || {};
            const pageId = Object.keys(pages)[0];
            const extract = pages[pageId]?.extract || '';

            const url = `https://runescape.wiki/w/${encodeURIComponent(pageTitle)}`;

            // Heuristic-based intent detection using the extract
            let role = 'Environmental Object';
            const intent = extract.substring(0, 500); // Feed the wiki summary into intent
            let race: string | undefined;

            const lowerExtract = extract.toLowerCase();
            if (lowerExtract.includes('npc') || lowerExtract.includes('character') || lowerExtract.includes('boss')) {
                role = 'Interactive NPC';
            } else if (lowerExtract.includes('item') || lowerExtract.includes('equipment')) {
                role = 'ITEM';
            }

            // Race detection
            if (lowerExtract.includes('human')) race = 'Human';
            else if (lowerExtract.includes('dragon')) race = 'Dragon';
            else if (lowerExtract.includes('demon')) race = 'Demon';
            else if (lowerExtract.includes('beast')) race = 'Beast';

            let imageUrl: string | undefined;
            try {
                imageUrl = await this.fetchImageUrl(pageTitle);
            } catch (e) {
                // Ignore missing images
            }

            return {
                ok: true,
                value: {
                    name: pageTitle,
                    role,
                    race,
                    intent,
                    url,
                    imageUrl,
                    variables: await this.fetchInfoboxData(pageTitle),
                    pog2_interactions
                }
            };
        } catch (err) {
            logger.error({ err, name }, 'Wiki enrichment failed');
            return { ok: false, error: err as Error };
        }
    }

    /**
     * fetchImageUrl(title) - Extracts the main image URL from the wiki page.
     */
    public static async fetchImageUrl(title: string): Promise<string | undefined> {
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'pageimages',
            piprop: 'original',
            origin: '*'
        });

        const headers = {
            'User-Agent': 'SovereignVisionBot/1.1 (https://github.com/POG2; admin@pog2.internal)'
        };

        const response = await fetch(`${this.API_URL}?${params.toString()}`, { headers });
        const data = await response.json() as any;
        const pages = data.query?.pages || {};
        const pageId = Object.keys(pages)[0];
        
        return pages[pageId]?.original?.source;
    }

    /**
     * Specialized enrichment for NPCs.
     */
    public static async enrichNpc(name: string): Promise<Result<WikiData>> {
        return this.enrich(name);
    }

    /**
     * Specialized enrichment for Items.
     */
    public static async enrichItem(name: string): Promise<Result<WikiData>> {
        return this.enrich(name);
    }

    /**
     * fetchInfoboxData(title) - Extracts variables from the MediaWiki Infobox.
     */
    private static async fetchInfoboxData(title: string): Promise<Record<string, string>> {
        const params = new URLSearchParams({
            action: 'parse',
            format: 'json',
            page: title,
            prop: 'wikitext',
            origin: '*'
        });

        try {
            const response = await fetch(`${this.API_URL}?${params.toString()}`);
            const data = await response.json() as any;
            const wikitext = data.parse?.wikitext?.['*'] || '';

            // Simple regex parser for Infobox variables
            const variables: Record<string, string> = {};
            const matches = wikitext.matchAll(/\|\s*([\w\d]+)\s*=\s*([^|\n}]+)/g);
            for (const match of matches) {
                variables[match[1].trim()] = match[2].trim();
            }
            return variables;
        } catch (e) {
            const err = `Wiki Infobox parsing failed for "${title}": ${(e as Error).message}`;
            logger.error({ title, error: (e as Error).message }, err);
            throw new Error(err);
        }
    }
    /**
     * fetchPageLinks(title) - Extracts all internal wiki links from a page.
     * Useful for finding associated NPCs/Items/Objects for a minigame.
     */
    public static async fetchPageLinks(title: string): Promise<string[]> {
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'links',
            pllimit: 'max',
            origin: '*'
        });

        try {
            const response = await fetch(`${this.API_URL}?${params.toString()}`);
            const data = await response.json() as any;
            const pages = data.query?.pages || {};
            const pageId = Object.keys(pages)[0];
            const links = pages[pageId]?.links || [];
            return (links as any[]).map((l: any) => l.title);
        } catch (e) {
            const err = `Wiki Link extraction failed for "${title}": ${(e as Error).message}`;
            logger.error({ title, error: (e as Error).message }, err);
            throw new Error(err);
        }
    }

    /**
     * fetchRotations(bossName) - Extracts PvME-style rotations from a boss's strategy page.
     */
    public static async fetchRotations(bossName: string): Promise<WikiRotation[]> {
        const title = bossName.includes('/') ? bossName : `${bossName}/Strategies`;
        logger.info({ title }, 'Fetching rotations from wiki');

        const params = new URLSearchParams({
            action: 'parse',
            format: 'json',
            page: title,
            prop: 'wikitext',
            origin: '*'
        });

        try {
            const response = await fetch(`${this.API_URL}?${params.toString()}`);
            const data = await response.json() as any;
            const wikitext = data.parse?.wikitext?.['*'] || '';

            const rotations: WikiRotation[] = [];
            
            // Regex to find {{Ability rotation|...}} or {{ability rotation|...}}
            // Handles multiple lines and nested templates (basic)
            const templateRegex = /\{\{[Aa]bility\s+rotation\s*\|([^}]+)\}\}/g;
            let match;

            // Simple context tracking: look for preceding headers or table headers
            const lines = wikitext.split('\n');
            let currentSection = 'General';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Update section on headers
                if (line.startsWith('==')) {
                    currentSection = line.replace(/=/g, '').trim();
                }

                while ((match = templateRegex.exec(line)) !== null) {
                    const content = match[1];
                    const abilities = content.split('|')
                        .map(a => a.trim())
                        .filter(a => a && !a.includes('=')); // Filter out named params like 'sep'

                    // Try to find a label (e.g. if inside a table)
                    let label = 'Rotation';
                    if (i > 0 && lines[i-1].startsWith('!')) {
                        label = lines[i-1].replace('!', '').trim();
                    }

                    rotations.push({
                        section: currentSection,
                        label,
                        abilities: abilities.map(a => this.parseAbilityEntry(a))
                    });
                }
            }

            return rotations;
        } catch (e) {
            logger.error({ bossName, error: (e as Error).message }, 'Failed to fetch rotations');
            return [];
        }
    }

    /**
     * fetchBestiaryData(bossName) - Fetches stats from the Wiki's Bestiary/Infobox.
     */
    public static async fetchBestiaryData(bossName: string): Promise<Record<string, string>> {
        // Reuse Infobox parsing logic
        return this.fetchInfoboxData(bossName);
    }

    /**
     * sanitizeAbilityName(name) - Cleans wiki-specific markup from ability names.
     */
    public static sanitizeAbilityName(name: string): string {
        // 1. Prioritize {{Ability link|...}}
        const linkMatch = name.match(/\{\{Ability link\|([^}]+)\}\}/i);
        if (linkMatch) return linkMatch[1].split('|')[0].trim();

        // 2. Prioritize [[...]]
        const wikiMatch = name.match(/\[\[([^\]|]+)\|?([^\]]*)\]\]/);
        if (wikiMatch) return wikiMatch[1].trim();

        // 3. Fallback: Clean string
        return name
            .replace(/^@/, '')                           // Remove @ prefix
            .replace(/\[\[File:[^\]]+\]\]/g, '')          // Remove file links
            .replace(/&nbsp;/g, ' ')
            .split('|')[0]                                // Take first part of split
            .trim();
    }

    /**
     * parseAbilityEntry(entry) - Splits an entry into name and predicate.
     */
    public static parseAbilityEntry(entry: string): { name: string, predicate?: string } {
        let predicate: string | undefined;

        // Extract (if ...) patterns as predicates
        const predMatch = entry.match(/\((if [^)]+)\)/i);
        let rawName = entry;
        if (predMatch) {
            predicate = predMatch[1].trim();
            rawName = entry.replace(predMatch[0], '').trim();
        }

        return {
            name: this.sanitizeAbilityName(rawName),
            predicate
        };
    }

    /**
     * downloadAsset(name, outDir) - Downloads an icon/image for a given asset.
     */
    public static async downloadAsset(name: string, outDir: string): Promise<string | null> {
        const sanitized = this.sanitizeAbilityName(name);
        if (!sanitized) return null;

        const filename = `${sanitized.replace(/\s+/g, '_')}.png`;
        const localPath = join(outDir, filename.toLowerCase().replace(/_/g, '-'));

        // Skip if already exists
        if (existsSync(localPath)) return localPath;

        const imageUrl = await this.fetchImageUrl(sanitized);
        if (!imageUrl) {
            // Try with (ability) suffix
            const abilityUrl = await this.fetchImageUrl(`${sanitized} (ability)`);
            if (!abilityUrl) return null;
            return this.saveUrl(abilityUrl, localPath);
        }

        return this.saveUrl(imageUrl, localPath);
    }

    private static async saveUrl(url: string, dest: string): Promise<string> {
        const res = await fetch(url);
        const buffer = Buffer.from(await res.arrayBuffer());
        if (!existsSync(join(dest, '..'))) {
            mkdirSync(join(dest, '..'), { recursive: true });
        }
        writeFileSync(dest, buffer);
        return dest;
    }
}
