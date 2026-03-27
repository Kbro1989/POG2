import Database from 'better-sqlite3';
import { getLearningDbPath, hasSovereignDrive } from './utils/SovereignPathResolver.js';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

async function test() {
    console.log('Testing DB and Paths...');

    console.log('hasSovereignDrive:', hasSovereignDrive());

    const dbPath = getLearningDbPath();
    console.log('DB Path:', dbPath);

    const dbDir = dirname(dbPath);
    if (!existsSync(dbDir)) {
        console.log('Creating DB Dir:', dbDir);
        mkdirSync(dbDir, { recursive: true });
    }

    console.log('Opening Database...');
    try {
        const db = new Database(dbPath);
        console.log('Database opened successfully.');

        console.log('Running test query...');
        const row = db.prepare('SELECT 1 as result').get();
        console.log('Query result:', row);

        db.close();
        console.log('Database closed successfully.');
    } catch (err) {
        console.error('DATABASE ERROR:', err);
    }
}

test().catch(err => {
    console.error('UNHANDLED DB TEST ERROR:', err);
});
