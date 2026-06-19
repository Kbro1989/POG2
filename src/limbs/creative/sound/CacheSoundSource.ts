
import { JagexCacheReader } from '../../../utils/JagexCacheReader.js';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * CacheSoundSource
 * Low-level accessor for raw audio archives (Index 14: SFX, Index 15: Music).
 * Handles the retrieval of compressed audio buffers from the .jcache SQLite databases.
 */
export class CacheSoundSource {
    private reader: JagexCacheReader;
    public static DEFAULT_CACHE_DIR = 'C:\\ProgramData\\Jagex\\RuneScape';
    public static BACKUP_CACHE_DIR = resolveSovereignPath('cache_pedagogy/RuneScape-BETA-Backup');

    constructor(cacheDir?: string) {
        // Priority: Passed dir -> Live C: drive -> Authoritative Backup D: drive
        const activeDir = cacheDir ||
            (existsSync(CacheSoundSource.DEFAULT_CACHE_DIR) ? CacheSoundSource.DEFAULT_CACHE_DIR : CacheSoundSource.BACKUP_CACHE_DIR);
        this.reader = new JagexCacheReader(activeDir);
    }

    /**
     * getSoundBuffer - Fetches raw audio bytes for a specific sound ID.
     * @param soundId The index within the audio archive.
     * @param isMusic If true, targets Index 15, otherwise Index 14.
     * @param cacheMajor Override the cache major directly when a specific archive is known.
     */
    public async getSoundBuffer(soundId: number, isMusic = false, cacheMajor?: number): Promise<Buffer | null> {
        const major = cacheMajor ?? (isMusic ? 15 : 14);
        const entry = this.reader.readEntry(major, soundId);

        if (!entry) {
            return null;
        }

        // We return the decompressed version for the decoder to process
        return entry.decompressed || entry.data;
    }

    /**
     * getRawAudioEntry - Returns full metadata including CRC.
     */
    public getRawAudioEntry(soundId: number, isMusic = false, cacheMajor?: number) {
        const major = cacheMajor ?? (isMusic ? 15 : 14);
        return this.reader.readEntry(major, soundId);
    }

    public close() {
        this.reader.close();
    }
}
