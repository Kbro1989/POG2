import { RSMVController } from '../../vision/RSMVController.js';
import { SpatialVisionEngine } from '../SpatialVisionEngine.js';
import { CacheForensicsLimb } from '../../limbs/spatial/CacheForensicsLimb.js';
import { SubstrateState } from '../../core/models.js';

/**
 * SubstrateResolver
 * Central authority for resolving POG2 Substrate Health.
 * "NodeTester observes. It never decides."
 */
export class SubstrateResolver {
    public static async resolve(): Promise<SubstrateState> {
        const rsmv = await RSMVController.getInstance().healthCheck();
        
        // Note: SpatialVisionEngine and CacheForensicsLimb are Singletons 
        // assumed to be initialized by OrchestrateEngine.
        const vision = await SpatialVisionEngine.getInstance().healthCheck();
        const cache = await CacheForensicsLimb.getInstance().healthCheck();

        // OFFLINE: Core 3D Substrate or Spatial Perception is missing.
        if (!rsmv.online || !vision.online) {
            return SubstrateState.OFFLINE;
        }

        // DEGRADED: Cache auditing is failing but 3D view is active.
        if (cache.status === SubstrateState.OFFLINE || cache.status === SubstrateState.DEGRADED) {
            return SubstrateState.DEGRADED;
        }

        // DEGRADED_IO: Check for high extraction latency
        const { getLastIOLatencyMs } = await import('../../utils/RSMVBridge.js');
        const lastLatency = getLastIOLatencyMs();
        if (lastLatency > 1500) { // Threshold for "Significant Drift" in IO substrate
            return SubstrateState.DEGRADED_IO;
        }

        return SubstrateState.ONLINE;
    }
}
