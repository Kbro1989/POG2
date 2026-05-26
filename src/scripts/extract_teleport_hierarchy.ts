import * as fs from 'fs';
import * as path from 'path';

const TABLES_DIR = 'D:/sovereign/atlas/logic/tables';
const OUTPUT_FILE = 'D:/sovereign/atlas/logic/menus_hierarchy.json';

interface DBRow {
    id: number;
    table: number;
    unk01?: {
        cols: number;
        columndata: Array<{
            id: number;
            flags: number;
            columns: Array<{
                type: number;
                value: any[];
            }>;
        }>;
    };
}

function loadTable(filename: string): DBRow[] {
    const p = path.join(TABLES_DIR, filename);
    if (!fs.existsSync(p)) {
        console.warn(`[WARN] File not found: ${p}`);
        return [];
    }
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/**
 * Extracts a specific column value by type ID.
 */
function getColumnValue(row: DBRow, colId: number, typeId: number): any[] | null {
    if (!row.unk01) return null;
    const colData = row.unk01.columndata.find(c => c.id === colId);
    if (!colData) return null;
    
    for (const c of colData.columns) {
        if (c.type === typeId) {
            return c.value;
        }
    }
    return null;
}

function extractHierarchy() {
    console.log('[1/4] Loading DBRow Tables...');
    const table20738 = loadTable('table_20738.json'); // Roots
    const table20994 = loadTable('table_20994.json'); // Categories
    const table21250 = loadTable('table_21250.json'); // Endpoints

    // Index mappings
    const nodeMap = new Map<number, DBRow>();
    table20994.forEach(r => nodeMap.set(r.id, r));
    table21250.forEach(r => nodeMap.set(r.id, r));

    console.log('[2/4] Parsing Database Relations...');
    const hierarchy: Record<string, any> = {};

    // For known root teleport nodes (e.g., table_20738)
    for (const root of table20738) {
        // e.g. 16900 is Teleport Jewelry root
        const rootChildrenIds = getColumnValue(root, 0, 74) as number[] || [];
        
        if (rootChildrenIds.length === 0) continue;

        const categoryNodes = [];

        for (const childId of rootChildrenIds) {
            const categoryRow = nodeMap.get(childId);
            if (!categoryRow) continue;

            const categoryName = getColumnValue(categoryRow, 0, 36)?.[0] || `Category_${childId}`;
            const endpointIds = getColumnValue(categoryRow, 1, 74) as number[] || [];

            const endpoints = [];
            for (const epId of endpointIds) {
                const epRow = nodeMap.get(epId);
                let epName = `Endpoint_${epId}`;
                const requirements: any[] = [];
                
                if (epRow) {
                    epName = getColumnValue(epRow, 0, 36)?.[0] || epName;
                    
                    // The requirements might be stored in other columns or types (like type 209 etc)
                    // Currently grabbing raw columns if exist
                    if (epRow.unk01) {
                        for (const col of epRow.unk01.columndata) {
                            for (const c of col.columns) {
                                if (c.type !== 36 && c.type !== 74) {
                                    requirements.push({ colId: col.id, type: c.type, value: c.value });
                                }
                            }
                        }
                    }
                }

                endpoints.push({
                    id: epId,
                    name: epName,
                    requirements
                });
            }

            categoryNodes.push({
                id: childId,
                name: categoryName,
                nodes: endpoints
            });
        }

        hierarchy[root.id] = {
            id: root.id,
            name: `Root_${root.id}`,
            children: categoryNodes
        };
    }

    console.log('[3/4] Exporting Hierarchy...');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(hierarchy, null, 2), 'utf8');
    console.log(`[4/4] Successfully written to ${OUTPUT_FILE}`);
}

extractHierarchy();
