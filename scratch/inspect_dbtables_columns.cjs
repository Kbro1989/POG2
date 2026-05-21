const fs = require('fs');

const tablesData = JSON.parse(fs.readFileSync('D:/sovereign/cache_pedagogy/json_dumps/dbtables.json', 'utf8'));

const targetTables = [0, 1, 2, 6, 7, 11, 12, 16, 18, 19, 21, 25, 32, 49, 54, 56, 72, 73, 74, 96, 97, 103, 126, 257];

for (const id of targetTables) {
    const tbl = tablesData.tables.find(t => t.id === id);
    if (tbl) {
        console.log(`\n================= TABLE ID ${id} SCHEMA =================`);
        if (tbl.data && tbl.data.columns) {
            console.log(JSON.stringify(tbl.data.columns, null, 2));
        } else {
            console.log('No columns array found:', JSON.stringify(tbl.data, null, 2));
        }
    } else {
        console.log(`Table ID ${id} not found in dbtables.json`);
    }
}
