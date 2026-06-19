import { ToolRegistry } from './src/ToolRegistry.js';
import { SkillsLimb } from './src/limbs/system/SkillsLimb.js';
import * as path from 'path';

console.log("CWD:", process.cwd());
const target = path.resolve(process.cwd(), '.agents/skills');
console.log("Target directory:", target);

// Setup registry
const registry = new ToolRegistry();

// Instantiate limb
const skillsLimb = new SkillsLimb(registry);

console.log("Starting bootstrap to trigger immune audit...");
await skillsLimb.bootstrapLocalSkills();
console.log("Bootstrap finished.");
