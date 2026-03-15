import pino from 'pino';
import { type Result, ok } from '../core/models.js';
import { readFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { SovereignIgnoreManager } from './SovereignIgnoreManager.js';
import { getSystemRoot } from './SovereignPathResolver.js';

const logger = pino({ name: 'ClinicalAuditTool', base: { hostname: 'POG2' } });

export interface AuditViolation {
    pattern: string;
    line: number;
    content: string;
}

export interface AuditResult {
    filePath: string;
    violations: AuditViolation[];
    isClinical: boolean;
}

interface ForbiddenPattern {
    regex: RegExp;
    message: string;
}

/**
 * ClinicalAuditTool â€” Sovereign Law enforcement substrate.
 * Scans code for mocks, placeholders, weak typing, and non-clinical logging.
 * Phase 35: Full recursive directory scanning with line-level violation reporting.
 */
export class ClinicalAuditTool {
    private readonly forbiddenPatterns: ForbiddenPattern[] = [
        { regex: /todo:|fixme:/i, message: 'Placeholder comment detected (todo/fixme)' },
        { regex: /\bmock\b/i, message: 'Mocking pattern detected (forbidden by Sovereign Law)' },
        { regex: /placeholder/i, message: 'Placeholder keyword detected' },
        { regex: /as any/i, message: 'Weak typing pattern (as any) detected' },
        { regex: /console\.log/, message: 'Non-clinical logging (console.log) detected' },
        { regex: /\/\/ \.\.\./, message: 'Code ellipsis placeholder detected' }
    ];

    private readonly auditableExtensions = new Set(['.ts', '.js', '.tsx', '.jsx']);

    async auditFile(filePath: string): Promise<Result<AuditResult>> {
        try {
            const content = await readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            const violations: AuditViolation[] = [];

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex]!;
                for (const pattern of this.forbiddenPatterns) {
                    if (pattern.regex.test(line)) {
                        violations.push({
                            pattern: pattern.message,
                            line: lineIndex + 1,
                            content: line.trim().substring(0, 120)
                        });
                    }
                }
            }

            const isClinical = violations.length === 0;

            if (!isClinical) {
                logger.warn({ filePath, count: violations.length }, 'Clinical violations detected');
            } else {
                logger.debug({ filePath }, 'File passed clinical audit');
            }

            return ok({ filePath, violations, isClinical });
        } catch (error) {
            return { ok: false, error: error as Error };
        }
    }

    async auditDirectory(
        targetPath: string,
        excludes: string[] = ['node_modules', '.git', 'dist', '-p']
    ): Promise<Result<AuditResult[]>> {
        try {
            const targetStat = await stat(targetPath);
            let results: AuditResult[];

            if (targetStat.isFile()) {
                const res = await this.auditFile(targetPath);
                if (!res.ok) return { ok: false, error: res.error };
                results = [res.value];
            } else {
                results = await this.scanRecursive(targetPath, excludes);
            }

            const violationCount = results.filter(r => !r.isClinical).length;

            logger.info(
                { targetPath, totalFiles: results.length, violations: violationCount },
                'Directory audit complete'
            );

            return ok(results);
        } catch (error) {
            return { ok: false, error: error as Error };
        }
    }

    private async scanRecursive(dirPath: string, excludes: string[]): Promise<AuditResult[]> {
        const results: AuditResult[] = [];
        const entries = await readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dirPath, entry.name);
            const root = getSystemRoot();

            if (SovereignIgnoreManager.isIgnored(root, fullPath)) continue;
            if (excludes.includes(entry.name)) continue;

            if (entry.isDirectory()) {
                const subResults = await this.scanRecursive(fullPath, excludes);
                results.push(...subResults);
            } else if (entry.isFile() && this.auditableExtensions.has(extname(entry.name))) {
                const auditResult = await this.auditFile(fullPath);
                if (auditResult.ok) {
                    results.push(auditResult.value);
                }
            }
        }

        return results;
    }

    formatReport(results: AuditResult[]): string {
        const violatedFiles = results.filter(r => !r.isClinical);

        if (violatedFiles.length === 0) {
            return 'âœ… SOVEREIGN AUDIT PASSED: All files are clinically clean.';
        }

        const lines: string[] = [
            `âŒ SOVEREIGN AUDIT: ${violatedFiles.length} file(s) with violations:\n`
        ];

        for (const file of violatedFiles) {
            lines.push(`  ðŸ“„ ${file.filePath}`);
            for (const v of file.violations) {
                lines.push(`     L${v.line}: ${v.pattern}`);
                lines.push(`           ${v.content}`);
            }
            lines.push('');
        }

        return lines.join('\n');
    }

    public healthCheck(): { online: boolean; details: string } {
        return { 
            online: true, 
            details: 'ClinicalAuditTool substrate active; Sovereign Law enforced.' 
        };
    }
}
