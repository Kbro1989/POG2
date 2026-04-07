import fs from 'fs';
import readline from 'readline';
import Database from 'better-sqlite3';
import { join } from 'path';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('SequenceIndexer');

const SEQUENCES_PATH = 'D:\\sovereign\\memory\\pedagogy\\sequences.json';
const DB_PATH = 'D:\\sovereign\\memory\\pedagogy\\sequences.db';

async function index() {
    logger.info('Commencing Kinematic Indexing (Sequences)...');

    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = OFF');
    
    db.exec(`
        CREATE TABLE IF NOT EXISTS sequences (
            id INTEGER PRIMARY KEY,
            frames_json TEXT NOT NULL
        )
    `);

    const insert = db.prepare('INSERT OR REPLACE INTO sequences (id, frames_json) VALUES (?, ?)');

    // Use a simpler approach for the 154MB file: manual stream parsing
    // Since it's a large JSON array of objects, we'll scan for the "id" lines
    const stream = fs.createReadStream(SEQUENCES_PATH, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream, terminal: false });

    let count = 0;
    let currentObject: any = null;
    let isParsing = false;

    db.transaction(() => {
        // This won't work with async streaming inside a transaction easily
        // But we can collect chunks or use a manual loop.
    })();

    // Switching to a more robust implementation using a JSON stream or just reading the whole file if memory allows (154MB is fine for node)
    logger.info('Reading substrate into memory (154MB)...');
    const raw = fs.readFileSync(SEQUENCES_PATH, 'utf8');
    const data = JSON.parse(raw);

    logger.info(`Parsed ${data.length} sequences. Commencing ingestion...`);

    const transaction = db.transaction((items) => {
        for (const item of items) {
            insert.run(item.id, JSON.stringify(item.frames));
        }
    });

    transaction(data);

    logger.info(`SUCCESS: Indexed ${data.length} kinematic sequences to ${DB_PATH}.`);
    db.close();
}

index().catch(err => {
    logger.error({ err }, 'Kinematic Indexing failed.');
});
