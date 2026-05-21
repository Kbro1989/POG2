/**
 * ForgeLimb: Beta Config Protocol Interceptor
 * Hex 49 (Revolution) — Parsing the 15627 Beta Genesis Block
 * 
 * Parses the raw jav_config_beta.ws payload into structured intelligence,
 * exposing the beta environment's nervous system: CDN routing, feature flags,
 * world endpoints, and cache variant identifiers.
 * 
 * Substrate: D:\POG2\scratch\beta_config_captured.ws (live capture)
 * Target: Build 15627 Beta Environment
 */

import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

// ─── Sovereign Type Definitions ─────────────────────────────────────────────

export interface BetaConfigState {
    /** Raw metadata (title, version, binary info) */
    metadata: Record<string, string>;
    /** Indexed param map: paramId -> value */
    params: Record<number, string>;
    /** CDN and world routing */
    routing: {
        codebase: string;
        contentHost: string;
        contentBetaHost: string;
        lobbyHost: string;
        worldId: number;
        serverVersion: number;
        cacheVariant: string;
        launcherVersion: number;
    };
    /** Auth endpoints extracted from params */
    auth: {
        socialAuth: string;
        accountAuth: string;
        gameAuth: string;
        paymentsAuth: string;
        googleClientId: string;
    };
    /** Port configuration for JS5/lobby/game connections */
    ports: {
        lobby: number;
        game: number;
        js5: number;
        fallbackPorts: number[];
    };
    /** Feature flags (boolean params) */
    featureFlags: Record<string, boolean>;
    /** Message strings (localization, UI) */
    messages: Record<string, string>;
    /** Binary download manifest */
    binary: {
        name: string;
        crc: string;
        hash: string;
        size: number;
        count: number;
    };
    /** Window/applet dimension constraints */
    dimensions: {
        preferredWidth: number;
        preferredHeight: number;
        minWidth: number;
        minHeight: number;
        maxWidth: number;
        maxHeight: number;
        advertHeight: number;
    };
    /** Raw line count for forensic auditing */
    rawLineCount: number;
}

// ─── Known Param Index Map (Reverse-Engineered from RS3 NXT Client) ─────────

const KNOWN_PARAMS: Record<number, string> = {
    1: 'members_world',
    2: 'js5_build_id',
    3: 'lobby_host',
    4: 'unknown_4',
    5: 'unknown_5',
    6: 'unknown_6',
    7: 'language_id',
    8: 'unknown_bool_8',
    10: 'rsa_modulus',
    11: 'js5_revision',
    13: 'unknown_bool_13',
    14: 'unknown_bool_14',
    15: 'unknown_empty_15',
    16: 'cookie_domain',
    17: 'unknown_bool_17',
    18: 'game_build_hash',
    19: 'unknown_empty_19',
    20: 'unknown_bool_20',
    21: 'loading_screen_layout',
    22: 'unknown_empty_22',
    23: 'unknown_bool_23',
    24: 'social_login_enabled',
    25: 'unknown_zero_25',
    26: 'unknown_bool_26',
    27: 'world_id',
    28: 'build_timestamp',
    29: 'rsa_exponent',
    31: 'build_number',
    32: 'unknown_empty_32',
    33: 'environment_label',
    34: 'content_hash',
    35: 'game_world_url',
    36: 'stats_endpoint',
    37: 'content_host',
    38: 'idle_timeout_seconds',
    39: 'unknown_bool_39',
    40: 'fallback_world_url',
    41: 'game_port_1',
    42: 'lobby_port_ssl',
    43: 'game_port_2',
    44: 'lobby_port_ssl_2',
    45: 'js5_port',
    46: 'js5_port_ssl',
    47: 'game_port_fallback',
    48: 'lobby_port_ssl_3',
    49: 'content_beta_host',
    50: 'unknown_zero_50',
    51: 'unknown_zero_51',
    52: 'unknown_zero_52',
    53: 'auth_jagex_url',
    54: 'payments_url',
    55: 'google_client_id',
    56: 'social_auth_url',
    57: 'unknown_57',
    58: 'account_jagex_url',
    59: 'auth_runescape_url',
    60: 'unknown_one_60',
};

// ─── ForgeLimb: BetaConfigInterceptor ───────────────────────────────────────

