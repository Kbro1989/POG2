import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let GameCacheLoader: any = null;
let parse: any = null;
let cacheMajors: any = null;
try { ({ GameCacheLoader } = require("../../../rsmv/src/cache/sqlite.js")); } catch {}
try { ({ parse } = require("../../../rsmv/src/opdecoder.js")); } catch {}
try { ({ cacheMajors } = require("../../../rsmv/src/constants.js")); } catch {}
import { Result, ok, err } from '../../core/models.js';
import type { PedagogyProfile } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";




import { TernaryRouter } from '../../routing/TernaryRouter.js';
import { VectorDB } from '../../utils/VectorDB.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';
import { ModelClient } from '../../clients/ModelClient.js';

const logger = createLogger('KinematicsLimb');

/**
 * KinematicsLimb - Motion Deconstruction & Learning
 * Responsible for parsing Archive 25 (Sequences) to understand 
 * the structure of movement and skeletal physics.
 */
export class KinematicsLimb {
    private loader: any;
    private router: TernaryRouter;
    private vectorDB: VectorDB;

    constructor(router: TernaryRouter, vectorDB: VectorDB, private readonly client: ModelClient) {
        this.loader = GameCacheLoader ? new GameCacheLoader() : null;
        this.router = router;
        this.vectorDB = vectorDB;
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const loaderHealth = !!this.loader;
        return {
            online: loaderHealth,
            details: `Kinematics: ${loaderHealth ? 'ONLINE' : 'OFFLINE'} (Archive 25 mapped)`
        };
    }

    /**
     * Extracts a pedagogical profile for a specific animation sequence.
     * Phase 24b: Deep Kinematic Content Extraction (Frames, Spotanims, Models)
     */
    public async extractKinematics(sequenceId: number): Promise<Result<PedagogyProfile>> {
        const state = this.router.temporalState;
        logger.info({ sequenceId, state }, 'Extracting Kinematic Profile');

        if (state === 'PAST') {
            const cached = this.vectorDB.queryLocal(`kinematic-${sequenceId}`);
            if (cached.ok && cached.value) {
                logger.info({ sequenceId }, 'Retrieved Kinematic Profile from PAST substrate.');
                return ok(cached.value.metadata as PedagogyProfile);
            }
        }

        try {
            if (!this.loader || !parse || !cacheMajors) return err(new Error('KinematicsLimb: RSMV substrates not available.'));
            const buffer = await this.loader.getFileById(cacheMajors.sequences, sequenceId);
            if (!buffer) return err(new Error(`Sequence ${sequenceId} not found in cache.`));

            const sequence = parse.sequences.read(buffer, this.loader);

            let frameCount = sequence.frames?.length || 0;
            let totalDuration = 0;
            const extractedFrames: any[] = [];
            const linkedSpotanims: any[] = [];
            const linkedModels: any[] = [];
            let skeletalData: any = undefined;

            // 1. Deep Frame Extraction (Major 48)
            if (sequence.frames) {
                frameCount = sequence.frames.length;
                for (const f of sequence.frames) {
                    const duration = (f.framelength || 0) * 0.020;
                    totalDuration += duration;

                    // Decode the frame architecture
                    const frameArchive = f.frameidhi;
                    const frameSubid = f.frameidlow;

                    try {
                        // In Major 48, frameidhi is the archive, and frameidlow is the file within the archive
                        const frameBuffer = await this.loader.getFile(cacheMajors.frames, frameArchive, frameSubid).catch(() => null);
                        if (frameBuffer) {
                            const frameData = parse.frames.read(frameBuffer, this.loader);
                            extractedFrames.push({
                                frameId: (frameArchive << 16) | frameSubid,
                                framemapId: frameData.probably_framemap_id || 0,
                                boneTransformCount: frameData.flags?.length || 0,
                                rawDataSize: frameData.animdata?.length || 0
                            });
                        }
                    } catch (err) {
                        logger.warn({ frameArchive, frameSubid, msg: (err as Error).message }, 'Failed to resolve deep frame data');
                    }
                }
            } else if (sequence.skeletal_animation) {
                skeletalData = {
                    rigLogic: sequence.skeletal_animation ? 'SKELETAL' : 'STATIC',
                    keyframeCount: 0
                };
                // 2. Skeletal Extraction (Major 56)
                try {
                    const skelBuffer = await this.loader.getFileById(cacheMajors.skeletalAnims, sequence.skeletal_animation);
                    if (skelBuffer) {
                        const skelData = parse.skeletalAnim.read(skelBuffer, this.loader);
                        skeletalData.keyframeCount = skelData.bones?.length || 0;
                    }
                } catch (err) {
                    logger.warn({ animId: sequence.skeletal_animation, msg: (err as Error).message }, 'Skeletal extraction for Major 56 failed');
                }
            }

            const isSkeletal = sequence.skeletal_animation !== undefined || sequence.skeletal_range !== undefined;

            // 3. Spotanim Resolution (Major 21)
            // We scan the first ~1000 spotanims to find any that reference this sequence
            // (In a full production engine, this would be an inverted index)
            try {
                // We use getCacheIndex to get the valid IDs rather than brute forcing
                const spotanimIndex = await this.loader.getCacheIndex(cacheMajors.spotanims);
                let scanCount = 0;
                for (const sub of spotanimIndex) {
                    if (!sub) continue;
                    if (scanCount++ > 2000) break; // Limit scan for performance

                    try {
                        const spotBuffer = await this.loader.getFileById(cacheMajors.spotanims, sub.minor);
                        if (spotBuffer) {
                            const spotData = parse.spotAnims.read(spotBuffer, this.loader);
                            if (spotData.sequence === sequenceId) {
                                linkedSpotanims.push({
                                    id: sub.minor,
                                    modelId: spotData.model,
                                    scaleX: spotData.scaleX || 128,
                                    scaleYorZ: spotData.scaleYorZ || 128,
                                    rotation: spotData.rotation || 0,
                                    colors: spotData.replace_colors || []
                                });

                                // 4. Nested Model Resolution (Major 47)
                                if (spotData.model) {
                                    try {
                                        const modelBuffer = await this.loader.getFileById(cacheMajors.models, spotData.model);
                                        if (modelBuffer) {
                                            const modelData = parse.models.read(modelBuffer, this.loader);
                                            // Model structure is complex, we just extract high level vertex data
                                            linkedModels.push({
                                                id: spotData.model,
                                                vertexCount: modelData.vertices?.length || 0,
                                                faceCount: modelData.faces?.length || 0
                                            });
                                        }
                                    } catch (err) { /* soft fail */ }
                                }
                            }
                        }
                    } catch (err) { /* ignore individual spotanim read errors */ }
                }
            } catch (err) {
                logger.warn({ msg: (err as Error).message }, 'Spotanim scan failed');
            }

            // Cross-reference KBD bone audit if available
            const boneAuditPath = join(process.cwd(), 'kbd_bone_audit.json');
            let auditedBoneCount = isSkeletal ? 100 : 20;
            if (existsSync(boneAuditPath)) {
                try {
                    const audit = JSON.parse(readFileSync(boneAuditPath, 'utf8'));
                    auditedBoneCount = audit["77889"]?.boneCount || auditedBoneCount;
                } catch (e) { /* ignore */ }
            }
            const uniqueBones = new Set<number>();

            if (sequence.frames) {
                for (const frame of sequence.frames) {
                    totalDuration += (frame.framelength || 0) * 0.020; // 20ms steps
                }
            }

            // Note: In RS3, sequences reference Archive 0 frames or Archive 57/58/59 skeletons.
            // We'll perform a shallow check for now.

            const profile: PedagogyProfile = {
                id: sequenceId.toString(),
                name: `Sequence_${sequenceId}`,
                type: 'KINEMATIC',
                metrics: {
                    polyCount: 0, // Animations don't have polys directly
                    vertexCount: 0,
                    boneCount: skeletalData ? skeletalData.keyframeCount : 20, // Real Major 56 count or legacy fallback
                    materialComplexity: 0,
                    frameCount,
                    durationSeconds: parseFloat(totalDuration.toFixed(3)),
                    isSkeletal,
                    jointDensity: isSkeletal ? 0.9 : 0.1,
                    frames: extractedFrames,
                    linkedSpotanims: linkedSpotanims,
                    linkedModels: linkedModels,
                    skeletalData: skeletalData
                },
                semantics: {
                    role: `Animation sequence ${sequenceId}. Total frames: ${frameCount}.`,
                    intent: isSkeletal ? 'skeletal_motion_template' : 'legacy_vertex_animation'
                },
                timestamp: Date.now()
            };

            return ok(profile);
        } catch (e) {
            logger.error({ sequenceId, error: (e as Error).message }, 'Kinematic extraction failed');
            return err(new Error(`Kinematic extraction failed: ${(e as Error).message}`));
        }
    }

