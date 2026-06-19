const fs = require('fs');
const path = require('path');

const ITEMS_DIR = 'extra/items';
const SEARCH_NAMES = ['Tumeken\'s Light', 'Zombie head'];

function hexToString(hex) {
    // Strip first 2 hex chars (likely type byte) and last 2 hex chars (null terminator)
    const dataHex = hex.slice(2, -2);
    let str = '';
    for (let i = 0; i < dataHex.length; i += 2) {
        str += String.fromCharCode(parseInt(dataHex.substr(i, 2), 16));
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
                const hexName = content.originalFile.substr(nameChunk.offset * 2, nameChunk.len * 2);
                const name = hexToString(hexName);
                
                if (SEARCH_NAMES.some(sn => name.includes(sn))) {
                    console.log(`Found "${name}" in file: ${file}`);
                }
            }
        } catch (e) {
            // Ignore
        }
    });
}

searchForNamesInHex();