export class BetaConfigInterceptor {
    private readonly localCapturePath: string;
    private readonly remoteURI: string;
    private readonly outputDir: string;

    constructor(options?: {
        localCapturePath?: string;
        remoteURI?: string;
        outputDir?: string;
    }) {
        this.localCapturePath = options?.localCapturePath
            ?? path.join(process.cwd(), 'scratch', 'beta_config_captured.ws');
        this.remoteURI = options?.remoteURI
            ?? 'https://www.runescape.com/jav_config_beta.ws';
        this.outputDir = options?.outputDir
            ?? path.join(process.cwd(), 'scratch');
    }

    /**
     * Execute the full interception pipeline:
     * 1. Load raw payload (local cache first, remote fallback)
     * 2. Parse into structured BetaConfigState
     * 3. Audit for skeletal/avatar feature flags
     * 4. Export structured JSON for downstream limbs
     */
    public async execute(): Promise<BetaConfigState> {
        console.log(`[FORGE_LIMB] Hex 49 (Revolution): Initiating Beta Config Interception`);

        const rawPayload = await this.loadPayload();
        const state = this.parseConfig(rawPayload);

        this.auditCriticalIntelligence(state);
        this.exportStructuredState(state);

        return state;
    }

    // ─── Payload Loading ────────────────────────────────────────────────

    private async loadPayload(): Promise<string> {
        // Sovereign Law: Prefer local substrate over network call
        if (fs.existsSync(this.localCapturePath)) {
            console.log(`[MEMORY] Loading from local capture: ${this.localCapturePath}`);
            return fs.readFileSync(this.localCapturePath, 'utf-8');
        }

        console.log(`[SENSORY] Local capture not found. Fetching from: ${this.remoteURI}`);
        const remote = await this.fetchRemote();

        // Cache locally for future runs
        fs.writeFileSync(this.localCapturePath, remote, 'utf-8');
        console.log(`[MEMORY] Remote payload cached to: ${this.localCapturePath}`);

        return remote;
    }

