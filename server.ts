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
import { ensureSyscohadaAccounts, createDefaultPlatformSettings } from './server/seedData';
import authRoutes from './server/authRoutes';
import adminRoutes from './server/adminRoutes';
import { requireAuth } from './server/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');

/**
 * Politique CORS stricte de la plateforme.
 * Le frontend est servi par ce même serveur en production : les en-têtes CORS ne
 * sont donc émis que pour une origine explicitement autorisée (APP_URL / ALLOWED_ORIGINS),
 * jamais reflétés pour n'importe quel appelant.
 * Seules les méthodes GET, POST et OPTIONS sont autorisées : toute action destructrice
 * ou de mise à jour passe par un POST explicite (POST-Action), jamais par PUT/PATCH/DELETE.
 */
const ALLOWED_METHODS = ['GET', 'POST', 'OPTIONS'];
const ALLOWED_ORIGINS = [process.env.APP_URL, ...(process.env.ALLOWED_ORIGINS?.split(',') ?? [])]
  .map((o) => o?.trim())
  .filter((o): o is string => Boolean(o));
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '600');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (!ALLOWED_METHODS.includes(req.method)) {
    return res.status(405).json({ error: 'Méthode HTTP non autorisée (GET, POST ou OPTIONS uniquement).' });
  }
  next();
});

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
  const isReadMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  const isAgentQuestion = req.path.startsWith('/agent/');
  if (role === 'LECTURE_SEULE' && !isReadMethod && !isAgentQuestion) {
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

/** Message public associé à une erreur applicative (aucun détail d'implémentation exposé). */
function publicErrorMessage(err: any): { status: number; message: string } {
  switch (err?.code) {
    case 'P2025':
      return { status: 404, message: 'Ressource introuvable.' };
    case 'P2002':
      return { status: 409, message: 'Conflit : cette ressource existe déjà.' };
    case 'P2003':
      return { status: 400, message: 'Référence invalide : donnée liée manquante.' };
    case 'P2000':
      return { status: 400, message: 'Valeur trop longue pour un champ.' };
    default:
      if (typeof err?.status === 'number' && err.status >= 400 && err.status < 500 && typeof err?.publicMessage === 'string') {
        return { status: err.status, message: err.publicMessage };
      }
      return { status: 500, message: 'Erreur interne du serveur.' };
  }
}

// Central error handler for the async data routes
app.use('/api', (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[AxeCompta API]', err?.code ?? '', err?.message ?? err);
  if (res.headersSent) return next(err);
  const { status, message } = publicErrorMessage(err);
  res.status(status).json({ error: message });
});

// Vite Middleware for Dev, Static serving for Production
async function startServer() {
  // Garantit que tous les comptes du plan (ex : 5264 Moov Money) existent avant toute écriture
  try {
    await ensureSyscohadaAccounts(prisma);
  } catch (e: any) {
    console.error('[AxeCompta] Mise à jour du plan comptable impossible :', e?.message);
  }

  // Garantit la présence de la ligne de réglages par défaut (aucune donnée comptable créée)
  try {
    if ((await prisma.platformSettings.count()) === 0) {
      await createDefaultPlatformSettings(prisma);
    }
  } catch (e: any) {
    console.error('[AxeCompta] Initialisation des réglages impossible :', e?.message);
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
