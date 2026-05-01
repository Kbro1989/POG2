import Database from 'better-sqlite3';
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import type { Result, SovereignRecord } from '../core/models.js';
import { ok, err } from '../core/models.js';
import { getSovereignRoot, PathTier } from '../utils/SovereignPathResolver.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('MemeticEngine');

export interface MemeticEntry {
    title: string;
    url: string;
    description?: string;
    source: 'history' | 'bookmark';
    timestamp?: number;
}

/**
 * MemeticEngine
 * 
 * Ingests and synthesizes context from browser history and bookmarks.
 * Enables POG2 to understand the user's external research patterns.
 */
export class MemeticEngine {
    private readonly profilePath: string;

    constructor(private readonly config: SovereignConfig) {
        // Phase 107.5: Normalize to project-relative browser profile
        const root = getSovereignRoot(PathTier.Home);
        this.profilePath = join(root, 'guest', 'browser-profile', 'Default');
        
        // Auto-initialize guest substrate if it's within the sovereign home
        if (this.profilePath.includes('guest') && !existsSync(this.profilePath)) {
            try {
                mkdirSync(this.profilePath, { recursive: true });
                logger.info({ path: this.profilePath }, 'Initialized missing guest browser profile substrate.');
            } catch (e) {
                const err = `Critical failure: Could not initialize browser profile substrate at ${this.profilePath}. Error: ${(e as Error).message}`;
                logger.error({ err: (e as Error).message }, err);
                throw new Error(err);
            }
        }
    }

    /**
     * ingestHistory - Reads the latest history entries from the browser profile.
     */
    async ingestHistory(limit: number = 50): Promise<Result<MemeticEntry[]>> {
        const historyDb = join(this.profilePath, 'History');
        if (!existsSync(historyDb)) {
            return err(new Error('Browser History database not found.'));
        }

        const tempHistory = join(tmpdir(), `pog_history_${Date.now()}`);

        try {
            // Copy to avoid locks
            copyFileSync(historyDb, tempHistory);
            const db = new Database(tempHistory, { readonly: true });

            const rows = db.prepare(`
                SELECT url, title, last_visit_time 
                FROM urls 
                ORDER BY last_visit_time DESC 
                LIMIT ?
            `).all(limit) as any[];

            const entries: MemeticEntry[] = rows.map(r => ({
                title: r.title || 'Untitled',
                url: r.url,
                source: 'history',
                timestamp: r.last_visit_time
            }));

            db.close();
            return ok(entries);
        } catch (e) {
            return err(new Error(`Failed to ingest history: ${(e as Error).message}`));
        } finally {
            try { 
                if (existsSync(tempHistory)) unlinkSync(tempHistory); 
            } catch (e) { 
                logger.warn({ path: tempHistory, err: (e as Error).message }, 'Failed to cleanup temporary history substrate. Potential resource leak.');
            }
        }
    }

    /**
     * searchMemetics - Searches history and bookmarks for relevant research shards.
     */
    async searchMemetics(query: string, limit: number = 20): Promise<Result<MemeticEntry[]>> {
        const historyDb = join(this.profilePath, 'History');
        if (!existsSync(historyDb)) {
            return err(new Error('Browser History database not found.'));
        }

        const tempHistory = join(tmpdir(), `pog_history_search_${Date.now()}`);

        try {
            copyFileSync(historyDb, tempHistory);
            const db = new Database(tempHistory, { readonly: true });

            const rows = db.prepare(`
                SELECT url, title, last_visit_time 
                FROM urls 
                WHERE title LIKE ? OR url LIKE ?
                ORDER BY last_visit_time DESC 
                LIMIT ?
            `).all(`%${query}%`, `%${query}%`, limit) as any[];

            const entries: MemeticEntry[] = rows.map(r => ({
                title: r.title || 'Untitled',
                url: r.url,
                source: 'history',
                timestamp: r.last_visit_time
            }));

            db.close();
            return ok(entries);
        } catch (e) {
            return err(new Error(`Failed to search memetics: ${(e as Error).message}`));
        } finally {
            try { 
                if (existsSync(tempHistory)) unlinkSync(tempHistory); 
            } catch (e) { 
                logger.warn({ path: tempHistory, err: (e as Error).message }, 'Failed to cleanup temporary search substrate. Potential resource leak.');
            }
        }
    }

    /**
     * ingestBookmarks - Reads bookmarks (simplified for now).
     */
    async ingestBookmarks(): Promise<Result<MemeticEntry[]>> {
        const bookmarksPath = join(this.profilePath, 'Bookmarks');
        if (!existsSync(bookmarksPath)) {
            return err(new Error('Browser Bookmarks file not found.'));
        }

        try {
            const content = JSON.parse(await import('fs').then(fs => fs.readFileSync(bookmarksPath, 'utf8')));
            const entries: MemeticEntry[] = [];

            const walk = (node: any) => {
                if (node.type === 'url') {
                    entries.push({
                        title: node.name,
                        url: node.url,
                        source: 'bookmark'
                    });
                }
                if (node.children) {
                    node.children.forEach(walk);
                }
            };

            if (content.roots) {
                Object.values(content.roots).forEach(walk);
            }

            return ok(entries);
        } catch (e) {
            return err(new Error(`Failed to ingest bookmarks: ${(e as Error).message}`));
        }
    }

    public healthCheck(): { online: boolean; details: string } {
        const exists = existsSync(this.profilePath);
        return {
            online: exists,
            details: exists ? 'Memetic browser substrate found.' : 'Browser profile path missing.'
        };
    }
}
