const fs = require('fs');
const path = require('path');

function searchJsonFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(filePath);
        } catch (e) {
            return;
        }
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                results = results.concat(searchJsonFiles(filePath));
            }
        } else if (file.endsWith('.json')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('"tableId"') || content.includes('"dbTable"') || content.includes('"dbRowId"')) {
                    results.push({ path: filePath, size: stat.size });
                }
            } catch(e) {}
        }
    });
    return results;
}

const res = searchJsonFiles('d:/POG2');
console.log('JSON files with table references in d:/POG2:');
console.log(JSON.stringify(res, null, 2));
