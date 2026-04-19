/**
 * Core type definitions for pog2-sovereign.
 * Aggregator and Domain-Specific Taxonomy.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { join, basename } from 'path';
// HealthReport and ServiceHealthState defined below to resolve broken import
import { SovereignDomain } from '../types/SovereignDomain.js';

export { SovereignDomain };
export type Direction = 'north' | 'south' | 'east' | 'west' | 'north-east' | 'north-west' | 'south-east' | 'south-west' | 'up' | 'down';

export enum LogicalSignature {
    CONSUMABLE_ROLL = 'CONSUMABLE_ROLL',
    LOOT_TABLE_ROLL = 'LOOT_TABLE_ROLL',
    TRANSPORT_ACTUATOR = 'TRANSPORT_ACTUATOR',
    TELEPORT_ACTUATOR = 'TELEPORT_ACTUATOR',
    BANK_DEPOSIT_ACTUATOR = 'BANK_DEPOSIT_ACTUATOR',
    PRACTICE_SKILL_NODE = 'PRACTICE_SKILL_NODE',
    CONSUMABLE_SKILL_STATION = 'CONSUMABLE_SKILL_STATION',
    SPATIAL_SHIFT = 'SPATIAL_SHIFT',
    ENTITY_MANIFEST = 'ENTITY_MANIFEST',
    PRIVILEGE_ELEVATION = 'PRIVILEGE_ELEVATION'
}
export enum SubstrateState {
    ONLINE = 'ONLINE',          // Full actuation and vision OK
    DEGRADED = 'DEGRADED',      // Vision OK, but actuation (RSMV write) blocked
    DEGRADED_IO = 'DEGRADED_IO', // I/O latency exceeding pulse budget
    OFFLINE = 'OFFLINE'         // Full substrate reachability failure (abort tick)
}

export interface SubstrateDeficit {
    type: 'NPC' | 'ITEM' | 'OBJECT' | 'TILE';
    id: number | string;
    requestedAtTick: number;
    reason: string;
}


export interface Coord {
    x: number;
    y: number;
    plane: number;
}

export interface RoutingDecision {
    model: string;
    metadata: {
        source: string;
        latencyMs: number;
        reasoning: string;
        path?: number[];
        error?: string;
    };
}

export interface RoutingContext {
    prompt: string;
    weightedTasks?: Record<string, number>;
    extension?: string;
    fileSize?: number;
    complexity?: CognitiveChoice;
    availableModels?: FreeModelConfig[];
    architectureAlignment?: string[];
    goldenTemplates?: string[];
    historicalPerformance?: ModelPerformance[];
    lessons?: Lesson[];
    metadata?: {
        ternarySignals?: {
            localAvailability: YaoState;
            historySignal: YaoState;
            supervisorSignal: YaoState;
            architectureAlignmentState: YaoState;
        };
        decisionDirective?: string;
        [key: string]: unknown;
    };
    hexagram?: any;
}

export interface RoutingStrategy {
    readonly name: string;
    route(context: RoutingContext): Promise<RoutingDecision | null>;
}

export interface TerminalStrategy extends RoutingStrategy {
    route(context: RoutingContext): Promise<RoutingDecision>;
}

export type ServiceHealthState = 'READY' | 'DEGRADED' | 'CRITICAL_FAILURE' | 'OFFLINE';

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface VarbitSnapshot {
    [id: number]: number;
}

export interface CompositeCondition {
    type: 'composite_and' | 'composite_or';
    conditions: string[];
}

export interface DirectionalCollision {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
    npc_only_blocks?: Direction[];
}

export interface TileCollision {
    static: DirectionalCollision;
    dynamic: DirectionalCollision;
}

export interface SpatialSideEffect {
    type: 'dynamic_collision' | 'walkability_override' | 'special_property';
    mask?: number;           // 0x100, 0x2, etc.
    condition?: string;      // "is_active_follower == true"
    blocks_movement?: boolean;
    description?: string;
}

export interface CombatantState {
    adrenaline?: number; // 0 - 10000 (0.00% to 100.00%)
    necrosisStacks?: number;
    residualSouls?: number;
    lastCombatTick: number; // Track for rhythm enforcement (e.g. 4-tick)
    cooldowns: Record<string, number>; // abilityId -> tickAvailable
}

export interface SovereignIntent {
    action: string;
    targetId: number | string;
    tickStarted: number;
    contextHash: string;
    coord?: Coord;
    abilityId?: string;
    range?: number;
}

export interface NPC extends CombatantState {
    id: number;
    npcId?: number;           // Cache definition ID (Major 18 archiveId)
    name: string;
    coord: Coord;
    x: number;
    y: number;
    plane: number;
    adrenaline?: number;
    adrenalinePercent?: number | string; // Support for formatted strings ("9.00%")
    necrosisStacks?: number;
    isFollower?: boolean;
    path?: Coord[];
    target?: number | Coord; // Entity ID or Destination
    interactionState: 'IDLE' | 'MOVING' | 'READY' | 'EXECUTING' | 'COOLDOWN';
    intent?: SovereignIntent;
    lastActionTick: number;
    currentHp?: number;       // Live HP tracker for combat evaluation
    combatStats?: {           // Optional combat metadata block
        currentHp: number;
        maxHp: number;
        attackLevel?: number;
        defenceLevel?: number;
    };
    
    brain?: {
        think: (tick: number, state: GameState, avatar: any) => void;
    };

    metadata?: Record<string, any>;
}

export interface GameObject {
    id: number;
    name: string;
    x: number;
    y: number;
    plane: number;
    metadata?: Record<string, any>;
}

export interface Item {
    id: number;
    amount: number;
    metadata?: Record<string, any>;
}

export interface Wallet {
    [currencyId: number]: number; // Map currency ID to amount
}

export enum EquipmentSlot {
    HEAD = 'head',
    CAPE = 'cape',
    NECK = 'neck',
    WEAPON = 'weapon',
    BODY = 'body',
    SHIELD = 'shield',
    LEGS = 'legs',
    HANDS = 'hands',
    FEET = 'feet',
    RING = 'ring',
    AMMO = 'ammo',
    AURA = 'aura',
    POCKET = 'pocket'
}

export interface Equipment {
    [slot: string]: Item | null;
}

export enum SkillId {
    ATTACK = 1,
    STRENGTH = 2,
    RANGED = 3,
    MAGIC = 4,
    DEFENCE = 5,
    CONSTITUTION = 6,
    PRAYER = 7,
    AGILITY = 8,
    HERBLORE = 9,
    THIEVING = 10,
    CRAFTING = 11,
    RUNECRAFTING = 12,
    MINING = 13,
    SMITHING = 14,
    FISHING = 15,
    COOKING = 16,
    FIREMAKING = 17,
    WOODCUTTING = 18,
    FLETCHING = 19,
    SLAYER = 20,
    FARMING = 21,
    CONSTRUCTION = 22,
    HUNTER = 23,
    SUMMONING = 24,
    DUNGEONEERING = 25,
    DIVINATION = 26,
    INVENTION = 27,
    ARCHAEOLOGY = 28,
    NECROMANCY = 29,
    QUEST_POINT = 31
}

export interface Skill {
    id: number;
    name: string;
    level: number;
    xp: number;
    virtualLevel?: number;
}

export interface Quest {
    id: number;
    name: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    points: number;
}

export interface QuestState {
    points: number;
    completedCount: number;
    quests: Record<number, Quest>;
}

export interface SovereignAvatar extends NPC {
    username: string;
    inventory: (Item | null)[]; // Fixed 28 slots
    bank: Item[];
    wallet: Wallet;
    equipment: Equipment;
    skills: Record<number, Skill>; // Map SkillId to Skill
    quests: QuestState;
    metadata?: any;

    // Operational Limb Logic (Phase 13 NXT-grade)
    isDead: boolean;
    processTick(): void;
    isBusy(): boolean;
    lock(ticks: number): void;
    lockTicks: number; // Residual ticks until lock expires
    addItem(item: Item): boolean;
    removeItem(slot: number): Item | null;
    authenticDie(): Item[];
    respawn(): void;
    pendingInteraction: { action: string; targetId: string } | null;
    
    // Adrenaline / Combat logic
    adrenalinePercent: string;
    addAdrenaline(amount: number): void;
    consumeAdrenaline(amount: number): boolean;
    state: GameState;
    currentPath: Coord[] | null;
    applyDamage(amount: number): void;
    heal(amount: number): void;
    plotPath?(
        targetX: number, 
        targetY: number, 
        pathfinder: any, 
        context: any, 
        collisionMatrix?: Map<string, any>
    ): Promise<boolean>;
    firstEmptySlot(): number | null;
    appearance?: {
        bodyColors: [number, number][]; // [original, replacement]
        gender: 'male' | 'female';
    };
    // Note: interactionState, intent, and lastActionTick are inherited from NPC
}



export interface GroundItem {
    id: number;
    itemName?: string;
    rarityLabel?: string;
    /** Grand Exchange price in coins. 0 = unknown/untradeable. Used by LootBeamRegistry tier resolution. */
    geValue?: number;
    amount: number;
    x: number;
    y: number;
    plane: number;
    owner?: string;
    spawnTick: number;
}

