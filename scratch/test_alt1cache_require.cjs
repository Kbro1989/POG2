try {
    const alt1 = require('alt1cache');
    console.log('Keys exported from alt1cache:', Object.keys(alt1));
    console.log('GameCacheLoader from alt1cache:', !!alt1.GameCacheLoader);
    console.log('parse from alt1cache:', !!alt1.parse);
} catch (err) {
    console.error('Failed to require alt1cache:', err);
}
