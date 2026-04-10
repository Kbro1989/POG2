import { HandshakeLimb } from '../limbs/logical/HandshakeLimb.js';
import { HandshakeResponse } from '../core/HandshakeModels.js';
import { latestBuildNumber } from '../core/CacheConstants.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Diagnostic: Protocol 947 Handshake Simulation (JS5 + LOGIN)
 * Executes a local, introspective test of the Revision 947 handshake loop.
 */
async function runSimulation() {
    console.log("\x1b[36m[SIMULATION] Starting Protocol 947 Handshake Suite...\x1b[0m");
    const handshake = HandshakeLimb.getInstance();
    
    // 0. Inject RSA Keys (Clean-Room)
    const keyPath = "C:/Users/Destiny/.gemini/antigravity/brain/86c882b6-2989-401a-8dc4-c547dd159479/scratch/custom_rsa_947.json";
    const keys = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    handshake.setKeys(keys.publicKey);

    // --- PHASE A: JS5 HANDSHAKE (Opcode 15) ---
    console.log("\n[PHASE A] Executing JS5 Update Handshake...");
    const js5Hello = handshake.generateJS5Hello();
    console.log(`[CLIENT \u27a1\ufe0f SERVER] JS5_HELLO (Hex: ${js5Hello.toString('hex')})`);

    const js5Response = Buffer.from([HandshakeResponse.SUCCESS]);
    handshake.processJS5Response(js5Response);
    console.log(`[SERVER \u27a1\ufe0f CLIENT] Success.`);

    // --- PHASE B: LOGIN HANDSHAKE (Opcode 14) ---
    console.log("\n[PHASE B] Executing Login Handshake...");
    const loginHello = handshake.generateLoginHello();
    console.log(`[CLIENT \u27a1\ufe0f SERVER] LOGIN_HELLO (Hex: ${loginHello.toString('hex')})`);

    // Mock Server Challenge (8-byte seed)
    const serverSeed = Buffer.from([0, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88]); 
    console.log(`[SERVER \u27a1\ufe0f CLIENT] Success + Seed: ${serverSeed.slice(1).toString('hex')}`);

    // Generate Login Block (RSA Encrypted)
    const loginBlock = handshake.generateLoginBlock({
        magic: 10,
        isaacSeeds: [0x12345678, 0x23456789, 0x34567890, 0x45678901],
        uid: "99BB24CEC17812C219666F54FFF928C3481B5FC54531CACE",
        revision: latestBuildNumber,
        username: "pog_vibe_dev",
        password: "vibe_sovereignty"
    });

    console.log(`[CLIENT \u27a1\ufe0f SERVER] LOGIN_BLOCK (Encrypted Size: ${loginBlock.length} bytes)`);

    // --- FINAL REPORT ---
    const transcript = handshake.getTranscript();
    console.log("\n\x1b[32m[SIMULATION] All Handshake Phases Complete.\x1b[0m");
    
    // Save transcript to scratch for forensics
    const transcriptPath = "C:/Users/Destiny/.gemini/antigravity/brain/86c882b6-2989-401a-8dc4-c547dd159479/scratch/handshake_transcript_947.json";
    fs.writeFileSync(transcriptPath, JSON.stringify(transcript, null, 2));
    
    console.log(`\x1b[34m[TRANSCRIPT SAVED]\x1b[0m ${transcriptPath}`);
}

runSimulation().catch(err => {
    console.error("\x1b[31m[SIMULATION ERROR]\x1b[0m", err);
    process.exit(1);
});
