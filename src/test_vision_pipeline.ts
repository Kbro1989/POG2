import { OrchestrateEngine } from './engines/OrchestrateEngine.js';
import { TernaryRouter } from './routing/TernaryRouter.js';
import { ModelClient } from './clients/ModelClient.js';
import { SovereignConfig, loadConfig } from './config/SovereignConfig.js';
import { Renderer } from './ui/Renderer.js';
import { join } from 'path';
import { homedir } from 'os';

async function test() {
    console.log('ðŸš€ Starting Vision Pipeline Direct Test...');
    const configPath = join(homedir(), '.POG2-cli', 'config.json');
    const config = loadConfig(configPath);
    const renderer = new Renderer();
    const router = new TernaryRouter(config);
    const client = new ModelClient(config, router);
    router.setModelClient(client);
    const engine = new OrchestrateEngine(config, router, renderer);

    // Set auto-proceed for internal logic
    process.env['POG2_AUTO_PROCEED'] = '1';

    const prompt = "A vibrant high-fidelity UI login screen for 'AI KNIGHT' with glassmorphism, gold accents, and a futuristic knight logo.";
    const analysisPrompt = "Analyze the color palette and identify the HEX codes for the gold accents and glassmorphism elements.";

    console.log('Step 1: Running sovereign_visualize...');
    const result = await engine.run(`sovereign_visualize '${prompt}' '${analysisPrompt}'`);

    if (result.ok) {
        console.log('âœ… Pipeline Success!');
        console.log('OUTPUT:', result.value.output);
        process.exit(0);
    } else {
        console.error('âŒ Pipeline Failed:', result.error);
        process.exit(1);
    }
}

test().catch(err => {
    console.error('Fatal Test Error:', err);
    process.exit(1);
});