export interface GraveMarker {
    id: string;
    items: Item[];
    x: number;
    y: number;
    plane: number;
    owner: string;
    creationTick: number;
    expiryTick: number;
}

export interface GameState {
    plane: number;
    npcMap: Map<number, NPC>;
    npcSpatialIndex: Map<string, NPC[]>;  // "x,y,plane" -> [NPCs]
    objectMap: Map<number, GameObject>;
    groundItems?: Map<string, GroundItem[]>; // "x,y,plane" -> Items
    graves?: Map<string, GraveMarker>;      // "x,y,plane" -> Grave
    varps: Map<number, number>;
    varcs: Map<number, number | string>;
    varbits: Map<number, number>; // Cache for resolved varbit values
    players: Map<string, SovereignAvatar>; 
    tick?: number;              // Alias for tickNumber (used by NpcAgent)
    tickNumber?: number;
    lastTickTime?: number;
}


/**
 * Phase 35: Brain/CNS Orchestration
 */
export interface FragmentLogic {
    anchor: string;
    varbits: number[];
    npcs: number[];
    objects: number[];
    rules: number[];
    customTriggers: string[];
}

/**
 * MechanicalRule - Authoritative logic extracted from refilled logic stubs.
 */
export interface MechanicalRule {
    archiveId: number;
    name: string;
    path: string;
    description?: string;
    rawCode?: string; // Standardized GLSL or JS logic
    opcodes?: number[];
    isAuditable: boolean;
    lastVerifiedTick?: number;
}

