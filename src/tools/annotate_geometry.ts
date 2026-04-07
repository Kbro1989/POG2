/**
 * ANNOTATE GEOMETRY â€” Interactive TUI Tool
 * 
 * Renders a collision grid and lets you attach permanent geometry
 * annotations to tile ranges. Your interpretation becomes a resolved
 * fact that the sovereign reads on every future pass.
 * 
 * Run: npx tsx src/tools/annotate_geometry.ts
 * 
 * Also auto-promotes RESOLVED annotations to assumptions.md
 */

import * as readline from 'readline';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { GeometryAnnotationLayer, VoidType, GeometryAnnotation } from '../limbs/spatial/GeometryAnnotationLayer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ASSUMPTIONS_PATH = 'D:/sovereign/atlas/logic/assumptions.md';

const VOID_TYPES: VoidType[] = [
    'pillar_top', 'platform_underside', 'waterfall_face', 'cliff_edge',
    'agility_shortcut', 'quest_gate', 'transport_trigger',
    'decorative_nocollision', 'cantilevered_floor',
    'mine_cart_track', 'mine_cart_brake', 'smuggler_trail',
    'patrol_boundary', 'unknown',
];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> => new Promise(r => rl.question(q, r));

const gal = new GeometryAnnotationLayer();

function renderGrid(
    grid: { x: number; z: number; type: string }[],
    annotations: GeometryAnnotation[],
    centerX: number, centerZ: number, plane: number
) {
    const W = 41, H = 20;
    const half = Math.floor(W / 2);

    const rows: string[] = [];
    for (let dz = H; dz >= -H; dz--) {
        let row = `${(centerZ + dz).toString().padStart(5)} | `;
        for (let dx = -half; dx <= half; dx++) {
            const wx = centerX + dx;
            const wz = centerZ + dz;

            // Check annotation overlay first
            const ann = annotations.find(a =>
                wx >= a.tile_range.x1 && wx <= a.tile_range.x2 &&
                wz >= a.tile_range.z1 && wz <= a.tile_range.z2
            );

            if (ann) {
                const c = ann.confidence === 'RESOLVED' ? 'â˜…' :
                          ann.confidence === 'INFERRED' ? 'â—†' : '?';
                row += c;
            } else {
                const cell = grid.find(g => g.x === wx && g.z === wz);
                row += cell?.type ?? '.';
            }
        }
        rows.push(row);
    }
    console.log(rows.join('\n'));
    console.log(`\nLegend: . Walkable | T Terrain | O Object | X Both | â˜… RESOLVED | â—† INFERRED`);
}

