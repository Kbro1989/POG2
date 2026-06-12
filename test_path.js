import * as path from 'path';
const __dirname = 'D:\\POG2\\dist\\utils';
const BRIDGE_SCRIPT = path.join(__dirname, 'rsmv_bridge.ts')
    .replace(path.sep + 'dist' + path.sep, path.sep + 'src' + path.sep)
    .replace(/\.js$/, '.ts');
console.log('Result:', BRIDGE_SCRIPT);
