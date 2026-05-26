/**
 * rsmv_bridge_mcp.ts
 * MCP-aware bridge that connects to the operational rsmv_inspector server.
 * Instead of spawning processes, it performs a request against the live Switchboard bridge.
 */

import { SwitchboardLimb } from '../monitor/SwitchboardLimb.js';
import http from 'http';

export async function invokeInspectorViaMCP(operation: string, args: string[]): Promise<any> {
    const port = SwitchboardLimb.getInstance().getActivePort() || 8788;
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: `/api/rsmv/${operation}/${args.join('/')}`,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse MCP response: ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}
