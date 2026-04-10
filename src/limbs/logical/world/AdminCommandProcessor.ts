import { AdminCommand } from '../../../monitor/SwitchboardLimb.js';
import { WorldStateLimb } from '../WorldStateLimb.js';
import { ServerOpcode } from '../../../core/ProtocolOpcodes.js';
import { createLogger } from '../../../utils/logger.js';

const logger = createLogger('AdminCommandProcessor');

/**
 * AdminCommandProcessor - Authoritative Ingress Resolver
 * Translates JSON-level Switchboard commands into Protocol-level packets.
 * Ensures that test commands go through the exact same logic lanes as real network data.
 */
export class AdminCommandProcessor {
    /**
     * execute - Resolves a command and injects it into the world state limb.
     */
    public static async execute(cmd: AdminCommand, worldState: WorldStateLimb): Promise<void> {
        try {
            switch (cmd.type.toUpperCase()) {
                case 'VARP':
                    await this.injectVarp(cmd.metadata?.id, cmd.metadata?.value, worldState);
                    break;
                case 'VARC':
                    await this.injectVarc(cmd.metadata?.id, cmd.metadata?.value, worldState);
                    break;
                case 'VARC_STRING':
                    await this.injectVarcString(cmd.metadata?.id, cmd.metadata?.value, worldState);
                    break;
                case 'REGION':
                    await this.injectRegion(cmd.metadata?.rx, cmd.metadata?.ry, worldState);
                    break;
                default:
                    logger.warn({ type: cmd.type }, 'Unknown Admin Command Type');
            }
        } catch (err) {
            logger.error({ err, command: cmd }, 'Failed to process admin command');
        }
    }

    private static async injectVarp(id: number, value: number, worldState: WorldStateLimb): Promise<void> {
        // Synthesize VARP_SMALL or VARP_LARGE packet
        const useLarge = id > 32767 || value > 32767 || value < -32768;
        const opcode = useLarge ? ServerOpcode.VARP_LARGE : ServerOpcode.VARP_SMALL;
        
        const payload = Buffer.alloc(useLarge ? 8 : 4);
        if (useLarge) {
            payload.writeUInt16LE(id, 0);
            payload.writeInt32LE(value, 2);
        } else {
            payload.writeUInt16LE(id, 0);
            payload.writeUInt16LE(value, 2);
        }

        await worldState.processPacket(opcode, payload);
        logger.info({ id, value, large: useLarge }, 'Admin VARP Injected.');
    }

    private static async injectVarc(id: number, value: number, worldState: WorldStateLimb): Promise<void> {
        const payload = Buffer.alloc(6);
        payload.writeUInt16LE(id, 0);
        payload.writeInt32LE(value, 2);
        await worldState.processPacket(ServerOpcode.VARC, payload);
        logger.info({ id, value }, 'Admin VARC Injected.');
    }

    private static async injectVarcString(id: number, value: string, worldState: WorldStateLimb): Promise<void> {
        const strBuf = Buffer.from(value + '\0', 'utf8');
        const payload = Buffer.alloc(2 + strBuf.length);
        payload.writeUInt16LE(id, 0);
        strBuf.copy(payload, 2);
        await worldState.processPacket(ServerOpcode.VARC_STRING, payload);
        logger.info({ id, value }, 'Admin VARC_STRING Injected.');
    }

    private static async injectRegion(rx: number, ry: number, worldState: WorldStateLimb): Promise<void> {
        // RS3 REBUILD_NORMAL Layout:
        // [1] Flag
        // [2] rx (BE)
        // [2] ry (BE)
        // [1] plane
        // [64] 4x XTEA Keys (16 bytes each)
        const payload = Buffer.alloc(70);
        let offset = 0;
        payload.writeUInt8(0, offset++); // Flag 0
        payload.writeUInt16BE(rx, offset); offset += 2;
        payload.writeUInt16BE(ry, offset); offset += 2;
        payload.writeUInt8(0, offset++); // Plane 0
        
        // Zero-fill XTEA keys for simulation
        payload.fill(0, offset);

        await worldState.processPacket(ServerOpcode.REGION_LOAD_NORMAL, payload);
        logger.info({ rx, ry }, 'Admin REGION Injected.');
    }
}
