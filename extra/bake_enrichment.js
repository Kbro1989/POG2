const fs = require('fs');

function getEnrichedData() {
    const geCache = JSON.parse(fs.readFileSync('extra/ge_data_cache.json', 'utf8'));
    const spawnData = JSON.parse(fs.readFileSync('extra/spawns_by_mapsquare.json', 'utf8'));
    const idMap = JSON.parse(fs.readFileSync('extra/id_to_name.json', 'utf8'));

    // Create a lookup for price by name for easier merging if ID lookup failed
    const priceByName = {};
    for (const [id, data] of Object.entries(geCache)) {
        if (data && data.name) {
            priceByName[data.name] = data;
        }
    }

    // Merge logic
    for (const [square, entities] of Object.entries(spawnData)) {
        entities.forEach(entity => {
            const id = entity.entityId;
            let priceData = geCache[id] || priceByName[entity.title];
            if (priceData) {
                entity.ge_price = priceData.price;
                entity.ge_volume = priceData.volume;
                entity.ge_timestamp = priceData.timestamp;
            }
        });
    }

    fs.writeFileSync('extra/fully_enriched_spawns.json', JSON.stringify(spawnData, null, 2));
    console.log('Successfully baked GE data into spawns.');
}

getEnrichedData();
