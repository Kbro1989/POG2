const path = require('path');
const rsmv = 'D:\\rsmv_inspector';
console.log('rsmv path:', rsmv);

try {
    const sqlitePath = path.join(rsmv, 'src', 'cache', 'sqlite.ts');
    console.log('sqlitePath:', sqlitePath);
    const mod = require(sqlitePath);
    console.log('GameCacheLoader loaded successfully:', !!mod.GameCacheLoader);
} catch (err) {
    console.error('Failed to require sqlite.ts:', err);
}

try {
    const opdecoderPath = path.join(rsmv, 'src', 'opdecoder.ts');
    console.log('opdecoderPath:', opdecoderPath);
    const mod = require(opdecoderPath);
    console.log('parse loaded successfully:', !!mod.parse);
} catch (err) {
    console.error('Failed to require opdecoder.ts:', err);
}
