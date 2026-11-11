import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

import characterRoutes from './routes/characters.js';
import professionRoutes from './routes/professions.js';
import pokemonLoanRoutes from './routes/pokemonLoans.js';
import itemRequestRoutes from './routes/itemRequests.js';
import announcementRoutes from './routes/announcements.js';
import clanRoutes from './routes/clan.js';
import authRoutes from './routes/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authenticateToken, optionalAuth } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const allowedFrontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

if (allowedFrontendOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
  allowedFrontendOrigins.push('http://localhost:3000');
}
if (allowedFrontendOrigins.length === 0) {
  console.warn('FRONTEND_URL não configurada; chamadas cross-origin do frontend serão bloqueadas pelo CORS.');
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || allowedFrontendOrigins.includes(origin));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', optionalAuth, characterRoutes);
app.use('/api/professions', authenticateToken, professionRoutes);
app.use('/api/pokemon-loans', authenticateToken, pokemonLoanRoutes);
app.use('/api/item-requests', authenticateToken, itemRequestRoutes);
app.use('/api/announcements', optionalAuth, announcementRoutes);
app.use('/api/clan', optionalAuth, clanRoutes);

const frontendDist = resolve(__dirname, '../../frontend/dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(join(frontendDist, 'index.html'));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 PXG Clan Backend running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;