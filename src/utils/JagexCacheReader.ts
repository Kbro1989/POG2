import { gunzipSync, inflateSync } from 'zlib';
import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync } from 'fs';
import { SovereignDBLifecycle } from './SovereignDBLifecycle.js';

export interface CacheEntry {
    major: number;
    minor: number;
    data: Buffer;
    crc: number;
    decompressed: Buffer | null;
}

/**
 * JagexCacheReader - Multi-Archive Sensing Layer.
 * Supports the NXT '.jcache' format where each major index is a separate SQLite database.
 */
export class JagexCacheReader {
    private readonly cacheDir: string;
    private databases: Map<number, any> = new Map();
    private closed = false;
    private registered = false;

    private readonly ZLIB_MAGIC = Buffer.from([0x78, 0x9c]);
    private readonly GZIP_MAGIC = Buffer.from([0x1f, 0x8b]);

    constructor(cacheDir: string) {
        this.cacheDir = cacheDir;
    }

    /**
     * openArchive - Dynamically opens the database for a specific major index.
     */
    private openArchive(major: number): any {
        if (this.databases.has(major)) {
            return this.databases.get(major);
        }

        const dbPath = join(this.cacheDir, `js5-${major}.jcache`);
        if (!existsSync(dbPath)) {
            return null;
        }

        try {
            const db = new Database(dbPath, { readonly: true });
            this.databases.set(major, db);
            if (!this.registered) {
                this.registered = true;
                SovereignDBLifecycle.getInstance().register('JagexCacheReader', this);
            }
            return db;
        } catch (e) {
            console.error(`Failed to open archive database [${major}]: ${e}`);
            return null;
        }
    }

    /**
     * readEntry - Fetches a raw file from the specific archive database.
     */
    public readEntry(major: number, minor: number): CacheEntry | null {
        const db = this.openArchive(major);
        if (!db) return null;

        try {
            const row: any = db.prepare('SELECT DATA, CRC FROM cache WHERE KEY = ?').get(minor);
            if (!row) return null;

            const compressed = row.DATA as Buffer;
            const decompressed = this.decompress(compressed);

            return {
                major,
                minor,
                data: compressed,
                crc: row.CRC,
                decompressed
            };
        } catch (e) {
            console.error(`Read error in archive [${major}], key [${minor}]: ${e}`);
            return null;
        }
    }

    /**
     * readSubEntry - Fetches a specific sub-file from a multi-file archive.
     * Uses NXT footer-based chunking logic (Protocol 1).
     */
    public readSubEntry(major: number, minor: number, subId: number): Buffer | null {
        const entry = this.readEntry(major, minor);
        if (!entry || !entry.decompressed) return null;

        const buffer = entry.decompressed;
        if (buffer.length === 0) return null;

        // NXT Archive Unpacking Logic (Footer-based)
        // Last byte is the number of chunks
        const nChunks = buffer.readUInt8(buffer.length - 1);
        if (nChunks === 0) return subId === 0 ? buffer : null;

        // In RS3 NXT, archives use a footer to define sub-file sizes.
        // The table is at [buffer.length - 1 - (4 * nFiles * nChunks)]
        // Since we don't always know nFiles, we check the common RS3 multi-file header
        // which contains the subCount (Protocol 1).
        
        if (buffer[0] === 0x01) {
            const firstOffset = buffer.readUInt32BE(1);
            const subCount = (firstOffset - 5) / 4;
            
            // We need to map the 'subId' (which is a file ID) to an 'index' in the archive.
            // For Archive 5 (Mapsquares), we know 0 = Locations, 3 = Terrain.
            // If the archive only contains [0, 3], then subId 3 is at Index 1.
            
            // TODO: In a production environment, this mapping should be fetched from the Master Index (Archive 255).
            // For POG2's sensing layer, we'll implement a heuristic mapping for Archive 5.
            let index = subId;
            if (major === 5) {
                // Heuristic: If we only have 2 files (Locations/Terrain), map 3 to index 1.
                if (subCount === 2 && subId === 3) index = 1;
            }

            if (index >= subCount) return null;

            const start = index === 0 ? firstOffset : buffer.readUInt32BE(1 + (index * 4));
            const end = buffer.readUInt32BE(1 + ((index + 1) * 4));

            if (start < 0 || end > buffer.length || start > end) return null;
            return buffer.slice(start, end);
        }

        return subId === 0 ? buffer : null; 
    }

    private decompress(data: Buffer): Buffer | null {
        try {
            // RS3 ZLB format: 'ZLB' (3) + version (1) + decompressedSize (4) + payload...
            if (data.length >= 8 && data.slice(0, 3).toString() === 'ZLB') {
                const payload = data.slice(8);
                return inflateSync(payload);
            }

            // Raw zlib
            if (data.length >= 2 && data.slice(0, 2).equals(this.ZLIB_MAGIC)) {
                return inflateSync(data);
            }

            // Gzip
            if (data.length >= 2 && data.slice(0, 2).equals(this.GZIP_MAGIC)) {
                return gunzipSync(data);
            }

            return data; // Uncompressed/Pre-decompressed by SQLite logic
        } catch (e) {
            console.error(`Decompression failed: ${e}`);
            return null;
        }
    }

    public close(): void {
        if (this.closed) return;
        this.closed = true;
        for (const db of this.databases.values()) {
            try { db.close(); } catch { /* ignore */ }
        }
        this.databases.clear();
    }
}

