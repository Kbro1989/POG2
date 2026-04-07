import { YaoState, Result, BuildStatus, HealthStatus } from '../core/models.js';

export class CognitiveTranslator {
    public static translate(data: unknown): YaoState {
        if (data === null || data === undefined) return YaoState.YoungYin;
        if (data === 'Yin' || data === BuildStatus.Failed || data === HealthStatus.Critical) return YaoState.OldYin;
        if (data === 'Yang' || data === BuildStatus.Passed || data === HealthStatus.Ready) return YaoState.YoungYang;
        if (data === 'YinYang' || data === BuildStatus.Warning || data === HealthStatus.Degraded) return YaoState.OldYang;

        if (typeof data === 'string') {
            const lower = data.toLowerCase();
            if (lower.includes('error') || lower.includes('fail')) return YaoState.OldYin;
            if (lower.includes('warn') || lower.includes('retry')) return YaoState.OldYang;
            if (lower.includes('success') || lower.includes('ok')) return YaoState.YoungYang;
        }

        return YaoState.YoungYin;
    }

    public static getAction(state: YaoState): string {
        switch (state) {
            case YaoState.OldYang: return 'ESCALATE/TRANSFORM';
            case YaoState.YoungYin: return 'OBSERVE/RECEPTIVE';
            case YaoState.YoungYang: return 'EXECUTE/MAINTAIN';
            case YaoState.OldYin: return 'WITHDRAW/ARCHIVE';
            default: return 'RE-INDEX/PIVOT';
        }
    }
}
