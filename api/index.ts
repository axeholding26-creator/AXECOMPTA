// Point d'entrée serverless Vercel pour l'API AxeCompta.
//
// Vercel détecte automatiquement ce fichier et le déploie comme fonction Node.js
// (aucun app.listen() : Vercel appelle directement l'export par défaut à chaque
// requête). Les fichiers statiques (dist/) sont servis séparément par le CDN
// Vercel — voir vercel.json, qui redirige uniquement /api/* vers cette fonction.
//
// Import STATIQUE (et non dynamique) : c'est nécessaire pour que le bundler de
// Vercel embarque correctement server/app.ts dans le paquet de la fonction.
// Un `await import(...)` dynamique est traité comme un point de code-splitting
// et le fichier importé n'est alors pas inclus dans le déploiement, ce qui
// provoque un "Cannot find module" au runtime.
import type { IncomingMessage, ServerResponse } from 'http';
import { app, ensureSeeded } from '../server/app';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureSeeded();
    app(req as any, res as any);
  } catch (e: any) {
    console.error('[AxeCompta] Erreur non interceptée dans la fonction serverless :', e);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ error: 'Erreur interne du serveur.' }));
    }
  }
}
