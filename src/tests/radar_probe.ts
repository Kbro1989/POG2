import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { SpatialRadarLimb } from '../limbs/spatial/SpatialRadarLimb.js';
import { GameState, NPC, SovereignAvatar } from '../core/models.js';
import { SovereignAvatarEntity } from '../core/SovereignAvatar.js';
import { Renderer } from '../ui/Renderer.js';
import * as path from 'path';

async function testRadar() {
    console.log("--- SPATIAL RADAR PROBE START ---");
    
    const spatial = SpatialSovereigntyLimb.getInstance();
    await spatial.initialize();
    
    // Load Lumbridge (50, 50) mapsquare fragment
    await spatial.loadMapsquare(50, 50);
    
    const renderer = new Renderer();
    const radar = SpatialRadarLimb.getInstance();
    
    // Mock Avatar at center of Lumbridge Square
    const avatar = {
        name: "Kimi",
        coord: { x: 3232, y: 3232, plane: 0 },
        interactionState: 'IDLE',
        health: 100
    } as any as SovereignAvatar;
    
    // Mock GameState
    const state: GameState = {
        tickNumber: 42,
        npcMap: new Map(),
        objectMap: new Map(),
        npcSpatialIndex: new Map(),
        status: 'OPERATIONAL'
    } as any;
    
    // Add a dummy NPC
    const dummyNpc = { id: 1, name: "Hans", x: 3235, y: 3232, plane: 0 } as NPC;
    state.npcMap.set(1, dummyNpc);
    state.npcSpatialIndex.set(`3235,3232,0`, [dummyNpc]);
    
    // Render
    const grid = radar.render(state, avatar, true); // Full 66x66
    renderer.drawRadar(grid, false); // Don't clear for test output
    
    console.log("--- PROBE COMPLETE ---");
}

testRadar().catch(console.error);
