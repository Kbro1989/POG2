import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { Result, ok, err } from '../core/models.js';
import { createLogger } from './logger.js';

const execAsync = promisify(exec);
const logger = createLogger('ChromaCore');

export interface ColorSample {
  hex: string;
  count: number;
  frequency: number; // 0..1, fraction of sampled pixels
}

export interface ChromaSampleResult {
  colors: ColorSample[];
  totalSampled: number;
  gridSize: number;
  imagePath: string;
}

export interface ChromaSampleOptions {
  gridSize?: number;   // NxN grid, default 50
  maxColors?: number;  // Top N colors to return, default 10
}

/**
 * ChromaCore — Single authoritative pixel sampler.
 *
 * Usage:
 *   const result = await ChromaCore.sample(imagePath, { gridSize: 50, maxColors: 10 });
 *
 * Replaces:
 *   - ChromanumberEngine.getDeterministicColors (25-grid, 5-color)
 *   - SpatialVisionEngine.getDeterministicColors (50-grid, 10-color)
 *
 * Both engines now delegate here. No drift.
 */
export class ChromaCore {
  static async sample(
    imagePath: string,
    options: ChromaSampleOptions = {}
  ): Promise<Result<ChromaSampleResult>> {
    const gridSize = options.gridSize ?? 50;
    const maxColors = options.maxColors ?? 10;

    if (!existsSync(imagePath)) {
      return err(new Error(`ChromaCore: image not found at ${imagePath}`));
    }

    // Deterministic PowerShell pixel sampler — no LLM, no guessing
    const psScript = `
[Reflection.Assembly]::LoadWithPartialName('System.Drawing') | Out-Null;
$bmp = New-Object System.Drawing.Bitmap('${imagePath.replace(/\\/g, '\\\\')}');
$colors = @{};
$totalSampled = 0;
$stepX = [Math]::Max(1, [Math]::Floor($bmp.Width / ${gridSize}));
$stepY = [Math]::Max(1, [Math]::Floor($bmp.Height / ${gridSize}));
for ($x=0; $x -lt $bmp.Width; $x += $stepX) {
    for ($y=0; $y -lt $bmp.Height; $y += $stepY) {
        $p = $bmp.GetPixel($x, $y);
        $hex = '#{0:X2}{1:X2}{2:X2}' -f $p.R, $p.G, $p.B;
        if (-not $colors.ContainsKey($hex)) { $colors[$hex] = 0; }
        $colors[$hex]++;
        $totalSampled++;
    }
}
$bmp.Dispose();
Write-Host "TOTAL:$totalSampled";
$colors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First ${maxColors} | ForEach-Object {
    Write-Host ("{0}:{1}" -f $_.Key, $_.Value)
}
`.trim();

    try {
      const { stdout } = await execAsync(
        `powershell -NoProfile -NonInteractive -Command "${psScript.replace(/"/g, '\\"')}"`
      );

      const lines = stdout.split('\n').map(l => l.trim()).filter(Boolean);
      const totalLine = lines.find(l => l.startsWith('TOTAL:'));
      const totalSampled = totalLine ? parseInt(totalLine.replace('TOTAL:', '')) : 1;

      const colors: ColorSample[] = lines
        .filter(l => l.startsWith('#') && l.includes(':'))
        .map(l => {
          const [hex, countStr] = l.split(':');
          const count = parseInt(countStr ?? '0');
          return {
            hex: hex!,
            count,
            frequency: count / totalSampled
          };
        });

      logger.debug({ imagePath, gridSize, maxColors, totalSampled, colors: colors.length }, 'ChromaCore sample complete');

      return ok({ colors, totalSampled, gridSize, imagePath });
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  /**
   * Validate a frame against an expected palette.
   * Returns a structured PerceptionResult — no soft "PASS" strings.
   */
  static async validate(
    imagePath: string,
    expectedPalette: string[],
    options: ChromaSampleOptions = {}
  ): Promise<Result<PerceptionValidation>> {
    const sampleRes = await ChromaCore.sample(imagePath, options);
    if (!sampleRes.ok) return sampleRes as any;

    const { colors } = sampleRes.value;
    const hexSet = new Set(colors.map(c => c.hex.toUpperCase()));
    const anomalies: string[] = [];

    let matched = 0;
    for (const expected of expectedPalette) {
      if (hexSet.has(expected.toUpperCase())) {
        matched++;
      } else {
        anomalies.push(`Expected ${expected} not found in sampled palette`);
      }
    }

    const paletteMatch = expectedPalette.length > 0 ? matched / expectedPalette.length : 1;
    const confidence = paletteMatch * (1 - (anomalies.length / Math.max(expectedPalette.length, 1)));

    return ok({
      valid: paletteMatch >= 0.8,
      confidence: parseFloat(confidence.toFixed(3)),
      paletteMatch: parseFloat(paletteMatch.toFixed(3)),
      anomalies,
      sampledColors: colors
    });
  }

  /**
   * ChromaCore.diff — compare two frames for temporal state detection.
   * Returns a ColorDelta describing palette shift between prev and next.
   */
  static diff(
    prev: ChromaSampleResult,
    next: ChromaSampleResult
  ): ColorDelta {
    const prevSet = new Set(prev.colors.map(c => c.hex));
    const nextSet = new Set(next.colors.map(c => c.hex));

    const addedColors = [...nextSet].filter(h => !prevSet.has(h));
    const removedColors = [...prevSet].filter(h => !nextSet.has(h));

    const unionSize = new Set([...prevSet, ...nextSet]).size;
    const changedCount = addedColors.length + removedColors.length;
    const changeScore = unionSize > 0 ? changedCount / unionSize : 0;

    return {
      addedColors,
      removedColors,
      shiftedColors: [],
      changeScore: parseFloat(changeScore.toFixed(3))
    };
  }
}

/**
 * Structured perception validation — replaces "PHASE_STABILIZED: PASS" strings.
 */
export interface PerceptionValidation {
  valid: boolean;
  confidence: number;     // 0..1
  paletteMatch: number;   // 0..1
  anomalies: string[];
  sampledColors: ColorSample[];
}

/**
 * Temporal frame for sequence analysis.
 */
export interface PerceivedFrame {
  timestamp: number;
  imagePath: string;
  sample: ChromaSampleResult;
  delta?: ColorDelta; // vs previous frame
}

export interface ColorDelta {
  addedColors: string[];
  removedColors: string[];
  shiftedColors: Array<{ from: string; to: string; distance: number }>;
  changeScore: number; // 0..1 — how much the palette shifted
}

