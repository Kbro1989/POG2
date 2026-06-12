const fs = require('fs');

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

const targetTables = [0, 1, 2, 6, 7, 11, 12, 16, 18, 19, 21, 25, 32, 47, 49, 54, 56, 72, 73, 74, 96, 97, 103, 126, 257];

let output = '';
for (const id of targetTables) {
    if (tableRows[id] && tableRows[id].length > 0) {
        output += `\n================= TABLE ID ${id} (Rows: ${tableRows[id].length}) =================\n`;
        // Find a row that has columns / group3 data
        const filledRow = tableRows[id].find(r => r.data && r.data.group3 && r.data.group3.columndata && r.data.group3.columndata.length > 0);
        if (filledRow) {
            output += JSON.stringify(filledRow.data.group3.columndata.slice(0, 3), null, 2) + '\n';
        } else {
            output += JSON.stringify(tableRows[id].slice(0, 1), null, 2) + '\n';
        }
    }
}

fs.writeFileSync('d:/POG2/scratch/sample_rows_utf8.txt', output, 'utf8');
console.log('Written to d:/POG2/scratch/sample_rows_utf8.txt');
