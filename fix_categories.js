const fs = require('fs');
const file = 'D:\\POG2\\src\\engines\\OrchestrateEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const map = {
    'vscode': 'motor',
    'filesystem': 'motor',
    'sensory': 'core',
    'network': 'core',
    'mcp': 'core',
    'literary': 'forge',
    'creative': 'forge'
};

for (const [oldCat, newCat] of Object.entries(map)) {
    const regex = new RegExp(`category: '${oldCat}'`, 'g');
    content = content.replace(regex, `category: '${newCat}'`);
}

fs.writeFileSync(file, content);
console.log('Categories updated.');