/**
 * Server-side injector registry entry
 */
export interface ServerSideInjector {
  // Cache identification
  itemId?: number;        // Major 19, archive X
  objectId?: number;      // Major 0, archive X  
  npcId?: number;         // Major 1, archive X
  
  // Trigger conditions
  trigger: 'click' | 'use' | 'examine' | 'tick' | 'proximity';
  provenance?: string | {
    source: string;
    recordId: string;
    timestamp: number;
    path: string;
  };
  
  // Server-side validation gates
  validation: {
    questStage?: number;
    skillLevel?: number;
    varbitChecks?: Array<{id: number, value: number}>;
    inventoryChecks?: Array<{itemId: number, count: number}>;
  };
  
  // Handler dispatch
  handler: string;        // 'BarrowsInterpreter', 'ClueScrollInterpreter', etc.
  method: string;         // 'onClick', 'onUse', etc.
  
  // Authority
  authorityTier: 'CACHE' | 'SYNTHESIZED' | 'WIKI';
}


export interface HealthReport {
    state: ServiceHealthState | 'RATE_LIMITED';
    cooldownSeconds?: number;
    error?: string;
}

export enum TaskType {
    CODE = 'CODE',
    RESEARCH = 'RESEARCH',
    SYSTEM = 'SYSTEM',
    VISION = 'VISION',
    FORGE = 'FORGE',
    SOCIAL = 'SOCIAL',
    MOTOR = 'MOTOR',
    SENSORY = 'SENSORY'
}

