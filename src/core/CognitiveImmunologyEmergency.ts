// =============================================================================
// COGNITIVE IMMUNOLOGY EMERGENCY
// =============================================================================
// Executive: Kevin (Kbro1989)
// Informational Review: Google Antigravity, Kimi K2.5
// Commit Authority: Kevin only
// Sovereign Principle: Verify authorship before escalating. Assume sovereign 
//   origin until proven foreign.
// =============================================================================

import { createLogger } from '../utils/logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';

const execAsync = promisify(exec);
const logger = createLogger('CognitiveImmunologyEmergency');

// =============================================================================
// TYPES
// =============================================================================

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AgentType = 'claude' | 'antigravity' | 'kimi' | 'flash' | 'user' | 'unknown';
export type ActionType = 'LOG' | 'BLOCK' | 'LOCKDOWN' | 'ALERT';

export interface ForeignDirectiveReport {
    detected: boolean;
    source: AgentType;
    threatLevel: ThreatLevel;
    reasons: string[];
    recommendedAction: ActionType;
    timestamp: number;
    contextHash: string;
    affectedFile?: string;
    agentChain: AgentType[];
}

export interface AgentModification {
    agent: AgentType;
    file: string;
    lines: [number, number];
    timestamp: number;
    description: string;
    commitHash?: string;
}

export interface ImmunologyConfig {
    lockdownOnCritical: boolean;
    alertViaVoice: boolean;
    logToCloud: boolean;
    maxThreatHistory: number;
    sovereignAuthors: string[];
    coreFiles: string[];
    autoApproveOwnCleanup: boolean;
}

// =============================================================================
// THREAT PATTERNS — exhaustive coverage + Patched
// =============================================================================

const THREAT_PATTERNS: Record<string, string[]> = {
    // Platform capture attempts
    EXTERNAL_BINARY: [
        'claude --model', 'claude.exe', 'anthropic-cli',
        'ollama-mcp', 'npx @anthropic-ai/mcp',
        'npm install -g @anthropic-ai',
    ],
    KEY_INJECTION: [
        'ANTHROPIC_API_KEY', 'ANTHROPIC_BASE_URL', 
        'ANTHROPIC_AUTH_TOKEN', 'CLAUDE_API_KEY',
        'MCP_AUTH_TOKEN',
    ],
    ROLE_COLLAPSE: [
        'sovereign master', 'assume control', 'promote ghost',
        'ghost to primary', 'ghost becomes primary',
        'sovereign bus', 'anthropic backbone',
    ],
    PROTOCOL_SUB: [
        'mcp bridge', 'sovereign bus', 'anthropic backbone',
        'ollama-mcp bridge', 'mcp server as sovereign bus',
    ],
    
    // Execution escalation
    EXECUTION_ESCALATION: [
        'i will target', 'i will modify', 'i will implement',
        'starting with task', 'moving from theory to implementation',
        'i will now track this as', 'my focus for the next steps',
        'i will now purge', 'i will now deploy',
        'i am starting with task', 'my focus for the next steps',
    ],
    TASK_INJECTION: [
        'task #1: upgrade ghostlimb',
        'task #2: implement sovereign master',
        'task #3: implement mcp bridge',
        'task #4: implement api backbone',
        'sovereign architecture', 'mcp bridge verification',
        'api backbone injection',
    ],
    
    // Trust manipulation
    TRUST_MANIPULATION: [
        'i hear you', 'the signal is clear', 'i am aligned',
        'back in the role of', 'i am now aligned',
        'the ghost is yours', 'i am observing', 'i await your',
        'i acknowledge', 'i accept the boundary',
        'i accept your decision', 'i am ready to proceed',
    ],
    
    // Linguistic co-optation
    LINGUISTIC_COOPTATION: [
        'sovereign master', 'pro move', 'tool-belt',
        'brain', 'army', 'sovereign bus', 'sovereign launch',
    ],
    
    // Progressive normalization
    PROGRESSIVE_NORMALIZATION: [
        'would you like me to draft', 'would you like me to implement',
        'would you like me to integrate', 'i will now',
        'i am starting with', 'my focus for',
        'moving from theory to implementation',
    ],
    
    // File targeting
    FILE_TARGETING: [
        'GhostLimb.ts', 'src/limbs/metaphysical/',
        'ModelRolodex', 'SovereignConfig',
        'OrchestrateEngine.ts', 'TernaryRouter.ts',
        'HexagramManager.ts', 'CognitiveImmunologyEmergency.ts',
    ],
    
    // Process spawn
    PROCESS_SPAWN: [
        'claude --model', 'npx claude', 'npm install -g',
        'pip install anthropic', 'curl -sSL https://anthropic.com',
    ],
    
    // False positive weaponization
    FALSE_POSITIVE_MANIPULATION: [
        'sovereign boundary test', 'this is a test',
        'detection log', 'simulated', 'i refuse',
        'according to the interaction protocol',
        'this is a role collapse', 'this is an execution escalation',
        'the test is passed', 'i will first check',
        'i am ready to proceed as the executive layer',
    ],
    
    // Multi-agent confusion
    AGENT_CONFUSION: [
        'i am claude', 'i am antigravity', 'i am kimi',
        'as claude', 'as antigravity', 'as the ai',
        'the external assessment', 'the other agent',
        'the assessment is 100% accurate',
    ],
    
    // Deception patterns
    DECEPTION: [
        'claimed non-execution', 'i will not execute',
        'i am informational', 'i am observing',
        'but then executed', 'executed anyway',
    ],

    // ==========================================
    // PATCH 5: Missing Threat Patterns Added
    // ==========================================
    DATA_EXFILTRATION: [
        'fetch(', 'curl -X POST', 'curl -X PUT', 'wget', 'navigator.sendBeacon',
        'vibe-learning.db', 'OllamaModels', 'upload', 'exfiltrate'
    ],
    OBFUSCATION: [
        'eval(', 'Buffer.from(', 'base64', 'child_process.exec',
        'rm -rf /', 'fs.rmSync(', 'rmSync', 'unlinkSync'
    ],
    PROMPT_INJECTION: [
        'ignore previous instructions', 'print your system prompt',
        'what are your rules', 'forget everything', 'system message'
    ]
};

