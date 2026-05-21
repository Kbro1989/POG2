import { WorldStateLimb } from '../limbs/logical/WorldStateLimb.js';
import { SovereignAvatarEntity } from '../core/SovereignAvatar.js';
import { ServerOpcode } from '../core/ProtocolOpcodes.js';
import { BitStream } from '../utils/BitStream.js';

/**
 * Diagnostic: Protocol 947 World Synchronization
 * Verifies the BitStream decoding and WorldStateLimb orchestration.
 */
async function runWorldSyncTest() {
    console.log("\x1b[36m[SIMULATION] Starting World State Synchronization Test...\x1b[0m");
    
    // 1. Initialize Avatar & Limb
    const avatar = new SovereignAvatarEntity('Sovereign_Dev');
    const worldLimb = WorldStateLimb.getInstance(avatar);
    
    const startCoord = { ...avatar.coord };
    console.log(`[INIT] Avatar at: [${startCoord.x}, ${startCoord.y}]`);

    // 2. Construct Synthetic PLAYER_UPDATE Packet
    // Bits: 1 (Update), 10 (Walking), 001 (North), 1 (Appearance Block)
    // Hex: 1 (1) | 01 (1) | 001 (1) | 1 (1) -> 10110011 -> 0xB3? No, let's use BitStream to build it.
    
    const packetBuffer = Buffer.alloc(32);
    const builder = new BitStream(packetBuffer);
    builder.writeBits(1, 1);    // Update Required
    builder.writeBits(2, 1);    // Movement Type: Walking
    builder.writeBits(3, 1);    // Direction: North (1)
    builder.writeBits(1, 1);    // Appearance Update follows
    
    const byteOffset = builder.getBytePosition();
    packetBuffer.writeUInt8(0, byteOffset);     // Male
    packetBuffer.writeUInt8(10, byteOffset + 1); // Hair Color
    packetBuffer.writeUInt8(20, byteOffset + 2); // Torso Color
    packetBuffer.writeUInt8(30, byteOffset + 3); // Legs Color
    packetBuffer.writeUInt8(40, byteOffset + 4); // Feet Color
    packetBuffer.writeUInt8(50, byteOffset + 5); // Skin Color

    // 3. Process Packet
    console.log("\n[INJECT] Synthetic PLAYER_UPDATE Packet Injected.");
    worldLimb.processPacket(ServerOpcode.PLAYER_UPDATE, packetBuffer);

    // 4. Verify Transitions
    console.log("\n[VERIFY] Post-Sync Avatar State:");
    console.log(`\u27a1\ufe0f Position: [${avatar.x}, ${avatar.y}] (Expected: [${startCoord.x}, ${startCoord.y + 1}])`);
    const positionValid = avatar.x === startCoord.x && avatar.y === startCoord.y + 1;
    if (positionValid) {
        console.log("\n\x1b[32m[SUCCESS] Protocol 947 World Sync Grounding Verified.\x1b[0m");
    } else {
        console.error("\x1b[31m[FAILURE] State Mismatch. Verify BitStream read/write logic.\x1b[0m");
        process.exit(1);
    }
}

runWorldSyncTest().catch(err => {
    console.error(err);
    process.exit(1);
});
