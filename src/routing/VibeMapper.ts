import { createLogger } from '../utils/logger.js';
import type { FragmentLogic, EmotionalState, YaoState } from '../core/models.js';
import { HexagramManager } from './HexagramManager.js';
import { RegistryB } from '../core/RegistryB.js';

const logger = createLogger('VibeMapper');

export type AgentVibe = 'SPOOKY' | 'MECHANICAL' | 'SERENE';

/**
 * VibeMapper
 * Bridges the gap between mechanical fragment logic and agent personality states.
 * Deterministically derives the 'vibe' from MapZone metadata and MechanicalScarcity.
 */
export class VibeMapper {
    private static instance: VibeMapper;
    private currentVibe: AgentVibe = 'SERENE';

    private constructor() {}

    public static getInstance(): VibeMapper {
        if (!VibeMapper.instance) {
            VibeMapper.instance = new VibeMapper();
        }
        return VibeMapper.instance;
    }

    /**
     * updateVibe - Recalculates the environmental vibe based on fragment logic density.
     * @param logic The authoritative fragment logic from RegistryB.
     */
    public updateVibe(logic: FragmentLogic): void {
        const hexManager = HexagramManager.getInstance();
        const registry = RegistryB.getInstance();

        // 1. Somatic Input: Push intents from major entities into the hexagram
        // We look at the first few NPCs and Objects to avoid overloading the 6-line buffer
        const entities = [
            ...logic.npcs.slice(0, 2).map(id => ({ type: 'npcs' as const, id })),
            ...logic.objects.slice(0, 2).map(id => ({ type: 'objects' as const, id }))
        ];

        for (const entity of entities) {
            const intent = registry.getIntent(entity.type, entity.id);
            if (intent) {
                // Map intent to a likely YaoState (Simplified heuristic)
                const state = intent.toLowerCase().includes('weapon') || intent.toLowerCase().includes('attack') 
                    ? 4 // OldYang (Radical Expansion/Conflict)
                    : (intent.toLowerCase().includes('legendary') ? 6 : 1); // YoungMixed or YoungYang

                hexManager.pushLine({
                    lineIndex: 0, // Automatically handled by pushLine shifting
                    title: `Somatic Intent: ${entity.type} ${entity.id}`,
                    content: intent.substring(0, 100),
                    state: state as any,
                    importance: 1
                });
            }
        }

        // 2. Derive Vibe from Emotional Pool
        const pool = hexManager.getEmotionalPool();
        const emotion = hexManager.getEmotionalState();
        
        let newVibe: AgentVibe = 'SERENE';

        // Spooky: Agitated, Melancholy, or explicit Spooky triggers
        if (pool['Agitated'] > 0.5 || pool['Melancholy'] > 0.5) {
            newVibe = 'SPOOKY';
        }
        // Mechanical: Curious, Excited, or high rule density
        else if (pool['Curious'] > 0.5 || pool['Excited'] > 0.5 || (logic.rules?.length || 0) > 3) {
            newVibe = 'MECHANICAL';
        }
        else {
            newVibe = 'SERENE';
        }

        if (newVibe !== this.currentVibe) {
            logger.info({ 
                anchor: logic.anchor, 
                old: this.currentVibe, 
                new: newVibe,
                emotion,
                ruleCount: logic.rules?.length 
            }, 'Neurological Vibe Transition.');
            this.currentVibe = newVibe;
        }
    }

    public getVibe(): AgentVibe {
        return this.currentVibe;
    }
}
