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

  const countQuery = `
    SELECT COUNT(*) as total
    FROM item_requests ir
    JOIN characters c_requester ON ir.requester_id = c_requester.id
    JOIN characters c_target ON ir.target_id = c_target.id
    ${whereClause}
  `;
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

router.get('/notifications/count', asyncHandler(async (req, res) => {
  const character = db.prepare('SELECT id FROM characters WHERE user_id = ?').get(req.user.id);
  if (!character) {
    throw new AppError('Personagem não encontrado para esta conta', 404);
  }

  const count = db.prepare(`
    SELECT COUNT(*) AS count
    FROM item_requests
    WHERE (
      request_scope = 'clan'
      AND requester_id NOT IN (SELECT id FROM characters WHERE user_id = ?)
      AND status IN ('open', 'collecting')
    ) OR (
      request_scope = 'member'
      AND target_id IN (SELECT id FROM characters WHERE user_id = ?)
      AND status IN ('open', 'collecting')
    ) OR (
      requester_id IN (SELECT id FROM characters WHERE user_id = ?)
      AND status = 'ready'
    )
  `).get(req.user.id, req.user.id, req.user.id).count;

  res.json({ count });
}));

router.get('/notifications/requests', asyncHandler(async (req, res) => {
  const { limit = 100 } = req.query;
  const parsedLimit = Number.parseInt(limit, 10);
  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    throw new AppError('Limite deve ser um número entre 1 e 100', 400);
  }

  const requests = db.prepare(`
    SELECT id, created_at
    FROM item_requests
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `).all(parsedLimit);
  const count = db.prepare('SELECT COUNT(*) AS count FROM item_requests').get().count;

  res.json({ data: requests, count });
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
    request_scope = 'member',
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
  if (
    typeof requester_id !== 'string'
    || !requester_id
    || typeof item_name !== 'string'
    || !item_name.trim()
    || typeof item_category !== 'string'
    || quantity === undefined
  ) {
    throw new AppError('Campos obrigatórios: requester_id, item_name, item_category, quantity', 400);
  }

  if (!['member', 'clan'].includes(request_scope)) {
    throw new AppError('Destino do pedido inválido', 400);
  }
  if (request_scope === 'member' && (typeof target_id !== 'string' || !target_id)) {
    throw new AppError('Escolha o jogador que receberá o pedido', 400);
  }

  if (!VALID_CATEGORIES.includes(item_category)) {
    throw new AppError('Categoria inválida', 400);
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) {
    throw new AppError('Quantidade deve ser um número inteiro entre 1 e 100000', 400);
  }

  // Check if requester exists
  const requester = db.prepare('SELECT id, user_id FROM characters WHERE id = ?').get(requester_id);
  if (!requester) {
    throw new AppError('Solicitante não encontrado', 404);
  }

  // Check if target exists
  const resolvedTargetId = request_scope === 'clan' ? requester_id : target_id;
  const target = db.prepare('SELECT id, user_id FROM characters WHERE id = ?').get(resolvedTargetId);
  if (!target) {
    throw new AppError('Jogador escolhido não encontrado', 404);
  }

  // Permission check: users can only create requests for themselves
  const isLeaderOfficer = req.user.role === 'leader' || req.user.role === 'officer';
  const isRequester = requester.user_id === req.user.id;

  if (!isLeaderOfficer && !isRequester) {
    throw new AppError('Você só pode criar pedidos para si mesmo', 403);
  }
  if (request_scope === 'member' && requester_id === resolvedTargetId) {
    throw new AppError('Escolha outro jogador para receber o pedido', 400);
  }

  const id = uuidv4();
  const now = Math.floor(Date.now() / 1000);

  db.prepare(`
    INSERT INTO item_requests (
      id, requester_id, target_id, request_scope, item_name, item_category, quantity,
      collected_quantity, purpose, hunt_source, profession_required,
      min_profession_level, status, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'open', ?, ?, ?)
  `).run(
    id, requester_id, resolvedTargetId, request_scope, item_name.trim(), item_category, quantity,
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

router.post('/:id/contributions', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError('Informe uma quantidade inteira maior que zero', 400);
  }

  const contributor = db.prepare('SELECT id FROM characters WHERE user_id = ?').get(req.user.id);
  if (!contributor) {
    throw new AppError('Personagem não encontrado para esta conta', 404);
  }

  const contribute = db.transaction(() => {
    const request = db.prepare('SELECT * FROM item_requests WHERE id = ?').get(id);
    if (!request) {
      throw new AppError('Pedido não encontrado', 404);
    }

    if (!['open', 'collecting'].includes(request.status)) {
      throw new AppError('Este pedido não está mais recebendo itens', 400);
    }
    if (request.requester_id === contributor.id) {
      throw new AppError('Você não pode contribuir para o próprio pedido', 403);
    }
    if (request.request_scope === 'member' && request.target_id !== contributor.id) {
      throw new AppError('Este pedido foi direcionado a outro jogador', 403);
    }

    const remaining = request.quantity - request.collected_quantity;
    if (quantity > remaining) {
      throw new AppError(`Você pode contribuir com no máximo ${remaining} unidade(s)`, 400);
    }

    const now = Math.floor(Date.now() / 1000);
    db.prepare(`
      INSERT INTO item_request_contributions (id, request_id, contributor_id, quantity, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), id, contributor.id, quantity, now);

    const collectedQuantity = request.collected_quantity + quantity;
    const status = collectedQuantity === request.quantity ? 'ready' : 'collecting';
    db.prepare(`
      UPDATE item_requests
      SET collected_quantity = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(collectedQuantity, status, now, id);

    return db.prepare('SELECT * FROM item_requests WHERE id = ?').get(id);
  });

  const updatedRequest = contribute();
  res.json({
    message: 'Quantidade adicionada ao pedido',
    request: updatedRequest,
    remaining: updatedRequest.quantity - updatedRequest.collected_quantity,
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
  const isTarget = request.request_scope === 'member' && targetChar?.user_id === req.user.id;

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
  if (status === 'ready' && request.collected_quantity < request.quantity) {
    throw new AppError('O pedido só fica pronto quando toda a quantidade for adicionada', 400);
  }

  if (status === 'cancelled' && !isRequester && !isTarget && !isLeaderOfficer) {
    throw new AppError('Sem permissão para cancelar', 403);
  }

  const updates = ['status = ?', 'updated_at = ?'];
  const params = [status, Math.floor(Date.now() / 1000)];

  if (collected_quantity !== undefined) {
    throw new AppError('Adicione quantidades pela ação de contribuição do pedido', 400);
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