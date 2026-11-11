import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { requireRole } from '../middleware/auth.js';
import { db } from '../utils/database.js';

const VALID_STATUSES = ['open', 'collecting', 'ready', 'completed', 'cancelled'];
const VALID_CATEGORIES = ['hunt-loot', 'evolution-stone', 'boss-loot', 'consumable', 'lab-component', 'quest-item', 'craft-material'];

const router = express.Router();

/**
 * GET /api/item-requests
 * List all item requests with filters
 */
router.get('/', asyncHandler(async (req, res) => {
  const { status, category, requester_id, target_id, search, limit = 50, offset = 0 } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (status && VALID_STATUSES.includes(status)) {
    whereClause += ' AND ir.status = ?';
    params.push(status);
  }

  if (category && VALID_CATEGORIES.includes(category)) {
    whereClause += ' AND ir.item_category = ?';
    params.push(category);
  }

  if (requester_id) {
    whereClause += ' AND ir.requester_id = ?';
    params.push(requester_id);
  }

  if (target_id) {
    whereClause += ' AND ir.target_id = ?';
    params.push(target_id);
  }

  if (search) {
    whereClause += ' AND (ir.item_name LIKE ? OR ir.purpose LIKE ? OR c_requester.name LIKE ? OR c_target.name LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  const query = `
    SELECT
      ir.*,
      c_requester.name as requester_name,
      c_requester.clan_type as requester_clan_type,
      c_target.name as target_name,
      c_target.clan_type as target_clan_type
    FROM item_requests ir
    JOIN characters c_requester ON ir.requester_id = c_requester.id
    JOIN characters c_target ON ir.target_id = c_target.id
    ${whereClause}
    ORDER BY
      CASE ir.status
        WHEN 'open' THEN 0
        WHEN 'collecting' THEN 1
        WHEN 'ready' THEN 2
        WHEN 'completed' THEN 3
        WHEN 'cancelled' THEN 4
      END,
      ir.created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(parseInt(limit), parseInt(offset));

  const requests = db.prepare(query).all(...params);

  const countQuery = `SELECT COUNT(*) as total FROM item_requests ir ${whereClause}`;
  const total = db.prepare(countQuery).all(...params.slice(0, -2))[0].total;

  res.json({
    data: requests,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total,
    },
  });
}));

/**
 * GET /api/item-requests/:id
 * Get single item request
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = db.prepare(`
    SELECT
      ir.*,
      c_requester.name as requester_name,
      c_requester.clan_type as requester_clan_type,
      c_requester.user_id as requester_user_id,
      c_target.name as target_name,
      c_target.clan_type as target_clan_type,
      c_target.user_id as target_user_id
    FROM item_requests ir
    JOIN characters c_requester ON ir.requester_id = c_requester.id
    JOIN characters c_target ON ir.target_id = c_target.id
    WHERE ir.id = ?
  `).get(id);

  if (!request) {
    throw new AppError('Pedido não encontrado', 404);
  }

  res.json(request);
}));

/**
 * POST /api/item-requests
 * Create new item request
 */
