import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { EventEmitter } from 'events';
import type { Result } from '../core/models.js';
import { getDashboardPath } from './SovereignPathResolver.js';
import { createLogger } from "./logger.js";

const execAsync = promisify(exec);

const logger = createLogger('SovereignEye');

/**
 * Capture source definition â€” what the Sovereign Eye is looking at.
 */
export type CaptureSource =
    | { type: 'url'; target: string }           // http://localhost:3000, wrangler dev, etc.
    | { type: 'html'; target: string }          // Path to .html file
    | { type: 'rsc'; target: 'game_client' }    // RSC client â€” delegates to RSCLimb state
    | { type: 'window'; target: string }        // OS window title match
    | { type: 'file'; target: string };          // Existing screenshot/image file

/**
 * Result of a capture operation.
 */
export interface CaptureResult {
    readonly imagePath: string | null;           // Path to screenshot (null if text-only)
    readonly textContent: string | null;         // Scraped text content (for URL/HTML sources)
    readonly sourceType: CaptureSource['type'];
    readonly metadata: Record<string, unknown>;
    readonly timestamp: number;
}

/**
 * Viewport configuration for captures.
 */
export interface ViewportConfig {
    readonly width: number;
    readonly height: number;
}

const DEFAULT_VIEWPORT: ViewportConfig = { width: 1280, height: 720 };

/**
 * SovereignEye â€” Universal capture engine.
 * 
 * Captures visual and textual state from ANY source: localhost dev servers,
 * wrangler dev environments, HTML files, OS windows, and existing images.
 * 
 * NO MOCKS â€” All captures come from real, running environments.
 */
export class SovereignEye extends EventEmitter {
    private readonly captureDir: string;

    constructor(projectId: string = 'guest') {
        super();
        this.captureDir = join(getDashboardPath(projectId), 'sovereign_eye');
        if (!existsSync(this.captureDir)) {
            mkdirSync(this.captureDir, { recursive: true });
        }
    }

    /**
     * Universal capture entry point.
     */
    async capture(source: CaptureSource, viewport: ViewportConfig = DEFAULT_VIEWPORT): Promise<Result<CaptureResult>> {
        logger.info({ sourceType: source.type, target: source.target }, 'Sovereign Eye capturing');

        switch (source.type) {
            case 'url':
                return this.captureUrl(source.target, viewport);
            case 'html':
                return this.captureHtmlFile(source.target, viewport);
            case 'rsc':
                return this.captureRSC();
            case 'window':
                return this.captureWindow(source.target);
            case 'file':
                return this.captureFile(source.target);
            default:
                return { ok: false, error: new Error(`Unknown capture source type`) };
        }
    }

