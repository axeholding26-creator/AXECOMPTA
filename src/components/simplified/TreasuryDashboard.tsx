import React, { useState } from 'react';
import { JournalEntry, ClientDossier } from '../../types';
import { EvolutionChart } from '../EvolutionChart';
import { useTheme } from '../../context/ThemeContext';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Smartphone, 
  Building, 
  AlertCircle, 
  TrendingUp, 
  FileCheck,
  Receipt,
  Sparkles,
  Activity,
  Layers
} from 'lucide-react';

interface TreasuryDashboardProps {
  entries: JournalEntry[];
  activeDossier: ClientDossier;
  onOpenCreditReady: () => void;
  onOpenNewInvoice: () => void;
}

export const TreasuryDashboard: React.FC<TreasuryDashboardProps> = ({
  entries,
  activeDossier,
  onOpenCreditReady,
  onOpenNewInvoice
}) => {
  const { isDark } = useTheme();
  const [activeViewTab, setActiveViewTab] = useState<'chart' | 'pockets'>('chart');

  // Compute balances from entries for the active dossier
  const dossierEntries = entries.filter(e => e.clientDossierId === activeDossier.id);

  // Baseline balances
  let cashBalance = 385000;
  let orangeMoneyBalance = 195000;
  let waveBalance = 240000;
  let mtnBalance = 120000;
  let bankBalance = 1450000;

  let totalIncome = 0;
  let totalExpenses = 0;

  dossierEntries.forEach(entry => {
    const isIncome = entry.creditAccountCode.startsWith('7') || entry.label.toLowerCase().includes('vente') || entry.label.toLowerCase().includes('encaissement');
    const isExpense = entry.debitAccountCode.startsWith('6') || entry.label.toLowerCase().includes('achat') || entry.label.toLowerCase().includes('facture') || entry.label.toLowerCase().includes('loyer');

    if (isIncome) {
      totalIncome += entry.amount;
      if (entry.paymentMethod === 'orange_money') orangeMoneyBalance += entry.amount;
      else if (entry.paymentMethod === 'wave') waveBalance += entry.amount;
      else if (entry.paymentMethod === 'mtn_momo') mtnBalance += entry.amount;
      else if (entry.paymentMethod === 'bank_transfer') bankBalance += entry.amount;
      else cashBalance += entry.amount;
    } else if (isExpense) {
      totalExpenses += entry.amount;
      if (entry.paymentMethod === 'orange_money') orangeMoneyBalance -= entry.amount;
      else if (entry.paymentMethod === 'wave') waveBalance -= entry.amount;
      else if (entry.paymentMethod === 'mtn_momo') mtnBalance -= entry.amount;
      else if (entry.paymentMethod === 'bank_transfer') bankBalance -= entry.amount;
      else cashBalance -= entry.amount;
    }
  });

  const totalLiquidity = cashBalance + orangeMoneyBalance + waveBalance + mtnBalance + bankBalance;
  const netMargin = totalIncome - totalExpenses;

  // Alerts in plain French
  const alerts: { text: string; type: 'warning' | 'info' | 'success' }[] = [];
  if (totalExpenses > totalIncome) {
    alerts.push({
      text: "Attention : Vos dépenses du mois dépassent vos encaissements. Surveillez vos achats de stock.",
      type: 'warning'
    });
  } else {
    alerts.push({
      text: `Trésorerie positive : Vous dégagez un excédent net de ${netMargin.toLocaleString('fr-FR')} FCFA ce mois.`,
      type: 'success'
    });
  }

  alerts.push({
    text: "Vos flux Mobile Money représentent 48% de vos encaissements : cela renforce votre profil pour le micro-crédit.",
    type: 'info'
  });

  return (
    <div className="space-y-5">
      {/* Top Banner with Key Actions & Big Numbers */}
      <div className="bg-white dark:bg-[#150A2A] border border-[#DDD6FE] dark:border-[#2D1A54] p-5 lg:p-6 rounded-2xl shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#7C709A] dark:text-[#A78BFA] block font-mono">
              Trésorerie Totale Disponible • {activeDossier.name}
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl lg:text-4xl font-black font-tabular text-[#1E084A] dark:text-[#F3EFFF]">
                {totalLiquidity.toLocaleString('fr-FR')}
              </span>
              <span className="text-lg font-black text-[#7024E3] dark:text-[#A78BFA] font-mono">FCFA</span>
            </div>
            <p className="text-xs text-[#7C709A] dark:text-[#A594C9] mt-1">
              Cumul des disponibilités en Caisse, Mobile Money et Comptes Bancaires
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCreditReady}
              className="px-3.5 py-2.5 bg-[#1E084A] dark:bg-[#25104B] text-white hover:bg-[#2A0E68] dark:hover:bg-[#341764] text-xs font-bold rounded-xl shadow-xs border border-[#3B1578] dark:border-[#4B2382] flex items-center gap-2 transition-all"
            >
              <FileCheck className="w-4 h-4 text-[#A78BFA]" />
              <span>Dossier Crédit-Ready (Banque)</span>
            </button>
            <button
              onClick={onOpenNewInvoice}
              className="px-3.5 py-2.5 bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white hover:from-[#5B18C4] hover:to-[#7024E3] text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>Émettre Facture / Reçu</span>
            </button>
          </div>
        </div>

        {/* 3 Summary Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5 pt-5 border-t border-[#EDE9FE] dark:border-[#2D1A54]">
          <div className="bg-[#F0FDF4] dark:bg-[#0E281E] p-3.5 border border-[#BBF7D0] dark:border-[#134E39] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#166534] dark:text-[#34D399] font-semibold">Entrées du mois</span>
              <ArrowDownLeft className="w-4 h-4 text-[#16A34A] dark:text-[#34D399]" />
            </div>
            <div className="text-xl font-bold font-tabular text-[#166534] dark:text-[#34D399] mt-1.5">
              +{totalIncome.toLocaleString('fr-FR')} <span className="text-xs font-mono">FCFA</span>
            </div>
          </div>

          <div className="bg-[#FFF1F2] dark:bg-[#2B0E1B] p-3.5 border border-[#FECDD3] dark:border-[#521832] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9F1239] dark:text-[#F43F5E] font-semibold">Dépenses du mois</span>
              <ArrowUpRight className="w-4 h-4 text-[#E11D48] dark:text-[#F43F5E]" />
            </div>
            <div className="text-xl font-bold font-tabular text-[#9F1239] dark:text-[#F43F5E] mt-1.5">
              -{totalExpenses.toLocaleString('fr-FR')} <span className="text-xs font-mono">FCFA</span>
            </div>
          </div>

          <div className="bg-[#F5F3FF] dark:bg-[#20103E] p-3.5 border border-[#DDD6FE] dark:border-[#3B2068] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5B18C4] dark:text-[#C4B5FD] font-semibold">Solde Net d'Exploitation</span>
              <TrendingUp className="w-4 h-4 text-[#7024E3] dark:text-[#A78BFA]" />
            </div>
            <div className={`text-xl font-bold font-tabular mt-1.5 ${
              netMargin >= 0 
                ? 'text-[#5B18C4] dark:text-[#34D399]' 
                : 'text-[#E11D48] dark:text-[#F43F5E]'
            }`}>
              {netMargin >= 0 ? '+' : ''}{netMargin.toLocaleString('fr-FR')} <span className="text-xs font-mono">FCFA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Nav Switcher for Chart vs Account Pockets */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#150A2A] p-2 rounded-xl border border-[#DDD6FE] dark:border-[#2D1A54] shadow-2xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveViewTab('chart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeViewTab === 'chart'
                ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs'
                : 'text-[#534674] dark:text-[#A594C9] hover:bg-[#F5F3FF] dark:hover:bg-[#20103E]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Graphique d'Évolution</span>
          </button>
          <button
            onClick={() => setActiveViewTab('pockets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeViewTab === 'pockets'
                ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs'
                : 'text-[#534674] dark:text-[#A594C9] hover:bg-[#F5F3FF] dark:hover:bg-[#20103E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Comptes & Portefeuilles</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-[#7C709A] dark:text-[#A594C9] hidden sm:inline">
          {activeViewTab === 'chart' ? 'Historique & Prévisions' : 'Caisse, Mobile Money & Banque'}
        </span>
      </div>

      {/* Evolution Chart View */}
      {activeViewTab === 'chart' && (
        <EvolutionChart
          entries={entries}
          activeDossier={activeDossier}
        />
      )}

      {/* Breakdown by Account & Pocket */}
      {activeViewTab === 'pockets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Caisse Espèces */}
            <div className="bg-white dark:bg-[#150A2A] border border-[#DDD6FE] dark:border-[#2D1A54] p-4 rounded-xl shadow-2xs hover:border-[#7024E3] dark:hover:border-[#8B5CF6] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E084A] dark:text-[#F3EFFF] flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-[#7024E3] dark:text-[#A78BFA]" />
                  Caisse Espèces (5711)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F5F3FF] dark:bg-[#20103E] text-[#7024E3] dark:text-[#A78BFA] font-bold rounded">
                  Magasin
                </span>
              </div>
              <p className="text-lg font-black font-tabular text-[#1E084A] dark:text-[#F3EFFF] mt-2.5">
                {cashBalance.toLocaleString('fr-FR')} <span className="text-xs font-mono text-[#7C709A] dark:text-[#A594C9]">FCFA</span>
              </p>
              <span className="text-[10px] text-[#7C709A] dark:text-[#A594C9] mt-0.5 block">Billetage et pièces physiques</span>
            </div>

            {/* Orange Money */}
            <div className="bg-white dark:bg-[#150A2A] border border-[#DDD6FE] dark:border-[#2D1A54] p-4 rounded-xl shadow-2xs hover:border-[#7024E3] dark:hover:border-[#8B5CF6] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E084A] dark:text-[#F3EFFF] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#F97316]" />
                  Orange Money (5261)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#FFF7ED] dark:bg-[#2F1404] text-[#EA580C] dark:text-[#FB923C] font-bold rounded">
                  OM Pro
                </span>
              </div>
              <p className="text-lg font-black font-tabular text-[#1E084A] dark:text-[#F3EFFF] mt-2.5">
                {orangeMoneyBalance.toLocaleString('fr-FR')} <span className="text-xs font-mono text-[#7C709A] dark:text-[#A594C9]">FCFA</span>
              </p>
              <span className="text-[10px] text-[#7C709A] dark:text-[#A594C9] mt-0.5 block">Paiements marchands & factures</span>
            </div>

            {/* Wave Business */}
            <div className="bg-white dark:bg-[#150A2A] border border-[#DDD6FE] dark:border-[#2D1A54] p-4 rounded-xl shadow-2xs hover:border-[#7024E3] dark:hover:border-[#8B5CF6] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E084A] dark:text-[#F3EFFF] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#0EA5E9]" />
                  Wave Business (5263)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F0F9FF] dark:bg-[#082236] text-[#0284C7] dark:text-[#38BDF8] font-bold rounded">
                  Sans frais
                </span>
              </div>
              <p className="text-lg font-black font-tabular text-[#1E084A] dark:text-[#F3EFFF] mt-2.5">
                {waveBalance.toLocaleString('fr-FR')} <span className="text-xs font-mono text-[#7C709A] dark:text-[#A594C9]">FCFA</span>
              </p>
              <span className="text-[10px] text-[#7C709A] dark:text-[#A594C9] mt-0.5 block">QR Code & virements clients</span>
            </div>

            {/* Banque Principale */}
            <div className="bg-white dark:bg-[#150A2A] border border-[#DDD6FE] dark:border-[#2D1A54] p-4 rounded-xl shadow-2xs hover:border-[#7024E3] dark:hover:border-[#8B5CF6] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E084A] dark:text-[#F3EFFF] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#7024E3] dark:text-[#A78BFA]" />
                  Banque (5211)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F5F3FF] dark:bg-[#20103E] text-[#7024E3] dark:text-[#A78BFA] font-bold rounded">
                  Ecobank
                </span>
              </div>
              <p className="text-lg font-black font-tabular text-[#1E084A] dark:text-[#F3EFFF] mt-2.5">
                {bankBalance.toLocaleString('fr-FR')} <span className="text-xs font-mono text-[#7C709A] dark:text-[#A594C9]">FCFA</span>
              </p>
              <span className="text-[10px] text-[#7C709A] dark:text-[#A594C9] mt-0.5 block">Virements fournisseurs & chèques</span>
            </div>
          </div>
        </div>
      )}

      {/* Plain Language Alerts */}
      <div className="bg-white dark:bg-[#150A2A] border border-[#DDD6FE] dark:border-[#2D1A54] p-5 rounded-2xl shadow-2xs space-y-3 transition-colors">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E084A] dark:text-[#F3EFFF] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#7024E3] dark:text-[#A78BFA]" />
          Alertes de Trésorerie en Langage Clair
        </h4>

        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                alert.type === 'warning'
                  ? 'bg-[#FFFBEB] dark:bg-[#2B1B06] border-[#FDE68A] dark:border-[#57390B] text-[#92400E] dark:text-[#FBBF24]'
                  : alert.type === 'success'
                  ? 'bg-[#F0FDF4] dark:bg-[#0B2519] border-[#BBF7D0] dark:border-[#14532D] text-[#166534] dark:text-[#34D399]'
                  : 'bg-[#F5F3FF] dark:bg-[#1C0F38] border-[#DDD6FE] dark:border-[#35225E] text-[#1E084A] dark:text-[#E9D5FF]'
              }`}
            >
              <span className="font-bold">•</span>
              <span className="leading-relaxed font-medium">{alert.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

