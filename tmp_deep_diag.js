
import { 
    getTrainingInteractionsPath, 
    getTrainingFPRAGPath, 
    detectPathTier, 
    getSovereignRoot,
    hasSovereignDrive
} from './dist/utils/SovereignPathResolver.js';
import { TrainingCollector } from './dist/utils/TrainingCollector.js';

console.log("--- SovereignPathResolver Diagnostic ---");
console.log("hasSovereignDrive():", hasSovereignDrive());
console.log("detectPathTier():", detectPathTier());
console.log("getSovereignRoot():", getSovereignRoot());
console.log("getTrainingInteractionsPath():", getTrainingInteractionsPath());
console.log("getTrainingFPRAGPath():", getTrainingFPRAGPath());

console.log("\n--- TrainingCollector Diagnostic ---");
const tc = TrainingCollector.getInstance("diag-session");
const health = tc.healthCheck();
console.log("Health Check Result:", JSON.stringify(health, null, 2));
