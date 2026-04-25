import Database from 'better-sqlite3';

function probe(dbPath: string, name: string) {
    console.log(`\n--- PROBING ${name} (${dbPath}) ---`);
    try {
        const db = new Database(dbPath, { readonly: true });
        
        // 1. Get Tables
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log(`[TABLES] Found ${tables.length} tables:`, tables.map((t: any) => t.name).join(', '));
        
        // 2. Dump Schemas and Rows for each table
        for (const table of tables) {
            const tableName = (table as any).name;
            console.log(`\n- Table: ${tableName}`);
            
            // Schema
            const schema = db.prepare(`PRAGMA table_info("${tableName}")`).all();
            console.log(`  Columns:`, schema.map((c: any) => `${c.name} (${c.type})`).join(', '));
            
            // Sample
            const rows = db.prepare(`SELECT * FROM "${tableName}" LIMIT 3`).all();
            console.log(`  Data Sample:`, JSON.stringify(rows, null, 2));
        }
        
        db.close();
    } catch (err: any) {
        console.error(`[ERROR] Failed to probe ${name}:`, err.message);
    }
}

probe('C:/ProgramData/Jagex/RuneScape/GlobalSettings.jcache', 'GlobalSettings');
probe('C:/ProgramData/Jagex/RuneScape/ObjCache.jcache', 'ObjCache');
probe('C:/Users/Destiny/AppData/Local/Jagex/RuneScape/Settings.jcache', 'LocalSettings');
