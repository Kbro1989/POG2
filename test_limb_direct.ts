import { StoryboardLimb } from './src/limbs/creative/StoryboardLimb.js';
import { ModelClient } from './src/clients/ModelClient.js';

console.log('StoryboardLimb defined:', typeof StoryboardLimb);
console.log('PerformForensicCasting on prototype:', typeof (StoryboardLimb.prototype as any).performForensicCasting);
