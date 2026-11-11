import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken, JWT_SECRET } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { db } from '../utils/database.js';

const router = express.Router();

// Discord OAuth Configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const STARTER_PROFESSIONS = ['engineer', 'professor', 'stylist', 'adventurer'];

function getAccount(userId) {
  const user = db.prepare(`
    SELECT id, discord_id, username, discriminator, avatar, email, role, created_at, last_login_at
    FROM users WHERE id = ?
  `).get(userId);

  if (!user) return null;

  const character = db.prepare(`
    SELECT id, name, level, vocation, clan_type, activity_status
    FROM characters WHERE user_id = ?
  `).get(userId);

  return { ...user, character };
}

function createAuthResponse(res, user, status = 200) {
  const accessToken = generateToken({ userId: user.id, role: user.role });
  res.status(status).json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 7 * 24 * 60 * 60,
    user: getAccount(user.id),
  });
}

router.post('/register', asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const characterName = typeof req.body.character_name === 'string' ? req.body.character_name.trim() : '';
  const level = Number(req.body.level ?? 1);
  const vocation = typeof req.body.vocation === 'string' ? req.body.vocation.trim() : '';
  const clanType = typeof req.body.clan_type === 'string' ? req.body.clan_type : '';
  const validClanTypes = ['malefic', 'naturia', 'wingeon', 'seavell', 'volcanic', 'orebound', 'psycraft', 'gardsen'];
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!validEmail || password.length < 10 || characterName.length < 2 || characterName.length > 32) {
    throw new AppError('Informe e-mail válido, senha com no mínimo 10 caracteres e personagem de 2 a 32 caracteres', 400);
  }
  if (!Number.isInteger(level) || level < 1 || level > 10000) {
    throw new AppError('Level deve ser um número entre 1 e 10000', 400);
  }
  if (clanType && !validClanTypes.includes(clanType)) {
    throw new AppError('Clã inválido', 400);
  }

  if (db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email)) {
    throw new AppError('Não foi possível criar a conta com esses dados', 409);
  }
  if (db.prepare('SELECT id FROM characters WHERE name = ? COLLATE NOCASE').get(characterName)) {
    throw new AppError('Não foi possível criar a conta com esses dados', 409);
  }

  const id = uuidv4();
  const characterId = uuidv4();
  const now = Math.floor(Date.now() / 1000);
  const passwordHash = await bcrypt.hash(password, 12);
  const createAccount = db.transaction(() => {
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at, last_login_at)
      VALUES (?, ?, ?, ?, 'member', ?, ?, ?)
    `).run(id, characterName, email, passwordHash, now, now, now);
    db.prepare(`
      INSERT INTO characters (id, user_id, name, level, vocation, clan_type, activity_status, join_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'offline', ?, ?, ?)
    `).run(characterId, id, characterName, level, vocation || null, clanType || null, now, now, now);
    const insertProfession = db.prepare(`
      INSERT INTO professions (id, character_id, name, level, tier, rank, progress, experience, created_at, updated_at)
      VALUES (?, ?, ?, 0, 'E', 'Novato', 0, 0, ?, ?)
    `);
    for (const profession of STARTER_PROFESSIONS) {
      insertProfession.run(uuidv4(), characterId, profession, now, now);
    }
  });
  createAccount();

  createAuthResponse(res, { id, role: 'member' }, 201);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const user = db.prepare('SELECT id, password_hash, role FROM users WHERE email = ? COLLATE NOCASE').get(email);

  if (!user?.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('E-mail ou senha inválidos', 401);
  }

  db.prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?')
    .run(Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000), user.id);
  createAuthResponse(res, user);
}));

/**
 * GET /api/auth/discord
 * Redirect to Discord OAuth2 authorization page
 */
router.get('/discord', (req, res) => {
  if (!DISCORD_CLIENT_ID) {
    return res.status(500).json({ error: 'Discord OAuth não configurado' });
  }

  const scopes = ['identify', 'email', 'guilds.join'];
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${scopes.join('%20')}&prompt=consent`;

  res.redirect(authUrl);
});

