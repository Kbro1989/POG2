const fs = require('fs');

const cliPath = 'D:/POG2/src/cli.ts';
let cli = fs.readFileSync(cliPath, 'utf8');

if (!cli.includes('import { GameCacheLoader }')) {
    cli = cli.replace(/import \{ .* \} from '.*?';/m, "$&\nimport { GameCacheLoader } from './rsmv/cache/sqlite.js';\nimport { cacheMajors, cacheConfigPages } from './rsmv/constants.js';\nimport { parse } from './rsmv/opdecoder.js';");
}

const targetStr = `        .action(async (region: string) => {
            renderer.info(\`\\u{2692} Starting Targeted Grounding Extraction for: \${region}...\`);
            // This is a placeholder for the logic in extract_prifddinas_logic.ts
            // In a real implementation, we would use the Cache Learning substrate.
            renderer.warn("Extraction subsystem requires the Jagex Cache bridge to be fully active.");
            renderer.info("Tip: Use 'pog2 atlas spatial grounding' for pre-extracted data.");
        });`;

const newStr = `        .action(async (region: string) => {
            renderer.info(\`\\u{2692} Starting Targeted Grounding Extraction for: \${region}...\`);
            try {
                const [minX, minY, maxX, maxY] = region.split(',').map(Number);
                if (isNaN(minX) || isNaN(minY) || isNaN(maxX) || isNaN(maxY)) {
                    renderer.error("Invalid region format. Use minX,minY,maxX,maxY (e.g., 2112,3264,2432,3584)");
                    process.exit(1);
                }

                const CACHE_DIR = "C:\\\\ProgramData\\\\Jagex\\\\RuneScape";
                const source = new GameCacheLoader(CACHE_DIR);
                const results: any[] = [];
                const TABLE_ID = 39; // NPC Grounding

                renderer.info(\`Connecting to Jagex Cache bridge at \${CACHE_DIR}...\`);
                const archInfo = (await source.getCacheIndex(cacheMajors.config))[cacheConfigPages.dbrows];
                const arch = await source.getFileArchive(archInfo);
                
                renderer.info(\`Auditing \${arch.length} DBRows for Table \${TABLE_ID}...\`);

                for (const file of arch) {
                    if (file.buffer.length < 2 || file.buffer[1] !== TABLE_ID) continue;

                    try {
                        const row = parse.dbrows.read(file.buffer, source) as any;
                        const colGroups = row.unk01?.columndata || row.unk02?.columndata;
                        
                        if (colGroups) {
                            let coord: number | null = null;
                            let name: string = "Unknown NPC";
                            let npcId: number = 0;

                            for (const group of colGroups) {
                                for (const col of group.columns) {
                                    if (col.type === 33 || col.type === 22) {
                                        if (col.value?.[0] !== undefined) coord = Number(col.value[0]);
                                    }
                                    if (col.type === 36) {
                                        if (col.value?.[0] !== undefined) name = String(col.value[0]);
                                    }
                                    if (col.type === 32) {
                                        if (col.value?.[0] !== undefined) npcId = Number(col.value[0]);
                                    }
                                }
                            }

                            if (coord !== null) {
                                const x = (coord >> 14) & 0x3FFF;
                                const y = coord & 0x3FFF;
                                const plane = (coord >> 28);

                                if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                                    renderer.info(\`[TARGET FOUND] \${name} (ID: \${npcId}) at (\${x}, \${y}, \${plane})\`);
                                    results.push({ npcId, name, x, y, plane, rawCoord: coord, rowId: file.fileid });
                                }
                            }
                        }
                    } catch (e) {
                        // Skip malformed rows
                    }
                }

                const outputPath = \`D:/sovereign/memory/pedagogy/grounding_extraction_\${minX}_\${minY}.json\`;
                const fsModule = require('fs');
                fsModule.writeFileSync(outputPath, JSON.stringify(results, null, 2));
                renderer.info(\`\\u{2705} Successfully extracted \${results.length} entities to \${outputPath}\`);

                source.close();
            } catch (error: any) {
                renderer.error(\`Extraction failed: \${error.message}\`);
                process.exit(1);
            }
        });`;

if (cli.includes('// This is a placeholder for the logic in extract_prifddinas_logic.ts')) {
    // using regex because of possible unicode \u{2692} vs A encoding issues in the target string
    const replaceRegex = /\.action\(async \(region: string\) => \{[\s\S]*?Tip: Use 'pog2 atlas spatial grounding' for pre-extracted data\."\);\s*\}\);/;
    cli = cli.replace(replaceRegex, newStr);
    fs.writeFileSync(cliPath, cli);
    console.log('[OK] Patched cli.ts to enable live grounding extraction');
} else {
    console.log('[FAIL] Could not find placeholder in cli.ts');
}
