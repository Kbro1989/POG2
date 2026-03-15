import { ShellEngine } from './src/engines/ShellEngine.js';
import { TernaryRouter } from './src/routing/TernaryRouter.js';
import { HexagramManager } from './src/routing/HexagramManager.js';
import { Renderer } from './src/ui/Renderer.js';
import { SovereignConfig } from './src/config/SovereignConfig.js';
import { YaoState } from './src/core/models.js';

async function test() {
    const config: SovereignConfig = {
        projectId: 'test',
        orchestratorModel: 'test',
        masterLocalModel: 'test'
    } as any;

    const renderer = new Renderer();
    // Initialize Singleton
    const manager = new HexagramManager(undefined, config.projectId);
    const router = new TernaryRouter(config);
    const hex = router.getHexagram();

    const shell = new ShellEngine(renderer, router);

    console.log('--- Testing ShellEngine Safety Gates ---');

    // Simulate OldYin (Retreat/Decay) state
    console.log('Simulating OldYin state...');
    await hex.pinCard(1, 'Test Decay', 'Force OldYin', YaoState.OldYin);
    
    console.log('Current YaoState:', hex.getYaoState());

    const destructiveCmd = 'rm -rf /';
    console.log(`Executing destructive command: ${destructiveCmd}`);
    
    const result = await shell.execute({ command: destructiveCmd });

    if (!result.ok && result.error.message.includes('COGNITIVE BLOCK')) {
        console.log('✅ PASS: Destructive command blocked in OldYin state.');
    } else {
        console.log('❌ FAIL: Destructive command was NOT blocked or returned unexpected result.');
        console.log('Result:', result);
    }

    // Simulate YoungYang (Projective) state
    console.log('\nSimulating YoungYang state...');
    await hex.pinCard(1, 'Test Growth', 'Force YoungYang', YaoState.YoungYang);
    console.log('Current YaoState:', hex.getYaoState());

    const safeCmd = 'echo "Safe Command"';
    console.log(`Executing safe command: ${safeCmd}`);
    const result2 = await shell.execute({ command: safeCmd, silent: true });

    if (result2.ok) {
        console.log('✅ PASS: Safe command allowed in YoungYang state.');
    } else {
        console.log('❌ FAIL: Safe command blocked in YoungYang state.');
        console.log('Error:', result2.error);
    }
}

test().catch(console.error);
