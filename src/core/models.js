"use strict";
/**
 * Core type definitions for pog2-sovereign.
 * Aggregator and Domain-Specific Taxonomy.
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENCY_SPIRIT_SHARDS = exports.CURRENCY_CHRONOTES = exports.CURRENCY_COINS = exports.YAO_PRODUCTION_PREREQUISITES = exports.CognitiveChoice = exports.isOk = exports.err = exports.ok = exports.SovereignTaxonomy = exports.UserEngagement = exports.ResourcePressure = exports.BuildStatus = exports.HealthStatus = exports.YinState = exports.YangState = exports.ModelType = exports.ModelAbility = exports.CircuitState = exports.EmotionalState = exports.TemporalState = exports.YaoState = exports.TaskType = exports.SkillId = exports.EquipmentSlot = exports.SubstrateState = exports.LogicalSignature = exports.SovereignDomain = void 0;
var module_1 = require("module");
var require = (0, module_1.createRequire)(import.meta.url);
// HealthReport and ServiceHealthState defined below to resolve broken import
var SovereignDomain_js_1 = require("../types/SovereignDomain.js");
Object.defineProperty(exports, "SovereignDomain", { enumerable: true, get: function () { return SovereignDomain_js_1.SovereignDomain; } });
var LogicalSignature;
(function (LogicalSignature) {
    LogicalSignature["CONSUMABLE_ROLL"] = "CONSUMABLE_ROLL";
    LogicalSignature["LOOT_TABLE_ROLL"] = "LOOT_TABLE_ROLL";
    LogicalSignature["TRANSPORT_ACTUATOR"] = "TRANSPORT_ACTUATOR";
    LogicalSignature["TELEPORT_ACTUATOR"] = "TELEPORT_ACTUATOR";
    LogicalSignature["BANK_DEPOSIT_ACTUATOR"] = "BANK_DEPOSIT_ACTUATOR";
    LogicalSignature["PRACTICE_SKILL_NODE"] = "PRACTICE_SKILL_NODE";
    LogicalSignature["CONSUMABLE_SKILL_STATION"] = "CONSUMABLE_SKILL_STATION";
    LogicalSignature["SPATIAL_SHIFT"] = "SPATIAL_SHIFT";
    LogicalSignature["ENTITY_MANIFEST"] = "ENTITY_MANIFEST";
    LogicalSignature["PRIVILEGE_ELEVATION"] = "PRIVILEGE_ELEVATION";
})(LogicalSignature || (exports.LogicalSignature = LogicalSignature = {}));
var SubstrateState;
(function (SubstrateState) {
    SubstrateState["ONLINE"] = "ONLINE";
    SubstrateState["DEGRADED"] = "DEGRADED";
    SubstrateState["DEGRADED_IO"] = "DEGRADED_IO";
    SubstrateState["OFFLINE"] = "OFFLINE"; // Full substrate reachability failure (abort tick)
})(SubstrateState || (exports.SubstrateState = SubstrateState = {}));
var EquipmentSlot;
(function (EquipmentSlot) {
    EquipmentSlot["HEAD"] = "head";
    EquipmentSlot["CAPE"] = "cape";
    EquipmentSlot["NECK"] = "neck";
    EquipmentSlot["WEAPON"] = "weapon";
    EquipmentSlot["BODY"] = "body";
    EquipmentSlot["SHIELD"] = "shield";
    EquipmentSlot["LEGS"] = "legs";
    EquipmentSlot["HANDS"] = "hands";
    EquipmentSlot["FEET"] = "feet";
    EquipmentSlot["RING"] = "ring";
    EquipmentSlot["AMMO"] = "ammo";
    EquipmentSlot["AURA"] = "aura";
    EquipmentSlot["POCKET"] = "pocket";
})(EquipmentSlot || (exports.EquipmentSlot = EquipmentSlot = {}));
var SkillId;
(function (SkillId) {
    SkillId[SkillId["ATTACK"] = 1] = "ATTACK";
    SkillId[SkillId["STRENGTH"] = 2] = "STRENGTH";
    SkillId[SkillId["RANGED"] = 3] = "RANGED";
    SkillId[SkillId["MAGIC"] = 4] = "MAGIC";
    SkillId[SkillId["DEFENCE"] = 5] = "DEFENCE";
    SkillId[SkillId["CONSTITUTION"] = 6] = "CONSTITUTION";
    SkillId[SkillId["PRAYER"] = 7] = "PRAYER";
    SkillId[SkillId["AGILITY"] = 8] = "AGILITY";
    SkillId[SkillId["HERBLORE"] = 9] = "HERBLORE";
    SkillId[SkillId["THIEVING"] = 10] = "THIEVING";
    SkillId[SkillId["CRAFTING"] = 11] = "CRAFTING";
    SkillId[SkillId["RUNECRAFTING"] = 12] = "RUNECRAFTING";
    SkillId[SkillId["MINING"] = 13] = "MINING";
    SkillId[SkillId["SMITHING"] = 14] = "SMITHING";
    SkillId[SkillId["FISHING"] = 15] = "FISHING";
    SkillId[SkillId["COOKING"] = 16] = "COOKING";
    SkillId[SkillId["FIREMAKING"] = 17] = "FIREMAKING";
    SkillId[SkillId["WOODCUTTING"] = 18] = "WOODCUTTING";
    SkillId[SkillId["FLETCHING"] = 19] = "FLETCHING";
    SkillId[SkillId["SLAYER"] = 20] = "SLAYER";
    SkillId[SkillId["FARMING"] = 21] = "FARMING";
    SkillId[SkillId["CONSTRUCTION"] = 22] = "CONSTRUCTION";
    SkillId[SkillId["HUNTER"] = 23] = "HUNTER";
    SkillId[SkillId["SUMMONING"] = 24] = "SUMMONING";
    SkillId[SkillId["DUNGEONEERING"] = 25] = "DUNGEONEERING";
    SkillId[SkillId["DIVINATION"] = 26] = "DIVINATION";
    SkillId[SkillId["INVENTION"] = 27] = "INVENTION";
    SkillId[SkillId["ARCHAEOLOGY"] = 28] = "ARCHAEOLOGY";
    SkillId[SkillId["NECROMANCY"] = 29] = "NECROMANCY";
    SkillId[SkillId["QUEST_POINT"] = 31] = "QUEST_POINT";
})(SkillId || (exports.SkillId = SkillId = {}));
var TaskType;
(function (TaskType) {
    TaskType["CODE"] = "CODE";
    TaskType["RESEARCH"] = "RESEARCH";
    TaskType["SYSTEM"] = "SYSTEM";
    TaskType["VISION"] = "VISION";
    TaskType["FORGE"] = "FORGE";
    TaskType["SOCIAL"] = "SOCIAL";
    TaskType["MOTOR"] = "MOTOR";
    TaskType["SENSORY"] = "SENSORY";
})(TaskType || (exports.TaskType = TaskType = {}));
var YaoState;
(function (YaoState) {
    YaoState[YaoState["OldYang"] = 3] = "OldYang";
    YaoState[YaoState["YoungYang"] = 2] = "YoungYang";
    YaoState[YaoState["OldYin"] = 1] = "OldYin";
    YaoState[YaoState["YoungYin"] = 0] = "YoungYin";
    YaoState[YaoState["OldMixed"] = 4] = "OldMixed";
    YaoState[YaoState["YoungMixed"] = 5] = "YoungMixed";
    YaoState[YaoState["YangYao"] = 2] = "YangYao";
    YaoState[YaoState["YinYao"] = 0] = "YinYao";
    YaoState[YaoState["SovereignAvatar"] = 6] = "SovereignAvatar";
    YaoState[YaoState["SovereignEngine"] = 7] = "SovereignEngine"; // World Container / Master Tick Heartbeat
})(YaoState || (exports.YaoState = YaoState = {}));
var TemporalState;
(function (TemporalState) {
    TemporalState["PAST"] = "PAST";
    TemporalState["PRESENT"] = "PRESENT";
    TemporalState["FUTURE"] = "FUTURE";
})(TemporalState || (exports.TemporalState = TemporalState = {}));
var EmotionalState;
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
})(EmotionalState || (exports.EmotionalState = EmotionalState = {}));
var CircuitState;
(function (CircuitState) {
    CircuitState["Closed"] = "CLOSED";
    CircuitState["Open"] = "OPEN";
    CircuitState["HalfOpen"] = "HALF_OPEN";
    CircuitState["Stable"] = "STABLE"; // Legacy/Preferred alias
})(CircuitState || (exports.CircuitState = CircuitState = {}));
var ModelAbility;
(function (ModelAbility) {
    ModelAbility["Text"] = "text";
    ModelAbility["Vision"] = "vision";
    ModelAbility["Tools"] = "tools";
    ModelAbility["Embed"] = "embed";
})(ModelAbility || (exports.ModelAbility = ModelAbility = {}));
var ModelType;
(function (ModelType) {
    ModelType["Ollama"] = "ollama";
    ModelType["Cloudflare"] = "cloudflare";
    ModelType["OpenRouter"] = "openrouter";
    ModelType["Anthropic"] = "anthropic";
    ModelType["OpenAI"] = "openai";
})(ModelType || (exports.ModelType = ModelType = {}));
var YangState;
(function (YangState) {
    YangState["Expansion"] = "EXPANSION";
    YangState["Solidify"] = "SOLIDIFY";
})(YangState || (exports.YangState = YangState = {}));
var YinState;
(function (YinState) {
    YinState["Receiving"] = "RECEIVING";
    YinState["yielding"] = "YIELDING";
})(YinState || (exports.YinState = YinState = {}));
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["Critical"] = "Critical";
    HealthStatus["Degraded"] = "Degraded";
    HealthStatus["Ready"] = "Ready";
    HealthStatus["Offline"] = "Offline";
    HealthStatus["HEALTHY"] = "Ready";
    HealthStatus["UNHEALTHY"] = "Critical";
    HealthStatus["UNKNOWN"] = "Offline";
})(HealthStatus || (exports.HealthStatus = HealthStatus = {}));
var BuildStatus;
(function (BuildStatus) {
    BuildStatus["Failed"] = "Failed";
    BuildStatus["Warning"] = "Warning";
    BuildStatus["Passed"] = "Passed";
    BuildStatus["Unknown"] = "Unknown";
    BuildStatus["PASS"] = "Passed";
    BuildStatus["FAIL"] = "Failed";
    BuildStatus["BUILDING"] = "Warning";
})(BuildStatus || (exports.BuildStatus = BuildStatus = {}));
var ResourcePressure;
(function (ResourcePressure) {
    ResourcePressure["LOW"] = "LOW";
    ResourcePressure["MEDIUM"] = "MEDIUM";
    ResourcePressure["HIGH"] = "HIGH";
    ResourcePressure["CRITICAL"] = "CRITICAL";
})(ResourcePressure || (exports.ResourcePressure = ResourcePressure = {}));
var UserEngagement;
(function (UserEngagement) {
    UserEngagement["ACTIVE"] = "ACTIVE";
    UserEngagement["IDLE"] = "IDLE";
    UserEngagement["AWAY"] = "AWAY";
    UserEngagement["UNKNOWN"] = "UNKNOWN";
})(UserEngagement || (exports.UserEngagement = UserEngagement = {}));
var SovereignTaxonomy;
(function (SovereignTaxonomy) {
    SovereignTaxonomy["CLINICAL"] = "CLINICAL";
    SovereignTaxonomy["ORGANIC"] = "ORGANIC";
    SovereignTaxonomy["CHAOTIC"] = "CHAOTIC";
})(SovereignTaxonomy || (exports.SovereignTaxonomy = SovereignTaxonomy = {}));
var ok = function (value) { return ({ ok: true, value: value }); };
exports.ok = ok;
var err = function (error) { return ({ ok: false, error: error }); };
exports.err = err;
var isOk = function (result) { return result.ok; };
exports.isOk = isOk;
var CognitiveChoice;
(function (CognitiveChoice) {
    CognitiveChoice["SIMPLE"] = "simple";
    CognitiveChoice["COMPLEX"] = "complex";
    CognitiveChoice["META"] = "meta";
    CognitiveChoice["EXTERNAL"] = "external";
})(CognitiveChoice || (exports.CognitiveChoice = CognitiveChoice = {}));
/**
 * PRODUCTION PREREQUISITES MAP
 * Maps YaoState to strict enforcement rules for the AI Hive Mind.
 */
