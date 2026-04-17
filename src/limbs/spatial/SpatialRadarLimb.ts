import chalk from 'chalk';
import { GameState, NPC, Coord, DirectionalCollision, SovereignAvatar } from '../../core/models.js';
import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';
import { SpatialSovereigntyLimb, PADDED_SIZE, CORE_SIZE } from './SpatialSovereigntyLimb.js';

export class SpatialRadarLimb {
    private static instance: SpatialRadarLimb;
    private spatialLimb: SpatialSovereigntyLimb;

    private constructor() {
        this.spatialLimb = SpatialSovereigntyLimb.getInstance();
    }

    public static getInstance(): SpatialRadarLimb {
        if (!SpatialRadarLimb.instance) {
            SpatialRadarLimb.instance = new SpatialRadarLimb();
        }
        return SpatialRadarLimb.instance;
    }

    /**
     * render - Generates a 2D Unicode grid representing the authoritative world state.
     * Default: 21x21 viewport.
     */
    public render(state: GameState, avatar: SovereignAvatar, fullRegion: boolean = true): string {
        const center = avatar.coord;
        const radius = fullRegion ? 33 : 10; 
        let output = '\n';

        const rx = Math.floor(center.x / 64);
        const ry = Math.floor(center.y / 64);

        // Header
        const stats = avatar.adrenaline !== undefined ? ` | Adrenaline: ${chalk.yellow(avatar.adrenalinePercent)} | Necrosis: ${chalk.green(avatar.necrosisStacks || 0)}` : '';
        output += chalk.cyan(`[ SPATIAL RADAR ] - Tick: ${state.tickNumber} | Region: ${rx}_${ry}${stats}\n`);
        output += chalk.dim('┌' + '─'.repeat(radius * 4 + 1) + '┐\n');

        const yStart = fullRegion ? (ry * 64) + 65 : center.y + radius;
        const yEnd = fullRegion ? (ry * 64) - 1 : center.y - radius;
        const xStart = fullRegion ? (rx * 64) - 1 : center.x - radius;
        const xEnd = fullRegion ? (rx * 64) + 65 : center.x + radius;

        for (let y = yStart; y >= yEnd; y--) {
            let line = chalk.dim('│ ');
            for (let x = xStart; x <= xEnd; x++) {
                line += this.renderTile(x, y, center.plane, state, avatar);
            }
            output += line + chalk.dim(' │\n');
        }

        output += chalk.dim('└' + '─'.repeat(radius * 4 + 1) + '┘\n');
        output += this.renderLegend();
        
        return output;
    }

    private renderTile(x: number, y: number, plane: number, state: GameState, avatar: SovereignAvatar): string {
        // 1. Resolve Entity Priority
        if (avatar.coord.x === x && avatar.coord.y === y && avatar.coord.plane === plane) {
            let char = '@ ';
            if (avatar.metadata?.isAnimating) {
                char = '@*'; // Animation burst
                return chalk.cyan.bold.bgWhite(char);
            }
            if (avatar.metadata?.activeHitsplats?.length > 0) {
                // Return total damage in this tick
                const total = avatar.metadata.activeHitsplats.reduce((acc: number, h: any) => acc + h.amount, 0);
                char = `!${Math.min(9, Math.floor(total/100))}`; // Show intensity 0-9
                return chalk.bgRed.white.bold(char);
            }
            return chalk.cyan.bold(char);
        }

        const coordKey = `${x},${y},${plane}`;
        const npcsOnTile = state.npcSpatialIndex.get(coordKey) || [];
        if (npcsOnTile.length > 0) {
            const npc = npcsOnTile[0];
            const isTarget = avatar.intent?.targetId === `npc_${npc.id}`;
            const isHit = npc.metadata?.hitFlash === true;
            
            let color = isTarget ? chalk.bgMagenta.white : chalk.magenta;
            if (isHit) color = chalk.bgWhite.red.bold;

            let char = 'N ';
            if (npc.interactionState === 'MOVING') char = '! ';
            if (npc.interactionState === 'EXECUTING') char = '* ';

            return color(char);
        }

        // 2. Resolve Logic Substrate
        const audit = this.spatialLimb.auditTile(plane, x, y);
        let char = '. ';
        let tileColor = (text: string) => text;

        if (audit.collisionType === 'mapsquare_fragment' && audit.stack) {
            const layer = audit.stack.layers.find(l => l.plane === plane);
            if (layer?.type === 'water') {
                char = '~ ';
                tileColor = chalk.blue;
            } else if (!layer?.walkable) {
                char = 'X ';
                tileColor = chalk.red;
            } else if (layer?.type === 'bridge') {
                char = '= ';
                tileColor = chalk.yellow;
            }
        } else if (audit.collisionType === 'directional' && audit.raw) {
             const c = audit.raw as any;
             if (c.walkable === false) {
                 char = 'X ';
                 tileColor = chalk.red;
             } else {
                 char = this.resolveEdgeChar(c.edges || c);
                 tileColor = chalk.yellow;
             }
        } else if (!audit.walkable) {
            char = 'X ';
            tileColor = chalk.red;
        }

        // 2.5 Combat Range Overlay
        if (avatar.intent?.action === 'castAbility' && (avatar.intent as any).abilityId) {
            const dist = Math.max(Math.abs(avatar.x - x), Math.abs(avatar.y - y));
            const range = (avatar.intent as any).range || 7; // Default or fetched
            if (dist <= range && char === '. ') {
                tileColor = chalk.dim.yellow;
                char = '· ';
            }
        }

        // 3. Intent Trace
        if (avatar.intent && avatar.intent.coord) {
            if (avatar.intent.coord.x === x && avatar.intent.coord.y === y && avatar.intent.coord.plane === plane) {
                return chalk.yellow.bold('* ');
            }
        }

        // 4. Boundary Markers (Padded Region Seams)
        // 4. Boundary Markers (Playable Core vs Padded Neighbor Bleed)
        const rx = Math.floor(avatar.coord.x / 64);
        const ry = Math.floor(avatar.coord.y / 64);
        
        const minX = rx * 64;
        const maxX = minX + 63;
        const minY = ry * 64;
        const maxY = minY + 63;

        const inCore = x >= minX && x <= maxX && y >= minY && y <= maxY;

        if (!inCore) {
            tileColor = (txt) => chalk.bgGrey.white(txt);
        }

        return tileColor(char);
    }

    private resolveEdgeChar(edges: any): string {
        const n = edges.northBlocked || edges.north === false;
        const s = edges.southBlocked || edges.south === false;
        const e = edges.eastBlocked || edges.east === false;
        const w = edges.westBlocked || edges.west === false;

        if (n && s && e && w) return '□ ';
        if (n && s) return '║ ';
        if (e && w) return '═ ';
        if (n && e) return '└ ';
        if (n && w) return '┘ ';
        if (s && e) return '┌ ';
        if (s && w) return '┐ ';
        if (n) return '╨ ';
        if (s) return '╥ ';
        if (e) return '╟ ';
        if (w) return '╢ ';
        
        return '. ';
    }

    private renderLegend(): string {
        return chalk.dim('  Legend: ') + 
               chalk.cyan('@') + chalk.dim(' (You) ') + 
               chalk.magenta('N') + chalk.dim(' (NPC) ') + 
               chalk.red('X') + chalk.dim(' (Blocked) ') + 
               chalk.blue('~') + chalk.dim(' (Water) ') +
               chalk.yellow('║/═') + chalk.dim(' (Partial Block) ') +
               chalk.bgGrey(' ') + chalk.dim(' (Neighbor Padding)\n');
    }
}