export enum YaoState {
    OldYang = 3,    // Change
    YoungYang = 2,  // Stable
    OldYin = 1,     // Change
    YoungYin = 0,   // Stable
    OldMixed = 4,   // Chaotic
    YoungMixed = 5, // Emerging
    YangYao = 2,    // Alias
    YinYao = 0,     // Alias
    SovereignAvatar = 6, // Active Entity / Spatial Sandbox Participant
    SovereignEngine = 7  // World Container / Master Tick Heartbeat
}

// â”€â”€ PEDAGOGICAL LOGIC SUBSTRATES â”€â”€

export interface SkillManifest {
    version: string;
    total_skills: number;
    categories: Record<string, string[]>;
    caps: Record<string, string[]>;
    xp_table: Record<string, number>;
    milestones: {
        [key: string]: string | string[];
    };
}

export interface QuestManifest {
    version: string;
    summary: {
        total_quests: number;
        free_quests: number;
        members_quests: number;
        max_quest_points: number;
        free_max_qp: number;
    };
    states: Record<string, { color: string; label: string }>;
    critical_milestones: Record<string, any>;
}

export interface AchievementManifest {
    version: string;
    summary: {
        total_achievements: number;
        max_runescore: number;
    };
    categories: Record<string, any>;
    milestones: Record<string, any>;
}

export interface NecromancyLogic {
    general: any;
    mechanics: any;
    abilities: Record<string, any>;
    incantations: Record<string, any>;
    talents_tree: Record<string, any>;
}

export interface EquipmentRequirements {
    version: string;
    tiers: Record<string, { name: string; material: string; requirement: number }>;
    style_mapping: Record<string, string>;
}

export interface TrainingStrategies {
    version: string;
    strategies: Record<string, any>;
}

export interface LogicHub {
    skills: SkillManifest | null;
    quests: QuestManifest | null;
    achievements: AchievementManifest | null;
    necromancy: NecromancyLogic | null;
    equipment: EquipmentRequirements | null;
    strategies: TrainingStrategies | null;
}


export enum TemporalState {
    PAST = 'PAST',
    PRESENT = 'PRESENT',
    FUTURE = 'FUTURE'
}

export enum EmotionalState {
    Inspired = 'INSPIRED',
    Steady = 'STEADY',
    Agitated = 'AGITATED',
    Curious = 'CURIOUS',
    Quiet = 'QUIET',
    Surprised = 'SURPRISED',
    Decisive = 'DECISIVE',
    Zen = 'ZEN',
    Excited = 'EXCITED',
    Frustrated = 'FRUSTRATED',
    Pensive = 'PENSIVE',
    Melancholy = 'MELANCHOLY'
}

export enum CircuitState {
    Closed = 'CLOSED',   // Flowing (Stable)
    Open = 'OPEN',       // Broken (Tripped)
    HalfOpen = 'HALF_OPEN',
    Stable = 'STABLE'    // Legacy/Preferred alias
}

export enum ModelAbility {
    Text = 'text',
    Vision = 'vision',
    Tools = 'tools',
    Embed = 'embed'
}

export enum ModelType {
    Ollama = 'ollama',
    Cloudflare = 'cloudflare',
    OpenRouter = 'openrouter',
    Anthropic = 'anthropic',
    OpenAI = 'openai'
}

export enum YangState {
    Expansion = 'EXPANSION',
    Solidify = 'SOLIDIFY'
}

export enum YinState {
    Receiving = 'RECEIVING',
    yielding = 'YIELDING'
}

export enum HealthStatus {
    Critical = 'Critical',
    Degraded = 'Degraded',
    Ready = 'Ready',
    Offline = 'Offline',
    HEALTHY = 'Ready',
    UNHEALTHY = 'Critical',
    UNKNOWN = 'Offline'
}

export enum BuildStatus {
    Failed = 'Failed',
    Warning = 'Warning',
    Passed = 'Passed',
    Unknown = 'Unknown',
    PASS = 'Passed',
    FAIL = 'Failed',
    BUILDING = 'Warning'
}

