import { Router } from 'express';
import { prisma } from '../db';
import { serializeEntry } from '../mappers';
import { findAccessibleDossier, findAccessibleEntry } from '../access';
import { handler } from '../http';
import { validateEntryInput, identifier, EntryInput, unwrap } from '../validation';
import { ENTRY_INCLUDE } from './bootstrap';

const router = Router();

/** Vérifie que tous les comptes SYSCOHADA référencés existent (évite une erreur de clé étrangère). */
async function assertAccountsExist(codes: string[]): Promise<string | null> {
  const unique = [...new Set(codes)];
  const found = await prisma.syscohadaAccount.findMany({ where: { code: { in: unique } }, select: { code: true } });
  const known = new Set(found.map(f => f.code));
  const missing = unique.filter(c => !known.has(c));
  return missing.length ? `Compte SYSCOHADA inconnu : ${missing.join(', ')}.` : null;
}

function entryCreateData(e: EntryInput, dossierId: string) {
  return {
    id: e.id,
    date: new Date(e.date),
    label: e.label,
    pieceRef: e.pieceRef,
    debitAccountCode: e.debitAccountCode,
    creditAccountCode: e.creditAccountCode,
    amount: e.amount,
    tvaAmount: e.tvaAmount,
    clientDossierId: dossierId,
    status: e.status as any,
    confidenceScore: e.confidenceScore,
    detectedAnomaly: e.detectedAnomaly,
    rawInput: e.rawInput,
    inputType: e.inputType as any,
    explanationSimplified: e.explanationSimplified,
    paymentMethod: e.paymentMethod as any,
    auditTrail: {
      create: e.auditTrail.map(a => ({
        id: a.id,
        timestamp: new Date(a.timestamp),
        action: a.action as any,
        author: a.author,
        notes: a.notes,
        previousValue: a.previousValue,
        confidenceScore: a.confidenceScore,
      })),
    },
  };
}

/** Création d'une écriture rattachée à un dossier accessible au requérant. */
router.post('/entries', handler(async (req, res) => {
  const dossierId = identifier((req.body ?? {}).clientDossierId);
  if (!dossierId) return res.status(400).json({ error: 'Dossier comptable invalide.' });
  const dossier = await findAccessibleDossier(req, dossierId);
  if (!dossier) return res.status(404).json({ error: 'Dossier introuvable.' });

  const e = unwrap(validateEntryInput(req.body));

  const accountError = await assertAccountsExist([e.debitAccountCode, e.creditAccountCode]);
  if (accountError) return res.status(400).json({ error: accountError });

  const created = await prisma.journalEntry.create({ data: entryCreateData(e, dossierId), include: ENTRY_INCLUDE });
  res.status(201).json(serializeEntry(created));
}));

/** Import (Excel ou lot) : chaque écriture est validée et rattachée à un dossier accessible. */
router.post('/entries/import', handler(async (req, res) => {
  const list = Array.isArray((req.body ?? {}).entries) ? (req.body.entries as unknown[]) : [];
  if (list.length === 0) return res.status(400).json({ error: 'Aucune écriture à importer.' });
  if (list.length > 5000) return res.status(400).json({ error: 'Import limité à 5000 écritures par opération.' });

  const created = [];
  for (const raw of list) {
    const dossierId = identifier((raw as any)?.clientDossierId);
    if (!dossierId) return res.status(400).json({ error: 'Une écriture importée référence un dossier invalide.' });
    const dossier = await findAccessibleDossier(req, dossierId);
    if (!dossier) return res.status(403).json({ error: 'Import refusé : dossier hors de votre périmètre.' });

    const e = unwrap(validateEntryInput(raw, { requireId: true }));

    const accountError = await assertAccountsExist([e.debitAccountCode, e.creditAccountCode]);
    if (accountError) return res.status(400).json({ error: accountError });

    const row = await prisma.journalEntry.create({ data: entryCreateData(e, dossierId), include: ENTRY_INCLUDE });
    created.push(serializeEntry(row));
  }
  res.status(201).json(created);
}));

/** Mise à jour d'une écriture : POST /entries/:id/update. La piste d'audit ne s'efface jamais. */
router.post('/entries/:id/update', handler(async (req, res) => {
  const id = identifier(req.params.id);
  if (!id) return res.status(400).json({ error: 'Identifiant d\'écriture invalide.' });
  const existing = await findAccessibleEntry(req, id);
  if (!existing) return res.status(404).json({ error: 'Écriture introuvable.' });

  const e = unwrap(validateEntryInput(req.body));

  const accountError = await assertAccountsExist([e.debitAccountCode, e.creditAccountCode]);
  if (accountError) return res.status(400).json({ error: accountError });

  await prisma.journalEntry.update({
    where: { id: id },
    data: {
      date: new Date(e.date),
      label: e.label,
      pieceRef: e.pieceRef,
      debitAccountCode: e.debitAccountCode,
      creditAccountCode: e.creditAccountCode,
      amount: e.amount,
      tvaAmount: e.tvaAmount,
      status: e.status as any,
      confidenceScore: e.confidenceScore,
      detectedAnomaly: e.detectedAnomaly,
      rawInput: e.rawInput,
      inputType: e.inputType as any,
      explanationSimplified: e.explanationSimplified,
      paymentMethod: e.paymentMethod as any,
    },
  });

  for (const a of e.auditTrail) {
    await prisma.auditLog.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        journalEntryId: id,
        timestamp: new Date(a.timestamp),
        action: a.action as any,
        author: a.author,
        notes: a.notes,
        previousValue: a.previousValue,
        confidenceScore: a.confidenceScore,
      },
    });
  }

  const fresh = await prisma.journalEntry.findUniqueOrThrow({ where: { id: id }, include: ENTRY_INCLUDE });
  res.json(serializeEntry(fresh));
}));

/** Validation en lot : seules les écritures accessibles au requérant sont traitées. */
router.post('/entries/batch-validate', handler(async (req, res) => {
  const rawIds = Array.isArray((req.body ?? {}).ids) ? (req.body.ids as unknown[]) : [];
  const ids = rawIds.map(identifier).filter((v): v is string => Boolean(v));
  if (ids.length === 0) return res.status(400).json({ error: 'Aucune écriture à valider.' });

  const allowed: string[] = [];
  for (const id of ids) {
    const entry = await findAccessibleEntry(req, id);
    if (entry) allowed.push(id);
  }
  if (allowed.length === 0) return res.status(404).json({ error: 'Aucune écriture accessible à valider.' });

  for (const id of allowed) {
    await prisma.journalEntry.update({
      where: { id: id },
      data: {
        status: 'validated',
        detectedAnomaly: null,
        auditTrail: {
          create: {
            id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            action: 'validated_by_expert',
            author: 'Expert-comptable (superviseur)',
            notes: "Validation en lot par l'expert-comptable.",
          },
        },
      },
    });
  }

  const rows = await prisma.journalEntry.findMany({ where: { id: { in: allowed } }, include: ENTRY_INCLUDE });
  res.json(rows.map(serializeEntry));
}));

export default router;
