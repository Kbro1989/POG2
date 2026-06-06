import { TrainingCollector } from './src/utils/TrainingCollector.js';
import { OmniTrainingBridge } from './src/core/OmniTrainingBridge.js';
import { LearningEvent, LearningFidelity, TruthClass } from './src/core/models.js';

class MockPedagogyLimb implements OmniTrainingBridge {
    distill(event: any): LearningEvent {
        return {
            tick: 1,
            timestamp: Date.now(),
            fidelity: LearningFidelity.PEDAGOGY,
            resolution: { instruction: "Test instruction", output: "Test output" },
            tags: ['[VERIFIED]']
        };
    }

    getDomainNamespace(): string {
        return 'pedagogy';
    }
}

import { HexagramManager } from './src/routing/HexagramManager.js';

async function testOmniTraining() {
    console.log("Initializing Omni-Training test...");
    
    // Initialize dependencies using mock
    HexagramManager.initializeMock();
    
    const collector = TrainingCollector.getInstance();
    const limb = new MockPedagogyLimb();

    console.log("Distilling event...");
    const event = limb.distill({ raw: 'test' });
    console.log("Event distilled:", JSON.stringify(event));

    console.log("Recording learning event...");
    // Direct call to recordLearningEvent which uses the internal arbitration logic
    await (collector as any).recordLearningEvent(event);
    
    console.log("Test completed. Check logs for arbitration outcome.");
}

testOmniTraining().catch(console.error);
