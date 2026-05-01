import { NodeTester } from './dist/src/monitor/NodeTester.js';
import { TernaryRouter } from './dist/src/routing/TernaryRouter.js';
import { HexagramManager } from './dist/src/routing/HexagramManager.js';
import { resolve } from 'path';

async function run() {
    const hexagram = new HexagramManager(null, 'test');
    const router = new TernaryRouter({});
    const tester = new NodeTester(process.cwd(), router, null, null, hexagram, null, {});
    const results = await tester.auditNeuralNodes();
    console.log("DEGRADED:");
    console.log(results.filter(r => r.status === 'DEGRADED').map(r => r.path + ' - ' + r.details));
    console.log("OFFLINE:");
    console.log(results.filter(r => r.status === 'OFFLINE').map(r => r.path + ' - ' + r.details));
}
run();
