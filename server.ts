// Doit rester le tout premier import : les imports ES sont hissés et évalués dans
// l'ordre d'écriture, donc .env doit être chargé avant que d'autres modules
// (server/auth.ts, etc.) ne lisent process.env à leur propre chargement.
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dataRoutes from './server/routes';
import agentRoutes from './server/agentRoutes';
import { prisma } from './server/db';
import { ensureSyscohadaAccounts } from './server/seedData';
import authRoutes from './server/authRoutes';
import adminRoutes from './server/adminRoutes';
import { requireAuth } from './server/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Auth routes (signup / login / logout / session courante) — publiques
app.use('/api/auth', authRoutes);

// Health Check — public
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    product: 'AxeCompta',
    edition: 'SYSCOHADA Révisé 2026',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Tout ce qui suit nécessite une session valide
app.use('/api', requireAuth);

// Profil "lecture seule" : consultation uniquement (les questions à l'agent restent permises)
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).user?.role;
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  const isAgentQuestion = req.path.startsWith('/agent/');
  if (role === 'LECTURE_SEULE' && isMutation && !isAgentQuestion) {
    return res.status(403).json({ error: 'Votre profil est en lecture seule : modification impossible.' });
  }
  next();
});

// Agent IA : saisie en langage naturel, photos/PDF, SMS Mobile Money, questions, résumés de dossier
app.use('/api/agent', agentRoutes);

// Database-backed CRUD routes (dossiers, écritures, notifications, paramètres)
app.use('/api', dataRoutes);

// Gestion des utilisateurs & rôles — réservé aux administrateurs
app.use('/api/admin', adminRoutes);

// Central error handler for the async data routes
app.use('/api', (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[AxeCompta API]', err);
  if (res.headersSent) return next(err);
  const status = err?.code === 'P2025' ? 404 : 500;
  res.status(status).json({ error: err?.message || 'Erreur interne du serveur' });
});

// Vite Middleware for Dev, Static serving for Production
async function startServer() {
  // Garantit que tous les comptes du plan (ex : 5264 Moov Money) existent avant toute écriture
  try {
    await ensureSyscohadaAccounts(prisma);
  } catch (e: any) {
    console.error('[AxeCompta] Mise à jour du plan comptable impossible :', e?.message);
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AxeCompta] Serveur actif sur http://0.0.0.0:${PORT} (Mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
