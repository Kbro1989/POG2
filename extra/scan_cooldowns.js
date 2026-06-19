const fs = require('fs');
const path = require('path');

const ITEMS_DIR = 'extra/items';
// Mapping: ID -> Cooldown (in seconds * 10, assuming similar scaling to adrenaline)
const KNOWN_COOLDOWNS = {
    '59350': 600, // Tumeken's Light
    // 'XXXX': 300, // Need IDs for Seren Godbow/Death Guard/etc
    // 'YYYY': 900, // Staff of darkness
};

function scanForCooldown() {
    const files = fs.readdirSync(ITEMS_DIR);
    
    files.forEach(file => {
        const id = file.replace('pass-', '').replace('.hexerr.json', '');
        if (!KNOWN_COOLDOWNS[id]) return;

        try {
            const content = JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, file), 'utf8'));
            const extra = [];
            
            // Re-extract extra properties if they exist
            // Based on previous JSON structure:
            content.chunks.forEach(chunk => {
                if (chunk.label === 'extra') {
                    // Logic to extract extra from hex is complex without re-parsing,
                    // but since I already have the parsed JSON from the previous steps,
                    // I'll assume the user has a way to get the parsed object.
                    // For now, let's just dump the file to look at it.
                    console.log(`Found item ${id} (${KNOWN_COOLDOWNS[id]}s) extra data:`, JSON.stringify(content, null, 2));
                }
            });
        } catch (e) {
            // Ignore
        }
    });
}

scanForCooldown();
