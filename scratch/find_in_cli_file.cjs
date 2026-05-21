const fs = require('fs');

const content = fs.readFileSync('d:\\POG2\\src\\cli.ts', 'utf8');
const lines = content.split('\n');

const searchTerms = ['setSovereignRoot', 'setProjectRoot', '.command(\'play\'', '.command(\'atlas\'', '.command(\'player\'', '.command(\'learn\'', '.command(\'play', '.command(\'atlas', '.command(\'player', '.command(\'learn'];

let output = '';
searchTerms.forEach(term => {
    output += `\n=== Matches for: ${term} ===\n`;
    lines.forEach((line, idx) => {
        if (line.includes(term)) {
            output += `Line ${idx + 1}: ${line.trim()}\n`;
        }
    });
});

fs.writeFileSync('d:\\POG2\\scratch\\search_results.txt', output);
console.log("Done!");
