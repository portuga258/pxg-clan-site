import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { requireRole } from '../middleware/auth.js';
import { db } from '../utils/database.js';

const VALID_TYPES = ['event', 'rule', 'maintenance', 'general'];

const router = express.Router();

/**
 * GET /api/announcements
 * List announcements (pinned first, then by date)
 */
router.get('/', asyncHandler(async (req, res) => {
  const { type, limit = 20, offset = 0, includeUnpinned = 'true' } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (type && VALID_TYPES.includes(type)) {
    whereClause += ' AND a.type = ?';
    params.push(type);
  }

  // Pinned announcements first
  const query = `
    SELECT
      a.*,
      c.name as author_name,
      c.clan_type as author_clan_type
    FROM announcements a
    JOIN characters c ON a.author_id = c.id
    ${whereClause}
    ORDER BY a.pinned DESC, a.created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(parseInt(limit), parseInt(offset));

  const announcements = db.prepare(query).all(...params);

  const countQuery = `SELECT COUNT(*) as total FROM announcements a ${whereClause}`;
  const total = db.prepare(countQuery).all(...params.slice(0, -2))[0].total;

  res.json({
    data: announcements,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total,
    },
  });
}));

/**
 * GET /api/announcements/:id
 * Get single announcement
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const announcement = db.prepare(`
    SELECT
      a.*,
      c.name as author_name,
      c.clan_type as author_clan_type
    FROM announcements a
    JOIN characters c ON a.author_id = c.id
    WHERE a.id = ?
  `).get(id);

  if (!announcement) {
    throw new AppError('Comunicado não encontrado', 404);
  }

  res.json(announcement);
}));

/**
 * POST /api/announcements
 * Create new announcement (leader/officer only)
 */
router.post('/', requireRole('leader', 'officer'), asyncHandler(async (req, res) => {
  const { title, content, type, pinned } = req.body;

  if (!title || !content) {
    throw new AppError('Título e conteúdo são obrigatórios', 400);
  }

  if (type && !VALID_TYPES.includes(type)) {
    throw new AppError('Tipo inválido', 400);
  }

  // Get author character (must be linked to user)
  const authorChar = db.prepare('SELECT id FROM characters WHERE user_id = ?').get(req.user.id);
  if (!authorChar) {
    throw new AppError('Você precisa ter um personagem vinculado', 400);
  }

  const id = uuidv4();
  const now = Math.floor(Date.now() / 1000);

  db.prepare(`
    INSERT INTO announcements (id, author_id, title, content, type, pinned, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, authorChar.id, title, content, type || 'general', pinned ? 1 : 0, now);

  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);

  // TODO: Send Discord notification to clan channel

  res.status(201).json({
    message: 'Comunicado criado com sucesso',
    announcement,
  });
}));

/**
 * PUT /api/announcements/:id
 * Update announcement (author or leader/officer)
 */
router.put('/:id', requireRole('leader', 'officer'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, type, pinned } = req.body;

  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);
  if (!announcement) {
    throw new AppError('Comunicado não encontrado', 404);
  }

  // Check if user is author or leader/officer
  const authorChar = db.prepare('SELECT user_id FROM characters WHERE id = ?').get(announcement.author_id);
  if (!authorChar || (req.user.role !== 'leader' && req.user.role !== 'officer' && authorChar.user_id !== req.user.id)) {
    throw new AppError('Sem permissão para editar', 403);
  }

  if (type && !VALID_TYPES.includes(type)) {
    throw new AppError('Tipo inválido', 400);
  }

  const updates = [];
  const params = [];

  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (content !== undefined) { updates.push('content = ?'); params.push(content); }
  if (type !== undefined) { updates.push('type = ?'); params.push(type); }
  if (pinned !== undefined) { updates.push('pinned = ?'); params.push(pinned ? 1 : 0); }

  if (updates.length === 0) {
    throw new AppError('Nenhum campo para atualizar', 400);
  }

  updates.push('updated_at = ?');
  params.push(Math.floor(Date.now() / 1000));
  params.push(id);

  db.prepare(`UPDATE announcements SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);

  res.json({ message: 'Comunicado atualizado com sucesso', announcement: updated });
}));

/**
 * DELETE /api/announcements/:id
 * Delete announcement (author or leader only)
 */
router.delete('/:id', requireRole('leader', 'officer'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);
  if (!announcement) {
    throw new AppError('Comunicado não encontrado', 404);
  }

  // Check if user is author or leader
  const authorChar = db.prepare('SELECT user_id FROM characters WHERE id = ?').get(announcement.author_id);
  if (!authorChar || (req.user.role !== 'leader' && authorChar.user_id !== req.user.id)) {
    throw new AppError('Sem permissão para excluir', 403);
  }

  db.prepare('DELETE FROM announcements WHERE id = ?').run(id);

  res.json({ message: 'Comunicado removido com sucesso' });
}));

export default router;