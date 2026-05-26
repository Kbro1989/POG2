/**
 * ManifestationEngine.ts
 * 
 * Master Orchestrator for the Sovereign 4-Layer Reality.
 * Ingests manifests and registry data to mount the world state.
 */

import { HUD_REGISTRY } from './HUDRegistry.js';

export interface ManifestationOptions {
    autoMountHUDs: boolean;
    syncSpatial: boolean;
}

export class ManifestationEngine {
    private bridge: any;

    constructor(bridge: any) {
        this.bridge = bridge;
    }

    /**
     * Executes the total world-state manifestation process.
     * Triggers render parsing for world entities, HUD overlays, and spatial layers.
     */
    public async manifestReality(spawnManifest: any, options: ManifestationOptions = { autoMountHUDs: true, syncSpatial: true }) {
        console.log('🔮 [MANIFESTATION] Commencing total world-state assembly...');

        // 1. Layer: Spatial Manifestation (Entities/NPCs)
        if (options.syncSpatial) {
            console.log('🌐 [MANIFESTATION] Syncing Spatial Layer...');
            await this.bridge.send({ 
                type: 'MANIFEST_SPATIAL', 
                entities: spawnManifest.entities 
            });
        }

        // 2. Layer: Operational HUDs (UI)
        if (options.autoMountHUDs) {
            console.log('🖥️ [MANIFESTATION] Syncing Operational HUD Layer...');
            for (const hud of HUD_REGISTRY) {
                console.log(`📦 [MANIFESTATION] Mounting ${hud.name} (ID: ${hud.id})...`);
                await this.bridge.send({ 
                    type: 'MANIFEST_UI', 
                    hudId: hud.id, 
                    path: hud.forensicPath 
                });
            }
        }

        // 3. Layer: Synchronization Pulse
        console.log('⚡ [MANIFESTATION] Finalizing reality pulse.');
        this.bridge.send({ type: 'SYNC_STATE_INIT' });
        
        console.log('✨ [MANIFESTATION] Reality synchronized.');
    }
}
