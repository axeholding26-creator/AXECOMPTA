import { ClientDossier, JournalEntry } from '../types';

export const INITIAL_CLIENT_DOSSIERS: ClientDossier[] = [
  {
    id: 'dossier-1',
    name: 'Quincaillerie Moderne SARL',
    managerName: 'Kouamé Jean-Marc',
    phone: '+225 07 48 92 11 03',
    activity: 'Commerce de matériaux & outillage (ciment, fer, plomberie)',
    city: 'Abidjan (Treichville)',
    country: "Côte d'Ivoire",
    rccm: 'CI-ABJ-2022-B-14299',
    ifu: '0824911K',
    regimeFiscal: 'Réel Simplifié',
    confidenceThreshold: 85,
    currency: 'FCFA'
  },
  {
    id: 'dossier-2',
    name: 'Boutique Fanta Épices & Céréales',
    managerName: 'Fanta Diop',
    phone: '+221 77 639 44 20',
    activity: 'Distribution de denrées alimentaires & condiments en gros',
    city: 'Dakar (Marché Sandaga)',
    country: 'Sénégal',
    rccm: 'SN-DKR-2023-A-0932',
    ifu: '009214432',
    regimeFiscal: 'Synthétique / Forfait',
    confidenceThreshold: 80,
    currency: 'FCFA'
  },
  {
    id: 'dossier-3',
    name: 'Atelier Maître Moussa Confection',
    managerName: 'Moussa Tchakounté',
    phone: '+237 699 12 88 54',
    activity: 'Confection textile, tenues scolaires & uniformes d’entreprises',
    city: 'Douala (Akwa)',
    country: 'Cameroun',
    rccm: 'RC/DLA/2021/B/877',
    ifu: 'M05211488219P',
    regimeFiscal: 'Réel Normal',
    confidenceThreshold: 90,
    currency: 'FCFA'
  }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-001',
    clientDossierId: 'dossier-1',
    date: '2026-09-14',
    label: 'Vente 3 sacs de ciment CPJ 42.5 au comptant',
    pieceRef: 'REC-2026-0819',
    debitAccount: '5711 - Caisse principale (espèces)',
    debitAccountCode: '5711',
    creditAccount: '7011 - Ventes de marchandises au comptant',
    creditAccountCode: '7011',
    amount: 15000,
    tvaAmount: 0,
    status: 'validated',
    confidenceScore: 98,
    rawInput: "J'ai vendu 3 sacs de ciment à 5000F, payé cash",
    inputType: 'text',
    explanationSimplified: "Enregistrement d'une vente de 15 000 FCFA en espèces. Votre caisse augmente de 15 000 FCFA.",
    paymentMethod: 'cash',
    auditTrail: [
      {
        id: 'aud-1',
        timestamp: '2026-09-14T09:15:22Z',
        action: 'auto_validated',
        author: 'Agent AxeCompta (IA Syscohada)',
        confidenceScore: 98,
        notes: 'Confiance 98% supérieure au seuil cabinet (85%). Écriture validée automatiquement.'
      }
    ]
  },
  {
    id: 'entry-002',
    clientDossierId: 'dossier-1',
    date: '2026-09-14',
    label: 'Règlement facture électricité magasin (CIE Abidjan)',
    pieceRef: 'FAC-CIE-99201',
    debitAccount: '6051 - Fournitures d’électricité',
    debitAccountCode: '6051',
    creditAccount: '5261 - Portefeuille Orange Money Entreprise',
    creditAccountCode: '5261',
    amount: 48500,
    tvaAmount: 7398,
    status: 'validated',
    confidenceScore: 94,
    rawInput: "Facture CIE payée 48 500 FCFA par Orange Money ce matin",
    inputType: 'photo',
    explanationSimplified: "Paiement de la facture électricité de 48 500 FCFA déduit de votre solde Orange Money.",
    paymentMethod: 'orange_money',
    auditTrail: [
      {
        id: 'aud-2',
        timestamp: '2026-09-14T10:30:10Z',
        action: 'auto_validated',
        author: 'Agent AxeCompta (IA Syscohada)',
        confidenceScore: 94,
        notes: 'Extraction OCR facture CIE réussie avec TVA déductible 18% isolée.'
      }
    ]
  },
  {
    id: 'entry-003',
    clientDossierId: 'dossier-1',
    date: '2026-09-13',
    label: 'Achat 20 barres de fer à béton 12mm chez Sotaci',
    pieceRef: 'BL-SOTACI-441',
    debitAccount: '6011 - Achats de marchandises (revente)',
    debitAccountCode: '6011',
    creditAccount: '5211 - Banque locale (Ecobank)',
    creditAccountCode: '5211',
    amount: 240000,
    tvaAmount: 36610,
    status: 'validated',
    confidenceScore: 92,
    rawInput: "Virement de 240 000 FCFA pour le réassort de fer à béton chez Sotaci",
    inputType: 'text',
    explanationSimplified: "Achat de stock pour 240 000 FCFA payé par banque. Valeur stock augmentée.",
    paymentMethod: 'bank_transfer',
    auditTrail: [
      {
        id: 'aud-3',
        timestamp: '2026-09-13T14:12:00Z',
        action: 'validated_by_expert',
        author: 'Cabinet KM Consulting (Expert M. Traoré)',
        confidenceScore: 92,
        notes: 'Vérifié avec le bon de livraison Sotaci joint.'
      }
    ]
  },
  {
    id: 'entry-004',
    clientDossierId: 'dossier-1',
    date: '2026-09-13',
    label: 'Vente 15 pots de peinture acrylique pro et pinceaux',
    pieceRef: 'REC-2026-0820',
    debitAccount: '5263 - Portefeuille Wave Business',
    debitAccountCode: '5263',
    creditAccount: '7011 - Ventes de marchandises au comptant',
    creditAccountCode: '7011',
    amount: 95000,
    tvaAmount: 0,
    status: 'validated',
    confidenceScore: 96,
    rawInput: "Client a réglé 95 000 FCFA par Wave pour les 15 pots de peinture",
    inputType: 'mobile_money',
    explanationSimplified: "Encaissement Wave de 95 000 FCFA enregistré sur le compte de vente.",
    paymentMethod: 'wave',
    auditTrail: [
      {
        id: 'aud-4',
        timestamp: '2026-09-13T16:45:00Z',
        action: 'auto_validated',
        author: 'Agent AxeCompta (IA Syscohada)',
        confidenceScore: 96
      }
    ]
  },
  {
    id: 'entry-005',
    clientDossierId: 'dossier-1',
    date: '2026-09-12',
    label: 'Dépense transport informel & manutention déchargement',
    pieceRef: 'PIECE-MAN-01',
    debitAccount: '6121 - Transports sur achats et livraisons',
    debitAccountCode: '6121',
    creditAccount: '5711 - Caisse principale (espèces)',
    creditAccountCode: '5711',
    amount: 25000,
    tvaAmount: 0,
    status: 'pending_review',
    confidenceScore: 74,
    rawInput: "J'ai donné 25 000F cash aux chargeurs pour descendre le camion de gravier sans facture",
    inputType: 'voice',
    explanationSimplified: "Dépense de 25 000 FCFA en espèces transmise à votre comptable pour imputation conforme.",
    paymentMethod: 'cash',
    detectedAnomaly: "Pièce justificative informelle : seuil de déductibilité fiscale à confirmer par l'expert.",
    auditTrail: [
      {
        id: 'aud-5',
        timestamp: '2026-09-12T11:04:12Z',
        action: 'created_by_ai',
        author: 'Agent AxeCompta (IA Syscohada)',
        confidenceScore: 74,
        notes: 'Confiance 74% < seuil 85%. Mise en attente de supervision cabinet.'
      }
    ]
  },
  {
    id: 'entry-006',
    clientDossierId: 'dossier-1',
    date: '2026-09-11',
    label: 'Retrait d’espèces guichet sans justificatif d’affectation',
    pieceRef: 'RET-BQ-992',
    debitAccount: '4711 - Compte d’attente créditeur/débiteur',
    debitAccountCode: '4711',
    creditAccount: '5211 - Banque locale (Ecobank)',
    creditAccountCode: '5211',
    amount: 350000,
    tvaAmount: 0,
    status: 'anomaly',
    confidenceScore: 45,
    rawInput: "Retrait de 350 000 FCFA sur Ecobank pour dépenses imprévues",
    inputType: 'text',
    explanationSimplified: "Retrait bancaire de 350 000 FCFA placé en attente de précisions pour votre expert-comptable.",
    paymentMethod: 'bank_transfer',
    detectedAnomaly: "Montant élevé (> 250 000 FCFA) sans contrepartie commerciale identifiée : risque de confusion de patrimoine.",
    auditTrail: [
      {
        id: 'aud-6',
        timestamp: '2026-09-11T17:20:05Z',
        action: 'anomaly_flagged',
        author: 'Agent AxeCompta (Moteur de Vérification)',
        confidenceScore: 45,
        notes: 'Alerte anomalie émise. Compte d’attente 4711 provisoire.'
      }
    ]
  },
  {
    id: 'entry-007',
    clientDossierId: 'dossier-2',
    date: '2026-09-14',
    label: 'Vente 10 sacs d’oignons de Podor à crédit client Mme Sall',
    pieceRef: 'FAC-DOP-044',
    debitAccount: '4111 - Clients ordinaires',
    debitAccountCode: '4111',
    creditAccount: '7011 - Ventes de marchandises au comptant',
    creditAccountCode: '7011',
    amount: 140000,
    tvaAmount: 0,
    status: 'validated',
    confidenceScore: 95,
    rawInput: "Vendu 10 sacs d'oignons à Mme Sall pour 140 000 FCFA payable dans 15 jours",
    inputType: 'text',
    explanationSimplified: "Vente à crédit de 140 000 FCFA enregistrée sur la fiche de Mme Sall.",
    paymentMethod: 'cash',
    auditTrail: [
      {
        id: 'aud-7',
        timestamp: '2026-09-14T08:30:00Z',
        action: 'auto_validated',
        author: 'Agent AxeCompta (IA Syscohada)',
        confidenceScore: 95
      }
    ]
  },
  {
    id: 'entry-008',
    clientDossierId: 'dossier-3',
    date: '2026-09-14',
    label: 'Achat rouleaux de tissu tergal pour confection blouses scolaires',
    pieceRef: 'FAC-CICAM-882',
    debitAccount: '6021 - Achats de matières premières (production)',
    debitAccountCode: '6021',
    creditAccount: '5262 - Portefeuille MTN Mobile Money',
    creditAccountCode: '5262',
    amount: 175000,
    tvaAmount: 26695,
    status: 'validated',
    confidenceScore: 91,
    rawInput: "Achat de rouleaux tergal chez Cicam 175 000 FCFA payé avec MTN MoMo",
    inputType: 'text',
    explanationSimplified: "Achat de matière première de 175 000 FCFA déduit du solde MTN MoMo.",
    paymentMethod: 'mtn_momo',
    auditTrail: [
      {
        id: 'aud-8',
        timestamp: '2026-09-14T11:55:00Z',
        action: 'auto_validated',
        author: 'Agent AxeCompta (IA Syscohada)',
        confidenceScore: 91
      }
    ]
  }
];
