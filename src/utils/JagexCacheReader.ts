import { gunzipSync, inflateSync } from 'zlib';
import Database from 'better-sqlite3';

interface CacheEntry {
  key: number;
  data: Buffer;
  version: number;
  crc: number;
  compressionType: 'zlib' | 'gzip' | 'bzip2' | 'none';
  decompressed: Buffer | null;
}

export class JagexCacheReader {
  private db: any;
  private readonly ZLIB_MAGIC = Buffer.from([0x78, 0x9c]);
  private readonly GZIP_MAGIC = Buffer.from([0x1f, 0x8b]);
  private readonly BZIP_MAGIC = Buffer.from([0x42, 0x5a, 0x68]); // "BZh"
  
  constructor(dbPath: string) {
    this.db = new Database(dbPath, { readonly: true });
  }

  readEntry(groupId: number, fileId: number = 0): CacheEntry | null {
    // JS5 uses composite keys: groupId << 32 | fileId
    const key = (BigInt(groupId) << BigInt(32)) | BigInt(fileId);
    
    // Key in SQLite is INTEGER (signed). BigInt handles the 64-bit value.
    const row: any = this.db.prepare('SELECT * FROM cache WHERE KEY = ?').get(Number(key));
    if (!row) return null;

    const compressed = row.DATA as Buffer;
    const decompressed = this.decompress(compressed);
    
    return {
      key: row.KEY,
      data: compressed,
      version: row.VERSION,
      crc: row.CRC,
      compressionType: this.detectCompression(compressed),
      decompressed
    };
  }

  private detectCompression(data: Buffer): 'zlib' | 'gzip' | 'bzip2' | 'none' {
    if (data.length >= 3 && data.slice(0, 3).toString('hex') === '5a4c42') return 'zlib'; // ZLB wrapper
    if (data.length >= 2 && data.slice(0, 2).equals(this.ZLIB_MAGIC)) return 'zlib';
    if (data.length >= 2 && data.slice(0, 2).equals(this.GZIP_MAGIC)) return 'gzip';
    if (data.length >= 3 && data.slice(0, 3).equals(this.BZIP_MAGIC)) return 'bzip2';
    return 'none';
  }

  private decompress(data: Buffer): Buffer | null {
    try {
      // Check for ZLB wrapper (ZLB + version + reserved + compressedSize + decompressedSize)
      if (data.length >= 3 && data.slice(0, 3).toString() === 'ZLB') {
        // RS3 ZLB format: 0x5A4C4201 + decompressedSize(4) + compressedData...
        // Wait, the user's logic had offset 7 and 11.
        // Let's check the header again from the sample: 5a 4c 42 01 (4 bytes)
        // Then 00 00 0f 1e (4 bytes) -> 3870 bytes (decompressed size?)
        // Total data length was 3854 + header...
        
        const decompressedSize = data.readUInt32BE(4);
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
      
      return data; // Uncompressed
    } catch (e) {
      console.error(`Decompression failed: ${e}`);
      return null;
    }
  }

  public close() {
    this.db.close();
  }
}
