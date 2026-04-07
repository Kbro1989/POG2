import fs from 'fs';
import path from 'path';

const DB_ROWS_PATH = 'D:/sovereign/atlas/system/dbrows.json';
const OUTPUT_DIR = 'D:/sovereign/atlas/logic/tables/';

async function shard() {
    console.log(`Reading ${DB_ROWS_PATH}...`);
    const data = JSON.parse(fs.readFileSync(DB_ROWS_PATH, 'utf8'));
    
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const tables: Record<number, any[]> = {};

    console.log(`Processing ${data.length} rows...`);
    data.forEach((row: any) => {
        if (!tables[row.table]) {
            tables[row.table] = [];
        }
        tables[row.table].push(row);
    });

    console.log(`Writing sharded tables to ${OUTPUT_DIR}...`);
    for (const [tableId, rows] of Object.entries(tables)) {
        const tablePath = path.join(OUTPUT_DIR, `table_${tableId}.json`);
        fs.writeFileSync(tablePath, JSON.stringify(rows, null, 2));
    }

    console.log(`Successfully sharded ${Object.keys(tables).length} tables.`);
}

shard().catch(console.error);