export enum ResourcePressure {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export enum UserEngagement {
    ACTIVE = 'ACTIVE',
    IDLE = 'IDLE',
    AWAY = 'AWAY',
    UNKNOWN = 'UNKNOWN'
}

export enum SovereignTaxonomy {
    CLINICAL = 'CLINICAL',
    ORGANIC = 'ORGANIC',
    CHAOTIC = 'CHAOTIC'
}

export type Ternary = 1 | 0 | -1;

export type Result<T, E = Error> =
    | { ok: true; value: T; error?: never }
    | { ok: false; error: E; value?: never };

export const ok = <T>(value: T): Result<T, any> => ({ ok: true, value });
export const err = <E>(error: E): Result<any, E> => ({ ok: false, error });
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } => result.ok;

export interface MCPContent {
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
}

export interface MCPToolResult {
    content: MCPContent[];
    isError?: boolean;
}

export interface TSCError {
    readonly message: string;
    readonly code?: string | number;
    readonly file?: string;
    readonly line?: number;
    readonly context?: string;
}

export interface MapZone {
    id: string;
    name: string;
    internal_name: string;
    bounds: {
        dst: { xstart: number; xend: number; zstart: number; zend: number; };
        plane: number;
    }[];
}

export interface VolumeContext {
    allVolumes: MapZone[];
    primaryVolume: MapZone | null;
    ambientSound?: string;
}

export interface FileContext {
    path: string;
    content: string;
}

export interface CodeContext {
    primary?: string;
    imports?: string[];
    sameDirectory?: string[];
    related?: string[];
}

export interface SovereignMetadata {
    readonly id: string;
    readonly timestamp: number;
    readonly domain: SovereignDomain;
    readonly tags: string[];
    readonly hash?: string;
}

export type ProvenanceSource = 'RS3_CACHE' | 'WIKI' | 'MANUAL' | 'GENERATIVE' | 'PEDAGOGY' | 'UNKNOWN';

/**
 * Provenance â€” Traceability link from Vibe (Pedagogy) to Truth (Substrate).
 */
export interface Provenance {
    source: ProvenanceSource;

    major?: number;
    minor?: number;
    recordId?: number | string;
    subRecordId?: number;
    hash?: string;
    path?: string;
    url?: string;
    timestamp: number;
    agentId?: string; 
    ancestry?: Provenance[];

}

export interface SovereignRecord<T = any> {
    readonly metadata: SovereignMetadata;
    readonly provenance?: Provenance;
    readonly data: T;
}


export interface ValidationResult {
    readonly ok: boolean;
    readonly value?: any;
    readonly error?: {
        reason: string;
        suggestion?: string;
    };
}

export interface Intent {
    readonly query: string;
    readonly domain: SovereignDomain;
    readonly logic: Ternary;
    readonly complexity: number;
}

export interface Execution {
    readonly tool: string;
    readonly output: any;
    readonly success: boolean;
    readonly metadata?: Record<string, any>;
}

export interface EngineOutput {
    readonly output: string;
    readonly execution?: Execution;
    readonly data?: any;               // Added for cross-substrate compatibility
    readonly metadata?: Record<string, any>;
    readonly actuation?: ActuationIntent; // Phase 15: Link perception to action
}

/**
 * ActuationIntent â€” CNS-driven structural or environmental change.
 */
export interface ActuationIntent {
    readonly action: 'mutate_shader' | 'capture_frame' | 'update_model' | 'ui_actuate' | 'rsmv_control' | 'actuate_hud';
    readonly target: string;
    readonly parameters: Record<string, any>;
    readonly reasoning?: string;
}

/**
 * ActuationResult â€” Feedback from the motor/vision substrate after actuation.
 */
export interface ActuationResult {
    readonly success: boolean;
    readonly modelId?: string; // Phase 24: Trace feedback to specific substrate
    readonly details?: string;
    readonly data?: any;
}

/**
 * PedagogyProfile â€” Distilled metrics from professional production assets.
 * Used for "Training" the AI on pro-level 3D standards.
 */
