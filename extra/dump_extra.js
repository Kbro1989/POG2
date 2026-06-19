const fs = require('fs');
const path = require('path');

const ITEMS_DIR = 'extra/items';

// We want to find a prop ID that has these values for these items:
// 60s cooldown -> 600
// 30s cooldown -> 300
// 90s cooldown -> 900
// We need item IDs for items with 30s or 90s cooldowns to diff.
// The user doesn't have them yet, so let's just dump ALL extra props for item 59350
// to see if we can find a value that *looks like* a cooldown (600, etc.)

function inspectItem(id) {
    const filePath = path.join(ITEMS_DIR, `pass-${id}.hexerr.json`);
    if (!fs.existsSync(filePath)) return;

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`Inspecting Item ${id}:`);
    
    content.chunks.forEach(chunk => {
        if (chunk.label === 'extra') {
            // Need to parse the extra hex data directly or just look at chunks.
            // The chunk definition for 'extra' is just the offset/len of the array
            // The hex is in originalFile.
            const hexExtra = content.originalFile.substr(chunk.offset * 2, chunk.len * 2);
            console.log(`Extra hex: ${hexExtra}`);
            // This is still encoded in the 'extrasmap' format defined in typedef.jsonc
            // It's a complex binary format.
        }
    });
}

inspectItem('59350');
