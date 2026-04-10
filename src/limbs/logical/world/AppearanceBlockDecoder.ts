import { type SovereignAvatar } from '../../../core/models.js';

/**
 * AppearanceBlockDecoder - Visual Grounding Interpreter
 * Decodes the appearance block from Protocol 947 byte-streams.
 */
export class AppearanceBlockDecoder {
    /**
     * applyAppearance - Updates the avatar state with decoded visual data.
     */
    public applyAppearance(buffer: Buffer, avatar: SovereignAvatar): void {
        let offset = 0;
        
        // Byte 0: Gender
        const gender = buffer.readUInt8(offset++) === 0 ? 'male' : 'female';
        
        // Bytes 1-6: Body Colors (RS3 standard: 0-hair, 1-torso, 2-legs, 3-feet, 4-skin)
        const bodyColors: [number, number][] = [];
        for (let i = 0; i < 5; i++) {
            const color = buffer.readUInt8(offset++);
            bodyColors.push([i, color]); // [index, colorValue]
        }

        avatar.appearance = {
            gender,
            bodyColors
        };
        
        avatar.metadata.lastAppearanceUpdate = Date.now();
    }
}
