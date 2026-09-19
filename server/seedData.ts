import type { PrismaClient } from '@prisma/client';
import { SYSCOHADA_ACCOUNTS } from '../src/data/syscohadaPlan';
import { INITIAL_CLIENT_DOSSIERS, INITIAL_JOURNAL_ENTRIES } from '../src/data/mockData';
import { INITIAL_NOTIFICATIONS } from '../src/data/initialNotifications';
import { DEFAULT_PLATFORM_SETTINGS } from '../src/data/initialSettings';
import { REGIME_FISCAL_TO_DB, AI_MODEL_TO_DB } from './mappers';

export async function ensureSyscohadaAccounts(prisma: PrismaClient) {
  for (const acc of SYSCOHADA_ACCOUNTS) {
    await prisma.syscohadaAccount.upsert({
      where: { code: acc.code },
      update: { label: acc.label, classNumber: acc.classNumber, category: acc.category as any },
      create: { code: acc.code, label: acc.label, classNumber: acc.classNumber, category: acc.category as any },
    });
  }
}

export async function createDemoDossiers(prisma: PrismaClient) {
  for (const d of INITIAL_CLIENT_DOSSIERS) {
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
        confidenceThreshold: d.confidenceThreshold,
        currency: d.currency,
      },
    });
  }
}

export async function createDemoEntries(prisma: PrismaClient) {
  for (const e of INITIAL_JOURNAL_ENTRIES) {
    await prisma.journalEntry.create({
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
        status: e.status as any,
        confidenceScore: e.confidenceScore,
        detectedAnomaly: e.detectedAnomaly,
        rawInput: e.rawInput,
        inputType: e.inputType as any,
        explanationSimplified: e.explanationSimplified,
        paymentMethod: e.paymentMethod as any,
        auditTrail: {
          create: e.auditTrail.map((a) => ({
            id: a.id,
            timestamp: new Date(a.timestamp),
            action: a.action as any,
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

export async function createDemoNotifications(prisma: PrismaClient) {
  for (const n of INITIAL_NOTIFICATIONS) {
    await prisma.appNotification.create({
      data: {
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type as any,
        category: n.category as any,
        read: n.read,
        dossierId: n.dossierId,
        actionLabel: n.actionLabel,
        actionMode: n.actionPayload?.mode as any,
        actionExpertTab: n.actionPayload?.expertTab,
      },
    });
  }
}

export async function createDefaultPlatformSettings(prisma: PrismaClient) {
  return prisma.platformSettings.create({
    data: {
      syscohadaVersion: DEFAULT_PLATFORM_SETTINGS.syscohadaVersion,
      cashDeductibilityThreshold: DEFAULT_PLATFORM_SETTINGS.cashDeductibilityThreshold,
      defaultVatRate: DEFAULT_PLATFORM_SETTINGS.defaultVatRate,
      autoFlagLargeCashPayments: DEFAULT_PLATFORM_SETTINGS.autoFlagLargeCashPayments,
      defaultDebitCashAccount: DEFAULT_PLATFORM_SETTINGS.defaultDebitCashAccount,
      defaultCreditSalesAccount: DEFAULT_PLATFORM_SETTINGS.defaultCreditSalesAccount,
      defaultDebitExpenseAccount: DEFAULT_PLATFORM_SETTINGS.defaultDebitExpenseAccount,
      globalConfidenceThreshold: DEFAULT_PLATFORM_SETTINGS.globalConfidenceThreshold,
      autoValidateHighConfidence: DEFAULT_PLATFORM_SETTINGS.autoValidateHighConfidence,
      duplicateDetection: DEFAULT_PLATFORM_SETTINGS.duplicateDetection,
      aiModelPreference: AI_MODEL_TO_DB[DEFAULT_PLATFORM_SETTINGS.aiModelPreference] as any,
      defaultStartupView: DEFAULT_PLATFORM_SETTINGS.defaultStartupView as any,
      numberFormatting: DEFAULT_PLATFORM_SETTINGS.numberFormatting as any,
      cabinetName: DEFAULT_PLATFORM_SETTINGS.cabinetName,
      expertLicenseNumber: DEFAULT_PLATFORM_SETTINGS.expertLicenseNumber,
      soundEnabled: DEFAULT_PLATFORM_SETTINGS.soundEnabled,
      soundType: DEFAULT_PLATFORM_SETTINGS.soundType as any,
      soundVolume: DEFAULT_PLATFORM_SETTINGS.soundVolume,
      notifyOnAnomaly: DEFAULT_PLATFORM_SETTINGS.notifyOnAnomaly,
      notifyOnTaxDeadline: DEFAULT_PLATFORM_SETTINGS.notifyOnTaxDeadline,
      notifyOnMobileMoneySync: DEFAULT_PLATFORM_SETTINGS.notifyOnMobileMoneySync,
    },
  });
}

/** Vide entièrement les données applicatives (hors plan comptable) et recrée le jeu de démonstration. */
export async function resetToDemoData(prisma: PrismaClient) {
  await prisma.appNotification.deleteMany();
  await prisma.journalEntry.deleteMany(); // cascade sur audit_logs
  await prisma.clientDossier.deleteMany();
  await prisma.platformSettings.deleteMany();

  await createDemoDossiers(prisma);
  await createDemoEntries(prisma);
  await createDemoNotifications(prisma);
  await createDefaultPlatformSettings(prisma);
}
