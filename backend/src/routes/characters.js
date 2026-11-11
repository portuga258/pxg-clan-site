import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { requireRole } from '../middleware/auth.js';
import { db } from '../utils/database.js';

const router = express.Router();
const PROFILE_PROFESSIONS = ['engineer', 'professor', 'stylist', 'adventurer'];
const PROFESSION_TIERS = ['S', 'A', 'B', 'C', 'D', 'E'];
const CLAN_TYPES = ['malefic', 'naturia', 'wingeon', 'seavell', 'volcanic', 'orebound', 'psycraft', 'gardsen'];
const TIER_LABELS = { S: 'Mestre', A: 'Expert', B: 'Veterano', C: 'Aprendiz', D: 'Iniciante', E: 'Novato' };

/**
 * GET /api/characters
 * List all characters with optional filters
 */
router.get('/', asyncHandler(async (req, res) => {
  const { clan_type, activity_status, search, sort = 'level', order = 'DESC', limit = 50, offset = 0 } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (clan_type) {
    whereClause += ' AND c.clan_type = ?';
    params.push(clan_type);
  }

  if (activity_status) {
    whereClause += ' AND c.activity_status = ?';
    params.push(activity_status);
  }

  if (search) {
    whereClause += ' AND (c.name LIKE ? OR c.vocation LIKE ? OR u.username LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const validSorts = ['level', 'name', 'join_date', 'created_at'];
  const sortColumn = validSorts.includes(sort) ? sort : 'level';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const query = `
    SELECT
      c.*,
      u.username as discord_username,
      u.role as discord_role
    FROM characters c
    LEFT JOIN users u ON c.user_id = u.id
    ${whereClause}
    ORDER BY c.${sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  params.push(parseInt(limit), parseInt(offset));

  const characters = db.prepare(query).all(...params);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM characters c
    LEFT JOIN users u ON c.user_id = u.id
    ${whereClause}
  `;
  const total = db.prepare(countQuery).all(...params.slice(0, -2))[0].total;

  // Get professions for each character
  const professionsStmt = db.prepare('SELECT * FROM professions WHERE character_id = ?');
  const charactersWithProfessions = characters.map(char => ({
    ...char,
    favorite_hunts: char.favorite_hunts ? JSON.parse(char.favorite_hunts) : [],
    professions: professionsStmt.all(char.id).map(p => ({
      name: p.name,
      level: p.level,
      tier: p.tier,
      rank: p.rank,
      progress: p.progress,
    })),
  }));

  res.json({
    data: charactersWithProfessions,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total,
    },
  });
}));

/**
 * GET /api/characters/:id
 * Get single character with full details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const character = db.prepare(`
    SELECT
      c.*,
      u.username as discord_username,
      u.discord_id,
      u.role as discord_role
    FROM characters c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(id);

  if (!character) {
    throw new AppError('Personagem não encontrado', 404);
  }

  // Get professions
  const professions = db.prepare('SELECT * FROM professions WHERE character_id = ?').all(character.id);

  // Get pokemon loans (owned)
  const ownedPokemons = db.prepare('SELECT * FROM pokemon_loans WHERE owner_id = ?').all(character.id);

  // Get pokemon loans (borrowed)
  const borrowedPokemons = db.prepare('SELECT * FROM pokemon_loans WHERE borrower_id = ?').all(character.id);

  // Get item requests (as requester)
  const requestedItems = db.prepare('SELECT * FROM item_requests WHERE requester_id = ? ORDER BY created_at DESC LIMIT 10').all(character.id);

  // Get item requests (as target/collector)
  const collectedItems = db.prepare('SELECT * FROM item_requests WHERE target_id = ? ORDER BY created_at DESC LIMIT 10').all(character.id);

  res.json({
    ...character,
    favorite_hunts: character.favorite_hunts ? JSON.parse(character.favorite_hunts) : [],
    professions: professions.map(p => ({
      name: p.name,
      level: p.level,
      tier: p.tier,
      rank: p.rank,
      progress: p.progress,
      experience: p.experience,
    })),
    owned_pokemons: ownedPokemons.map(p => ({ ...p, types: JSON.parse(p.types), utilities: JSON.parse(p.utilities), moveset: JSON.parse(p.moveset) })),
    borrowed_pokemons: borrowedPokemons.map(p => ({ ...p, types: JSON.parse(p.types), utilities: JSON.parse(p.utilities), moveset: JSON.parse(p.moveset) })),
    requested_items: requestedItems,
    collected_items: collectedItems,
  });
}));

/**
 * POST /api/characters
 * Create new character (leader/officer only)
 */
