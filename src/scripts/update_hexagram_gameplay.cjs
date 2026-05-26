const fs = require('fs');
const path = 'D:/POG2/src/core/HexagramDefinitions.ts';
let content = fs.readFileSync(path, 'utf8');

// Strip out the previous mapping logic comment and code, since we're replacing it.
const stripRegex = /\/\/ ── Gameplay Context Population \(RS3 Cache & Engine Mapping\) ──[\s\S]*$/;
content = content.replace(stripRegex, '');

const mappingLogic = `// ── Gameplay Context Population (RS3 Cache & Engine Mapping) ──
Object.values(HEXAGRAM_REGISTRY).forEach(hex => {
    const bottomTrigram = hex.binary.substring(0, 3);
    const topTrigram = hex.binary.substring(3, 6);

    let context: GameplayContext = {
        cacheTables: [],
        entities: [],
        variables: [],
        assets: [],
        engineFocus: []
    };

    const hasEarth = bottomTrigram === '000' || topTrigram === '000';
    const hasWater = bottomTrigram === '010' || topTrigram === '010';
    const hasThunder = bottomTrigram === '100' || topTrigram === '100';
    const hasLake = bottomTrigram === '110' || topTrigram === '110';
    const hasMountain = bottomTrigram === '001' || topTrigram === '001';
    const hasFire = bottomTrigram === '101' || topTrigram === '101';
    const hasWind = bottomTrigram === '011' || topTrigram === '011';
    const hasHeaven = bottomTrigram === '111' || topTrigram === '111';

    // Scoring system to determine engine focus and cache tables
    const scores: Record<string, number> = {
        'SimulationHarness': (hasEarth ? 1 : 0) + (hasWater ? 1 : 0),
        'ServerLogicRegistry': (hasEarth ? 1 : 0) + (hasThunder ? 1 : 0),
        'InteractionGateway': (hasLake ? 2 : 0) + (hasFire ? 0.5 : 0) + (hasWind ? 0.5 : 0),
        'CombatRotationEngine': (hasThunder ? 2 : 0),
        'AggressionSimulator': (hasThunder ? 1 : 0) + (hasWater ? 1 : 0),
        'SovereignCollisionEngine': (hasMountain ? 1 : 0) + (hasFire ? 0.5 : 0),
        'OrchestrateEngine': (hasHeaven ? 2 : 0),
        'GhostSplatEngine': (hasHeaven ? 1 : 0) + (hasThunder ? 0.5 : 0)
    };

    // Pick top engines (score > 0, sorted by highest)
    const sortedEngines = Object.entries(scores)
        .filter(([_, score]) => score > 0)
        .sort((a, b) => b[1] - a[1]);
    
    // Take top 2 engines
    context.engineFocus = sortedEngines.slice(0, 2).map(e => e[0]);

    // Assign cache tables based on dominant traits
    if (hasHeaven) {
        context.cacheTables.push('dbtables', 'dbrows', 'enums', 'structs', 'params', 
            'mapsquare_underlays', 'mapsquare_overlays', 'mapsquare_locs', 'mapsquare_terrain',
            'mapsquare_npcs', 'mapsquare_objs', 'mapsquare_items');
    } else {
        if (hasEarth || hasWater) context.cacheTables.push('mapsquare_underlays', 'mapsquare_overlays', 'mapsquare_locs', 'mapsquare_terrain');
        if (hasThunder || hasEarth) context.cacheTables.push('dbtables', 'dbrows', 'enums', 'structs', 'params');
    }

    if (hasThunder || hasFire) context.entities.push('npcs', 'items');
    if (hasMountain || hasFire || hasEarth) context.entities.push('objects', 'locations');

    if (hasLake || hasWind) context.assets.push('interfaces', 'audio', 'fontmetrics');
    if (hasThunder || hasFire) context.assets.push('sequences', 'spotanims');

    if (hasThunder || hasWater || hasWind) context.variables.push('varps', 'varbits', 'varclients', 'varclans');
    if (hasLake) context.variables.push('clientscript', 'clientscriptdata');

    // Deduplicate
    context.cacheTables = [...new Set(context.cacheTables)];
    context.entities = [...new Set(context.entities)];
    context.assets = [...new Set(context.assets)];
    context.variables = [...new Set(context.variables)];

    hex.gameplay = context;
});
`;

fs.writeFileSync(path, content + mappingLogic);
console.log('HexagramDefinitions updated with scoring system.');