router.post('/', asyncHandler(async (req, res) => {
  const {
    requester_id,
    target_id,
    item_name,
    item_category,
    quantity,
    purpose,
    hunt_source,
    profession_required,
    min_profession_level,
    notes
  } = req.body;

  // Validate required fields
  if (!requester_id || !target_id || !item_name || !item_category || !quantity) {
    throw new AppError('Campos obrigatórios: requester_id, target_id, item_name, item_category, quantity', 400);
  }

  if (!VALID_CATEGORIES.includes(item_category)) {
    throw new AppError('Categoria inválida', 400);
  }

  if (quantity < 1) {
    throw new AppError('Quantidade deve ser maior que zero', 400);
  }

  // Check if requester exists
  const requester = db.prepare('SELECT id, user_id FROM characters WHERE id = ?').get(requester_id);
  if (!requester) {
    throw new AppError('Solicitante não encontrado', 404);
  }

  // Check if target exists
  const target = db.prepare('SELECT id, user_id FROM characters WHERE id = ?').get(target_id);
  if (!target) {
    throw new AppError('Alvo (coletor) não encontrado', 404);
  }

  // Permission check: users can only create requests for themselves
  const isLeaderOfficer = req.user.role === 'leader' || req.user.role === 'officer';
  const isRequester = requester.user_id === req.user.id;
  const isTarget = target.user_id === req.user.id;

  if (!isLeaderOfficer && !isRequester) {
    throw new AppError('Você só pode criar pedidos para si mesmo', 403);
  }

  const id = uuidv4();
  const now = Math.floor(Date.now() / 1000);

  db.prepare(`
    INSERT INTO item_requests (
      id, requester_id, target_id, item_name, item_category, quantity,
      collected_quantity, purpose, hunt_source, profession_required,
      min_profession_level, status, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'open', ?, ?, ?)
  `).run(
    id, requester_id, target_id, item_name, item_category, quantity,
    purpose || null, hunt_source || null, profession_required || null,
    min_profession_level || 0, notes || null, now, now
  );

  const request = db.prepare('SELECT * FROM item_requests WHERE id = ?').get(id);

  // TODO: Send notification to target (Discord webhook)

  res.status(201).json({
    message: 'Pedido criado com sucesso',
    request,
  });
}));

/**
 * PUT /api/item-requests/:id/status
 * Update request status (collector, requester, or leader/officer)
 */
router.put('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, collected_quantity, notes } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    throw new AppError('Status inválido', 400);
  }

  const request = db.prepare('SELECT * FROM item_requests WHERE id = ?').get(id);
  if (!request) {
    throw new AppError('Pedido não encontrado', 404);
  }

  // Permission check
  const requesterChar = db.prepare('SELECT user_id FROM characters WHERE id = ?').get(request.requester_id);
  const targetChar = db.prepare('SELECT user_id FROM characters WHERE id = ?').get(request.target_id);

  const isLeaderOfficer = req.user.role === 'leader' || req.user.role === 'officer';
  const isRequester = requesterChar?.user_id === req.user.id;
  const isTarget = targetChar?.user_id === req.user.id;

  // Define valid transitions
  const validTransitions = {
    open: ['collecting', 'cancelled'],
    collecting: ['ready', 'open', 'cancelled'],
    ready: ['completed', 'collecting', 'cancelled'],
    completed: [],
    cancelled: ['open'],
  };

  if (!validTransitions[request.status]?.includes(status)) {
    throw new AppError(`Transição inválida de ${request.status} para ${status}`, 400);
  }

  // Check permissions for each transition
  if (status === 'collecting' && !isTarget && !isLeaderOfficer) {
    throw new AppError('Apenas o coletor pode iniciar a coleta', 403);
  }

  if (status === 'ready' && !isTarget && !isLeaderOfficer) {
    throw new AppError('Apenas o coletor pode marcar como pronto', 403);
  }

  if (status === 'completed' && !isRequester && !isLeaderOfficer) {
    throw new AppError('Apenas o solicitante pode confirmar a entrega', 403);
  }

  if (status === 'cancelled' && !isRequester && !isTarget && !isLeaderOfficer) {
    throw new AppError('Sem permissão para cancelar', 403);
  }

  const updates = ['status = ?', 'updated_at = ?'];
  const params = [status, Math.floor(Date.now() / 1000)];

  if (collected_quantity !== undefined) {
    if (collected_quantity < 0 || collected_quantity > request.quantity) {
      throw new AppError('Quantidade coletada inválida', 400);
    }
    updates.push('collected_quantity = ?');
    params.push(collected_quantity);
  }

  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }

  if (status === 'completed') {
    updates.push('completed_at = ?');
    params.push(Math.floor(Date.now() / 1000));
  }

  params.push(id);

  db.prepare(`UPDATE item_requests SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM item_requests WHERE id = ?').get(id);

  // TODO: Send notifications based on status change

  res.json({
    message: `Status atualizado para ${status}`,
    request: updated,
  });
}));

/**
 * PUT /api/item-requests/:id
 * Update request details (requester only, while open)
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { item_name, item_category, quantity, purpose, hunt_source, profession_required, min_profession_level, notes } = req.body;

  const request = db.prepare('SELECT * FROM item_requests WHERE id = ?').get(id);
  if (!request) {
    throw new AppError('Pedido não encontrado', 404);
  }

  if (request.status !== 'open') {
    throw new AppError('Só é possível editar pedidos abertos', 400);
  }

  // Check if user is requester
  const requesterChar = db.prepare('SELECT user_id FROM characters WHERE id = ?').get(request.requester_id);
  if (!requesterChar || (req.user.role !== 'leader' && req.user.role !== 'officer' && requesterChar.user_id !== req.user.id)) {
    throw new AppError('Apenas o solicitante pode editar', 403);
  }

  if (item_category && !VALID_CATEGORIES.includes(item_category)) {
    throw new AppError('Categoria inválida', 400);
  }

  if (quantity !== undefined && quantity < 1) {
    throw new AppError('Quantidade deve ser maior que zero', 400);
  }

  const updates = [];
  const params = [];

  if (item_name !== undefined) { updates.push('item_name = ?'); params.push(item_name); }
  if (item_category !== undefined) { updates.push('item_category = ?'); params.push(item_category); }
  if (quantity !== undefined) { updates.push('quantity = ?'); params.push(quantity); }
  if (purpose !== undefined) { updates.push('purpose = ?'); params.push(purpose); }
  if (hunt_source !== undefined) { updates.push('hunt_source = ?'); params.push(hunt_source); }
  if (profession_required !== undefined) { updates.push('profession_required = ?'); params.push(profession_required); }
  if (min_profession_level !== undefined) { updates.push('min_profession_level = ?'); params.push(min_profession_level); }
  if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }

  if (updates.length === 0) {
    throw new AppError('Nenhum campo para atualizar', 400);
  }

  updates.push('updated_at = ?');
  params.push(Math.floor(Date.now() / 1000));
  params.push(id);

  db.prepare(`UPDATE item_requests SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM item_requests WHERE id = ?').get(id);

  res.json({ message: 'Pedido atualizado com sucesso', request: updated });
}));

