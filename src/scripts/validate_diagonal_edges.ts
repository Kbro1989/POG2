import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';
import { Coord, Direction, GameState } from '../core/models.js';

const mockState: GameState = {
    plane: 0,
    npcMap: new Map(),
    npcSpatialIndex: new Map(),
    objectMap: new Map(),
    varbits: new Map(),
    varps: new Map(),
    varcs: new Map(),
    players: new Map()
};

let passed = 0;
let failed = 0;

async function runTests() {
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║  SOVEREIGN MOVEMENT VALIDATOR — RSC PARITY SUITE       ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");

    const spatial = SpatialSovereigntyLimb.getInstance();
    const pathfinder = new DirectionalPathfinder(spatial);

    // --- HELPER: Build a 3x3 grid centered on (1,1) with configurable edges ---
    type EdgeSet = { northBlocked: boolean; southBlocked: boolean; eastBlocked: boolean; westBlocked: boolean };
    type TileSpec = { walkable: boolean; edges: EdgeSet };

    const defaultEdges = (): EdgeSet => ({ northBlocked: false, southBlocked: false, eastBlocked: false, westBlocked: false });
    const defaultTile = (walkable = true, edges?: Partial<EdgeSet>): TileSpec => ({
        walkable,
        edges: { ...defaultEdges(), ...edges }
    });

    const inject3x3 = (tiles: Record<string, TileSpec>) => {
        const matrix: any = {
            city: "test_grid",
            metadata: {}, anchors: {},
            meta: { bounds: { wx_min: 0, wx_max: 2, wy_min: 0, wy_max: 2 } },
            collision_matrix: {} as any
        };
        for (let x = 0; x <= 2; x++) {
            for (let y = 0; y <= 2; y++) {
                const key = `${x}_${y}`;
                const spec = tiles[key] || defaultTile();
                matrix.collision_matrix[key] = {
                    surfaceType: "terrain",
                    walkable: spec.walkable,
                    sourceFlags: 0,
                    edges: spec.edges
                };
            }
        }
        (spatial as any).loadedMatrices.clear();
        (spatial as any).loadedMatrices.set("test_grid", matrix);
    };

    const test = async (name: string, from: Coord, to: Coord, dir: Direction, expect: boolean) => {
        const allowed = await pathfinder.canMove(from, to, dir, mockState);
        const pass = allowed === expect;
        if (pass) passed++; else failed++;
        const icon = pass ? '✅' : '❌';
        console.log(`  ${icon} ${name.padEnd(50)} ${allowed ? 'ALLOWED' : 'BLOCKED'} (expect ${expect ? 'ALLOWED' : 'BLOCKED'})`);
    };

    const P0 = (x: number, y: number): Coord => ({ x, y, plane: 0 });

    // ═══════════════════════════════════════════════════════
    // SECTION 1: CARDINAL MOVEMENT
    // ═══════════════════════════════════════════════════════
    console.log("── SECTION 1: Cardinal Movement ──────────────────────");

    // 1a. Open field
    inject3x3({});
    await test("Open field → North",  P0(1,1), P0(1,2), 'north', true);
    await test("Open field → South",  P0(1,1), P0(1,0), 'south', true);
    await test("Open field → East",   P0(1,1), P0(2,1), 'east',  true);
    await test("Open field → West",   P0(1,1), P0(0,1), 'west',  true);

    // 1b. Target tile is solid
    inject3x3({ "1_2": defaultTile(false) });
    await test("North into solid tile",  P0(1,1), P0(1,2), 'north', false);

    // 1c. Wall on exit edge
    inject3x3({ "1_1": defaultTile(true, { northBlocked: true }) });
    await test("North wall on exit tile (from)", P0(1,1), P0(1,2), 'north', false);

    // 1d. Wall on entry edge (mirrored)
    inject3x3({ "1_2": defaultTile(true, { southBlocked: true }) });
    await test("South wall on entry tile (to)", P0(1,1), P0(1,2), 'north', false);

    // ═══════════════════════════════════════════════════════
    // SECTION 2: ONE-WAY WALL VERIFICATION
    // ═══════════════════════════════════════════════════════
    console.log("\n── SECTION 2: One-Way Wall Detection ─────────────────");

    // Wall only on from.north — blocks going north, but does NOT block going south from (1,2)
    inject3x3({ "1_1": defaultTile(true, { northBlocked: true }) });
    await test("North wall blocks NB travel",     P0(1,1), P0(1,2), 'north', false);
    await test("Same wall: south INTO north-walled = blocked", P0(1,2), P0(1,1), 'south', false);
    // ^ This SHOULD be true because (1,2).southBlocked is false and (1,1).northBlocked
    //   is only checked for EXIT from (1,1), not ENTRY into (1,1).
    //   WAIT: canTransit checks from.exit AND to.entry. If we move south FROM (1,2) TO (1,1):
    //   - from=(1,2), direction=south → check (1,2).southBlocked = false ✓
    //   - to=(1,1), reverseDir=north → check (1,1).northBlocked = true → BLOCKED
    //   So this SHOULD be false! The wall is bidirectional when properly mirrored.
    //   Let's correct the expectation:

    // Actually — let me think about this correctly:
    // In RSC, a wall object at tile (1,1) blocking north means:
    //   - You can't EXIT (1,1) going north
    //   - You can't ENTER (1,1) from the north (i.e., coming south from (1,2))
    // So (1,1).northBlocked blocks BOTH directions across that edge.
    // This IS the correct behavior — walls are bidirectional by edge.

    console.log("  ℹ️  Correcting: wall at (1,1).north blocks BOTH directions across that edge.");
    inject3x3({ "1_1": defaultTile(true, { northBlocked: true }) });
    await test("Reverse: south into north-walled tile", P0(1,2), P0(1,1), 'south', false);

    // True one-way wall would require mismatched edges (a bug we're trying to detect)
    // Let's verify that PROPERLY MIRRORED edges work correctly:
    inject3x3({
        "1_1": defaultTile(true, { northBlocked: true }),
        "1_2": defaultTile(true, { southBlocked: true })  // Mirror
    });
    await test("Double-mirrored wall: north blocked",  P0(1,1), P0(1,2), 'north', false);
    await test("Double-mirrored wall: south blocked",  P0(1,2), P0(1,1), 'south', false);

    // ═══════════════════════════════════════════════════════
    // SECTION 3: DIAGONAL CORNER-CLIPPING
    // ═══════════════════════════════════════════════════════
    console.log("\n── SECTION 3: Diagonal Corner-Clipping ───────────────");

    // 3a. Clean diagonal
    inject3x3({});
    await test("NE diagonal: open field",  P0(1,1), P0(2,2), 'north-east', true);
    await test("NW diagonal: open field",  P0(1,1), P0(0,2), 'north-west', true);
    await test("SE diagonal: open field",  P0(1,1), P0(2,0), 'south-east', true);
    await test("SW diagonal: open field",  P0(1,1), P0(0,0), 'south-west', true);

    // 3b. North wall blocks NE
    inject3x3({ "1_1": defaultTile(true, { northBlocked: true }) });
    await test("NE diagonal: north wall on from",  P0(1,1), P0(2,2), 'north-east', false);

    // 3c. East wall blocks NE
    inject3x3({ "1_1": defaultTile(true, { eastBlocked: true }) });
    await test("NE diagonal: east wall on from",   P0(1,1), P0(2,2), 'north-east', false);

    // 3d. Solid orthogonal neighbor blocks diagonal
    inject3x3({ "2_1": defaultTile(false) }); // East neighbor is solid
    await test("NE diagonal: east neighbor solid",  P0(1,1), P0(2,2), 'north-east', false);

    inject3x3({ "1_2": defaultTile(false) }); // North neighbor is solid
    await test("NE diagonal: north neighbor solid", P0(1,1), P0(2,2), 'north-east', false);

    // 3e. Target tile itself is solid
    inject3x3({ "2_2": defaultTile(false) });
    await test("NE diagonal: target solid",         P0(1,1), P0(2,2), 'north-east', false);

    // 3f. L-shaped wall (both cardinals blocked)
    inject3x3({ "1_1": defaultTile(true, { northBlocked: true, eastBlocked: true }) });
    await test("NE diagonal: L-wall on from",       P0(1,1), P0(2,2), 'north-east', false);

    // ═══════════════════════════════════════════════════════
    // SECTION 4: ALL 4 DIAGONAL DIRECTIONS WITH WALLS
    // ═══════════════════════════════════════════════════════
    console.log("\n── SECTION 4: All Diagonal Directions Wall Check ────");

    // NW: blocked by west wall
    inject3x3({ "1_1": defaultTile(true, { westBlocked: true }) });
    await test("NW diagonal: west wall on from",  P0(1,1), P0(0,2), 'north-west', false);

    // NW: blocked by north wall
    inject3x3({ "1_1": defaultTile(true, { northBlocked: true }) });
    await test("NW diagonal: north wall on from", P0(1,1), P0(0,2), 'north-west', false);

    // SE: blocked by south wall
    inject3x3({ "1_1": defaultTile(true, { southBlocked: true }) });
    await test("SE diagonal: south wall on from", P0(1,1), P0(2,0), 'south-east', false);

    // SE: blocked by east wall
    inject3x3({ "1_1": defaultTile(true, { eastBlocked: true }) });
    await test("SE diagonal: east wall on from",  P0(1,1), P0(2,0), 'south-east', false);

    // SW: blocked by south wall
    inject3x3({ "1_1": defaultTile(true, { southBlocked: true }) });
    await test("SW diagonal: south wall on from", P0(1,1), P0(0,0), 'south-west', false);

    // SW: blocked by west wall
    inject3x3({ "1_1": defaultTile(true, { westBlocked: true }) });
    await test("SW diagonal: west wall on from",  P0(1,1), P0(0,0), 'south-west', false);

    // ═══════════════════════════════════════════════════════
    // SECTION 5: ENTRY EDGE BLOCKING (target tile walls)
    // ═══════════════════════════════════════════════════════
    console.log("\n── SECTION 5: Entry Edge Blocking ─────────────────────");

    // Moving north: target has southBlocked (blocks entry from south)
    inject3x3({ "1_2": defaultTile(true, { southBlocked: true }) });
    await test("North: target south-wall blocks entry", P0(1,1), P0(1,2), 'north', false);

    // Moving east: target has westBlocked
    inject3x3({ "2_1": defaultTile(true, { westBlocked: true }) });
    await test("East: target west-wall blocks entry",   P0(1,1), P0(2,1), 'east', false);

    // Moving south: target has northBlocked
    inject3x3({ "1_0": defaultTile(true, { northBlocked: true }) });
    await test("South: target north-wall blocks entry", P0(1,1), P0(1,0), 'south', false);

    // Moving west: target has eastBlocked
    inject3x3({ "0_1": defaultTile(true, { eastBlocked: true }) });
    await test("West: target east-wall blocks entry",   P0(1,1), P0(0,1), 'west', false);

    // ═══════════════════════════════════════════════════════
    // SECTION 6: ALTERNATING WALL DIAGONAL SQUEEZE
    // The "silent killer" — A.eastBlocked + B.southBlocked
    // should still block NE diagonal even though walls are
    // on DIFFERENT tiles / DIFFERENT edges.
    // ═══════════════════════════════════════════════════════
    console.log("\n── SECTION 6: Alternating Wall Diagonal Squeeze ──────");

    // A=(1,1) has east wall, B=(2,2) has south wall
    // Moving NE from A to B should be blocked because:
    //   canTransit(east) checks A.eastBlocked = true → FAIL
    inject3x3({
        "1_1": defaultTile(true, { eastBlocked: true }),
        "2_2": defaultTile(true, { southBlocked: true })
    });
    await test("NE squeeze: A.east + B.south walls",    P0(1,1), P0(2,2), 'north-east', false);

    // Reverse: A=(1,1) has north wall, B=(2,2) has west wall
    inject3x3({
        "1_1": defaultTile(true, { northBlocked: true }),
        "2_2": defaultTile(true, { westBlocked: true })
    });
    await test("NE squeeze: A.north + B.west walls",    P0(1,1), P0(2,2), 'north-east', false);

    // Both walls on from tile (should block regardless)
    inject3x3({
        "1_1": defaultTile(true, { northBlocked: true, eastBlocked: true })
    });
    await test("NE squeeze: both walls on A",            P0(1,1), P0(2,2), 'north-east', false);

    // Only target has walls (entry blocking)
    inject3x3({
        "2_2": defaultTile(true, { southBlocked: true, westBlocked: true })
    });
    await test("NE squeeze: both walls on B (entry)",    P0(1,1), P0(2,2), 'north-east', false);

    // Cross-pattern: A.east + B.west (same edge axis, should double-block)
    inject3x3({
        "1_1": defaultTile(true, { eastBlocked: true }),
        "2_2": defaultTile(true, { westBlocked: true })
    });
    await test("NE squeeze: A.east + B.west cross-axis", P0(1,1), P0(2,2), 'north-east', false);

    // ═══════════════════════════════════════════════════════
    // RESULTS
    // ═══════════════════════════════════════════════════════
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log(`║  RESULTS: ${passed} passed, ${failed} failed${' '.repeat(Math.max(0, 33 - String(passed).length - String(failed).length))}║`);
    console.log("╚══════════════════════════════════════════════════════════╝");

    if (failed > 0) {
        console.log("\n⚠️  MOVEMENT MODEL HAS DEFECTS. Fix before proceeding.");
        process.exit(1);
    } else {
        console.log("\n🏆 RSC MOVEMENT PARITY ACHIEVED. All edge semantics valid.");

        // --- GOLDEN SNAPSHOT EXPORT ---
        const snapshot = {
            version: "1.0.0",
            generatedAt: new Date().toISOString(),
            testCount: passed,
            engine: "DirectionalPathfinder + SpatialSovereigntyLimb",
            contract: {
                canStand: "SpatialSovereigntyLimb.isWalkable(p, x, y) → bool",
                canTransit: "DirectionalPathfinder.canTransit(from, to, dir) → bool",
                diagonalRule: "canTransit(N) && canTransit(E) && isWalkable(orth1) && isWalkable(orth2)"
            },
            tests: [
                // Section 1
                { id: "S1.01", name: "Open field → North",  from: [1,1], to: [1,2], dir: "north", expect: true },
                { id: "S1.02", name: "Open field → South",  from: [1,1], to: [1,0], dir: "south", expect: true },
                { id: "S1.03", name: "Open field → East",   from: [1,1], to: [2,1], dir: "east",  expect: true },
                { id: "S1.04", name: "Open field → West",   from: [1,1], to: [0,1], dir: "west",  expect: true },
                { id: "S1.05", name: "North into solid tile", from: [1,1], to: [1,2], dir: "north", expect: false, targetSolid: true },
                { id: "S1.06", name: "North wall exit",      from: [1,1], to: [1,2], dir: "north", expect: false, fromEdge: "northBlocked" },
                { id: "S1.07", name: "South wall entry",     from: [1,1], to: [1,2], dir: "north", expect: false, toEdge: "southBlocked" },
                // Section 2
                { id: "S2.01", name: "Bidirectional wall N", from: [1,1], to: [1,2], dir: "north", expect: false, fromEdge: "northBlocked" },
                { id: "S2.02", name: "Bidirectional wall S", from: [1,2], to: [1,1], dir: "south", expect: false, toEdge: "northBlocked" },
                { id: "S2.03", name: "Reverse south into north-walled", from: [1,2], to: [1,1], dir: "south", expect: false },
                { id: "S2.04", name: "Double-mirrored N",   from: [1,1], to: [1,2], dir: "north", expect: false },
                { id: "S2.05", name: "Double-mirrored S",   from: [1,2], to: [1,1], dir: "south", expect: false },
                // Section 3
                { id: "S3.01", name: "NE open",             from: [1,1], to: [2,2], dir: "north-east", expect: true },
                { id: "S3.02", name: "NW open",             from: [1,1], to: [0,2], dir: "north-west", expect: true },
                { id: "S3.03", name: "SE open",             from: [1,1], to: [2,0], dir: "south-east", expect: true },
                { id: "S3.04", name: "SW open",             from: [1,1], to: [0,0], dir: "south-west", expect: true },
                { id: "S3.05", name: "NE north wall",       from: [1,1], to: [2,2], dir: "north-east", expect: false },
                { id: "S3.06", name: "NE east wall",        from: [1,1], to: [2,2], dir: "north-east", expect: false },
                { id: "S3.07", name: "NE east neighbor solid", from: [1,1], to: [2,2], dir: "north-east", expect: false },
                { id: "S3.08", name: "NE north neighbor solid", from: [1,1], to: [2,2], dir: "north-east", expect: false },
                { id: "S3.09", name: "NE target solid",     from: [1,1], to: [2,2], dir: "north-east", expect: false },
                { id: "S3.10", name: "NE L-wall",           from: [1,1], to: [2,2], dir: "north-east", expect: false },
                // Section 4
                { id: "S4.01", name: "NW west wall",        from: [1,1], to: [0,2], dir: "north-west", expect: false },
                { id: "S4.02", name: "NW north wall",       from: [1,1], to: [0,2], dir: "north-west", expect: false },
                { id: "S4.03", name: "SE south wall",       from: [1,1], to: [2,0], dir: "south-east", expect: false },
                { id: "S4.04", name: "SE east wall",        from: [1,1], to: [2,0], dir: "south-east", expect: false },
                { id: "S4.05", name: "SW south wall",       from: [1,1], to: [0,0], dir: "south-west", expect: false },
                { id: "S4.06", name: "SW west wall",        from: [1,1], to: [0,0], dir: "south-west", expect: false },
                // Section 5
                { id: "S5.01", name: "Entry south-wall N",  from: [1,1], to: [1,2], dir: "north", expect: false },
                { id: "S5.02", name: "Entry west-wall E",   from: [1,1], to: [2,1], dir: "east",  expect: false },
                { id: "S5.03", name: "Entry north-wall S",  from: [1,1], to: [1,0], dir: "south", expect: false },
                { id: "S5.04", name: "Entry east-wall W",   from: [1,1], to: [0,1], dir: "west",  expect: false },
                // Section 6
                { id: "S6.01", name: "NE squeeze A.east+B.south", from: [1,1], to: [2,2], dir: "north-east", expect: false },
                { id: "S6.02", name: "NE squeeze A.north+B.west", from: [1,1], to: [2,2], dir: "north-east", expect: false },
                { id: "S6.03", name: "NE squeeze both on A",      from: [1,1], to: [2,2], dir: "north-east", expect: false },
                { id: "S6.04", name: "NE squeeze both on B",      from: [1,1], to: [2,2], dir: "north-east", expect: false },
                { id: "S6.05", name: "NE squeeze cross-axis",     from: [1,1], to: [2,2], dir: "north-east", expect: false },
            ]
        };

        const fs = await import('fs');
        const snapshotPath = 'src/scripts/movement_parity_snapshot.json';
        fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
        console.log(`\n📸 Golden snapshot written: ${snapshotPath}`);
        process.exit(0);
    }
}

runTests();
