import { Buffer } from 'buffer';

/**
 * ByteReader - High-fidelity binary reader for RS3 NXT cache formats.
 * Designed to handle big-endian integers, varints (1-or-2, 2-or-4), 
 * and tailed-overflow types discovered in Archive 5/16.
 */
export class ByteReader {
    private buffer: Buffer;
    private offset: number = 0;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    public readU8(): number {
        return this.buffer.readUInt8(this.offset++);
    }

    public readU16(): number {
        const val = this.buffer.readUInt16BE(this.offset);
        this.offset += 2;
        return val;
    }

    public readU24(): number {
        const val = this.buffer.readUIntBE(this.offset, 3);
        this.offset += 3;
        return val;
    }

    public readU32(): number {
        const val = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return val;
    }

    /**
     * readVarUShort - 1-or-2 byte unsigned varint.
     * If bit 7 of byte 0 is set, uses 2 bytes.
     */
    public readVarUShort(): number {
        const firstByte = this.readU8();
        if ((firstByte & 0x80) === 0) return firstByte;
        return ((firstByte & 0x7F) << 8) | this.readU8();
    }

    /**
     * readTailedVarUShort - Looping varushort with 0x7FFF overflow.
     * Used for object ID deltas in Archive 5.
     */
    public readTailedVarUShort(): number {
        let sum = 0;
        while (true) {
            const val = this.readVarUShort();
            sum += val;
            if (val !== 0x7FFF) break;
        }
        return sum;
    }

    /**
     * readVarUInt - 2-or-4 byte unsigned varint.
     * Used in Archive 16 and some CS2 formats.
     */
    public readVarUInt(): number {
        const firstWord = this.readU16();
        if ((firstWord & 0x8000) === 0) return firstWord;
        return ((firstWord & 0x7FFF) << 16) | this.readU16();
    }

    /**
     * readSmart - Common 1 or 2 byte 'smart' value.
     */
    public readSmart(): number {
        const peek = this.buffer.readUInt8(this.offset);
        if (peek < 128) return this.readU8();
        return this.readU16() - 32768;
    }

    public skip(n: number): void {
        this.offset += n;
    }

    public hasRemaining(): boolean {
        return this.offset < this.buffer.length;
    }

    public getOffset(): number {
        return this.offset;
    }
}
