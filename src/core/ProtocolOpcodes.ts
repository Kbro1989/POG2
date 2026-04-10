/**
 * Protocol 947 Opcode Taxonomy
 * Authoritative mapping of network packet IDs for Revision 947.
 */

export enum ServerOpcode {
    // World State
    PLAYER_UPDATE = 1,     // Variable Short (-2)
    NPC_UPDATE = 6,        // Variable Short (-2)
    REGION_LOAD_NORMAL = 16, // Variable Short (-2) (SCENE_GPP)
    
    // Interface & State
    VARP_SMALL = 33,       // Fixed 3 bytes: u16 ID, u8 Value
    VARP_LARGE = 116,      // Fixed 6 bytes: u16 ID, i32 Value
    VARC = 10,             // Fixed 6 bytes: u16 ID, i32 Value
    VARC_STRING = 40,      // Variable Byte (-1): u16 ID, String
    INTERFACE_OPEN = 10,   // Variable Byte (-1)
    
    // Miscellaneous
    SEND_MESSAGE = 0       // Variable Byte (-1)
}

export enum ClientOpcode {
    PLAYER_MOVE = 4,
    MAP_REGION_LOADED = 12
}
