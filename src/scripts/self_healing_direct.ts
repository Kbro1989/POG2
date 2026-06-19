import { join } from 'path';
import { loadConfig } from '../config/SovereignConfig.js';
import { Renderer } from '../ui/Renderer.js';
import { OrchestrateEngine } from '../engines/OrchestrateEngine.js';

async function main(): Promise<void> {
    const configPath = join(process.cwd(), 'sovereign-config.json');
    const config = loadConfig(configPath);

    const renderer = new Renderer();
    const engine = await OrchestrateEngine.bootstrapAndInitialize(config, renderer, { diagnosticOnly: true });

    const tool = engine.getRegistry().getTool('check_node_health');
    if (!tool) {
        const available = engine.getRegistry().getToolNames().sort();
        console.error('Unable to find the check_node_health tool. Available tools:');
        console.error(available.join(', '));
        process.exit(1);
    }

    const result = await tool.execute({});

    if (!result.ok) {
        console.error('Self-healing execution failed:');
        console.error(result.error?.message ?? result.error);
        process.exit(1);
    }

    console.log(result.value.output ?? 'Self-healing completed with no textual output.');
    if (result.value.data) {
        console.log('\nStructured result:');
        console.log(JSON.stringify(result.value.data, null, 2));
    }
}

main().catch(error => {
    console.error('Unexpected error during self-healing bootstrap:', error);
    process.exit(1);
});
