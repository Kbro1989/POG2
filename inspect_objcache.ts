import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const dbPath = 'C:\\ProgramData\\Jagex\\RuneScape\\ObjCache.jcache';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err: any) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err: any, rows: any[]) => {
        if (err) {
            console.error('Error listing tables:', err.message);
            return;
        }
        console.log('Tables found:', rows.map(r => r.name));
        
        rows.forEach(row => {
            db.all(`SELECT * FROM ${row.name} LIMIT 10`, [], (err: any, data: any[]) => {
                if (err) {
                    console.error(`Error reading table ${row.name}:`, err.message);
                    return;
                }
                console.log(`\n--- Table: ${row.name} (Top 10) ---`);
                console.log(data);
            });
        });
    });
});
