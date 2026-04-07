export interface IntentPathway {
    id: string;
    description: string;
    targetCapabilityId: string;
    keywords: string[];
    reasoning: string;
}

export const IntentMap: Record<string, IntentPathway[]> = {
    DEV_OPS: [
        {
            id: 'deployment',
            description: 'Deployment and cloud infrastructure',
            targetCapabilityId: 'gemini-1.5-pro',
            keywords: ['wrangler', 'deploy', 'production', 'cloud'],
            reasoning: 'Cloud tasks require pro-tier reasoning.'
        }
    ],
    MODDING: [
        {
            id: 'lua_scripting',
            description: 'Game modding script generation',
            targetCapabilityId: 'deepseek-r1:8b',
            keywords: ['lua', 'morrowind', 'mod', 'script'],
            reasoning: 'Qwen is excellent for specialized scripting.'
        }
    ],
    HEAL: [
        {
            id: 'build_repair',
            description: 'Auto-repair and debugging',
            targetCapabilityId: 'correction',
            keywords: ['fix', 'repair', 'error', 'stack trace', 'build'],
            reasoning: 'Self-Healer is specialized for terminal diagnostics.'
        }
    ],
    OPTIMIZE: [
        {
            id: 'code_optimization',
            description: 'Performance and refactoring',
            targetCapabilityId: 'optimization',
            keywords: ['optimize', 'refactor', 'performance', 'speed', 'memory'],
            reasoning: 'Optimization Forge focuses on algorithmic efficiency.'
        }
    ],
    SECURE: [
        {
            id: 'security_audit',
            description: 'Security and code quality audit',
            targetCapabilityId: 'security_audit',
            keywords: ['secure', 'audit', 'vulnerability', 'quality', 'lint'],
            reasoning: 'Sovereign Auditor enforces clinical standards.'
        }
    ],
    VISION_SENSORY: [
        {
            id: 'visual_analysis',
            description: 'Visual analysis and sensory capture',
            targetCapabilityId: 'moondream:latest',
            keywords: ['analyze image', 'view screen', 'screenshot', 'color', 'chroma'],
            reasoning: 'Vision Specialist handles sensory proprioception.'
        }
    ],
    RSC_COMMAND: [
        {
            id: 'rsc_gameplay',
            description: 'RSC gameplay and protocol',
            targetCapabilityId: 'rsc_command',
            keywords: ['rsc', 'walk', 'chat', 'login', 'game'],
            reasoning: 'RSC Specialist handles game state interaction.'
        }
    ]
};
