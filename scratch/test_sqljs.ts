import initSqlJs from 'sql.js';
import * as fs from 'fs';

async function test() {
    const SQL = await initSqlJs();
    const dbPath = 'C:\\ProgramData\\Jagex\\RuneScape\\js5-16.jcache';
    if (!fs.existsSync(dbPath)) {
        console.log('Cache not found');
        return;
    }
    const filebuffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(filebuffer);
    const res = db.exec("SELECT COUNT(*) FROM cache;");
    console.log(res);
}
test();
