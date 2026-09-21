import type { Request } from 'express';
import { prisma } from './db';
import { getAuthUser } from './auth';

/**
 * Règles de cloisonnement des données AxeCompta.
 *
 * - Un utilisateur classique ne voit et ne modifie que les dossiers qu'il a créés,
 *   ainsi que les écritures et notifications rattachées à ces dossiers.
 * - Un administrateur voit l'ensemble des dossiers (regroupés par propriétaire) afin
 *   de superviser la plateforme.
 *
 * Toute autorisation est évaluée côté serveur à partir de la session, jamais d'un
 * identifiant transmis par le client.
 */

export function isAdminRequest(req: Request): boolean {
  return getAuthUser(req)?.role === 'ADMIN';
}

/** Drapeau `where` Prisma restreignant la lecture aux dossiers visibles par le requérant. */
export function dossierScopeWhere(req: Request): Record<string, unknown> {
  const user = getAuthUser(req);
  if (!user) return { ownerId: '__aucun__' }; // jamais satisfait : requête non authentifiée
  return user.role === 'ADMIN' ? {} : { ownerId: user.sub };
}

/** Drapeau `where` pour les écritures visibles (rattachées à un dossier accessible). */
export function entryScopeWhere(req: Request): Record<string, unknown> {
  const user = getAuthUser(req);
  if (!user) return { clientDossier: { ownerId: '__aucun__' } };
  return user.role === 'ADMIN' ? {} : { clientDossier: { ownerId: user.sub } };
}

/** Drapeau `where` pour les notifications visibles. */
export function notificationScopeWhere(req: Request): Record<string, unknown> {
  const user = getAuthUser(req);
  if (!user) return { dossier: { ownerId: '__aucun__' } };
  return user.role === 'ADMIN' ? {} : { dossier: { ownerId: user.sub } };
}

/**
 * Charge un dossier uniquement s'il est accessible au requérant.
 * Retourne null si le dossier est inexistant ou hors périmètre (réponse 404 côté routeur).
 */
export async function findAccessibleDossier(req: Request, dossierId: string) {
  const user = getAuthUser(req);
  if (!user) return null;
  const dossier = await prisma.clientDossier.findUnique({ where: { id: dossierId } });
  if (!dossier) return null;
  if (user.role !== 'ADMIN' && dossier.ownerId !== user.sub) return null;
  return dossier;
}

/** Vérifie qu'une écriture est accessible, et la retourne avec son dossier. */
export async function findAccessibleEntry(req: Request, entryId: string) {
  const user = getAuthUser(req);
  if (!user) return null;
  const entry = await prisma.journalEntry.findUnique({ where: { id: entryId } });
  if (!entry) return null;
  if (user.role !== 'ADMIN') {
    const dossier = await prisma.clientDossier.findUnique({ where: { id: entry.clientDossierId } });
    if (!dossier || dossier.ownerId !== user.sub) return null;
  }
  return entry;
}
