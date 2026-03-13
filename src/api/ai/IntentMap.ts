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
            targetCapabilityId: 'qwen2.5-coder:7b',
            keywords: ['lua', 'morrowind', 'mod', 'script'],
            reasoning: 'Qwen is excellent for specialized scripting.'
        }
    ]
};
