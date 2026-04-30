import fs from 'fs';

const filePath = 'src/opcode_reader.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix implicit any in opcode_reader.ts - ONLY in declarations
content = content.replace(/read\s*\(\s*state\s*\)\s*\{/g, 'read(state: DecodeState) {');
content = content.replace(/write\s*\(\s*state\s*,\s*v\s*\)\s*\{/g, 'write(state: EncodeState, v: any) {');
content = content.replace(/write\s*\(\s*state\s*,\s*value\s*\)\s*\{/g, 'write(state: EncodeState, value: any) {');
content = content.replace(/readConst\s*\(\s*state\s*\)\s*\{/g, 'readConst(state: DecodeState) {');
content = content.replace(/getTypescriptType\s*\(\s*indent\s*\)\s*\{/g, 'getTypescriptType(indent: string) {');

// Fix specific callback signatures
content = content.replace(/const resolveReference: ChunkParentCallback = function \(name, child\)/g, 'const resolveReference: ChunkParentCallback = function (name: string, child: any)');
content = content.replace(/const resolveLengthReference: ChunkParentCallback = function \(name, child\)/g, 'const resolveLengthReference: ChunkParentCallback = function (name: string, child: any)');

// Fix numberTypes definitions
content = content.replace(/read\(s\) \{ checkBounds\(s, (\d+)\);/g, 'read(s: DecodeState) { checkBounds(s, $1);');
content = content.replace(/write\(s, v\) \{ s.buffer/g, 'write(s: EncodeState, v: number) { s.buffer');

fs.writeFileSync(filePath, content);
console.log('Fixed opcode_reader.ts (v2)');
