/**
 * BitStream - Sub-byte Protocol Substrate
 * Enables precise bit-level reading/writing for the Player Update bitstream.
 */
export class BitStream {
    private buffer: Buffer;
    private bitPosition: number = 0;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    /**
     * readBits - Reads N bits from the current position.
     */
    public readBits(bitCount: number): number {
        let bitOffset = this.bitPosition >> 3;
        let bitsRequired = bitCount;
        let value = 0;
        let bitShift = 8 - (this.bitPosition & 7);

        while (bitsRequired > bitShift) {
            value |= (this.buffer[bitOffset++] & ((1 << bitShift) - 1)) << (bitsRequired - bitShift);
            bitsRequired -= bitShift;
            bitShift = 8;
        }

        if (bitsRequired === bitShift) {
            value |= (this.buffer[bitOffset] & ((1 << bitShift) - 1));
        } else {
            value |= (this.buffer[bitOffset] >> (bitShift - bitsRequired)) & ((1 << bitsRequired) - 1);
        }

        this.bitPosition += bitCount;
        return value;
    }

    /**
     * writeBits - Writes N bits into the buffer.
     */
    public writeBits(bitCount: number, value: number): void {
        let bitOffset = this.bitPosition >> 3;
        let bitShift = 8 - (this.bitPosition & 7);
        this.bitPosition += bitCount;

        while (bitCount > bitShift) {
            this.buffer[bitOffset] &= ~((1 << bitShift) - 1);
            this.buffer[bitOffset++] |= (value >> (bitCount - bitShift)) & ((1 << bitShift) - 1);
            bitCount -= bitShift;
            bitShift = 8;
        }

        if (bitCount === bitShift) {
            this.buffer[bitOffset] &= ~((1 << bitShift) - 1);
            this.buffer[bitOffset] |= value & ((1 << bitShift) - 1);
        } else {
            this.buffer[bitOffset] &= ~(((1 << bitCount) - 1) << (bitShift - bitCount));
            this.buffer[bitOffset] |= (value & ((1 << bitCount) - 1)) << (bitShift - bitCount);
        }
    }

    public getBytePosition(): number {
        return Math.ceil(this.bitPosition / 8);
    }
}
