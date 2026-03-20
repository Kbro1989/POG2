// src/scripts/parse_kbd_sequence.ts
// Temporal Heartbeat Parser - RS3 Sequence Metadata Deconstructor

import { readFileSync } from 'fs';
import { join } from 'path';

const SEQ_PATH = join(process.cwd(), 'audit_output', 'kbd_cinema', 'seq_17769_metadata.bin');

function parseSequence() {
    console.log('💓 Deconstructing KBD Temporal Heartbeat (Sequence 17769)...');
    
    const buffer = readFileSync(SEQ_PATH);
    let offset = 0;
    
    let frameCount = 0;
    let totalDelay = 0;
    const delays: number[] = [];

    while (offset < buffer.length) {
        const opcode = buffer[offset++];
        if (opcode === 0) break; // End of sequence

        if (opcode === 1) {
            // Opcode 1: Primary Frames and Delays
            frameCount = buffer.readUInt16BE(offset);
            offset += 2;
            
            console.log(`   Detected ${frameCount} Animation Frames`);
            
            for (let i = 0; i < frameCount; i++) {
                // RS3 Frame IDs are 4 bytes each (archive and offset)
                // Often: primary frame (4), secondary frame (4), delay (2)
                const frameId1 = buffer.readUInt32BE(offset);
                offset += 4;
                const frameId2 = buffer.readUInt32BE(offset);
                offset += 4;
                const delay = buffer.readUInt16BE(offset);
                offset += 2;
                
                delays.push(delay);
                totalDelay += delay;
            }
        } else if (opcode === 2) {
            // Opcode 2: Loop offset
            offset += 2;
        } else if (opcode === 3) {
            // Opcode 3: Inter-frame markers
            const count = buffer[offset++];
            offset += count;
        } else if (opcode === 4) {
            // Opcode 4: Stretching
            offset += 1;
        } else if (opcode === 5) {
            // Opcode 5: Precedence
            offset += 1;
        } else if (opcode === 6) {
            // Opcode 6: Offhand item
            offset += 2;
        } else if (opcode === 7) {
            // Opcode 7: Mainhand item
            offset += 2;
        } else if (opcode === 8) {
            // Opcode 8: Repeat count?
            offset += 1;
        } else if (opcode === 9) {
            // Opcode 9: Move behavior?
            offset += 1;
        } else if (opcode === 10) {
            // Opcode 10: Interaction?
            offset += 1;
        } else if (opcode === 13) {
            const count = buffer[offset++];
            offset += count * 2; // Usually sounds
        } else {
            // Catch-all for unknown opcodes to prevent infinite loops
            // console.warn(`   Unknown Opcode ${opcode} at offset ${offset-1}`);
            // offset += 1;
        }
    }

    if (frameCount > 0) {
        const avgDelay = totalDelay / frameCount;
        const msPerTick = 20; // Jagex standard: 1 delay unit = 20ms
        const totalDurationMs = totalDelay * msPerTick;
        
        console.log('\n📊 Temporal Metrics Extracted:');
        console.log(`   - Sequence ID: 17769`);
        console.log(`   - Frame Count: ${frameCount}`);
        console.log(`   - Cumulative Delay Units: ${totalDelay}`);
        console.log(`   - Average Frame Delay: ${avgDelay.toFixed(2)} units`);
        console.log(`   - RS3 Standard Tickrate: 1 unit = 20ms (50Hz)`);
        console.log(`   - Total Sequence Duration: ${(totalDurationMs / 1000).toFixed(2)} seconds`);
        
        console.log('\n🧬 [Substrate Synchronization] Complete.');
    } else {
        console.error('❌ Failed to parse sequence opcodes. Substrate may be obfuscated.');
    }
}

parseSequence();
