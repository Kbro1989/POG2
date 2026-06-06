import { PipelineManifest, PipelineRequest } from '../engines/PipelineController.js';

/**
 * PipelineCheckpoint - Persistent state for resuming long-form runs.
 */
export interface PipelineCheckpoint {
    request: PipelineRequest;
    manifest: PipelineManifest;
    lastCompletedStage: 'storyboard' | 'images' | 'voice' | 'assembly';
    lastSceneIndex: number;
    timestamp: number;
    version: string;
    lastError?: string;
    corruptArtifacts?: string[];
}

