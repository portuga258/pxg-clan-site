import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { requireRole } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../data/pxg-clan.db');
const db = new Database(dbPath);

const router = express.Router();

/**
 * GET /api/clan
 * Get clan information
 */
router.get('/', asyncHandler(async (req, res) => {
  const clan = db.prepare('SELECT * FROM clan_info WHERE id = ?').get('main');

  if (!clan) {
    throw new AppError('Clan não configurado', 404);
  }

  // Get member count
  const memberCount = db.prepare('SELECT COUNT(*) as count FROM characters').get().count;
  const onlineCount = db.prepare('SELECT COUNT(*) as count FROM characters WHERE activity_status = ?').get('online').count;

  // Get top stats
  const topLevel = db.prepare('SELECT name, level FROM characters ORDER BY level DESC LIMIT 1').get();
  const totalProfLevels = db.prepare('SELECT SUM(level) as total FROM professions').get().total || 0;

  res.json({
    ...clan,
    founded_date: clan.founded_date ? new Date(clan.founded_date * 1000).toISOString() : null,
    updated_at: clan.updated_at ? new Date(clan.updated_at * 1000).toISOString() : null,
    stats: {
      member_count: memberCount,
      online_count: onlineCount,
      max_members: clan.max_members,
      top_level: topLevel ? { name: topLevel.name, level: topLevel.level } : null,
      total_profession_levels: totalProfLevels,
    },
  });
}));

/**
 * PUT /api/clan
 * Update clan information (leader only)
 */
router.put('/', requireRole('leader'), asyncHandler(async (req, res) => {
  const { name, tag, slogan, emblem, recruitment_status, max_members, discord_url } = req.body;

  const clan = db.prepare('SELECT * FROM clan_info WHERE id = ?').get('main');
  if (!clan) {
    throw new AppError('Clan não configurado', 404);
  }

  if (recruitment_status && !['open', 'closed'].includes(recruitment_status)) {
    throw new AppError('Status de recrutamento inválido', 400);
  }

  const updates = [];
  const params = [];

  if (name !== undefined) { updates.push('name = ?'); params.push(name); }
  if (tag !== undefined) { updates.push('tag = ?'); params.push(tag); }
  if (slogan !== undefined) { updates.push('slogan = ?'); params.push(slogan); }
  if (emblem !== undefined) { updates.push('emblem = ?'); params.push(emblem); }
  if (recruitment_status !== undefined) { updates.push('recruitment_status = ?'); params.push(recruitment_status); }
  if (max_members !== undefined) { updates.push('max_members = ?'); params.push(max_members); }
  if (discord_url !== undefined) { updates.push('discord_url = ?'); params.push(discord_url); }

  if (updates.length === 0) {
    throw new AppError('Nenhum campo para atualizar', 400);
  }

  updates.push('updated_at = ?');
  params.push(Math.floor(Date.now() / 1000));

  db.prepare(`UPDATE clan_info SET ${updates.join(', ')} WHERE id = ?`).run(...params, 'main');

  const updated = db.prepare('SELECT * FROM clan_info WHERE id = ?').get('main');

  res.json({ message: 'Clan atualizado com sucesso', clan: updated });
}));

/**
 * GET /api/clan/rankings/combat
 * Get combat level ranking
 */
router.get('/rankings/combat', asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const ranking = db.prepare(`
    SELECT
      c.id, c.name, c.level, c.vocation, c.clan_type, c.activity_status,
      u.username as discord_username
    FROM characters c
    LEFT JOIN users u ON c.user_id = u.id
    ORDER BY c.level DESC
    LIMIT ?
  `).all(parseInt(limit));

  const ranked = ranking.map((c, index) => ({ ...c, position: index + 1 }));

  res.json({ data: ranked });
}));

/**
 * GET /api/clan/rankings/profession/:profession
 * Get profession ranking
 */
router.get('/rankings/profession/:profession', asyncHandler(async (req, res) => {
  const { profession } = req.params;
  const { limit = 10 } = req.query;

  const VALID_PROFESSIONS = ['stylist', 'adventurer', 'engineer', 'farmer', 'alchemist', 'breeder', 'explorer'];
  if (!VALID_PROFESSIONS.includes(profession)) {
    throw new AppError('Profissão inválida', 400);
  }

  const ranking = db.prepare(`
    SELECT
      p.level, p.tier, p.rank, p.progress,
      c.id, c.name, c.level as character_level, c.vocation, c.clan_type, c.activity_status
    FROM professions p
    JOIN characters c ON p.character_id = c.id
    WHERE p.name = ?
    ORDER BY p.level DESC, p.tier DESC
    LIMIT ?
  `).all(profession, parseInt(limit));

  const ranked = ranking.map((p, index) => ({ ...p, position: index + 1 }));

  res.json({ profession, data: ranked });
}));

/**
 * GET /api/clan/members/online
 * Get online members
 */
router.get('/members/online', asyncHandler(async (req, res) => {
  const members = db.prepare(`
    SELECT
      c.id, c.name, c.level, c.vocation, c.clan_type, c.peak_hours,
      u.username as discord_username
    FROM characters c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.activity_status = 'online'
    ORDER BY c.level DESC
  `).all();

  res.json({ data: members, count: members.length });
}));

/**
 * GET /api/clan/stats
 * Get clan statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const memberCount = db.prepare('SELECT COUNT(*) as count FROM characters').get().count;
  const onlineCount = db.prepare('SELECT COUNT(*) as count FROM characters WHERE activity_status = ?').get('online').count;

  const clanTypeStats = db.prepare(`
    SELECT clan_type, COUNT(*) as count
    FROM characters
    GROUP BY clan_type
  `).all();

  const vocationStats = db.prepare(`
    SELECT vocation, COUNT(*) as count
    FROM characters
    WHERE vocation IS NOT NULL
    GROUP BY vocation
  `).all();

  const professionStats = db.prepare(`
    SELECT name, COUNT(*) as count, AVG(level) as avg_level, MAX(level) as max_level
    FROM professions
    GROUP BY name
  `).all();

  const loanStats = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM pokemon_loans
    GROUP BY status
  `).all();

  const requestStats = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM item_requests
    GROUP BY status
  `).all();

  res.json({
    members: {
      total: memberCount,
      online: onlineCount,
      offline: memberCount - onlineCount,
    },
    byClanType: clanTypeStats,
    byVocation: vocationStats,
    byProfession: professionStats,
    pokemonLoans: loanStats,
    itemRequests: requestStats,
  });
}));

export default router;