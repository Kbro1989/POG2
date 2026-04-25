import fs from 'fs';
import path from 'path';
import { GhostSplatEngine } from '../substrates/GhostSplatEngine.js';
import { GameState, NPC, Coord } from '../core/models.js';
import { SovereignAvatarEntity } from '../core/SovereignAvatar.js';
import { PlayerAgent } from '../engines/gameplay/PlayerAgent.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { SpatialSovereigntyLimb, PADDED_SIZE } from '../limbs/spatial/SpatialSovereigntyLimb.js';

async function runTest() {
    console.log('--- GhostSplat Engine Diagnostic Test ---');

    // 1. Initialize Mocks
    try {
        HexagramManager.initializeMock();
    } catch (e) {
        // Already initialized or different version
    }
    
    // 2. Load Authentic Spawn Manifest
    const manifestPath = path.resolve('public/authentic_spawn_manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error(`Manifest not found at ${manifestPath}`);
        return;
    }

    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`Loaded manifest with ${manifestData.entities.length} entities.`);

    // 3. Setup GameState Mock
    // Pick a cluster of NPCs. 
    // Example: (1027, 5477)
    const centerX = 1027;
    const centerZ = 5477;
    const plane = 0;

    const state: GameState = {
        plane,
        npcMap: new Map(),
        npcSpatialIndex: new Map(),
        objectMap: new Map(),
        varps: new Map(),
        varcs: new Map(),
        varbits: new Map(),
        players: new Map(),
        tickNumber: 100
    };

    // Populate NPCs near the center
    let npcCount = 0;
    for (const entity of manifestData.entities) {
        const dx = Math.abs(entity.coord.x - centerX);
        const dz = Math.abs(entity.coord.z - centerZ);
        
        if (dx < 30 && dz < 30 && entity.coord.plane === plane) {
            const npcId = npcCount++;
            const npc: NPC = {
                id: npcId,
                npcId: entity.entityId || 0,
                name: entity.title || 'Unknown',
                coord: { x: entity.coord.x, y: entity.coord.z, plane: entity.coord.plane },
                x: entity.coord.x,
                y: entity.coord.z,
                plane: entity.coord.plane,
                interactionState: 'IDLE',
                lastActionTick: 0,
                combatStats: {
                    currentHp: 1000,
                    maxHp: 1000,
                    attackRange: 3
                },
                cooldowns: {}
            } as any;
            state.npcMap.set(npcId, npc);
            
            const key = `${npc.x},${npc.y},${npc.plane}`;
            if (!state.npcSpatialIndex.has(key)) state.npcSpatialIndex.set(key, []);
            state.npcSpatialIndex.get(key)!.push(npc);
        }
        if (npcCount > 50) break; 
    }
    console.log(`Mocked ${npcCount} NPCs near (${centerX}, ${centerZ}).`);

    // 4. Setup Player Mock
    const avatar = new SovereignAvatarEntity('TestPlayer');
    avatar.coord = { x: centerX, y: centerZ, plane: plane };
    avatar.x = centerX;
    avatar.y = centerZ;
    avatar.plane = plane;
    avatar.state = state;

    const playerAgent = new PlayerAgent(avatar);

    // 5. Run GhostSplatEngine
    const engine = GhostSplatEngine.getInstance();
    console.log('Running GhostSplat projection (Depth: 2)...');
    
    const field = engine.project(state, 2, playerAgent);

    if (!field) {
        console.error('GhostSplatEngine returned null field.');
        return;
    }

    // 6. Validate Results
    console.log(`Heatmap Size: ${field.heatmap.length}`);
    let totalHeat = 0;
    for (let i = 0; i < field.heatmap.length; i++) {
        totalHeat += field.heatmap[i];
    }
    console.log(`Total Heat Generated: ${totalHeat}`);

    console.log(`Projections Generated: ${field.projections.size}`);
    console.log(`Safespots Found: ${field.safespots.length}`);

    // 7. Export for Heatmap Visualization
    const outputDir = path.resolve('public/test_output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // GhostSplatField to JSON
    const fieldData = {
        tickDepth: field.tickDepth,
        heatmap: Array.from(field.heatmap),
        entityHeat: field.entityHeat ? Array.from(field.entityHeat) : null,
        avatarHeat: field.avatarHeat ? Array.from(field.avatarHeat) : null,
        projections: Array.from(field.projections.entries()),
        safespots: field.safespots,
        gaussians: field.gaussians ? Array.from(field.gaussians) : null,
        center: { x: centerX, y: centerZ, plane }
    };

    fs.writeFileSync(path.join(outputDir, 'ghostsplat_test.json'), JSON.stringify(fieldData, null, 2));
    console.log(`Test data exported to ${path.join(outputDir, 'ghostsplat_test.json')}`);

    if (totalHeat > 0 && field.projections.size > 0) {
        console.log('TEST PASSED: GhostSplatEngine generated valid spatial data.');
    } else {
        console.error('TEST FAILED: Engine output is empty or invalid.');
    }
}

runTest().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
