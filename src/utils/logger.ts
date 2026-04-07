import pino, { Logger } from 'pino';

export const SOVEREIGN_IDENTITY = 'POG2';

export function createLogger(name: string): Logger {
    return pino({
        name,
        level: process.env['POG_LOG_LEVEL'] || 'info',
        base: { hostname: SOVEREIGN_IDENTITY }
    });
}

export const logger = createLogger('POG2-CORE');
