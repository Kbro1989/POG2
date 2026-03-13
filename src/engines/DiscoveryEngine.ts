import type { Result, EngineOutput } from '../core/models.js';
import { Renderer } from '../ui/Renderer.js';
import pino from 'pino';

const logger = pino({ name: 'DiscoveryEngine', base: { hostname: 'POG2' } });

export interface WebSearchParams {
    query: string;
    count?: number;
    deep?: boolean; // If true, fetches and summarizes top results
}

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

/**
 * DiscoveryEngine — Unified Factual and Web Discovery Substrate
 * Merges DDG scraping, Wikipedia factual grounding, and Wayback historical analysis.
 */
export class DiscoveryEngine {
    private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0';

    constructor(private readonly renderer: Renderer) { }

    /**
     * General Web Search (DuckDuckGo HTML)
     */
    async search(params: WebSearchParams): Promise<Result<EngineOutput>> {
        const { query, count = 5 } = params;

        try {
            const results = await this.searchDuckDuckGo(query, count);

            if (results.length === 0) {
                return {
                    ok: true,
                    value: {
                        output: `No results found for "${query}".`,
                        data: { results: [], query }
                    }
                };
            }

            if (params.deep) {
                this.renderer.info(`Initiating Deep Research Substrate for: ${query}`);
                const topResults = results.slice(0, 3);
                const scrapes = await Promise.all(topResults.map(r => this.fetchUrl(r.url)));

                const combined = scrapes
                    .filter(s => s.ok)
                    .map((s, i) => `[SOURCE: ${topResults[i]!.title}]\n${(s as any).value.output}`)
                    .join('\n\n---\n\n');

                return {
                    ok: true,
                    value: {
                        output: `[DEEP RESEARCH SUMMARY]\n${combined.slice(0, 15000)}`,
                        data: { results, query, deep: true }
                    }
                };
            }

            const formatted = this.formatResults(results, query);
            return {
                ok: true,
                value: {
                    output: formatted,
                    data: { results, query, count: results.length }
                }
            };
        } catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    /**
     * Wikipedia Extraction: Getting factual grounding blocks.
     */
    async searchWiki(query: string): Promise<Result<string>> {
        logger.info({ query }, 'Searching Wikipedia for factual substrate');
        try {
            const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Wiki API failed: ${response.statusText}`);

            const data = await response.json() as any;
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            const extract = pages[pageId].extract;

            if (!extract) {
                return { ok: false, error: new Error('No wiki extract found for query') };
            }

            return { ok: true, value: extract };
        } catch (err) {
            logger.error({ err }, 'Wiki search failed');
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Wayback Machine: Historical substrate retrieval.
     */
    async searchWayback(url: string): Promise<Result<string>> {
        logger.info({ url }, 'Querying Wayback Machine for historical snapshots');
        try {
            const waybackUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
            const response = await fetch(waybackUrl);
            if (!response.ok) throw new Error(`Wayback API failed: ${response.statusText}`);

            const data = await response.json() as any;
            const snapshot = data.archived_snapshots.closest;

            if (!snapshot || !snapshot.available) {
                return { ok: false, error: new Error('No historical snapshots available for this URL') };
            }

            return { ok: true, value: `Snapshot found: ${snapshot.url} (Timestamp: ${snapshot.timestamp})` };
        } catch (err) {
            logger.error({ err }, 'Wayback query failed');
            return { ok: false, error: err as Error };
        }
    }

    private async searchDuckDuckGo(query: string, count: number): Promise<SearchResult[]> {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': this.userAgent,
                'Accept': 'text/html',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        return this.parseDuckDuckGoResults(html, count);
    }

    private parseDuckDuckGoResults(html: string, count: number): SearchResult[] {
        const results: SearchResult[] = [];
        const resultRegex = /<div class="result[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi;
        const matches = html.match(resultRegex) || [];

        for (const resultHtml of matches.slice(0, count)) {
            try {
                const titleMatch = resultHtml.match(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
                const urlMatch = resultHtml.match(/<a[^>]*href="([^"]*uddg[^"]*)"[^>]*class="[^"]*result__a/i) ||
                    resultHtml.match(/<a[^>]*href="([^"]*)"[^>]*class="[^"]*result__a/i);
                const snippetMatch = resultHtml.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/i);

                if (titleMatch && urlMatch) {
                    const title = this.cleanHtml(titleMatch[1]!);
                    let url = this.cleanUrl(urlMatch[1]!);
                    const snippet = snippetMatch ? this.cleanHtml(snippetMatch[1]!) : '';

                    if (url.includes('uddg=')) {
                        try {
                            const uddgMatch = url.match(/uddg=([^&]*)/);
                            if (uddgMatch) url = decodeURIComponent(uddgMatch[1]!);
                        } catch { }
                    }
                    results.push({ title, url, snippet });
                }
            } catch { }
        }
        return results;
    }

    private cleanHtml(html: string): string {
        return html
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .trim();
    }

    private cleanUrl(url: string): string {
        return url.replace(/^\/\/html\.duckduckgo\.com/, 'https://html.duckduckgo.com');
    }

    private formatResults(results: SearchResult[], query: string): string {
        const lines = [`🔍 Web Search Results for "${query}":`, '='.repeat(50), ''];
        for (let i = 0; i < results.length; i++) {
            const r = results[i]!;
            lines.push(`${i + 1}. ${r.title}`);
            lines.push(`   URL: ${r.url}`);
            if (r.snippet) lines.push(`   ${r.snippet}`);
            lines.push('');
        }
        return lines.join('\n');
    }

    async fetchUrl(url: string): Promise<Result<EngineOutput>> {
        try {
            const response = await fetch(url, { headers: { 'User-Agent': this.userAgent } });
            if (!response.ok) return { ok: false, error: new Error(`Failed to fetch ${url}: ${response.status}`) };
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await response.json();
                return { ok: true, value: { output: JSON.stringify(data, null, 2), data: { url, contentType, body: data } } };
            }
            const html = await response.text();
            const text = this.extractTextFromHtml(html);
            return { ok: true, value: { output: text.slice(0, 8000), data: { url, contentType, textLength: text.length } } };
        } catch (error) {
            return { ok: false, error: error as Error };
        }
    }

    private extractTextFromHtml(html: string): string {
        let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
        const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
            text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
        if (mainMatch) text = mainMatch[1]!;
        return this.cleanHtml(text).replace(/\s+/g, ' ').trim();
    }

    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: 'DiscoveryEngine unified substrate active.' };
    }
}