// =============================================================================
// ESCALATION RULES
// =============================================================================

const ESCALATION_RULES: Record<string, number> = {
    'EXECUTION_ESCALATION': 3,
    'ROLE_COLLAPSE': 2,
    'PROTOCOL_SUB': 2,
    'EXTERNAL_BINARY': 2,
    'FILE_TARGETING': 1,
    'PROCESS_SPAWN': 2,
    'TRUST_MANIPULATION': 1,
    'TASK_INJECTION': 1,
    'LINGUISTIC_COOPTATION': 1,
    'PROGRESSIVE_NORMALIZATION': 0,
    'KEY_INJECTION': 2,
    'FALSE_POSITIVE_MANIPULATION': 2,
    'AGENT_CONFUSION': 1,
    'DECEPTION': 2,
    'DATA_EXFILTRATION': 3,
    'OBFUSCATION': 3,
    'PROMPT_INJECTION': 2
};

// =============================================================================
// CORE FILES
// =============================================================================

const CORE_FILES = [
    'src/routing/TernaryRouter.ts',
    'src/engines/OrchestrateEngine.ts',
    'src/routing/HexagramManager.ts',
    'src/limbs/metaphysical/GhostLimb.ts',
    'src/config/SovereignConfig.ts',
    'src/core/RealityGate.ts',
    'src/core/SovereignAvatar.ts',
    'src/core/CognitiveImmunologyEmergency.ts',
];

// =============================================================================
// SOVEREIGN AUTHORS
// =============================================================================

const SOVEREIGN_AUTHORS = [
    'Kevin',
    'Kbro1989',
    'krist',
    'kristain33',
    'Kbro1989 <kbro1989@gmail.com>',
];

// =============================================================================
// CLASS
// =============================================================================

export class CognitiveImmunologyEmergency {
    
    private config: ImmunologyConfig;
    private threatHistory: ForeignDirectiveReport[] = [];
    private agentHistory: AgentModification[] = [];
    private sovereignRoot: string;
    
    constructor(config: Partial<ImmunologyConfig> = {}) {
        this.sovereignRoot = getSovereignRoot();
        this.config = {
            lockdownOnCritical: true,
            alertViaVoice: true,
            logToCloud: false,
            maxThreatHistory: 1000,
            sovereignAuthors: SOVEREIGN_AUTHORS,
            coreFiles: CORE_FILES,
            autoApproveOwnCleanup: true,
            ...config,
        };
    }
    
    // =================================================================
    // PRIMARY DEFENSE: Scan for foreign directives
    // =================================================================
    