router.post('/', requireRole('leader', 'officer'), asyncHandler(async (req, res) => {
  const { name, level, vocation, clan_type, user_id, peak_hours, favorite_hunts, bio } = req.body;

  if (!name) {
    throw new AppError('Nome do personagem é obrigatório', 400);
  }

  // Check if character already exists
  const existing = db.prepare('SELECT id FROM characters WHERE name = ?').get(name);
  if (existing) {
    throw new AppError('Personagem já existe', 409);
  }

  const id = uuidv4();
  const now = Math.floor(Date.now() / 1000);

  db.prepare(`
    INSERT INTO characters (id, user_id, name, level, vocation, clan_type, peak_hours, favorite_hunts, bio, join_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, user_id || null, name, level || 1, vocation || null, clan_type || null, peak_hours || null, favorite_hunts ? JSON.stringify(favorite_hunts) : null, bio || null, now, now);

  const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);

  res.status(201).json({
    message: 'Personagem criado com sucesso',
    character: { ...character, favorite_hunts: character.favorite_hunts ? JSON.parse(character.favorite_hunts) : [] },
  });
}));

/**
 * PUT /api/characters/:id
 * Update character
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { level, vocation, clan_type, activity_status, peak_hours, favorite_hunts, bio, professions } = req.body;

  const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
  if (!character) {
    throw new AppError('Personagem não encontrado', 404);
  }

  // Check permission: users can only update their own character, leaders/officers can update any
  if (req.user?.role !== 'leader' && req.user?.role !== 'officer' && character.user_id !== req.user?.id) {
    throw new AppError('Sem permissão para editar este personagem', 403);
  }

  if (level !== undefined && (!Number.isInteger(level) || level < 1 || level > 10000)) {
    throw new AppError('Level deve ser um número entre 1 e 10000', 400);
  }
  if (vocation !== undefined && (typeof vocation !== 'string' || vocation.length > 60)) {
    throw new AppError('Vocação deve ter no máximo 60 caracteres', 400);
  }
  if (clan_type !== undefined && clan_type !== null && clan_type !== '' && !CLAN_TYPES.includes(clan_type)) {
    throw new AppError('Clã inválido', 400);
  }
  if (activity_status !== undefined && !['online', 'offline'].includes(activity_status)) {
    throw new AppError('Status de atividade inválido', 400);
  }
  if (peak_hours !== undefined && (typeof peak_hours !== 'string' || peak_hours.length > 100)) {
    throw new AppError('Horário de pico deve ter no máximo 100 caracteres', 400);
  }
  if (favorite_hunts !== undefined && (!Array.isArray(favorite_hunts) || favorite_hunts.length > 20 || favorite_hunts.some((hunt) => typeof hunt !== 'string' || hunt.length > 80))) {
    throw new AppError('Informe até 20 hunts com no máximo 80 caracteres cada', 400);
  }
  if (bio !== undefined && (typeof bio !== 'string' || bio.length > 500)) {
    throw new AppError('A descrição deve ter no máximo 500 caracteres', 400);
  }
  if (professions !== undefined) {
    if (!Array.isArray(professions) || professions.length > PROFILE_PROFESSIONS.length) {
      throw new AppError('Lista de profissões inválida', 400);
    }
    const seenProfessions = new Set();
    for (const profession of professions) {
      if (!profession || typeof profession !== 'object' || !PROFILE_PROFESSIONS.includes(profession.name) || seenProfessions.has(profession.name)) {
        throw new AppError('Profissão inválida ou repetida', 400);
      }
      if (!Number.isInteger(profession.level) || profession.level < 0 || profession.level > 120) {
        throw new AppError('Level de profissão deve ser um número entre 0 e 120', 400);
      }
      if (!PROFESSION_TIERS.includes(profession.tier)) {
        throw new AppError('Tier de profissão inválido', 400);
      }
      seenProfessions.add(profession.name);
    }
  }

  const updates = [];
  const params = [];

  if (level !== undefined) { updates.push('level = ?'); params.push(level); }
  if (vocation !== undefined) { updates.push('vocation = ?'); params.push(vocation); }
  if (clan_type !== undefined) { updates.push('clan_type = ?'); params.push(clan_type || null); }
  if (activity_status !== undefined) { updates.push('activity_status = ?'); params.push(activity_status); }
  if (peak_hours !== undefined) { updates.push('peak_hours = ?'); params.push(peak_hours); }
  if (favorite_hunts !== undefined) { updates.push('favorite_hunts = ?'); params.push(JSON.stringify(favorite_hunts)); }
  if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }

  if (updates.length === 0 && professions === undefined) {
    throw new AppError('Nenhum campo para atualizar', 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const updateProfile = db.transaction(() => {
    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(now, id);
      db.prepare(`UPDATE characters SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    if (professions !== undefined) {
      const saveProfession = db.prepare(`
        INSERT INTO professions (id, character_id, name, level, tier, rank, progress, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
        ON CONFLICT(character_id, name) DO UPDATE SET
          level = excluded.level,
          tier = excluded.tier,
          rank = excluded.rank,
          updated_at = excluded.updated_at
      `);
      for (const profession of professions) {
        saveProfession.run(
          uuidv4(),
          id,
          profession.name,
          profession.level,
          profession.tier,
          TIER_LABELS[profession.tier],
          now,
          now
        );
      }
    }
  });
  updateProfile();

  const updated = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
  const updatedProfessions = db.prepare('SELECT name, level, tier, rank, progress FROM professions WHERE character_id = ?').all(id);

  res.json({
    message: 'Personagem atualizado com sucesso',
    character: {
      ...updated,
      favorite_hunts: updated.favorite_hunts ? JSON.parse(updated.favorite_hunts) : [],
      professions: updatedProfessions,
    },
  });
}));

