
import Database from 'better-sqlite3';

const dbPath = 'D:/sovereign/pog-coder-vibe/vibe-learning.db';
const db = new Database(dbPath, { readonly: true });


try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', JSON.stringify(tables, null, 2));

    for (const table of tables) {
        try {
            const count = db.prepare(`SELECT count(*) as count FROM ${table.name}`).get();
            console.log(`Table ${table.name} has ${count.count} rows`);
        } catch (e) { }
    }

} catch (err) {
    console.error('Error querying DB:', err.message);
} finally {
    db.close();
}
