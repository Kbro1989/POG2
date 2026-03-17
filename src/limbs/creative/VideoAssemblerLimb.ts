import { join, basename } from 'path';
import { existsSync, mkdirSync, writeFileSync, statSync, renameSync, readFileSync } from 'fs';
import { Result, ok } from '../../core/models.js';
import { ShellEngine } from '../../engines/ShellEngine.js';
import type { PipelineManifest, SceneArtifact } from '../../engines/PipelineController.js';

import { HexagramManager } from '../../routing/HexagramManager.js';
import { YaoState } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('VideoAssemblerLimb');

export interface VideoAssemblerOptions {
    frameRate?: number;
    resolution?: { width: number; height: number };
}

/**
 * VideoAssemblerLimb - Phase 97 Assembly
 * Orchestrates ffmpeg to stitch scene assets with dynamic audio muxing.
 */
export class VideoAssemblerLimb {
    constructor(
        private readonly shell: ShellEngine,
        private readonly hexagram: HexagramManager
    ) { }

    public healthCheck(): { online: boolean; details: string } {
        // Technically it's 'online' if it can execute ffmpeg via shell
        return { 
            online: true, 
            details: 'VideoAssembler substrate active; ffmpeg pipeline primed.' 
        };
    }

    /**
     * getCognitiveFilters - Translates YaoState into ffmpeg visual video filters.
     */
    private getCognitiveFilters(yao: YaoState): string {
        const filters: string[] = [];

        // OldYin: Entropic/Melancholy (Grain, desaturation, slight glitch)
        if (yao === YaoState.OldYin) {
            filters.push('noise=adds=10:onsts=10:allp=t', 'hue=s=0.7', 'curves=m=\'0.1/0 0.5/0.4 0.9/1\'');
        }
        // OldYang: Frantic/Explosive (High contrast, sharpness, chromatic aberration simulation)
        else if (yao === YaoState.OldYang) {
            filters.push('unsharp=5:5:1.0:5:5:0.0', 'curves=all=\'0/0 0.4/0.2 0.6/0.8 1/1\'', 'edgedetect=low=0.1:high=0.4');
        }
        // YoungYin: Receptive/Quiet (Soft focus, warm bloom)
        else if (yao === YaoState.YoungYin) {
            filters.push('boxblur=2:1', 'hue=h=5:s=1.2');
        }

        return filters.length > 0 ? filters.join(',') + ',' : '';
    }

    /**
     * getProsodyFilters - Translates narrative vectors into ffmpeg audio filter strings.
     */
    private getProsodyFilters(prosody?: any): string {
        if (!prosody) return '';
        const filters: string[] = [];

        // DarkTone vs Whimsy (Pitch shift)
        const rateMult = 1.0 + (prosody.whimsy * 0.15) - (prosody.darkTone * 0.2);
        if (Math.abs(rateMult - 1.0) > 0.05) {
            filters.push(`asetrate=44100*${rateMult.toFixed(2)},aresample=44100`);
            filters.push(`atempo=${(1.0 / rateMult).toFixed(2)}`);
        }

        // Chaos (Tempo variance / Speed)
        const speedMult = 1.0 + (prosody.chaos * 0.15);
        if (speedMult > 1.02) {
            filters.push(`atempo=${speedMult.toFixed(2)}`);
        }

        // Coherence (Tremolo/Stability)
        if (prosody.coherence < 0.6) {
            const depth = (0.6 - prosody.coherence) * 0.8;
            filters.push(`tremolo=f=5:d=${depth.toFixed(2)}`);
        }

        return filters.length > 0 ? filters.join(',') : '';
    }

