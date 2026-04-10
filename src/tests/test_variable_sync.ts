import { SovereignAvatar } from '../core/SovereignAvatar.js';
import { WorldStateLimb } from '../limbs/logical/WorldStateLimb.js';
import { VarbitSovereigntyLimb } from '../limbs/spatial/VarbitSovereigntyLimb.js';
import { ServerOpcode } from '../core/ProtocolOpcodes.js';
import { ByteStream } from '../utils/ByteStream.js';

async function runTest() {
    console.log('[SIMULATION] Starting Phase 11: Global State Bus Test...');

    // 1. Setup Mock State
    const avatar = new SovereignAvatar('TestUser');
    const varbitLimb = VarbitSovereigntyLimb.getInstance();
    const worldLimb = WorldStateLimb.getInstance(avatar);

    // 2. Inject Varbit Definition (Mock: Door State)
    // Varbit 500 points to Varp 100, bits 0-2 (value 0-7)
    varbitLimb.injectVarbitDefinition(500, { parentVarpId: 100, lsb: 0, msb: 2 });

    console.log('\n[INJECT] Inbound VARP_SMALL (ID: 100, Value: 5) Triggered.');
    
    // Construct VARP_SMALL packet (u16 LE ID, u8 Value)
    const vpsBuffer = Buffer.alloc(3);
    vpsBuffer.writeUInt16LE(100, 0);
    vpsBuffer.writeUInt8(5, 2);

    await worldLimb.processPacket(ServerOpcode.VARP_SMALL, vpsBuffer);

    // 3. Verify Varp Ingestion
    const varpValue = avatar.state.varps.get(100);
    console.log(`➡️ GameState Varp 100: ${varpValue} (Expected: 5)`);

    // 4. Verify Varbit Resolution (Bitmask logic)
    const varbitValue = varbitLimb.resolveVarbitValue(500, avatar.state);
    console.log(`➡️ Resolved Varbit 500: ${varbitValue} (Expected: 5)`);

    // 5. Test Mutation
    console.log('\n[INJECT] Inbound VARP_LARGE (ID: 100, Value: 12) Triggered.');
    
    // Construct VARP_LARGE packet (u16 LE ID, i32 LE Value)
    const vplBuffer = Buffer.alloc(6);
    vplBuffer.writeUInt16LE(100, 0);
    vplBuffer.writeInt32LE(12, 2); // 12 in binary is 1100. Lower 3 bits: 100 (4)

    await worldLimb.processPacket(ServerOpcode.VARP_LARGE, vplBuffer);

    const nextVarbit = varbitLimb.resolveVarbitValue(500, avatar.state);
    console.log(`➡️ GameState Varp 100: ${avatar.state.varps.get(100)}`);
    console.log(`➡️ Resolved Varbit 500: ${nextVarbit} (Expected: 4)`);

    // 6. Test VARC_STRING
    console.log('\n[INJECT] Inbound VARC_STRING (ID: 1, Value: "Sovereign") Triggered.');
    const stringBuffer = Buffer.alloc(2 + "Sovereign".length + 1);
    stringBuffer.writeUInt16LE(1, 0);
    stringBuffer.write("Sovereign", 2);
    stringBuffer.writeUInt8(0, 2 + "Sovereign".length);

    await worldLimb.processPacket(ServerOpcode.VARC_STRING, stringBuffer);
    console.log(`➡️ GameState Varc 1: ${avatar.state.varcs.get(1)} (Expected: Sovereign)`);

    if (varpValue === 5 && varbitValue === 5 && nextVarbit === 4 && avatar.state.varcs.get(1) === 'Sovereign') {
        console.log('\n[SUCCESS] Phase 11: Global State Bus Synchronization Verified.');
    } else {
        console.log('\n[FAILURE] State synchronization mismatch.');
        process.exit(1);
    }
}

runTest().catch(err => {
    console.error(err);
    process.exit(1);
});
