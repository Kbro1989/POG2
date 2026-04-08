/**
 * Sovereign Interaction Binary Store
 * Forensic registry for mapping world object interaction pairs.
 */

export interface InteractionPair {
    targetId: number;
    resultId: number;
    action: string;
    type: 'DOOR' | 'LADDER' | 'CAVE' | 'PORTAL';
}

export const OBJECT_INTERACTION_STORE: Record<number, InteractionPair> = {
    // Doors (Closed -> Open)
    22: { targetId: 22, resultId: 23, action: "Open", type: "DOOR" },
    37: { targetId: 37, resultId: 38, action: "Open", type: "DOOR" },
    47: { targetId: 47, resultId: 48, action: "Open", type: "DOOR" },
    77: { targetId: 77, resultId: 81, action: "Open", type: "DOOR" },
    81: { targetId: 81, resultId: 82, action: "Open", type: "DOOR" },
    92: { targetId: 92, resultId: 93, action: "Open", type: "DOOR" },
    
    // Ladders (Climb logic)
    11: { targetId: 11, resultId: 11, action: "Climb-up", type: "LADDER" }, // Targets same ID, but plane++
    
    // Keldagrim Trapdoor
    28094: { targetId: 28094, resultId: 28094, action: "Go-through", type: "PORTAL" }
};

export function getInteractionResult(objectId: number): InteractionPair | undefined {
    return OBJECT_INTERACTION_STORE[objectId];
}

export function isTransversal(objectId: number): boolean {
    const interaction = OBJECT_INTERACTION_STORE[objectId];
    return interaction ? (interaction.type === 'LADDER' || interaction.type === 'CAVE' || interaction.type === 'PORTAL') : false;
}
