import { appendFileSync, existsSync, mkdirSync, statSync, renameSync } from 'fs';
import { join } from 'path';
export class ClinicalLogger {
    logDir;
    logPath;
    MAX_LOG_SIZE = 100 * 1024 * 1024; // 100MB
    constructor(projectRoot) {
        this.logDir = join(projectRoot, 'logs');
        this.logPath = join(this.logDir, 'neurological_audit.log');
        this.ensureLogFile();
    }
    ensureLogFile() {
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
    log(level, component, event, metric, win32Error) {
        this.ensureLogFile();
        const entry = {
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
