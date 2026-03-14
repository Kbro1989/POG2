
export enum NeuralCategory {
    CNS = 'CNS (Central Nervous System)',
    PNS = 'PNS (Peripheral Nervous System)',
    SENSORY = 'Sensory (Perception)',
    MEMORY = 'Memory (Hippocampus)',
    IMMUNE = 'Immune (Validation)',
    METABOLIC = 'Metabolic (Connective Tissue)'
}

export interface BiologicalFunction {
    organ: string;
    input: string;
    output: string;
    constraints: string;
}

export interface NeuralNode {
    path: string;
    role: string;
    category: NeuralCategory;
    biologicalRole?: BiologicalFunction;
    docDomain: 'CODE' | 'SYSTEM' | 'VISION' | 'CREATIVE' | 'MEMORY' | 'IMMUNE' | 'META';
    metabolicBaseCost: number;
}

export const NEUROLOGICAL_MAP: NeuralNode[] = [
    // â•â•â• CNS (Central Nervous System) â•â•â•
    {
        path: 'src/routing/HexagramManager.ts', role: 'Brainstem Life Support', category: NeuralCategory.CNS, docDomain: 'META', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Brainstem', input: 'SystemSensors', output: 'YaoState[6]', constraints: 'Always running; crash = death' }
    },
    {
        path: 'src/routing/HexagramManager.ts', role: 'Hexagram Cortex', category: NeuralCategory.CNS, docDomain: 'META', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Cortex', input: 'SystemSensors', output: 'Hexagram state transitions', constraints: 'Drives all YaoState changes' }
    },
    {
        path: 'src/core/HexagramDefinitions.ts', role: 'Hexagram DNA', category: NeuralCategory.CNS, docDomain: 'META', metabolicBaseCost: 2,
        biologicalRole: { organ: 'Genetic Code', input: 'Hexagram constants', output: 'Trigram/hexagram definitions', constraints: 'Immutable; reference only' }
    },
    {
        path: 'src/engines/OrchestrateEngine.ts', role: 'Prefrontal Cortex (Control)', category: NeuralCategory.CNS, docDomain: 'SYSTEM', metabolicBaseCost: 20,
        biologicalRole: { organ: 'Prefrontal Cortex', input: 'Task string', output: 'EngineOutput', constraints: 'Must await plan approval; rollback on failure' }
    },
    {
        path: 'src/routing/TernaryRouter.ts', role: 'Thalamus (Signal Routing)', category: NeuralCategory.CNS, docDomain: 'SYSTEM', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Thalamus', input: 'Task + complexity + YaoState', output: 'RouteDecision (model + provider)', constraints: 'Ollama-first; free-tier cloud only; records to TrainingCollector' }
    },
    {
        path: 'src/routing/WorkforceManifest.ts', role: 'Census/Inventory', category: NeuralCategory.CNS, docDomain: 'SYSTEM', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Hypothalamus', input: 'SovereignConfig', output: 'WorkerDefinition[]', constraints: 'Frozen roster; tier-based access' }
    },
    {
        path: 'src/routing/DomainLocker.ts', role: 'Access Control Gate', category: NeuralCategory.CNS, docDomain: 'IMMUNE', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Blood-Brain Barrier', input: 'Domain + model', output: 'Allow/deny', constraints: 'Prevents unauthorized domain access' }
    },
    {
        path: 'src/clients/ModelClient.ts', role: 'Neural Axon (API Layer)', category: NeuralCategory.CNS, docDomain: 'SYSTEM', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Axon', input: 'ModelCallParams', output: 'ModelResponse', constraints: 'Records to D:\\ training; invokes EndpointHealer on failure' }
    },
    {
        path: 'src/ToolRegistry.ts', role: 'Motor Cortex Registry', category: NeuralCategory.CNS, docDomain: 'CODE', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Motor Cortex', input: 'Tool definitions', output: 'Registered tools for dispatch', constraints: 'Central tool catalog' }
    },
    {
        path: 'src/cli.ts', role: 'Spinal Cord (Entry Point)', category: NeuralCategory.CNS, docDomain: 'SYSTEM', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Spinal Cord', input: 'Terminal input', output: 'Renderer output', constraints: 'Bootstraps entire system' }
    },
    {
        path: 'src/engines/CognitiveEngine.ts', role: 'Logical Reasoner (Cognitive)', category: NeuralCategory.CNS, docDomain: 'SYSTEM', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Cerebral Cortex', input: 'Task history + context', output: 'Logical inferences', constraints: 'Ollama text models' }
    },
    {
        path: 'src/engines/PipelineController.ts', role: 'Workflow Orchestrator', category: NeuralCategory.CNS, docDomain: 'SYSTEM', metabolicBaseCost: 25,
        biologicalRole: { organ: 'Central Nervous Center', input: 'Pipeline definitions', output: 'Executed production cycles', constraints: 'Sequential/Parallel execution' }
    },

    // â•â•â• PNS (Peripheral Nervous System â€” Limbs) â•â•â•
    {
        path: 'src/engines/CodeEngine.ts', role: 'Motor Hand (Code)', category: NeuralCategory.PNS, docDomain: 'CODE', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Right Hand', input: 'Code review params', output: 'Code analysis', constraints: 'Read-only analysis limb' }
    },
    {
        path: 'src/engines/GenerateEngine.ts', role: 'Creative Hand', category: NeuralCategory.PNS, docDomain: 'CODE', metabolicBaseCost: 20,
        biologicalRole: { organ: 'Left Hand', input: 'Task + language + targetFile', output: 'Generated code', constraints: 'Writes to filesystem; adversarial review for Yang' }
    },
    {
        path: 'src/engines/ShellEngine.ts', role: 'Mechanical Arm', category: NeuralCategory.PNS, docDomain: 'SYSTEM', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Arm', input: 'ShellParams (command, cwd)', output: 'stdout/stderr + telemetry', constraints: 'Requires operator approval; POG2_ACTIVE env' }
    },
    {
        path: 'src/engines/ShellLibrary.ts', role: 'Tool Belt', category: NeuralCategory.PNS, docDomain: 'SYSTEM', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Utility Belt', input: 'Shell command templates', output: 'Pre-built shell operations', constraints: 'Common operations library' }
    },
    {
        path: 'src/engines/WebSearchEngine.ts', role: 'Exploration Limb', category: NeuralCategory.PNS, docDomain: 'VISION', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Leg', input: 'Search query', output: 'Web results', constraints: 'Network dependent' }
    },
    {
        path: 'src/engines/CompletionEngine.ts', role: 'Reflex Arc', category: NeuralCategory.PNS, docDomain: 'CODE', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Reflex', input: 'Partial input', output: 'Autocomplete suggestions', constraints: 'Low-latency; Yin complexity only' }
    },
    {
        path: 'src/engines/TodoEngine.ts', role: 'Task Scheduler Limb', category: NeuralCategory.PNS, docDomain: 'SYSTEM', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Planner Muscle', input: 'Plan steps', output: 'Sequenced Todo[]', constraints: 'Supports rollback; proprioception-backed' }
    },
    {
        path: 'src/engines/MCPEngine.ts', role: 'External Nerve Interface', category: NeuralCategory.PNS, docDomain: 'SYSTEM', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Peripheral Nerve', input: 'MCP server config', output: 'External tool calls', constraints: 'Protocol-bound; JSON-RPC' }
    },
    {
        path: 'src/engines/ChromanumberEngine.ts', role: 'Color Vision Processor', category: NeuralCategory.PNS, docDomain: 'VISION', metabolicBaseCost: 40,
        biologicalRole: { organ: 'Cone Cells', input: 'Image/hex colors', output: 'Color analysis + palette', constraints: 'Chromanumber domain only' }
    },
    {
        path: 'src/engines/MultiModelExecutor.ts', role: 'Parallel Muscle Fiber', category: NeuralCategory.PNS, docDomain: 'SYSTEM', metabolicBaseCost: 30,
        biologicalRole: { organ: 'Muscle Fiber', input: 'Task + multiple models', output: 'Consensus result', constraints: 'Parallel execution; resource intensive' }
    },
    {
        path: 'src/limbs/spatial/RSCLimb.ts', role: 'Tactile Link (RSC)', category: NeuralCategory.PNS, docDomain: 'CODE', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Tactile Nerve', input: 'RSC game data', output: 'Parsed game structures', constraints: 'Game-specific limb' }
    },
    {
        path: 'src/limbs/creative/YouTubeLimb.ts', role: 'Visual Streamer (YouTube)', category: NeuralCategory.PNS, docDomain: 'CREATIVE', metabolicBaseCost: 20,
        biologicalRole: { organ: 'Optic Transmission', input: 'Video artifacts', output: 'YouTube uploads', constraints: 'OAuth2 required; RFC 8252' }
    },
    {
        path: 'src/limbs/creative/VideoAssemblerLimb.ts', role: 'Muscle Coordination (Video)', category: NeuralCategory.PNS, docDomain: 'CREATIVE', metabolicBaseCost: 50,
        biologicalRole: { organ: 'Motor Control', input: 'Audio/Image components', output: 'Consolidated Video', constraints: 'Depends on FFmpeg' }
    },
    {
        path: 'src/limbs/creative/GutenbergLimb.ts', role: 'Literary Ingestion (Gutenberg)', category: NeuralCategory.PNS, docDomain: 'CREATIVE', metabolicBaseCost: 25,
        biologicalRole: { organ: 'Language Center', input: 'Book ID/Content', output: 'Ingested Metadata', constraints: 'SHA-256 checksum required' }
    },
    {
        path: 'src/limbs/creative/StoryboardLimb.ts', role: 'Narrative Visualization', category: NeuralCategory.PNS, docDomain: 'CREATIVE', metabolicBaseCost: 35,
        biologicalRole: { organ: 'Visualization Center', input: 'Book ID', output: 'Storyboard Scenes', constraints: 'Depends on GutenbergLimb' }
    },
    {
        path: 'src/limbs/creative/WebAppForgeLimb.ts', role: 'Project Architect (WebApp)', category: NeuralCategory.PNS, docDomain: 'CODE', metabolicBaseCost: 45,
        biologicalRole: { organ: 'Creative Execution', input: 'Blueprint/Prompt', output: 'Scaffolded Project', constraints: 'Vite/Tailwind default' }
    },
    // --- Phase 48: New Physicalized Limbs ---
    {
        path: 'src/limbs/technical/AILimb.ts', role: 'Neural Orchestration Interface', category: NeuralCategory.CNS, docDomain: 'SYSTEM', metabolicBaseCost: 10,
        biologicalRole: { organ: 'DLPFC', input: 'AI Capability Request', output: 'Capability Execution', constraints: 'Central AI control' }
    },
    {
        path: 'src/limbs/technical/ControlPlaneLimb.ts', role: 'Substrate Management', category: NeuralCategory.CNS, docDomain: 'SYSTEM', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Brainstem Regulatory', input: 'System state', output: 'Regulatory Action', constraints: 'High severity' }
    },
    {
        path: 'src/monitor/SwitchboardLimb.ts', role: 'Visual Workflow Routing', category: NeuralCategory.CNS, docDomain: 'SYSTEM', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Routing Hub', input: 'Pipeline definition', output: 'Execution flow', constraints: 'N8N analogue' }
    },
    {
        path: 'src/limbs/technical/EntityLimb.ts', role: 'Persistent Actor Management', category: NeuralCategory.MEMORY, docDomain: 'MEMORY', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Identity Center', input: 'Entity ID', output: 'Entity State', constraints: 'SQLite-backed' }
    },
    {
        path: 'src/limbs/technical/EnvironmentLimb.ts', role: 'OS Context Bridge', category: NeuralCategory.METABOLIC, docDomain: 'SYSTEM', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Sensorimotor Bridge', input: 'ENV/OS query', output: 'System Context', constraints: 'Read-only preferred' }
    },
    {
        path: 'src/limbs/creative/MediaForgeLimb.ts', role: 'Media Synthesis (Image/Video)', category: NeuralCategory.PNS, docDomain: 'CREATIVE', metabolicBaseCost: 40,
        biologicalRole: { organ: 'Visual Synthesis', input: 'Visual Prompt', output: 'Media Artifact', constraints: 'Flux/SD models' }
    },
    {
        path: 'src/limbs/creative/VoiceLimb.ts', role: 'Auditory/UI Feedback', category: NeuralCategory.METABOLIC, docDomain: 'CREATIVE', metabolicBaseCost: 30,
        biologicalRole: { organ: 'Broca Area', input: 'Text/Prosody', output: 'Speech/UI Resonance', constraints: 'Low latency' }
    },
    {
        path: 'src/limbs/creative/NeuralForgeLimb.ts', role: 'Advanced Generative Logic', category: NeuralCategory.PNS, docDomain: 'CODE', metabolicBaseCost: 25,
        biologicalRole: { organ: 'Ideation Center', input: 'Abstract concept', output: 'Logic Structure', constraints: 'High temperature planning' }
    },
    {
        path: 'src/limbs/spatial/WebSensoryLimb.ts', role: 'Web Perception (DOM)', category: NeuralCategory.SENSORY, docDomain: 'VISION', metabolicBaseCost: 20,
        biologicalRole: { organ: 'Cyber-Retina', input: 'URL/DOM', output: 'Semantic View', constraints: 'Browsing capable' }
    },
    {
        path: 'src/limbs/spatial/ChromaLimb.ts', role: 'Color/Palette Extraction', category: NeuralCategory.SENSORY, docDomain: 'VISION', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Color Vision', input: 'Image buffer', output: 'Chromanumber Palette', constraints: 'High precision' }
    },
    {
        path: 'src/engines/DiscoveryEngine.ts', role: 'Information Forager (Wiki)', category: NeuralCategory.SENSORY, docDomain: 'SYSTEM', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Exploratory Drive', input: 'Search terms', output: 'Wisdom context (Wikipedia)', constraints: 'Network dependent' }
    },
    {
        path: 'src/engines/ShadowEngine.ts', role: 'Proprioception (External Repository)', category: NeuralCategory.SENSORY, docDomain: 'SYSTEM', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Spatial Memory', input: 'Repository state', output: 'Active node maps', constraints: 'Tracks shadow substrate' }
    },
    {
        path: 'src/limbs/spatial/BioIntelligenceLimb.ts', role: 'Clinical/Biological Reasoning', category: NeuralCategory.PNS, docDomain: 'SYSTEM', metabolicBaseCost: 20,
        biologicalRole: { organ: 'Scientific Cortex', input: 'Medical/Bio data', output: 'Clinical Diagnostic', constraints: 'High fidelity ONLY' }
    },
    {
        path: 'src/limbs/metaphysical/GhostLimb.ts', role: 'Adversarial Reflection', category: NeuralCategory.IMMUNE, docDomain: 'IMMUNE', metabolicBaseCost: 30,
        biologicalRole: { organ: 'Shadow Self', input: 'Self-thought', output: 'Criticism/Audit', constraints: 'No-holding-back' }
    },
    {
        path: 'src/limbs/metaphysical/QuantumLimb.ts', role: 'Probabilistic Execution', category: NeuralCategory.CNS, docDomain: 'META', metabolicBaseCost: 40,
        biologicalRole: { organ: 'Quantum Superposition', input: 'Decision parameters', output: 'Collapsed result', constraints: 'Multi-path' }
    },
    {
        path: 'src/limbs/metaphysical/OmegaLimb.ts', role: 'Terminal Objective Verification', category: NeuralCategory.IMMUNE, docDomain: 'IMMUNE', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Final Auditor', input: 'Project state', output: 'Objective score', constraints: 'Closes the loop' }
    },
    {
        path: 'src/limbs/metaphysical/RelicLimb.ts', role: 'Archival/Legacy Integration', category: NeuralCategory.MEMORY, docDomain: 'MEMORY', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Ancient Memory', input: 'Legacy query', output: 'Historical context', constraints: 'Read-only archival' }
    },
    {
        path: 'src/engines/VSCodeEngine.ts', role: 'IDE Nerve Bridge', category: NeuralCategory.PNS, docDomain: 'CODE', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Finger', input: 'VSCode commands', output: 'Editor state changes', constraints: 'VSCode API dependent' }
    },

    // â•â•â• Sensory (Perception) â•â•â•
    {
        path: 'src/engines/VisionEngine.ts', role: 'Optic Nerve', category: NeuralCategory.SENSORY, docDomain: 'VISION', metabolicBaseCost: 25,
        biologicalRole: { organ: 'Eye', input: 'Image/screenshot buffer', output: 'Vision analysis', constraints: 'Requires vision model (moondream)' }
    },
    {
        path: 'src/engines/SpatialVisionEngine.ts', role: 'Spatial Perception', category: NeuralCategory.SENSORY, docDomain: 'VISION', metabolicBaseCost: 20,
        biologicalRole: { organ: 'Spatial Cortex', input: 'Screenshot + coordinates', output: 'Spatial awareness data', constraints: 'Combines vision + location' }
    },
    {
        path: 'src/core/SovereignEye.ts', role: 'Retinal Capture', category: NeuralCategory.SENSORY, docDomain: 'VISION', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Retina', input: 'Screen coordinates', output: 'Screenshot buffer', constraints: 'Windows only; PowerShell capture' }
    },
    {
        path: 'src/monitor/PulseMonitor.ts', role: 'Heartbeat Monitor', category: NeuralCategory.SENSORY, docDomain: 'SYSTEM', metabolicBaseCost: 2,
        biologicalRole: { organ: 'Heart', input: 'Filesystem + process state', output: 'SystemSensors', constraints: '60s pulse interval; disk health check' }
    },
    {
        path: 'src/monitor/NodeTester.ts', role: 'Nerve Conduction Test', category: NeuralCategory.SENSORY, docDomain: 'SYSTEM', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Diagnostic Probe', input: 'NeurologicalMap nodes', output: 'Node health status[]', constraints: 'File existence + import check' }
    },
    {
        path: 'src/engines/ContextBuilder.ts', role: 'Contextual Awareness', category: NeuralCategory.SENSORY, docDomain: 'MEMORY', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Associative Cortex', input: 'Task + history + tools', output: 'Rich context bundle', constraints: 'Assembles context for routing decisions' }
    },

    // â•â•â• Memory (Hippocampus) â•â•â•
    {
        path: 'src/utils/VectorDB.ts', role: 'Deep Metabolic Memory', category: NeuralCategory.MEMORY, docDomain: 'MEMORY', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Hippocampus', input: 'Lesson text + embeddings', output: 'Similarity search results', constraints: 'SQLite-backed; SHA-256 dedup' }
    },
    {
        path: 'src/state/StateManager.ts', role: 'Working Memory', category: NeuralCategory.MEMORY, docDomain: 'MEMORY', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Prefrontal Cache', input: 'Session state', output: 'Context recall', constraints: 'Ephemeral; cleared per session' }
    },
    {
        path: 'src/utils/SovereignProprioception.ts', role: 'Proprioceptive Reflection', category: NeuralCategory.MEMORY, docDomain: 'META', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Cerebellum', input: 'Task + result + YaoState', output: 'Walkthrough log', constraints: 'File-backed; brainPath resolution' }
    },
    {
        path: 'src/utils/TrainingCollector.ts', role: 'Training Corpus', category: NeuralCategory.MEMORY, docDomain: 'MEMORY', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Long-term Memory', input: 'Interactions + decisions + YaoState + metrics', output: 'JSONL training files', constraints: 'D:\\ sovereign; never in project folder' }
    },
    {
        path: 'src/engines/EmbedEngine.ts', role: 'Embedding Generator', category: NeuralCategory.MEMORY, docDomain: 'MEMORY', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Memory Encoder', input: 'Text', output: 'Float32Array embeddings', constraints: 'Model-dependent; local or cloud' }
    },
    {
        path: 'src/engines/MemoryConsolidationEngine.ts', role: 'Semantic Weaver', category: NeuralCategory.MEMORY, docDomain: 'MEMORY', metabolicBaseCost: 20,
        biologicalRole: { organ: 'Synaptic Pruning', input: 'Raw Interactions', output: 'Consolidated Wisdom', constraints: 'Runs during metabolic slowdown' }
    },
    {
        path: 'src/engines/MemeticEngine.ts', role: 'Cultural Record (Browser)', category: NeuralCategory.MEMORY, docDomain: 'MEMORY', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Learned Patterns', input: 'History/Bookmarks', output: 'Research Shards', constraints: 'Local profile dependent' }
    },
    { path: 'resources/cloudflare-templates', role: 'Knowledge:Cloudflare', category: NeuralCategory.MEMORY, docDomain: 'MEMORY', metabolicBaseCost: 5 },

    // â•â•â• Immune (Validation) â•â•â•
    {
        path: 'src/engines/ValidationSystem.ts', role: 'White Blood Cells', category: NeuralCategory.IMMUNE, docDomain: 'IMMUNE', metabolicBaseCost: 10,
        biologicalRole: { organ: 'WBC', input: 'Code output', output: 'Validation result', constraints: 'Schema-based validation' }
    },
    {
        path: 'src/engines/IntentVerifier.ts', role: 'Antibody Verifier', category: NeuralCategory.IMMUNE, docDomain: 'IMMUNE', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Antibody', input: 'Task + output', output: 'Alignment score + correction', constraints: 'Post-action verification' }
    },
    {
        path: 'src/engines/SelfHealingEngine.ts', role: 'T-Cell Repair', category: NeuralCategory.IMMUNE, docDomain: 'IMMUNE', metabolicBaseCost: 20,
        biologicalRole: { organ: 'T-Cell', input: 'Error + context', output: 'Repair attempt', constraints: 'Planned drift only' }
    },
    {
        path: 'src/utils/ClinicalAuditTool.ts', role: 'Antibody Sentry', category: NeuralCategory.IMMUNE, docDomain: 'IMMUNE', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Sentry', input: 'File/directory path', output: 'AuditResult[] with violations', constraints: 'No mocks; no placeholders; no console.log' }
    },
    {
        path: 'src/utils/EndpointHealer.ts', role: 'Endpoint Auto-Repair', category: NeuralCategory.IMMUNE, docDomain: 'IMMUNE', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Immune Response', input: 'Failed provider + error', output: 'HealerDiagnostic', constraints: 'Shell-based; 10s timeout per check' }
    },
    {
        path: 'src/engines/ArchitecturalValidator.ts', role: 'Structural Antibody', category: NeuralCategory.IMMUNE, docDomain: 'IMMUNE', metabolicBaseCost: 20,
        biologicalRole: { organ: 'Structural Check', input: 'Code architecture', output: 'Architecture health report', constraints: 'Validates patterns and dependencies' }
    },
    {
        path: 'src/engines/ASTWatcher.ts', role: 'Mutation Detector', category: NeuralCategory.IMMUNE, docDomain: 'IMMUNE', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Mutation Scanner', input: 'File change events', output: 'AST diff + mutation report', constraints: 'Real-time file watching' }
    },

    // â•â•â• Metabolic (Connective Tissue) â•â•â•
    {
        path: 'src/utils/PathNormalizer.ts', role: 'Cartilage', category: NeuralCategory.METABOLIC, docDomain: 'SYSTEM', metabolicBaseCost: 2,
        biologicalRole: { organ: 'Cartilage', input: 'Raw path', output: 'Normalized path', constraints: 'Platform-aware' }
    },
    {
        path: 'src/utils/CognitiveTranslator.ts', role: 'Neural Connector', category: NeuralCategory.METABOLIC, docDomain: 'META', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Synapse', input: 'Natural language', output: 'Structured intent', constraints: 'Translation layer' }
    },
    {
        path: 'src/types/core.ts', role: 'DNA Substrate', category: NeuralCategory.METABOLIC, docDomain: 'META', metabolicBaseCost: 1,
        biologicalRole: { organ: 'DNA', input: 'Type definitions', output: 'Shared interfaces', constraints: 'Immutable base types' }
    },
    {
        path: 'src/types/SovereignDomain.ts', role: 'Domain Taxonomy', category: NeuralCategory.METABOLIC, docDomain: 'META', metabolicBaseCost: 1,
        biologicalRole: { organ: 'Taxonomy', input: 'Domain enums', output: 'SovereignDomain constants', constraints: 'Defines all operational domains' }
    },
    {
        path: 'src/config/SovereignConfig.ts', role: 'Genome Configuration', category: NeuralCategory.METABOLIC, docDomain: 'META', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Genome', input: 'JSON config file', output: 'SovereignConfig interface', constraints: 'Bootstrap-time; immutable after load' }
    },
    {
        path: 'src/utils/SovereignPathResolver.ts', role: 'Vascular System', category: NeuralCategory.METABOLIC, docDomain: 'SYSTEM', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Arteries', input: 'Path tier + subpath', output: 'Resolved D:\\ / home / project path', constraints: 'D:\\ sovereign preferred; auto-creates dirs' }
    },
    {
        path: 'src/utils/CodeExtractor.ts', role: 'Enzyme', category: NeuralCategory.METABOLIC, docDomain: 'CODE', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Enzyme', input: 'Raw model output', output: 'Extracted code block', constraints: 'Parsing utility' }
    },
    {
        path: 'src/utils/JsonExtractor.ts', role: 'Digestive Enzyme', category: NeuralCategory.METABOLIC, docDomain: 'CODE', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Digestive Enzyme', input: 'Raw model output', output: 'Parsed JSON', constraints: 'Handles markdown fences' }
    },
    {
        path: 'src/utils/DBMaintenance.ts', role: 'Cellular Cleanup', category: NeuralCategory.METABOLIC, docDomain: 'MEMORY', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Autophagy', input: 'Database state', output: 'Cleaned/optimized DB', constraints: 'Periodic maintenance' }
    },
    {
        path: 'src/ui/Renderer.ts', role: 'Nervous System Output', category: NeuralCategory.METABOLIC, docDomain: 'CREATIVE', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Motor Output', input: 'Engine results', output: 'Terminal display', constraints: 'Plain English; human-readable' }
    },
    {
        path: 'src/prompts/SystemPrompts.ts', role: 'Instinct Library', category: NeuralCategory.METABOLIC, docDomain: 'META', metabolicBaseCost: 2,
        biologicalRole: { organ: 'Instinct', input: 'Domain context', output: 'System prompt strings', constraints: 'Sovereign-compliant prompts' }
    },
    {
        path: 'src/api/ai/CapabilityRegistry.ts', role: 'Capability Genome', category: NeuralCategory.METABOLIC, docDomain: 'SYSTEM', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Gene Expression', input: 'AI service types', output: 'Capability definitions', constraints: 'Registry of AI capabilities' }
    },
    {
        path: 'src/api/ai/Dispatcher.ts', role: 'Signal Dispatcher', category: NeuralCategory.METABOLIC, docDomain: 'SYSTEM', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Neurotransmitter', input: 'DispatchRequest', output: 'DispatchResponse', constraints: 'Routes to Ollama/Gemini/CF' }
    },
    {
        path: 'src/api/ai/IntentMap.ts', role: 'Intent Decoder', category: NeuralCategory.METABOLIC, docDomain: 'SYSTEM', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Decoder', input: 'Natural language intent', output: 'Mapped AI capability', constraints: 'Intent-to-capability mapping' }
    },
    {
        path: 'src/core/ArchitectureDigest.ts', role: 'System Mirror', category: NeuralCategory.METABOLIC, docDomain: 'IMMUNE', metabolicBaseCost: 20,
        biologicalRole: { organ: 'Mirror Neuron', input: 'Codebase state', output: 'Architecture digest summary', constraints: 'Self-reflection output' }
    },
    {
        path: 'src/routing/strategies/DefaultStrategy.ts', role: 'Default Reflex', category: NeuralCategory.METABOLIC, docDomain: 'META', metabolicBaseCost: 5,
        biologicalRole: { organ: 'Default Pathway', input: 'Unclassified task', output: 'Default route', constraints: 'Fallback strategy' }
    },
    {
        path: 'src/routing/strategies/AnalyticalStrategy.ts', role: 'Analytical Reflex', category: NeuralCategory.METABOLIC, docDomain: 'META', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Analytical Pathway', input: 'Complex task', output: 'Optimized route', constraints: 'Deep analysis routing' }
    },
    {
        path: 'src/routing/strategies/CompositeStrategy.ts', role: 'Composite Reflex', category: NeuralCategory.METABOLIC, docDomain: 'META', metabolicBaseCost: 10,
        biologicalRole: { organ: 'Composite Pathway', input: 'Multi-step task', output: 'Combined route strategy', constraints: 'Strategy composition' }
    },
    {
        path: 'src/routing/types.ts', role: 'Routing DNA', category: NeuralCategory.METABOLIC, docDomain: 'META', metabolicBaseCost: 1,
        biologicalRole: { organ: 'Routing Genes', input: 'Type definitions', output: 'Routing interfaces', constraints: 'Immutable routing types' }
    },
    {
        path: 'src/engines/MetabolicEngine.ts', role: 'Catalyst (Thought Expansion)', category: NeuralCategory.METABOLIC, docDomain: 'META', metabolicBaseCost: 25,
        biologicalRole: { organ: 'ATP Generator', input: 'Intent', output: 'Metabolic Nexus (6 thoughts)', constraints: 'I Ching structured' }
    },
    {
        path: 'src/engines/SyntropyEngine.ts', role: 'Environment Harmonizer', category: NeuralCategory.METABOLIC, docDomain: 'SYSTEM', metabolicBaseCost: 15,
        biologicalRole: { organ: 'Homeostasis', input: 'External IDE/Agent state', output: 'Harmonized Context', constraints: 'Claude/Gemini/VSCode metadata' }
    },
    {
        path: 'src/engines/MetaCognitionEngine.ts', role: 'Self-Observation (Monologue)', category: NeuralCategory.METABOLIC, docDomain: 'META', metabolicBaseCost: 20,
        biologicalRole: { organ: 'Reflective Consciousness', input: 'Outcomes + Emotions', output: 'Internal Monologue', constraints: 'Affective modulation' }
    }
];
