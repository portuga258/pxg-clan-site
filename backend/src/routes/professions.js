import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { requireRole } from '../middleware/auth.js';
import { db } from '../utils/database.js';

const VALID_PROFESSIONS = ['engineer', 'professor', 'stylist', 'adventurer'];
const VALID_TIERS = ['S', 'A', 'B', 'C', 'D', 'E'];

const router = express.Router();

/**
 * GET /api/professions
 * List all professions with character info
 */
router.get('/', asyncHandler(async (req, res) => {
  const { character_id, profession, tier } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (character_id) {
    whereClause += ' AND p.character_id = ?';
    params.push(character_id);
  }

  if (profession) {
    whereClause += ' AND p.name = ?';
    params.push(profession);
  }

  if (tier) {
    whereClause += ' AND p.tier = ?';
    params.push(tier);
  }

  const professions = db.prepare(`
    SELECT
      p.*,
      c.name as character_name,
      c.level as character_level,
      c.clan_type
    FROM professions p
    JOIN characters c ON p.character_id = c.id
    ${whereClause}
    ORDER BY p.name, p.level DESC
  `).all(...params);

  res.json({ data: professions });
}));

/**
 * GET /api/professions/ranking/:profession
 * Get ranking for a specific profession
 */
router.get('/ranking/:profession', asyncHandler(async (req, res) => {
  const { profession } = req.params;

  if (!VALID_PROFESSIONS.includes(profession)) {
    throw new AppError('Profissão inválida', 400);
  }

  const ranking = db.prepare(`
    SELECT
      p.level,
      p.tier,
      p.rank,
      p.progress,
      c.name as character_name,
      c.level as character_level,
      c.clan_type,
      c.vocation
    FROM professions p
    JOIN characters c ON p.character_id = c.id
    WHERE p.name = ?
    ORDER BY p.level DESC, p.tier DESC
  `).all(profession);

  // Add rank position
  const ranked = ranking.map((p, index) => ({ ...p, position: index + 1 }));

  res.json({ profession, data: ranked });
}));

/**
 * GET /api/professions/character/:characterId
 * Get all professions for a character
 */
router.get('/character/:characterId', asyncHandler(async (req, res) => {
  const { characterId } = req.params;

  const character = db.prepare('SELECT id, name FROM characters WHERE id = ?').get(characterId);
  if (!character) {
    throw new AppError('Personagem não encontrado', 404);
  }

  const professions = db.prepare('SELECT * FROM professions WHERE character_id = ? ORDER BY level DESC').all(characterId);

  // Ensure all professions exist (create missing with level 0)
  const existingNames = new Set(professions.map(p => p.name));
  const allProfessions = VALID_PROFESSIONS.map(name => {
    const existing = professions.find(p => p.name === name);
    return existing || { name, level: 0, tier: 'E', rank: 'Novice', progress: 0, experience: 0 };
  });

  res.json({ character: character.name, data: allProfessions });
}));

/**
 * POST /api/professions
 * Create or update profession for a character (leader/officer only)
 */
