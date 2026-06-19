const fs = require('fs');
const https = require('https');

const ID_MAP_FILE = 'extra/id_to_name.json';
const CACHE_FILE = 'extra/ge_data_cache.json';

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function fetchGEData(queryType, queryValue) {
    return new Promise((resolve, reject) => {
        // Correct base URL: api.weirdgloop.org
        const baseUrl = 'https://api.weirdgloop.org/exchange/history/rs/latest';
        const url = `${baseUrl}?${queryType}=${encodeURIComponent(queryValue)}`;
        
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) resolve(JSON.parse(data));
                else reject(new Error(`Status ${res.statusCode}`));
            });
        }).on('error', reject);
    });
}

async function runTestEnrichment() {
    const idMap = JSON.parse(fs.readFileSync(ID_MAP_FILE, 'utf8'));
    const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};
    
    // Get first 30 IDs
    const idsToTest = Object.entries(idMap).slice(0, 30);
    console.log(`Testing enrichment for ${idsToTest.length} items...`);

    for (const [id, name] of idsToTest) {
        if (cache[id]) continue;

        console.log(`Enriching Test Item: ${name} (${id})`);
        try {
            // 1. Try ID
            cache[id] = await fetchGEData('id', id);
        } catch (e) {
            if (e.message.includes('404')) {
                console.log(`Item ${name} not found in GE (likely not tradeable).`);
                cache[id] = { tradeable: false }; // Mark as not tradeable
            } else {
                console.warn(`Lookup failed for ${name}, trying name...`);
                try {
                    // 2. Fallback to Name
                    cache[id] = await fetchGEData('name', name);
                } catch (e2) {
                    console.error(`Failed to enrich ${name} (${id}):`, e2.message);
                }
            }
        }
        await sleep(500); // Faster delay for test
    }
    
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log('Test Enrichment complete. Cache updated.');
}

runTestEnrichment();
