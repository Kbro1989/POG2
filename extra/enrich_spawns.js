const fs = require('fs');
const https = require('http');

const SPAWN_FILE = 'extra/spawns_by_mapsquare.json';
const CACHE_FILE = 'extra/beast_data_cache.json';
const OUTPUT_FILE = 'extra/enriched_spawns.json';
const DELAY_MS = 1000; // 1 second between requests

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function fetchBeastData(id) {
    return new Promise((resolve, reject) => {
        const url = `http://services.runescape.com/m=itemdb_rs/bestiary/beastData.json?beastid=${id}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) resolve(JSON.parse(data));
                else reject(new Error(`Status ${res.statusCode}`));
            });
        }).on('error', reject);
    });
}

async function runEnrichment() {
    const spawns = JSON.parse(fs.readFileSync(SPAWN_FILE, 'utf8'));
    const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};
    
    for (const [key, entities] of Object.entries(spawns)) {
        for (const entity of entities) {
            if (!entity.entityId || cache[entity.entityId]) continue;
            
            console.log(`Enriching Entity: ${entity.entityId} (${entity.title})`);
            try {
                cache[entity.entityId] = await fetchBeastData(entity.entityId);
                await sleep(DELAY_MS);
            } catch (e) {
                console.error(`Failed to fetch ${entity.entityId}:`, e.message);
            }
        }
    }
    
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log('Enrichment complete. Cache updated.');
}

runEnrichment();
