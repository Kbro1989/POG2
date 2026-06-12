const fs = require('fs');

console.log('Reading dbtables.json...');
const tablesData = JSON.parse(fs.readFileSync('D:/sovereign/cache_pedagogy/json_dumps/dbtables.json', 'utf8'));

console.log('Reading dbrows.json...');
const rowsData = JSON.parse(fs.readFileSync('D:/sovereign/cache_pedagogy/json_dumps/dbrows.json', 'utf8'));

const tableRows = {};
for (const row of rowsData) {
    const tableId = row.data && row.data.tableId;
    if (tableId !== undefined) {
        if (!tableRows[tableId]) {
            tableRows[tableId] = [];
        }
        tableRows[tableId].push(row);
    }
}

let output = '=== TABLE ID SUMMARY ===\n';
const tables = tablesData.tables || [];
for (const tbl of tables) {
    const id = tbl.id;
    const name = tbl.data && tbl.data.name;
    const rowCount = tableRows[id] ? tableRows[id].length : 0;
    if (rowCount > 0 || name) {
        output += `Table ID: ${id} | Name: ${name || 'UNKNOWN'} | Rows: ${rowCount}\n`;
    }
}

fs.writeFileSync('d:/POG2/scratch/tables_summary.txt', output);
console.log('Written summary to d:/POG2/scratch/tables_summary.txt');