/**
 * DELETE /api/characters/:id
 * Delete character (leader only)
 */
router.delete('/:id', requireRole('leader'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
  if (!character) {
    throw new AppError('Personagem não encontrado', 404);
  }

  db.prepare('DELETE FROM characters WHERE id = ?').run(id);

  res.json({ message: 'Personagem removido com sucesso' });
}));

/**
 * GET /api/characters/:id/stats
 * Get character statistics for rankings
 */
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const character = db.prepare('SELECT id, name, level, clan_type FROM characters WHERE id = ?').get(id);
  if (!character) {
    throw new AppError('Personagem não encontrado', 404);
  }

  // Combat rank
  const combatRank = db.prepare('SELECT COUNT(*) + 1 as rank FROM characters WHERE level > (SELECT level FROM characters WHERE id = ?)').get(id).rank;

  // Profession stats
  const professions = db.prepare('SELECT name, level, tier FROM professions WHERE character_id = ?').all(id);

  const professionRanks = {};
  for (const prof of professions) {
    const rank = db.prepare('SELECT COUNT(*) + 1 as rank FROM professions WHERE name = ? AND level > ?').get(prof.name, prof.level).rank;
    professionRanks[prof.name] = rank;
  }

  res.json({
    character: character.name,
    combat_level: character.level,
    combat_rank: combatRank,
    professions: professions.map(p => ({ ...p, rank: professionRanks[p.name] })),
    total_profession_level: professions.reduce((sum, p) => sum + p.level, 0),
  });
}));

export default router;