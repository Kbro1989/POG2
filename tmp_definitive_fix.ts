import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/engines/gameplay/CNSGodheadPulseVolley.ts';
let lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

// Surgical removal: Find all lines containing 'const ioLatency = getLastIOLatencyMs();'
// and replace them with a single instance.
const target = "const ioLatency = getLastIOLatencyMs();";
let foundOne = false;
let newLines = [];

for (let line of lines) {
    if (line.includes(target)) {
        if (!foundOne) {
            newLines.push(line);
            foundOne = true;
        }
        // Skip subsequent matches
    } else {
        newLines.push(line);
    }
}

writeFileSync(filePath, newLines.join('\n'));
console.log("CNSGodheadPulseVolley.ts definitive clinical repair complete.");
