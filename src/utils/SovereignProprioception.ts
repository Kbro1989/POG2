import { writeFileSync, appendFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { YaoState } from '../core/models.js';
import { createLogger } from "./logger.js";

const logger = createLogger('SovereignProprioception');

/**
 * SovereignProprioception
 * 
 * Bridges physical state artifacts (MD files in brain/) with the POG2 Orchestrator.
 * This allows the system to maintain its own strategic and reflective memory.
 */
export class SovereignProprioception {
    private readonly brainPath: string;

    constructor(brainPath: string) {
        this.brainPath = brainPath;
    }

    /**
     * getTaskMemory
     * Reads the current task.md to give the Brain a summary of current progress.
     */
    public getTaskMemory(): string {
        const path = join(this.brainPath, 'task.md');
        if (!existsSync(path)) return '';
        try {
            const content = readFileSync(path, 'utf-8');
            // Extract current objectives and recent completions
            return content.substring(0, 1000); // Keep it concise for context injection
        } catch (err) {
            logger.warn({ err }, 'Failed to read task memory');
            return '';
        }
    }

    /**
     * updateTaskList
     * Writes the current todos to task.md in a format compatible with the agentic UI.
     */
    public updateTaskList(todos: Array<{ task: string, status: string }>): void {
        const path = join(this.brainPath, 'task.md');
        let content = '# POG2 Active Task Mirror\n\n## Status\n';

        for (const todo of todos) {
            const marker = todo.status === 'completed' ? '[x]' :
                todo.status === 'in_progress' ? '[/]' : '[ ]';
            content += `- ${marker} ${todo.task}\n`;
        }

        try {
            writeFileSync(path, content, 'utf-8');
            logger.debug('Updated physical task artifact');
        } catch (err) {
            logger.error({ err }, 'Failed to write task artifact');
        }
    }

    /**
     * logReflection
     * Appends a record of action and narrative to walkthrough.md.
     */
    public logReflection(task: string, narrative: string, yaoState: YaoState): void {
        const path = join(this.brainPath, 'walkthrough.md');
        if (!existsSync(path)) {
            writeFileSync(path, '# POG2 Historical Reflection (Walkthrough)\n\n', 'utf-8');
        }

        const stateLabel = YaoState[yaoState] || 'Unknown';
        const entry = `\n### [${new Date().toISOString()}] ${task}\n` +
            `**State**: ${stateLabel}\n\n` +
            `${narrative}\n` +
            `***\n`;

        try {
            appendFileSync(path, entry, 'utf-8');
            logger.debug('Logged physical reflection');
        } catch (err) {
            logger.error({ err }, 'Failed to append reflection');
        }
    }

    public healthCheck(): { online: boolean; details: string } {
        return {
            online: true,
            details: 'SovereignProprioception active: Reflective memory artifacts accessible.'
        };
    }
}
