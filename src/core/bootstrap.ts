import { HexagramNetworkBridge } from './HexagramNetworkBridge.js';
import { CombatRotationEngineContract } from '../engines/gameplay/CombatRotationEngine.js';
import { AggressionSimulatorContract } from '../engines/gameplay/AggressionSimulator.js';
import { SimulationHarnessContract } from '../engines/gameplay/SimulationHarness.js';
import { ServerLogicRegistryContract } from '../engines/gameplay/ServerLogicRegistry.js';
import { SovereignCollisionEngineContract } from '../limbs/spatial/SovereignCollisionEngine.js';
import { GhostSplatEngineContract } from '../substrates/GhostSplatEngine.js';
import { LootResolutionEngineContract } from '../engines/gameplay/LootResolutionEngine.js';

export const bridge = new HexagramNetworkBridge();

bridge.register(GhostSplatEngineContract);
bridge.register(CombatRotationEngineContract);
bridge.register(AggressionSimulatorContract);
bridge.register(SimulationHarnessContract);
bridge.register(ServerLogicRegistryContract);
bridge.register(SovereignCollisionEngineContract);
bridge.register(LootResolutionEngineContract);

// Connect to WorldDO
bridge.connect('wss://pog2-world-do.kristain33rs.workers.dev/ws');

