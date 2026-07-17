<#
.SYNOPSIS
Native PowerShell entrypoint for the POG2 vision pipeline.
Drives ImageProcessorLimb -> VisionRouterLimb and emits JSON to stdout.

.EXAMPLE
  pwsh .\TestVisionPipeline.ps1 -ImagePath .\model.png
  pwsh .\TestVisionPipeline.ps1 -ImagePath C:\path\to\quantum_mask_pass_card_v3.png

.NOTES
Dependencies: node >= 18, tsx (npm i -g tsx if missing).
Run from the POG2 repo root.
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ImagePath,
    [int]$MaxColors = 48,
    [switch]$Raw
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$pog2Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$modulePath = Join-Path $pog2Root 'src/limbs/vision/ImageProcessorLimb.ts'
$routerPath = Join-Path $pog2Root 'src/limbs/vision/VisionRouterLimb.ts'

if (-not (Test-Path $ImagePath)) {
    Write-Error "Image not found: $ImagePath"
}
if (-not (Test-Path $modulePath)) {
    Write-Error "Module missing: $modulePath"
}

$wrapper = @"
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const modulePath = process.argv[2];
const imagePath = process.argv[3];
const maxColors = Number(process.argv[4] || '48');

const mod = await import(modulePath);
const module = mod.default || mod;
const instance = module.getInstance ? module.getInstance() : module;

if (!instance.process) {
    console.error('Module does not expose a .process() method');
    process.exit(2);
}

const result = await instance.process(imagePath, maxColors);
const out = {
    image: imagePath,
    dimensions: { width: result.originalWidth, height: result.originalHeight },
    paletteSize: result.palette.length,
    regionCount: result.regions.length,
    palette: result.palette.map(p => ({
      id: p.id, hex: p.hex, rgb: p.rgb, count: p.count
    })),
    qutritRegions: result.qutritRegions.map(r => ({
      regionId: r.id,
      colorId: r.colorId,
      qutritState: r.qutritState,
      pixelCount: r.pixels.length,
      centroid: r.centroid,
      hex: result.palette[r.colorId]?.hex
    })),
};

if (typeof result.qutritRegions !== 'undefined' && Array.isArray(result.qutritRegions)) {
    // summarize top 6 by size
    const top = [...result.qutritRegions]
      .sort((a, b) => b.pixels.length - a.pixels.length)
      .slice(0, 6)
      .map(r => ({
        regionId: r.id,
        qutritState: r.qutritState,
        pixelCount: r.pixels.length,
        centroid: r.centroid,
        hex: result.palette[r.colorId]?.hex
      }));
    out.qutritSummary = top;
  }
"@

$wrapperPath = Join-Path $pog2Root '.scratch/_vision_pipeline_wrapper.mjs'
$null = New-Item -ItemType Directory -Path (Split-Path $wrapperPath) -Force | Out-Null
Set-Content -LiteralPath $wrapperPath -Value $wrapper -NoNewline

$nodeArgs = @($wrapperPath, $modulePath, $ImagePath, $MaxColors)

try {
    $rawOut = & node @nodeArgs 2>&1
}
catch {
    Write-Error "Node execution failed: $_"
}

$rawOut | Write-Debug

if ($LASTEXITCODE -ne 0) {
    Write-Error "Pipeline failed (exit $LASTEXITCODE)"
    return
}

$parsed = $rawOut | ConvertFrom-Json
if (-not $parsed) {
    Write-Error "Pipeline returned unparseable output."
    return
}

# Summary markers for kanban traceability
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$qSum = ($parsed.qutritRegions | Sort-Object pixelCount -Descending | Select-Object -First 6 | ForEach-Object {
    "qutrit-$($_.qutritState)|hex=$($_.hex)|px=$($_.pixelCount)"
}) -join ' ; '

Write-Host "[TEST_VISION $ts] image=$($parsed.image) w=$($parsed.dimensions.width) h=$($parsed.dimensions.height) regions=$($parsed.regionCount) palette=$($parsed.paletteSize) dominant_summary=$qSum"
$parsed | ConvertTo-Json -Depth 6 | Write-Output