exports.YAO_PRODUCTION_PREREQUISITES = (_a = {},
    _a[YaoState.OldYang] = {
        mandateAdversarialAudit: true,
        mandateBuildVerification: true,
        mandateHealthAudit: false,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: true,
        severityThreshold: 70
    },
    _a[YaoState.YoungYang] = {
        mandateAdversarialAudit: false,
        mandateBuildVerification: true,
        mandateHealthAudit: false,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: false,
        severityThreshold: 30
    },
    _a[YaoState.OldYin] = {
        mandateAdversarialAudit: false,
        mandateBuildVerification: false,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: true,
        mandateSovereignAudit: true,
        severityThreshold: 50
    },
    _a[YaoState.YoungYin] = {
        mandateAdversarialAudit: false,
        mandateBuildVerification: false,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: false,
        severityThreshold: 20
    },
    _a[YaoState.OldMixed] = {
        mandateAdversarialAudit: true,
        mandateBuildVerification: true,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: true,
        mandateSovereignAudit: true,
        severityThreshold: 90
    },
    _a[YaoState.YoungMixed] = {
        mandateAdversarialAudit: false,
        mandateBuildVerification: true,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: true,
        severityThreshold: 10
    },
    _a[YaoState.SovereignAvatar] = {
        mandateAdversarialAudit: true,
        mandateBuildVerification: false,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: true,
        mandateSovereignAudit: true,
        severityThreshold: 80
    },
    _a[YaoState.SovereignEngine] = {
        mandateAdversarialAudit: true,
        mandateBuildVerification: true,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: true,
        severityThreshold: 100
    },
    _a);
exports.CURRENCY_COINS = 995;
exports.CURRENCY_CHRONOTES = 49219;
exports.CURRENCY_SPIRIT_SHARDS = 12183;
