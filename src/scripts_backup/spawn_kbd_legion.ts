import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { spawn: _spawn } = require('../../dist/src/scripts/spawn_kbd_legion.js');

export const spawn = _spawn;

