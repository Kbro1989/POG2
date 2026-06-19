/**
 * POG2NativeCacheSource.ts
 *
 * Adapts POG2's JagexCacheReader (sql.js WASM, reads local .jcache) into
 * the rsmv CacheFileSource interface so CacheForensicsLimb can call
 * getArchiveById / getFileById / getFileArchive without knowing which
 * underlying fork (local vs download) is active.
 *
 * Two forks exposed:
 *   [LOCAL]    POG2NativeCacheSource  — sql.js WASM reads .jcache on disk
 *   [DOWNLOAD] wired via CacheDownloader from rsmv/src/cache/downloader.ts
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { JagexCacheReader } from './JagexCacheReader.js';
import { createLogger } from './logger.js';
import { existsSync } from 'fs';
import { join } from 'path';

const logger = createLogger('POG2NativeCacheSource');

// rsmv types — loaded dynamically so we don't hard-depend on native bindings
let CacheFileSource: any = null;
let CacheDownloader: any = null;
let indexBufferToObject: any = null;
let unpackSqliteBufferArchive: any = null;

try {
    const cacheIdx = require('../../../rsmv/src/cache/index.js');
    CacheFileSource = cacheIdx.CacheFileSource;
    indexBufferToObject = cacheIdx.indexBufferToObject;
    unpackSqliteBufferArchive = cacheIdx.unpackSqliteBufferArchive;
} catch { logger.warn('rsmv cache/index not available'); }

try {
    const dl = require('../../../rsmv/src/cache/downloader.js');
    CacheDownloader = dl.CacheDownloader;
} catch { logger.warn('rsmv CacheDownloader not available'); }

// ─── Local Fork (sql.js WASM) ─────────────────────────────────────────────────

/**
 * NativeLocalCacheSource wraps JagexCacheReader (sql.js) into the rsmv
 * CacheFileSource API surface used by CacheForensicsLimb.
 *
 * mappedFileIds (from rsmv/src/cache/index.ts):
 *   items=19→256, npcs=18→128, objects=16→256, enums=17→256, sequences=13→128
 */
export class NativeLocalCacheSource {
    private reader: JagexCacheReader;
    private indexCache = new Map<number, any[]>();
    readonly buildnr: number;

    constructor(reader: JagexCacheReader, buildnr = 940) {
        this.reader = reader;
        this.buildnr = buildnr;
    }

    getBuildNr() { return this.buildnr; }

    getDecodeArgs() {
        return { clientVersion: this.buildnr };
    }

    getCacheMeta() {
        return { name: 'pog2-native-local', descr: 'POG2 sql.js local .jcache reader', timestamp: new Date() };
    }

    // ── Index ──────────────────────────────────────────────────────────────────
    async getCacheIndex(major: number): Promise<any[]> {
        if (this.indexCache.has(major)) return this.indexCache.get(major)!;

        const entry = this.reader.readEntry(major === 255 ? 255 : major, 0);
        if (!entry?.decompressed) {
            logger.warn({ major }, 'getCacheIndex: no index file');
            return [];
        }

        if (indexBufferToObject) {
            try {
                const parsed = indexBufferToObject(major, entry.decompressed, this);
                this.indexCache.set(major, parsed);
                return parsed;
            } catch (e) {
                logger.warn({ major, err: (e as Error).message }, 'indexBufferToObject failed — heuristic fallback');
            }
        }

        // Heuristic: produce a minimal CacheIndexFile so callers don't crash
        const fallback: any[] = [];
        this.indexCache.set(major, fallback);
        return fallback;
    }

    // ── File ───────────────────────────────────────────────────────────────────
    async getFile(major: number, minor: number): Promise<Buffer> {
        const entry = this.reader.readEntry(major, minor);
        if (!entry?.decompressed) throw new Error(`NativeLocalCacheSource: ${major}.${minor} not found`);
        return entry.decompressed;
    }

    // ── Archive ────────────────────────────────────────────────────────────────
    async getFileArchive(index: any): Promise<any[]> {
        const file = await this.getFile(index.major, index.minor);
        if (unpackSqliteBufferArchive) {
            return unpackSqliteBufferArchive(file, index.subindices, index.subnames);
        }
        // Fallback: treat as single-file archive
        return [{ fileid: 0, offset: 0, size: file.byteLength, buffer: file, namehash: null }];
    }

    async getIndexEntryById(major: number, minor: number): Promise<any> {
        const index = await this.getCacheIndex(major);
        const entry = index[minor];
        if (!entry) throw new Error(`NativeLocalCacheSource: minor ${minor} not in major ${major}`);
        return entry;
    }

    async getArchiveById(major: number, minor: number): Promise<any[]> {
        const index = await this.getIndexEntryById(major, minor);
        return this.getFileArchive(index);
    }

    async getFileById(major: number, fileid: number): Promise<Buffer> {
        // rsmv mappedFileIds — objects=16→256, npcs=18→128, items=19→256 etc.
        const archSize = majorArchSize(major);
        const archiveId = Math.floor(fileid / archSize);
        const subid = fileid % archSize;
        const archive = await this.getArchiveById(major, archiveId);
        const match = archive.find((f: any) => f.fileid === subid);
        if (!match) throw new Error(`NativeLocalCacheSource: fileid ${fileid} not found in major ${major}`);
        return match.buffer;
    }

    close() { this.reader.close(); }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function majorArchSize(major: number): number {
    const MAP: Record<number, number> = {
        19: 256, // items
        18: 128, // npcs
        16: 256, // objects
        17: 256, // enums
        13: 128, // sequences
        32: 32,  // structs
    };
    return MAP[major] ?? 1;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Builds the best available cache source for the given cacheDir.
 *
 * Priority:
 *   1. LOCAL — sql.js reads local .jcache files (fast, no network)
 *   2. DOWNLOAD — CacheDownloader via live Jagex TCP (requires network)
 *   3. null — fully offline, heuristic-only mode
 */
export async function buildCacheSource(cacheDir: string): Promise<NativeLocalCacheSource | any | null> {
    // Fork 1: local .jcache exists?
    const probe = join(cacheDir, 'js5-16.jcache');
    if (existsSync(probe)) {
        try {
            const reader = new JagexCacheReader(cacheDir);
            const source = new NativeLocalCacheSource(reader);
            logger.info({ cacheDir }, '[LOCAL FORK] NativeLocalCacheSource active (sql.js).');
            return source;
        } catch (e) {
            logger.warn({ err: (e as Error).message }, 'Local fork init failed — trying download fork');
        }
    }

    // Fork 2: live download
    if (CacheDownloader) {
        try {
            const dl = new CacheDownloader();
            logger.info('[DOWNLOAD FORK] CacheDownloader active (live Jagex TCP).');
            return dl;
        } catch (e) {
            logger.warn({ err: (e as Error).message }, 'CacheDownloader init failed — heuristic-only mode');
        }
    }

    logger.warn('No cache source available. Running heuristic-only mode.');
    return null;
}
