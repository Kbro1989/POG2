/**
 * beta_constants.ts
 * 
 * Mirror of authoritative Jagex Beta script and variable IDs.
 * Decoupled from the rsmv substrate to ensure Brain runtime independence.
 */

export enum BetaScripts {
    LOBBY_MASTER_INIT = 123,
    LOBBY_PLAY_NOW = 456,
    MASTER_INTERACTION = 789,
    MINIMAP_CLICK_HANDLER = 101,
    ABILITY_DISPATCH_HANDSHAKE = 202,
    ADRENALINE_TELEMETRY = 303,
    ACTION_BAR_MASTER = 404,
    MAP_REGION_LOAD = 505,
    LOBBY_SAVE_IMPORT_SYNC = 606
}

export enum BetaVars {
    PLAYER_ADRENALINE = 11570,
    PLAYER_ANIMATION_GROUP = 2954,
    CURRENT_MAP_SQUARE = 1010,
    VARBIT_IMPORT_SAVE_STALL = 4500,
    VARP_BETA_ACTIVE = 1200
}

export enum BetaConfig {
    BUILD_ID = 1149,        // From beta_routing_manifest.json and params.2
    REVISION = 225,         // From params.11
    SERVER_VERSION = 948,   // From beta_config_structured.json -> metadata.server_version
    CLIENT_BUILD = 45261,   // From beta_routing_manifest.json -> build
    WORLD_ID = 204          // From params.27
}

/**
 * Avatar Refresh varbits — confirmed via interface 1420 script-to-UI correlation.
 * Source: C:\ProgramData\Jagex\RuneScape-BETA (Build 1149)
 */
export enum AvatarVarbits {
    // Confirmed via interface 1420 script-to-UI-text correlation
    // Script 10896 pattern: [scriptId, COMPONENT_SELF, enumId, varbitId]
    CHAR_CREATE_STATE = 28557,      // 3-bit [9-11] varp=5745, 8 options — master state (Game Mode, Skin Colour, Randomise, Choose Appearance)
    APPEARANCE_BODY = 2830,         // 6-bit [18-23] varp=524476, 64 options — body/appearance property
    SAVE_CONFIRM = 28749,           // 1-bit [0-0] varp=5783 — save/confirm flag (script 13914)
    EXIT_DIALOG_NO = 17062,         // 6-bit varp=3387 — exit dialog "No" button (script 10702)
    EXIT_DIALOG_YES = 17063,        // 6-bit varp=3387 — exit dialog "Yes" + "Log Out" (script 10703)

    // High-confidence candidates (multi-script bytecode correlation)
    APPEARANCE_SLOT_A = 264,        // 8-bit [0-7] varp=104, 20 scripts
    KIT_MODEL_SELECTOR = 520,       // 10-bit [20-29] varp=189, 7 scripts
    HAIR_STYLE_INDEX = 525,         // 9-bit [0-8] varp=8398, 5 scripts
    FACIAL_HAIR_INDEX = 526,        // 7-bit [7-13] varp=190, 3 scripts
    BODY_TYPE_SELECTOR = 516,       // 9-bit [0-8] varp=189, 4 scripts
    LEG_TYPE_SELECTOR = 517,        // 9-bit [9-17] varp=189, 3 scripts
    COLOR_PALETTE_INDEX = 646,      // 4-bit [4-7] varp=281, 4 scripts
    GENDER_BODY_FLAG = 5896,        // 3-bit [0-2] varp=1733, 5 scripts
    UI_TAB_STATE = 666,             // 4-bit [16-19] varp=282, all 39 scripts
}

/**
 * Character creation scripts — confirmed from interface 1420 component bindings.
 */
export enum AvatarScripts {
    // Confirmed from interface 1420 component bindings
    VARBIT_OPTION_LOADER = 10896,      // Generic varbit-driven option loader (arg[2]=enumId, arg[3]=varbitId)
    OPTION_DISPLAY_HANDLER = 10496,    // Paired display handler (renders option UI)
    MASTER_APPEARANCE_BUILDER = 7937,  // Master appearance applier (comp 2, root level)
    APPEARANCE_TAB_INIT = 7888,        // "Choose Appearance" tab handler (comp 68)
    APPEARANCE_TAB_HANDLER = 9344,     // Appearance tab state (comp 13, enum args)
    EQUIPMENT_TAB_HANDLER = 9342,      // Equipment tab state
    BODY_MORPH_SLIDER = 7893,          // Repeated 6x — morph slider handler
    AVATAR_REFRESH_HANDLER = 11195,    // Avatar Refresh Part 1 handler
    FOOTER_LINK_HANDLER = 6233,        // Footer links (Graphics Settings, Website, Terms — uses varbit 28557)
    SAVE_CONFIRM_HANDLER = 13914,      // Save/confirm handler (varbit 28749)
    EXIT_NO_HANDLER = 10702,           // Exit dialog "No" (varbit 17062)
    EXIT_YES_HANDLER = 10703,          // Exit dialog "Yes" + "Log Out" (varbit 17063)
    CHAR_CREATE_PANEL = 16899,         // Character creation panel controller (comp 56)
}
