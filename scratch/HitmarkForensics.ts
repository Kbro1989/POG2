/// <reference types="node" />
// ============================================================================
// HitmarkForensics.ts
// POG2 Cache Pedagogy — Hunt for hitmark subtype 62 across all substrates
// Run this in scratch/ to map the complete hitmark data flow
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';

// ─── CONFIGURATION ──────────────────────────────────────────────────────────

const CACHE_PEDAGOGY_ROOT = 'D:/sovereign/cache_pedagogy';
const RSMV_INSPECTOR_ROOT = path.join(CACHE_PEDAGOGY_ROOT, 'rsmv_inspector');
const OUTPUT_DIR = 'D:/POG2/scratch/hitmark_forensics';

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const LOG_FILE = path.join(OUTPUT_DIR, 'hitmark_hunt.log');
const REPORT_FILE = path.join(OUTPUT_DIR, 'hitmark_report.json');

// ─── LOGGER ─────────────────────────────────────────────────────────────────

class ForensicsLogger {
  private entries: string[] = [];

  log(msg: string): void {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${msg}`;
    this.entries.push(line);
    console.log(line);
  }

  flush(): void {
    fs.writeFileSync(LOG_FILE, this.entries.join('\n'), 'utf-8');
  }
}

const logger = new ForensicsLogger();

// ─── HUNT PATTERNS ──────────────────────────────────────────────────────────

interface HuntPattern {
  name: string;
  description: string;
  // Regex patterns to search for in extracted files
  patterns: RegExp[];
  // File extensions to scan
  extensions: string[];
  // Directories to scan (relative to CACHE_PEDAGOGY_ROOT)
  searchRoots: string[];
}

const HUNT_PATTERNS: HuntPattern[] = [
  {
    name: 'HITMARK_SUBTYPE_62',
    description: 'Direct references to hitmark subtype 62 in any extracted data',
    patterns: [
      /hitmark.*62/i,
      /subtype[^0-9]*62/i,
      /62[^0-9]*hitmark/i,
      /HITMARK_62/i,
      /\b62\b.*(?:hit|splat|damage|overlay)/i,
    ],
    extensions: ['.ts', '.js', '.json', '.txt', '.d.ts', '.md'],
    searchRoots: ['.', 'generated', 'extracted', 'scripts', 'decompiled']
  },
  {
    name: 'CLIENT_SCRIPT_HITMARK',
    description: 'Client scripts that emit or handle hitmarks',
    patterns: [
      /hitmark/i,
      /hitsplat/i,
      /damage.*overlay/i,
      /overlay.*damage/i,
      /splat/i,
      /emit.*hit/i,
      /show.*damage/i,
    ],
    extensions: ['.ts', '.js', '.json', '.txt'],
    searchRoots: ['scripts', 'decompiled', 'cs2', 'clientscripts']
  },
  {
    name: 'ARCHIVE_2_GROUP_46',
    description: 'References to Archive 2 Group 46 (hitmark configs)',
    patterns: [
      /archive[^0-9]*2/i,
      /group[^0-9]*46/i,
      /a2.*g46/i,
      /archive2.*group46/i,
      /config.*46/i,
      /46.*config/i,
    ],
    extensions: ['.ts', '.js', '.json', '.txt', '.md'],
    searchRoots: ['.', 'generated', 'extracted']
  },
  {
    name: 'OPCODE_62_USAGE',
    description: 'Client script opcodes or operations using value 62',
    patterns: [
      /opcode[^0-9]*62/i,
      /op[^0-9]*62/i,
      /62[^0-9]*opcode/i,
      /operation.*62/i,
      /\b62\b.*(?:script|cs2|client)/i,
    ],
    extensions: ['.ts', '.js', '.json', '.txt'],
    searchRoots: ['scripts', 'decompiled', 'cs2', 'generated']
  },
  {
    name: 'NXT_STRING_HITMARK',
    description: 'NXTStringForensics decompiled strings mentioning hitmarks',
    patterns: [
      /hitmark/i,
      /hitsplat/i,
      /damage.*number/i,
      /number.*damage/i,
      /floating.*text/i,
      /text.*floating/i,
    ],
    extensions: ['.txt', '.json', '.ts', '.js'],
    searchRoots: ['nxt_strings', 'decompiled', 'strings']
  }
];

// ─── FILE SCANNER ─────────────────────────────────────────────────────────

interface MatchResult {
  pattern: string;
  line: number;
  context: string;
  filePath: string;
}

interface FileScanResult {
  filePath: string;
  huntName: string;
  matches: MatchResult[];
}

function scanFile(filePath: string, hunt: HuntPattern): MatchResult[] {
  const matches: MatchResult[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of hunt.patterns) {
        if (pattern.test(line)) {
          // Get context: 2 lines before and after
          const start = Math.max(0, i - 2);
          const end = Math.min(lines.length, i + 3);
          const context = lines.slice(start, end).join('\n');

          matches.push({
            pattern: pattern.source,
            line: i + 1,
            context: context.substring(0, 500), // Limit context length
            filePath
          });
        }
      }
    }
  } catch (e) {
    // Binary or unreadable file — skip
  }

  return matches;
}

function findFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findFiles(fullPath, extensions));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (e) {
    // Directory doesn't exist or no access
  }

  return files;
}

// ─── MAIN HUNT ──────────────────────────────────────────────────────────────

interface HuntReport {
  timestamp: string;
  cacheRoot: string;
  patterns: {
    name: string;
    description: string;
    filesScanned: number;
    matchesFound: number;
    topMatches: MatchResult[];
  }[];
  summary: {
    totalFilesScanned: number;
    totalMatches: number;
    uniqueFilesWithMatches: string[];
    recommendedNextSteps: string[];
  };
}

function runHunt(): HuntReport {
  const report: HuntReport = {
    timestamp: new Date().toISOString(),
    cacheRoot: CACHE_PEDAGOGY_ROOT,
    patterns: [],
    summary: {
      totalFilesScanned: 0,
      totalMatches: 0,
      uniqueFilesWithMatches: [],
      recommendedNextSteps: []
    }
  };

  const uniqueFiles = new Set<string>();
  let totalFiles = 0;
  let totalMatches = 0;

  for (const hunt of HUNT_PATTERNS) {
    logger.log(`\n🔍 Starting hunt: ${hunt.name}`);
    logger.log(`   Description: ${hunt.description}`);

    const allMatches: MatchResult[] = [];
    let filesScanned = 0;

    for (const searchRoot of hunt.searchRoots) {
      const fullPath = path.join(CACHE_PEDAGOGY_ROOT, searchRoot);
      if (!fs.existsSync(fullPath)) {
        logger.log(`   ⚠️  Directory not found: ${fullPath}`);
        continue;
      }

      const files = findFiles(fullPath, hunt.extensions);
      logger.log(`   📁 Scanning ${files.length} files in ${searchRoot}`);

      for (const file of files) {
        filesScanned++;
        totalFiles++;
        const matches = scanFile(file, hunt);

        if (matches.length > 0) {
          allMatches.push(...matches);
          uniqueFiles.add(file);
          logger.log(`   ✅ Match in ${path.relative(CACHE_PEDAGOGY_ROOT, file)}: ${matches.length} hits`);
        }
      }
    }

    totalMatches += allMatches.length;

    // Keep top 10 matches for report
    const topMatches = allMatches.slice(0, 10);

    report.patterns.push({
      name: hunt.name,
      description: hunt.description,
      filesScanned,
      matchesFound: allMatches.length,
      topMatches
    });

    logger.log(`   📊 Results: ${filesScanned} files scanned, ${allMatches.length} matches`);
  }

  report.summary.totalFilesScanned = totalFiles;
  report.summary.totalMatches = totalMatches;
  report.summary.uniqueFilesWithMatches = Array.from(uniqueFiles);

  // Generate recommendations
  report.summary.recommendedNextSteps = generateRecommendations(report);

  return report;
}

function generateRecommendations(report: HuntReport): string[] {
  const steps: string[] = [];

  const hitmarkHunt = report.patterns.find(p => p.name === 'HITMARK_SUBTYPE_62');
  const scriptHunt = report.patterns.find(p => p.name === 'CLIENT_SCRIPT_HITMARK');
  const archiveHunt = report.patterns.find(p => p.name === 'ARCHIVE_2_GROUP_46');

  if (hitmarkHunt && hitmarkHunt.matchesFound === 0) {
    steps.push('No direct hitmark subtype 62 references found in extracted data. Need to decompile more client scripts or extract raw cache bytes.');
  }

  if (scriptHunt && scriptHunt.matchesFound > 0) {
    steps.push(`Found ${scriptHunt.matchesFound} client script references to hitmarks. Decompile these scripts to find the exact opcode sequence that emits hitmark 62.`);
  }

  if (archiveHunt && archiveHunt.matchesFound === 0) {
    steps.push('No Archive 2 Group 46 references in extracted data. Need raw cache dump or updated extraction tool.');
  }

  steps.push('Run CacheForensicsLimb with versioned opcode rules (memory #54) on Archive 2, Group 46 to extract hitmark configs.');
  steps.push('Search decompiled rs2client.exe (NXTStringForensics) for "hitmark", "splat", "damage" string constants to find renderer methods.');
  steps.push('If no hits in existing extraction, write raw byte dumper for Archive 2 Group 46 and inspect first 64 bytes for structure.');

  return steps;
}

// ─── RAW CACHE BYTE DUMPER ─────────────────────────────────────────────────

interface RawByteDump {
  archive: number;
  group: number;
  fileIndex: number;
  byteLength: number;
  first64Bytes: number[];
  asciiPreview: string;
  structureGuess: string;
}

function dumpRawCacheBytes(cacheRoot: string, archive: number, group: number): RawByteDump[] {
  const dumps: RawByteDump[] = [];

  // Try common cache file layouts
  const possiblePaths = [
    path.join(cacheRoot, `cache/main_file_cache.dat2`),
    path.join(cacheRoot, `cache/cache.dat2`),
    path.join(cacheRoot, `cache/data.dat2`),
    path.join(cacheRoot, `main_file_cache.dat2`),
  ];

  logger.log(`\n📦 Attempting raw cache dump for Archive ${archive}, Group ${group}`);

  for (const dat2Path of possiblePaths) {
    if (fs.existsSync(dat2Path)) {
      logger.log(`   Found cache file: ${dat2Path}`);
      // Note: Actual dat2 parsing requires XTEA decryption and group extraction
      // This is a placeholder for the real implementation
      logger.log(`   ⚠️  Raw dat2 parsing not implemented in this script.`);
      logger.log(`   Use existing CacheForensicsLimb or rsmv_extract tool for actual extraction.`);
      break;
    }
  }

  // Check if already-extracted files exist for this group
  const extractedPaths = [
    path.join(cacheRoot, `extracted/a${archive}/g${group}`),
    path.join(cacheRoot, `extracted/archive_${archive}/group_${group}`),
    path.join(cacheRoot, `raw/a${archive}_g${group}.bin`),
  ];

  for (const extractPath of extractedPaths) {
    if (fs.existsSync(extractPath)) {
      logger.log(`   Found extracted data: ${extractPath}`);
      // TODO: Parse extracted files
    }
  }

  return dumps;
}

// ─── MAIN EXECUTION ─────────────────────────────────────────────────────────

function main(): void {
  logger.log('═══════════════════════════════════════════════════════════════');
  logger.log('  POG2 HITMARK FORENSICS — Hunt for subtype 62 across all substrates');
  logger.log('═══════════════════════════════════════════════════════════════');
  logger.log(`Cache Pedagogy Root: ${CACHE_PEDAGOGY_ROOT}`);
  logger.log(`Output Directory: ${OUTPUT_DIR}`);
  logger.log('');

  // Run the hunt
  const report = runHunt();

  // Attempt raw dump
  dumpRawCacheBytes(CACHE_PEDAGOGY_ROOT, 2, 46);

  // Write report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');

  // Final summary
  logger.log('\n═══════════════════════════════════════════════════════════════');
  logger.log('  HUNT COMPLETE');
  logger.log('═══════════════════════════════════════════════════════════════');
  logger.log(`Total files scanned: ${report.summary.totalFilesScanned}`);
  logger.log(`Total matches: ${report.summary.totalMatches}`);
  logger.log(`Unique files with matches: ${report.summary.uniqueFilesWithMatches.length}`);
  logger.log('');
  logger.log('Recommended next steps:');
  for (const step of report.summary.recommendedNextSteps) {
    logger.log(`  → ${step}`);
  }
  logger.log('');
  logger.log(`Report saved to: ${REPORT_FILE}`);
  logger.log(`Log saved to: ${LOG_FILE}`);

  // Flush log
  logger.flush();
}

// Run if executed directly
main();

// Export for use as module
export { runHunt, dumpRawCacheBytes, HUNT_PATTERNS };
export type { HuntReport, MatchResult, HuntPattern };
