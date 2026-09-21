// Source du point d'entrée serverless Vercel pour l'API AxeCompta.
//
// Ce fichier n'est jamais déployé tel quel : le build (voir vercel.json)
// le bundle avec esbuild vers api/index.js (un unique fichier JS autonome,
// dépendances locales inlinées, packages npm externalisés). On évite ainsi de
// dépendre du bundler interne de Vercel, qui ne parvenait pas à résoudre les
// imports locaux (`Cannot find module '/var/task/server/app'`) — que ce soit
// via un import statique ou dynamique, avec ou sans `functions.includeFiles`.
// Le même principe est déjà utilisé pour l'hébergement Node classique
// (server.ts → dist/server.cjs).
import type { IncomingMessage, ServerResponse } from 'http';
import { app, ensureSeeded } from './app';

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
