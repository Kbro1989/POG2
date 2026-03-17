import { type Result, YaoState } from '../../core/models.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { VectorDB } from '../../utils/VectorDB.js';
import { StyleAnalyzer, type StyleProfile } from '../../utils/StyleAnalyzer.js';
import { getGutenbergPath } from '../../utils/SovereignPathResolver.js';
import { NarrativeExtractor, type NarrativeSegment } from '../../utils/NarrativeExtractor.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync, statSync, renameSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('GutenbergLimb');

export interface BookMetadata {
    id: number;
    gutendex_id?: number; // Primary key for local Django alignment
    title: string;
    author: string;
    domain: string;
    path: string;
    checksum: string;
    bookshelves?: string[];  // Gutendex official bookshelves (e.g., "Category: Adventure")
    subjects?: string[];     // LCSH subject headings (e.g., "Gothic fiction")
}

export interface GutenbergBook {
    id: number;
    title: string;
    authors: { name: string, birth_year?: number, death_year?: number }[];
    subjects: string[];
    bookshelves: string[];
    languages: string[];
    copyright: boolean;
    media_type: string;
    formats: Record<string, string>;
    download_count: number;
}

export class GutenbergLimb {
    private readonly cachePath: string;
    private readonly metadataPath: string;

    constructor(
        private readonly client: ModelClient,
        private readonly vectorDB: VectorDB
    ) {
        this.cachePath = getGutenbergPath();
        this.metadataPath = join(this.cachePath, 'metadata.json');

        if (!existsSync(this.cachePath)) {
            mkdirSync(this.cachePath, { recursive: true });
        }
    }

    private loadMetadata(): BookMetadata[] {
        logger.debug({ path: this.metadataPath }, 'Loading Gutenberg library metadata...');
        if (!existsSync(this.metadataPath)) {
            logger.debug('No metadata file found, starting with empty library.');
            return [];
        }
        try {
            const data = JSON.parse(readFileSync(this.metadataPath, 'utf8'));
            logger.debug({ count: data.length }, 'Library metadata loaded successfully.');
            return data;
        } catch (err) {
            logger.error({ err }, 'Failed to parse Gutenberg metadata â€” library may be corrupt.');
            return [];
        }
    }

    private saveMetadata(books: BookMetadata[]): void {
        try {
            writeFileSync(this.metadataPath, JSON.stringify(books, null, 2));
            logger.debug({ count: books.length }, 'Persisted Gutenberg library metadata.');
        } catch (err) {
            logger.error({ err }, 'Sovereign failure: Unable to persist Gutenberg library metadata.');
        }
    }

