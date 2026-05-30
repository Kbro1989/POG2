import pino, { Logger } from 'pino';

export const SOVEREIGN_IDENTITY = 'POG2';

export function createLogger(name: string): Logger {
    const logger = pino({
        name,
        level: process.env['POG_LOG_LEVEL'] || 'info',
        base: { hostname: SOVEREIGN_IDENTITY }
    });

    // Create a Proxy to safely wrap logging calls
    return new Proxy(logger, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === 'function') {
                return (...args: any[]) => {
                    try {
                        return value.apply(target, args);
                    } catch (err) {
                        console.error(`[Logger Silent Error] (${name}): ${(err as Error).message}`);
                        return undefined;
                    }
                };
            }
            return value;
        }
    });
}

export const logger = createLogger('POG2-CORE');
