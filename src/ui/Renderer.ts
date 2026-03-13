import * as readline from 'readline/promises';
import { PathNormalizer } from '../utils/PathNormalizer.js';
import chalk from 'chalk';
import { type YaoState, EmotionalState, type SovereignRecord, type OraclePlan } from '../core/models.js';
import type { HexagramManager } from '../routing/HexagramManager.js';
import { SovereignDomain } from '../types/SovereignDomain.js';
import type { NodeHealth } from '../monitor/NodeTester.js';

/**
 * Renderer â€” POG2 Sovereign CLI UI output.
 * Phase 15: Domain transition, fallback signaling, and violation displays.
 */
export class Renderer {
    private rl?: readline.Interface;
    private isSilent = false;

    constructor() { }

    public setReadline(rl: readline.Interface): void {
        this.rl = rl;
    }

    public setSilent(silent: boolean): void {
        this.isSilent = silent;
    }

    public showBanner(): void {
        console.log('\x1b[38;5;51m');
        console.log('  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—     â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•— â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•— â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•— â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•— ');
        console.log('  â–ˆâ–ˆâ•”â•â•â–ˆâ–ˆâ•—â–ˆâ–ˆâ•”â•â•â•â–ˆâ–ˆâ•—â–ˆâ–ˆâ•”â•â•â•â•â•    â–ˆâ–ˆâ•”â•â•â•â•â•â–ˆâ–ˆâ•”â•â•â•â–ˆâ–ˆâ•—â–ˆâ–ˆâ•”â•â•â–ˆâ–ˆâ•—â–ˆâ–ˆâ•”â•â•â•â•â•â–ˆâ–ˆâ•”â•â•â–ˆâ–ˆâ•—');
        console.log('  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•â–ˆâ–ˆâ•‘   â–ˆâ–ˆâ•‘â–ˆâ–ˆâ•‘  â–ˆâ–ˆâ–ˆâ•—    â–ˆâ–ˆâ•‘     â–ˆâ–ˆâ•‘   â–ˆâ–ˆâ•‘â–ˆâ–ˆâ•‘  â–ˆâ–ˆâ•‘â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•');
        console.log('  â–ˆâ–ˆâ•”â•â•â•â• â–ˆâ–ˆâ•‘   â–ˆâ–ˆâ•‘â–ˆâ–ˆâ•‘   â–ˆâ–ˆâ•‘    â–ˆâ–ˆâ•‘     â–ˆâ–ˆâ•‘   â–ˆâ–ˆâ•‘â–ˆâ–ˆâ•‘  â–ˆâ–ˆâ•‘â–ˆâ–ˆâ•”â•â•â•  â–ˆâ–ˆâ•”â•â•â–ˆâ–ˆâ•—');
        console.log('  â–ˆâ–ˆâ•‘     â•šâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•â•šâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•    â•šâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—â•šâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—â–ˆâ–ˆâ•‘  â–ˆâ–ˆâ•‘');
        console.log('  â•šâ•â•      â•šâ•â•â•â•â•â•  â•šâ•â•â•â•â•â•      â•šâ•â•â•â•â•â• â•šâ•â•â•â•â•â• â•šâ•â•â•â•â•â• â•šâ•â•â•â•â•â•â•â•šâ•â•  â•šâ•â•');
        console.log('\x1b[0m');
        console.log('        [ P O G 2 - S O V E R E I G N  E D I T I O N ]');
        console.log('               Phase 15: Domain Isolation');
    }

    public info(message: string, data?: any): void {
        const normalized = data?.skipNormalization ? message : PathNormalizer.normalizeString(message);
        console.log(`\x1b[38;5;39m[INFO]\x1b[0m ${normalized}`);
    }

    public success(message: string, data?: any): void {
        const normalized = data?.skipNormalization ? message : PathNormalizer.normalizeString(message);
        console.log(`\x1b[38;5;46m[SUCCESS]\x1b[0m ${normalized}`);
    }

