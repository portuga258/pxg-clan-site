import 'dotenv/config';
import { db } from './database.js';

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

console.log('Initializing database...');

// Create tables
const schema = `
-- Users table (Discord OAuth users)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE,
  username TEXT NOT NULL,
  discord_username TEXT,
  discriminator TEXT,
  avatar TEXT,
  email TEXT COLLATE NOCASE UNIQUE,
  password_hash TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at INTEGER,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'officer', 'member')),
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  last_login_at INTEGER
);

-- One-time OAuth state for linking Discord to an existing account
CREATE TABLE IF NOT EXISTS discord_oauth_states (
  state_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Characters table (Game characters linked to users)
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  level INTEGER DEFAULT 1,
  vocation TEXT,
  clan_type TEXT CHECK (clan_type IN ('malefic', 'naturia', 'wingeon', 'seavell', 'volcanic', 'orebound', 'psycraft', 'gardsen')),
  activity_status TEXT DEFAULT 'offline' CHECK (activity_status IN ('online', 'offline')),
  peak_hours TEXT,
  favorite_hunts TEXT, -- JSON array
  bio TEXT,
  join_date INTEGER DEFAULT (strftime('%s', 'now')),
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Professions table
CREATE TABLE IF NOT EXISTS professions (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  name TEXT NOT NULL CHECK (name IN ('stylist', 'adventurer', 'engineer', 'professor', 'farmer', 'alchemist', 'breeder', 'explorer')),
  level INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'E' CHECK (tier IN ('S', 'A', 'B', 'C', 'D', 'E')),
  rank TEXT DEFAULT 'Novice',
  progress INTEGER DEFAULT 0,
  experience INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  UNIQUE(character_id, name)
);

-- Pokemon Loans table
CREATE TABLE IF NOT EXISTS pokemon_loans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  types TEXT NOT NULL, -- JSON array
  level INTEGER NOT NULL,
  utilities TEXT NOT NULL, -- JSON array
  moveset TEXT, -- JSON array
  held_item TEXT,
  ability TEXT,
  description TEXT,
  owner_id TEXT NOT NULL,
  borrower_id TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'borrowed', 'pending')),
  requested_at INTEGER,
  expected_return_at INTEGER,
  returned_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (owner_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (borrower_id) REFERENCES characters(id) ON DELETE SET NULL
);

-- Item Requests table
CREATE TABLE IF NOT EXISTS item_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  request_scope TEXT NOT NULL DEFAULT 'member' CHECK (request_scope IN ('member', 'clan')),
  item_name TEXT NOT NULL,
  item_category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  collected_quantity INTEGER DEFAULT 0,
  purpose TEXT,
  hunt_source TEXT,
  profession_required TEXT,
  min_profession_level INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'collecting', 'ready', 'completed', 'cancelled')),
  notes TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  completed_at INTEGER,
  FOREIGN KEY (requester_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (target_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Contributions to item requests
CREATE TABLE IF NOT EXISTS item_request_contributions (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  contributor_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (request_id) REFERENCES item_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (contributor_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('event', 'rule', 'maintenance', 'general')),
  pinned BOOLEAN DEFAULT FALSE,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (author_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Clan Info table (single row for clan settings)
CREATE TABLE IF NOT EXISTS clan_info (
  id TEXT PRIMARY KEY DEFAULT 'main',
  name TEXT NOT NULL,
  tag TEXT NOT NULL,
  slogan TEXT,
  emblem TEXT,
  recruitment_status TEXT DEFAULT 'open' CHECK (recruitment_status IN ('open', 'closed')),
  founded_date INTEGER,
  max_members INTEGER DEFAULT 50,
  discord_url TEXT,
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_clan_type ON characters(clan_type);
CREATE INDEX IF NOT EXISTS idx_characters_activity ON characters(activity_status);
CREATE INDEX IF NOT EXISTS idx_professions_character ON professions(character_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_loans_owner ON pokemon_loans(owner_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_loans_borrower ON pokemon_loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_loans_status ON pokemon_loans(status);
CREATE INDEX IF NOT EXISTS idx_item_requests_requester ON item_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_item_requests_target ON item_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_item_requests_status ON item_requests(status);
CREATE INDEX IF NOT EXISTS idx_item_request_contributions_request ON item_request_contributions(request_id);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(pinned, created_at DESC);
`;

