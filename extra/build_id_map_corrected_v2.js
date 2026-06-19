const fs = require('fs');
const path = require('path');

const RAW_ITEMS_DIR = 'organized_templates'; 
const OUTPUT_FILE = 'extra/id_to_name.json';

function buildCorrectIdToNameMap() {
    const map = {};
    
    // Recursive search for all item files, ensuring we only grab items
    function walk(dir) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (file.startsWith('items-') && file.endsWith('.json')) {
                const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                // Files are named items-ID.json
                const id = file.replace('items-', '').replace('.json', '');
                if (content.name) {
                    map[id] = content.name;
                }
            }
        });
    }

    walk(RAW_ITEMS_DIR);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(map, null, 2));
    console.log(`Finished building ID to Name map with ${Object.keys(map).length} items.`);
}

buildCorrectIdToNameMap();
