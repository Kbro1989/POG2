import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __local_dirname = typeof __dirname !== 'undefined' 
    ? __dirname 
    : path.dirname(fileURLToPath(import.meta.url));

const SCRIPT_DIR = __local_dirname;
const LOGIC_DIR = path.resolve(SCRIPT_DIR, "../../../d:/sovereign/atlas/logic"); // Fallback due to drive letters across machines
const ACTUAL_LOGIC_DIR = "D:\\sovereign\\atlas\\logic";
const OUT_FILE = path.resolve(SCRIPT_DIR, "../../../public/teleport_grounding.json");
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "../../");
const PROJECT_PUBLIC = path.join(PROJECT_ROOT, "public", "teleport_grounding.json");

// Define well-known teleport destinations to prepopulate the grounding manifest
const KNOWN_COORD_INJECTIONS: Record<number, {x: number, z: number, plane: number}> = {
    16902: { x: 3087, z: 3496, plane: 0 }, // Edgeville bank
    16903: { x: 2918, z: 3176, plane: 0 }, // Karamja
    16904: { x: 3105, z: 3251, plane: 0 }, // Draynor Village
    16905: { x: 3293, z: 3163, plane: 0 }, // Al Kharid
    // ... we can add more as they are discovered
};

const KNOWN_OBJECT_INJECTIONS: Record<number, {name: string, dest: {x: number, z: number, plane: number}}> = {
    102315: { name: "GE Minecart", dest: { x: 2874, z: 10168, plane: 0 } }, // GE -> Keldagrim approx
    28094: { name: "Keldagrim trapdoor", dest: { x: 3144, z: 3504, plane: 0 } } // Keldagrim -> GE approx
};

async function run() {
    console.log("🚀 Sovereign Server: Synthesizing Teleport Grounding Manifest...");
    
    let hierarchyPath = path.join(ACTUAL_LOGIC_DIR, "menus_hierarchy.json");
    if (!fs.existsSync(hierarchyPath)) {
        // Fallback to relative path if absolute fails
        hierarchyPath = path.join(PROJECT_ROOT, "menus_hierarchy.json"); 
        if (!fs.existsSync(hierarchyPath)) {
            console.error(`ERROR: Could not locate menus_hierarchy.json at ${ACTUAL_LOGIC_DIR}`);
            return;
        }
    }

    const hierarchyData = JSON.parse(fs.readFileSync(hierarchyPath, "utf-8"));
    const grounding: any = {
        region: "global",
        metadata: {
            source: "Sovereign Teleport Injection",
            description: "Ground truth for DBRow teleports and transport objects lacking native cache params",
            generated: new Date().toISOString()
        },
        endpoints: {},
        objects: KNOWN_OBJECT_INJECTIONS
    };

    // Recursively extract all leaf nodes
    const extractLeaves = (nodes: any[]) => {
        for (const node of nodes) {
            if (node.nodes && node.nodes.length > 0) {
                // Category node
                extractLeaves(node.nodes);
            } else if (node.children && node.children.length > 0) {
                 // Root node
                 extractLeaves(node.children);
            } else {
                // Leaf node (actual teleport endpoint)
                if (node.id) {
                    const knownCoords = KNOWN_COORD_INJECTIONS[node.id];
                    grounding.endpoints[node.id] = {
                        name: node.name,
                        dest: knownCoords ? knownCoords : null
                    };
                }
            }
        }
    };

    for (const rootKey of Object.keys(hierarchyData)) {
        const root = hierarchyData[rootKey];
        if (root.children) {
            extractLeaves(root.children);
        }
    }

    const totalEndpoints = Object.keys(grounding.endpoints).length;
    const resolvedEndpoints = Object.values(grounding.endpoints).filter((e: any) => e.dest !== null).length;

    fs.writeFileSync(PROJECT_PUBLIC, JSON.stringify(grounding, null, 2));
    
    console.log(`✅ Synthesized ${PROJECT_PUBLIC}`);
    console.log(`   - Total Endpoints Extracted: ${totalEndpoints}`);
    console.log(`   - Pre-populated Known Coords: ${resolvedEndpoints}`);
    console.log(`   - Objects Registered: ${Object.keys(grounding.objects).length}`);
}

run().catch(console.error);

