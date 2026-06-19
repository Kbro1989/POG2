const fs = require('fs');
const path = require('path');

const ITEMS_DIR = 'organized_templates/items'; // Need to be recursive for all items
const OUTPUT_FILE = 'extra/id_to_name.json';

function buildIdToNameMap() {
    const map = {};
    
    // Recursive search for all .template.json files
    function walk(dir) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith('.template.json')) {
                const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                // Assuming template structure: { versions: [{ id: number, name: string, data: { ... } }] }
                if (content.versions) {
                    content.versions.forEach(v => {
                        if (v.id && v.name) {
                            map[v.id] = v.name;
                        }
                    });
                }
            }
        });
    }

    walk('organized_templates');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(map, null, 2));
    console.log('Finished building ID to Name map.');
}

buildIdToNameMap();
