const fs = require('fs');

const content = fs.readFileSync('d:\\POG2\\src\\cli.ts', 'utf8');
const lines = content.split('\n');

const searchTerms = ['setSovereignRoot', 'setProjectRoot', '.command(\'play\'', '.command(\'atlas\'', '.command(\'player\'', '.command(\'learn\''];

searchTerms.forEach(term => {
    console.log(`\n=== Matches for: ${term} ===`);
    lines.forEach((line, idx) => {
        if (line.includes(term)) {
            console.log(`Line ${idx + 1}: ${line.trim()}`);
        }
    });
});
