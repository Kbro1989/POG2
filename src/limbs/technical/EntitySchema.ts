/**
 * EntitySchema.ts - SQLite Schema for Sovereign Actor Persistence
 * Optimized for fast writes and simple joins without ORM overhead.
 */
export const schema = `
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS pedagogy (
  entity_id TEXT PRIMARY KEY,
  profile_json TEXT NOT NULL,
  updated_at INTEGER,
  FOREIGN KEY(entity_id) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  type TEXT,
  content TEXT NOT NULL,
  weight REAL DEFAULT 1.0,
  reinforcement REAL DEFAULT 1.0,
  FOREIGN KEY(entity_id) REFERENCES entities(id)
);

CREATE TABLE IF NOT EXISTS vibe_state (
  entity_id TEXT PRIMARY KEY,
  state_json TEXT,
  updated_at INTEGER,
  FOREIGN KEY(entity_id) REFERENCES entities(id)
);

CREATE INDEX IF NOT EXISTS idx_memories_entity 
ON memories(entity_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS cognitive_anomalies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tick INTEGER NOT NULL,
  event_id TEXT,
  anomaly_type TEXT NOT NULL,
  data_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`;

