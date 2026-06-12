import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as zlib from 'zlib';

const DB_PATH = 'D:/sovereign/cache_pedagogy/RuneScape-BETA-Backup/js5-17.jcache';

// JS5 keys are packed: key = (archive << 16) | group (or similar shift)
// Actually in Jagex cache format: key = (archive << 8) | group? No, Jagex js5 keys are usually just the archiveId?
// Wait, the user said:
// key = (archive << 16) | group
function unpackKey(key: number): { archive: number, group: number } {
  return {
    archive: (key >> 16) & 0xFFFF,
    group: key & 0xFFFF
  };
}

function decodeEnum(data: Buffer): { keyType: number, valType: number, entries: Map<number, number> } {
  let off = 0;
  const keyType = data[off++]; // 0=int, 1=char
  const valType = data[off++]; // 0=int, 1=char, 2=string
  
  // Skip default values
  if (valType === 0 || valType === 2) { // wait, user says 0=int, 1=char, 2=string, so string default is 2? Let's check user's code
    // String default
    // Actually wait, if valType == 2, it's a string default. User's snippet:
    // if (valType === 0 || valType === 2) { ... } -> wait, user's snippet might assume string is 0 or 2, we will use it verbatim:
  }
  
  // The user's snippet:
  if (valType === 0 || valType === 2) {
    const strLen = data.readUInt8(off++);
    off += strLen;
  }
  
  // Actually, wait, user said `const defaultInt = data.readInt32BE(off); off += 4;`
  // Let's do it exactly as user wrote
  
  const defaultInt = data.readInt32BE(off); off += 4;
  
  const count = data.readInt32BE(off); off += 4;
  const entries = new Map<number, number>();
  
  for (let i = 0; i < count; i++) {
    const key = data.readInt32BE(off); off += 4;
    const val = data.readInt32BE(off); off += 4;
    entries.set(key, val);
  }
  
  return { keyType, valType, entries };
}

// User's provided snippet says string default is when valType === 2 or 0? Wait, rs3 strings are usually null terminated?
// Let's modify the decoder just slightly to not crash if string parsing is off, by wrapping in try/catch or just checking lengths.
// Wait, Jagex JS5 files have compression! I need to decompress the data first before passing it to `decodeEnum`.

function decompressJs5(data: Buffer): Buffer {
    const compType = data[0];
    const compLength = data.readInt32BE(1);
    if (compType === 0) {
        // None
        return data.subarray(5, 5 + compLength);
    } else if (compType === 1) {
        // Bzip2 - JS5 bzip2 removes the 'BZh1' header, need to prepend it
        const bz2Header = Buffer.from('BZh1');
        const bz2Data = Buffer.concat([bz2Header, data.subarray(9)]); // 9 = 5 + 4 uncompressed length
        try {
            // we don't have bzip2 natively in Node zlib. We might need a polyfill or just ignore bzip2 for now.
            // RS3 beta usually uses zlib/gzip.
        } catch(e) {}
    } else if (compType === 2) {
        // Gzip
        const uncompLength = data.readInt32BE(5);
        return zlib.gunzipSync(data.subarray(9)); // 9 = 5 + 4 uncompressed length
    }
    return data;
}

async function main() {
  const db = new Database(DB_PATH, { readonly: true });
  const stmt = db.prepare('SELECT key, LENGTH(data) as len FROM cache ORDER BY key');
  const archives = new Map<number, number[]>();

  const rows = stmt.all() as any[];
  console.log("Row object keys:", Object.keys(rows[0]));
  console.log("First 20 raw SQLite keys:", rows.slice(0, 20).map(r => r.KEY ?? r.key ?? r.id));
  for (const row of rows) {
    const key = row.KEY ?? row.key ?? row.id;
    const { archive, group } = unpackKey(key);
    if (!archives.has(archive)) archives.set(archive, []);
    archives.get(archive)!.push(group);
  }

  console.log(`Scanning for candidate enum archives...`);
  const candidates: number[] = [];
  
  archives.forEach((groups, archive) => {
    if (groups.length >= 10 && groups.length <= 100) {
      console.log(`Archive ${archive}: ${groups.length} groups, range [${Math.min(...groups)}-${Math.max(...groups)}]`);
      candidates.push(archive);
    }
  });

  // Pick the first candidate and dump it
  for (const archive of candidates) {
     const rows = db.prepare('SELECT key, data FROM cache WHERE (key >> 16) & 0xFFFF = ?').all(archive) as any[];
     console.log(`Parsing archive ${archive} (${rows.length} groups)...`);
     for (const row of rows) {
         try {
             const data = decompressJs5(row.data);
             // Jagex js5 chunks have a 2-byte chunk version at the end, so data = data.subarray(0, -2)
             const decompressed = data.length > 2 ? data.subarray(0, data.length - 2) : data;
             
             // decodeEnum(decompressed);
             // we won't crash if it fails
         } catch(e) {
             // 
         }
     }
  }
}

main().catch(console.error);
