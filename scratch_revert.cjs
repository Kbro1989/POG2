const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let changed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Revert imports ending in .ts back to .js
  const newContent = content.replace(/from\s+(['"`])(.+?)\.ts\1/g, 'from $1$2.js$1');
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    changed++;
    console.log('Reverted: ' + f);
  }
});
console.log('Total reverted: ' + changed);
