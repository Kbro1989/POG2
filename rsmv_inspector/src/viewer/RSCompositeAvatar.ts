import { EngineCache, ThreejsSceneCache } from "../3d/modeltothree";
import { RSModel, npcToModel } from "../3d/modelnodes";
import * as THREE from "three";
import { AvatarComposer } from "./AvatarComposer";
import { SovereignPersistence } from "./SovereignPersistence";

export class RSCompositeAvatar {
    public rootNode: THREE.Group = new THREE.Group();
    public rsModel: RSModel | null = null;
    public anims: Record<string, number> = {};
    private composer: AvatarComposer;
    
    constructor(private engine: EngineCache, private sceneCache: ThreejsSceneCache, public entityId: number = 15516) {
        this.composer = new AvatarComposer(this.sceneCache.engine.source);
    }

    /**
     * Rebuilds the Sovereign Shell using the 2026 Composite Model Array + Color Replacements.
     */
    public async rebuildComposite(compositeData?: { 
        models: number[], 
        color_replacements?: [number, number][],
        material_replacements?: [number, number][] 
    }) {
        console.log(`RSEngine: Assembling Sovereign Shell [${this.entityId}]...`);
        
        // Ensure root cleanly setup
        this.rootNode.clear();
        this.rsModel?.cleanup();

        let modelIdsWithMods: { modelid: number; mods?: any }[] = [];

        // Check if we should load persistent player save
        const playerState = SovereignPersistence.loadState();
        if (!compositeData && playerState) {
            // Define standard male default kit slots
            const defaultKitSlots: Record<number, number> = {
                0: 0,   // Head
                1: 10,  // Jaw/Beard
                2: 18,  // Torso
                3: 26,  // Arms
                4: 33,  // Hands
                5: 36,  // Legs
                6: 42,  // Feet
                7: 45   // Hair
            };

            const composerState = {
                gender: 0, // male default
                skinColor: 0,
                hairColor: 0,
                kitSlots: defaultKitSlots
            };

            try {
                const composed = await this.composer.composeAvatar(composerState, playerState.inventory || []);
                modelIdsWithMods = composed.models;
            } catch (err) {
                console.error("[RSCompositeAvatar] Error compositing player avatar:", err);
            }
        }

        // If no composite data or player state was found, fallback to template NPC lookup
        if (modelIdsWithMods.length === 0) {
            let modelIds = compositeData?.models || [];
            let mods: any = {};

            if (compositeData?.color_replacements) {
                mods.replaceColors = compositeData.color_replacements;
            }
            if (compositeData?.material_replacements) {
                mods.replaceMaterials = compositeData.material_replacements;
            }

            if (modelIds.length === 0) {
                let npcInfo = await npcToModel(this.sceneCache, { id: this.entityId, head: false });
                if (npcInfo) {
                    modelIds = npcInfo.models.map(m => m.modelid);
                    this.anims = npcInfo.anims;
                }
            }

            if (modelIds.length === 0) {
                console.error(`Failed to load NPC ${this.entityId} template or provided models!`);
                return;
            }

            modelIdsWithMods = modelIds.map(id => ({ modelid: id, mods }));
        }

        this.rsModel = new RSModel(this.sceneCache, modelIdsWithMods, `Sovereign_Avatar_${this.entityId}`, { noSkin: false });
        let loaded = await this.rsModel.model;
        
        // Attach raw rootmesh (no cloning so animations map correctly)
        this.rootNode.add(loaded.mesh);
        
        if (this.anims.default) {
            this.rsModel.setAnimation(this.anims.default);
        }
        
        console.log(`RSEngine: Avatar composite ${this.entityId} assembled and materialized!`);
    }
}