    private fetchRemote(): Promise<string> {
        return new Promise((resolve, reject) => {
            https.get(this.remoteURI, (res) => {
                if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    // Follow redirect
                    https.get(res.headers.location, (res2) => {
                        let data = '';
                        res2.on('data', (chunk: Buffer) => data += chunk.toString());
                        res2.on('end', () => resolve(data));
                    }).on('error', reject);
                    return;
                }
                let data = '';
                res.on('data', (chunk: Buffer) => data += chunk.toString());
                res.on('end', () => resolve(data));
            }).on('error', reject);
        });
    }

    // ─── Structured Parsing ─────────────────────────────────────────────

    private parseConfig(raw: string): BetaConfigState {
        const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const metadata: Record<string, string> = {};
        const params: Record<number, string> = {};
        const messages: Record<string, string> = {};

        for (const line of lines) {
            if (line.startsWith('//')) continue;

            const eqIdx = line.indexOf('=');
            if (eqIdx === -1) continue;

            const key = line.substring(0, eqIdx).trim();
            const value = line.substring(eqIdx + 1).trim();

            if (key === 'param') {
                // param=ID=VALUE format
                const paramEq = value.indexOf('=');
                if (paramEq !== -1) {
                    const paramId = parseInt(value.substring(0, paramEq), 10);
                    const paramVal = value.substring(paramEq + 1);
                    if (!isNaN(paramId)) {
                        params[paramId] = paramVal;
                    }
                }
            } else if (key === 'msg') {
                // msg=key=value format
                const msgEq = value.indexOf('=');
                if (msgEq !== -1) {
                    messages[value.substring(0, msgEq)] = value.substring(msgEq + 1);
                }
            } else {
                metadata[key] = value;
            }
        }

        // Extract routing intelligence
        const worldId = parseInt(params[27] ?? '0', 10);
        const buildNumber = parseInt(params[31] ?? '0', 10);

        const state: BetaConfigState = {
            metadata,
            params,
            routing: {
                codebase: metadata['codebase'] ?? '',
                contentHost: params[37] ?? '',
                contentBetaHost: params[49] ?? '',
                lobbyHost: params[3] ?? '',
                worldId,
                serverVersion: parseInt(metadata['server_version'] ?? '0', 10),
                cacheVariant: metadata['cache_variant_suffix'] ?? 'LIVE',
                launcherVersion: parseInt(metadata['launcher_version'] ?? '0', 10),
            },
            auth: {
                socialAuth: params[56] ?? '',
                accountAuth: params[58] ?? '',
                gameAuth: params[53] ?? '',
                paymentsAuth: params[54] ?? '',
                googleClientId: params[55] ?? '',
            },
            ports: {
                lobby: parseInt(params[48] ?? '443', 10),
                game: parseInt(params[41] ?? '43594', 10),
                js5: parseInt(params[45] ?? '43594', 10),
                fallbackPorts: [
                    parseInt(params[42] ?? '443', 10),
                    parseInt(params[43] ?? '43594', 10),
                    parseInt(params[44] ?? '443', 10),
                    parseInt(params[46] ?? '443', 10),
                    parseInt(params[47] ?? '43594', 10),
                ],
            },
            featureFlags: {
                socialLoginEnabled: params[24] === 'true',
                membersWorld: params[1] === '1',
                param8: params[8] === 'true',
                param13: params[13] === 'true',
                param14: params[14] === 'true',
                param17: params[17] === 'true',
                param20: params[20] === 'true',
                param23: params[23] === 'true',
                param26: params[26] === 'true',
                param39: params[39] === 'true',
            },
            messages,
            binary: {
                name: metadata['binary_name'] ?? '',
                crc: metadata['download_crc_0'] ?? '',
                hash: metadata['download_hash_0'] ?? '',
                size: parseInt(metadata['download'] ?? '0', 10),
                count: parseInt(metadata['binary_count'] ?? '0', 10),
            },
            dimensions: {
                preferredWidth: parseInt(metadata['window_preferredwidth'] ?? '1024', 10),
                preferredHeight: parseInt(metadata['window_preferredheight'] ?? '768', 10),
                minWidth: parseInt(metadata['applet_minwidth'] ?? '765', 10),
                minHeight: parseInt(metadata['applet_minheight'] ?? '540', 10),
                maxWidth: parseInt(metadata['applet_maxwidth'] ?? '3840', 10),
                maxHeight: parseInt(metadata['applet_maxheight'] ?? '2160', 10),
                advertHeight: parseInt(metadata['advert_height'] ?? '96', 10),
            },
            rawLineCount: lines.length,
        };

        console.log(`[FORGE_LIMB] Parsed ${lines.length} lines → ${Object.keys(params).length} params, ${Object.keys(metadata).length} metadata, ${Object.keys(messages).length} messages`);
        console.log(`[FORGE_LIMB] Build: ${buildNumber} | Server: ${state.routing.serverVersion} | Variant: ${state.routing.cacheVariant} | World: ${worldId}`);

        return state;
    }

    // ─── Intelligence Audit ─────────────────────────────────────────────

    private auditCriticalIntelligence(state: BetaConfigState): void {
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`[HEX 49 AUDIT] Beta 15627 Genesis Block Intelligence`);
        console.log(`${'═'.repeat(60)}`);

        // Build identification
        console.log(`\n┌─ BUILD IDENTITY`);
        console.log(`│  Build Number:    ${state.params[31] ?? 'UNKNOWN'}`);
        console.log(`│  Build Timestamp: ${state.params[28] ?? 'UNKNOWN'} (${new Date(parseInt(state.params[28] ?? '0', 10) * 1000).toISOString()})`);
        console.log(`│  JS5 Revision:    ${state.params[11] ?? 'UNKNOWN'}`);
        console.log(`│  JS5 Build ID:    ${state.params[2] ?? 'UNKNOWN'}`);
        console.log(`│  Environment:     ${state.params[33] ?? 'UNKNOWN'}`);
        console.log(`│  Server Version:  ${state.routing.serverVersion}`);
        console.log(`│  Cache Variant:   ${state.routing.cacheVariant}`);
        console.log(`└─`);

        // CDN Routing — the asset pathway
        console.log(`\n┌─ CDN / JS5 ROUTING (Asset Pathway)`);
        console.log(`│  Codebase:        ${state.routing.codebase}`);
        console.log(`│  Content Host:    ${state.routing.contentHost}`);
        console.log(`│  Content Beta:    ${state.routing.contentBetaHost}`);
        console.log(`│  Lobby Host:      ${state.routing.lobbyHost}`);
        console.log(`│  World URL:       ${state.params[35] ?? 'UNKNOWN'}`);
        console.log(`│  Fallback URL:    ${state.params[40] ?? 'UNKNOWN'}`);
        console.log(`│  Stats Endpoint:  ${state.params[36] ?? 'NONE'}`);
        console.log(`└─`);

        // Port matrix
        console.log(`\n┌─ PORT MATRIX`);
        console.log(`│  Game:     ${state.ports.game}`);
        console.log(`│  Lobby:    ${state.ports.lobby}`);
        console.log(`│  JS5:      ${state.ports.js5}`);
        console.log(`│  Fallback: [${state.ports.fallbackPorts.join(', ')}]`);
        console.log(`└─`);

        // Auth surface
        console.log(`\n┌─ AUTH SURFACE`);
        console.log(`│  Social Auth:     ${state.auth.socialAuth}`);
        console.log(`│  Account Auth:    ${state.auth.accountAuth}`);
        console.log(`│  Game Auth:       ${state.auth.gameAuth}`);
        console.log(`│  Payments:        ${state.auth.paymentsAuth}`);
        console.log(`│  Auth RS:         ${state.params[59] ?? 'NONE'}`);
        console.log(`└─`);

        // Feature flags — what's different from LIVE
        console.log(`\n┌─ FEATURE FLAGS`);
        for (const [flag, value] of Object.entries(state.featureFlags)) {
            const marker = value ? '✓' : '✗';
            console.log(`│  ${marker} ${flag}: ${value}`);
        }
        console.log(`└─`);

        // RSA keys (critical for protocol handshake)
        console.log(`\n┌─ CRYPTOGRAPHIC SUBSTRATE`);
        console.log(`│  RSA Modulus:  ${(state.params[10] ?? '').substring(0, 40)}...`);
        console.log(`│  RSA Exponent: ${(state.params[29] ?? '').substring(0, 40)}...`);
        console.log(`└─`);

        // Annotated param dump
        console.log(`\n┌─ FULL PARAM MANIFEST (${Object.keys(state.params).length} entries)`);
        const sortedParams = Object.entries(state.params)
            .sort(([a], [b]) => parseInt(a) - parseInt(b));
        for (const [id, value] of sortedParams) {
            const label = KNOWN_PARAMS[parseInt(id)] ?? 'UNKNOWN';
            const displayVal = value.length > 60 ? value.substring(0, 60) + '...' : value;
            console.log(`│  param[${id.padStart(2)}] (${label.padEnd(25)}) = ${displayVal}`);
        }
        console.log(`└─`);

        console.log(`\n${'═'.repeat(60)}`);
    }

    // ─── Export ──────────────────────────────────────────────────────────

    private exportStructuredState(state: BetaConfigState): void {
        const outputPath = path.join(this.outputDir, 'beta_config_structured.json');
        fs.writeFileSync(outputPath, JSON.stringify(state, null, 2), 'utf-8');
        console.log(`\n[MEMORY] Structured config exported to: ${outputPath}`);

        // Also export a focused routing manifest for downstream limbs
        const routingManifest = {
            build: parseInt(state.params[31] ?? '0', 10),
            timestamp: parseInt(state.params[28] ?? '0', 10),
            variant: state.routing.cacheVariant,
            js5: {
                host: state.routing.contentBetaHost || state.routing.contentHost,
                port: state.ports.js5,
                portSsl: parseInt(state.params[46] ?? '443', 10),
                revision: parseInt(state.params[11] ?? '0', 10),
                buildId: parseInt(state.params[2] ?? '0', 10),
            },
            world: {
                id: state.routing.worldId,
                codebase: state.routing.codebase,
                gamePort: state.ports.game,
            },
            environment: state.params[33] ?? 'LIVE',
        };

        const routingPath = path.join(this.outputDir, 'beta_routing_manifest.json');
        fs.writeFileSync(routingPath, JSON.stringify(routingManifest, null, 2), 'utf-8');
        console.log(`[MEMORY] Routing manifest exported to: ${routingPath}`);
    }
}

// ─── Direct Execution ───────────────────────────────────────────────────────

const interceptor = new BetaConfigInterceptor();
interceptor.execute().catch(err => {
    console.error(`[FORGE_LIMB] CRITICAL FAILURE:`, err);
    process.exit(1);
});
