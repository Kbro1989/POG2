/**
 * SubstrateManifestRegistry.ts
 *
 * Central index mapping Cache Opcodes/Categories to POG2 entity sets.
 * This ensures corpus generation is driven by canonical substrate definitions
 * rather than static, loosely-typed JSON dumps.
 */

export const SubstrateManifestRegistry = {
    ITEM: {
        idSet: 'items',
        type: 'item',
        probeScript: 'probe_entity.ts'
    },
    NPC: {
        idSet: 'npcs',
        type: 'npc',
        probeScript: 'probe_entity.ts'
    },
    OBJECT: {
        idSet: 'objects',
        type: 'object',
        probeScript: 'probe_entity.ts'
    }
};


export type EntityType = keyof typeof SubstrateManifestRegistry;

