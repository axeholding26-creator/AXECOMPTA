// Point d'entrée serverless Vercel pour l'API AxeCompta.
//
// Vercel détecte automatiquement ce fichier et le déploie comme fonction Node.js
// (aucun app.listen() : Vercel appelle directement l'export par défaut à chaque
// requête). Les fichiers statiques (dist/) sont servis séparément par le CDN
// Vercel — voir vercel.json, qui redirige uniquement /api/* vers cette fonction.
import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Import dynamique : si un module plante à l'initialisation (ex: variable
    // d'environnement manquante), on le rattrape ici au lieu de laisser Vercel
    // crasher toute la fonction sans détail (FUNCTION_INVOCATION_FAILED).
    const { app, ensureSeeded } = await import('../server/app');
    await ensureSeeded();
    app(req as any, res as any);
  } catch (e: any) {
    console.error('[AxeCompta] Échec critique au démarrage de la fonction :', e);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    // TEMPORAIRE (diagnostic de déploiement) : message d'erreur exposé pour
    // débloquer le déploiement initial. À retirer une fois l'API stabilisée.
    res.end(JSON.stringify({ error: 'Erreur de démarrage', detail: e?.message ?? String(e) }));
  }
}
