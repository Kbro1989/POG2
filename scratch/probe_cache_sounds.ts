
import Database from 'better-sqlite3';
import { join } from 'path';

const CACHE_DIR = 'D:\\D-sovereign-\\cache_pedagogy\\RuneScape-BETA-Backup';
const INDICES = [1, 2, 3, 14, 15];

async function probe() {
    for (const idx of INDICES) {
        const dbPath = join(CACHE_DIR, `js5-${idx}.jcache`);
        console.log(`\n=== PROBING INDEX ${idx}: ${dbPath} ===`);
        try {
            const db = new Database(dbPath, { readonly: true });

            const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
            console.log(`Tables: ${tables.map((t: any) => t.name).join(', ')}`);

            for (const table of tables) {
                const tableName = (table as any).name;
                console.log(`\n--- Table: ${tableName} ---`);

                const schema = db.prepare(`PRAGMA table_info("${tableName}")`).all();
                console.log(`Columns: ${schema.map((c: any) => `${c.name} (${c.type})`).join(', ')}`);

                const sample = db.prepare(`SELECT * FROM "${tableName}" LIMIT 3`).all();
                console.log(`Sample: ${JSON.stringify(sample, null, 2)}`);
            }
            db.close();
        } catch (e) {
            console.error(`Failed to probe index ${idx}: ${e}`);
        }
    }
}

probe();
