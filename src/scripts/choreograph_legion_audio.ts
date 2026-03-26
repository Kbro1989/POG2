import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { synthesizeAudio: _synthesizeAudio } = require('../../dist/src/scripts/choreograph_legion_audio.js');

export const synthesizeAudio = _synthesizeAudio;