    public async analyzeStyle(bookId: number): Promise<Result<{ profile: StyleProfile; book: BookMetadata }>> {
        const books = this.loadMetadata();
        const book = books.find(b => b.id === bookId);

        if (!book) return { ok: false, error: new Error(`Book ${bookId} not found.`) };

        try {
            const content = readFileSync(book.path, 'utf8');
            const profile = StyleAnalyzer.analyze(content);
            return { ok: true, value: { profile, book } };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    public getLibrary(): BookMetadata[] {
        return this.loadMetadata();
    }

    /**
     * getBookStorageInfo - Returns a sanitized category and folder name for pipeline storage.
     */
    public getBookStorageInfo(bookId: number): Result<{ category: string; folderName: string; book: BookMetadata }> {
        const books = this.loadMetadata();
        const book = books.find(b => b.id === bookId);
        if (!book) return { ok: false, error: new Error(`Book ${bookId} not found.`) };

        const category = book.domain.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'unsorted';
        const safeTitle = book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
        const folderName = `${book.id}_${safeTitle}`;

        return { ok: true, value: { category, folderName, book } };
    }

    /**
     * getSequencedSegments - Uses NarrativeExtractor to get specific beats from a book.
     */
    public async getSequencedSegments(bookId: number, count: number): Promise<Result<NarrativeSegment[]>> {
        const books = this.loadMetadata();
        const book = books.find(b => b.id === bookId);
        if (!book) return { ok: false, error: new Error(`Book ${bookId} not found in library.`) };

        try {
            if (!existsSync(book.path)) {
                return { ok: false, error: new Error(`Book substrate missing at ${book.path}`) };
            }
            const content = readFileSync(book.path, 'utf8');
            const segments = NarrativeExtractor.extract(content, count);
            return { ok: true, value: segments };
        } catch (err) {
            logger.error({ err, bookId }, 'Failed to extract sequenced segments.');
            return { ok: false, error: err as Error };
        }
    }

    /**
     * getAllSegments - Extracts every detected narrative beat for "Cinematic Mode".
     */
    public async getAllSegments(bookId: number): Promise<Result<NarrativeSegment[]>> {
        const books = this.loadMetadata();
        const book = books.find(b => b.id === bookId);
        if (!book) return { ok: false, error: new Error(`Book ${bookId} not found.`) };

        try {
            if (!existsSync(book.path)) return { ok: false, error: new Error(`No substrate at ${book.path}`) };
            const content = readFileSync(book.path, 'utf8');
            const segments = NarrativeExtractor.extractAll(content);
            return { ok: true, value: segments };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    public async ingestBook(id: number, title: string, author: string, domain: string, content?: string): Promise<Result<BookMetadata>> {
        if (!this.cachePath) return { ok: false, error: new Error('Gutenberg cache path not initialized.') };

        const existingBooks = this.getLibrary();
        const existingBook = existingBooks.find(b => b.id === id);
        if (existingBook) {
            logger.info({ id, title: existingBook.title }, 'Book already exists in library (by ID), skipping download/ingestion.');
            return { ok: true, value: existingBook };
        }

        let bookContent = content;
        if (!bookContent) {
            // Priority 1: Local Gutendex Substrate
            // Most Project Gutenberg clients use the mirrors or the local Gutendex proxy
            const url = `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;
            logger.info({ id, url }, 'Fetching book content (Local Gutendex redirection or PG Substrate)...');
            try {
                const response = await fetch(url).catch(e => {
                    throw new Error(`Network Connectivity Failure: ${e.message}`);
                });

                if (!response.ok) {
                    throw new Error(`Gutenberg Substrate rejected request: ${response.status} ${response.statusText}`);
                }
                bookContent = await response.text();
                logger.debug({ id, size: bookContent.length }, 'Book content acquired.');
            } catch (err) {
                logger.error({ err, id }, 'Gutenberg fetch failed.');
                return { ok: false, error: err as Error };
            }
        }

        const safeDomain = domain || 'unsorted';
        const domainPath = join(this.cachePath, 'domains', safeDomain);
        if (!existsSync(domainPath)) mkdirSync(domainPath, { recursive: true });

        const safeTitle = (title || 'Untitled').replace(/[^a-z0-9]/gi, '_');
        const safeAuthor = (author || 'Unknown').replace(/[^a-z0-9]/gi, '_');
        const fileName = `${safeTitle}_${safeAuthor}_${id}.txt`;
        const filePath = join(domainPath, fileName);

        if (existsSync(filePath)) {
            logger.warn({ id, title }, 'Book already exists in library â€” maintaining read-only constraint.');
            const existingMeta = this.loadMetadata().find(b => b.id === id);
            if (existingMeta) return { ok: true, value: existingMeta };
            return { ok: false, error: new Error('Book file exists but metadata is lost.') };
        }

        try {
            const checksum = createHash('sha256').update(bookContent!).digest('hex');

            writeFileSync(filePath, bookContent!);
            const metadata = { id, title, author, domain: safeDomain, path: filePath, checksum };

            const books = this.loadMetadata();
            books.push(metadata);
            this.saveMetadata(books);

            await this.vectorDB.addLesson({
                id: `gutenberg-${id}`,
                text: bookContent!.slice(0, 10000),
                embedding: new Float32Array(0),
                sessionId: 'gutenberg-ingestion',
                projectId: 'global',
                domainNamespace: 'global',
                errorType: 'none',
                createdAt: Date.now(),
                metadata: { source: `gutenberg:${id}`, author, domain: safeDomain, title, checksum }
            });

            return { ok: true, value: metadata };
        } catch (err) {
            logger.error({ err, id }, 'Ingestion failed â€” executing atomic rollback.');
            if (filePath && existsSync(filePath)) {
                try { unlinkSync(filePath); } catch (rollbackErr) { logger.warn({ rollbackErr }, 'Rollback unlinking failed.'); }
            }
            return { ok: false, error: err as Error };
        }
    }

    public async searchCatalog(query: string): Promise<Result<GutenbergBook[]>> {
        // Redirect to Local Gutendex instance (Django default port)
        const url = `http://localhost:8000/books/?search=${encodeURIComponent(query)}`;
        try {
            logger.info({ query, url }, 'Searching LOCAL Gutendex catalog substrate...');
            const response = await fetch(url).catch(e => {
                throw new Error(`Local Gutendex Connection Failure (Is Django running?): ${e.message}`);
            });

            if (!response.ok) {
                // Fallback to public API if local is down
                const publicUrl = `https://gutendex.com/books/?search=${encodeURIComponent(query)}`;
                logger.warn({ status: response.status }, 'Local Gutendex down. Falling back to public substrate...');
                const publicResponse = await fetch(publicUrl);
                if (!publicResponse.ok) throw new Error(`Public Gutendex also failed: ${publicResponse.status}`);
                const data = await publicResponse.json() as { results: any[] };
                return { ok: true, value: data.results || [] };
            }

            const data = await response.json() as { results: any[] };
            logger.info({ results: data.results?.length || 0 }, 'Local search complete.');
            return { ok: true, value: data.results || [] };
        } catch (err) {
            logger.error({ err, query }, 'Gutendex search failed.');
            return { ok: false, error: err as Error };
        }
    }

    public syncLibrary(): Result<string> {
        try {
            logger.info('Initiating library synchronization with substrate alignment...');
            const domainsPath = join(this.cachePath, 'domains');
            const sovereignPath = join(getGutenbergPath(), 'domains');

            const searchPaths = [domainsPath];
            if (existsSync(sovereignPath) && sovereignPath !== domainsPath) searchPaths.push(sovereignPath);

            const activeFiles: string[] = [];
            for (const root of searchPaths) {
                const queue = [root];
                while (queue.length > 0) {
                    const current = queue.pop()!;
                    const items = readdirSync(current);
                    for (const item of items) {
                        const fullPath = join(current, item);
                        if (statSync(fullPath).isDirectory()) {
                            queue.push(fullPath);
                        } else if (fullPath.endsWith('.txt')) {
                            activeFiles.push(fullPath);
                        }
                    }
                }
            }

            const currentMetadata = this.loadMetadata();
            const validMetadata: BookMetadata[] = [];
            let updatedCount = 0;
            let removedCount = 0;
            const seenIds = new Set<number>();

            for (const book of currentMetadata) {
                if (seenIds.has(book.id)) {
                    removedCount++;
                    continue;
                }

                // Align path if it shifted between substrates
                if (!existsSync(book.path)) {
                    // Try to align using the current active gutenberg path
                    const currentGutenberg = getGutenbergPath();
                    const fileName = book.path.split(/[\\/]/).pop();
                    if (fileName) {
                        const potentialPath = join(currentGutenberg, 'domains', book.domain, fileName);
                        if (existsSync(potentialPath)) {
                            book.path = potentialPath;
                            updatedCount++;
                        } else {
                            removedCount++;
                            continue;
                        }
                    }
                }

                // Try to infer gutendex_id from filename (if it's pgXXXX.txt)
                const pgMatch = book.path.match(/pg(\d+)\.txt$/i);
                if (pgMatch) book.gutendex_id = parseInt(pgMatch[1]);

                validMetadata.push(book);
                seenIds.add(book.id);
            }

            this.saveMetadata(validMetadata);
            const msg = `Library Synced. ${validMetadata.length} books healthy. Substrate paths aligned: ${updatedCount}.`;
            logger.info(msg);
            return { ok: true, value: msg };
        } catch (err) {
            logger.error({ err }, 'Sync failed due to substrate error.');
            return { ok: false, error: err as Error };
        }
    }

    public async organizeLibrary(): Promise<Result<string>> {
        const books = this.getLibrary();
        const unorganized = books.filter(b => b.domain === 'uncategorized' || !b.bookshelves || b.bookshelves.length === 0);
        if (unorganized.length === 0) return { ok: true, value: 'Library is organized.' };

        let organizedCount = 0;
        for (const book of unorganized) {
            try {
                const bookId = book.gutendex_id || book.id;
                const url = `https://gutendex.com/books/${bookId}`;
                logger.info({ bookId, title: book.title }, 'Fetching Gutendex bookshelves...');

                const response = await fetch(url);
                if (!response.ok) {
                    logger.warn({ bookId, status: (response as any).status }, 'Gutendex API request failed.');
                    continue;
                }

                const data = await response.json() as { bookshelves?: string[]; subjects?: string[] };
                book.bookshelves = data.bookshelves || [];
                book.subjects = data.subjects || [];

                // Extract primary category from bookshelves
                const categoryShelf = book.bookshelves.find(b => b.startsWith('Category:'));
                if (categoryShelf) {
                    book.domain = categoryShelf
                        .replace('Category: ', '').replace('Category:', '')
                        .trim().toLowerCase()
                        .replace(/[^a-z0-9]+/g, '_')
                        .replace(/^_|_$/g, '');
                    organizedCount++;
                } else if (book.bookshelves.length > 0) {
                    book.domain = book.bookshelves[0].trim().toLowerCase()
                        .replace(/[^a-z0-9]+/g, '_')
                        .replace(/^_|_$/g, '');
                    organizedCount++;
                }

                // Rate limit: be respectful to the public API
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) { logger.error({ err }, 'Organize failed for book.'); }
        }
        this.saveMetadata(books);
        return { ok: true, value: `Organized ${organizedCount} books using Gutendex bookshelves.` };
    }


    public async readBook(bookId: number, personality?: string, emotion?: string): Promise<Result<void>> {
        const books = this.loadMetadata();
        const book = books.find(b => b.id === bookId);
        if (!book) return { ok: false, error: new Error(`Book ${bookId} not found.`) };

        // Optimization: Check for existing soul/wisdom in memory substrate
        const existingWisdomPrompt = `literary wisdom for ${book.title}${personality ? ' with persona ' + personality : ''}`;
        const existingWisdomQuery = await this.vectorDB.searchSimilar(new Float32Array(0), 1, 'global', 'literary');

        // Phase 119: Strict personality/source check via direct DB query (Cognitive Proprioception)
        const db = (this.vectorDB as any).db;
        if (db) {
            const row = db.prepare(`
                SELECT id FROM lessons 
                WHERE type = 'literary_wisdom' 
                AND json_extract(metadata, '$.source') = ? 
                AND (json_extract(metadata, '$.personality') = ? OR (? IS NULL AND json_extract(metadata, '$.personality') IS NULL))
                AND (json_extract(metadata, '$.emotion') = ? OR (? IS NULL AND json_extract(metadata, '$.emotion') IS NULL))
                LIMIT 1
            `).get(`gutenberg:${bookId}`, personality, personality, emotion, emotion);

            if (row) {
                console.error(`[GUTENBERG] Soul of "${book.title}" [Persona: ${personality || 'standard'}, Emotion: ${emotion || 'neutral'}] already present in memory. Skipping.`);
                return { ok: true, value: undefined };
            }
        }

        console.error(`[GUTENBERG] Ingesting Author Soul: "${book.title}" [Persona: ${personality || 'Standard'}, Emotion: ${emotion || 'Neutral'}]`);

        try {
            const content = readFileSync(book.path, 'utf8');
            const chunkSize = 2000;
            const totalChunks = Math.ceil(content.length / chunkSize);

            let currentChunk = 0;

            for (let i = 0; i < content.length; i += chunkSize) {
                currentChunk++;
                if (currentChunk % 5 === 0 || currentChunk === 1) {
                    console.error(`[GUTENBERG] Deep Reading: Chunk ${currentChunk}/${totalChunks}...`);
                }
                const chunk = content.substring(i, i + chunkSize);

                let prompt = ` Wisdom extraction from ${book.title}. chunk: ${chunk}`;
                if (personality || emotion) {
                    prompt += `\nInterpret and summarize this chunk adopting the persona of a [${personality || 'Standard'}] influenced by a [${emotion || 'Neutral'}] emotional state.`;
                }
                const response = await this.client.call({ model: this.client.config.soulIngestionModel, prompt, temperature: 0.7 });
                if (response.ok) {
                    await this.vectorDB.addLesson({
                        id: `lesson-${bookId}-${i}-${Date.now()}`,
                        text: response.value.response,
                        embedding: new Float32Array(0),
                        projectId: 'global',
                        domainNamespace: 'global',
                        createdAt: Date.now(),
                        metadata: {
                            source: `gutenberg:${bookId}`,
                            title: book.title,
                            personality: personality || 'standard',
                            emotion: emotion || 'neutral'
                        },
                        hash: createHash('sha256').update(chunk).digest('hex'),
                        type: 'literary_wisdom',
                        sessionId: 'gutenberg-reading',
                        errorType: 'none'
                    });
                }
            }
            return { ok: true, value: undefined };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    public healthCheck(): { online: boolean; details: string } {
        const books = this.getLibrary();
        const exists = existsSync(this.cachePath);
        return {
            online: exists,
            details: exists ? `${books.length} books in library.` : 'Gutenberg cache substrate missing.'
        };
    }
    public getCacheSize(): Result<{ totalBytes: number; bookCount: number; formatted: string }> {
        try {
            const books = this.loadMetadata();
            let total = 0;
            for (const book of books) {
                if (existsSync(book.path)) {
                    total += statSync(book.path).size;
                }
            }

            const format = (bytes: number) => {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            };

            return { ok: true, value: { totalBytes: total, bookCount: books.length, formatted: format(total) } };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    /**
     * updateMetadataCache - Performs an atomic re-scan and checksum verification of all books.
     * Reclaims the substrate by removing entries for missing files.
     */
    public updateMetadataCache(): Result<{ removed: number; healthy: number }> {
        logger.info('Performing atomic metadata cache update and integrity check...');
        const books = this.loadMetadata();
        const healthy: BookMetadata[] = [];
        let removed = 0;

        for (const book of books) {
            if (existsSync(book.path)) {
                // Verify checksum integrity
                try {
                    const content = readFileSync(book.path, 'utf8');
                    const currentHash = createHash('sha256').update(content).digest('hex');
                    if (currentHash === book.checksum) {
                        healthy.push(book);
                    } else {
                        logger.warn({ id: book.id, title: book.title }, 'Checksum mismatch detected. Updating metadata.');
                        book.checksum = currentHash;
                        healthy.push(book);
                    }
                } catch (e) {
                    logger.error({ id: book.id }, 'Health check failed for book substrate.');
                    removed++;
                }
            } else {
                logger.warn({ id: book.id, title: book.title }, 'Substrate missing during audit. Removing from cache.');
                removed++;
            }
        }

        this.saveMetadata(healthy);
        return { ok: true, value: { removed, healthy: healthy.length } };
    }
}
