const fs = require('fs');
const path = require('path');

const ITEMS_DIR = 'extra/items';
const manifest = {};

function hexToString(hex) {
    const dataHex = hex.slice(2, -2);
    let str = '';
    for (let i = 0; i < dataHex.length; i += 2) {
        const charCode = parseInt(dataHex.substr(i, 2), 16);
        if (charCode >= 32 && charCode <= 126) str += String.fromCharCode(charCode);
    }
    return str;
}

const files = fs.readdirSync(ITEMS_DIR);
files.forEach(file => {
    if (!file.endsWith('.json')) return;
    try {
        const content = JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, file), 'utf8'));
        const id = file.replace('pass-', '').replace('.hexerr.json', '');
        const actions = [];
        content.chunks.forEach(chunk => {
            if (chunk.label && (chunk.label.includes('widget_actions') || chunk.label.includes('ground_actions'))) {
                const hexAction = content.originalFile.substr(chunk.offset * 2, chunk.len * 2);
                actions.push(hexToString(hexAction));
            }
        });
        if (actions.length > 0) manifest[id] = actions;
    } catch (e) {}
});

fs.writeFileSync('extra/manifest_breakdown.json', JSON.stringify(manifest, null, 2));
console.log('Manifest breakdown built.');
