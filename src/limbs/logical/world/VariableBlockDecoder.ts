import { ByteStream } from '../../../utils/ByteStream.js';
import { createLogger } from '../../../utils/logger.js';

const logger = createLogger('VariableBlockDecoder');

/**
 * VariableBlockDecoder - Decodes the "Global State Bus" (Varps, Varcs, Varbits).
 * 
 * Structural Nuances (Revision 947):
 * - Little-Endian 16-bit IDs (u16 LE)
 * - Strings are Null-Terminated
 * - Fixed u8 or i32 payloads
 */
export class VariableBlockDecoder {
    /**
     * VARP_SMALL: u16 ID, u8 Value
     */
    public static decodeVarpSmall(stream: ByteStream): { id: number, value: number } {
        const id = stream.readUint16LE();
        const value = stream.readUint8();
        logger.debug({ id, value }, 'Decoded VARP_SMALL');
        return { id, value };
    }

    /**
     * VARP_LARGE: u16 ID, i32 Value
     */
    public static decodeVarpLarge(stream: ByteStream): { id: number, value: number } {
        const id = stream.readUint16LE();
        const value = stream.readInt32LE();
        logger.debug({ id, value }, 'Decoded VARP_LARGE');
        return { id, value };
    }

    /**
     * VARC: u16 ID, i32 Value (Transient Client Variable)
     */
    public static decodeVarc(stream: ByteStream): { id: number, value: number } {
        const id = stream.readUint16LE();
        const value = stream.readInt32LE();
        logger.debug({ id, value }, 'Decoded VARC');
        return { id, value };
    }

    /**
     * VARC_STRING: u16 ID, null-terminated string
     */
    public static decodeVarcString(stream: ByteStream): { id: number, value: string } {
        const id = stream.readUint16LE();
        const value = stream.readString(); // readString is null-terminated per ByteStream contract
        logger.debug({ id, value }, 'Decoded VARC_STRING');
        return { id, value };
    }
}