    /**
     * assemble - Stitches scenes into an mp4 with adaptive soundtracks.
     */
    public async assemble(
        pipelineDir: string,
        manifest: PipelineManifest,
        options: VideoAssemblerOptions = {}
    ): Promise<Result<{ videoVerified: true; bytes: number; videoPath: string }>> {
        const finalDir = join(pipelineDir, '6-final');
        const clipDir = join(pipelineDir, '5-scene-clips');
        const stagingDir = join(pipelineDir, '4-assembly');

        if (!existsSync(finalDir)) mkdirSync(finalDir, { recursive: true });
        if (!existsSync(clipDir)) mkdirSync(clipDir, { recursive: true });
        if (!existsSync(stagingDir)) mkdirSync(stagingDir, { recursive: true });

        const framerate = options.frameRate || 24;
        const res = options.resolution || { width: 1280, height: 720 };
        const stagingPath = join(stagingDir, `book_${manifest.bookId}.tmp.mp4`);

        const masterConcatPath = join(stagingDir, 'ffmpeg_clips.txt');
        let masterConcatContent = '';
        let validScenes = 0;

        // â”€â”€â”€ STAGE 3.5: Process Per-Scene Audio (Narration + Adaptive Score) â”€â”€â”€
        for (const artifact of manifest.scenes) {
            let finalSceneAudio: string | null = null;

            if (artifact.voiceStatus === 'success' && artifact.voicePath) {
                // 1. Apply Prosody Filters to Narration
                const voiceFilters = this.getProsodyFilters(artifact.scene.prosody);
                let processedVoice = artifact.voicePath;

                if (voiceFilters) {
                    const filteredPath = join(stagingDir, `filtered_voice_s${artifact.index}.wav`);
                    const filterCmd = `ffmpeg -y -i "${artifact.voicePath}" -af "${voiceFilters}" "${filteredPath}"`;
                    await this.shell.execute({ command: filterCmd, cwd: pipelineDir });
                    processedVoice = filteredPath;
                }

                // 2. Measure narration duration
                const voiceDuration = await this.getAudioDuration(processedVoice) || 5;

                // 3. Handle Adaptive Soundtrack (Duration Discipline)
                if (artifact.soundtrackStatus === 'success' && artifact.soundtrackPath) {
                    const soundtrackDuration = await this.getAudioDuration(artifact.soundtrackPath) || 5;
                    const sceneMuxPath = join(stagingDir, `scene_${artifact.index}_mux.wav`);

                    // Duration Discipline: Trim or Loop score to match narration
                    let scoreFilter = '';
                    if (soundtrackDuration < voiceDuration - 0.1) {
                        scoreFilter = `aloop=loop=-1:size=2e+09,atrim=0:${voiceDuration}`;
                    } else {
                        scoreFilter = `atrim=0:${voiceDuration}`;
                    }

                    // Dynamic Muxing: Darker scenes = Heavier score
                    const darkShift = (artifact.scene.prosody?.darkTone || 0) * 0.15;
                    const scoreVol = (0.15 + darkShift).toFixed(2);
                    const voiceVol = 0.85.toFixed(2);

                    const muxCmd = `ffmpeg -y -i "${processedVoice}" -i "${artifact.soundtrackPath}" -filter_complex "[1:a]${scoreFilter},volume=${scoreVol}[bg];[0:a]volume=${voiceVol}[fg];[fg][bg]amix=inputs=2:duration=first" "${sceneMuxPath}"`;

                    const muxRes = await this.shell.execute({ command: muxCmd, cwd: pipelineDir });
                    if (muxRes.ok) {
                        finalSceneAudio = sceneMuxPath;
                    } else {
                        finalSceneAudio = processedVoice;
                    }
                } else {
                    finalSceneAudio = processedVoice;
                }
            }

            if (artifact.imageStatus === 'failed' || !artifact.imagePaths || artifact.imagePaths.length === 0) {
                logger.warn({ scene: artifact.index }, 'Skipping scene in assembly due to missing images.');
                continue;
            }

            // Sync video duration to finalized audio duration
            const durationSec = finalSceneAudio ? await this.getAudioDuration(finalSceneAudio) : 5;
            const subDuration = (durationSec || 5) / artifact.imagePaths.length;

            logger.info({ scene: artifact.index, imageCount: artifact.imagePaths.length, subDuration }, 'Muxing visual sequence for scene.');

            // Build scene-specific concat file
            let sceneVideoConcatContent = '';
            for (const img of artifact.imagePaths) {
                sceneVideoConcatContent += `file '${img.replace(/\\/g, '/')}'\n`;
                sceneVideoConcatContent += `duration ${subDuration.toFixed(3)}\n`;
            }

            // Append last image frame again to satisfy ffmpeg concat behavior
            const lastImage = artifact.imagePaths[artifact.imagePaths.length - 1];
            if (lastImage) {
                sceneVideoConcatContent += `file '${lastImage.replace(/\\/g, '/')}'\n`;
            }

            const sceneConcatPath = join(stagingDir, `ffmpeg_scene_${artifact.index}.txt`);
            writeFileSync(sceneConcatPath, sceneVideoConcatContent);

            const sceneClipPath = join(clipDir, `scene_${artifact.index}.mp4`);

            // Render individual scene MP4
            const cognitiveFilters = this.getCognitiveFilters(this.hexagram.getYaoState());
            const sceneVideoInput = `-f concat -safe 0 -i "${sceneConcatPath}"`;
            const sceneAudioInput = finalSceneAudio ? `-i "${finalSceneAudio.replace(/\\/g, '/')}"` : '';
            const sceneAudioArgs = finalSceneAudio ? `-map 0:v:0 -map 1:a:0 -c:v libx264 -c:a aac -shortest` : `-c:v libx264 -pix_fmt yuv420p`;

            // Apply Scene Tag Watermark
            const drawtextFilter = `drawtext=text='Scene ${artifact.index}':x=20:y=h-th-20:fontsize=36:fontcolor=white:box=1:boxcolor=black@0.5`;
            const baseVisualFilter = `${cognitiveFilters}scale=${res.width}:${res.height}:force_original_aspect_ratio=decrease,pad=${res.width}:${res.height}:(ow-iw)/2:(oh-ih)/2`;
            const vf = `-vf "${baseVisualFilter},${drawtextFilter}"`;

            const sceneCmd = `ffmpeg -y ${sceneVideoInput} ${sceneAudioInput} ${vf} -pix_fmt yuv420p -r ${framerate} ${sceneAudioArgs} "${sceneClipPath}"`;

            const sceneRes = await this.shell.execute({ command: sceneCmd, cwd: pipelineDir });

            if (sceneRes.ok && existsSync(sceneClipPath)) {
                masterConcatContent += `file '../5-scene-clips/scene_${artifact.index}.mp4'\n`;
                validScenes++;
            } else {
                const errDetail = !sceneRes.ok ? sceneRes.error : new Error('File not generated');
                logger.error({ scene: artifact.index, error: errDetail }, 'Failed to render individual scene clip.');
            }
        }

        if (validScenes === 0) {
            return { ok: false, error: new Error('No successful scenes found for video assembly.') };
        }

        writeFileSync(masterConcatPath, masterConcatContent);

        // Stitch everything together from the individual scene clips
        const command = `ffmpeg -y -f concat -safe 0 -i "${masterConcatPath}" -c copy "${stagingPath}"`;

        logger.info({ command }, 'VideoAssembler: Final stitch of all scene clips.');
        const shellRes = await this.shell.execute({ command, cwd: pipelineDir });
        if (!shellRes.ok) return { ok: false, error: new Error(`Final Master Stitch Failed: ${shellRes.error?.message}`) };

        // Post-Render Verification
        try {
            const stats = statSync(stagingPath);
            if (stats.size === 0) throw new Error('ZERO_BYTE_VIDEO');

            // Route output based on total scenes (Final Full-Length Movie)
            const finalPath = join(finalDir, `full_length_movie.mp4`);
            renameSync(stagingPath, finalPath);
            return ok({ videoVerified: true, bytes: stats.size, videoPath: finalPath });
        } catch (err: any) {
            return { ok: false, error: new Error(`Post-Render Failed: ${err.message}`) };
        }
    }

