"use strict";
/**
 * SovereignDomain â€” Execution authority boundaries.
 * Every tool, model, and memory access must be scoped to a domain.
 * Cross-domain execution is a HARD ERROR. No silent fallback.
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMAIN_ADJACENCY = exports.TOOL_DOMAIN_MAP = exports.SovereignDomain = void 0;
exports.classifyDomain = classifyDomain;
exports.isToolInDomain = isToolInDomain;
var SovereignDomain;
(function (SovereignDomain) {
    /** Code generation, editing, smart-edit, refactoring */
    SovereignDomain["CODE"] = "CODE";
    /** Shell commands, git, wrangler, npm, scaffold, deployment */
    SovereignDomain["SYSTEM"] = "SYSTEM";
    /** SovereignEye, Chromanumber, screen capture, image analysis */
    SovereignDomain["VISION"] = "VISION";
    /** Web search, URL fetching, documentation lookup */
    SovereignDomain["RESEARCH"] = "RESEARCH";
    /** SQL forge, docs forge, refactor forge â€” specialized AI sub-agents */
    SovereignDomain["FORGE"] = "FORGE";
    /** DASHBOARD, status, read-only observation â€” CANNOT mutate state */
    SovereignDomain["OBSERVE"] = "OBSERVE";
    /** Gameplay, chat, NPC interaction */
    SovereignDomain["SOCIAL"] = "SOCIAL";
    /** MOTOR: Generative output, code application, and renderer operations */
    SovereignDomain["MOTOR"] = "MOTOR";
    /** SENSORY: External probes, monitoring, vision, and shell interaction */
    SovereignDomain["SENSORY"] = "SENSORY";
})(SovereignDomain || (exports.SovereignDomain = SovereignDomain = {}));
/**
 * Static mapping of tool names to their allowed domains.
 * This is the single source of truth for tool-domain membership.
 */
exports.TOOL_DOMAIN_MAP = {
    // CODE domain
    'generate_code': SovereignDomain.CODE,
    'edit_code': SovereignDomain.CODE,
    'smart_edit': SovereignDomain.CODE,
    // SYSTEM domain
    'shell_command': SovereignDomain.SYSTEM,
    'wrangler': SovereignDomain.SYSTEM,
    'git_status': SovereignDomain.SYSTEM,
    // VISION domain
    'soverign_eye': SovereignDomain.VISION,
    'sensory_capture': SovereignDomain.VISION,
    // RESEARCH domain
    'web_search': SovereignDomain.RESEARCH,
    'fetch_url': SovereignDomain.RESEARCH,
    // FORGE domain
    'sql_forge': SovereignDomain.FORGE,
    'docs_forge': SovereignDomain.FORGE,
    'refactor_forge': SovereignDomain.FORGE,
    // MOTOR domain
    'soundtrack_generate': SovereignDomain.MOTOR,
    // VISION domain
    'image_generate': SovereignDomain.VISION,
    // OBSERVE domain
    'model_train': SovereignDomain.OBSERVE,
    'diagnostic_nexus': SovereignDomain.OBSERVE,
    'check_node_health': SovereignDomain.OBSERVE,
};
/**
 * Domain adjacency matrix â€” defines which domains are allowed to co-execute.
 * A task locked to CODE can also invoke RESEARCH tools (for documentation lookup).
 * But CODE cannot invoke SYSTEM tools (no shell access during code generation).
 */
exports.DOMAIN_ADJACENCY = (_a = {},
    _a[SovereignDomain.CODE] = new Set([SovereignDomain.CODE, SovereignDomain.RESEARCH, SovereignDomain.FORGE]),
    _a[SovereignDomain.SYSTEM] = new Set([SovereignDomain.SYSTEM, SovereignDomain.OBSERVE]),
    _a[SovereignDomain.VISION] = new Set([SovereignDomain.VISION, SovereignDomain.OBSERVE]),
    _a[SovereignDomain.RESEARCH] = new Set([SovereignDomain.RESEARCH, SovereignDomain.OBSERVE]),
    _a[SovereignDomain.FORGE] = new Set([SovereignDomain.FORGE, SovereignDomain.CODE, SovereignDomain.RESEARCH]),
    _a[SovereignDomain.SOCIAL] = new Set([SovereignDomain.SOCIAL, SovereignDomain.OBSERVE, SovereignDomain.VISION]),
    _a[SovereignDomain.OBSERVE] = new Set([SovereignDomain.OBSERVE]),
    _a[SovereignDomain.MOTOR] = new Set([SovereignDomain.MOTOR, SovereignDomain.OBSERVE]),
    _a[SovereignDomain.SENSORY] = new Set([SovereignDomain.SENSORY, SovereignDomain.OBSERVE, SovereignDomain.SYSTEM]),
    _a);
/**
 * Keyword patterns for classifying user intent into a domain.
 * Evaluated in priority order (first match wins).
 */
var DOMAIN_PATTERNS = [
    { domain: SovereignDomain.SOCIAL, pattern: /\b(hello|hi|hey|how|what|why|who|help|discuss|converse|chat|talk)\b/i },
    { domain: SovereignDomain.VISION, pattern: /\b(screenshot|screen|look at|see|image|capture|pixel|color map|hex code|chromanumber|view screen|full screen)\b/i },
    { domain: SovereignDomain.SYSTEM, pattern: /\b(git|commit|push|pull|deploy|wrangler|shell|npm|install|scaffold|build|run|execute command|powershell|terminal|process|service)\b/i },
    { domain: SovereignDomain.FORGE, pattern: /\b(sql|migration|database|schema|docs forge|documentation forge|refactor forge|architectural cleanup)\b/i },
    { domain: SovereignDomain.RESEARCH, pattern: /\b(search|google|find online|look up|fetch url|web|browse|documentation|api reference)\b/i },
    { domain: SovereignDomain.CODE, pattern: /\b(code|generate|create|implement|write|edit|fix|refactor|function|class|interface|module|file|component|readme|typescript|javascript)\b/i },
    { domain: SovereignDomain.OBSERVE, pattern: /\b(status|health|monitor|dashboard|observe|check|inspect|list|show|train|absorb|learn)\b/i },
    { domain: SovereignDomain.MOTOR, pattern: /\b(soundtrack|score|music|compose|audio|generate audio)\b/i },
];
/**
 * Classify a user intent string into a SovereignDomain.
 * Returns CODE as the default fallback â€” code generation is the most common task.
 */
function classifyDomain(intent) {
    for (var _i = 0, DOMAIN_PATTERNS_1 = DOMAIN_PATTERNS; _i < DOMAIN_PATTERNS_1.length; _i++) {
        var _a = DOMAIN_PATTERNS_1[_i], domain = _a.domain, pattern = _a.pattern;
        if (pattern.test(intent)) {
            return domain;
        }
    }
    // Default fallback to conversation instead of aggressive code execution
    return SovereignDomain.SOCIAL;
}
/**
 * Check if a tool is allowed in a given domain (including adjacency).
 */
function isToolInDomain(toolName, activeDomain) {
    var toolDomain = exports.TOOL_DOMAIN_MAP[toolName];
    if (!toolDomain)
        return false; // Unknown tools are blocked
    var allowed = exports.DOMAIN_ADJACENCY[activeDomain];
    return allowed.has(toolDomain);
}
