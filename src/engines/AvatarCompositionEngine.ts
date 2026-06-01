/**
 * AvatarCompositionEngine.ts
 * 
 * Bridges the SovereignAvatarEntity to the RSMV cache-grounded avatar pipeline.
 * Uses the real 16-slot avatar encoding from RSMV/3d/avatar.ts, identity kit
 * definitions, and Jagex's HSL color replacement system.
 * 
 * This engine does NOT fabricate schemas — it consumes the cache substrate directly
 * through EngineCache and the avatar parser (avatarToModel, writeAvatar).
 * 
 * Slot layout (from cache):
 *   0:helm 1:cape 2:necklace 3:weapon 4:body 5:offhand 6:arms 7:legs
 *   8:face 9:gloves 10:boots 11:beard 12:ring 13:ammo 14:aura 15:slot15
 *
 * Kit body parts (male): 0:head 1:jaw/beard 2:body 3:arms 4:hands 5:legs 6:feet
 * Kit body parts (female): 7:head 9:body 10:arms 11:hands 12:legs 13:feet
 */

import { Result } from '../core/models.js';
import { SovereignAvatarEntity } from '../core/SovereignAvatar.js';
import { slotNames, slotToKitMale, slotToKitFemale, avatarToModel, writeAvatar, avatarStringToBytes, bytesToAvatarString } from 'rsmv/3d/avatar.js';
import type { EquipSlot } from 'rsmv/3d/avatar.js';
export type SimpleModelDef = {
    modelid: number;
    mods: any;
    injectedModelData?: any;
}[];
export type EngineCache = any;
import type { avataroverrides } from '../generated/avataroverrides.js';

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

/** Result from a full avatar composition pass */
export interface ComposedAvatarResult {
    models: SimpleModelDef;
    anims: Record<string, number>;
    avatar: avataroverrides | null;
    gender: number;
    /** Base64-encoded avatar string for network sync */
    avatarString: string;
    mode?: string;
}

/** Minimal avatar identity for GlobeState sync */
export interface AvatarIdentitySync {
    avatarString: string;
    gender: number;
    isNpc: boolean;
    npcId?: number;
    mode?: string;
}

// ═══════════════════════════════════════════════════════
// AvatarCompositionEngine
// ═══════════════════════════════════════════════════════

export class AvatarCompositionEngine {
    private engineCache: EngineCache | null = null;

    /**
     * Bind to a live EngineCache instance. Required before any composition calls.
     * This is the real rsmv cache substrate, not a mock.
     */
    public bindCache(cache: EngineCache): void {
        this.engineCache = cache;
    }

    /**
     * Compose a full avatar model from a raw avatar buffer (from cache or network).
     * Delegates entirely to the rsmv avatarToModel parser which handles:
     *   - 16-slot equipment/kit tree search
     *   - Identity kit body part resolution
     *   - HSL color replacement (skin, hair, clothes, boots)
     *   - Animation group resolution via struct prop 2954
     *   - NPC appearance override (0xFFFF npc buzz)
     */
    public async composeFromBuffer(buffer: Buffer, head: boolean = false, mode?: string): Promise<Result<ComposedAvatarResult>> {
        if (!this.engineCache) {
            return { ok: false, error: new Error('EngineCache not bound. Call bindCache() first.') };
        }

        try {
            // Pass the mode flag down to the RSMV renderer so it respects the template's era (e.g., 'classic', 'beta')
            const result = await avatarToModel(this.engineCache, buffer, head, mode as any);
            return {
                ok: true,
                value: {
                    models: result.models,
                    anims: result.anims,
                    avatar: result.info?.avatar ?? null,
                    gender: result.info?.gender ?? 0,
                    avatarString: bytesToAvatarString(buffer),
                    mode
                }
            };
        } catch (error) {
            return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
        }
    }

    /**
     * Compose from a base64 avatar string (the format used by Jagex's avatar endpoint
     * and the GlobeState sync protocol).
     */
    public async composeFromAvatarString(avatarStr: string, head: boolean = false, mode?: string): Promise<Result<ComposedAvatarResult>> {
        try {
            const buffer = avatarStringToBytes(avatarStr);
            return this.composeFromBuffer(buffer, head, mode);
        } catch (error) {
            return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
        }
    }

    /**
     * Build an AvatarIdentitySync payload from a SovereignAvatarEntity.
     * This is the minimal identity needed for GlobeState multiplayer sync.
     */
    public buildIdentitySync(avatar: SovereignAvatarEntity): AvatarIdentitySync {
        // The avatar appearance buffer is what gets synced over the wire.
        // If no appearance data exists, return a default identity.
        return {
            avatarString: '', // Populated when avatar has been composed from cache
            gender: avatar.appearance?.gender === 'classic' ? 2 : (avatar.appearance?.gender === 'female' ? 1 : 0),
            isNpc: false,
            mode: avatar.appearance?.mode || 'beta', // Ensure template mode is passed through to renderer
        };
    }

    /**
     * Get the cache-grounded slot names array (16 slots).
     * Useful for UI rendering and debugging.
     */
    public getSlotNames(): string[] {
        return [...slotNames];
    }

    /**
     * Get the kit-to-slot mapping for a given gender.
     * Returns the cache-accurate body part → slot index mapping.
     */
    public getKitMapping(gender: 'male' | 'female' | 'classic'): Record<number, number> {
        return gender === 'female' ? { ...slotToKitFemale } : { ...slotToKitMale };
    }

    public healthCheck(): Result<string> {
        const cacheStatus = this.engineCache ? 'BOUND' : 'UNBOUND';
        return {
            ok: true,
            value: `AvatarCompositionEngine: cache=${cacheStatus}, slots=${slotNames.length}`
        };
    }
}

