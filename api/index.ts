// Point d'entrée serverless Vercel pour l'API AxeCompta.
//
// Vercel détecte automatiquement ce fichier et le déploie comme fonction Node.js
// (aucun app.listen() : Vercel appelle directement l'export par défaut à chaque
// requête). Les fichiers statiques (dist/) sont servis séparément par le CDN
// Vercel — voir vercel.json, qui redirige uniquement /api/* vers cette fonction.
import type { IncomingMessage, ServerResponse } from 'http';
import { app, ensureSeeded } from '../server/app';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureSeeded();
  app(req as any, res as any);
}
