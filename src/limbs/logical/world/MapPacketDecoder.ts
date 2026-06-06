import { createLogger } from '../../../utils/logger.js';

const logger = createLogger('MapPacketDecoder');

export interface MapPacketRebuild {
    rx: number;
    ry: number;
    plane: number;
    xteaKeys: Uint32Array[];
}

/**
 * MapPacketDecoder - Region Rebuild Interpreter
 * Decodes the Scene GPP (MAP_PACKET) for Protocol 947.
 */
export class MapPacketDecoder {
    /**
     * decodeRebuildNormal - Decodes the standard global rebuild packet.
     */
    public decodeRebuildNormal(payload: Buffer): MapPacketRebuild {
        let offset = 0;
        
        // Byte 0: Rebuild Flag
        const flag = payload.readUInt8(offset++);
        
        // Region X/Y (Coord / 64)
        const rx = payload.readUInt16BE(offset);
        offset += 2;
        const ry = payload.readUInt16BE(offset);
        offset += 2;
        
        const plane = payload.readUInt8(offset++);

        // Array of XTEA Keys (Usually 4 set for the central region focus in simple simulation)
        const xteaKeys: Uint32Array[] = [];
        for (let i = 0; i < 4; i++) {
            const k0 = payload.readUInt32BE(offset);
            const k1 = payload.readUInt32BE(offset + 4);
            const k2 = payload.readUInt32BE(offset + 8);
            const k3 = payload.readUInt32BE(offset + 12);
            xteaKeys.push(new Uint32Array([k0, k1, k2, k3]));
            offset += 16;
        }

        logger.info({ rx, ry, plane }, "Decoded REBUILD_NORMAL Packet.");
        
        return { rx, ry, plane, xteaKeys };
    }
}

