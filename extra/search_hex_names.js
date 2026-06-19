const fs = require('fs');
const path = require('path');

const ITEMS_DIR = 'extra/items';
const SEARCH_NAMES = ['Tumeken\'s Light', 'Zombie head'];

function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

function searchForNamesInHex() {
    const files = fs.readdirSync(ITEMS_DIR);
    
    files.forEach(file => {
        if (!file.endsWith('.json')) return;
        
        try {
            const content = JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, file), 'utf8'));
            if (!content.chunks || !content.originalFile) return;

            const nameChunk = content.chunks.find(c => c.label === 'name');
            if (nameChunk) {
                // originalFile is hex string
                // Extract substring based on offset and length
                // Hex is 2 chars per byte
                const hexName = content.originalFile.substr(nameChunk.offset * 2, nameChunk.len * 2);
                const name = hexToString(hexName);
                
                if (SEARCH_NAMES.includes(name)) {
                    console.log(`Found "${name}" in file: ${file}`);
                }
            }
        } catch (e) {
            // Ignore
        }
    });
}

searchForNamesInHex();
