import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { choreograph: _choreograph } = require('../../dist/src/scripts/choreograph_kbd_legion.js');

export const choreograph = _choreograph;
