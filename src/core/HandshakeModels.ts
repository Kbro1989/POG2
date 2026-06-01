/**
 * Protocol 947 Handshake Models
 * Grounding the network substrate in authoritative packet definitions.
 */

export enum HandshakeOpcode {
    LOGIN_SERVICE = 14,
    UPDATE_SERVICE = 15, // JS5 Cache
    RECONNECT_SERVICE = 16,
    SSL_LOGOUT = 28
}

export enum HandshakeResponse {
    SUCCESS = 0,
    OUTDATED_REVISION = 6,
    IP_LIMIT_EXCEEDED = 9,
    SERVER_FULL = 7
}

export interface HandshakePacket {
    opcode: HandshakeOpcode;
    revision: number;
    payload?: Buffer;
}

export interface LoginBlock {
    magic: number; // usually 10
    isaacSeeds: number[]; // 4 unsigned ints
    uid: string; // The extracted machine identifier
    revision: number;
    username: string;
    password?: string;
}

export interface HandshakeTranscript {
    sessionId: string;
    protocolVersion: number;
    phases: {
        timestamp: number;
        label: string;
        direction: 'CLIENT_TO_SERVER' | 'SERVER_TO_CLIENT';
        bytes: string; // Hex representation
        semantic?: any;
    }[];
}