/**
 * GET /api/auth/callback
 * Handle Discord OAuth2 callback
 */
router.get('/callback', asyncHandler(async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Get user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const discordUser = await userResponse.json();

    // Check if user exists in database
    let user = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordUser.id);

    if (!user) {
      // Create new user
      const userId = uuidv4();
      db.prepare(`
        INSERT INTO users (id, discord_id, username, discriminator, avatar, email, access_token, refresh_token, token_expires_at, role, created_at, last_login_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'member', ?, ?)
      `).run(
        userId,
        discordUser.id,
        discordUser.username,
        discordUser.discriminator || '0',
        discordUser.avatar,
        discordUser.email,
        tokenData.access_token,
        tokenData.refresh_token,
        Math.floor(Date.now() / 1000) + tokenData.expires_in,
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000)
      );

      user = { id: userId, discord_id: discordUser.id, username: discordUser.username, role: 'member' };
    } else {
      // Update existing user
      db.prepare(`
        UPDATE users SET
          username = ?,
          discriminator = ?,
          avatar = ?,
          email = ?,
          access_token = ?,
          refresh_token = ?,
          token_expires_at = ?,
          last_login_at = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        discordUser.username,
        discordUser.discriminator || '0',
        discordUser.avatar,
        discordUser.email,
        tokenData.access_token,
        tokenData.refresh_token,
        Math.floor(Date.now() / 1000) + tokenData.expires_in,
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000),
        user.id
      );
    }

    // Generate JWT
    const jwtToken = generateToken({ userId: user.id, discordId: user.discord_id, role: user.role });

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${jwtToken}`);
  } catch (error) {
    console.error('Discord OAuth error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
}));

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw new AppError('Refresh token requerido', 400);
  }

  const user = db.prepare('SELECT * FROM users WHERE refresh_token = ?').get(refresh_token);

  if (!user) {
    throw new AppError('Refresh token inválido', 401);
  }

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokenData = await tokenResponse.json();

    db.prepare(`
      UPDATE users SET
        access_token = ?,
        refresh_token = ?,
        token_expires_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      tokenData.access_token,
      tokenData.refresh_token,
      Math.floor(Date.now() / 1000) + tokenData.expires_in,
      Math.floor(Date.now() / 1000),
      user.id
    );

    const jwtToken = generateToken({ userId: user.id, discordId: user.discord_id, role: user.role });

    res.json({ access_token: jwtToken, token_type: 'Bearer', expires_in: tokenData.expires_in });
  } catch (error) {
    throw new AppError('Falha ao renovar token', 401);
  }
}));

/**
 * POST /api/auth/logout
 * Logout user (invalidate refresh token)
 */
router.post('/logout', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      db.prepare('UPDATE users SET refresh_token = NULL, updated_at = ? WHERE id = ?').run(Math.floor(Date.now() / 1000), decoded.userId);
    }
  }

  res.json({ message: 'Logout realizado com sucesso' });
}));

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Token requerido', 401);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    throw new AppError('Token inválido', 401);
  }

  const user = getAccount(decoded.userId);

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  res.json({ user });
}));

/**
 * POST /api/auth/link-character
 * Link a game character to the user account
 */
router.post('/link-character', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Token requerido', 401);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    throw new AppError('Token inválido', 401);
  }

  const { character_name, verification_code } = req.body;

  if (!character_name || !verification_code) {
    throw new AppError('Nome do personagem e código de verificação são obrigatórios', 400);
  }

  // In a real implementation, you would verify the code against an in-game system
  // For now, we'll just check if character exists and link it
  const character = db.prepare('SELECT * FROM characters WHERE name = ? AND user_id IS NULL').get(character_name);

  if (!character) {
    throw new AppError('Personagem não encontrado ou já vinculado', 404);
  }

  db.prepare('UPDATE characters SET user_id = ?, updated_at = ? WHERE id = ?').run(decoded.userId, Math.floor(Date.now() / 1000), character.id);

  res.json({ message: 'Personagem vinculado com sucesso', character: { ...character, user_id: decoded.userId } });
}));

export default router;