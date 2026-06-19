import { decodeFromHexerr } from '../src/runners/extrasmap_decoder';
const fs = require('fs');

const file = 'extra/items/pass-59350.hexerr.json';
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

// Find the 'extra' chunk
const extraChunk = content.chunks.find((c: any) => c.label === 'extra');
if (extraChunk) {
    const hexExtra = content.originalFile.substr(extraChunk.offset * 2, extraChunk.len * 2);
    console.log('Hex Extrasmap:', hexExtra);
    
    try {
        const decoded = decodeFromHexerr(hexExtra);
        console.log('Decoded Extrasmap:', JSON.stringify(decoded, null, 2));
    } catch (e) {
        console.error('Decoding failed:', e);
    }
} else {
    console.log('No extra chunk found.');
}
