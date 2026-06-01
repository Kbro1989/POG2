import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { type Result, type EngineOutput, YaoState } from '../core/models.js';
import type { Renderer } from '../ui/Renderer.js';
import { createLogger } from "../utils/logger.js";

const execAsync = promisify(exec);
const logger = createLogger('VSCodeEngine');

export interface VSCodeParams {
    action: 'open' | 'edit' | 'read' | 'write' | 'command' | 'getWorkspace' | 'setPosition';
    filePath?: string;
    content?: string;
    command?: string;
    line?: number;
    column?: number;
    language?: string;
}

export interface WorkspaceState {
    workspaceFolders: string[];
    activeEditor?: {
        filePath: string;
        language: string;
        lineCount: number;
        cursorLine: number;
        cursorColumn: number;
        selection?: string;
    };
    openFiles: string[];
    [key: string]: unknown; // Allow additional properties for Record compatibility
}

/**
 * VSCodeEngine — Sovereign integration with VS Code editor
 * Provides Kimi with direct access to edit, read, and navigate code
 * Integrated with TernaryRouter for metabolic context in the IDE.
 */
export class VSCodeEngine {
    constructor(
        private readonly renderer: Renderer,
        private readonly router?: TernaryRouter
    ) { }

    async execute(params: VSCodeParams): Promise<Result<EngineOutput>> {
        switch (params.action) {
            case 'open':
                return this.openFile(params.filePath!);
            case 'read':
                return this.readFile(params.filePath!);
            case 'write':
                return this.writeFile(params.filePath!, params.content!, params.language);
            case 'edit':
                return this.editFile(params.filePath!, params.content!, params.line, params.column);
            case 'command':
                return this.runVSCodeCommand(params.command!);
            case 'getWorkspace':
                return this.getWorkspaceState();
            case 'setPosition':
                return this.setCursorPosition(params.filePath!, params.line!, params.column!);
            default:
                const action: string = params.action;
                return { ok: false, error: new Error(`Unknown VS Code action: ${action}`) };
        }
    }

    private async openFile(filePath: string): Promise<Result<EngineOutput>> {
        try {
            // Try to open in existing VS Code window
            await execAsync(`code --reuse-window "${filePath}"`);
            return {
                ok: true,
                value: {
                    output: `Opened ${filePath} in VS Code`,
                    data: { filePath, action: 'open' }
                }
            };
        } catch (error) {
            return { ok: false, error: new Error(`Failed to open file: ${error}`) };
        }
    }

    private async readFile(filePath: string): Promise<Result<EngineOutput>> {
        try {
            if (!existsSync(filePath)) {
                return { ok: false, error: new Error(`File not found: ${filePath}`) };
            }

            const content = readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            return {
                ok: true,
                value: {
                    output: content,
                    data: {
                        filePath,
                        lineCount: lines.length,
                        content
                    }
                }
            };
        } catch (error) {
            return { ok: false, error: new Error(`Failed to read file: ${error}`) };
        }
    }

    private async writeFile(
        filePath: string,
        content: string,
        language?: string
    ): Promise<Result<EngineOutput>> {
        try {
            writeFileSync(filePath, content, 'utf8');

            // Open the file after writing
            await this.openFile(filePath);

            return {
                ok: true,
                value: {
                    output: `Wrote ${content.length} chars to ${filePath}`,
                    data: { filePath, language, charCount: content.length }
                }
            };
        } catch (error) {
            return { ok: false, error: new Error(`Failed to write file: ${error}`) };
        }
    }

    private async editFile(
        filePath: string,
        newContent: string,
        line?: number,
        column?: number
    ): Promise<Result<EngineOutput>> {
        try {
            // If line/column specified, insert at position
            if (line !== undefined && existsSync(filePath)) {
                const existing = readFileSync(filePath, 'utf8');
                const lines = existing.split('\n');

                if (line < lines.length) {
                    const targetLine = lines[line] ?? '';
                    const col = column ?? targetLine.length;
                    lines[line] = targetLine.slice(0, col) + newContent + targetLine.slice(col);
                    writeFileSync(filePath, lines.join('\n'), 'utf8');
                } else {
                    // Append if beyond current lines
                    lines.push(newContent);
                    writeFileSync(filePath, lines.join('\n'), 'utf8');
                }
            } else {
                // Replace entire file
                writeFileSync(filePath, newContent, 'utf8');
            }

            return {
                ok: true,
                value: {
                    output: `Edited ${filePath}`,
                    data: { filePath, line, column }
                }
            };
        } catch (error) {
            return { ok: false, error: new Error(`Failed to edit file: ${error}`) };
        }
    }

    private async runVSCodeCommand(command: string): Promise<Result<EngineOutput>> {
        try {
            // Execute VS Code CLI command
            const { stdout, stderr } = await execAsync(`code ${command}`);

            return {
                ok: true,
                value: {
                    output: stdout || stderr || 'Command executed',
                    data: { command, stdout, stderr }
                }
            };
        } catch (error) {
            return { ok: false, error: new Error(`VS Code command failed: ${error}`) };
        }
    }

    private async getWorkspaceState(): Promise<Result<EngineOutput>> {
        try {
            // Try to get workspace info from current directory
            const { stdout: cwd } = await execAsync('cd');
            const currentDir = cwd.trim();

            // Check for .vscode folder or common project files
            const workspaceFolders = [currentDir];

            const state: WorkspaceState = {
                workspaceFolders,
                openFiles: [],
                activeEditor: undefined
            };

            // Try to detect active file from git or recent files
            try {
                const { stdout: gitFiles } = await execAsync('git diff --name-only 2>nul || echo ""');
                if (gitFiles.trim()) {
                    state.openFiles = gitFiles.split('\n').filter(f => f.trim());
                }
            } catch {
                // Git not available
            }

            return {
                ok: true,
                value: {
                    output: `Workspace: ${currentDir}\nFiles: ${state.openFiles.join(', ') || 'none detected'}`,
                    data: state as any
                }
            };
        } catch (error) {
            return { ok: false, error: new Error(`Failed to get workspace: ${error}`) };
        }
    }

    private async setCursorPosition(
        filePath: string,
        line: number,
        column: number
    ): Promise<Result<EngineOutput>> {
        try {
            // VS Code doesn't have a direct CLI for this, but we can open at line
            await execAsync(`code --goto "${filePath}:${line + 1}:${column + 1}"`);

            return {
                ok: true,
                value: {
                    output: `Positioned cursor at ${filePath}:${line + 1}:${column + 1}`,
                    data: { filePath, line, column }
                }
            };
        } catch (error) {
            return { ok: false, error: new Error(`Failed to set position: ${error}`) };
        }
    }

    /**
     * Get workspace files for Kimi to understand context
     */
    async getWorkspaceFiles(dir: string, depth = 2): Promise<string[]> {
        try {
            const { stdout } = await execAsync(
                `find "${dir}" -maxdepth ${depth} -type f \\( -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.md" \\) 2>nul || dir /s /b "${dir}\\*.ts" "${dir}\\*.js" "${dir}\\*.json" 2>nul`
            );
            return stdout.split('\n').filter(f => f.trim() && !f.includes('node_modules'));
        } catch {
            return [];
        }
    }

    public healthCheck(): { online: boolean; details: string } {
        return {
            online: true,
            details: 'VSCodeEngine active; ready for coordinated workspace operations.'
        };
    }
}

