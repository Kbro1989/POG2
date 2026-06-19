const fs = require('fs');
const path = require('path');

const ITEMS_DIR = 'extra/items';
const SEARCH_NAMES = ['Tumeken\'s Light', 'Zombie head'];

function searchForNames() {
    const files = fs.readdirSync(ITEMS_DIR);
    
    files.forEach(file => {
        if (!file.endsWith('.json')) return;
        
        try {
            const content = JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, file), 'utf8'));
            // Check if this file contains the name
            if (content.name && SEARCH_NAMES.includes(content.name)) {
                console.log(`Found "${content.name}" in file: ${file}`);
            }
            // Also check 'extra' array for name props
            if (content.extra) {
                content.extra.forEach(prop => {
                    if (prop.stringvalue && SEARCH_NAMES.includes(prop.stringvalue)) {
                        console.log(`Found "${prop.stringvalue}" in extra props of: ${file}`);
                    }
                });
            }
        } catch (e) {
            // Ignore parse errors
        }
    });
}

searchForNames();
