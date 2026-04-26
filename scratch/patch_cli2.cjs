const fs = require('fs');

const cliPath = 'D:/POG2/src/cli.ts';
let cli = fs.readFileSync(cliPath, 'utf8');

const targetStr = `        .action(async (bookId: string, options: { difficulty: string; scenes: string; enhanced: boolean }) => {
            const forensics = CacheForensicsLimb.getInstance();
            const pedagogy = new PedagogyLimb(client, forensics, getSovereignRoot());
            const questForge = new QuestForgeLimb(client, forensics, pedagogy);

            renderer.info(\`\\u{2692} Forging Quest Package for Book \${bookId}...\`);
            const health = questForge.healthCheck();
            if (!health.online) {
                renderer.error(\`QuestForge OFFLINE: \${health.details}\`);
                process.exit(1);
            }

            // Get storyboard scenes from Gutenberg
            const engine = new OrchestrateEngine(config, router, renderer);
            const storyboard = engine.getStoryboardLimb();
            const gutenberg = engine.getGutenbergLimb();

            const segmentsRes = await gutenberg.getSequencedSegments(parseInt(bookId), parseInt(options.scenes));
            if (!segmentsRes.ok) {
                renderer.error(\`Failed to extract segments: \${segmentsRes.error.message}\`);
                process.exit(1);
            }

            // Convert segments to mock scenes for the forge
            const scenes = segmentsRes.value.map((seg, i) => ({`;

const replacementStr = `        .action(async (bookId: string, options: { difficulty: string; scenes: string; enhanced: boolean }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const forensics = CacheForensicsLimb.getInstance();
            const pedagogy = engine.getPedagogy();
            const questForge = new QuestForgeLimb(client, forensics, pedagogy);

            renderer.info(\`\\u{2692} Forging Quest Package for Book \${bookId}...\`);
            const health = questForge.healthCheck();
            if (!health.online) {
                renderer.error(\`QuestForge OFFLINE: \${health.details}\`);
                process.exit(1);
            }

            // Get storyboard scenes from Gutenberg
            const storyboard = engine.getStoryboard();
            const gutenberg = engine.getGutenberg();

            const segmentsRes = await gutenberg.getSequencedSegments(parseInt(bookId), parseInt(options.scenes));
            if (!segmentsRes.ok) {
                renderer.error(\`Failed to extract segments: \${segmentsRes.error.message}\`);
                process.exit(1);
            }

            // Convert segments to mock scenes for the forge
            const scenes = segmentsRes.value.map((seg: any, i: number) => ({`;

if (cli.includes(targetStr)) {
    cli = cli.replace(targetStr, replacementStr);
    console.log('[OK] Patched cli.ts with exact string match');
} else {
    // Fallback regex approach if CRLF/LF issues exist
    cli = cli.replace(/const pedagogy = new PedagogyLimb\(client, forensics, getSovereignRoot\(\)\);/, 'const pedagogy = engine.getPedagogy();');
    cli = cli.replace(/const engine = new OrchestrateEngine\(config, router, renderer\);\s+const storyboard = engine\.getStoryboardLimb\(\);\s+const gutenberg = engine\.getGutenbergLimb\(\);/, 'const storyboard = engine.getStoryboard();\n            const gutenberg = engine.getGutenberg();');
    cli = cli.replace(/const forensics = CacheForensicsLimb\.getInstance\(\);/, 'const engine = new OrchestrateEngine(config, router, renderer);\n            const forensics = CacheForensicsLimb.getInstance();');
    cli = cli.replace(/segmentsRes\.value\.map\(\(seg, i\)/, 'segmentsRes.value.map((seg: any, i: number)');
    console.log('[OK] Patched cli.ts via regex');
}

fs.writeFileSync(cliPath, cli);
