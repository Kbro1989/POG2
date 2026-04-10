import { HandshakeOpcode, HandshakeResponse, type HandshakePacket, type HandshakeTranscript, type LoginBlock } from '../../core/HandshakeModels.js';
import { latestBuildNumber } from '../../core/CacheConstants.js';
import { createLogger } from "../../utils/logger.js";
import * as crypto from 'crypto';

const logger = createLogger('HandshakeLimb');

/**
 * HandshakeLimb - Protocol 947 Ingress Coordinator
 * Handles the authoritative "Dark Substrate" handshake for creating our own server bridge.
 */
export class HandshakeLimb {
    private static instance: HandshakeLimb;
    private transcript: HandshakeTranscript;
    private publicKey: string | null = null;

    private constructor() {
        this.transcript = {
            sessionId: crypto.randomUUID(),
            protocolVersion: latestBuildNumber,
            phases: []
        };
    }

    public static getInstance(): HandshakeLimb {
        if (!HandshakeLimb.instance) {
            HandshakeLimb.instance = new HandshakeLimb();
        }
        return HandshakeLimb.instance;
    }

    /**
     * setKeys - Injects the RSA keys for the clean-room simulation.
     */
    public setKeys(publicKey: string): void {
        this.publicKey = publicKey;
        logger.debug("RSA Keys injected into Handshake Limb.");
    }

    /**
     * generateJS5Hello - Creates the Opcode 15 Handshake packet.
     */
    public generateJS5Hello(): Buffer {
        const buffer = Buffer.alloc(5);
        buffer.writeUInt8(HandshakeOpcode.UPDATE_SERVICE, 0);
        buffer.writeUInt32BE(latestBuildNumber, 1);

        this.logPhase('CLIENT_TO_SERVER', 'JS5_HELLO', buffer, { revision: latestBuildNumber });
        return buffer;
    }

    /**
     * generateLoginHello - Phase 1 of Opcode 14.
     */
    public generateLoginHello(): Buffer {
        const buffer = Buffer.alloc(5);
        buffer.writeUInt8(HandshakeOpcode.LOGIN_SERVICE, 0);
        buffer.writeUInt32BE(latestBuildNumber, 1);

        this.logPhase('CLIENT_TO_SERVER', 'LOGIN_HELLO', buffer, { revision: latestBuildNumber });
        return buffer;
    }

    /**
     * generateLoginBlock - Phase 2 of Opcode 14 (The RSA Payload).
     */
    public generateLoginBlock(block: LoginBlock): Buffer {
        if (!this.publicKey) throw new Error("RSA Public Key must be injected before login.");

        // 1. Construct raw payload
        // [magic(1), seeds(16), uid(length + 1), revision(2), username(str), ...]
        const payload = Buffer.alloc(256); // Start large
        let offset = 0;
        payload.writeUInt8(block.magic, offset++);
        
        for (const seed of block.isaacSeeds) {
            payload.writeUInt32BE(seed, offset);
            offset += 4;
        }

        payload.write(block.uid, offset);
        offset += block.uid.length;
        payload.writeUInt8(0, offset++); // Null terminator for UID string

        payload.writeUInt16BE(block.revision, offset);
        offset += 2;

        payload.write(block.username, offset);
        offset += block.username.length;
        payload.writeUInt8(0, offset++);

        const finalRaw = payload.slice(0, offset);

        // 2. Encrypt via RSA
        const encrypted = crypto.publicEncrypt({
            key: this.publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, finalRaw);

        this.logPhase('CLIENT_TO_SERVER', 'LOGIN_BLOCK_RSA', encrypted, { 
            rawSize: finalRaw.length,
            encryptedSize: encrypted.length 
        });

        return encrypted;
    }

    /**
     * processJS5Response - Validates the server's success byte.
     */
    public processJS5Response(data: Buffer): boolean {
        const response = data.readUInt8(0);
        this.logPhase('SERVER_TO_CLIENT', 'JS5_RESPONSE', data, { response });

        if (response === HandshakeResponse.SUCCESS) {
            logger.info({ revision: latestBuildNumber }, "Handshake Successful: Revision 947 Established.");
            return true;
        }

        logger.error({ response }, "Handshake Failed: Revision Mismatch or Server Full.");
        return false;
    }

    /**
     * getTranscript - Returns the detailed forensic log.
     */
    public getTranscript(): HandshakeTranscript {
        return this.transcript;
    }

    private logPhase(direction: 'CLIENT_TO_SERVER' | 'SERVER_TO_CLIENT', label: string, bytes: Buffer, semantic?: any): void {
        this.transcript.phases.push({
            timestamp: Date.now(),
            label,
            direction,
            bytes: bytes.toString('hex'),
            semantic
        });
    }
}
