import * as fs from "fs";

const FILE = "D:\\sovereign\\atlas\\spatial\\npc_extract\\npcs_total_v3.json";

function run() {
    const data = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    const keys = Object.keys(data);
    
    console.log(`📊 Statistics for V3 Extraction (${keys.length} mapsquares):`);
    
    const sorted = keys.map(k => ({ id: k, count: data[k].length }))
                      .sort((a, b) => b.count - a.count);
    
    console.log("📍 Top 20 Mapsquares by NPC Density:");
    for (const ms of sorted.slice(0, 20)) {
        const sample = data[ms.id][0];
        console.log(`   ${ms.id}: ${ms.count} NPCs | Sample Coord: [${sample.x}, ${sample.z}, plane ${sample.plane}]`);
    }
}

run();