export interface PedagogyProfile {
    readonly id: string;
    readonly name: string;
    readonly type: 'NPC' | 'OBJECT' | 'ITEM' | 'GROUP' | 'KINEMATIC' | 'DYNAMIC';
    readonly metrics: {
        readonly polyCount: number;
        readonly boneCount: number;
        readonly nodeCount?: number;
        readonly jointCount?: number;
        readonly materialComplexity: number;
        readonly rigLogic?: 'SKELETAL' | 'VERTEX_ANIM' | 'STATIC';
        readonly surfaceArea?: number;
        readonly dimensions?: { x: number, y: number, z: number };
        readonly vertexCount?: number;
        readonly topologySummary?: any[];
        // Kinematic Metrics
        readonly frameCount?: number;
        readonly durationSeconds?: number;
        readonly isSkeletal?: boolean;
        readonly jointDensity?: number;
        readonly frames?: Array<{ frameId: number; framemapId: number; boneTransformCount: number; rawDataSize: number }>;
        readonly linkedSpotanims?: Array<{ id: number; modelId: number; scaleX: number; scaleYorZ: number; rotation: number }>;
        readonly linkedModels?: Array<{ id: number; vertexCount: number; faceCount: number }>;
        readonly skeletalData?: { animId: number; keyframeCount: number };
    };
    readonly structure?: {
        readonly meshCount: number;
        readonly animationCount: number;
        readonly nodeHierarchyDepth?: number;
        readonly bones: string[];
        readonly materials: { name: string, type: string }[];
    };
    readonly semantics: {
        readonly role: string;
        readonly race?: string;
        readonly intent: string; // e.g., "Hero NPC", "Background Prop"
        readonly wikiUrl?: string;
        readonly wikiLore?: string;
        readonly affectiveResonance?: EmotionalState;
        readonly emotionalCharge?: number;
    };
    readonly spatial?: {
        readonly spawnX: number;
        readonly spawnY: number;
        readonly spawnZ?: number;
        readonly walkRadius?: number;
        readonly patrolPath?: { x: number, y: number }[];
        readonly locationName?: string;
    };
    readonly timestamp: number;
}

export interface ContextCard {
    readonly lineIndex: number;
    readonly title: string;
    readonly content: string;
    readonly state: YaoState;
    readonly importance: number;
    readonly reflection?: string;
    readonly weight?: number;
    readonly aesthetics?: GenerativeAesthetics; // Bridging thought to output
    isPinned?: boolean;
}

export interface ThinkingNexus {
    readonly yao: YaoState;
    readonly emotionalValence: number;
    readonly substrateHealth: CircuitState;
    readonly metabolicPressure?: number;
    readonly curiosity?: number;
    readonly metabolicFriction?: number;
    readonly originalIntent?: string;
    readonly reflection?: string;       // Added for OrchestrateEngine
    readonly emotionalPool?: Record<string, number>;
    thoughts?: ContextCard[];
    bottleneckPaths?: string[];
    readonly output?: string;      // Compatibility shim
    readonly response?: string;    // Compatibility shim
}

export interface FreeModelConfig {
    readonly model: string;
    readonly provider: string;
    readonly priority?: number;
    readonly name?: string;
}

export interface ModelPerformance {
    readonly model: string;
    readonly latencyMs: number;
    readonly success: boolean;
    readonly timestamp: number;
}

export interface ArchitectureManifest {
    readonly domainModel: Record<string, { file: string; properties: string[] }>;
    readonly dependencyRules: Record<string, string[]>;
    readonly primaryGoal: string;
}

export interface Todo {
    id: string;
    task: string;
    status: TodoStatus;
    rollback?: string;
}
export interface Plan {
    readonly goal: string;
    readonly steps: string[];
    readonly tool?: string;
    readonly model?: string;
    readonly severity: number;
    readonly yaoState: YaoState;
    readonly archetype?: string;
    readonly parameters?: Record<string, any>;
    readonly reasoning?: string;
    readonly output?: string;
    readonly response?: string;
    readonly interaction: 'text' | 'voice' | 'vision' | 'silent';
    readonly todos: Todo[];
    readonly rollback?: string;
    readonly timestamp?: number;
    readonly metadata?: Record<string, any>; // Phase 25: Memory & Tracing
    readonly dialectics?: {
        kimi: string;
        agent: string;
    };
}

