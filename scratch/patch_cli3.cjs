const fs = require('fs');
const path = require('path');

const cliPath = 'D:/POG2/src/cli.ts';
let cli = fs.readFileSync(cliPath, 'utf8');

const oldStr = `            // Get storyboard scenes from Gutenberg
            const storyboard = engine.getStoryboard();
            const gutenberg = engine.getGutenberg();

            const segmentsRes = await gutenberg.getSequencedSegments(parseInt(bookId), parseInt(options.scenes));
            if (!segmentsRes.ok) {
                renderer.error(\`Failed to extract segments: \${segmentsRes.error.message}\`);
                process.exit(1);
            }

            // Convert segments to mock scenes for the forge
            const scenes = segmentsRes.value.map((seg: any, i: number) => ({
                index: i,
                description: seg.text.slice(0, 300),
                visualPrompts: [\`Scene \${i}: \${seg.text.slice(0, 100)}\`],
                speaker: undefined as string | undefined,
                dataType: undefined as string | undefined,
                modelId: undefined as number | undefined
            }));`;

const newStr = `            // Load existing storyboard scenes from the pipeline folder
            const pipelinesDir = path.join(getSovereignRoot(), 'pipelines');
            let storyboardPath = null;
            
            // Search for the book ID in the pipelines folder
            const searchPipelines = (dir: string) => {
                if (!fs.existsSync(dir)) return;
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    if (fs.statSync(fullPath).isDirectory()) {
                        if (item.startsWith(bookId + '_')) {
                            // Found the book folder
                            const sbDir = path.join(fullPath, '1-storyboard');
                            if (fs.existsSync(sbDir)) {
                                const files = fs.readdirSync(sbDir);
                                const jsonFile = files.find(f => f.endsWith('.json'));
                                if (jsonFile) {
                                    storyboardPath = path.join(sbDir, jsonFile);
                                    return;
                                }
                            }
                        } else {
                            searchPipelines(fullPath);
                        }
                    }
                }
            };
            searchPipelines(pipelinesDir);

            if (!storyboardPath || !fs.existsSync(storyboardPath)) {
                renderer.error(\`Storyboard for book \${bookId} not found in pipelines directory. You must run the storyboard pipeline first.\`);
                process.exit(1);
            }

            let scenes: any[] = [];
            try {
                const data = JSON.parse(fs.readFileSync(storyboardPath, 'utf8'));
                scenes = data.scenes || [];
            } catch (e: any) {
                renderer.error(\`Failed to parse storyboard JSON: \${e.message}\`);
                process.exit(1);
            }

            if (scenes.length === 0) {
                renderer.error(\`Storyboard file found, but 'scenes' array is empty.\`);
                process.exit(1);
            }

            // Trim to requested scene count
            const requestedCount = parseInt(options.scenes);
            if (scenes.length > requestedCount) {
                scenes = scenes.slice(0, requestedCount);
            }`;

if (cli.includes(oldStr)) {
    cli = cli.replace(oldStr, newStr);
    
    // Also ensure `path` and `fs` are imported if not already
    // but cli.ts already imports fs and path at the top
    fs.writeFileSync(cliPath, cli);
    console.log('[OK] Patched cli.ts to use existing storyboards');
} else {
    console.log('[FAIL] Could not find the target string in cli.ts');
}
