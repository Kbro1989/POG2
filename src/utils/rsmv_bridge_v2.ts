/**
 * rsmv_bridge_v2.ts
 * Subprocess bridge to the operational rsmv_inspector substrate.
 * Invokes the inspector within its own context to bypass resolution errors.
 */

import { spawn } from 'child_process';
import path from 'path';

const INSPECTOR_PATH = path.join(process.cwd(), 'rsmv');

export async function invokeInspector(operation: string, args: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
        const cmd = ['-e', `
            const inspector = require('./dist/main.js');
            // Mocking CLI interaction or utilizing existing exported modules from inspector
            // We'll use this context to perform the work
        `];
        
        // We invoke the API interface in the dist folder, which is already transpiled
        const child = spawn('node', ['./api.js', operation, ...args], {
            cwd: path.join(INSPECTOR_PATH, 'dist'),
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        child.stdout.on('data', (d) => stdout += d);
        
        child.on('close', (code) => {
            if (code !== 0) reject(new Error('Subprocess failed'));
            else resolve(JSON.parse(stdout));
        });
    });
}
