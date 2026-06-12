import Database from 'better-sqlite3';
import * as path from 'path';

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const dbFile = path.resolve(BETA_CACHE_PATH, 'js5-8.jcache');
    console.log(`Opening ${dbFile}...`);
    const db = new Database(dbFile, { readonly: true });
    
    // Find max key in the cache table
    const row = db.prepare('SELECT MAX(KEY) as maxKey FROM cache').get() as any;
    console.log(`Max Sprite Key: ${row.maxKey}`);
    
    // List keys near 30934
    const rows = db.prepare('SELECT KEY FROM cache WHERE KEY >= 30934 AND KEY <= 31000').all();
    console.log(`Keys in range [30934, 31000]:`);
    console.log(rows.map((r: any) => r.KEY).join(', '));
}

main().catch(console.error);
