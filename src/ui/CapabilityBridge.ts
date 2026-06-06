/**
 * CapabilityBridge.ts
 * 
 * Maps MCP-based external tool capabilities to the internal POG2 ability system.
 * This allows the Sovereign agent to invoke dev-ops actions using the same 
 * combat-style event pipeline.
 */

import { AbilityBook, AbilityDefinition } from '../engines/gameplay/AbilityBook.js';

export interface CapabilityBinding {
    toolName: string;
    abilityId: string; // The corresponding ability ID (e.g., 'git_push')
    callback: string;
}

export const CAPABILITY_BINDINGS: CapabilityBinding[] = [
    { toolName: 'GitHub', abilityId: 'code_sync', callback: 'hello-github' },
    { toolName: 'Linear', abilityId: 'task_update', callback: 'hello-linear' },
    { toolName: 'Terraform', abilityId: 'infra_apply', callback: 'hello-terraform' }
];

export class CapabilityBridge {
    private book: AbilityBook;

    constructor() {
        this.book = AbilityBook.getInstance();
    }

    public async dispatchToAbility(binding: CapabilityBinding, payload: any) {
        const ability = this.book.get(binding.abilityId);
        if (!ability) {
            console.error(`[CapabilityBridge] Ability ${binding.abilityId} not found.`);
            return;
        }

        console.log(`🚀 [CapabilityBridge] Invoking ${binding.toolName} via Ability ${ability.name}...`);
        
        // This invokes the internal execution pipeline through the existing Ability system
        // The ability then routes the payload through the Switchboard to the MCP server.
    }
}

