
import Database from 'better-sqlite3';

const db = new Database("C:\\ProgramData\\Jagex\\RuneScape-BETA\\js5-5.jcache", { readonly: true });
const count = db.prepare("SELECT COUNT(*) as c FROM cache").get();
console.log("Total rows in cache table:", count.c);

const sample = db.prepare("SELECT KEY FROM cache LIMIT 10").all();
console.log("Sample Keys:", sample.map(r => r.KEY));

db.close();
