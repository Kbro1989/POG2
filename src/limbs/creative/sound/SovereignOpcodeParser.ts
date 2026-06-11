
import { JagexCacheReader } from '../../utils/JagexCacheReader.js';
import { Buffer } from 'buffer';

/**
 * Simple Opcode-based binary parser for RS3 cache BLOBs.
 * Used by SoundTriggerRegistry to extract sound IDs without full game engine logic.
 */
export class SovereignOpcodeParser {
    /**
     * Read a value from a buffer based on an opcode definition.
     * This is a simplified version of the full rsmv interpreter.
     */
    public static readValue(buffer: Buffer, offset: number, opcode: any): { value: any, nextOffset: number } {
        const type = opcode.read;

        if (type === 'unsigned short') {
            return { value: buffer.readUInt16LE(offset), nextOffset: offset + 2 };
        }
        if (type === 'unsigned int') {
            return { value: buffer.readUInt32LE(offset), nextOffset: offset + 4 };
        }
        if (type === 'unsigned byte') {
            return { value: buffer.readUInt8(offset), nextOffset: offset + 1 };
        }
        if (type === 'string') {
            const len = buffer.readUInt8(offset);
            const val = buffer.toString('utf8', offset + 1, offset + 1 + len);
            return { value: val, nextOffset: offset + 1 + len };
        }
        if (type === 'false') {
            return { value: true, nextOffset: offset };
        }
        if (type === 'true') {
            return { value: false, nextOffset: offset };
        }

        // Default for complex/unsupported types in this simplified parser
        return { value: null, nextOffset: offset };
    }
}