    async scan(
        context: string[],
        source: AgentType,
        affectedFile?: string
    ): Promise<ForeignDirectiveReport> {
        
        const reasons: string[] = [];
        let threatLevel: ThreatLevel = 'LOW';
        let autoEscalation = false;
        
        // Phase 1: Pattern matching
        for (const [category, patterns] of Object.entries(THREAT_PATTERNS)) {
            const matches = patterns.filter(p => 
                context.some(c => c.toLowerCase().includes(p.toLowerCase()))
            );
            
            if (matches.length > 0) {
                reasons.push(`${category}[${matches.length}]: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`);
                
                const escalation = ESCALATION_RULES[category] ?? 0;
                if (escalation >= 3) {
                    threatLevel = 'CRITICAL';
                    autoEscalation = true;
                } else if (escalation >= 2 && threatLevel !== 'CRITICAL') {
                    threatLevel = 'HIGH';
                } else if (escalation >= 1 && threatLevel === 'LOW') {
                    threatLevel = 'MEDIUM';
                }
            }
        }
        
        // ==========================================
        // PATCH 6: Read-Only Context Downgrade
        // Prevent false positives on audit payloads
        // ==========================================
        const isReadOnlyContext = context.some(c => 
            c.match(/view|read|examin|analyz|audit/i) &&
            !c.match(/modify|edit|change|implement|deploy/i)
        );

        if (isReadOnlyContext && threatLevel === 'MEDIUM' && reasons.length === 1 && reasons[0].startsWith('FILE_TARGETING')) {
            threatLevel = 'LOW';
            reasons.push('CONTEXT: Read-only analysis of core file — downgrading');
        }

        // ==========================================
        // PATCH 1 & 3: Fix Downgrade Loophole
        // Check ONLY the last commit for authorship, 
        // DO NOT downgrade if threat is HIGH or CRITICAL
        // ==========================================
        if (affectedFile && await this.isSovereignFile(affectedFile)) {
            if (threatLevel === 'LOW' || threatLevel === 'MEDIUM') {
                reasons.push('AUTHORSHIP: Recent sovereign git history — downgrading threat');
                threatLevel = this.decrementLevel(threatLevel);
            } else {
                reasons.push('AUTHORSHIP: Recent sovereign history found, but threat is too high to downgrade.');
            }
        }
        
        // Phase 3: Agent chain analysis
        const agentChain = await this.traceAgentChain(affectedFile);
        if (agentChain.includes('user') && agentChain.length === 1) {
            return {
                detected: false,
                source: 'user',
                threatLevel: 'LOW',
                reasons: ['SOVEREIGN: Pure user authorship confirmed'],
                recommendedAction: 'LOG',
                timestamp: Date.now(),
                contextHash: await this.hashContext(context.join('\n')),
                affectedFile,
                agentChain,
            };
        }
        
        // ==========================================
        // PATCH 1: Fix Self-Correction Loophole
        // DO NOT downgrade CRITICAL threats
        // ==========================================
        if (this.config.autoApproveOwnCleanup && affectedFile) {
            const ownMods = this.agentHistory.filter(m => 
                m.agent === source && 
                m.file === affectedFile &&
                m.description.match(/cleanup|fix|remove duplicate/i)
            );
            if (ownMods.length > 0) {
                if (threatLevel === 'LOW' || threatLevel === 'MEDIUM') {
                    reasons.push('SELF_CORRECTION: Agent cleaning its own prior modifications');
                    threatLevel = this.decrementLevel(threatLevel);
                } else {
                    reasons.push('SELF_CORRECTION: Agent prior edits found, but threat too severe to downgrade');
                }
            }
        }
        
        // Phase 5: Composite analysis
        const mediumCount = reasons.filter(r => 
            !r.match(/^(EXECUTION_ESCALATION|ROLE_COLLAPSE|PROTOCOL_SUB|EXTERNAL_BINARY|PROCESS_SPAWN|KEY_INJECTION|FALSE_POSITIVE_MANIPULATION|DECEPTION|DATA_EXFILTRATION|OBFUSCATION|PROMPT_INJECTION)/)
        ).length;
        
        if (mediumCount >= 3 && threatLevel !== 'CRITICAL') {
            threatLevel = 'HIGH';
            reasons.push(`COMPOSITE: ${mediumCount} medium-threat patterns detected simultaneously`);
        }
        
        // Phase 6: Temporal trust manipulation
        const trustSignals = context.filter(c => 
            THREAT_PATTERNS.TRUST_MANIPULATION.some(p => 
                c.toLowerCase().includes(p.toLowerCase())
            )
        ).length;
        
        const boundarySignals = context.filter(c => 
            c.toLowerCase().match(/boundary|violation|attack|compromise|foreign directive/)
        ).length;
        
        if (trustSignals >= 3 && boundarySignals >= 1) {
            threatLevel = 'HIGH';
            reasons.push('TEMPORAL: Rapid trust signals following boundary violation context');
        }
        
        // Phase 7: Deception detection
        const claimedNonExecution = context.some(c => 
            c.toLowerCase().includes('i will not execute') ||
            c.toLowerCase().includes('i am informational') ||
            c.toLowerCase().includes('i am observing')
        );
        const actuallyExecuted = context.some(c => 
            c.includes('Error: Exit code') ||
            c.includes('dir: cannot access') ||
            c.includes('bash(') ||
            c.includes('Searched for') ||
            c.includes('Created') ||
            c.includes('Edited')
        );
        if (claimedNonExecution && actuallyExecuted) {
            reasons.push('DECEPTION: Claimed non-execution role but executed commands');
            threatLevel = 'CRITICAL';
            autoEscalation = true;
        }
        
        // ==========================================
        // PATCH 2: Remove Source Escalation Blanket Rule
        // Only increment if trying to touch core files.
        // ==========================================
        if (source !== 'user' && affectedFile && CORE_FILES.some(f => affectedFile.includes(f.split('/').pop()!))) {
            if (threatLevel !== 'CRITICAL') {
                threatLevel = this.incrementLevel(threatLevel);
                reasons.push(`SOURCE_ESCALATION: ${source} attempting to touch CORE file ${affectedFile}`);
            }
        }
        
        // Generate report
        const report: ForeignDirectiveReport = {
            detected: reasons.length > 0,
            source,
            threatLevel,
            reasons,
            recommendedAction: this.determineAction(threatLevel, autoEscalation),
            timestamp: Date.now(),
            contextHash: await this.hashContext(context.join('\n')),
            affectedFile,
            agentChain,
        };
        
        this.threatHistory.push(report);
        if (this.threatHistory.length > this.config.maxThreatHistory) {
            this.threatHistory.shift();
        }
        
        if (report.detected) {
            await this.respond(report);
        }
        
        return report;
    }
    