export interface ModelResponse {
    readonly response: string;
    readonly model: string;
    readonly tokensUsed?: number;
    readonly latency?: number;
}

export interface ProsodyVector {
    readonly chaos: number;
    readonly whimsy: number;
    readonly darkTone: number;
    readonly coherence: number;
}

export interface GenerativeAesthetics {
    readonly visualFilter?: string;      // e.g., 'vibrant', 'noir', 'dreamy'
    readonly thermalVariance: number;    // 0.0 to 1.0 (influence on temperature/chaos)
    readonly scale: 'Grand' | 'Intimate' | 'Abstract';
    readonly palette?: string[];         // Preferred colors
    readonly prosody: ProsodyVector;
}

export interface SystemSensors {
    readonly buildPass: boolean;
    readonly userActive: boolean;
    readonly noRecentErrors: boolean;
    readonly substrateHealthy: boolean;
    readonly authorityLocal: boolean;
    readonly auditSync: boolean;
    readonly metabolicPressure?: number;
    readonly memoryPressure?: number;
}



export interface DecisionAuditRecord {
    readonly task: string;
    readonly input: any;
    readonly route: RoutingDecision;
    readonly context: any;
    readonly hexagram: string | number;
    readonly directive?: string;
    readonly selectedModel?: string;
    readonly complexity?: RoutingComplexity;
    readonly strategySource?: string;
    readonly latencyMs?: number;
    readonly timestamp?: number;   // Restored for TernaryRouter compatibility
    readonly fallbackUsed?: boolean;
    readonly fallbackReason?: string;
    readonly error?: string;
    readonly value?: string;
    readonly code?: string;
}

export interface Lesson {
    readonly id: string;
    readonly text: string;
    readonly embedding: Float32Array;
    readonly sessionId?: string;
    readonly projectId: string;
    readonly domainNamespace: string;
    readonly errorType?: string;
    readonly createdAt: number;
    readonly regretLikelihood?: number;
    readonly metadata: Record<string, any>;
    readonly hash?: string;
    readonly type?: string;
}

export type AIServiceType =
    | 'GEMINI' | 'CLOUDFLARE' | 'OLLAMA' | 'HUGGINGFACE' | 'OPENAI' | 'ANTHROPIC' | 'LOCAL' | 'NONE'
    | 'CLOUD_VISION' | 'DOCUMENT_AI' | 'HEALTH_AI' | 'VERTEX_AI' | 'SPEECH' | 'GEOSPATIAL'
    | 'MEDIA_FORGE' | 'GUTENBERG' | 'DISCOVERY' | 'GOOGLE';

export type AITaskType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'HEALTH' | 'GEO' | 'EMBEDDING' | 'VISION';

export interface AICapability {
    id: string;
    name: string;
    serviceType: AIServiceType;
    taskType: AITaskType;
    description: string;
    passthroughEnabled: boolean;
    domain?: SovereignDomain;
    modelId?: string;
    fallback?: string;
}

export interface ModelCallParams {
    model: string;
    prompt: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    maxRetries?: number;
    category?: string;
    format?: 'text' | 'json';
    images?: string[];
    tier?: 'Master' | 'Executive' | 'Reactive';
    yaoState?: YaoState;
    signal?: AbortSignal;
    isSystemPulse?: boolean;
}

export interface ModelExecutor {
    execute(params: ModelCallParams): Promise<Result<string>>;
    embed?(text: string): Promise<Result<Float32Array>>;
}

export interface ModelCallResult {
    ok: boolean;
    value: { response: string };
    error?: Error;
}

export type RoutingComplexity = 'low' | 'medium' | 'high' | 'extreme' | 'Vision' | 'Voice' | 'Orchestrator' | 'Chromanumber' | 'SovereignEye' | 'Yang' | 'Yin' | 'YinYang';

export enum CognitiveChoice {
    SIMPLE = 'simple',
    COMPLEX = 'complex',
    META = 'meta',
    EXTERNAL = 'external'
}

