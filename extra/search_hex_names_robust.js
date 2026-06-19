const fs = require('fs');
const path = require('path');

const ITEMS_DIR = 'extra/items';
const SEARCH_NAMES = ['Tumeken\'s Light', 'Zombie head'];

function hexToString(hex) {
    // Some strings might not be prefixed with type byte/null terminator
    // Try naive conversion first
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const charCode = parseInt(hex.substr(i, 2), 16);
        if (charCode >= 32 && charCode <= 126) {
            str += String.fromCharCode(charCode);
        }
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
                
                // Check if any of our target names are inside the extracted name
                if (SEARCH_NAMES.some(sn => name.includes(sn))) {
                    console.log(`Found name candidate: "${name}" in file: ${file}`);
                }
            }
        } catch (e) {
            // Ignore
        }
    });
}

searchForNamesInHex();
