import { SelfHealingEngine } from '../src/engines/SelfHealingEngine.js';
import { ModelClient } from '../src/clients/ModelClient.js';
import { HexagramManager } from '../src/routing/HexagramManager.js';
import { getDefaultSovereignConfig } from '../src/config/SovereignConfig.js';

async function main() {
    const config = getDefaultSovereignConfig();
    const modelClient = new ModelClient(config);
    const hexagramManager = new HexagramManager(null, 'D:\\POG2');
    
    // Create the healer instance
    const healer = new SelfHealingEngine(
        'D:\\POG2',
        modelClient,
        hexagramManager
    );

    console.log('Initiating Branch GC diagnostic...');
    const result = await healer.selfClean({
        branchMaxAgeDays: 7,
        dryRun: true,
        protectPatterns: ['release/*', 'hotfix/*']
    });

    console.log('Would prune:', result.prunedBranches);
    console.log('Protected:', result.protectedBranches);
}

main().catch(err => {
    console.error('Diagnostic failed:', err);
    process.exit(1);
});
