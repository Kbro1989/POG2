import { type SovereignAvatar } from '../../../core/models.js';

/**
 * AnimationBlockDecoder - Kinematic State Interpreter
 * Decodes the animation update block for Protocol 947.
 */
export class AnimationBlockDecoder {
    /**
     * applyAnimation - Updates avatar with animation ID and delay.
     */
    public applyAnimation(buffer: Buffer, avatar: SovereignAvatar): number {
        let offset = 0;
        
        // Revision 947 Standard: 16-bit Animation ID
        const animId = buffer.readUInt16BE(offset);
        offset += 2;
        
        const delay = buffer.readUInt8(offset);
        offset += 1;

        if (avatar.metadata) {
            avatar.metadata.lastAnimId = animId;
            avatar.metadata.lastAnimTick = Date.now();
            avatar.metadata.isAnimating = animId !== -1 && animId !== 65535;
        }

        // Return number of bytes consumed if using a stream, 
        // but here we just return the next offset.
        return offset; 
    }
}

