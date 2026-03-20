import { Result } from '../../core/models.js';
import { createLogger } from '../../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

const logger = createLogger('WikiRecon');

export interface WikiQuest {
    title: string;
    pageid: number;
    difficulty?: string;
    members?: boolean;
}

/**
 * WikiReconciliationLimb
 * Handles "soft parsing" (rate-limited, queued) of the official RuneScape Wiki API.
 * Reconciles raw cache IDs against rich Wiki lore, quest lists, and item variables.
 */
export class WikiReconciliationLimb {
    private lastRequestTime: number = 0;
    private readonly RATE_LIMIT_MS: number = 1500; // 1.5 seconds between requests (Soft Parse)
    private readonly API_BASE = 'https://runescape.wiki/api.php';
    private readonly USER_AGENT = 'POG2-Sovereign-ReimaginationEngine/1.0 (Automated Research Node)';

    constructor() { }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        try {
            const response = await fetch(`${this.API_BASE}?action=query&meta=siteinfo&format=json`, {
                headers: { 'User-Agent': this.USER_AGENT },
                signal: AbortSignal.timeout(5000)
            });
            const online = response.ok;
            return {
                online,
                details: `Wiki Reconciliation: ${online ? 'ONLINE' : 'OFFLINE'} (Soft-parse substrate ready)`
            };
        } catch (e) {
            return { online: false, details: `Wiki Reconciliation: OFFLINE (API unreachable: ${(e as Error).message})` };
        }
    }

    /**
     * Enforces the rate limit before returning
     */
    private async applyRateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < this.RATE_LIMIT_MS) {
            const delay = this.RATE_LIMIT_MS - timeSinceLast;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        this.lastRequestTime = Date.now();
    }

    /**
     * Performs a soft fetch to the MediaWiki API
     */
    private async softFetch(params: Record<string, string>): Promise<any> {
        await this.applyRateLimit();

        const urlParams = new URLSearchParams({
            ...params,
            format: 'json'
        });

        const url = `${this.API_BASE}?${urlParams.toString()}`;
        logger.info({ url }, 'Soft-parsing Wiki API...');

        const response = await fetch(url, {
            headers: {
                'User-Agent': this.USER_AGENT,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Wiki API responded with status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Fetches the complete list of Quests from the Wiki category
     */
    public async fetchCompleteQuestList(): Promise<Result<WikiQuest[]>> {
        try {
            logger.info('Commencing full quest list extraction from Wiki...');
            let quests: WikiQuest[] = [];
            let gcmcontinue: string | undefined = undefined;

            // Fetch members of "Category:Quests"
            do {
                const params: Record<string, string> = {
                    action: 'query',
                    generator: 'categorymembers',
                    gcmtitle: 'Category:Quests',
                    gcmlimit: '500', // Max allowed per request
                    prop: 'info',
                };

                if (gcmcontinue) {
                    params.gcmcontinue = gcmcontinue;
                }

                const data = await this.softFetch(params);

                if (data.query && data.query.pages) {
                    for (const pageId in data.query.pages) {
                        const page = data.query.pages[pageId];
                        // Filter out subcategories or non-quest pages if necessary
                        if (page.ns === 0 && !page.title.includes('Category:')) {
                            quests.push({
                                title: page.title,
                                pageid: page.pageid
                            });
                        }
                    }
                }

                gcmcontinue = data.continue?.gcmcontinue;

            } while (gcmcontinue);

            logger.info({ count: quests.length }, 'Successfully extracted Quest taxonomy from Wiki.');
            return { ok: true, value: quests };

        } catch (error) {
            logger.error({ error }, 'Failed to fetch quest list from Wiki.');
            return { ok: false, error: error as Error };
        }
    }

    /**
     * Reconciles the incomplete local requests.json with the Wiki list.
     */
    public async reconcileQuestTaxonomy(localQuestsJsonPath: string): Promise<Result<void>> {
        try {
            const listRes = await this.fetchCompleteQuestList();
            if (!listRes.ok) return { ok: false, error: listRes.error };

            const wikiQuests = listRes.value;

            // Read local
            const rawLocal = await fs.readFile(localQuestsJsonPath, 'utf8');
            const localData = JSON.parse(rawLocal);

            const localQuestSet = new Set(localData.quests.map((q: any) => q.name));

            let addedCount = 0;
            for (const wq of wikiQuests) {
                if (!localQuestSet.has(wq.title)) {
                    // Stubs for now, will enrich with actual cache ID later via search
                    localData.quests.push({
                        id: -1, // Placeholder indicating it's from Wiki, not yet mapped to JS5
                        name: wq.title,
                        description: 'Enriched via Wiki Reconciliation Layer',
                        isF2P: false,
                        isHidden: false,
                        wikiPageId: wq.pageid
                    });
                    addedCount++;
                }
            }

            localData.totalExported = localData.quests.length;

            await fs.writeFile(localQuestsJsonPath, JSON.stringify(localData, null, 2), 'utf8');
            logger.info({ addedCount, total: localData.totalExported }, 'Quest taxonomy reconciled and enriched.');

            return { ok: true, value: undefined };

        } catch (error) {
            logger.error({ error }, 'Reconciliation failed.');
            return { ok: false, error: error as Error };
        }
    }
}
