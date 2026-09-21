import type { Request } from 'express';
import { prisma } from '../db';
import {
  serializeDossier,
  serializeEntry,
  serializeNotification,
  serializePlatformSettings,
} from '../mappers';
import { dossierScopeWhere, entryScopeWhere, notificationScopeWhere } from '../access';
import { DEFAULT_PLATFORM_SETTINGS } from '../../src/data/initialSettings';

/** Relations systématiquement chargées pour reconstituer une écriture complète côté client. */
export const ENTRY_INCLUDE = { auditTrail: true, debitAccount: true, creditAccount: true } as const;
/** Owner chargé pour exposer le propriétaire d'un dossier (vue cabinet administrateur). */
export const DOSSIER_INCLUDE = { owner: { select: { name: true } } } as const;

/**
 * Charges utiles de démarrage de l'application.
 * Périmètre strictement filtré sur l'utilisateur en session (un administrateur voit tout).
 */
export async function buildBootstrapPayload(req: Request) {
  const [dossierRows, entryRows, notificationRows, settingsRow] = await Promise.all([
    prisma.clientDossier.findMany({
      where: dossierScopeWhere(req) as any,
      include: DOSSIER_INCLUDE,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.journalEntry.findMany({
      where: entryScopeWhere(req) as any,
      include: ENTRY_INCLUDE,
      orderBy: { date: 'desc' },
    }),
    prisma.appNotification.findMany({
      where: notificationScopeWhere(req) as any,
      orderBy: { timestamp: 'desc' },
    }),
    prisma.platformSettings.findFirst(),
  ]);

  return {
    dossiers: dossierRows.map(serializeDossier),
    entries: entryRows.map(serializeEntry),
    notifications: notificationRows.map(serializeNotification),
    settings: settingsRow ? serializePlatformSettings(settingsRow) : DEFAULT_PLATFORM_SETTINGS,
  };
}
