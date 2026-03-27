import { appendFileSync, existsSync, mkdirSync, statSync, renameSync } from 'fs';
import { join } from 'path';

export type DiagnosticLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface ClinicalLogEntry {
    timestamp: string;
    level: DiagnosticLevel;
    component: string;
    event: string;
    metric?: Record<string, unknown>;
    win32Error?: { code: string; message: string; command?: string };
}

export class ClinicalLogger {
    private readonly logDir: string;
    private readonly logPath: string;
    private readonly MAX_LOG_SIZE = 100 * 1024 * 1024; // 100MB

    constructor(projectRoot: string) {
        this.logDir = join(projectRoot, 'logs');
        this.logPath = join(this.logDir, 'neurological_audit.log');
        this.ensureLogFile();
    }

    private ensureLogFile(): void {
        if (!existsSync(this.logDir)) {
            mkdirSync(this.logDir, { recursive: true });
        }

        if (existsSync(this.logPath)) {
            const stats = statSync(this.logPath);
            if (stats.size >= this.MAX_LOG_SIZE) {
                const archivePath = join(this.logDir, `neurological_audit_${Date.now()}.log`);
                renameSync(this.logPath, archivePath);
            }
        }
    }

    public log(level: DiagnosticLevel, component: string, event: string, metric?: Record<string, unknown>, win32Error?: { code: string; message: string; command?: string }): void {
        this.ensureLogFile();

        const entry: ClinicalLogEntry = {
            timestamp: new Date().toISOString(),
            level,
            component,
            event,
            ...(metric && { metric }),
            ...(win32Error && { win32Error })
        };

        const jsonLine = JSON.stringify(entry) + '\n';
        appendFileSync(this.logPath, jsonLine, { encoding: 'utf-8' });
    }
}
