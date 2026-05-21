// Opcode frontier diagnostic — capture first byte and buffer length of all parse-error interfaces
// This tells us whether failures cluster around a specific opcode range (new format)
// or are scattered (version negotiation issue).
import { createRequire } from 'module';
import * as path from 'path';
const require = createRequire(import.meta.url);
import { getrsmvSubstratePath, getrsmvCachePath } from './src/utils/SovereignPathResolver.js';

const rsmv = getrsmvSubstratePath();
let GameCacheLoader: any = null;
let parse: any = null;
try { ({ GameCacheLoader } = require(path.join(rsmv, 'src', 'cache', 'sqlite.js'))); } catch (e) { console.error('GameCacheLoader failed:', e); process.exit(1); }
try { ({ parse } = require(path.join(rsmv, 'src', 'opdecoder.js'))); } catch (e) { console.error('parse failed:', e); process.exit(1); }

const cachePath = getrsmvCachePath();
const cache = new GameCacheLoader(cachePath);
cache.buildnr = 940;

// Focus on the dense missing range in 1380-1520
const TARGET_RANGE = [1380, 1520] as const;
const firstByteMap: Record<number, number[]> = {};  // firstByte -> [ids]
const errorMessages: Record<string, number[]> = {};  // error -> [ids]

console.log(`\nScanning Major 3 interfaces ${TARGET_RANGE[0]}-${TARGET_RANGE[1]} for opcode patterns...\n`);

for (let id = TARGET_RANGE[0]; id <= TARGET_RANGE[1]; id++) {
    try {
        const rawBuffer = await cache.getFile(3, id);
        if (!rawBuffer || rawBuffer.byteLength === 0) continue;

        const firstByte = rawBuffer[0];
        const state = {
            isWrite: false,
            buffer: rawBuffer,
            stack: [],
            hiddenstack: [],
            scan: 0,
            endoffset: rawBuffer.byteLength,
            args: { ...cache.getDecodeArgs(), clientVersion: 940 }
        };

        let components = 0;
        let parseError: string | null = null;
        while (state.scan < state.endoffset) {
            try {
                parse.interfaces.parser.read(state);
                components++;
            } catch (e: any) {
                parseError = e.message;
                // Capture the failing opcode byte
                const failByte = rawBuffer[state.scan];
                const failByteHex = `0x${failByte?.toString(16).padStart(2, '0') ?? 'EOF'}`;
                parseError = `${e.message} [fail_byte: ${failByteHex} at scan:${state.scan}/${rawBuffer.byteLength}]`;
                break;
            }
        }

        if (parseError) {
            // Cluster by first byte of interface
            if (!firstByteMap[firstByte]) firstByteMap[firstByte] = [];
            firstByteMap[firstByte].push(id);

            const key = parseError.slice(0, 60);
            if (!errorMessages[key]) errorMessages[key] = [];
            errorMessages[key].push(id);

            if (components === 0) {
                console.log(`ID ${id} | firstByte:0x${firstByte.toString(16).padStart(2, '0')} | len:${rawBuffer.byteLength} | ZERO_COMPONENTS | ${parseError.slice(0, 80)}`);
            } else {
                console.log(`ID ${id} | firstByte:0x${firstByte.toString(16).padStart(2, '0')} | len:${rawBuffer.byteLength} | parsed:${components} | ${parseError.slice(0, 80)}`);
            }
        } else {
            console.log(`ID ${id} | firstByte:0x${firstByte.toString(16).padStart(2, '0')} | len:${rawBuffer.byteLength} | OK (${components} components)`);
        }
    } catch (e: any) {
        // getFile itself failed — likely empty slot
        // console.log(`ID ${id} | SLOT_EMPTY`);
    }
}

console.log('\n=== FIRST BYTE CLUSTERS ===');
const sorted = Object.entries(firstByteMap).sort((a, b) => b[1].length - a[1].length);
for (const [byte, ids] of sorted) {
    console.log(`  0x${parseInt(byte).toString(16).padStart(2, '0')} → ${ids.length} interfaces: [${ids.slice(0, 10).join(', ')}${ids.length > 10 ? '...' : ''}]`);
}

console.log('\n=== ERROR MESSAGE CLUSTERS ===');
for (const [msg, ids] of Object.entries(errorMessages).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  "${msg}" → ${ids.length} IDs`);
}

process.exit(0);