async function promptAnnotation(): Promise<void> {
    console.clear();
    console.log('â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
    console.log('â•‘   GEOMETRY ANNOTATION LAYER â€” Interactive Session           â•‘');
    console.log('â•‘   Your interpretation becomes permanent sovereign truth     â•‘');
    console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');

    const stats = gal.stats();
    console.log(`Current atlas: ${stats.total} annotations | ${stats.resolved} resolved | ${stats.regions} regions\n`);

    // Show existing annotations
    if (stats.total > 0) {
        console.log('Recent annotations:');
        const all = gal.getAllAnnotations().slice(-5);
        for (const a of all) {
            const nav = a.navigable ? 'âœ“' : 'âœ—';
            console.log(`  [${nav}] ${a.void_type} @ (${a.tile_range.x1}-${a.tile_range.x2}, ${a.tile_range.z1}-${a.tile_range.z2}, pl${a.region.plane})`);
        }
        console.log('');
    }

    console.log('Void types:');
    VOID_TYPES.forEach((t, i) => console.log(`  ${String(i + 1).padStart(2)}. ${t}`));
    console.log('');

    const regionInput = await ask('Enter region center (x,z,plane) or "quit": ');
    if (regionInput.toLowerCase() === 'quit') { rl.close(); return; }

    const [rx, rz, rp] = regionInput.split(',').map(Number);
    if (isNaN(rx) || isNaN(rz) || isNaN(rp)) {
        console.log('[ERR] Invalid format. Use: x,z,plane');
        await new Promise(r => setTimeout(r, 1500));
        return promptAnnotation();
    }

    // Get any existing annotations for this region to show overlay
    const existingAnns = gal.getRegionAnnotations(Math.floor(rx / 64), Math.floor(rz / 64), rp);

    // Blank grid placeholder (real grid would come from collision bake output)
    renderGrid([], existingAnns, rx, rz, rp);

    console.log(`\nAnnotating region centered at (${rx}, ${rz}, plane ${rp})`);

    const rangeInput = await ask('Tile range (x1,z1,x2,z2): ');
    const [x1, z1, x2, z2] = rangeInput.split(',').map(Number);
    if ([x1, z1, x2, z2].some(isNaN)) {
        console.log('[ERR] Invalid range');
        await new Promise(r => setTimeout(r, 1500));
        return promptAnnotation();
    }

    const voidInput = await ask(`Void type (1-${VOID_TYPES.length}): `);
    const void_type = VOID_TYPES[parseInt(voidInput) - 1] ?? 'unknown';

    const signal = await ask('Signal label (e.g. "pillar top with climb signal"): ');
    const navigableInput = await ask('Navigable? (y/n): ');
    const navigable = navigableInput.toLowerCase().startsWith('y');

    const confInput = await ask('Confidence: 1=RESOLVED, 2=INFERRED, 3=CONTESTED [1]: ');
    const confidence = confInput === '2' ? 'INFERRED' : confInput === '3' ? 'CONTESTED' : 'RESOLVED';

    const notes = await ask('Notes (optional, press enter to skip): ');
    const objIdsInput = await ask('Object IDs (comma-separated, or skip): ');
    const object_ids = objIdsInput.trim()
        ? objIdsInput.split(',').map(Number).filter(n => !isNaN(n))
        : undefined;

    const ann = gal.annotate({
        region:     { x: Math.floor(rx / 64), z: Math.floor(rz / 64), plane: rp },
        tile_range: { x1, z1, x2, z2 },
        void_type,
        navigable,
        signal,
        confidence,
        source:     'HUMAN',
        object_ids,
        notes:      notes || undefined,
    });

    // Auto-promote RESOLVED annotations to assumptions.md
    if (confidence === 'RESOLVED') {
        promoteToAssumptions(ann);
    }

    console.log(`\n[OK] â˜… Annotation committed: "${signal}"`);
    const another = await ask('\nAnnotate another region? (y/n): ');
    if (another.toLowerCase().startsWith('y')) {
        return promptAnnotation();
    }

    rl.close();
    console.log('\n[GAL] Session complete. Sovereign atlas updated.');
    gal.stats();
}

function promoteToAssumptions(ann: GeometryAnnotation) {
    const entry = `\n## [RESOLVED] ${ann.void_type} @ (${ann.tile_range.x1}-${ann.tile_range.x2}, ${ann.tile_range.z1}-${ann.tile_range.z2}, plane ${ann.region.plane})
- **Signal**: ${ann.signal}
- **Navigable**: ${ann.navigable}
- **Object IDs**: ${ann.object_ids?.join(', ') ?? 'none'}
- **Source**: HUMAN (GAL)
- **Timestamp**: ${ann.timestamp}
${ann.notes ? `- **Notes**: ${ann.notes}` : ''}
`;
    try {
        const existing = existsSync(ASSUMPTIONS_PATH) ? readFileSync(ASSUMPTIONS_PATH, 'utf-8') : '# Geometry Assumptions â€” Sovereign Atlas\n';
        writeFileSync(ASSUMPTIONS_PATH, existing + entry);
        console.log(`[GAL] â†‘ Promoted to assumptions.md`);
    } catch (e) {
        console.warn(`[GAL] Could not write assumptions.md: ${e}`);
    }
}

// â”€â”€â”€ RUN â”€â”€â”€
promptAnnotation();