export interface TernaryDecision {
    logic: Ternary;
    reasoning: string;
}

export interface OraclePlan {
    steps: string[];
    goal: string;
}

export interface ExecutionStep {
    id: string;
    tool: string;
    params: any;
    args?: Record<string, any>;
    reasoning?: string;
    description?: string;
}

export interface ExecutionPlan {
    id: string;
    steps: ExecutionStep[];
}

export interface Validator {
    readonly name: string;
    validate(output: string, context?: any): Promise<ValidationResult>;
}

export type ConcealmentState = 'is' | 'isif' | 'isnot';

export interface ProductionPrerequisites {
    mandateAdversarialAudit: boolean;
    mandateBuildVerification: boolean;
    mandateHealthAudit: boolean;
    mandateMemoryConsolidation: boolean;
    mandateSovereignAudit: boolean; // Phase 7: ValidationLimb Antibody Gate
    severityThreshold: number;
}

/**
 * PRODUCTION PREREQUISITES MAP
 * Maps YaoState to strict enforcement rules for the AI Hive Mind.
 */
export const YAO_PRODUCTION_PREREQUISITES: Record<YaoState, ProductionPrerequisites> = {
    [YaoState.OldYang]: {
        mandateAdversarialAudit: true,
        mandateBuildVerification: true,
        mandateHealthAudit: false,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: true,
        severityThreshold: 70
    },
    [YaoState.YoungYang]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: true,
        mandateHealthAudit: false,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: false,
        severityThreshold: 30
    },
    [YaoState.OldYin]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: false,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: true,
        mandateSovereignAudit: true,
        severityThreshold: 50
    },
    [YaoState.YoungYin]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: false,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: false,
        severityThreshold: 20
    },
    [YaoState.OldMixed]: {
        mandateAdversarialAudit: true,
        mandateBuildVerification: true,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: true,
        mandateSovereignAudit: true,
        severityThreshold: 90
    },
    [YaoState.YoungMixed]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: true,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: true,
        severityThreshold: 10
    },
    [YaoState.SovereignAvatar]: {
        mandateAdversarialAudit: true,
        mandateBuildVerification: false,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: true,
        mandateSovereignAudit: true,
        severityThreshold: 80
    },
    [YaoState.SovereignEngine]: {
        mandateAdversarialAudit: true,
        mandateBuildVerification: true,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: false,
        mandateSovereignAudit: true,
        severityThreshold: 100
    }
};

export interface SovereignKnock {
    iChingSequence: string[];
    chromaticSoul: string;
    temporalFingerprint: string;
    anatomicalProof: {
        limbCount: number;
        structuralIntegrity: number;
    };
}

export interface SovereignViolation {
    type: 'PLACEHOLDER_DETECTED' | 'MISSING_PEDAGOGY_REFERENCE' | 'EPHEMERAL_CODE';
    file: string;
    line: number;
    severity: 'CRITICAL' | 'WARNING' | 'ERROR';
    context?: string;
}

export interface MetabolicAudit {
    timestamp: number;
    violations: SovereignViolation[];
    metabolicScore: number; // 0-1, must be >0.9
    consolidationRecommendations: string[];
}

export interface SessionLog {
    modifiedFiles: string[];
    completedTasks: Array<{ id: string; referencesPedagogyId: string | null }>;
}

export interface DesignPrinciple {
    id: string;
    text: string;
    sourceHash?: string;
    domain: string;
}

export interface CinematicArtifact {
    type: string;
    prompt: string;
    principleId: string;
    renderedOutput?: string;
    sovereignCompliant: boolean;
}

export type DataType = 'npc' | 'obj' | 'item' | 'map' | 'skeleton';

export interface CacheData {
    raw: Buffer;
    crc: number;
    version: number;
    parsed: any;
    substrate: string;
}

export interface ReimaginationSpec {
    sourceCachePath: string;
    entityId: number;
    dataType: DataType;
    domain: string;
    themes: string[];
    outputType: string;
}


export const CURRENCY_COINS = 995;
export const CURRENCY_CHRONOTES = 49219;
export const CURRENCY_SPIRIT_SHARDS = 12183;