/**
 * DELETE /api/item-requests/:id
 * Delete request (requester or leader only)
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = db.prepare('SELECT * FROM item_requests WHERE id = ?').get(id);
  if (!request) {
    throw new AppError('Pedido não encontrado', 404);
  }

  // Check permission
  const requesterChar = db.prepare('SELECT user_id FROM characters WHERE id = ?').get(request.requester_id);
  const isLeaderOfficer = req.user.role === 'leader' || req.user.role === 'officer';
  const isRequester = requesterChar?.user_id === req.user.id;

  if (!isLeaderOfficer && !isRequester) {
    throw new AppError('Sem permissão para excluir', 403);
  }

  db.prepare('DELETE FROM item_requests WHERE id = ?').run(id);

  res.json({ message: 'Pedido removido com sucesso' });
}));

/**
 * GET /api/item-requests/stats/summary
 * Get summary statistics
 */
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const stats = db.prepare(`
    SELECT
      status,
      COUNT(*) as count
    FROM item_requests
    GROUP BY status
  `).all();

  const totalRequests = db.prepare('SELECT COUNT(*) as total FROM item_requests').get().total;
  const totalQuantity = db.prepare('SELECT SUM(quantity) as total FROM item_requests').get().total || 0;
  const totalCollected = db.prepare('SELECT SUM(collected_quantity) as total FROM item_requests').get().total || 0;

  res.json({
    byStatus: stats.reduce((acc, s) => { acc[s.status] = s.count; return acc; }, {}),
    totalRequests,
    totalQuantity,
    totalCollected,
    completionRate: totalQuantity > 0 ? (totalCollected / totalQuantity * 100).toFixed(1) : 0,
  });
}));

export default router;