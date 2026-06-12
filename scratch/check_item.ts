import * as fs from 'fs';

const items = JSON.parse(fs.readFileSync('D:/sovereign/cache_pedagogy/json_dumps/items.json', 'utf8'));

console.log('Item 42824 Keys:', Object.keys(items['42824']).join(', '));
console.log('Wear models:');
for (const [k, v] of Object.entries(items['42824'])) {
    if (k.toLowerCase().includes('model')) {
        console.log(`  ${k}: ${v}`);
    }
}
