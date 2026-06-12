import { CacheFileSource } from "../cache";
import { cacheMajors, cacheConfigPages } from "../constants";
import { parse } from "../opdecoder";

export interface IdentityKitState {
  gender: number; // 0 = male, 1 = female
  skinColor: number;
  hairColor: number;
  kitSlots: Record<number, number>; // bodypart slot -> identitykit $fileid
}

export class AvatarComposer {
  private kitDatabase: Map<number, any> = new Map();
  private isInitialized = false;

  constructor(private cache: CacheFileSource) {}

  public async initialize() {
    if (this.isInitialized) return;
    try {
      console.log("[AvatarComposer] Hydrating IdentityKit database from Jagex Cache Substrate...");
      const arch = await this.cache.getArchiveById(cacheMajors.config, cacheConfigPages.identityKit);
      for (const file of arch) {
        try {
          const decoded = parse.identitykit.read(file.buffer, this.cache) as any;
          // Set $fileid for each entry
          decoded.$fileid = file.fileid;
          this.kitDatabase.set(file.fileid, decoded);
        } catch (e) {
          // Ignore parsing errors for individual config files
        }
      }
      this.isInitialized = true;
      console.log(`[AvatarComposer] Hydration complete. ${this.kitDatabase.size} IdentityKit entries available.`);
    } catch (err) {
      console.error("[AvatarComposer] Failed to load IdentityKit archive:", err);
    }
  }

  public async composeAvatar(
    state: IdentityKitState,
    equippedItems: { id: number; amount: number; equipped?: boolean }[]
  ): Promise<{
    models: { modelid: number; mods?: any }[];
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const modelList: { modelid: number; mods?: any }[] = [];
    const hiddenSlots: Set<number> = new Set();
    const equipmentModels: Map<number, { modelid: number; recolor?: [number, number][]; material_replacements?: [number, number][] }[]> = new Map();

    // 1. Process equipped items first to determine slot hiding and collect item models
    for (const item of equippedItems) {
      if (!item.equipped) continue;
      try {
        const itemFile = await this.cache.getFileById(cacheMajors.items, item.id);
        if (!itemFile) continue;
        const itemConfig: any = parse.item.read(itemFile, this.cache);

        // Map equipment slot ID to hide specific body part slots and collect models
        const equipSlotId = itemConfig.equipSlotId;
        const equipId = itemConfig.equipId;

        // Apply slot hiding rules
        if (equipSlotId === 0) { // Helmet
          hiddenSlots.add(7); // Hide Hair
          // If full face helm or similar, hide jaw/beard (1)
          if (itemConfig.hideJaw || equipId === 8 || equipId === 11) { // heuristics for full helm
            hiddenSlots.add(1);
          }
        } else if (equipSlotId === 4) { // Torso
          hiddenSlots.add(2); // Hide Torso
          hiddenSlots.add(3); // Hide Arms
        } else if (equipSlotId === 7) { // Legs
          hiddenSlots.add(5); // Hide Legs
        } else if (equipSlotId === 9) { // Gloves
          hiddenSlots.add(4); // Hide Hands
        } else if (equipSlotId === 10) { // Boots
          hiddenSlots.add(6); // Hide Feet
        }

        // Fetch equipped model IDs
        const itemModelIds: number[] = [];
        const isMale = state.gender === 0;

        if (isMale) {
          if (itemConfig.maleModels_0 && itemConfig.maleModels_0.id) itemModelIds.push(itemConfig.maleModels_0.id);
          if (itemConfig.maleModels_1) itemModelIds.push(itemConfig.maleModels_1);
          if (itemConfig.maleModels_2) itemModelIds.push(itemConfig.maleModels_2);
        } else {
          if (itemConfig.femaleModels_0 && itemConfig.femaleModels_0.id) itemModelIds.push(itemConfig.femaleModels_0.id);
          if (itemConfig.femaleModels_1) itemModelIds.push(itemConfig.femaleModels_1);
          if (itemConfig.femaleModels_2) itemModelIds.push(itemConfig.femaleModels_2);
        }

        if (itemModelIds.length > 0) {
          const list = itemModelIds.map(mid => ({
            modelid: mid,
            recolor: itemConfig.color_replacements,
            material_replacements: itemConfig.material_replacements
          }));
          equipmentModels.set(equipSlotId, list);
        }
      } catch (e) {
        console.warn(`[AvatarComposer] Failed to load equipped item config for item ID ${item.id}`, e);
      }
    }

    // 2. Render non-hidden base body parts from IdentityKit
    const slots = [
      0, // Head
      1, // Jaw
      2, // Torso
      3, // Arms
      4, // Hands
      5, // Legs
      6, // Feet
      7, // Hair
    ];

    for (const bodypart of slots) {
      if (hiddenSlots.has(bodypart)) continue;

      const kitId = state.kitSlots[bodypart];
      if (kitId === undefined) continue;

      const kit = this.kitDatabase.get(kitId);
      if (!kit) continue;

      // Extract model IDs
      if (kit.models) {
        for (const modelid of kit.models) {
          const mods: any = {};
          if (kit.recolor) {
            mods.replaceColors = kit.recolor;
          }
          modelList.push({ modelid, mods });
        }
      }

      // Add head model (facial features overlay)
      if (bodypart === 0 && kit.headmodel) {
        modelList.push({ modelid: kit.headmodel });
      }
    }

    // 3. Add equipped item meshes
    for (const [equipSlot, items] of equipmentModels) {
      for (const item of items) {
        const mods: any = {};
        if (item.recolor) {
          mods.replaceColors = item.recolor;
        }
        if (item.material_replacements) {
          mods.replaceMaterials = item.material_replacements;
        }
        modelList.push({ modelid: item.modelid, mods });
      }
    }

    return { models: modelList };
  }
}
