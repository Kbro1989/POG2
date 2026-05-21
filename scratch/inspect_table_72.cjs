const fs = require('fs');

const rowsData = JSON.parse(fs.readFileSync('D:/sovereign/cache_pedagogy/json_dumps/dbrows.json', 'utf8'));

const table72Rows = rowsData.filter(r => r.data && r.data.tableId === 72);
console.log('--- TABLE 72 SAMPLE ROWS ---');
console.log(JSON.stringify(table72Rows.slice(0, 10), null, 2));

const table74Rows = rowsData.filter(r => r.data && r.data.tableId === 74);
console.log('\n--- TABLE 74 SAMPLE ROWS ---');
console.log(JSON.stringify(table74Rows.slice(0, 10), null, 2));

const table47Rows = rowsData.filter(r => r.data && r.data.tableId === 47);
console.log('\n--- TABLE 47 SAMPLE ROWS ---');
console.log(JSON.stringify(table47Rows.slice(0, 10), null, 2));
