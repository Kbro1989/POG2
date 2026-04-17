import { WorldStateLimb } from '../limbs/logical/WorldStateLimb.js';
import { SovereignAvatarEntity } from '../core/SovereignAvatar.js';
import { ServerOpcode } from '../core/ProtocolOpcodes.js';
import { SpatialRadarLimb } from '../limbs/spatial/SpatialRadarLimb.js';
import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';

/**
 * Diagnostic: Protocol 947 Region Rebuild (Scene GPP)
 * Verifies dynamic coordinate shifting and spatial substrate loading.
 */
async function runRegionRebuildTest() {
    console.log("\x1b[36m[SIMULATION] Starting Region Rebuild (Scene GPP) Test...\x1b[0m");

    // 1. Initialize System
    const avatar = new SovereignAvatarEntity('Sovereign_947');
    const worldLimb = WorldStateLimb.getInstance(avatar);
    const radar = SpatialRadarLimb.getInstance();
    const spatial = SpatialSovereigntyLimb.getInstance();

    console.log(`[INIT] Initial Coord: [${avatar.x}, ${avatar.y}] Region: ${avatar.x >> 6}_${avatar.y >> 6}`);

    // 2. Construct MAP_PACKET (REBUILD_NORMAL)
    // Target: Prifddinas RX: 49, RY: 50 (World: 3136, 3200)
    // Structure: [u8 flag, u16 rx, u16 ry, u8 plane, u32[16] xtea (Null)]
    const payload = Buffer.alloc(1 + 2 + 2 + 1 + 64);
    let offset = 0;
    
    payload.writeUInt8(0, offset++);    // Standard Rebuild
    payload.writeUInt16BE(49, offset);  // RX 49
    offset += 2;
    payload.writeUInt16BE(50, offset);  // RY 50
    offset += 2;
    payload.writeUInt8(0, offset++);    // Plane 0
    
    // XTEA Null Keys (16 zeros)
    for (let i = 0; i < 16; i++) {
        payload.writeUInt32BE(0, offset);
        offset += 4;
    }

    // 3. Process Packet
    console.log("\n[INJECT] Inbound MAP_PACKET (RX: 49, RY: 50) Triggered.");
    await worldLimb.processPacket(ServerOpcode.REGION_LOAD_NORMAL, payload);

    // 4. Verify Transitions
    console.log("\n[VERIFY] System State Post-Rebuild:");
    console.log(`➡️ Avatar Coord: [${avatar.x}, ${avatar.y}] (Expected: [3136, 3200])`);
    
    const msKey = "49_50";
    const isLoaded = (spatial as any).loadedMapsquares.has(msKey);
    console.log(`➡️ Spatial Ledger: MapSquare ${msKey} Loaded: ${isLoaded}`);

    // 5. Render Radar
    console.log("\n[RADAR] Sensory Grid Update:");
    const mockState = {
        tickNumber: 1,
        npcSpatialIndex: new Map(),
        npcMap: new Map(),
        objectMap: new Map(),
        varbits: new Map(),
        players: new Map()
    };
    const frame = radar.render(mockState as any, avatar, false);
    console.log(frame);

    if (avatar.x === 3136 && avatar.y === 3200 && isLoaded) {
        console.log("\n\x1b[32m[SUCCESS] Protocol 947 Scene GPP Transaction Verified.\x1b[0m");
    } else {
        console.error("\x1b[31m[FAILURE] Region transition failed or mapsquare not grounded.\x1b[0m");
        process.exit(1);
    }
}

runRegionRebuildTest().catch(err => {
    console.error(err);
    process.exit(1);
});
