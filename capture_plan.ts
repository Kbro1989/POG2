import { readFileSync, writeFileSync } from 'fs';
import { ModelClient } from './src/clients/ModelClient.js';
import { TernaryRouter } from './src/routing/TernaryRouter.js';
import { SovereignConfig, loadConfig } from './src/config/SovereignConfig.js';
import { SOVEREIGN_SYSTEM_PROMPT } from './src/prompts/SystemPrompts.js';

(async () => {
    try {
        const config = loadConfig(process.env['POG2_CONFIG'] || 'pog2-config.json');
        const router = new TernaryRouter(config);
        const client = new ModelClient(config, router);
        
        const task = "system health";
        const route = await router.route('Orchestrator', task, task);

        const orchestratorPrompt = `You are Kimi(Brain).
TASK: "${task}"
RULES:
1. Assign SEVERITY(0 - 100).
2. JSON ONLY representing the execution plan.
3. MANDATORY: Assign yState(0 - 3). 0: YoungYin, 1: OldYin, 2: YoungYang, 3: OldYang.
4. ATOMIC MANIFEST: When using todos, each step MUST have a "rollback" string.
5. ONLY select tools from the CAPABILITIES list.
6. BIOLOGICAL MANDATE: Before outputting the JSON plan, you MUST think inside a <reflection>...</reflection> block. 
Example output:
<reflection>
...
</reflection>
{
    "goal": "description",
    "steps": ["step 1"],
    "tool": "check_node_health",
    "reasoning": "strategy",
    "model": "model_id",
    "severity": 10,
    "interaction": "text",
    "yState": 0,
    "parameters": {},
    "todos": []
}`;

        const result = await client.call({
            model: route.model,
            prompt: orchestratorPrompt,
            systemPrompt: SOVEREIGN_SYSTEM_PROMPT,
            temperature: 0.1,
            format: 'text'
        });

        if (result.ok) {
            writeFileSync('test_llm_response.txt', result.value.response);
            console.log('Saved model response to test_llm_response.txt');
        } else {
            console.error('Call failed:', result.error);
        }
    } catch (e) {
        console.error(e);
    }
})();
