import { OrchestrateEngine } from '../engines/OrchestrateEngine.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { Renderer } from '../ui/Renderer.js';
import { SovereignConfig } from '../config/SovereignConfig.js';
import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { TemporalHeartbeatLimb } from '../limbs/core/TemporalHeartbeatLimb.js';
import { createLogger } from '../utils/logger.js';
import { SovereignDomain } from '../core/models.js';

import { HexagramManager } from '../routing/HexagramManager.js';

const logger = createLogger('LiveRadarExperience');

async function runDemo() {
    logger.info('🔱 INITIATING LIVE RADAR EXPERIENCE');

    // 1. Setup Minimal Engine Substrate
    HexagramManager.initializeMock(); // Required for TernaryRouter
    
    const config: any = {
        mode: 'hybrid',
        orchestratorModel: 'deepseek-r1:8b',
        visionModel: 'moondream:latest',
        codingModel: 'deepseek-r1:8b',
        planningModel: 'deepseek-r1:8b',
        voiceModel: 'gemma4:26b',
        masterLocalModel: 'deepseek-r1:8b',
        ollamaBaseUrl: 'http://127.0.0.1:11434',
        projectRoot: process.cwd(),
        pog2Dir: 'pog-vibe-interactive\\files',
        gutenbergPath: 'D:\\sovereign\\pog-gutenberg',
        sovereignRoot: 'D:\\sovereign'
    };

    const router = new TernaryRouter(config);
    const renderer = new Renderer();
    const engine = new OrchestrateEngine(config, router, renderer);

    console.log('--- Initializing OrchestrateEngine (Diagnostic Only) ---');
    await engine.initialize({ diagnosticOnly: true });
    console.log('--- Engine Awake ---');

    console.log('--- Loading Lumbridge (50, 50) mapsquare... ---');
    const spatial = SpatialSovereigntyLimb.getInstance();
    const loadResult = await spatial.loadMapsquare(50, 50);
    console.log('--- Load Result:', loadResult.ok ? 'SUCCESS' : 'FAILED', '---');

    const avatar = engine['gameplay'].avatar;
    avatar.coord.x = 3222;
    avatar.coord.y = 3218;
    avatar.coord.plane = 0;
    
    console.log(`--- Avatar at (${avatar.coord.x}, ${avatar.coord.y}) ---`);

    // 5. Ignite Switchboard Bridge
    const { SwitchboardLimb } = await import('../monitor/SwitchboardLimb.js');
    const switchboard = SwitchboardLimb.getInstance();
    switchboard.initialize();
    
    const bridge = await switchboard.startWithGracefulPort({ run: async () => ({ ok: true }) }, 8788);
    console.log(`\x1b[32m[BRIDGE] ✅ Sovereign Bridge ACTIVE on ${bridge.url}\x1b[0m`);
    console.log(`\x1b[36m[BRIDGE] 🔬 HEATMAP: ${bridge.url}/heatmap.html\x1b[0m`);

    // 4. Inject Intent directly (avoids missing method error)
    (avatar as any).intent = {
        action: 'walkTo',
        targetId: 'demo_target',
        coord: { x: 3218, y: 3218, plane: 0 },
        tickStarted: 0,
        contextHash: 'demo_hash'
    };

    console.log('--- RADIATING PERSISTENT HEARTBEAT (Ctrl+C to Stop) ---');
    const heartbeat = TemporalHeartbeatLimb.getInstance();
    let pulseCount = 0;
    
    while (true) {
        pulseCount++;
        if (pulseCount % 10 === 0) console.log(`[HEARTBEAT] Pulse ${pulseCount} complete.`);
        await heartbeat.pulse();
        await new Promise(r => setTimeout(r, 600));
    }
}

runDemo().catch(err => {
    logger.error({ err }, 'Live Radar Experience CRASHED.');
    process.exit(1);
});