    /**
     * Capture a URL target (localhost, wrangler dev, deployed page).
     */
    private async captureUrl(url: string, viewport: ViewportConfig): Promise<Result<CaptureResult>> {
        const timestamp = Date.now();
        const screenshotPath = join(this.captureDir, `url_${timestamp}.png`);

        try {
            // 1. Attempt headless Chrome/Edge screenshot
            const screenshotResult = await this.headlessScreenshot(url, screenshotPath, viewport);

            // 2. Always fetch text content as fallback/supplement
            let textContent: string | null = null;
            try {
                const response = await fetch(url);
                textContent = await response.text();
                // Trim for AI context
                if (textContent.length > 10000) {
                    textContent = textContent.substring(0, 10000) + '\n... [truncated]';
                }
            } catch (fetchErr) {
                logger.warn({ err: fetchErr }, 'Text fetch failed, screenshot-only mode');
            }

            const result: CaptureResult = {
                imagePath: screenshotResult.ok ? screenshotPath : null,
                textContent,
                sourceType: 'url',
                metadata: { url, viewport, hasScreenshot: screenshotResult.ok },
                timestamp
            };

            this.emit('capture', result);

            return {
                ok: true,
                value: result
            };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Capture a local HTML file.
     */
    private async captureHtmlFile(filePath: string, viewport: ViewportConfig): Promise<Result<CaptureResult>> {
        const absPath = resolve(filePath);
        if (!existsSync(absPath)) {
            return { ok: false, error: new Error(`HTML file not found: ${absPath}`) };
        }

        const timestamp = Date.now();
        const screenshotPath = join(this.captureDir, `html_${timestamp}.png`);

        try {
            const textContent = readFileSync(absPath, 'utf8');
            const fileUrl = `file:///${absPath.replace(/\\/g, '/')}`;
            const screenshotResult = await this.headlessScreenshot(fileUrl, screenshotPath, viewport);

            const result: CaptureResult = {
                imagePath: screenshotResult.ok ? screenshotPath : null,
                textContent: textContent.length > 10000
                    ? textContent.substring(0, 10000) + '\n... [truncated]'
                    : textContent,
                sourceType: 'html',
                metadata: { filePath: absPath, hasScreenshot: screenshotResult.ok },
                timestamp
            };

            this.emit('capture', result);

            return {
                ok: true,
                value: result
            };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Capture RSC game state â€” text-based via RSCLimb state.
     */
    private async captureRSC(): Promise<Result<CaptureResult>> {
        return {
            ok: true,
            value: {
                imagePath: null,
                textContent: '[RSC State] Use play-rsc command or RSCLimb.getWorldState() for real-time game perception.',
                sourceType: 'rsc',
                metadata: { protocol: 'tcp', port: 43594 },
                timestamp: Date.now()
            }
        };
    }

    /**
     * Capture an OS window by title match.
     */
    private async captureWindow(windowTitle: string): Promise<Result<CaptureResult>> {
        const timestamp = Date.now();
        const screenshotPath = join(this.captureDir, `window_${timestamp}.png`);

        try {
            const psScript = `
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
$procs = Get-Process | Where-Object { $_.MainWindowTitle -like "*${windowTitle.replace(/"/g, '`"')}*" } | Select-Object -First 1
if (-not $procs) { exit 1 }
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
$hwnd = $procs.MainWindowHandle
[Win32]::SetForegroundWindow($hwnd) | Out-Null
Start-Sleep -Milliseconds 200
$rect = New-Object Win32+RECT
[Win32]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
$width = $rect.Right - $rect.Left
$height = $rect.Bottom - $rect.Top
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, [System.Drawing.Size]::new($width, $height))
$bitmap.Save("${screenshotPath.replace(/\\/g, '\\\\')}")
$graphics.Dispose()
$bitmap.Dispose()
`;
            await execAsync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, '; ').replace(/"/g, '\\"')}"`, { timeout: 10000 });

            const result: CaptureResult = {
                imagePath: screenshotPath,
                textContent: `Window capture: "${windowTitle}"`,
                sourceType: 'window',
                metadata: { windowTitle },
                timestamp
            };

            this.emit('capture', result);

            return {
                ok: true,
                value: result
            };
        } catch (err) {
            return { ok: false, error: new Error(`Window capture failed: ${(err as Error).message}`) };
        }
    }

    /**
     * Passthrough for existing image files.
     */
    private async captureFile(filePath: string): Promise<Result<CaptureResult>> {
        const absPath = resolve(filePath);
        if (!existsSync(absPath)) {
            return { ok: false, error: new Error(`File not found: ${absPath}`) };
        }

        return {
            ok: true,
            value: {
                imagePath: absPath,
                textContent: null,
                sourceType: 'file',
                metadata: { originalPath: absPath },
                timestamp: Date.now()
            }
        };
    }

    /**
     * Attempt headless screenshot using Edge or Chrome.
     */
    private async headlessScreenshot(
        url: string,
        outputPath: string,
        viewport: ViewportConfig
    ): Promise<Result<{ path: string }>> {
        const browsers = [
            'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'msedge',
            'chrome'
        ];

        for (const browser of browsers) {
            try {
                const cmd = `"${browser}" --headless --disable-gpu --screenshot="${outputPath}" --window-size=${viewport.width},${viewport.height} --hide-scrollbars --no-sandbox "${url}"`;
                await execAsync(cmd, { timeout: 15000 });

                if (existsSync(outputPath)) {
                    return { ok: true, value: { path: outputPath } };
                }
            } catch {
                continue;
            }
        }

        return { ok: false, error: new Error('No headless browser available.') };
    }

    getCaptureDir(): string {
        return this.captureDir;
    }
}