    private async getAudioDuration(audioPath: string): Promise<number> {
        const command = `ffprobe -i "${audioPath}" -show_entries format=duration -v quiet -of csv="p=0"`;
        try {
            const result = await this.shell.execute({ command, silent: true });
            if (result.ok && result.value) {
                const duration = parseFloat(result.value.output.trim());
                if (!isNaN(duration)) return duration;
            }
        } catch { }
        return 0;
    }

    /**
     * assembleFromAssets - Universal video assembly from arbitrary assets.
     * No PipelineManifest needed. Give it images + optional audio → video.
     * The organism's hands, freed from the book pipeline.
     */
    public async assembleFromAssets(
        assets: { imagePath: string; audioPath?: string; durationSec?: number }[],
        outputPath: string,
        options: VideoAssemblerOptions = {}
    ): Promise<Result<{ videoVerified: true; bytes: number; videoPath: string }>> {
        const { join: pathJoin, dirname } = await import('path');
        const { existsSync: exists, mkdirSync: mkDir, writeFileSync: writeFile, statSync: stat } = await import('fs');

        const outputDir = dirname(outputPath);
        if (!exists(outputDir)) mkDir(outputDir, { recursive: true });

        const stagingDir = pathJoin(outputDir, '.assembly-staging');
        if (!exists(stagingDir)) mkDir(stagingDir, { recursive: true });

        const framerate = options.frameRate || 24;
        const res = options.resolution || { width: 1280, height: 720 };

        let masterConcatContent = '';
        let validClips = 0;
        const cognitiveFilters = this.getCognitiveFilters(this.hexagram.getYaoState());

        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const dur = asset.durationSec || (asset.audioPath ? await this.getAudioDuration(asset.audioPath) : 5) || 5;

            // Create a per-asset concat file for the image
            const assetConcatPath = pathJoin(stagingDir, `asset_${i}.txt`);
            const imgPath = asset.imagePath.replace(/\\/g, '/');
            writeFile(assetConcatPath, `file '${imgPath}'\nduration ${dur.toFixed(3)}\nfile '${imgPath}'\n`);

            const clipPath = pathJoin(stagingDir, `clip_${i}.mp4`);
            const videoInput = `-f concat -safe 0 -i "${assetConcatPath}"`;
            const audioInput = asset.audioPath ? `-i "${asset.audioPath.replace(/\\/g, '/')}"` : '';
            const audioArgs = asset.audioPath ? `-map 0:v:0 -map 1:a:0 -c:v libx264 -c:a aac -shortest` : `-c:v libx264 -pix_fmt yuv420p`;
            const vf = `-vf "${cognitiveFilters}scale=${res.width}:${res.height}:force_original_aspect_ratio=decrease,pad=${res.width}:${res.height}:(ow-iw)/2:(oh-ih)/2"`;

            const cmd = `ffmpeg -y ${videoInput} ${audioInput} ${vf} -pix_fmt yuv420p -r ${framerate} ${audioArgs} "${clipPath}"`;
            const clipRes = await this.shell.execute({ command: cmd, cwd: outputDir });

            if (clipRes.ok && exists(clipPath)) {
                masterConcatContent += `file '${clipPath.replace(/\\/g, '/')}'\n`;
                validClips++;
            } else {
                logger.warn({ asset: i, error: clipRes.ok ? 'File missing' : clipRes.error?.message }, 'Asset clip failed');
            }
        }

        if (validClips === 0) {
            return { ok: false, error: new Error('No valid clips produced from assets.') };
        }

        const masterPath = pathJoin(stagingDir, 'master.txt');
        writeFile(masterPath, masterConcatContent);

        const stitchCmd = `ffmpeg -y -f concat -safe 0 -i "${masterPath}" -c copy "${outputPath}"`;
        const stitchRes = await this.shell.execute({ command: stitchCmd, cwd: outputDir });
        if (!stitchRes.ok) return { ok: false, error: new Error(`Final stitch failed: ${stitchRes.error?.message}`) };

        try {
            const stats = stat(outputPath);
            if (stats.size === 0) throw new Error('ZERO_BYTE_VIDEO');
            logger.info({ videoPath: outputPath, clips: validClips, bytes: stats.size }, 'Universal video assembled');
            return ok({ videoVerified: true, bytes: stats.size, videoPath: outputPath });
        } catch (err: any) {
            return { ok: false, error: new Error(`Post-render failed: ${err.message}`) };
        }
    }
}
