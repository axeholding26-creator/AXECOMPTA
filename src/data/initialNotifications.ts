import { AppNotification } from '../types';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Alerte SYSCOHADA : Dépense espèces',
    message: 'Une dépense de 650 000 FCFA a été réglée en espèces. L\'article 17 limite les règlements espèces déductibles à 500 000 FCFA.',
    timestamp: 'Il y a 10 min',
    type: 'warning',
    category: 'compta',
    read: false,
    dossierId: 'dossier-1',
    actionLabel: 'Examiner l\'écriture',
    actionPayload: { mode: 'expert', expertTab: 'journal' }
  },
  {
    id: 'notif-2',
    title: 'Échéance Fiscale TVA (Déclaration)',
    message: 'Déclaration mensuelle de TVA à déposer avant le 15 du mois auprès de la Direction Générale des Impôts.',
    timestamp: 'Il y a 1 heure',
    type: 'info',
    category: 'fiscal',
    read: false,
    actionLabel: 'Accéder au volet fiscal',
    actionPayload: { mode: 'expert', expertTab: 'tax' }
  },
  {
    id: 'notif-3',
    title: 'Synchronisation Mobile Money réussie',
    message: '8 transactions Wave et Orange Money consolidées automatiquement avec les comptes 5261 et 5263.',
    timestamp: 'Il y a 3 heures',
    type: 'success',
    category: 'tresorerie',
    read: false,
    actionLabel: 'Voir la trésorerie',
    actionPayload: { mode: 'simplified' }
  },
  {
    id: 'notif-4',
    title: 'Validation de lot d\'écritures',
    message: 'Le superviseur du Cabinet KM Consulting a validé 12 écritures pour le Grand Livre.',
    timestamp: 'Hier à 17:45',
    type: 'success',
    category: 'compta',
    read: true,
    actionLabel: 'Consulter le journal',
    actionPayload: { mode: 'expert', expertTab: 'journal' }
  },
  {
    id: 'notif-5',
    title: 'Conseil IA : Amortissement matériel',
    message: 'L\'acquisition du groupe électrogène (2 400 000 FCFA) peut faire l\'objet d\'une dotation trimestrielle au compte 2841.',
    timestamp: 'Hier à 11:20',
    type: 'info',
    category: 'ia',
    read: true,
    actionLabel: 'Ouvrir le bilan',
    actionPayload: { mode: 'expert', expertTab: 'financials' }
  }
];
