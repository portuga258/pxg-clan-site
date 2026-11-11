import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';
import { fileURLToPath } from 'url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const configuredPath = process.env.DATABASE_PATH;
const databasePath = configuredPath
  ? (isAbsolute(configuredPath) ? configuredPath : resolve(process.cwd(), configuredPath))
  : resolve(currentDirectory, '../../data/pxg-clan.db');

mkdirSync(dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrateUserTable() {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'").get();
  if (!table) return;

  const columns = db.pragma('table_info(users)');
  const discordIdColumn = columns.find((column) => column.name === 'discord_id');
  const hasPasswordHash = columns.some((column) => column.name === 'password_hash');

  if (discordIdColumn?.notnull === 0 && hasPasswordHash) {
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email COLLATE NOCASE) WHERE email IS NOT NULL');
    return;
  }

  db.pragma('foreign_keys = OFF');
  db.pragma('legacy_alter_table = ON');
  try {
    db.exec(`
      BEGIN IMMEDIATE;
      ALTER TABLE users RENAME TO users_before_email_auth;
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        discord_id TEXT UNIQUE,
        username TEXT NOT NULL,
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
      INSERT INTO users (
        id, discord_id, username, discriminator, avatar, email, password_hash,
        access_token, refresh_token, token_expires_at, role, created_at, updated_at, last_login_at
      )
      SELECT
        id, discord_id, username, discriminator, avatar, email, NULL,
        access_token, refresh_token, token_expires_at, role, created_at, updated_at, last_login_at
      FROM users_before_email_auth;
      DROP TABLE users_before_email_auth;
      CREATE UNIQUE INDEX idx_users_email_unique ON users(email COLLATE NOCASE) WHERE email IS NOT NULL;
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

function removeSeedDemoAccounts() {
  const usersTable = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'").get();
  if (!usersTable) return;

  const demoDiscordIds = [
    '123456789012345678',
    '234567890123456789',
    '345678901234567890',
    '456789012345678901',
    '567890123456789012',
    '678901234567890123',
    '789012345678901234',
    '890123456789012345',
  ];

  db.prepare('DELETE FROM users WHERE discord_id IN (?, ?, ?, ?, ?, ?, ?, ?)').run(...demoDiscordIds);
}

migrateUserTable();
removeSeedDemoAccounts();