    public warn(message: string, data?: any): void {
        const normalized = data?.skipNormalization ? message : PathNormalizer.normalizeString(message);
        console.log(`\x1b[38;5;220m[WARN]\x1b[0m ${normalized}`);
    }

    public error(message: string, data?: any): void {
        const normalized = data?.skipNormalization ? message : PathNormalizer.normalizeString(message);
        console.log(`\x1b[38;5;196m[ERROR]\x1b[0m ${normalized}`);
    }

    public json(data: unknown): void {
        console.log(JSON.stringify(data, null, 2));
    }

    public output(message: string, data?: any): void {
        const normalized = data?.skipNormalization ? message : PathNormalizer.normalizeString(message);
        console.log(`\x1b[38;5;250m${normalized}\x1b[0m`);
        if (data) {
            console.log('\x1b[38;5;240m[METADATA]\x1b[0m');
            this.json(data);
        }
    }

    public gauge(label: string, value: number, max: number = 100): void {
        const percent = Math.min(Math.max(value / max, 0), 1);
        const width = 20;
        const filled = Math.round(width * percent);
        const bar = 'â–ˆ'.repeat(filled) + 'â–‘'.repeat(width - filled);
        const colors = ['\x1b[38;5;46m', '\x1b[38;5;220m', '\x1b[38;5;196m'];
        const colorIdx = percent > 0.8 ? 2 : percent > 0.5 ? 1 : 0;
        console.log(`  ${label.padEnd(15)} ${colors[colorIdx]}${bar}\x1b[0m ${value}/${max}`);
    }

    public heatmap(label: string, scores: number[]): void {
        const blocks = [' ', 'â–‘', 'â–’', 'â–“', 'â–ˆ'];
        const line = scores.map(s => {
            const idx = Math.min(Math.floor(s * blocks.length), blocks.length - 1);
            return blocks[idx];
        }).join('');
        console.log(`\n  \x1b[38;5;51m[HEATMAP] ${label}\x1b[0m`);
        console.log(`  [${line}]`);
    }

    public status(data: unknown): void {
        console.log('\x1b[38;5;51m\n  â•â•â• [ SYSTEM STATUS ] â•â•â•\x1b[0m');
        this.json(data);
    }

    public log(message: string): void {
        console.log(message);
    }

    public async confirm(message: string): Promise<boolean> {
        let isTemp = false;
        if (!this.rl) {
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            isTemp = true;
        }

        try {
            const answer = await this.rl.question(`\x1b[38;5;220m[CONFIRM]\x1b[0m ${message} (y/n): `);
            return answer.toLowerCase() === 'y';
        } finally {
            if (isTemp) {
                this.rl.close();
                this.rl = undefined;
            }
        }
    }

    public async prompt(message: string): Promise<string> {
        let isTemp = false;
        if (!this.rl) {
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            isTemp = true;
        }

        try {
            return await this.rl.question(message);
        } finally {
            if (isTemp) {
                this.rl.close();
                this.rl = undefined;
            }
        }
    }

    public showYaoCard(state: YaoState): void {
        const cards: Record<number, { symbol: string, label: string, color: string }> = {
            [2]: { symbol: 'âšŠ', label: 'YOUNG YANG', color: '\x1b[38;5;46m' }, // Stable
            [0]: { symbol: 'âš‹', label: 'YOUNG YIN', color: '\x1b[38;5;39m' },   // Stable
            [3]: { symbol: 'â—¯', label: 'OLD YANG', color: '\x1b[38;5;196m' },   // Change
            [1]: { symbol: 'âœ•', label: 'OLD YIN', color: '\x1b[38;5;208m' },    // Change
        };

        const card = cards[state as number];
        if (!card) return;
        console.log(`\n  ${card.color}+--------------------+\x1b[0m`);
        console.log(`  ${card.color}|      [ ${card.symbol} ]       |\x1b[0m`);
        console.log(`  ${card.color}|    ${card.label.padEnd(14)}    |\x1b[0m`);
        console.log(`  ${card.color}+--------------------+\x1b[0m`);
    }

