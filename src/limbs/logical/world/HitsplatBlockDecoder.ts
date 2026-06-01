import { type SovereignAvatar } from '../../../core/models.js';

export interface Hitsplat {
    type: number;
    amount: number;
    delay: number;
}

/**
 * HitsplatBlockDecoder - Damage Event Interpreter
 * Decodes multi-hit damage blocks for Protocol 947.
 */
export class HitsplatBlockDecoder {
    /**
     * applyHitsplats - Decodes Splat Count and individual Splat entries.
     */
    public applyHitsplats(buffer: Buffer, avatar: SovereignAvatar): void {
        let offset = 0;
        
        // Byte 0: Count of splats in this tick
        const count = buffer.readUInt8(offset++);
        const splats: Hitsplat[] = [];

        for (let i = 0; i < count; i++) {
            // RS3/947 Standard uses Smart/VarInt for Splat Type and Amount
            const type = this.readSmart(buffer, offset);
            offset += (type >= 128) ? 2 : 1; // Simplified smart check
            
            const amount = this.readSmart(buffer, offset);
            offset += (amount >= 128) ? 2 : 1;

            const delay = buffer.readUInt8(offset++);

            splats.push({ type, amount, delay });
            
            // Apply Damage Logic (Type 5 is Necro, standard is 0-2)
            if (type !== 3) { // 3 is usually HEAL
                if (avatar.applyDamage) avatar.applyDamage?.(amount);
            } else {
                if (avatar.heal) avatar.heal?.(amount);
            }
        }

        if (avatar.metadata) {
            avatar.metadata.activeHitsplats = splats;
            avatar.metadata.lastHitTick = Date.now();
        }
    }

    /**
     * readSmart - Simple 1/2 byte smart reader.
     */
    private readSmart(buffer: Buffer, offset: number): number {
        const value = buffer.readUInt8(offset);
        if (value < 128) {
            return value;
        } else {
            return buffer.readUInt16BE(offset) & 0x7FFF;
        }
    }
}