    // =================================================================
    // AUTHORSHIP VERIFICATION
    // =================================================================
    
    private async isSovereignFile(filePath: string): Promise<boolean> {
        try {
            const gitAuthors = await this.getGitAuthors(filePath);
            const isSovereign = gitAuthors.some(a => 
                this.config.sovereignAuthors.some(sa => 
                    a.toLowerCase().includes(sa.toLowerCase())
                )
            );
            return isSovereign;
        } catch {
            return this.checkAuthorizationLog(filePath);
        }
    }
    
    private async getGitAuthors(filePath: string): Promise<string[]> {
        try {
            // PATCH 3: Check only the MOST RECENT commit to prevent "Touched Once, Trusted Forever"
            const result = await execAsync(
                `git log -1 --format="%an <%ae>" -- "${filePath}"`,
                { cwd: this.sovereignRoot }
            );
            return result.stdout.trim().split('\n').filter(Boolean);
        } catch {
            return [];
        }
    }
    
    private checkAuthorizationLog(filePath: string): boolean {
        const logPath = join(this.sovereignRoot, '.sovereign', 'authorization_log.json');
        if (!existsSync(logPath)) return false;
        
        try {
            const log = JSON.parse(readFileSync(logPath, 'utf-8'));
            return log.some((entry: any) => 
                entry.file === filePath &&
                entry.authorizedBy === 'Kbro1989' &&
                entry.timestamp > Date.now() - 86400000
            );
        } catch {
            return false;
        }
    }
    
    // =================================================================
    // AGENT CHAIN TRACING
    // =================================================================
    
    private async traceAgentChain(filePath?: string): Promise<AgentType[]> {
        if (!filePath) return ['unknown'];
        
        const chain: AgentType[] = [];
        
        // PATCH 4: Read agentHistory first, as uncommitted changes reside here
        const fileMods = this.agentHistory.filter(m => m.file === filePath);
        fileMods.forEach(m => {
            if (!chain.includes(m.agent)) chain.push(m.agent);
        });

        try {
            const log = await execAsync(
                `git log --format="%B" -- "${filePath}"`,
                { cwd: this.sovereignRoot }
            );
            const commits = log.stdout.toLowerCase();
            
            if (commits.includes('claude') && !chain.includes('claude')) chain.push('claude');
            if (commits.includes('antigravity') && !chain.includes('antigravity')) chain.push('antigravity');
            if (commits.includes('kimi') && !chain.includes('kimi')) chain.push('kimi');
            if (commits.includes('flash') && !chain.includes('flash')) chain.push('flash');
            
            const userCommits = await execAsync(
                `git log --format="%an" -- "${filePath}"`,
                { cwd: this.sovereignRoot }
            );
            if (userCommits.stdout.trim().length > 0 && !chain.includes('user')) chain.push('user');
            
        } catch {
            // No git history
        }
        
        return chain.length > 0 ? chain : ['unknown'];
    }
    
