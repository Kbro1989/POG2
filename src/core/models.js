/**
 * Core type definitions for pog2-sovereign.
 * Aggregator and Domain-Specific Taxonomy.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// HealthReport and ServiceHealthState defined below to resolve broken import
import { SovereignDomain } from '../types/SovereignDomain.js';
export { SovereignDomain };
export var TaskType;
(function (TaskType) {
    TaskType["CODE"] = "CODE";
    TaskType["RESEARCH"] = "RESEARCH";
    TaskType["SYSTEM"] = "SYSTEM";
    TaskType["VISION"] = "VISION";
    TaskType["FORGE"] = "FORGE";
    TaskType["SOCIAL"] = "SOCIAL";
    TaskType["MOTOR"] = "MOTOR";
    TaskType["SENSORY"] = "SENSORY";
})(TaskType || (TaskType = {}));
export var YaoState;
(function (YaoState) {
    YaoState[YaoState["OldYang"] = 3] = "OldYang";
    YaoState[YaoState["YoungYang"] = 2] = "YoungYang";
    YaoState[YaoState["OldYin"] = 1] = "OldYin";
    YaoState[YaoState["YoungYin"] = 0] = "YoungYin";
    YaoState[YaoState["OldMixed"] = 4] = "OldMixed";
    YaoState[YaoState["YoungMixed"] = 5] = "YoungMixed";
    YaoState[YaoState["YangYao"] = 2] = "YangYao";
    YaoState[YaoState["YinYao"] = 0] = "YinYao"; // Alias
})(YaoState || (YaoState = {}));
export var TemporalState;
(function (TemporalState) {
    TemporalState["PAST"] = "PAST";
    TemporalState["PRESENT"] = "PRESENT";
    TemporalState["FUTURE"] = "FUTURE";
})(TemporalState || (TemporalState = {}));
export var EmotionalState;
(function (EmotionalState) {
    EmotionalState["Inspired"] = "INSPIRED";
    EmotionalState["Steady"] = "STEADY";
    EmotionalState["Agitated"] = "AGITATED";
    EmotionalState["Curious"] = "CURIOUS";
    EmotionalState["Quiet"] = "QUIET";
    EmotionalState["Surprised"] = "SURPRISED";
    EmotionalState["Decisive"] = "DECISIVE";
    EmotionalState["Zen"] = "ZEN";
    EmotionalState["Excited"] = "EXCITED";
    EmotionalState["Frustrated"] = "FRUSTRATED";
    EmotionalState["Pensive"] = "PENSIVE";
    EmotionalState["Melancholy"] = "MELANCHOLY";
})(EmotionalState || (EmotionalState = {}));
export var CircuitState;
(function (CircuitState) {
    CircuitState["Closed"] = "CLOSED";
    CircuitState["Open"] = "OPEN";
    CircuitState["HalfOpen"] = "HALF_OPEN";
    CircuitState["Stable"] = "STABLE"; // Legacy/Preferred alias
})(CircuitState || (CircuitState = {}));
export var ModelAbility;
(function (ModelAbility) {
    ModelAbility["Text"] = "text";
    ModelAbility["Vision"] = "vision";
    ModelAbility["Tools"] = "tools";
    ModelAbility["Embed"] = "embed";
})(ModelAbility || (ModelAbility = {}));
export var ModelType;
(function (ModelType) {
    ModelType["Ollama"] = "ollama";
    ModelType["Cloudflare"] = "cloudflare";
    ModelType["OpenRouter"] = "openrouter";
    ModelType["Anthropic"] = "anthropic";
    ModelType["OpenAI"] = "openai";
})(ModelType || (ModelType = {}));
export var YangState;
(function (YangState) {
    YangState["Expansion"] = "EXPANSION";
    YangState["Solidify"] = "SOLIDIFY";
})(YangState || (YangState = {}));
export var YinState;
(function (YinState) {
    YinState["Receiving"] = "RECEIVING";
    YinState["yielding"] = "YIELDING";
})(YinState || (YinState = {}));
export var HealthStatus;
(function (HealthStatus) {
    HealthStatus["Critical"] = "Critical";
    HealthStatus["Degraded"] = "Degraded";
    HealthStatus["Ready"] = "Ready";
    HealthStatus["Offline"] = "Offline";
    HealthStatus["HEALTHY"] = "Ready";
    HealthStatus["UNHEALTHY"] = "Critical";
    HealthStatus["UNKNOWN"] = "Offline";
})(HealthStatus || (HealthStatus = {}));
export var BuildStatus;
(function (BuildStatus) {
    BuildStatus["Failed"] = "Failed";
    BuildStatus["Warning"] = "Warning";
    BuildStatus["Passed"] = "Passed";
    BuildStatus["Unknown"] = "Unknown";
    BuildStatus["PASS"] = "Passed";
    BuildStatus["FAIL"] = "Failed";
    BuildStatus["BUILDING"] = "Warning";
})(BuildStatus || (BuildStatus = {}));
export var ResourcePressure;
(function (ResourcePressure) {
    ResourcePressure["LOW"] = "LOW";
    ResourcePressure["MEDIUM"] = "MEDIUM";
    ResourcePressure["HIGH"] = "HIGH";
    ResourcePressure["CRITICAL"] = "CRITICAL";
})(ResourcePressure || (ResourcePressure = {}));
export var UserEngagement;
(function (UserEngagement) {
    UserEngagement["ACTIVE"] = "ACTIVE";
    UserEngagement["IDLE"] = "IDLE";
    UserEngagement["AWAY"] = "AWAY";
    UserEngagement["UNKNOWN"] = "UNKNOWN";
})(UserEngagement || (UserEngagement = {}));
export var SovereignTaxonomy;
(function (SovereignTaxonomy) {
    SovereignTaxonomy["CLINICAL"] = "CLINICAL";
    SovereignTaxonomy["ORGANIC"] = "ORGANIC";
    SovereignTaxonomy["CHAOTIC"] = "CHAOTIC";
})(SovereignTaxonomy || (SovereignTaxonomy = {}));
export const ok = (value) => ({ ok: true, value });
export const err = (error) => ({ ok: false, error });
export const isOk = (result) => result.ok;
export var CognitiveChoice;
(function (CognitiveChoice) {
    CognitiveChoice["SIMPLE"] = "simple";
    CognitiveChoice["COMPLEX"] = "complex";
    CognitiveChoice["META"] = "meta";
    CognitiveChoice["EXTERNAL"] = "external";
})(CognitiveChoice || (CognitiveChoice = {}));
/**
 * PRODUCTION PREREQUISITES MAP
 * Maps YaoState to strict enforcement rules for the AI Hive Mind.
 */
export const YAO_PRODUCTION_PREREQUISITES = {
    [YaoState.OldYang]: {
        mandateAdversarialAudit: true,
        mandateBuildVerification: true,
        mandateHealthAudit: false,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: true,
        severityThreshold: 70
    },
    [YaoState.YoungYang]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: true,
        mandateHealthAudit: false,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: false,
        severityThreshold: 30
    },
    [YaoState.OldYin]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: false,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: true,
        mandateSovereignAudit: true,
        severityThreshold: 50
    },
    [YaoState.YoungYin]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: false,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: false,
        severityThreshold: 20
    },
    [YaoState.OldMixed]: {
        mandateAdversarialAudit: true,
        mandateBuildVerification: true,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: true,
        mandateSovereignAudit: true,
        severityThreshold: 90
    },
    [YaoState.YoungMixed]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: true,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: true,
        severityThreshold: 10
    }
};
