
import Database from 'better-sqlite3';

const db = new Database("D:/D-sovereign-/learning/sovereign-learning.db", { readonly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables in sovereign-learning.db:", tables.map(t => t.name));

for (const table of tables) {
    try {
        const count = db.prepare(`SELECT COUNT(*) as c FROM ${table.name}`).get();
        console.log(`Table ${table.name}: ${count.c} rows`);
    } catch {}
}

db.close();
