const fs = require('fs');

const cliPath = 'D:/POG2/src/cli.ts';
let cli = fs.readFileSync(cliPath, 'utf8');

// 1. Add QuestForgeLimb import after the existing QuestSynthesisLimb or PipelineController references
if (!cli.includes('QuestForgeLimb')) {
    // Add import near the other limb imports
    const importAnchor = "import { SpatialVisionEngine } from './engines/SpatialVisionEngine.js';";
    const forgeImport = importAnchor + "\nimport { QuestForgeLimb } from './limbs/technical/QuestForgeLimb.js';";
    cli = cli.replace(importAnchor, forgeImport);
    console.log('[OK] Added QuestForgeLimb import');
} else {
    console.log('[SKIP] QuestForgeLimb import already present');
}

// 2. Add forge-quest subcommand under the pipeline command
if (!cli.includes('forge-quest')) {
    // Find the pipe.command('queue') section and insert before it
    const queueAnchor = "pipe\r\n        .command('queue')";
    const queueAnchorLF = "pipe\n        .command('queue')";
    
    const forgeCommand = `pipe
        .command('forge-quest <bookId>')
        .description('Forge a complete playable quest package from a Gutenberg book (spatial sandbox, NPCs, items, varbits)')
        .option('--difficulty <level>', 'Quest difficulty: Novice, Intermediate, Experienced, Master, Grandmaster', 'Intermediate')
        .option('--scenes <number>', 'Number of storyboard scenes to use', '9')
        .option('--enhanced', 'Use LLM for enhanced dialogue generation', false)
        .action(async (bookId: string, options: { difficulty: string; scenes: string; enhanced: boolean }) => {
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
            const scenes = segmentsRes.value.map((seg, i) => ({
                index: i,
                description: seg.text.slice(0, 300),
                visualPrompts: [\`Scene \${i}: \${seg.text.slice(0, 100)}\`],
                speaker: undefined as string | undefined,
                dataType: undefined as string | undefined,
                modelId: undefined as number | undefined
            }));

            const result = options.enhanced
                ? await questForge.forgeWithNarrative(\`Book_\${bookId}_Quest\`, scenes as any, options.difficulty)
                : await questForge.forgeQuest(\`Book_\${bookId}_Quest\`, scenes as any, options.difficulty);

            if (result.ok) {
                renderer.success(\`\\u{2705} Quest package forged at: \${result.value.exportPath}\`);
                renderer.json({
                    quest: result.value.quest.name,
                    stages: result.value.quest.stages.length,
                    npcs: result.value.sandbox.npcs.length,
                    items: result.value.items.length,
                    varbits: result.value.varbits.length,
                    sandbox: \`ms_\${result.value.sandbox.mapsquareX}_\${result.value.sandbox.mapsquareZ}\`,
                    difficulty: result.value.quest.difficulty,
                    exportPath: result.value.exportPath
                });
            } else {
                renderer.error(\`Quest forge failed: \${result.error.message}\`);
            }
            process.exit(result.ok ? 0 : 1);
        });

    `;

    if (cli.includes(queueAnchor)) {
        cli = cli.replace(queueAnchor, forgeCommand + "\n    " + queueAnchor);
        console.log('[OK] Added forge-quest CLI command (CRLF)');
    } else if (cli.includes(queueAnchorLF)) {
        cli = cli.replace(queueAnchorLF, forgeCommand + "\n    " + queueAnchorLF);
        console.log('[OK] Added forge-quest CLI command (LF)');
    } else {
        console.log('[WARN] Could not find queue anchor to insert forge-quest');
    }
} else {
    console.log('[SKIP] forge-quest already present');
}

fs.writeFileSync(cliPath, cli);
console.log('\n=== CLI patch complete ===');
