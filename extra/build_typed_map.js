const fs = require('fs');
const path = require('path');

const RAW_DIR = 'organized_templates'; 
const OUTPUT_FILE = 'extra/typed_name_to_id.json';

function buildTypedNameToIdMap() {
    const typedMap = {};
    
    // Get all top-level directories (e.g., items, npcs, objects, spotanims)
    const types = fs.readdirSync(RAW_DIR).filter(d => fs.statSync(path.join(RAW_DIR, d)).isDirectory());

    types.forEach(type => {
        typedMap[type] = {};
        const typeDir = path.join(RAW_DIR, type);
        const rawDir = path.join(typeDir, 'raw');

        if (fs.existsSync(rawDir)) {
            fs.readdirSync(rawDir).forEach(file => {
                if (file.endsWith('.json')) {
                    try {
                        const content = JSON.parse(fs.readFileSync(path.join(rawDir, file), 'utf8'));
                        // Extract ID from filename (e.g., items-61505.json -> 61505)
                        const id = file.split('-')[1]?.replace('.json', '');
                        if (content.name && id) {
                            typedMap[type][content.name] = id;
                        }
                    } catch (e) {
                        // Skip unparseable files
                    }
                }
            });
        }
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(typedMap, null, 2));
    console.log(`Finished building typed Name to ID map.`);
}

buildTypedNameToIdMap();
