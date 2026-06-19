const fs = require('fs');
const path = require('path');

const ITEMS_DIR = 'extra/items';
const SEARCH_NAMES = ['Tumeken\'s Light', 'Zombie head'];

function searchForNames() {
    const files = fs.readdirSync(ITEMS_DIR);
    
    // Process a subset first to verify
    for (let i = 0; i < Math.min(files.length, 500); i++) {
        const file = files[i];
        if (!file.endsWith('.json')) continue;
        
        try {
            const content = JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, file), 'utf8'));
            
            // The JSON structure is: {"originalFile": "...", "chunks": [...], "error": "success"}
            // The item data seems encoded in the "originalFile" hex string,
            // or perhaps parsed in "chunks" if the tool worked.
            
            // Looking at the example: {"originalFile": "...", "chunks": [...]}
            // If the parser succeeded, the item name might be in the chunks or parsed elsewhere.
            // Wait, the structure in the example looks like an *attempted* parse that produced chunks but no 'name' field at top level.
            
            // Let's check if 'name' exists in the parsed JSON? No, it's not at the top level.
            // Based on the example, the tool might have failed to fully parse it into a 'name' field.
            
            // Let's re-examine: 
            // The example had: "label":"name"
            // So we need to look in the chunks for an entry with label "name" and see its value in the hex string? 
            // That's too complex for now.
            
            // Let's assume the tool *did* parse it if it didn't error.
            // Maybe it's hidden?
            
            // If the user's tool worked, where did it put the name?
            // If it's not in the JSON, I can't search it.
            
            // Let's print a few files to see if I missed the 'name' field.
            if (i < 5) console.log(JSON.stringify(content, null, 2));

        } catch (e) {
            // Ignore
        }
    }
}

searchForNames();