    public showHexagram(manager: HexagramManager): void {
        const lines = manager.getLines();
        const interpretation = manager.getInterpretation();
        const colors = {
            [0]: '\x1b[38;5;196m', // Old Yang - Red
            [2]: '\x1b[38;5;46m',  // Young Yang - Green
            [3]: '\x1b[38;5;208m', // Old Yin - Orange
            [1]: '\x1b[38;5;39m',  // Young Yin - Blue
        };

        console.log('\x1b[38;5;51m\n  â•â•â• [ CURRENT HEXAGRAM ] â•â•â•\x1b[0m');
        for (let i = 5; i >= 0; i--) {
            const line = lines[i]!;
            const symbol = line.state === 2 || line.state === 3 ? 'â” â” â” â” â” â” â” ' : 'â” â” â”    â” â” â” ';
            const mark = line.state === 3 ? 'â—¯' : line.state === 1 ? 'âœ•' : ' ';
            console.log(`  L${i + 1}: ${colors[line.state as keyof typeof colors]}${symbol} ${mark} \x1b[0m`);
        }
        console.log(`  \x1b[38; 5; 51mARCHETYPE: ${interpretation.name} \x1b[0m`);
        console.log(`  \x1b[38; 5; 250mSTRATEGY:  ${interpretation.strategy} \x1b[0m`);
    }

    public showPlan(plan: OraclePlan): void {
        console.log(`\x1b[38;5;51m\n  â”€â”€â”€ [ KIMI ORCHESTRATION ] â• â• â• \x1b[0m`);
        console.log(`  GOAL:      ${plan.goal}`);
        console.log(`  STEPS:     ${plan.steps.length}`);
        plan.steps.forEach((step, idx) => {
            console.log(`    ${idx + 1}. ${step}`);
        });
    }

    // â•â•â• PHASE 15: DOMAIN ISOLATION UI â•â•â•

    /**
     * Display domain transition â€” visual gate lock/unlock.
     */
    public showDomainTransition(from: SovereignDomain | null, to: SovereignDomain): void {
        const DOMAIN_COLORS: Record<SovereignDomain, string> = {
            [SovereignDomain.CODE]: '\x1b[38;5;46m',   // Green
            [SovereignDomain.SYSTEM]: '\x1b[38;5;208m',  // Orange
            [SovereignDomain.VISION]: '\x1b[38;5;39m',   // Blue
            [SovereignDomain.RESEARCH]: '\x1b[38;5;141m',  // Purple
            [SovereignDomain.FORGE]: '\x1b[38;5;196m',  // Red
            [SovereignDomain.OBSERVE]: '\x1b[38;5;250m',  // Gray
            [SovereignDomain.SOCIAL]: '\x1b[38;5;51m',   // Cyan
            [SovereignDomain.MOTOR]: '\x1b[38;5;213m',  // Pink/Magneta
            [SovereignDomain.SENSORY]: '\x1b[38;5;226m', // Yellow
        };

        const DOMAIN_ICONS: Record<SovereignDomain, string> = {
            [SovereignDomain.CODE]: 'ðŸ’»',
            [SovereignDomain.SYSTEM]: 'âš™ï¸',
            [SovereignDomain.VISION]: 'ðŸ‘ï¸',
            [SovereignDomain.RESEARCH]: 'ðŸ”',
            [SovereignDomain.FORGE]: 'ðŸ”¥',
            [SovereignDomain.OBSERVE]: 'ðŸ“Š',
            [SovereignDomain.SOCIAL]: 'ðŸŽ­',
            [SovereignDomain.MOTOR]: 'ðŸ¦¾',
            [SovereignDomain.SENSORY]: 'ðŸ“¡',
        };

        const color = DOMAIN_COLORS[to];
        const icon = DOMAIN_ICONS[to];
        const reset = '\x1b[0m';

        console.log(`\n  ${color}+---------------------------------------+\x1b[0m`);
        if (from) {
            console.log(`  ${color}|  ${icon} DOMAIN: ${from} -> ${String(to || 'UNKNOWN').padEnd(8)} |\x1b[0m`);
        } else {
            console.log(`  ${color}|  ${icon} DOMAIN LOCKED: ${String(to || 'UNKNOWN').padEnd(10)}   |\x1b[0m`);
        }
        console.log(`  ${color}+---------------------------------------+\x1b[0m`);
    }

