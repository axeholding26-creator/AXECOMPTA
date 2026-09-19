import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from './db';
import {
  serializeDossier,
  serializeEntry,
  serializeNotification,
  serializePlatformSettings,
  REGIME_FISCAL_TO_DB,
  AI_MODEL_TO_DB,
} from './mappers';
import { resetToDemoData, createDefaultPlatformSettings } from './seedData';

const router = Router();

const ENTRY_INCLUDE = { auditTrail: true, debitAccount: true, creditAccount: true } as const;

function asyncHandler(fn: (req: Request, res: Response) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

async function getBootstrapPayload() {
  const [dossierRows, entryRows, notificationRows, settingsRow] = await Promise.all([
    prisma.clientDossier.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.journalEntry.findMany({ include: ENTRY_INCLUDE, orderBy: { date: 'desc' } }),
    prisma.appNotification.findMany({ orderBy: { timestamp: 'desc' } }),
    prisma.platformSettings.findFirst(),
  ]);

  return {
    dossiers: dossierRows.map(serializeDossier),
    entries: entryRows.map(serializeEntry),
    notifications: notificationRows.map(serializeNotification),
    settings: settingsRow ? serializePlatformSettings(settingsRow) : null,
  };
}

// ---------- Bootstrap ----------

router.get('/bootstrap', asyncHandler(async (_req, res) => {
  res.json(await getBootstrapPayload());
}));

// ---------- Dossiers ----------

router.post('/dossiers', asyncHandler(async (req, res) => {
  const d = req.body;
  const created = await prisma.clientDossier.create({
    data: {
      name: d.name,
      managerName: d.managerName,
      phone: d.phone,
      activity: d.activity,
      city: d.city,
      country: d.country,
      rccm: d.rccm,
      ifu: d.ifu,
      regimeFiscal: REGIME_FISCAL_TO_DB[d.regimeFiscal] as any,
      confidenceThreshold: d.confidenceThreshold ?? 85,
      currency: d.currency,
    },
  });
  res.status(201).json(serializeDossier(created));
}));

router.put('/dossiers/:id', asyncHandler(async (req, res) => {
  const d = req.body;
  const updated = await prisma.clientDossier.update({
    where: { id: req.params.id },
    data: {
      name: d.name,
      managerName: d.managerName,
      phone: d.phone,
      activity: d.activity,
      city: d.city,
      country: d.country,
      rccm: d.rccm,
      ifu: d.ifu,
      regimeFiscal: REGIME_FISCAL_TO_DB[d.regimeFiscal] as any,
      confidenceThreshold: d.confidenceThreshold,
      currency: d.currency,
    },
  });
  res.json(serializeDossier(updated));
}));

router.delete('/dossiers/:id', asyncHandler(async (req, res) => {
  await prisma.clientDossier.delete({ where: { id: req.params.id } });
  res.status(204).end();
}));

// ---------- Journal Entries ----------

router.post('/entries', asyncHandler(async (req, res) => {
  const e = req.body;
  const created = await prisma.journalEntry.create({
    data: {
      id: e.id,
      date: new Date(e.date),
      label: e.label,
      pieceRef: e.pieceRef,
      debitAccountCode: e.debitAccountCode,
      creditAccountCode: e.creditAccountCode,
      amount: e.amount,
      tvaAmount: e.tvaAmount,
      clientDossierId: e.clientDossierId,
      status: e.status,
      confidenceScore: e.confidenceScore,
      detectedAnomaly: e.detectedAnomaly,
      rawInput: e.rawInput,
      inputType: e.inputType,
      explanationSimplified: e.explanationSimplified,
      paymentMethod: e.paymentMethod,
      auditTrail: {
        create: (e.auditTrail ?? []).map((a: any) => ({
          id: a.id,
          timestamp: new Date(a.timestamp),
          action: a.action,
          author: a.author,
          notes: a.notes,
          previousValue: a.previousValue,
          confidenceScore: a.confidenceScore,
        })),
      },
    },
    include: ENTRY_INCLUDE,
  });
  res.status(201).json(serializeEntry(created));
}));

router.post('/entries/import', asyncHandler(async (req, res) => {
  const entries: any[] = req.body.entries ?? [];
  const created = [];
  for (const e of entries) {
    const row = await prisma.journalEntry.create({
      data: {
        id: e.id,
        date: new Date(e.date),
        label: e.label,
        pieceRef: e.pieceRef,
        debitAccountCode: e.debitAccountCode,
        creditAccountCode: e.creditAccountCode,
        amount: e.amount,
        tvaAmount: e.tvaAmount,
        clientDossierId: e.clientDossierId,
        status: e.status,
        confidenceScore: e.confidenceScore,
        detectedAnomaly: e.detectedAnomaly,
        rawInput: e.rawInput,
        inputType: e.inputType,
        explanationSimplified: e.explanationSimplified,
        paymentMethod: e.paymentMethod,
        auditTrail: {
          create: (e.auditTrail ?? []).map((a: any) => ({
            id: a.id,
            timestamp: new Date(a.timestamp),
            action: a.action,
            author: a.author,
            notes: a.notes,
            previousValue: a.previousValue,
            confidenceScore: a.confidenceScore,
          })),
        },
      },
      include: ENTRY_INCLUDE,
    });
    created.push(serializeEntry(row));
  }
  res.status(201).json(created);
}));

router.put('/entries/:id', asyncHandler(async (req, res) => {
  const e = req.body;
  await prisma.journalEntry.update({
    where: { id: req.params.id },
    data: {
      date: new Date(e.date),
      label: e.label,
      pieceRef: e.pieceRef,
      debitAccountCode: e.debitAccountCode,
      creditAccountCode: e.creditAccountCode,
      amount: e.amount,
      tvaAmount: e.tvaAmount,
      status: e.status,
      confidenceScore: e.confidenceScore,
      detectedAnomaly: e.detectedAnomaly,
      rawInput: e.rawInput,
      inputType: e.inputType,
      explanationSimplified: e.explanationSimplified,
      paymentMethod: e.paymentMethod,
    },
  });

  // La piste d'audit ne s'efface jamais : on ajoute les entrées inédites, jamais on ne les retire.
  for (const a of e.auditTrail ?? []) {
    await prisma.auditLog.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        journalEntryId: req.params.id,
        timestamp: new Date(a.timestamp),
        action: a.action,
        author: a.author,
        notes: a.notes,
        previousValue: a.previousValue,
        confidenceScore: a.confidenceScore,
      },
    });
  }

  const fresh = await prisma.journalEntry.findUniqueOrThrow({
    where: { id: req.params.id },
    include: ENTRY_INCLUDE,
  });
  res.json(serializeEntry(fresh));
}));

