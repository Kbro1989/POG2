import { PedagogyDistiller, InstructionPair } from './PedagogyDistiller.js';
import type { LearningTrace } from '../../core/models.js';
import type { CombatIntent } from '../../engines/gameplay/CombatRotationEngine.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('CombatPedagogyBridge');

export class CombatPedagogyBridge {
    private static instance: CombatPedagogyBridge;

    private constructor() { }

    public static getInstance(): CombatPedagogyBridge {
        if (!CombatPedagogyBridge.instance) {
            CombatPedagogyBridge.instance = new CombatPedagogyBridge();
        }
        return CombatPedagogyBridge.instance;
    }

    /**
     * bridgeCombatTrace - Converts a combat learning trace into an instruction pair for pedagogy.
     */
    public async bridgeCombatTrace(trace: LearningTrace, intent: CombatIntent | null): Promise<void> {
        if (!trace || !intent) return;

        const timestamp = Date.now();
        
        const abilityId = intent.action === 'execute_ability' ? intent.abilityId : undefined;
        
        // Construct the instruction pair
        const pair: InstructionPair = {
            instruction: `Predict the optimal combat action for the given combat context.`,
            input: JSON.stringify({
                summary: trace.summary,
                causalChain: trace.causalChain,
                primaryDrivers: trace.primaryDrivers
            }),
            output: `Action: ${intent.action}${abilityId ? ` [Ability: ${abilityId}]` : ''}${intent.targetId ? ` on Target: ${intent.targetId}` : ''}`,
            source: "CombatPedagogyBridge:Rotation",
            confidence: 1.0,
            timestamp
        };

        // Append to corpus
        await PedagogyDistiller.getInstance().addInstructionPair(pair);
        
        logger.info({ eventId: trace.eventId }, 'Bridged combat trace to pedagogy corpus.');
    }
}

