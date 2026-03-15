
import { 
    getTrainingInteractionsPath, 
    detectPathTier, 
    getSovereignRoot
} from './dist/utils/SovereignPathResolver.js';
import { TrainingCollector } from './dist/utils/TrainingCollector.js';

// Explicitly clear the offensive environment variable
delete process.env['POG_PATH_TIER'];

console.log("--- SovereignPathResolver Fix Verification ---");
console.log("process.env['POG_PATH_TIER'] (cleared):", process.env['POG_PATH_TIER']);
console.log("detectPathTier():", detectPathTier());
console.log("getSovereignRoot():", getSovereignRoot());
console.log("getTrainingInteractionsPath():", getTrainingInteractionsPath());

console.log("\n--- TrainingCollector Fix Verification ---");
const tc = TrainingCollector.getInstance("verify-session");
const health = tc.healthCheck();
console.log("Health Check Result:", JSON.stringify(health, null, 2));
