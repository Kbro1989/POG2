import { SovereignAvatar } from '../../core/models.js';
import { ServerOpcode } from '../../core/ProtocolOpcodes.js';
import { BitStream } from '../../utils/BitStream.js';
import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';
import { MovementBlockDecoder } from './world/MovementBlockDecoder.js';
import { AppearanceBlockDecoder } from './world/AppearanceBlockDecoder.js';
import { AnimationBlockDecoder } from './world/AnimationBlockDecoder.js';
import { HitsplatBlockDecoder } from './world/HitsplatBlockDecoder.js';
import { MapPacketDecoder } from './world/MapPacketDecoder.js';
import { VariableBlockDecoder } from './world/VariableBlockDecoder.js';
import { VarbitSovereigntyLimb } from '../spatial/VarbitSovereigntyLimb.js';
import { SpatialSovereigntyLimb } from '../spatial/SpatialSovereigntyLimb.js';
import { createLogger } from "../../utils/logger.js";
import { ByteStream } from "../../utils/ByteStream.js";

const logger = createLogger('WorldStateLimb');

/**
 * WorldStateLimb - Protocol 947 World Synchronizer
 * Coordinates the decoding of bitstream world-state and updates the local avatar.
 */
export class WorldStateLimb {
    private static instance: WorldStateLimb;
    private avatar: SovereignAvatar;
    private movementDecoder: MovementBlockDecoder;
    private appearanceDecoder: AppearanceBlockDecoder;
    private animationDecoder: AnimationBlockDecoder;
    private hitsplatDecoder: HitsplatBlockDecoder;
    private mapDecoder: MapPacketDecoder;

    private constructor(avatar: SovereignAvatar) {
        this.avatar = avatar;
        this.movementDecoder = new MovementBlockDecoder();
        this.appearanceDecoder = new AppearanceBlockDecoder();
        this.animationDecoder = new AnimationBlockDecoder();
        this.hitsplatDecoder = new HitsplatBlockDecoder();
        this.mapDecoder = new MapPacketDecoder();
    }

    public static getInstance(avatar?: SovereignAvatar): WorldStateLimb {
        if (!WorldStateLimb.instance) {
            if (!avatar) throw new Error("Avatar required for WorldStateLimb initialization.");
            WorldStateLimb.instance = new WorldStateLimb(avatar);
        }
        return WorldStateLimb.instance;
    }

    /**
     * processPacket - Decodes and applies an incoming server packet.
     */
    public async processPacket(opcode: ServerOpcode, payload: Buffer): Promise<void> {
        switch (opcode) {
            case ServerOpcode.PLAYER_UPDATE:
                this.handlePlayerUpdate(payload);
                break;
            case ServerOpcode.REGION_LOAD_NORMAL:
                await this.handleRegionLoad(payload);
                break;

            // Phase 11: Global State Bus (Variables)
            case ServerOpcode.VARP_SMALL: {
                const stream = new ByteStream(payload);
                const vps = VariableBlockDecoder.decodeVarpSmall(stream);
                VarbitSovereigntyLimb.getInstance().setVarp(vps.id, vps.value, this.avatar.state);
                break;
            }
            case ServerOpcode.VARP_LARGE: {
                const stream = new ByteStream(payload);
                const vpl = VariableBlockDecoder.decodeVarpLarge(stream);
                VarbitSovereigntyLimb.getInstance().setVarp(vpl.id, vpl.value, this.avatar.state);
                break;
            }
            case ServerOpcode.VARC: {
                const stream = new ByteStream(payload);
                const vc = VariableBlockDecoder.decodeVarc(stream);
                this.avatar.state.varcs.set(vc.id, vc.value);
                logger.info({ id: vc.id, value: vc.value }, 'VARC Synchronized');
                break;
            }
            case ServerOpcode.VARC_STRING: {
                const stream = new ByteStream(payload);
                const vcs = VariableBlockDecoder.decodeVarcString(stream);
                this.avatar.state.varcs.set(vcs.id, vcs.value);
                logger.info({ id: vcs.id, value: vcs.value }, 'VARC_STRING Synchronized');
                break;
            }

            default:
                logger.warn({ opcode }, "Unhandled Server Opcode received.");
        }
    }

    private handlePlayerUpdate(payload: Buffer): void {
        const stream = new BitStream(payload);
        
        // 1. Decode Local Player Movement
        const nextCoord = this.movementDecoder.decodeLocalPlayer(stream, this.avatar.coord);
        
        if (nextCoord.x !== this.avatar.x || nextCoord.y !== this.avatar.y) {
            this.avatar.coord = nextCoord;
            this.avatar.x = nextCoord.x;
            this.avatar.y = nextCoord.y;
            logger.info({ x: nextCoord.x, y: nextCoord.y }, "Avatar Movement Synced.");
        }

        // 2. Process Sync Block (Appearance/Animations/Hitsplats)
        const hasUpdateBlock = stream.readBits(1);
        if (hasUpdateBlock) {
            let byteOffset = stream.getBytePosition();
            
            // Read Update Mask (assuming 1-byte for simulation/Rev 947 core)
            const mask = payload.readUInt8(byteOffset++);
            
            // 0x1: Appearance
            if (mask & 0x1) {
                this.appearanceDecoder.applyAppearance(payload.slice(byteOffset), this.avatar);
                // Assume fixed or calculated size for appearance for now. 
                // In a real client, each decoder returns bytesConsumed.
                byteOffset += 6; // Gender(1) + Colors(5)
                logger.debug("Appearance Block Applied.");
            }

            // 0x2: Animation
            if (mask & 0x2) {
                const consumed = this.animationDecoder.applyAnimation(payload.slice(byteOffset), this.avatar);
                byteOffset += consumed;
                logger.info({ animId: this.avatar.metadata.lastAnimId }, "Animation Block Applied.");
            }

            // 0x40: Hitsplats
            if (mask & 0x40) {
                this.hitsplatDecoder.applyHitsplats(payload.slice(byteOffset), this.avatar);
                logger.info("Hitsplat Block Applied.");
            }
        }
    }

    private async handleRegionLoad(payload: Buffer): Promise<void> {
        const rebuild = this.mapDecoder.decodeRebuildNormal(payload);
        
        // 1. Sync Avatar
        this.avatar.coord = { x: rebuild.rx * 64, y: rebuild.ry * 64, plane: rebuild.plane };
        this.avatar.x = this.avatar.coord.x;
        this.avatar.y = this.avatar.coord.y;
        this.avatar.plane = rebuild.plane;

        // 2. Sync Spatial Authority
        const spatial = SpatialSovereigntyLimb.getInstance();
        if ((spatial as any).setRegionAuthority) {
            await (spatial as any).setRegionAuthority(rebuild.rx, rebuild.ry);
        } else {
            // Fallback to existing loadMapsquare if new method isn't implemented yet
            await spatial.loadMapsquare(rebuild.rx, rebuild.ry);
        }
        
        logger.info({ rx: rebuild.rx, ry: rebuild.ry }, "World Region Grounded (Scene GPP).");
    }
}

