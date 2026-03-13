import pino from 'pino';

export const logger = pino({
    name: 'POG2-CORE',
    level: process.env['POG_LOG_LEVEL'] || 'info',
    base: { hostname: 'POG2-Substrate' }
});
