const fs = require('fs');
const readline = require('readline');

async function processSpawns() {
  const fileStream = fs.createReadStream('extra/authentic_spawn_manifest.json');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const spawnsByMapSquare = {};

  let inEntities = false;
  let currentEntity = '';

  for await (const line of rl) {
    if (line.includes('"entities": [')) {
      inEntities = true;
      continue;
    }
    if (!inEntities) continue;
    if (line.trim() === ']' || line.trim() === '],') {
      break;
    }

    // This is a naive line-by-line parsing assuming one entity per line or 
    // structured in a way that lines can be aggregated.
    // The manifest might be multi-line for each entity.
    currentEntity += line;
    if (line.trim().endsWith('},') || line.trim().endsWith('}')) {
      try {
        const entity = JSON.parse(currentEntity.trim().replace(/,$/, ''));
        if (entity.coord) {
          const mx = entity.coord.x >> 6;
          const mz = entity.coord.z >> 6;
          const key = `${mx}_${mz}`;
          if (!spawnsByMapSquare[key]) spawnsByMapSquare[key] = [];
          spawnsByMapSquare[key].push(entity);
        }
      } catch (e) {
        // console.error('Error parsing entity:', e);
      }
      currentEntity = '';
    }
  }

  fs.writeFileSync('extra/spawns_by_mapsquare.json', JSON.stringify(spawnsByMapSquare, null, 2));
  console.log('Finished processing spawns by mapsquare.');
}

processSpawns();
