import { createLogger } from './logger.js';
import type { Result } from '../core/models.js';

const logger = createLogger('WikiEnricher');

export interface WikiData {
    name: string;
    role: string;
    race?: string;
    intent: string;
    url: string;
}

/**
 * WikiEnricher — Contextualizes professional assets via RuneScape Wiki.
 */
export class WikiEnricher {
    private static API_URL = 'https://runescape.wiki/api.php';

    /**
     * Enrich a model's semantic context by searching the wiki.
     */
    public static async enrich(name: string): Promise<Result<WikiData>> {
        if (!name || name === 'unknown') {
            return {
                ok: true,
                value: {
                    name: 'Unknown Asset',
                    role: 'Background Prop',
                    intent: 'Generic environment filler',
                    url: 'https://runescape.wiki'
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

            const searchResponse = await fetch(`${this.API_URL}?${searchParams.toString()}`);
            const searchData = await searchResponse.json() as any;

            const searchResult = searchData.query?.search?.[0];
            if (!searchResult) {
                return {
                    ok: true,
                    value: {
                        name,
                        role: 'Uncategorized',
                        intent: 'Production asset without wiki mapping',
                        url: 'https://runescape.wiki'
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

            const contentResponse = await fetch(`${this.API_URL}?${contentParams.toString()}`);
            const contentData = await contentResponse.json() as any;
            
            const pages = contentData.query?.pages || {};
            const pageId = Object.keys(pages)[0];
            const extract = pages[pageId]?.extract || '';

            const url = `https://runescape.wiki/w/${encodeURIComponent(pageTitle)}`;

            // Heuristic-based intent detection using the extract
            let role = 'Environmental Object';
            let intent = extract.substring(0, 500); // Feed the wiki summary into intent
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

            return {
                ok: true,
                value: {
                    name: pageTitle,
                    role,
                    race,
                    intent,
                    url
                }
            };
        } catch (err) {
            logger.error({ err, name }, 'Wiki enrichment failed');
            return { ok: false, error: err as Error };
        }
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
}
