import { createLogger } from './logger.js';
import { ScriptState } from '../core/models.js'; // Assuming we'll define/use a POG2 version

const logger = createLogger('SovereignScriptRunner');

export class SovereignScriptRunner {
    private state: ScriptState = 'running';

    log(...args: any[]): void {
        logger.info({ args });
    }

    setState(state: ScriptState): void {
        this.state = state;
    }

    getState(): ScriptState {
        return this.state;
    }

    async run<ARGS extends any[], RET extends any>(
        fn: (runner: SovereignScriptRunner, ...args: ARGS) => Promise<RET>,
        ...args: ARGS
    ): Promise<RET | null> {
        try {
            return await fn(this, ...args);
        } catch (e) {
            logger.error({ err: e }, 'Script execution error');
            this.setState('error');
            return null;
        }
    }
}
