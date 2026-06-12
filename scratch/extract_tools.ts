import { Project, SyntaxKind, ObjectLiteralExpression, CallExpression, ClassDeclaration } from 'ts-morph';

const project = new Project({
    tsConfigFilePath: 'tsconfig.json'
});

const TOOL_LIMB_MAP: Record<string, string> = {
    // ── Vision / Sensory ──
    sovereign_eye_capture:        'VisionEngine',
    puppeteer_eye_capture:        'VisionEngine',
    soverign_eye:                 'VisionEngine',
    probe_vision:                 'VisionEngine',
    sensory_capture:              'ChromaLimb',
    sovereign_visualize:          'ChromaLimb',
    link_chromatic_intent:        'ChromaLimb',
    visual_audit:                 'ChromaLimb',
    model_preview:                'VisionEngine',
    web_sense:                    'WebSensoryLimb',
    // ── Cache / Forensics ──
    cache_forensics_scan:         'CacheForensicsLimb',
    cache_forensics_query:        'CacheForensicsLimb',
    cache_forensics_cross_ref:    'CacheForensicsLimb',
    cache_forensics_lookup:       'CacheForensicsLimb',
    cache_learn_extract:          'CacheLearningLimb',
    hud_forensics_scan:           'CacheForensicsLimb',
    hud_forensics_batch:          'CacheForensicsLimb',
    // ── RSMV / 3D Substrate ──
    rsmv_extract:                 'rsmvExtractor',
    rsmv_view:                    'rsmvExtractor',
    rsmv_export:                  'rsmvExtractor',
    extract_rsmv:                 'rsmvExtractor',
    // ── Memory ──
    memory_inspect:               'VectorDB',
    memory_backup:                'VectorDB',
    memory_compress:              'VectorDB',
    memory_repair:                'VectorDB',
    memory_consolidate:           'MemoryConsolidationEngine',
    probe_db:                     'VectorDB',
    // ── Pedagogy / Gutenberg ──
    ingest_book:                  'GutenbergLimb',
    analyze_book_style:           'GutenbergLimb',
    list_library:                 'GutenbergLimb',
    read_book:                    'GutenbergLimb',
    search_gutenberg:             'GutenbergLimb',
    gutenberg_list:               'GutenbergLimb',
    gutenberg_search:             'GutenbergLimb',
    gutenberg_ingest:             'GutenbergLimb',
    gutenberg_read:               'GutenbergLimb',
    gutenberg_sync:               'GutenbergLimb',
    gutenberg_organize:           'GutenbergLimb',
    personality:                  'PedagogyLimb',
    absorb_wisdom:                'PedagogyLimb',
    personality_set:              'PedagogyLimb',
    personality_book:             'PedagogyLimb',
    // ── Storyboard / Creative ──
    generate_storyboard:          'StoryboardLimbV2',
    storyboard_create:            'StoryboardLimbV2',
    scaffold_webapp:              'WebAppForgeLimb',
    digest_component:             'WebAppForgeLimb',
    voice_narrate:                'VoiceLimb',
    probe_audio:                  'VoiceLimb',
    soundtrack_generate:          'SoundtrackLimb',
    video_create:                 'VideoAssemblerLimb',
    image_generate:               'NeuralForgeLimb',
    model_train:                  'NeuralForgeLimb',
    forge_concept:                'NeuralForgeLimb',
    // ── Metaphysical ──
    quantum_collapse:             'QuantumLimb',
    relic_query:                  'RelicLimb',
    relic_store_key:              'RelicLimb',
    // ── Clinical / Monitoring ──
    bio_verify:                   'BioIntelligenceLimb',
    validate_structure:           'BioIntelligenceLimb',
    monitor_integrity:            'PulseMonitor',
    healer_diagnose:              'SelfHealingEngine',
    // ── Metacognition ──
    reflect:                      'MetaCognitionEngine',
    consult_shadow:               'ShadowEngine',
    consult_memetics:             'MemeticEngine',
    consult_syntropy:             'SyntropyEngine',
    // ── Spatial / Gameplay ──
    spatial_sovereignty_init:     'SpatialSovereigntyLimb',
    spatial_query:                'SpatialSovereigntyLimb',
    mechanical_query:             'MechanicalSovereigntyLimb',
    proprioception_sync:          'MechanicalSovereigntyLimb',
    gameplay_sovereignty_volition:'GameplaySovereigntyLimb',
    entity_limb_memory:           'EntityLimb',
    entity_limb_action:           'EntityLimb',
    entity_limb_identity:         'EntityLimb',
    env_context:                  'EnvironmentLimb',
    // ── RSC / Network ──
    rsc_action:                   'RSCLimb',
    rsc_knock:                    'RSCLimb',
    // ── Pipeline ──
    run_pipeline:                 'PipelineController',
    run_batch_pipeline:           'PipelineController',
};

async function run() {
    const engineFile = project.getSourceFile('src/engines/OrchestrateEngine.ts');
    if (!engineFile) throw new Error('OrchestrateEngine.ts not found');

    const initializeToolsMethod = engineFile.getClass('OrchestrateEngine')?.getMethod('initializeTools');
    if (!initializeToolsMethod) throw new Error('initializeTools method not found');

    const statements = initializeToolsMethod.getBody()?.getStatements() || [];
    const callsToRemove: any[] = [];
    
    // limbName -> text[]
    const extractedTools: Record<string, string[]> = {};

    for (const stmt of statements) {
        if (stmt.getKind() === SyntaxKind.ExpressionStatement) {
            const expr = stmt.asKind(SyntaxKind.ExpressionStatement)?.getExpression();
            if (expr && expr.getKind() === SyntaxKind.CallExpression) {
                const callExpr = expr as CallExpression;
                const propAccess = callExpr.getExpression();
                if (propAccess.getText() === 'this.registry.register') {
                    const args = callExpr.getArguments();
                    if (args.length > 0 && args[0].getKind() === SyntaxKind.ObjectLiteralExpression) {
                        const obj = args[0] as ObjectLiteralExpression;
                        const nameProp = obj.getProperty('name');
                        if (nameProp && nameProp.getKind() === SyntaxKind.PropertyAssignment) {
                            const init = nameProp.asKind(SyntaxKind.PropertyAssignment)?.getInitializer();
                            if (init && init.getKind() === SyntaxKind.StringLiteral) {
                                const toolName = init.getText().replace(/['"]/g, '');
                                const targetLimb = TOOL_LIMB_MAP[toolName];
                                if (targetLimb) {
                                    if (!extractedTools[targetLimb]) {
                                        extractedTools[targetLimb] = [];
                                    }
                                    
                                    // Make sure we have the full text including `this.foo.execute(args)` bindings
                                    // The text of `obj` contains `this...` which must be replaced with `this...` but wait, in the limb it's also `this`?
                                    // Actually in OrchestrateEngine it calls methods on `this.sensory` etc.
                                    // If we move it to the Limb, `this.sensory.webSense` becomes `this.webSense`.
                                    // So we'll need to do some replacement if they have `this.` prefixes.
                                    // For now, let's just log what we find to see how hard it is to rewrite `execute`.
                                    
                                    console.log(`Found tool ${toolName} for limb ${targetLimb}`);
                                    callsToRemove.push(stmt);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    console.log(`Found ${callsToRemove.length} mapped tool registrations to extract.`);
}

run().catch(console.error);
