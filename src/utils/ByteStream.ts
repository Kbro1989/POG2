/**
 * ByteStream - Authoritative Binary Substrate
 * Provides high-level primitives for Protocol 947 network synchronization.
 * Supports both Big-Endian (Cache) and Little-Endian (Network Variables).
 */
export class ByteStream {
    private buffer: Buffer;
    private offset: number = 0;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    public readUint8(): number {
        return this.buffer.readUint8(this.offset++);
    }

    public readUint16LE(): number {
        const val = this.buffer.readUint16LE(this.offset);
        this.offset += 2;
        return val;
    }

    public readUint16BE(): number {
        const val = this.buffer.readUint16BE(this.offset);
        this.offset += 2;
        return val;
    }

    public readInt32LE(): number {
        const val = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return val;
    }

    /**
     * readString - Reads a null-terminated string (RS3 standard).
     */
    public readString(): string {
        let end = this.offset;
        while (end < this.buffer.length && this.buffer[end] !== 0) {
            end++;
        }
        const str = this.buffer.toString('utf8', this.offset, end);
        this.offset = end + 1; // Skip the null terminator
        return str;
    }

    public hasRemaining(): boolean {
        return this.offset < this.buffer.length;
    }

    public skip(n: number): void {
        this.offset += n;
    }
}

