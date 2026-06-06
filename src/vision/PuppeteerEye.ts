import { SovereignEye, type CaptureSource, type CaptureResult } from '../utils/SovereignEye.js';
import { CanonicalClock } from '../utils/CanonicalClock.js';
import { createLogger } from '../utils/logger.js';
import type { Result, YaoState } from '../core/models.js';
import puppeteer, { type Browser, type Page } from 'puppeteer';
import { existsSync, mkdirSync } from 'fs';
import { TaskScheduler } from '../routing/TaskScheduler.js';
import { EpistemicTransitionKernel } from '../engines/core/EpistemicTransitionKernel.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const logger = createLogger('PuppeteerEye');

/**
 * PuppeteerEye â€” Upgraded sensory module for real-time 3D/UI observation.
 * Extends SovereignEye with streaming and DOM/Canvas inspection capabilities.
 */
export class PuppeteerEye extends SovereignEye {
    private browser: Browser | null = null;
    private activePages: Set<Page> = new Set();
    private streamAbortControllers: Map<string, AbortController> = new Map();

    constructor(projectId: string = 'guest') {
        super(projectId);
    }

    /**
     * Get dominant colors from a screenshot using deterministic pixel sampling.
     * Ported from SpatialVisionEngine logic.
     */
    public async getDeterministicColors(imagePath: string): Promise<Result<Array<{ hex: string; count: number }>>> {
        const psScript = `
            [Reflection.Assembly]::LoadWithPartialName('System.Drawing') | Out-Null;
            $bmp = New-Object System.Drawing.Bitmap('${imagePath}');
            $colors = @{};
            # Sample a 50x50 grid to keep it fast
            for ($x=0; $x -lt $bmp.Width; $x += [Math]::Max(1, [Math]::Floor($bmp.Width/50))) {
                for ($y=0; $y -lt $bmp.Height; $y += [Math]::Max(1, [Math]::Floor($bmp.Height/50))) {
                    $p = $bmp.GetPixel($x, $y);
                    $hex = '#{0:X2}{1:X2}{2:X2}' -f $p.R, $p.G, $p.B;
                    $colors[$hex]++;
                }
            }
            $bmp.Dispose();
            $colors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 10 | ForEach-Object {
                Write-Host ("{0}:{1}" -f $_.Key, $_.Value)
            }
        `.trim();

        try {
            const { stdout } = await execAsync(`powershell -NoProfile -Command "${psScript.replace(/"/g, '\\"')}"`);
            const lines = stdout.split('\n').filter(l => l.includes(':'));
            const colors = lines.map(l => {
                const [hex, count] = l.trim().split(':');
                return { hex: hex!, count: parseInt(count!) };
            });
            return { ok: true, value: colors };
        } catch (err) {
            logger.error({ err }, 'Deterministic color detection failed');
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Initialize the headless/headful browser substrate.
     */
    public async awaken(headless: boolean = true): Promise<Result<void>> {
        // Phase-aware: defer browser launch during DEGRADING
        try {
            const kernel = EpistemicTransitionKernel.getInstance();
            if (kernel.getPhaseGateMultiplier() < 0.3) {
                logger.warn({ phase: kernel.getCurrentPhase() },
                    'PuppeteerEye awaken deferred: kernel in DEGRADING phase.');
                return { ok: false, error: new Error('Deferred: DEGRADING phase') };
            }
        } catch { /* kernel not initialized */ }

        return TaskScheduler.getInstance().schedule('vision', 2, async () => {
            try {
                if (this.browser) return { ok: true, value: undefined };
                this.browser = await puppeteer.launch({
                    headless,
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                });
                logger.info('PuppeteerEye substrate AWAKENED.');
                this.emitKernelSignal(0.8); // Browser substrate online
                return { ok: true, value: undefined };
            } catch (err) {
                logger.error({ err }, 'Failed to awaken PuppeteerEye');
                this.emitKernelSignal(0.2); // Vision substrate failed
                return { ok: false, error: err as Error };
            }
        });
    }

    /**
     * Capture state from a specific URL with deep DOM inspection.
     */
    public async domInspect(url: string): Promise<Result<{ html: string; screenshot: string; elements: any[] }>> {
        if (!this.browser) await this.awaken();
        if (!this.browser) return { ok: false, error: new Error('Eye failed to awaken') };
        
        try {
            const captureDir = this.getCaptureDir();
            if (!existsSync(captureDir)) mkdirSync(captureDir, { recursive: true });

            const page = await this.browser.newPage();
            this.activePages.add(page);
            await page.setViewport({ width: 1280, height: 720 });
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            const html = await page.content();
            
            // Inspect interactable elements
            const elements = await page.evaluate(() => {
                const interactables = Array.from(document.querySelectorAll('button, a, input, select, canvas'));
                return interactables.map(el => ({
                    tag: el.tagName,
                    id: el.id,
                    text: el.textContent?.trim() || '',
                    rect: el.getBoundingClientRect().toJSON()
                }));
            });

            const timestamp = Date.now(); // EXTERNAL domain: filesystem path
            const screenshotPath = `${captureDir}/inspect_${timestamp}.png`;
            await page.screenshot({ path: screenshotPath });
            
            await this.cleanupOldCaptures();
            
            await page.close();
            this.activePages.delete(page);
            this.emitKernelSignal(0.8); // Successful DOM inspection
            return { ok: true, value: { html, screenshot: screenshotPath, elements } };
        } catch (err) {
            logger.error({ err, url }, 'DOM inspection failed');
            this.emitKernelSignal(0.3); // Failed perception
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Start a periodic observation stream.
     * Captures frames and emits them for CNS processing.
     */
    public async stream(url: string, streamId: string, intervalSeconds: number = 5, callback?: (data: any) => void): Promise<void> {
        if (!this.browser) await this.awaken();
        if (this.streamAbortControllers.has(streamId)) {
            logger.warn({ streamId }, 'Stream already exists, replacing.');
            this.stopStream(streamId);
        }

        const abortController = new AbortController();
        this.streamAbortControllers.set(streamId, abortController);

        logger.info({ url, streamId, intervalSeconds }, 'Starting observation stream');

        const page = await this.browser!.newPage();
        this.activePages.add(page);
        await page.goto(url, { waitUntil: 'networkidle2' });

        const streamLoop = async () => {
            if (abortController.signal.aborted || !this.browser) {
                await page.close();
                this.activePages.delete(page);
                return;
            }

            try {
                const screenshot = await page.screenshot({ encoding: 'base64' });
                if (callback) callback({ screenshot, timestamp: Date.now() }); // EXTERNAL: frame metadata
            } catch (err) {
                logger.error({ err, streamId }, 'Stream loop encountered error');
            }

            if (!abortController.signal.aborted) {
                setTimeout(streamLoop, intervalSeconds * 1000);
            } else {
                await page.close();
                this.activePages.delete(page);
            }
        };

        streamLoop();
    }

    /**
     * Stop a specific stream.
     */
    public stopStream(streamId: string): void {
        const controller = this.streamAbortControllers.get(streamId);
        if (controller) {
            controller.abort();
            this.streamAbortControllers.delete(streamId);
            logger.info({ streamId }, 'Stream STOPPED.');
        }
    }

    /**
     * Shutdown the browser substrate.
     */
    public async sleep(): Promise<void> {
        // Abort all streams
        for (const [id, controller] of this.streamAbortControllers) {
            controller.abort();
        }
        this.streamAbortControllers.clear();

        // Close all pages
        for (const page of this.activePages) {
            if (!page.isClosed()) await page.close();
        }
        this.activePages.clear();

        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            logger.info('PuppeteerEye substrate SLEEPING.');
            this.emitKernelSignal(0.5); // Vision substrate going offline (planned)
        }
    }

    /**
     * emitKernelSignal — Feeds a causal confidence observation into the predictive kernel.
     */
    private emitKernelSignal(confidence: number): void {
        try {
            const kernel = EpistemicTransitionKernel.getInstance();
            const yao = HexagramManager.getInstance().getYaoState();
            kernel.observeTransition(yao, confidence);
        } catch {
            // Kernel or HexagramManager not yet initialized
        }
    }
}

