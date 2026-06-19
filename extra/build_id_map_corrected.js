const fs = require('fs');

// We need a robust parser for JSONC (JSON with comments)
// Since I can't easily add a new library, I'll use a regex to remove comments before parsing
function parseJsonc(content) {
    const json = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    return JSON.parse(json);
}

const ITEMS_FILE = 'src/opcodes/items.jsonc';
const OUTPUT_FILE = 'extra/id_to_name.json';

function buildCorrectIdToNameMap() {
    const content = fs.readFileSync(ITEMS_FILE, 'utf8');
    const itemsData = parseJsonc(content);
    const map = {};
    
    // items.jsonc is typically an array of objects
    itemsData.forEach(item => {
        if (item.id && item.name) {
            map[item.id] = item.name;
        }
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(map, null, 2));
    console.log(`Finished building ID to Name map with ${Object.keys(map).length} items.`);
}

buildCorrectIdToNameMap();
