/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_DIR = 'D:\\D-sovereign-\\session_dashboards';
const LOG_FILE = path.join(TARGET_DIR, 'cleanup.log');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.bmp']);
const EXCLUDED_PATTERNS = [/pipelines/i, /gutenberg/i, /book/i];

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
        } catch (err) {
            console.error(`Failed to create directory ${dirPath}:`, err);
        }
    }
}

function logMessage(message, alsoConsole = true) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}\n`;
    
    if (alsoConsole) {
        console.log(message);
    }
    
    try {
        fs.appendFileSync(LOG_FILE, formattedMessage, 'utf8');
    } catch (err) {
        console.error('Failed to write to log file:', err);
    }
}

function isImageFile(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext);
}

function isExcluded(filePath) {
    return EXCLUDED_PATTERNS.some(regex => regex.test(filePath));
}

function cleanSessionDashboards() {
    logMessage('========================================');
    logMessage('Starting POG2 Vision Loop Screenshot Cleanup...');
    
    if (!fs.existsSync(TARGET_DIR)) {
        logMessage(`Target directory does not exist: ${TARGET_DIR}. Nothing to clean.`);
        return;
    }

    let deletedCount = 0;
    let freedBytes = 0;
    let failedCount = 0;

    function walkAndClean(currentDir) {
        let entries = [];
        try {
            entries = fs.readdirSync(currentDir, { withFileTypes: true });
        } catch (err) {
            logMessage(`Error reading directory ${currentDir}: ${err.message}`);
            return;
        }

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            // Safety check: skip if matches any exclusion patterns
            if (isExcluded(fullPath)) {
                continue;
            }

            if (entry.isDirectory()) {
                walkAndClean(fullPath);
            } else if (entry.isFile()) {
                if (isImageFile(entry.name)) {
                    try {
                        const stats = fs.statSync(fullPath);
                        const fileSize = stats.size;
                        
                        fs.unlinkSync(fullPath);
                        deletedCount++;
                        freedBytes += fileSize;
                    } catch (err) {
                        failedCount++;
                        logMessage(`Failed to delete file ${fullPath}: ${err.message}`, false);
                    }
                }
            }
        }
    }

    try {
        walkAndClean(TARGET_DIR);
        
        const freedMB = (freedBytes / (1024 * 1024)).toFixed(2);
        logMessage(`Cleanup completed successfully!`);
        logMessage(`Total files deleted: ${deletedCount}`);
        logMessage(`Total disk space freed: ${freedMB} MB`);
        if (failedCount > 0) {
            logMessage(`Failed deletions (skipped/locked): ${failedCount}`);
        }
    } catch (err) {
        logMessage(`Fatal error during cleanup execution: ${err.message}`);
    }
    logMessage('========================================\n');
}

// Ensure the target directory exists so we can at least log to it
ensureDirectoryExists(TARGET_DIR);

// Execute cleanup
cleanSessionDashboards();