    /**
     * Binds a sequence to a semantic state for a specific narrative actor.
     */
    public async bindSequenceToState(sequenceId: number, state: string, actorId?: string): Promise<Result<any>> {
        logger.info({ sequenceId, state, actorId }, 'Binding kinematic sequence to semantic state.');

        const profileRes = await this.extractKinematics(sequenceId);
        if (!profileRes.ok) return profileRes;

        const profile = {
            ...profileRes.value,
            semantics: {
                ...profileRes.value.semantics,
                role: state.toUpperCase(),
                intent: `Bound to ${state} for actor ${actorId || 'Global'}`
            }
        };

        const substratePath = join(getSovereignRoot(), 'memory', 'pedagogy', 'kinematics.json');
        try {
            let substrate: any = { kinematics: [] };
            if (existsSync(substratePath)) {
                substrate = JSON.parse(readFileSync(substratePath, 'utf8'));
            }

            // Upsert the binding
            const index = substrate.kinematics.findIndex((k: any) => k.id === sequenceId.toString());
            if (index !== -1) {
                substrate.kinematics[index] = profile;
            } else {
                substrate.kinematics.push(profile);
            }

            // Persist to D:\sovereign\memory\pedagogy
            const fs = await import('fs');
            fs.writeFileSync(substratePath, JSON.stringify(substrate, null, 2));

            // Vectorize the principle
            const embedRes = await this.client.embed(`Kinematic sequence ${sequenceId} bound to ${state}`);
            if (embedRes.ok) {
                await this.vectorDB.addLesson({
                    id: `kinematic-${sequenceId}`,
                    text: `Kinematic sequence ${sequenceId} bound to ${state}`,
                    embedding: embedRes.value,
                    projectId: 'global',
                    domainNamespace: 'kinematics',
                    createdAt: Date.now(),
                    metadata: profile,
                    type: 'kinematic_fact'
                });
            }

            logger.info({ sequenceId, state }, 'Kinematic binding consolidated in pedagogy substrate.');
            return ok({ sequenceId, state, profile });
        } catch (e) {
            logger.error({ error: (e as Error).message }, 'Failed to persist kinematic binding.');
            return err(e instanceof Error ? e : new Error(String(e)));
        }
    }

    public close(): void {
        if (this.loader && typeof this.loader.close === 'function') {
            this.loader.close();
        }
    }
}