router.post('/entries/batch-validate', asyncHandler(async (req, res) => {
  const ids: string[] = req.body.ids ?? [];

  for (const id of ids) {
    await prisma.journalEntry.update({
      where: { id },
      data: {
        status: 'validated',
        detectedAnomaly: null,
        auditTrail: {
          create: {
            id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            action: 'validated_by_expert',
            author: 'Cabinet KM Consulting (Superviseur)',
            notes: "Validation en lot par l'expert-comptable.",
          },
        },
      },
    });
  }

  const rows = await prisma.journalEntry.findMany({
    where: { id: { in: ids } },
    include: ENTRY_INCLUDE,
  });
  res.json(rows.map(serializeEntry));
}));

// ---------- Notifications ----------

router.post('/notifications', asyncHandler(async (req, res) => {
  const n = req.body;
  const created = await prisma.appNotification.create({
    data: {
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      category: n.category,
      read: n.read ?? false,
      dossierId: n.dossierId,
      actionLabel: n.actionLabel,
      actionMode: n.actionPayload?.mode,
      actionExpertTab: n.actionPayload?.expertTab,
    },
  });
  res.status(201).json(serializeNotification(created));
}));

router.patch('/notifications/read-all', asyncHandler(async (_req, res) => {
  await prisma.appNotification.updateMany({ data: { read: true } });
  res.status(204).end();
}));

router.patch('/notifications/:id/read', asyncHandler(async (req, res) => {
  const updated = await prisma.appNotification.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  res.json(serializeNotification(updated));
}));

router.delete('/notifications/:id', asyncHandler(async (req, res) => {
  await prisma.appNotification.delete({ where: { id: req.params.id } });
  res.status(204).end();
}));

router.delete('/notifications', asyncHandler(async (_req, res) => {
  await prisma.appNotification.deleteMany();
  res.status(204).end();
}));

// ---------- Platform Settings ----------

router.get('/settings', asyncHandler(async (_req, res) => {
  const row = (await prisma.platformSettings.findFirst()) ?? (await createDefaultPlatformSettings(prisma));
  res.json(serializePlatformSettings(row));
}));

