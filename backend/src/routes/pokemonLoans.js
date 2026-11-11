import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { requireRole } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../data/pxg-clan.db');
const db = new Database(dbPath);

const VALID_STATUSES = ['available', 'borrowed', 'pending'];

const router = express.Router();

/**
 * GET /api/pokemon-loans
 * List all pokemon loans with filters
 */
router.get('/', asyncHandler(async (req, res) => {
  const { status, type, utility, min_level, owner_id, search, limit = 50, offset = 0 } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (status && VALID_STATUSES.includes(status)) {
    whereClause += ' AND pl.status = ?';
    params.push(status);
  }

  if (type) {
    whereClause += ' AND pl.types LIKE ?';
    params.push(`%"${type}"%`);
  }

  if (utility) {
    whereClause += ' AND pl.utilities LIKE ?';
    params.push(`%"${utility}"%`);
  }

  if (min_level) {
    whereClause += ' AND pl.level >= ?';
    params.push(parseInt(min_level));
  }

  if (owner_id) {
    whereClause += ' AND pl.owner_id = ?';
    params.push(owner_id);
  }

  if (search) {
    whereClause += ' AND (pl.name LIKE ? OR c_owner.name LIKE ? OR c_borrower.name LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const query = `
    SELECT
      pl.*,
      c_owner.name as owner_name,
      c_owner.clan_type as owner_clan_type,
      c_borrower.name as borrower_name,
      c_borrower.clan_type as borrower_clan_type
    FROM pokemon_loans pl
    JOIN characters c_owner ON pl.owner_id = c_owner.id
    LEFT JOIN characters c_borrower ON pl.borrower_id = c_borrower.id
    ${whereClause}
    ORDER BY
      CASE pl.status WHEN 'available' THEN 0 WHEN 'pending' THEN 1 WHEN 'borrowed' THEN 2 END,
      pl.level DESC,
      pl.created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(parseInt(limit), parseInt(offset));

  const loans = db.prepare(query).all(...params);

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM pokemon_loans pl ${whereClause}`;
  const total = db.prepare(countQuery).all(...params.slice(0, -2))[0].total;

  res.json({
    data: loans.map(l => ({
      ...l,
      types: JSON.parse(l.types),
      utilities: JSON.parse(l.utilities),
      moveset: l.moveset ? JSON.parse(l.moveset) : [],
    })),
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total,
    },
  });
}));

/**
 * GET /api/pokemon-loans/:id
 * Get single pokemon loan
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const loan = db.prepare(`
    SELECT
      pl.*,
      c_owner.name as owner_name,
      c_owner.clan_type as owner_clan_type,
      c_owner.user_id as owner_user_id,
      c_borrower.name as borrower_name,
      c_borrower.clan_type as borrower_clan_type,
      c_borrower.user_id as borrower_user_id
    FROM pokemon_loans pl
    JOIN characters c_owner ON pl.owner_id = c_owner.id
    LEFT JOIN characters c_borrower ON pl.borrower_id = c_borrower.id
    WHERE pl.id = ?
  `).get(id);

  if (!loan) {
    throw new AppError('Pokémon não encontrado', 404);
  }

  res.json({
    ...loan,
    types: JSON.parse(loan.types),
    utilities: JSON.parse(loan.utilities),
    moveset: loan.moveset ? JSON.parse(loan.moveset) : [],
  });
}));

/**
 * POST /api/pokemon-loans
 * Add new pokemon to loan registry
 */
router.post('/', asyncHandler(async (req, res) => {
  const { name, types, level, utilities, moveset, held_item, ability, description, owner_id } = req.body;

  if (!name || !types || !level || !utilities || !owner_id) {
    throw new AppError('Campos obrigatórios: name, types, level, utilities, owner_id', 400);
  }

  if (!Array.isArray(types) || types.length === 0) {
    throw new AppError('types deve ser um array não vazio', 400);
  }

  if (!Array.isArray(utilities) || utilities.length === 0) {
    throw new AppError('utilities deve ser um array não vazio', 400);
  }

  const owner = db.prepare('SELECT id FROM characters WHERE id = ?').get(owner_id);
  if (!owner) {
    throw new AppError('Dono não encontrado', 404);
  }

  // Check if user can add pokemon (owner or leader/officer)
  if (req.user.role !== 'leader' && req.user.role !== 'officer' && owner_id !== req.user.id) {
    // Check if the owner_id corresponds to user's character
    const userChar = db.prepare('SELECT id FROM characters WHERE user_id = ?').get(req.user.id);
    if (!userChar || userChar.id !== owner_id) {
      throw new AppError('Você só pode adicionar pokémons seus', 403);
    }
  }

  const id = uuidv4();
  const now = Math.floor(Date.now() / 1000);

  db.prepare(`
    INSERT INTO pokemon_loans (id, name, types, level, utilities, moveset, held_item, ability, description, owner_id, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)
  `).run(id, name, JSON.stringify(types), level, JSON.stringify(utilities), JSON.stringify(moveset || []), held_item || null, ability || null, description || null, owner_id, now);

  const loan = db.prepare('SELECT * FROM pokemon_loans WHERE id = ?').get(id);

  res.status(201).json({
    message: 'Pokémon adicionado ao registry',
    loan: { ...loan, types: JSON.parse(loan.types), utilities: JSON.parse(loan.utilities), moveset: JSON.parse(loan.moveset) },
  });
}));

/**
 * POST /api/pokemon-loans/:id/request
 * Request to borrow a pokemon
 */
router.post('/:id/request', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { borrower_id, expected_days = 7, notes } = req.body;

  const loan = db.prepare('SELECT * FROM pokemon_loans WHERE id = ?').get(id);
  if (!loan) {
    throw new AppError('Pokémon não encontrado', 404);
  }

  if (loan.status !== 'available') {
    throw new AppError('Pokémon não está disponível para empréstimo', 400);
  }

  // Determine borrower
  let targetBorrowerId = borrower_id;
  if (!targetBorrowerId) {
    // Use requester's character
    const userChar = db.prepare('SELECT id FROM characters WHERE user_id = ?').get(req.user.id);
    if (!userChar) {
      throw new AppError('Você não tem personagem vinculado', 400);
    }
    targetBorrowerId = userChar.id;
  }

  const borrower = db.prepare('SELECT id FROM characters WHERE id = ?').get(targetBorrowerId);
  if (!borrower) {
    throw new AppError('Personagem emprestador não encontrado', 404);
  }

  if (targetBorrowerId === loan.owner_id) {
    throw new AppError('Você não pode emprestar seu próprio Pokémon', 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const expectedReturn = now + (parseInt(expected_days) * 86400);

  db.prepare(`
    UPDATE pokemon_loans SET
      status = 'pending',
      borrower_id = ?,
      requested_at = ?,
      expected_return_at = ?,
      updated_at = ?
    WHERE id = ?
  `).run(targetBorrowerId, now, expectedReturn, now, id);

  // TODO: Send notification to owner (Discord webhook, email, etc.)

  const updated = db.prepare('SELECT * FROM pokemon_loans WHERE id = ?').get(id);

  res.json({
    message: 'Solicitação de empréstimo enviada',
    loan: { ...updated, types: JSON.parse(updated.types), utilities: JSON.parse(updated.utilities) },
  });
}));

/**
 * PUT /api/pokemon-loans/:id/approve
 * Approve a loan request (owner only)
 */
router.put('/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const loan = db.prepare('SELECT * FROM pokemon_loans WHERE id = ?').get(id);
  if (!loan) {
    throw new AppError('Pokémon não encontrado', 404);
  }

  // Check if user is the owner
  const ownerChar = db.prepare('SELECT user_id FROM characters WHERE id = ?').get(loan.owner_id);
  if (!ownerChar || (req.user.role !== 'leader' && req.user.role !== 'officer' && ownerChar.user_id !== req.user.id)) {
    throw new AppError('Apenas o dono pode aprovar o empréstimo', 403);
  }

  if (loan.status !== 'pending') {
    throw new AppError('Não há solicitação pendente para este Pokémon', 400);
  }

  const now = Math.floor(Date.now() / 1000);

  db.prepare(`
    UPDATE pokemon_loans SET
      status = 'borrowed',
      updated_at = ?
    WHERE id = ?
  `).run(now, id);

  // TODO: Send notification to borrower

  const updated = db.prepare('SELECT * FROM pokemon_loans WHERE id = ?').get(id);

  res.json({
    message: 'Empréstimo aprovado',
    loan: { ...updated, types: JSON.parse(updated.types), utilities: JSON.parse(updated.utilities) },
  });
}));

/**
 * PUT /api/pokemon-loans/:id/return
 * Return a borrowed pokemon
 */
router.put('/:id/return', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const loan = db.prepare('SELECT * FROM pokemon_loans WHERE id = ?').get(id);
  if (!loan) {
    throw new AppError('Pokémon não encontrado', 404);
  }

  if (loan.status !== 'borrowed') {
    throw new AppError('Pokémon não está emprestado', 400);
  }

  // Check if user is borrower or owner
  const ownerChar = db.prepare('SELECT user_id FROM characters WHERE id = ?').get(loan.owner_id);
  const borrowerChar = loan.borrower_id ? db.prepare('SELECT user_id FROM characters WHERE id = ?').get(loan.borrower_id) : null;

  const isOwner = req.user.role === 'leader' || req.user.role === 'officer' || ownerChar?.user_id === req.user.id;
  const isBorrower = borrowerChar?.user_id === req.user.id;

  if (!isOwner && !isBorrower) {
    throw new AppError('Apenas o dono ou o emprestador podem devolver', 403);
  }

  const now = Math.floor(Date.now() / 1000);

  db.prepare(`
    UPDATE pokemon_loans SET
      status = 'available',
      borrower_id = NULL,
      requested_at = NULL,
      expected_return_at = NULL,
      returned_at = ?,
      updated_at = ?
    WHERE id = ?
  `).run(now, now, id);

  const updated = db.prepare('SELECT * FROM pokemon_loans WHERE id = ?').get(id);

  res.json({
    message: 'Pokémon devolvido com sucesso',
    loan: { ...updated, types: JSON.parse(updated.types), utilities: JSON.parse(updated.utilities) },
  });
}));

/**
 * PUT /api/pokemon-loans/:id
 * Update pokemon loan details (owner only)
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, types, level, utilities, moveset, held_item, ability, description } = req.body;

  const loan = db.prepare('SELECT * FROM pokemon_loans WHERE id = ?').get(id);
  if (!loan) {
    throw new AppError('Pokémon não encontrado', 404);
  }

  // Check if user is the owner
  const ownerChar = db.prepare('SELECT user_id FROM characters WHERE id = ?').get(loan.owner_id);
  if (!ownerChar || (req.user.role !== 'leader' && req.user.role !== 'officer' && ownerChar.user_id !== req.user.id)) {
    throw new AppError('Apenas o dono pode editar', 403);
  }

  if (loan.status !== 'available') {
    throw new AppError('Não é possível editar um Pokémon emprestado', 400);
  }

  const updates = [];
  const params = [];

  if (name !== undefined) { updates.push('name = ?'); params.push(name); }
  if (types !== undefined) { updates.push('types = ?'); params.push(JSON.stringify(types)); }
  if (level !== undefined) { updates.push('level = ?'); params.push(level); }
  if (utilities !== undefined) { updates.push('utilities = ?'); params.push(JSON.stringify(utilities)); }
  if (moveset !== undefined) { updates.push('moveset = ?'); params.push(JSON.stringify(moveset)); }
  if (held_item !== undefined) { updates.push('held_item = ?'); params.push(held_item); }
  if (ability !== undefined) { updates.push('ability = ?'); params.push(ability); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }

  if (updates.length === 0) {
    throw new AppError('Nenhum campo para atualizar', 400);
  }

  updates.push('updated_at = ?');
  params.push(Math.floor(Date.now() / 1000));
  params.push(id);

  db.prepare(`UPDATE pokemon_loans SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM pokemon_loans WHERE id = ?').get(id);

  res.json({
    message: 'Pokémon atualizado com sucesso',
    loan: { ...updated, types: JSON.parse(updated.types), utilities: JSON.parse(updated.utilities), moveset: JSON.parse(updated.moveset) },
  });
}));

/**
 * DELETE /api/pokemon-loans/:id
 * Remove pokemon from registry (owner or leader only)
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const loan = db.prepare('SELECT * FROM pokemon_loans WHERE id = ?').get(id);
  if (!loan) {
    throw new AppError('Pokémon não encontrado', 404);
  }

  if (loan.status !== 'available') {
    throw new AppError('Não é possível remover um Pokémon emprestado', 400);
  }

  // Check if user is the owner
  const ownerChar = db.prepare('SELECT user_id FROM characters WHERE id = ?').get(loan.owner_id);
  if (!ownerChar || (req.user.role !== 'leader' && req.user.role !== 'officer' && ownerChar.user_id !== req.user.id)) {
    throw new AppError('Apenas o dono pode remover', 403);
  }

  db.prepare('DELETE FROM pokemon_loans WHERE id = ?').run(id);

  res.json({ message: 'Pokémon removido do registry' });
}));

export default router;