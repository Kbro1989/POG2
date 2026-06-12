/**
 * TelemetryOverlay.ts
 * 
 * Visualizes intercepted Beta scripts and active mocks in the POG2 console.
 */

import chalk from 'chalk';

export class TelemetryOverlay {
    public static render(activeMocks: number[]): string {
        let output = chalk.blue('\n[ BETA INTERCEPTOR TELEMETRY ]\n');
        output += chalk.dim('─────────────────────────────────\n');
        
        // Authoritative Beta Script IDs (Mirroring substrate definitions)
        const scriptNames: Record<number, string> = {
            [123]: 'Lobby Init',
            [456]: 'Play Now',
            [789]: 'Interaction',
            [101]: 'Movement',
            [202]: 'Combat Handshake',
            [303]: 'Adrenaline'
        };

        for (const scriptId of activeMocks) {
            const name = scriptNames[scriptId] || `Script ${scriptId}`;
            output += `${chalk.green('✓')} ${chalk.white(name.padEnd(20))} [MOCKED]\n`;
        }

        output += chalk.dim('─────────────────────────────────\n');
        return output;
    }
}

