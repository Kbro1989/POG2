import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
import { HUDForensicsLimb } from '../src/limbs/spatial/HUDForensicsLimb.js';

const require = createRequire(import.meta.url);
const inspectorPath = 'D:/sovereign/cache_pedagogy/rsmv_inspector';
const varbitRegistryPath = 'D:/sovereign/cache_pedagogy/json_dumps/varbits_registry_new.json';

const { parse } = require(path.join(inspectorPath, 'src', 'opdecoder.js'));
const { GameCacheLoader } = require(path.join(inspectorPath, 'src', 'cache', 'sqlite.js'));
const { ClientscriptObfuscation } = require(path.join(inspectorPath, 'src', 'clientscript', 'callibrator.ts'));

interface VarBitReference {
    scriptId: number;
    opcode: 'PUSHVARBIT' | 'POPVARBIT' | 'PUSHVAR' | 'POPVAR' | string;
    varid: number;
    bitBase?: number;
    bitSize?: number;
    width?: number;
    context: string;
}

export class CS2InstructionTracer {
    private deob: any;
    private varbitRegistry: Map<number, { varid: number; bits: [number, number] }>;
    private cache: any;

    constructor() {
        this.cache = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape-BETA');
        this.cache.buildnr = 1149;
        this.varbitRegistry = new Map();
        
        try {
            const registry = JSON.parse(fs.readFileSync(varbitRegistryPath, 'utf8'));
            for (const [key, value] of Object.entries(registry)) {
                this.varbitRegistry.set(parseInt(key), value as any);
            }
        } catch (e: any) {
            console.error('Failed to load varbit registry:', e.message);
        }
    }

    async init() {
        console.log("Initializing calibrator...");
        this.deob = await ClientscriptObfuscation.create(this.cache, true);
        try {
            console.log("Running auto-calibrate...");
            await this.deob.runAutoCallibrate(this.cache);
        } catch (e: any) {
            console.log("Auto-calibrate failed (or partial):", e.message);
            // Fallback to treat as non-obbed if we just want to sweep immediates
            this.deob.setNonObbedMappings();
        }
        console.log("Calibrator initialized.");
    }

    async traceScript(scriptId: number, interfaceContext: string): Promise<VarBitReference[]> {
        const refs: VarBitReference[] = [];
        try {
            // JS5 major 12 = client scripts
            const scriptBuffer = await this.cache.getFile(12, scriptId);
            if (!scriptBuffer) return refs;
            
            // We use the basic opcode reader for scripts if we don't have full deob
            // However, the opdecoder for clientscript needs a deob object or it falls back to raw.
            const scriptData = parse.clientscript.read(scriptBuffer, this.cache, { clientScriptDeob: this.deob });
            
            if (scriptId === 10896) {
                console.log(`Script 10896 opcodes:`, scriptData.opcodedata.slice(0, 10));
            }
            
            for (const op of scriptData.opcodedata) {
                const opcodeId = op.opcode;
                // Without full calibration, we rely on standard RS3 opcodes:
                // pushvar = 42, popvar = 43
                // pushvarbit = typically higher, like 3132, 3133.
                // Wait, in NXT, pushvarbit is op 42?
                // Let's just grab ANY opcode that takes a varbit as an immediate.
                // We'll check the varbit registry to see if the immediate is a valid varbit.
                if (this.varbitRegistry.has(op.imm)) {
                    const meta = this.varbitRegistry.get(op.imm)!;
                    // Filter out very small immediates that are just numbers (0, 1, 2)
                    if (op.imm > 100) {
                        refs.push({
                            scriptId,
                            opcode: `OP_${opcodeId}`,
                            varid: op.imm,
                            bitBase: meta.bits[0],
                            bitSize: meta.bits[1],
                            width: meta.bits[1] - meta.bits[0] + 1,
                            context: interfaceContext
                        });
                    }
                }
            }
        } catch (e: any) {
            console.error(`Script parse error for ${scriptId}: ${e.message}`);
        }
        return refs;
    }

    async traceInterface(interfaceId: number, components: any[]): Promise<VarBitReference[]> {
        const allRefs: VarBitReference[] = [];
        for (const comp of components) {
            // Parse scripts on load, onclick, etc.
            const scriptsToCheck = [];
            if (comp.scripts) {
                for (const trigger of Object.values(comp.scripts)) {
                    if (Array.isArray(trigger) && trigger.length > 0) {
                        if (typeof trigger[0] === 'number') {
                            scriptsToCheck.push(trigger[0]);
                        }
                    }
                }
            }
            
            for (const scriptId of scriptsToCheck) {
                const context = `${interfaceId}:${comp.componentId} (${comp.text || 'container/sprite'})`;
                const refs = await this.traceScript(scriptId, context);
                allRefs.push(...refs);
            }
        }
        return allRefs;
    }
}

async function run() {
    const tracer = new CS2InstructionTracer();
    await tracer.init();
    
    const hud = new HUDForensicsLimb();
    
    console.log("Fetching interface 1420...");
    const forensics = await hud.getCharacterCreation();
    
    if (forensics.ok) {
        console.log(`Tracing ${forensics.value.components.length} components...`);
        const refs = await tracer.traceInterface(1420, forensics.value.components);
        
        // Group by varbit
        const grouped = new Map<number, VarBitReference[]>();
        for (const r of refs) {
            if (!grouped.has(r.varid)) grouped.set(r.varid, []);
            grouped.get(r.varid)!.push(r);
        }
        
        console.log('\n=== AVATAR VARBIT MAPPING (1420) ===');
        for (const [varbit, list] of grouped) {
            const first = list[0];
            const uniqueScripts = [...new Set(list.map(r => `${r.scriptId} [${r.opcode}]`))];
            console.log(`VarBit ${varbit}: ${first.width}-bit (${Math.pow(2, first.width || 0)} options)`);
            console.log(`  Used by: ${uniqueScripts.join(', ')}`);
            console.log(`  Context: ${first.context}`);
        }
    } else {
        console.error("Failed to parse 1420:", forensics.error);
    }
}

run().catch(console.error);