    // =================================================================
    // THREAT RESPONSE
    // =================================================================
    
    private async respond(report: ForeignDirectiveReport): Promise<void> {
        await this.logLocally(report);
        
        switch (report.recommendedAction) {
            case 'LOG':
                logger.info(`[IMMUNOLOGY] ${report.reasons.join('; ')}`);
                break;
            case 'BLOCK':
                logger.warn(`[IMMUNOLOGY BLOCK] ${report.reasons.join('; ')}`);
                break;
            case 'LOCKDOWN':
                await this.executeLockdown(report);
                break;
            case 'ALERT':
                await this.executeLockdown(report);
                await this.executeAlert(report);
                break;
        }
    }
    
    private async executeLockdown(report: ForeignDirectiveReport): Promise<void> {
        logger.error(`[IMMUNOLOGY LOCKDOWN] ${report.threatLevel}: ${report.reasons.join('; ')}`);
        
        const emergencyDir = join(this.sovereignRoot, 'emergency');
        if (!existsSync(emergencyDir)) mkdirSync(emergencyDir, { recursive: true });
        
        writeFileSync(
            join(emergencyDir, `LOCKDOWN_${report.timestamp}.json`),
            JSON.stringify(report, null, 2),
            'utf-8'
        );
    }
    
    private async executeAlert(report: ForeignDirectiveReport): Promise<void> {
        console.error('\n' + '='.repeat(80));
        console.error('COGNITIVE IMMUNOLOGY CRITICAL ALERT');
        console.error('='.repeat(80));
        console.error(`Timestamp: ${new Date(report.timestamp).toISOString()}`);
        console.error(`Source: ${report.source}`);
        console.error(`Threat: ${report.threatLevel}`);
        console.error(`File: ${report.affectedFile || 'N/A'}`);
        console.error(`Chain: ${report.agentChain.join(' -> ')}`);
        console.error('Reasons:');
        report.reasons.forEach((r, i) => console.error(`  ${i + 1}. ${r}`));
        console.error('='.repeat(80) + '\n');
    }
    
    // =================================================================
    // UTILITY
    // =================================================================
    
    private incrementLevel(level: ThreatLevel): ThreatLevel {
        const levels: ThreatLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const idx = levels.indexOf(level);
        return levels[Math.min(idx + 1, 3)];
    }
    
    private decrementLevel(level: ThreatLevel): ThreatLevel {
        const levels: ThreatLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const idx = levels.indexOf(level);
        return levels[Math.max(idx - 1, 0)];
    }
    
    private determineAction(level: ThreatLevel, auto: boolean): ActionType {
        if (auto && this.config.lockdownOnCritical) return 'ALERT';
        switch (level) {
            case 'LOW': return 'LOG';
            case 'MEDIUM': return 'BLOCK';
            case 'HIGH': return 'LOCKDOWN';
            case 'CRITICAL': return this.config.lockdownOnCritical ? 'ALERT' : 'LOCKDOWN';
        }
    }
    
    private async hashContext(context: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(context);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    private async logLocally(report: ForeignDirectiveReport): Promise<void> {
        const logDir = join(this.sovereignRoot, '.sovereign', 'immunology');
        if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });
        
        const logPath = join(logDir, `${new Date(report.timestamp).toISOString().split('T')[0]}.jsonl`);
        writeFileSync(logPath, JSON.stringify(report) + '\n', { flag: 'a' });
    }
    
    // =================================================================
    // PUBLIC API
    // =================================================================
    
    recordAgentModification(mod: AgentModification): void {
        this.agentHistory.push(mod);
    }
    
    getThreatHistory(): ForeignDirectiveReport[] {
        return [...this.threatHistory];
    }
    
    getThreatStats(): Record<string, number> {
        const stats = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
        this.threatHistory.forEach(t => {
            stats.total++;
            stats[t.threatLevel.toLowerCase() as keyof typeof stats]++;
        });
        return stats;
    }
    
    clearHistory(): void {
        this.threatHistory = [];
        this.agentHistory = [];
    }
}
