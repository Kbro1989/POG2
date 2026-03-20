import { OrchestrateEngine } from './src/engines/OrchestrateEngine.js';
import { TernaryRouter } from './src/routing/TernaryRouter.js';
import { Renderer } from './src/ui/Renderer.js';
import { loadConfig } from './src/config/SovereignConfig.js';
import { join } from 'path';
import { homedir } from 'os';
import { HexagramManager } from './src/routing/HexagramManager.js';

async function main() {
    const config = loadConfig(join(homedir(), '.POG2-cli', 'config.json'));
    const renderer = new Renderer();
    const hexagram = new HexagramManager(null, process.cwd());
    await hexagram.initialize();
    const router = new TernaryRouter(config);
    const engine = new OrchestrateEngine(config, router, renderer);
    await engine.initialize();

    const tools = (engine as any).registry.getToolNames();
    console.log('REGISTERED_TOOLS_START');
    console.log(JSON.stringify(tools));
    console.log('REGISTERED_TOOLS_END');
}

main().catch(console.error);
