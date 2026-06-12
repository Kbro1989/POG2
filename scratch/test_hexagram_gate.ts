import { HexagramManager } from '../src/routing/HexagramManager.ts';

HexagramManager.initializeSimulation();
const h = HexagramManager.getInstance();
await h.initialize();

const id = h.getNumericId();
const active = h.getActiveLimbSet();
const yao = h.getYaoState();

console.log('YaoState:', yao);
console.log('Hexagram ID:', id);
console.log('Active limbs:', active.length);
console.log('GutenbergLimb:', active.includes('GutenbergLimb'));
console.log('ShadowEngine:', active.includes('ShadowEngine'));
console.log('OrchestrateEngine:', active.includes('OrchestrateEngine'));
