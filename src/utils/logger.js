"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.SOVEREIGN_IDENTITY = void 0;
exports.createLogger = createLogger;
var pino_1 = require("pino");
exports.SOVEREIGN_IDENTITY = 'POG2';
function createLogger(name) {
    return (0, pino_1.default)({
        name: name,
        level: process.env['POG_LOG_LEVEL'] || 'info',
        base: { hostname: exports.SOVEREIGN_IDENTITY }
    });
}
exports.logger = createLogger('POG2-CORE');