db.exec(schema);

const characterColumns = db.pragma('table_info(characters)');
if (!characterColumns.some((column) => column.name === 'is_primary')) {
  db.exec('ALTER TABLE characters ADD COLUMN is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1))');
}
db.exec(`
  UPDATE characters
  SET is_primary = 1
  WHERE user_id IS NOT NULL
    AND is_primary = 0
    AND NOT EXISTS (
      SELECT 1 FROM characters AS primary_character
      WHERE primary_character.user_id = characters.user_id AND primary_character.is_primary = 1
    )
    AND id = (
      SELECT id FROM characters AS first_character
      WHERE first_character.user_id = characters.user_id
      ORDER BY first_character.created_at ASC, first_character.id ASC
      LIMIT 1
    )
`);
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_one_primary_per_user ON characters(user_id) WHERE is_primary = 1');

const userColumns = db.pragma('table_info(users)');
if (!userColumns.some((column) => column.name === 'discord_username')) {
  db.exec('ALTER TABLE users ADD COLUMN discord_username TEXT');
  db.exec(`
    UPDATE users
    SET discord_username = username
    WHERE discord_id IS NOT NULL AND discord_username IS NULL
  `);
}

const itemRequestColumns = db.pragma('table_info(item_requests)');
if (!itemRequestColumns.some((column) => column.name === 'request_scope')) {
  db.exec(`
    ALTER TABLE item_requests
    ADD COLUMN request_scope TEXT NOT NULL DEFAULT 'member'
    CHECK (request_scope IN ('member', 'clan'))
  `);
}
db.exec('CREATE INDEX IF NOT EXISTS idx_item_requests_scope_status ON item_requests(request_scope, status)');

console.log('Database schema created successfully!');

const professionTable = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'professions'").get();
if (professionTable && !professionTable.sql.includes("'professor'")) {
  db.pragma('foreign_keys = OFF');
  db.pragma('legacy_alter_table = ON');
  try {
    db.exec(`
      BEGIN IMMEDIATE;
      ALTER TABLE professions RENAME TO professions_before_professor;
      CREATE TABLE professions (
        id TEXT PRIMARY KEY,
        character_id TEXT NOT NULL,
        name TEXT NOT NULL CHECK (name IN ('stylist', 'adventurer', 'engineer', 'professor', 'farmer', 'alchemist', 'breeder', 'explorer')),
        level INTEGER DEFAULT 0,
        tier TEXT DEFAULT 'E' CHECK (tier IN ('S', 'A', 'B', 'C', 'D', 'E')),
        rank TEXT DEFAULT 'Novice',
        progress INTEGER DEFAULT 0,
        experience INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
        UNIQUE(character_id, name)
      );
      INSERT INTO professions
      SELECT id, character_id, name, level, tier, rank, progress, experience, created_at, updated_at
      FROM professions_before_professor;
      DROP TABLE professions_before_professor;
      CREATE INDEX IF NOT EXISTS idx_professions_character ON professions(character_id);
      COMMIT;
    `);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  } finally {
    db.pragma('legacy_alter_table = OFF');
    db.pragma('foreign_keys = ON');
  }
}

db.prepare(`
  INSERT OR IGNORE INTO clan_info (
    id, name, tag, slogan, emblem, recruitment_status, founded_date, max_members
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'main',
  'Lá Eles',
  'LAELES',
  'Se marcar bobeira na hunt... Lá Eles!',
  '👻',
  'open',
  Math.floor(new Date('2024-01-15').getTime() / 1000),
  50
);

db.close();
console.log('Database initialization complete.');