import { OrchestrateEngine } from './engines/OrchestrateEngine.js';
import { SovereignConfig, loadConfig } from './config/SovereignConfig.js';
import { TernaryRouter } from './routing/TernaryRouter.js';
import { Renderer } from './ui/Renderer.js';
import { join } from 'path';
import { homedir } from 'os';

async function repro() {
    console.log('Starting reproduction...');
    const configPath = join(homedir(), '.POG2-cli', 'config.json');
    const config = loadConfig(configPath);
    const router = new TernaryRouter(config);
    const renderer = new Renderer();

    console.log('Initializing OrchestrateEngine...');
    try {
        const engine = new OrchestrateEngine(config, router, renderer);
        console.log('OrchestrateEngine initialized successfully.');

        console.log('Executing gutenberg_list...');
        const result = await engine.executePlan({
            tool: 'gutenberg_list',
            parameters: {},
            reasoning: 'Reproduction test.',
            model: config.orchestratorModel,
            severity: 1,
            interaction: 'text',
            yaoState: 1 // YoungYin
        });

        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('CRASH DETECTED:');
        console.error(err);
    }
}

repro().catch(err => {
    console.error('UNHANDLED TOP-LEVEL ERROR:');
    console.error(err);
});
