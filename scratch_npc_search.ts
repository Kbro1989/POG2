import * as fs from 'fs';
const npcs = JSON.parse(fs.readFileSync('D:/D-sovereign-/cache_pedagogy/json_dumps/npcs.json', 'utf8'));

const spoofNames = ['Max', 'Cyrisus', 'Durial321', 'Cow1337killr', 'Cursed You', 'Botros', 'Cool Mom227', 'Prezleek', 'Rain', 'Elfinlocks', 'Bower', 'LolthenKILL'];
const found = npcs.filter((n: any) => spoofNames.includes(n.name));
found.forEach((n: any) => {
    const fileid = n["$fileid"];
    console.log(JSON.stringify({ id: fileid, name: n.name, models: n.models, headModels: n.headModels, animation_group: n.animation_group, colors: n.color_replacements?.length || 0 }));
});
console.log('---');
console.log('Total NPCs in dump:', npcs.length);
