import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as zlib from 'zlib';

const DB_PATH = 'D:/sovereign/cache_pedagogy/RuneScape-BETA-Backup/js5-17.jcache';

async function main() {
    console.log(`Connecting to beta cache enums at ${DB_PATH}...`);
    if (!fs.existsSync(DB_PATH)) {
        console.error('File does not exist. The enums might be stored differently.');
        // Let's check what jcache files exist.
        const files = fs.readdirSync('D:/sovereign/cache_pedagogy/RuneScape-BETA-Backup');
        console.log('Available jcache files:', files.filter(f => f.endsWith('.jcache')));
        return;
    }

    const db = new Database(DB_PATH, { readonly: true });
    
    // In typical Jagex SQLite caches, the table is `cache` with columns `KEY` and `DATA`.
    const rows = db.prepare('SELECT KEY, DATA FROM cache LIMIT 10').all() as any[];
    console.log(`Extracted ${rows.length} rows from js5-17.`);
    
    for (const row of rows) {
        const key = row.KEY;
        const data = row.DATA as Buffer;
        
        // Decompress logic (typically no compression, or bzip2, or gzip. JS5 format starts with 1 byte compression type)
        // 0 = none, 1 = bzip2, 2 = gzip
        const compType = data[0];
        const compLength = data.readInt32BE(1);
        
        console.log(`Enum Archive ${key} - Size: ${data.length} bytes - Compression: ${compType}`);
    }
}

main().catch(console.error);
