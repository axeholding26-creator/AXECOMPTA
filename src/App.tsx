import React, { useState, useEffect } from 'react';
import { ClientDossier, JournalEntry, AppNotification, NotificationType, NotificationCategory, PlatformSettings } from './types';
import { INITIAL_CLIENT_DOSSIERS, INITIAL_JOURNAL_ENTRIES } from './data/mockData';
import { INITIAL_NOTIFICATIONS } from './data/initialNotifications';
import { DEFAULT_PLATFORM_SETTINGS } from './data/initialSettings';
import { soundManager } from './utils/sound';
import { Header } from './components/Header';
import { NotificationPanel } from './components/NotificationPanel';
import { SettingsModal } from './components/SettingsModal';
import { ConversationalAgent } from './components/simplified/ConversationalAgent';
import { TreasuryDashboard } from './components/simplified/TreasuryDashboard';
import { CreditReadyReport } from './components/simplified/CreditReadyReport';
import { QuickInvoiceModal } from './components/simplified/QuickInvoiceModal';
import { MultiClientPortfolio } from './components/expert/MultiClientPortfolio';
import { JournalValidation } from './components/expert/JournalValidation';
import { GeneralLedger } from './components/expert/GeneralLedger';
import { FinancialStatements } from './components/expert/FinancialStatements';
import { TaxCompliance } from './components/expert/TaxCompliance';
import { AuditTrailModal } from './components/expert/AuditTrailModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { 
  Building2, 
  BookOpen, 
  CheckCircle2, 
  Scale, 
  Receipt, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Settings
} from 'lucide-react';

