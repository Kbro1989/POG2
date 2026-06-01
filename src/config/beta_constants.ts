// beta_constants.ts
export const BetaConfig = {
    // Existing
    BUILD_ID: 1149,
    REVISION: 225,
    CLIENT_BUILD: 45261,
    SERVER_VERSION: 948,
    WORLD_ID: 204,
    VARIANT: 'BETA',
    
    // New: Protocol identity
    JS5_HOST: 'content.beta.runescape.com',
    GAME_HOST: 'world204.runescape.com',
    LOBBY_HOST: 'lobby50.runescape.com',
    
    SESSION_TOKEN: 'wwGlrZHF5gKN6D3mDdihco3oPeYN2KFybL9hUUFqOvk',
    BINARY_CRC: 2341522391,
    BINARY_HASH: 'IQZ1gzV42m4BBiabHIA*7MeJiSymi0-gGbgV3UlILxR1uJ26xRj-SLi8qNLxWW-Zm-gnWiLLPh0BHN6qr5EtfQ9UEWbkwKV1uIRAB6HnOM-or6EGUEvjB0CKbRl6rieb*Bhvt2hN-VTLdlnZIFp7ufWYHoFEFr59LCxpxKB8I*SBPslWqZSp87l0lm6o2sQEHxDbFKQgYX556swfm9CnoPW0-*gPRAJW1MDu7rIEHtieXYiKbbx9kdQo3tEci4500jIDFOG4UskQEsIo1yx-UFpvaAVpiKURIDFbCpHGsUAPNGIbbr7n-Dcboulj7h2YV8VrlLH8loPBpSQxWpWmVkYh*Z*XkEVr0lUhC7MDZOXfs4p7zHH0xm48yCn5vbNIve5dndGGm4u4-pvPpYGW7GVeI32vOt002iSEAqmlcDYdzVLHXA0YhBaYu9VhmUSVaY0Ah7RpBabM4BLkwR03WqPwi-HJkp5IBX00tM0xuuH0Qwi2XGe7-xOnEnVzGZ-YH0jZhdJ5cfBv53hjQs7qIDnS7fLVxFv059sVP0GSpzhf*2SttDovrohdReAkhD3h1yOnFmL-AvqIW662jgKFH3Jb3RFPbOY1JmmXMxRIoFKCZhz2cX3m0suEPYY7Iq5pQ70j-uWcezrOivwUjf2jMufjda-iLyT8xlzvqhNq9mY',
    
    // Network behavior
    SIMULATE_MODE: true, // Sovereign default: replay, don't connect live
    PORT_FALLBACKS: [43594, 443, 43594, 443, 43594],
    
    // Feature flags from structured config
    SOCIAL_LOGIN: true,
    MEMBERS_WORLD: false,
    
    // Cache paths
    LOCAL_CACHE_ROOT: 'C:/ProgramData/Jagex/RuneScape-BETA',
    SOVEREIGN_CACHE_MIRROR: 'D:/sovereign/cache_pedagogy'
};

