import { PlatformSettings } from '../types';

export const OHADA_COUNTRIES = [
  { code: 'CI', name: "Côte d'Ivoire", currency: 'FCFA (XOF)', defaultVat: 18, flag: '🇨🇮' },
  { code: 'SN', name: 'Sénégal', currency: 'FCFA (XOF)', defaultVat: 18, flag: '🇸🇳' },
  { code: 'CM', name: 'Cameroun', currency: 'FCFA (XAF)', defaultVat: 19.25, flag: '🇨🇲' },
  { code: 'BJ', name: 'Bénin', currency: 'FCFA (XOF)', defaultVat: 18, flag: '🇧🇯' },
  { code: 'TG', name: 'Togo', currency: 'FCFA (XOF)', defaultVat: 18, flag: '🇹🇬' },
  { code: 'BF', name: 'Burkina Faso', currency: 'FCFA (XOF)', defaultVat: 18, flag: '🇧🇫' },
  { code: 'ML', name: 'Mali', currency: 'FCFA (XOF)', defaultVat: 18, flag: '🇲🇱' },
  { code: 'GA', name: 'Gabon', currency: 'FCFA (XAF)', defaultVat: 18, flag: '🇬🇦' },
  { code: 'CG', name: 'Congo', currency: 'FCFA (XAF)', defaultVat: 18, flag: '🇨🇬' },
  { code: 'NE', name: 'Niger', currency: 'FCFA (XOF)', defaultVat: 18, flag: '🇳🇪' },
  { code: 'GN', name: 'Guinée', currency: 'GNF', defaultVat: 18, flag: '🇬🇳' },
  { code: 'CD', name: 'RD Congo', currency: 'CDF / USD', defaultVat: 16, flag: '🇨🇩' }
];

export const ACTIVITY_SECTORS = [
  'Commerce de gros & demi-gros',
  'Commerce de détail & alimentation générale',
  'Quincaillerie & matériaux de construction',
  'Artisanat, confection & textile',
  'Prestations de services & conseil',
  'Transport, logistique & livraison',
  'BTP, travaux & rénovation',
  'Restauration, maquis & hôtellerie',
  'Santé, pharmacie & cosmétiques',
  'Agro-alimentaire & maraîchage',
  'Numérique, télécoms & multimédia'
];

export const FISCAL_REGIMES: Array<'Réel Simplifié' | 'Réel Normal' | 'Synthétique / Forfait'> = [
  'Réel Simplifié',
  'Réel Normal',
  'Synthétique / Forfait'
];

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  // Comptabilité & SYSCOHADA
  syscohadaVersion: 'SYSCOHADA Révisé 2026 (AUDCIF)',
  cashDeductibilityThreshold: 500000, // 500 000 FCFA selon article OHADA/CGI
  defaultVatRate: 18, // 18% par défaut zone UEMOA
  autoFlagLargeCashPayments: true,
  defaultDebitCashAccount: '5711 - Caisse Principale',
  defaultCreditSalesAccount: '7011 - Ventes de Marchandises',
  defaultDebitExpenseAccount: '6011 - Achats de Marchandises',

  // IA & Seuil d'imputation
  globalConfidenceThreshold: 85,
  autoValidateHighConfidence: true,
  duplicateDetection: true,
  aiModelPreference: 'gemini-2.5-flash',

  // Préférences & Affichage
  defaultStartupView: 'simplified',
  numberFormatting: 'standard',
  cabinetName: 'Cabinet KM Consulting & Audit OHADA',
  expertLicenseNumber: 'ONECCA-CI N° 2024-889',

  // Audio & Notifications
  soundEnabled: true,
  soundType: 'fintech_chime',
  soundVolume: 0.7,
  notifyOnAnomaly: true,
  notifyOnTaxDeadline: true,
  notifyOnMobileMoneySync: true
};