export default function App() {
  // Platform configuration state (with localStorage persistence)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('axecompta_platform_settings');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading platform settings', e);
      }
    }
    return DEFAULT_PLATFORM_SETTINGS;
  });

  const [currentMode, setCurrentMode] = useState<'simplified' | 'expert'>(() => {
    return platformSettings.defaultStartupView || 'simplified';
  });

  // Client dossiers / Projects state (with localStorage persistence)
  const [dossiers, setDossiers] = useState<ClientDossier[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('axecompta_client_dossiers');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading client dossiers', e);
      }
    }
    return INITIAL_CLIENT_DOSSIERS;
  });

  const [activeDossierId, setActiveDossierId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedId = localStorage.getItem('axecompta_active_dossier_id');
        if (savedId && dossiers.some(d => d.id === savedId)) return savedId;
      } catch (e) {
        console.error(e);
      }
    }
    return dossiers[0]?.id || INITIAL_CLIENT_DOSSIERS[0].id;
  });

  // Journal entries state (with localStorage persistence)
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('axecompta_journal_entries');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading journal entries', e);
      }
    }
    return INITIAL_JOURNAL_ENTRIES;
  });
  
  // Expert navigation tab
  const [expertTab, setExpertTab] = useState<'portfolio' | 'journal' | 'ledger' | 'financials' | 'tax'>('journal');
  
  // Modals & Panels
  const [selectedAuditEntry, setSelectedAuditEntry] = useState<JournalEntry | null>(null);
  const [isCreditReadyOpen, setIsCreditReadyOpen] = useState(false);
  const [isQuickInvoiceOpen, setIsQuickInvoiceOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync settings with SoundManager
  useEffect(() => {
    soundManager.setEnabled(platformSettings.soundEnabled);
    soundManager.setSoundType(platformSettings.soundType);
    soundManager.setVolume(platformSettings.soundVolume);
  }, [platformSettings]);

  // Persist platform settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('axecompta_platform_settings', JSON.stringify(platformSettings));
    }
  }, [platformSettings]);

  // Persist dossiers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('axecompta_client_dossiers', JSON.stringify(dossiers));
    }
  }, [dossiers]);

  // Persist active dossier id
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('axecompta_active_dossier_id', activeDossierId);
    }
  }, [activeDossierId]);

  // Persist entries
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('axecompta_journal_entries', JSON.stringify(entries));
    }
  }, [entries]);

  // Persistent notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('axecompta_notifications');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading notifications from storage', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Save notifications to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('axecompta_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const activeDossier = dossiers.find(d => d.id === activeDossierId) || dossiers[0];

  // Calculated metrics
  const activeEntries = entries.filter(e => e.clientDossierId === activeDossier.id);
  const pendingCount = activeEntries.filter(e => e.status === 'pending_review').length;
  const anomalyCount = activeEntries.filter(e => e.status === 'anomaly').length;
  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /**
   * Pushes a new notification and triggers the default notification chime
   */
  const pushNotification = (
    title: string,
    message: string,
    type: NotificationType = 'info',
    category: NotificationCategory = 'compta',
    options?: {
      actionLabel?: string;
      actionPayload?: { mode?: 'simplified' | 'expert'; expertTab?: 'portfolio' | 'journal' | 'ledger' | 'financials' | 'tax' };
      playSound?: boolean;
    }
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      message,
      timestamp: "À l'instant",
      type,
      category,
      read: false,
      dossierId: activeDossier.id,
      actionLabel: options?.actionLabel,
      actionPayload: options?.actionPayload
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Play synthesized notification sound by default
    if (options?.playSound !== false) {
      soundManager.play(type === 'warning' || type === 'error' ? 'alert_warning' : undefined);
    }

    showToast(title);
  };

  // Add new entry
  const handleNewEntry = (newEntry: JournalEntry) => {
    setEntries(prev => [newEntry, ...prev]);
    const isAnomaly = newEntry.status === 'anomaly';

    pushNotification(
      isAnomaly ? 'Alerte Anomalie détectée' : 'Nouvelle opération enregistrée',
      isAnomaly
        ? `Écriture "${newEntry.label}" (${newEntry.amount.toLocaleString('fr-FR')} FCFA) : ${newEntry.detectedAnomaly || 'Anomalie détectée'}`
        : `${newEntry.label} • ${newEntry.amount.toLocaleString('fr-FR')} FCFA imputé au débit ${newEntry.debitAccountCode} / crédit ${newEntry.creditAccountCode}`,
      isAnomaly ? 'warning' : 'success',
      'compta',
      {
        actionLabel: isAnomaly ? "Examiner l'anomalie" : "Voir l'écriture",
        actionPayload: { mode: 'expert', expertTab: 'journal' }
      }
    );
  };

  // Import entries from Excel
  const handleImportEntries = (newEntries: JournalEntry[], targetDossierId: string) => {
    setEntries(prev => [...newEntries, ...prev]);
    const target = dossiers.find(d => d.id === targetDossierId);
    
    pushNotification(
      'Import Excel réussi',
      `${newEntries.length} écriture(s) SYSCOHADA importée(s) avec succès pour ${target?.name || 'le dossier'}.`,
      'success',
      'compta',
      {
        actionLabel: 'Consulter le journal',
        actionPayload: { mode: 'expert', expertTab: 'journal' }
      }
    );
  };

  // Batch validation
  const handleBatchValidate = (entryIds: string[]) => {
    setEntries(prev => prev.map(entry => {
      if (entryIds.includes(entry.id)) {
        return {
          ...entry,
          status: 'validated',
          detectedAnomaly: undefined,
          auditTrail: [
            ...entry.auditTrail,
            {
              id: `aud-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              action: 'validated_by_expert',
              author: 'Cabinet KM Consulting (Superviseur)',
              notes: 'Validation en lot par l\'expert-comptable.'
            }
          ]
        };
      }
      return entry;
    }));

    pushNotification(
      'Validation de lot effectuée',
      `${entryIds.length} écriture(s) validée(s) avec succès et intégrée(s) au Grand Livre.`,
      'success',
      'compta',
      {
        actionLabel: 'Ouvrir le Grand Livre',
        actionPayload: { mode: 'expert', expertTab: 'ledger' }
      }
    );
  };

  // Single entry update
  const handleUpdateEntry = (updatedEntry: JournalEntry) => {
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    pushNotification(
      'Écriture mise à jour',
      `L'écriture "${updatedEntry.label}" a été modifiée et validée.`,
      'success',
      'compta'
    );
  };

  // Update confidence threshold
  const handleUpdateConfidenceThreshold = (dossierId: string, newThreshold: number) => {
    setDossiers(prev => prev.map(d => d.id === dossierId ? { ...d, confidenceThreshold: newThreshold } : d));
    pushNotification(
      'Seuil IA reconfiguré',
      `Le seuil d'auto-validation du dossier a été fixé à ${newThreshold}%.`,
      'info',
      'ia'
    );
  };

  // Project / Dossier Management handlers
  const handleCreateDossier = (newDossierData: Omit<ClientDossier, 'id'>) => {
    const newId = `dossier-${Date.now()}`;
    const newDossier: ClientDossier = {
      ...newDossierData,
      id: newId
    };

    setDossiers(prev => [...prev, newDossier]);
    setActiveDossierId(newId);

    pushNotification(
      'Nouveau Dossier Créé',
      `Le dossier "${newDossier.name}" (${newDossier.country}) a été créé avec succès et sélectionné comme dossier actif.`,
      'success',
      'system',
      {
        actionLabel: 'Voir le portefeuille',
        actionPayload: { mode: 'expert', expertTab: 'portfolio' }
      }
    );

    showToast(`Dossier "${newDossier.name}" créé avec succès.`);
  };

  const handleUpdateDossier = (updatedDossier: ClientDossier) => {
    setDossiers(prev => prev.map(d => d.id === updatedDossier.id ? updatedDossier : d));

    pushNotification(
      'Dossier Mis à Jour',
      `Les informations du dossier "${updatedDossier.name}" ont été actualisées avec succès.`,
      'info',
      'system'
    );

    showToast(`Dossier "${updatedDossier.name}" mis à jour.`);
  };

  const handleDeleteDossier = (dossierId: string) => {
    if (dossiers.length <= 1) {
      showToast('Impossible de supprimer le seul dossier du cabinet.');
      return;
    }

    const dossierToDelete = dossiers.find(d => d.id === dossierId);
    const remainingDossiers = dossiers.filter(d => d.id !== dossierId);

    if (activeDossierId === dossierId) {
      setActiveDossierId(remainingDossiers[0].id);
    }

    setDossiers(remainingDossiers);

    pushNotification(
      'Dossier Supprimé',
      `Le dossier "${dossierToDelete?.name || dossierId}" a été retiré du portefeuille cabinet.`,
      'warning',
      'system'
    );

    showToast(`Dossier "${dossierToDelete?.name}" supprimé.`);
  };

  const handleUpdatePlatformSettings = (newSettings: PlatformSettings) => {
    setPlatformSettings(newSettings);
    showToast('Paramètres de la plateforme enregistrés.');
  };

  const handleResetAllData = () => {
    setDossiers(INITIAL_CLIENT_DOSSIERS);
    setActiveDossierId(INITIAL_CLIENT_DOSSIERS[0].id);
    setEntries(INITIAL_JOURNAL_ENTRIES);
    setPlatformSettings(DEFAULT_PLATFORM_SETTINGS);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('axecompta_client_dossiers');
      localStorage.removeItem('axecompta_active_dossier_id');
      localStorage.removeItem('axecompta_journal_entries');
      localStorage.removeItem('axecompta_platform_settings');
    }

    soundManager.play('fintech_chime', true);
    showToast('Toutes les données ont été réinitialisées aux valeurs usine.');
  };

  const handleImportBackup = (backupData: {
    settings?: PlatformSettings;
    dossiers?: ClientDossier[];
    entries?: JournalEntry[];
  }) => {
    if (backupData.settings) {
      setPlatformSettings(backupData.settings);
    }
    if (backupData.dossiers && backupData.dossiers.length > 0) {
      setDossiers(backupData.dossiers);
      if (!backupData.dossiers.some(d => d.id === activeDossierId)) {
        setActiveDossierId(backupData.dossiers[0].id);
      }
    }
    if (backupData.entries) {
      setEntries(backupData.entries);
    }

    soundManager.play('fintech_chime', true);
    pushNotification(
      'Restauration effectuée',
      'Les données et paramètres de la plateforme ont été restaurés depuis votre sauvegarde.',
      'success',
      'system'
    );
    showToast('Sauvegarde restaurée avec succès.');
  };

  // Notification management handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    soundManager.play('soft_chord', true);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Simulation generator for rapid testing with sound
  const handleSimulateNotification = () => {
    const testCases: Array<{
      title: string;
      message: string;
      type: NotificationType;
      category: NotificationCategory;
      actionLabel: string;
      actionPayload: { mode?: 'simplified' | 'expert'; expertTab?: 'portfolio' | 'journal' | 'ledger' | 'financials' | 'tax' };
    }> = [
      {
        title: 'Alerte Plafond Espèces SYSCOHADA',
        message: 'Règlement fournisseur de 720 000 FCFA détecté en caisse (compte 5711). Dépassement du seuil de déductibilité fiscale (500 000 FCFA).',
        type: 'warning',
        category: 'compta',
        actionLabel: 'Régulariser par virement',
        actionPayload: { mode: 'expert', expertTab: 'journal' }
      },
      {
        title: 'Rappel Échéance Fiscale TVA',
        message: 'La déclaration mensuelle de TVA du dossier est attendue avant le 15 du mois prochain auprès du centre des impôts.',
        type: 'info',
        category: 'fiscal',
        actionLabel: 'Vérifier la déclaration',
        actionPayload: { mode: 'expert', expertTab: 'tax' }
      },
      {
        title: 'Encaissement Mobile Money reçu',
        message: 'Un paiement Wave de 145 000 FCFA a été automatiquement imputé au compte 5263 (Wave Business) pour la vente de quincaillerie.',
        type: 'success',
        category: 'tresorerie',
        actionLabel: 'Voir le solde trésorerie',
        actionPayload: { mode: 'simplified' }
      },
      {
        title: 'Optimisation Fiscale Recommandée',
        message: 'Le solde de TVA déductible sur immobilisations (432 000 FCFA) génère un crédit de taxe reportable sur le prochain trimestre.',
        type: 'info',
        category: 'ia',
        actionLabel: 'Consulter le bilan',
        actionPayload: { mode: 'expert', expertTab: 'financials' }
      }
    ];

    const randomItem = testCases[Math.floor(Math.random() * testCases.length)];
    pushNotification(
      randomItem.title,
      randomItem.message,
      randomItem.type,
      randomItem.category,
      {
        actionLabel: randomItem.actionLabel,
        actionPayload: randomItem.actionPayload,
        playSound: true
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F7FD] text-[#1E084A] flex flex-col font-sans selection:bg-[#7024E3] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1E084A] dark:bg-[#200E40] text-white px-4 py-3 rounded-xl border border-[#7024E3] shadow-xl flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        dossiers={dossiers}
        activeDossier={activeDossier}
        onSelectDossier={(d) => setActiveDossierId(d.id)}
        pendingValidationCount={pendingCount}
        anomalyCount={anomalyCount}
        onOpenExcelImport={() => setIsExcelImportOpen(true)}
        unreadNotificationCount={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationPanelOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* ================= PERSONA A: ENTREPRENEUR (SIMPLIFIÉ) ================= */}
        {currentMode === 'simplified' && (
          <div className="space-y-6">
            {/* Context Sub-Bar */}
            <div className="bg-white border border-[#DDD6FE] p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs font-bold text-[#1E084A]">
                  Espace Entrepreneur : {activeDossier.name}
                </span>
                <span className="text-xs text-[#7C709A]">
                  • Dialogue naturel, WhatsApp audio, reçus & trésorerie en temps réel
                </span>
              </div>

              <button
                onClick={() => setCurrentMode('expert')}
                className="text-xs font-bold text-[#7024E3] hover:text-[#5B18C4] flex items-center gap-1.5 transition-colors"
              >
                <span>Accéder à la vue Cabinet Expert</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Split Screen: Conversational Agent (Left) & Real-Time Treasury (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Conversational Agent */}
              <div className="lg:col-span-7">
                <ConversationalAgent
                  activeDossier={activeDossier}
                  onNewEntry={handleNewEntry}
                  recentEntries={activeEntries}
                  onOpenExcelImport={() => setIsExcelImportOpen(true)}
                />
              </div>

              {/* Right Column: Real-time Treasury Dashboard */}
              <div className="lg:col-span-5">
                <TreasuryDashboard
                  entries={entries}
                  activeDossier={activeDossier}
                  onOpenCreditReady={() => setIsCreditReadyOpen(true)}
                  onOpenNewInvoice={() => setIsQuickInvoiceOpen(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= PERSONA B: EXPERT-COMPTABLE (CABINET) ================= */}
        {currentMode === 'expert' && (
          <div className="space-y-5">
            {/* Expert Navigation Tabs Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1E084A] text-white p-2 rounded-xl border border-[#3B1578] shadow-md">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setExpertTab('portfolio')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    expertTab === 'portfolio' 
                      ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs' 
                      : 'text-[#C4B5FD] hover:bg-[#2A0E68] hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Portefeuille Multi-Dossiers</span>
                </button>

                <button
                  onClick={() => setExpertTab('journal')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                    expertTab === 'journal' 
                      ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs' 
                      : 'text-[#C4B5FD] hover:bg-[#2A0E68] hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Journal & Validation en Lot</span>
                  {(pendingCount > 0 || anomalyCount > 0) && (
                    <span className="px-1.5 py-0.2 bg-[#F59E0B] text-white font-mono text-[10px] font-bold rounded-full">
                      {pendingCount + anomalyCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setExpertTab('ledger')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    expertTab === 'ledger' 
                      ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs' 
                      : 'text-[#C4B5FD] hover:bg-[#2A0E68] hover:text-white'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>Grand Livre & Balance</span>
                </button>

                <button
                  onClick={() => setExpertTab('financials')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    expertTab === 'financials' 
                      ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs' 
                      : 'text-[#C4B5FD] hover:bg-[#2A0E68] hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Bilan & Compte de Résultat</span>
                </button>

                <button
                  onClick={() => setExpertTab('tax')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    expertTab === 'tax' 
                      ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs' 
                      : 'text-[#C4B5FD] hover:bg-[#2A0E68] hover:text-white'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Fiscalité & TVA</span>
                </button>
              </div>

              {/* Right Side: Dossier Indicator & Settings Quick Trigger */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block pr-2">
                  <span className="text-[9.5px] font-mono text-[#A78BFA] uppercase tracking-wider block font-bold">
                    Dossier Supervisé
                  </span>
                  <span className="text-xs font-bold text-white">{activeDossier.name}</span>
                </div>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2A0E68] hover:bg-[#3B1578] text-[#C4B5FD] hover:text-white border border-[#4C1D95] transition-all flex items-center gap-1.5 shadow-2xs"
                  title="Paramètres de la plateforme & Gestion des projets"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paramètres</span>
                </button>
              </div>
            </div>

            {/* Expert View Content */}
            {expertTab === 'portfolio' && (
              <MultiClientPortfolio
                dossiers={dossiers}
                activeDossier={activeDossier}
                entries={entries}
                onSelectDossier={(d) => {
                  setActiveDossierId(d.id);
                  setExpertTab('journal');
                }}
                onUpdateConfidenceThreshold={handleUpdateConfidenceThreshold}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            {expertTab === 'journal' && (
              <JournalValidation
                entries={entries}
                activeDossier={activeDossier}
                onBatchValidate={handleBatchValidate}
                onUpdateEntry={handleUpdateEntry}
                onViewAuditTrail={(entry) => setSelectedAuditEntry(entry)}
                onOpenExcelImport={() => setIsExcelImportOpen(true)}
              />
            )}

            {expertTab === 'ledger' && (
              <GeneralLedger
                entries={entries}
                activeDossier={activeDossier}
              />
            )}

            {expertTab === 'financials' && (
              <FinancialStatements
                entries={entries}
                activeDossier={activeDossier}
              />
            )}

            {expertTab === 'tax' && (
              <TaxCompliance
                entries={entries}
                activeDossier={activeDossier}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#EDE9FE] px-4 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#534674] gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-[#1E084A]">Axe<span className="text-[#7024E3]">Compta</span></span>
            <span className="text-[#7024E3] font-bold">— MAÎTRISE • FIABILITÉ • PERFORMANCE</span>
            <span className="text-[#7C709A]">| Axe Digital (GROWTH KDO Services)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-[#7C709A]">
            <span>Espace OHADA (17 États)</span>
            <span>Système SYSCOHADA v2026</span>
            <span>UEMOA / CEMAC / RDC / Guinée</span>
          </div>
        </div>
      </footer>

      {/* Audit Trail Modal */}
      {selectedAuditEntry && (
        <AuditTrailModal
          entry={selectedAuditEntry}
          onClose={() => setSelectedAuditEntry(null)}
        />
      )}

      {/* Credit-Ready Financial Report Modal */}
      {isCreditReadyOpen && (
        <CreditReadyReport
          activeDossier={activeDossier}
          entries={entries}
          onClose={() => setIsCreditReadyOpen(false)}
        />
      )}

      {/* Quick Invoicing & Receipt Modal */}
      {isQuickInvoiceOpen && (
        <QuickInvoiceModal
          activeDossier={activeDossier}
          onClose={() => setIsQuickInvoiceOpen(false)}
          onSavedEntry={handleNewEntry}
        />
      )}

      {/* Excel / Spreadsheet Importer Modal */}
      {isExcelImportOpen && (
        <ExcelImportModal
          isOpen={isExcelImportOpen}
          onClose={() => setIsExcelImportOpen(false)}
          activeDossier={activeDossier}
          dossiers={dossiers}
          onImportEntries={handleImportEntries}
        />
      )}

      {/* Notification Center & Sound Settings Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteNotification={handleDeleteNotification}
        onClearAll={handleClearAllNotifications}
        onNavigateAction={(payload) => {
          if (payload.mode) setCurrentMode(payload.mode);
          if (payload.expertTab) setExpertTab(payload.expertTab);
        }}
        onAddSimulatedNotification={handleSimulateNotification}
      />

      {/* Platform & Project Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={platformSettings}
        onUpdateSettings={handleUpdatePlatformSettings}
        dossiers={dossiers}
        activeDossier={activeDossier}
        onSelectDossier={(d) => setActiveDossierId(d.id)}
        onCreateDossier={handleCreateDossier}
        onUpdateDossier={handleUpdateDossier}
        onDeleteDossier={handleDeleteDossier}
        entries={entries}
        onResetAllData={handleResetAllData}
        onImportBackup={handleImportBackup}
      />
    </div>
  );
}
