import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { injectVFX: _injectVFX } = require('../../dist/src/scripts/inject_legion_vfx.js');

export const injectVFX = _injectVFX;

