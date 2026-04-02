/**
 * GAL SEED — Pre-populate Known Resolved Geometry
 * 
 * Seeds the Geometry Annotation Layer with all spatial knowledge
 * already decoded during the Barrows, Prifddinas, and Keldagrim sessions.
 * 
 * These are RESOLVED facts — the sovereign reads them as ground truth.
 * 
 * Run: npx tsx src/tools/seed_gal.ts
 */

import { GeometryAnnotationLayer } from '../limbs/spatial/GeometryAnnotationLayer.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gal = new GeometryAnnotationLayer();

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   GAL SEED — Seeding sovereign with resolved geometry      ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// ═══════════════════════════════════════════════════════
// PRIFDDINAS — Tower of Voices (Plane 1)
// Center: (1696, 10448, Plane 1)
// Decoded: pillar tops, platform underside, waterfall face
// ═══════════════════════════════════════════════════════

const prif_region = { x: 26, z: 163, plane: 1 }; // 1696/64=26, 10448/64=163

gal.annotate({
    region: prif_region,
    tile_range: { x1: 1692, z1: 10453, x2: 1698, z2: 10455 },
    void_type: 'pillar_top',
    navigable: false,
    signal: 'Tower of Voices pillar tops — circular hard-block cluster at cliff edge',
    confidence: 'RESOLVED',
    source: 'HUMAN',
    notes: 'Circular T+X cluster visible in grid. NOT a wall — pillar tops viewed from above. No navmesh connection to plane 0.',
});

gal.annotate({
    region: prif_region,
    tile_range: { x1: 1688, z1: 10444, x2: 1710, z2: 10448 },
    void_type: 'platform_underside',
    navigable: false,
    signal: 'Cantilevered fishing platform underside — void half-moon south of tower',
    confidence: 'RESOLVED',
    source: 'HUMAN',
    notes: 'Void crescent below tower. Navigable_plane is 0 (ground floor), not this plane. Waterfall face on south wall.',
});

gal.annotate({
    region: prif_region,
    tile_range: { x1: 1690, z1: 10435, x2: 1695, z2: 10442 },
    void_type: 'waterfall_face',
    navigable: false,
    signal: 'Waterfall face — O cluster at cliff base, decorative nocollision',
    confidence: 'RESOLVED',
    source: 'HUMAN',
    notes: 'O placements are waterfall particle anchors. maybe_allows_lineofsight=true, not walkable.',
});

gal.annotate({
    region: prif_region,
    tile_range: { x1: 1700, z1: 10437, x2: 1705, z2: 10442 },
    void_type: 'agility_shortcut',
    navigable: true,
    signal: 'Crwys agility shortcut — tree crossing near waterfall',
    confidence: 'INFERRED',
    source: 'HUMAN',
    notes: 'Aligns with visible path in Crwys map screenshot. Navigable if agility level met.',
});

console.log('[OK] Prifddinas / Tower of Voices seeded (4 annotations)\n');

// ═══════════════════════════════════════════════════════
// HAVENHYTHE — Unreleased (Dead Smuggler Trail)
// Object IDs: 90898, 90899, 90900, 90901 (trail), 131591 (endpoint)
// ═══════════════════════════════════════════════════════

// Havenhythe coordinates are approximate pending raw JSON bake
const havenhythe_region = { x: 59, z: 51, plane: 0 }; // ~3827/64=59, ~3283/64=51

gal.annotate({
    region: havenhythe_region,
    tile_range: { x1: 3820, z1: 3278, x2: 3834, z2: 3290 },
    void_type: 'smuggler_trail',
    navigable: false,
    signal: 'Dead Smuggler trail — quest path marker objects blocking direct route',
    confidence: 'RESOLVED',
    source: 'ARCHAEOLOGIST',
    object_ids: [90898, 90899, 90900, 90901],
    notes: 'maybe_blocks_movement=true. tilt_xz=[32,32] (lying down). Forms quest discovery trail. unknown_A0:[367] = quest stage ref.',
});

gal.annotate({
    region: { x: 58, z: 51, plane: 0 },
    tile_range: { x1: 3705, z1: 3320, x2: 3720, z2: 3340 },
    void_type: 'quest_gate',
    navigable: false,
    signal: 'Havenhythe endpoint — Dead Smuggler destination (unreleased region)',
    confidence: 'RESOLVED',
    source: 'ARCHAEOLOGIST',
    object_ids: [131591],
    notes: 'Separate batch region (16_514) from trail (16_355). Confirms Havenhythe = trail endpoint, not origin.',
});

console.log('[OK] Havenhythe seeded (2 annotations)\n');

// ═══════════════════════════════════════════════════════
// KELDAGRIM — Mine Cart Transport System
// Object ID: 28094 (trapdoor)
// dummy_45: 11 = route index
// ═══════════════════════════════════════════════════════

const keld_region = { x: 43, z: 50, plane: 0 }; // approx GE area

gal.annotate({
    region: keld_region,
    tile_range: { x1: 2782, z1: 3232, x2: 2784, z2: 3234 },
    void_type: 'transport_trigger',
    navigable: true,
    signal: 'Keldagrim trapdoor — CS2-driven teleport to Keldagrim (dummy_45=11)',
    confidence: 'RESOLVED',
    source: 'ARCHAEOLOGIST',
    object_ids: [28094],
    notes: 'members_action_1:Travel, members_action_2:Quick-travel. No waypoint array in object config — pure CS2 VM teleport. Route index = dummy_45 value 11. mapscene=7.',
});

gal.annotate({
    region: { x: 44, z: 43, plane: 0 },
    tile_range: { x1: 2839, z1: 2773, x2: 2845, z2: 2778 },
    void_type: 'mine_cart_track',
    navigable: false,
    signal: 'Keldagrim mine cart track infrastructure — straight/corner/brake segments',
    confidence: 'RESOLVED',
    source: 'ARCHAEOLOGIST',
    object_ids: [83050, 83051, 83052, 83053, 83054, 83055, 83056, 83057, 83058, 83059],
    notes: 'Corner track (brakes) actions_0:Open gates confirms physical control mechanism. Track objects are probably_nocollision — cart entity walks the path, player teleports. Three-layer system: props(cache) + state(varbits) + movement(CS2).',
});

console.log('[OK] Keldagrim seeded (2 annotations)\n');

// ═══════════════════════════════════════════════════════
// BARROWS — Underground Crypt System
// ═══════════════════════════════════════════════════════

gal.annotate({
    region: { x: 55, z: 53, plane: 3 },
    tile_range: { x1: 3551, z1: 3394, x2: 3580, z2: 3420 },
    void_type: 'quest_gate',
    navigable: true,
    signal: 'Barrows underground crypt — plane 3, maze navigable with varbit gate state',
    confidence: 'INFERRED',
    source: 'HUMAN',
    notes: 'exploration_barrows.ts already mapped this. Collision gates = varbit-toggled. Plane 3 = underground layer.',
});

console.log('[OK] Barrows seeded (1 annotation)\n');

// ─── SUMMARY ───
const stats = gal.stats();
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log(`║  Total Annotations: ${String(stats.total).padStart(5)}                              ║`);
console.log(`║  RESOLVED:          ${String(stats.resolved).padStart(5)}                              ║`);
console.log(`║  Regions Covered:   ${String(stats.regions).padStart(5)}                              ║`);
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log('║  Sovereign atlas seeded. Human knowledge encoded.          ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
