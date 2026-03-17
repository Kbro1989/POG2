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
            const params = new URLSearchParams({
                action: 'query',
                format: 'json',
                list: 'search',
                srsearch: name,
                srlimit: '1',
                origin: '*'
            });

            const response = await fetch(`${this.API_URL}?${params.toString()}`);
            const data = await response.json() as any;

            const searchResult = data.query?.search?.[0];
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
            const url = `https://runescape.wiki/w/${encodeURIComponent(pageTitle)}`;

            // Heuristic-based intent detection (can be expanded)
            let role = 'Environmental Object';
            let intent = 'Static production asset';
            let race: string | undefined;

            if (pageTitle.toLowerCase().includes('npc') || name.toLowerCase().includes('hans')) {
                role = 'Interactive NPC';
                intent = 'High-fidelity rigged humanoid';
                race = 'Human'; // Default for Hans-like entities
            }

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
}
