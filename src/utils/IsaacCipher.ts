/**
 * IsaacCipher - Protocol Opcode Scrambler
 * Implementation of the ISAAC (Indirection, Shift, Accumulate, Add, and Count)
 * pseudorandom number generator used in Revision 947 network traffic.
 */
export class IsaacCipher {
    private mem: Int32Array = new Int32Array(256);
    private rsl: Int32Array = new Int32Array(256);
    private count: number = 0;
    private a: number = 0;
    private b: number = 0;
    private c: number = 0;

    constructor(seed: number[]) {
        for (let i = 0; i < seed.length; i++) {
            this.rsl[i] = seed[i];
        }
        this.init();
    }

    public getNextValue(): number {
        if (this.count-- === 0) {
            this.isaac();
            this.count = 255;
        }
        return this.rsl[this.count];
    }

    private isaac(): void {
        this.c++;
        this.b += this.c;
        for (let i = 0; i < 256; i++) {
            let x = this.mem[i];
            switch (i & 3) {
                case 0: this.a ^= this.a << 13; break;
                case 1: this.a ^= this.a >>> 6; break;
                case 2: this.a ^= this.a << 2; break;
                case 3: this.a ^= this.a >>> 16; break;
            }
            this.a += this.mem[(i + 128) & 0xff];
            let y = this.mem[i] = this.mem[(x >> 2) & 0xff] + this.a + this.b;
            this.rsl[i] = this.b = this.mem[(y >> 10) & 0xff] + x;
        }
    }

    private init(): void {
        let a = 0x9e3779b9, b = 0x9e3779b9, c = 0x9e3779b9, d = 0x9e3779b9,
            e = 0x9e3779b9, f = 0x9e3779b9, g = 0x9e3779b9, h = 0x9e3779b9;

        const mix = () => {
            a ^= b << 11; d += a; b += c;
            b ^= c >>> 2; e += b; c += d;
            c ^= d << 8; f += c; d += e;
            d ^= e >>> 16; g += d; e += f;
            e ^= f << 10; h += e; f += g;
            f ^= g >>> 4; a += f; g += h;
            g ^= h << 8; b += g; h += a;
            h ^= a >>> 9; c += h; a += b;
        };

        for (let i = 0; i < 4; i++) mix();

        for (let i = 0; i < 256; i += 8) {
            a += this.rsl[i]; b += this.rsl[i + 1]; c += this.rsl[i + 2]; d += this.rsl[i + 3];
            e += this.rsl[i + 4]; f += this.rsl[i + 5]; g += this.rsl[i + 6]; h += this.rsl[i + 7];
            mix();
            for (let j = 0; j < 8; j++) this.mem[i + j] = [a, b, c, d, e, f, g, h][j];
        }

        for (let i = 0; i < 256; i += 8) {
            a += this.mem[i]; b += this.mem[i + 1]; c += this.mem[i + 2]; d += this.mem[i + 3];
            e += this.mem[i + 4]; f += this.mem[i + 5]; g += this.mem[i + 6]; h += this.mem[i + 7];
            mix();
            for (let j = 0; j < 8; j++) this.mem[i + j] = [a, b, c, d, e, f, g, h][j];
        }

        this.isaac();
        this.count = 256;
    }
}
