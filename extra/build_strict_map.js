const fs = require('fs');
const path = require('path');

const RAW_ITEMS_DIR = 'organized_templates'; 
const OUTPUT_FILE = 'extra/name_to_id.json';

function buildStrictNameToIdMap() {
    const map = {};
    
    function walk(dir) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (file.startsWith('items-') && file.endsWith('.json')) {
                const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                // Use the cache definition as the source of truth
                const id = file.replace('items-', '').replace('.json', '');
                if (content.name) {
                    map[content.name] = id;
                }
            }
        });
    }

    walk(RAW_ITEMS_DIR);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(map, null, 2));
    console.log(`Finished building strict Name to ID map with ${Object.keys(map).length} items.`);
}

buildStrictNameToIdMap();
