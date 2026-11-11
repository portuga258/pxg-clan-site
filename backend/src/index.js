import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import characterRoutes from './routes/characters.js';
import professionRoutes from './routes/professions.js';
import pokemonLoanRoutes from './routes/pokemonLoans.js';
import itemRequestRoutes from './routes/itemRequests.js';
import announcementRoutes from './routes/announcements.js';
import clanRoutes from './routes/clan.js';
import authRoutes from './routes/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authenticateToken, optionalAuth } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
app.use('/api/characters', authenticateToken, characterRoutes);
app.use('/api/professions', authenticateToken, professionRoutes);
app.use('/api/pokemon-loans', authenticateToken, pokemonLoanRoutes);
app.use('/api/item-requests', authenticateToken, itemRequestRoutes);
app.use('/api/announcements', optionalAuth, announcementRoutes);
app.use('/api/clan', optionalAuth, clanRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 PXG Clan Backend running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;