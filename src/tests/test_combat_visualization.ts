import { WorldStateLimb } from '../limbs/logical/WorldStateLimb.js';
import { SovereignAvatarEntity } from '../core/SovereignAvatar.js';
import { ServerOpcode } from '../core/ProtocolOpcodes.js';
import { BitStream } from '../utils/BitStream.js';
import { SpatialRadarLimb } from '../limbs/spatial/SpatialRadarLimb.js';

/**
 * Diagnostic: Protocol 947 Combat Visualization
 * Verifies bit-perfect decoding of Animation and Hitsplat update blocks.
 */
async function runCombatSyncTest() {
    console.log("\x1b[36m[SIMULATION] Starting Combat Visualization Sync Test...\x1b[0m");
    
    // 1. Initialize Avatar & Limb
    const avatar = new SovereignAvatarEntity('Sovereign_Dev');
    const worldLimb = WorldStateLimb.getInstance(avatar);
    const radar = SpatialRadarLimb.getInstance();
    
    console.log(`[INIT] Avatar HP: ${avatar.currentHp}/${avatar.maxHp}`);

    // 2. Construct Combat Update Packet
    // Mask: 0x42 (Animation | Hitsplats)
    const packetBuffer = Buffer.alloc(32);
    const builder = new BitStream(packetBuffer);
    builder.writeBits(1, 0);    // No Movement
    builder.writeBits(1, 1);    // Update Block follows
    
    let byteOffset = builder.getBytePosition();
    packetBuffer.writeUInt8(0x42, byteOffset++); // Mask: 0x40 (Hit) | 0x02 (Anim)
    
    // Animation Block (u16 id, u8 delay)
    packetBuffer.writeUInt16BE(811, byteOffset); // Attack animation
    byteOffset += 2;
    packetBuffer.writeUInt8(0, byteOffset++);    // No delay
    
    // Hitsplat Block (u8 count, smart type, smart amount, u8 delay)
    packetBuffer.writeUInt8(1, byteOffset++);    // 1 splat
    packetBuffer.writeUInt8(0, byteOffset++);    // Melee (Simple smart < 128)
    
    // Writing 150 as a 2-byte smart (Big Endian: 0x8000 | 150 = 0x8096)
    packetBuffer.writeUInt16BE(0x8000 | 150, byteOffset); 
    byteOffset += 2;
    
    packetBuffer.writeUInt8(0, byteOffset++);    // No delay

    // 3. Process Packet
    console.log("\n[INJECT] Synthetic Combat Packet Injected (Anim 811, Hit 150).");
    worldLimb.processPacket(ServerOpcode.PLAYER_UPDATE, packetBuffer);

    // 4. Verify Local State
    console.log("\n[VERIFY] Post-Sync Combat State:");
    console.log(`➡️ HP: ${avatar.currentHp}/${avatar.maxHp} (Expected: 850)`);
    console.log(`➡️ Animation: ${avatar.metadata.lastAnimId} (Active: ${avatar.metadata.isAnimating})`);
    console.log(`➡️ Hitsplats: ${JSON.stringify(avatar.metadata.activeHitsplats)}`);

    // 5. Render Radar Visual
    console.log("\n[RADAR] Rendering Combat Visualization (Look for @* or !1):");
    const mockState = {
        tickNumber: 100,
        npcSpatialIndex: new Map(),
        npcMap: new Map(),
        objectMap: new Map(),
        varbits: new Map(),
        players: new Map()
    };
    console.log(radar.render(mockState as any, avatar, false));

    if (avatar.currentHp === 850 && avatar.metadata.lastAnimId === 811) {
        console.log("\n\x1b[32m[SUCCESS] Protocol 947 Combat Bridge Verified.\x1b[0m");
    } else {
        console.error("\x1b[31m[FAILURE] State Mismatch. Check block offsets and HP removal logic.\x1b[0m");
        process.exit(1);
    }
}

runCombatSyncTest().catch(err => {
    console.error(err);
    process.exit(1);
});