router.put('/settings', asyncHandler(async (req, res) => {
  const s = req.body;
  const existing = await prisma.platformSettings.findFirst();
  const data = {
    syscohadaVersion: s.syscohadaVersion,
    cashDeductibilityThreshold: s.cashDeductibilityThreshold,
    defaultVatRate: s.defaultVatRate,
    autoFlagLargeCashPayments: s.autoFlagLargeCashPayments,
    defaultDebitCashAccount: s.defaultDebitCashAccount,
    defaultCreditSalesAccount: s.defaultCreditSalesAccount,
    defaultDebitExpenseAccount: s.defaultDebitExpenseAccount,
    globalConfidenceThreshold: s.globalConfidenceThreshold,
    autoValidateHighConfidence: s.autoValidateHighConfidence,
    duplicateDetection: s.duplicateDetection,
    aiModelPreference: AI_MODEL_TO_DB[s.aiModelPreference] as any,
    defaultStartupView: s.defaultStartupView,
    numberFormatting: s.numberFormatting,
    cabinetName: s.cabinetName,
    expertLicenseNumber: s.expertLicenseNumber,
    soundEnabled: s.soundEnabled,
    soundType: s.soundType,
    soundVolume: s.soundVolume,
    notifyOnAnomaly: s.notifyOnAnomaly,
    notifyOnTaxDeadline: s.notifyOnTaxDeadline,
    notifyOnMobileMoneySync: s.notifyOnMobileMoneySync,
  };
  const saved = existing
    ? await prisma.platformSettings.update({ where: { id: existing.id }, data })
    : await prisma.platformSettings.create({ data });
  res.json(serializePlatformSettings(saved));
}));

// ---------- Reset & Backup ----------

router.post('/reset', asyncHandler(async (_req, res) => {
  await resetToDemoData(prisma);
  res.json(await getBootstrapPayload());
}));

router.post('/import-backup', asyncHandler(async (req, res) => {
  const { settings, dossiers, entries } = req.body as {
    settings?: any;
    dossiers?: any[];
    entries?: any[];
  };

  if (dossiers && dossiers.length > 0) {
    await prisma.appNotification.deleteMany();
    await prisma.journalEntry.deleteMany();
    await prisma.clientDossier.deleteMany();

    for (const d of dossiers) {
      await prisma.clientDossier.create({
        data: {
          id: d.id,
          name: d.name,
          managerName: d.managerName,
          phone: d.phone,
          activity: d.activity,
          city: d.city,
          country: d.country,
          rccm: d.rccm,
          ifu: d.ifu,
          regimeFiscal: REGIME_FISCAL_TO_DB[d.regimeFiscal] as any,
          confidenceThreshold: d.confidenceThreshold ?? 85,
          currency: d.currency,
        },
      });
    }
  }

  if (entries) {
    for (const e of entries) {
      await prisma.journalEntry.upsert({
        where: { id: e.id },
        update: {},
        create: {
          id: e.id,
          date: new Date(e.date),
          label: e.label,
          pieceRef: e.pieceRef,
          debitAccountCode: e.debitAccountCode,
          creditAccountCode: e.creditAccountCode,
          amount: e.amount,
          tvaAmount: e.tvaAmount,
          clientDossierId: e.clientDossierId,
          status: e.status,
          confidenceScore: e.confidenceScore,
          detectedAnomaly: e.detectedAnomaly,
          rawInput: e.rawInput,
          inputType: e.inputType,
          explanationSimplified: e.explanationSimplified,
          paymentMethod: e.paymentMethod,
          auditTrail: {
            create: (e.auditTrail ?? []).map((a: any) => ({
              id: a.id,
              timestamp: new Date(a.timestamp),
              action: a.action,
              author: a.author,
              notes: a.notes,
              previousValue: a.previousValue,
              confidenceScore: a.confidenceScore,
            })),
          },
        },
      });
    }
  }

  if (settings) {
    const existing = await prisma.platformSettings.findFirst();
    const data = {
      syscohadaVersion: settings.syscohadaVersion,
      cashDeductibilityThreshold: settings.cashDeductibilityThreshold,
      defaultVatRate: settings.defaultVatRate,
      autoFlagLargeCashPayments: settings.autoFlagLargeCashPayments,
      defaultDebitCashAccount: settings.defaultDebitCashAccount,
      defaultCreditSalesAccount: settings.defaultCreditSalesAccount,
      defaultDebitExpenseAccount: settings.defaultDebitExpenseAccount,
      globalConfidenceThreshold: settings.globalConfidenceThreshold,
      autoValidateHighConfidence: settings.autoValidateHighConfidence,
      duplicateDetection: settings.duplicateDetection,
      aiModelPreference: AI_MODEL_TO_DB[settings.aiModelPreference] as any,
      defaultStartupView: settings.defaultStartupView,
      numberFormatting: settings.numberFormatting,
      cabinetName: settings.cabinetName,
      expertLicenseNumber: settings.expertLicenseNumber,
      soundEnabled: settings.soundEnabled,
      soundType: settings.soundType,
      soundVolume: settings.soundVolume,
      notifyOnAnomaly: settings.notifyOnAnomaly,
      notifyOnTaxDeadline: settings.notifyOnTaxDeadline,
      notifyOnMobileMoneySync: settings.notifyOnMobileMoneySync,
    };
    if (existing) {
      await prisma.platformSettings.update({ where: { id: existing.id }, data });
    } else {
      await prisma.platformSettings.create({ data });
    }
  }

  res.json(await getBootstrapPayload());
}));

export default router;
