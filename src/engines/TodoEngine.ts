import pino from 'pino';
import { Renderer } from '../ui/Renderer.js';
import type { Result } from '../core/models.js';
import { SovereignProprioception } from '../utils/SovereignProprioception.js';
import { join } from 'path';
import { homedir } from 'os';

const logger = pino({ name: 'TodoEngine', base: { hostname: 'POG2' } });

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Todo {
    id: string;
    task: string;
    status: TodoStatus;
    rollback?: string;
}

/**
 * TodoEngine â€” Real task management and checklisting substrate.
 * Ported from gemini-cli's write-todos pattern.
 * Allows the brain to maintain a stateful checklist during complex executions.
 */
export class TodoEngine {
    private todos: Todo[] = [];
    private readonly proprioception: SovereignProprioception;

    constructor(private readonly renderer: Renderer) {
        // Clinical path resolution for neurological mapping
        const brainPath = join(process.cwd(), 'brain');
        this.proprioception = new SovereignProprioception(brainPath);
    }

    public update(todos: Todo[]): void {
        this.todos = todos;
        this.renderChecklist();
        this.proprioception.updateTaskList(this.todos);
    }

    public getTodos(): Todo[] {
        return [...this.todos];
    }

    private renderChecklist(): void {
        if (this.todos.length === 0) return;

        this.renderer.info('Sovereign Checklist:');
        for (const todo of this.todos) {
            const icon = this.getStatusIcon(todo.status);
            const label = todo.status === 'in_progress'
                ? `\x1b[1m${todo.task}\x1b[0m`
                : todo.task;
            this.renderer.log(`  ${icon} ${label}`);
        }
    }

    private getStatusIcon(status: TodoStatus): string {
        switch (status) {
            case 'completed': return '\x1b[32m[âœ“]\x1b[0m';
            case 'in_progress': return '\x1b[33m[>]\x1b[0m';
            case 'cancelled': return '\x1b[31m[x]\x1b[0m';
            default: return '[ ]';
        }
    }
}
