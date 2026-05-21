
const fs = require('fs');
const path = require('path');

const filePath = 'C:\\ProgramData\\Jagex Launcher\\runescape-win-meta.json';
const content = fs.readFileSync(filePath, 'utf8').trim();

const parts = content.split('.');
if (parts.length >= 2) {
    const payload = Buffer.from(parts[1], 'base64').toString();
    console.log(JSON.stringify(JSON.parse(payload), null, 2));
} else {
    console.log("Not a valid JWT or dot-separated format.");
}