router.post('/', requireRole('leader', 'officer'), asyncHandler(async (req, res) => {
  const { character_id, name, level, tier, rank, progress, experience } = req.body;

  if (!character_id || !name) {
    throw new AppError('character_id e name são obrigatórios', 400);
  }

  if (!VALID_PROFESSIONS.includes(name)) {
    throw new AppError('Profissão inválida', 400);
  }

  if (tier && !VALID_TIERS.includes(tier)) {
    throw new AppError('Tier inválido', 400);
  }

  const character = db.prepare('SELECT id FROM characters WHERE id = ?').get(character_id);
  if (!character) {
    throw new AppError('Personagem não encontrado', 404);
  }

  const existing = db.prepare('SELECT id FROM professions WHERE character_id = ? AND name = ?').get(character_id, name);

  const now = Math.floor(Date.now() / 1000);

  if (existing) {
    // Update
    const updates = [];
    const params = [];

    if (level !== undefined) { updates.push('level = ?'); params.push(level); }
    if (tier !== undefined) { updates.push('tier = ?'); params.push(tier); }
    if (rank !== undefined) { updates.push('rank = ?'); params.push(rank); }
    if (progress !== undefined) { updates.push('progress = ?'); params.push(progress); }
    if (experience !== undefined) { updates.push('experience = ?'); params.push(experience); }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(now);
      params.push(existing.id);

      db.prepare(`UPDATE professions SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }
  } else {
    // Create
    const id = uuidv4();
    db.prepare(`
      INSERT INTO professions (id, character_id, name, level, tier, rank, progress, experience, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, character_id, name, level || 0, tier || 'E', rank || 'Novice', progress || 0, experience || 0, now);
  }

  const profession = db.prepare('SELECT * FROM professions WHERE character_id = ? AND name = ?').get(character_id, name);

  res.json({ message: 'Profissão atualizada com sucesso', profession });
}));

/**
 * PUT /api/professions/:id
 * Update specific profession
 */
router.put('/:id', requireRole('leader', 'officer'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { level, tier, rank, progress, experience } = req.body;

  const profession = db.prepare('SELECT * FROM professions WHERE id = ?').get(id);
  if (!profession) {
    throw new AppError('Profissão não encontrada', 404);
  }

  if (tier && !VALID_TIERS.includes(tier)) {
    throw new AppError('Tier inválido', 400);
  }

  const updates = [];
  const params = [];

  if (level !== undefined) { updates.push('level = ?'); params.push(level); }
  if (tier !== undefined) { updates.push('tier = ?'); params.push(tier); }
  if (rank !== undefined) { updates.push('rank = ?'); params.push(rank); }
  if (progress !== undefined) { updates.push('progress = ?'); params.push(progress); }
  if (experience !== undefined) { updates.push('experience = ?'); params.push(experience); }

  if (updates.length === 0) {
    throw new AppError('Nenhum campo para atualizar', 400);
  }

  updates.push('updated_at = ?');
  params.push(Math.floor(Date.now() / 1000));
  params.push(id);

  db.prepare(`UPDATE professions SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM professions WHERE id = ?').get(id);

  res.json({ message: 'Profissão atualizada com sucesso', profession: updated });
}));

/**
 * POST /api/professions/bulk-update
 * Bulk update professions for multiple characters (leader only)
 */
router.post('/bulk-update', requireRole('leader'), asyncHandler(async (req, res) => {
  const { updates } = req.body; // Array of { character_id, name, level, tier, rank, progress, experience }

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError('Array de atualizações obrigatório', 400);
  }

  const now = Math.floor(Date.now() / 1000);
  let updated = 0;

  for (const update of updates) {
    const { character_id, name, level, tier, rank, progress, experience } = update;

    if (!character_id || !name || !VALID_PROFESSIONS.includes(name)) continue;

    if (tier && !VALID_TIERS.includes(tier)) continue;

    const existing = db.prepare('SELECT id FROM professions WHERE character_id = ? AND name = ?').get(character_id, name);

    if (existing) {
      const updateFields = [];
      const params = [];

      if (level !== undefined) { updateFields.push('level = ?'); params.push(level); }
      if (tier !== undefined) { updateFields.push('tier = ?'); params.push(tier); }
      if (rank !== undefined) { updateFields.push('rank = ?'); params.push(rank); }
      if (progress !== undefined) { updateFields.push('progress = ?'); params.push(progress); }
      if (experience !== undefined) { updateFields.push('experience = ?'); params.push(experience); }

      if (updateFields.length > 0) {
        updateFields.push('updated_at = ?');
        params.push(now);
        params.push(existing.id);
        db.prepare(`UPDATE professions SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);
        updated++;
      }
    } else {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO professions (id, character_id, name, level, tier, rank, progress, experience, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, character_id, name, level || 0, tier || 'E', rank || 'Novice', progress || 0, experience || 0, now);
      updated++;
    }
  }

  res.json({ message: `${updated} profissões atualizadas com sucesso` });
}));

export default router;