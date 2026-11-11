import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateToken, verifyToken, JWT_SECRET } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../data/pxg-clan.db');
const db = new Database(dbPath);

const router = express.Router();

// Discord OAuth Configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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

  const user = db.prepare('SELECT id, discord_id, username, discriminator, avatar, email, role, created_at, last_login_at FROM users WHERE id = ?').get(decoded.userId);

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  // Get associated character
  const character = db.prepare('SELECT id, name, level, vocation, clan_type, activity_status FROM characters WHERE user_id = ?').get(user.id);

  res.json({ user: { ...user, character } });
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