import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { parse } = require('D:/sovereign/cache_pedagogy/rsmv_inspector/dist/opdecoder.js');

console.log('parse.models keys:', Object.keys(parse.models));
if (parse.models.parser) {
    console.log('parse.models.parser keys:', Object.keys(parse.models.parser));
}
