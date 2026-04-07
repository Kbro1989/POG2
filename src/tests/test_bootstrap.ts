import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { CacheForensicsLimb } from '../limbs/spatial/CacheForensicsLimb.js';
import { MechanicalSovereigntyLimb } from '../limbs/technical/MechanicalSovereigntyLimb.js';
import { GameplaySovereigntyLimb } from '../limbs/spatial/GameplaySovereigntyLimb.js';
import { RSMVController } from '../vision/RSMVController.js';
import { CNSGodheadPulseVolley } from '../engines/gameplay/CNSGodheadPulseVolley.js';
import { WorldGroundingLimb } from '../limbs/world_grounding/WorldGroundingLimb.js';
import { SwitchboardLimb } from '../monitor/SwitchboardLimb.js';
import { SpatialVisionEngine } from '../engines/SpatialVisionEngine.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { CNSCausalityLedger } from '../engines/core/CNSCausalityLedger.js';

/**
 * resetAllSingletons - Clear the slate for deterministic integration tests.
 */
export function resetAllSingletons(): void {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('resetAllSingletons is forbidden in production environment');
    }

    SpatialSovereigntyLimb.resetInstance();
    CacheForensicsLimb.resetInstance();
    MechanicalSovereigntyLimb.resetInstance();
    GameplaySovereigntyLimb.resetInstance();
    RSMVController.resetInstance();
    CNSGodheadPulseVolley.resetInstance();
    WorldGroundingLimb.resetInstance();
    SwitchboardLimb.resetInstance();
    SpatialVisionEngine.resetInstance();
    HexagramManager.resetInstance();
    CNSCausalityLedger.resetInstance();

    // Re-initialize critical static substrates for test environment
    HexagramManager.initializeMock();
    
    const mockConfig = { visionModel: 'test-vision' } as any;
    const mockRenderer = { info: () => {}, error: () => {}, warn: () => {}, debug: () => {} } as any;
    SpatialVisionEngine.getInstance(mockConfig, mockRenderer);
}
