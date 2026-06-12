import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import { type Result, ok, err } from '../core/models.js';
import { getSovereignRoot, PathTier } from '../utils/SovereignPathResolver.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('ShadowEngine');

export interface ShadowProject {
    id: string;
    name: string;
    path: string;
    lastActive?: number;
}

export interface ShadowInsight {
    projectName: string;
    architecture?: string;
    codebaseMap?: string;
    recentSession?: string;
}

/**
 * ShadowEngine
 * 
 * Monitors and mirrors architectural context from the external code_tracker.
 * Enables POG2 to learn from other local POG-enabled projects.
 */
export class ShadowEngine {
    private readonly trackerPath: string;

    constructor(private readonly config: SovereignConfig) {
        // Phase 107.5: Normalize to project-relative or Sovereign drive tracker
        const root = getSovereignRoot(PathTier.Home);
        this.trackerPath = join(root, 'shadow', 'code_tracker');
    }

    /**
     * listProjects - Scans the code_tracker for active project folders.
     */
    public async listProjects(): Promise<Result<ShadowProject[]>> {
        const activeDir = join(this.trackerPath, 'active');
        if (!existsSync(activeDir)) {
            logger.warn(`Shadow active directory not found: ${activeDir}`);
            return err(new Error('Shadow active directory not found.'));
        }

        try {
            const dirs = readdirSync(activeDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => ({
                    id: dirent.name,
                    name: this.cleanProjectName(dirent.name),
                    path: join(activeDir, dirent.name)
                }));

            return ok(dirs);
        } catch (e) {
            const error = e as Error;
            logger.error(`Failed to list shadow projects in ${activeDir}: ${error.message}`);
            return err(new Error(`Failed to list shadow projects: ${error.message}`));
        }
    }

    /**
     * getProjectInsight - Peeks into a shadow project for architectural maps.
     */
    public async getProjectInsight(projectId: string): Promise<Result<ShadowInsight>> {
        const projectPath = join(this.trackerPath, 'active', projectId);
        if (!existsSync(projectPath)) {
            logger.warn(`Shadow project directory not found for ID: ${projectId} at ${projectPath}`);
            return err(new Error(`Shadow project ${projectId} not found.`));
        }

        try {
            const files = readdirSync(projectPath);
            const insight: ShadowInsight = { projectName: this.cleanProjectName(projectId) };

            // Find Architecture and Codebase fragments
            const archFile = files.find(f => f.includes('_ARCHITECTURE.md'));
            const mapFile = files.find(f => f.includes('_CODEBASE_MAP.md'));

            if (archFile) {
                insight.architecture = this.readTrackedFile(join(projectPath, archFile));
            }
            if (mapFile) {
                insight.codebaseMap = this.readTrackedFile(join(projectPath, mapFile));
            }

            return ok(insight);
        } catch (e) {
            const error = e as Error;
            logger.error(`Failed to get shadow insight for project ${projectId}: ${error.message}`);
            return err(new Error(`Failed to get shadow insight: ${error.message}`));
        }
    }

    /**
     * getAllInsights - Returns a consolidated view of all shadow projects.
     */
    public async getAllInsights(): Promise<Result<ShadowInsight[]>> {
        const projectsRes = await this.listProjects();
        if (!projectsRes.ok) {
            // Correctly propagate the error without 'any' cast
            return err(projectsRes.error);
        }

        const insights: ShadowInsight[] = [];
        for (const p of projectsRes.value) {
            const insightRes = await this.getProjectInsight(p.id);
            if (insightRes.ok) {
                insights.push(insightRes.value);
            } else {
                logger.warn(`Could not retrieve insight for project ${p.id}: ${insightRes.error.message}`);
                // Optionally, you could choose to return an error here if any project insight failure is critical
                // For now, we continue and only log the warning.
            }
        }

        return ok(insights);
    }

    private cleanProjectName(rawId: string): string {
        // Strip hashes if present: 04232ac..._Name.ts -> Name.ts
        if (rawId === 'no_repo') return 'Global/Untracked';
        // This regex handles both leading and trailing hashes, assuming a hash is 32 or 40 hex chars.
        return rawId.replace(/^[a-f0-9]{32,}_/, '').replace(/_[a-f0-9]{40,}$/, '');
    }

    private readTrackedFile(path: string): string {
        if (!existsSync(path)) {
            logger.warn(`Attempted to read non-existent tracked file: ${path}`);
            return `[Content Unreadable: File not found at ${path}]`;
        }
        try {
            // Tracked files often have binary markers/encoding that trip up simple reads
            // We strip non-printable characters at the start if detected
            const content = readFileSync(path, 'utf8');
            return content.replace(/^[\x00-\x1F\x7F-\x9F]+/, '').trim();
        } catch (e) {
            const error = e as Error;
            logger.error(`Failed to read tracked file ${path}: ${error.message}`);
            return `[Content Unreadable: ${error.message}]`;
        }
    }

    public healthCheck(): { online: boolean; details: string } {
        const exists = existsSync(this.trackerPath);
        return {
            online: exists,
            details: exists ? 'Shadow tracker substrate found.' : 'External code_tracker path missing.'
        };
    }
}
