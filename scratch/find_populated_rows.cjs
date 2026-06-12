const fs = require('fs');

const rowsData = JSON.parse(fs.readFileSync('D:/sovereign/cache_pedagogy/json_dumps/dbrows.json', 'utf8'));

const targetTables = [0, 11, 12, 16, 18, 19, 21, 25, 32, 49, 54, 56];

for (const id of targetTables) {
    const rows = rowsData.filter(r => r.data && r.data.tableId === id);
    const populated = rows.find(r => r.data.group3 && r.data.group3.columndata && r.data.group3.columndata.length > 0 && r.data.group3.columndata.some(col => col.columns && col.columns.length > 0));
    if (populated) {
        console.log(`\n================= TABLE ID ${id} (Populated sample from row ${populated.id}) =================`);
        console.log(JSON.stringify(populated.data.group3.columndata.filter(col => col.columns && col.columns.length > 0).slice(0, 3), null, 2));
    } else {
        console.log(`Table ID ${id}: No row has columns populated in group3.`);
    }
}