    /**
     * Display cloud fallback warning â€” prominent visual indicator.
     */
    public showFallbackWarning(reason: string, targetModel: string, fallbackReason: string): void {
        const yellow = '\x1b[38;5;220m';
        const bold = '\x1b[1m';
        const reset = '\x1b[0m';

        console.log(`\n  ${yellow}${bold}+------------------------------------------+\x1b[0m`);
        console.log(`  ${yellow}${bold}|  ! CLOUD FALLBACK ACTIVE                 |\x1b[0m`);
        console.log(`  ${yellow}${bold}+==========================================+\x1b[0m`);
        console.log(`  ${yellow}|  Reason: ${fallbackReason.substring(0, 30).padEnd(30)} |\x1b[0m`);
        console.log(`  ${yellow}|  Target: ${targetModel.substring(0, 30).padEnd(30)} |\x1b[0m`);
        console.log(`  ${yellow}${bold}+------------------------------------------+\x1b[0m`);
    }

    /**
     * Display domain violation â€” HARD ERROR visual.
     */
    public showDomainViolation(toolName: string, requiredDomain: SovereignDomain, activeDomain: SovereignDomain): void {
        const red = '\x1b[38;5;196m';
        const bold = '\x1b[1m';
        const reset = '\x1b[0m';

        console.log(`\n  ${red}${bold}+------------------------------------------+\x1b[0m`);
        console.log(`  ${red}${bold}|  X DOMAIN VIOLATION - EXECUTION BLOCKED  |\x1b[0m`);
        console.log(`  ${red}${bold}+==========================================+\x1b[0m`);
        console.log(`  ${red}|  Tool:     ${String(toolName || 'UNKNOWN').padEnd(29)} |\x1b[0m`);
        console.log(`  ${red}|  Requires: ${String(requiredDomain || 'UNKNOWN').padEnd(29)} |\x1b[0m`);
        console.log(`  ${red}|  Active:   ${String(activeDomain || 'NONE').padEnd(29)} |\x1b[0m`);
        console.log(`  ${red}|                                          |\x1b[0m`);
        console.log(`  ${red}|  Cross-domain execution is BLOCKED.      |\x1b[0m`);
        console.log(`  ${red}|  Re-classify your intent or escalate.    |\x1b[0m`);
        console.log(`  ${red}${bold}+------------------------------------------+\x1b[0m`);
    }

    /**
     * Display deep clinical neurological audit results.
     */
    public renderNeurologicalAudit(results: NodeHealth[]): void {
        console.log('\x1b[38;5;51m\n  â•â•â• [ DEEP CLINICAL NEUROLOGICAL AUDIT ] â•â•â•\x1b[0m');

        const categories = [...new Set(results.map(r => r.category))];

        for (const cat of categories) {
            console.log(`\n  \x1b[38;5;250mCATEGORY: ${cat}\x1b[0m`);
            const catNodes = results.filter(r => r.category === cat);

            for (const node of catNodes) {
                let statusColor = '\x1b[38;5;46m'; // ONLINE: Green
                if (node.status === 'DEGRADED') statusColor = '\x1b[38;5;220m'; // Orange
                if (node.status === 'OFFLINE') statusColor = '\x1b[38;5;196m'; // Red

                const icon = node.status === 'ONLINE' ? 'âœ”' : node.status === 'DEGRADED' ? 'âš ' : 'âœ˜';
                const yaoIcon = node.yaoState === 2 || node.yaoState === 0 ? 'âšŠ' : 'âš‹';

                console.log(`    ${statusColor}${icon}\x1b[0m [${yaoIcon}] ${node.role.padEnd(18)} : ${statusColor}${node.status.padEnd(8)}\x1b[0m ${node.details || ''}`);
            }
        }

        const online = results.filter(r => r.status === 'ONLINE').length;
        const total = results.length;
        this.gauge('Neural Sync', online, total);
        console.log('');
    }
}
