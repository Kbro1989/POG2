const fs = require('fs');

console.log('Reading dbtables.json...');
const tablesData = JSON.parse(fs.readFileSync('D:/sovereign/cache_pedagogy/json_dumps/dbtables.json', 'utf8'));

console.log('Reading dbrows.json...');
const rowsData = JSON.parse(fs.readFileSync('D:/sovereign/cache_pedagogy/json_dumps/dbrows.json', 'utf8'));

// Group rows by tableId
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

console.log('\n--- DEFINED TABLES AND ROW COUNTS ---');
const tables = tablesData.tables || [];
for (const tbl of tables) {
    const id = tbl.id;
    const name = tbl.data && tbl.data.name;
    const rowCount = tableRows[id] ? tableRows[id].length : 0;
    if (rowCount > 0 || name) {
        console.log(`Table ID: ${id} | Name: ${name || 'UNKNOWN'} | Rows: ${rowCount}`);
        if (rowCount > 0) {
            console.log(`  Sample Row Data: ${JSON.stringify(tableRows[id].slice(0, 1), null, 2)}`);
        }
    }
}
