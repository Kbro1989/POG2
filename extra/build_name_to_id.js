const fs = require('fs');
const idToName = JSON.parse(fs.readFileSync('extra/id_to_name.json', 'utf8'));
const nameToId = {};
for (const [id, name] of Object.entries(idToName)) {
    nameToId[name] = id;
}
fs.writeFileSync('extra/name_to_id.json', JSON.stringify(nameToId, null, 2));
console.log('Finished building Name to ID map.');
