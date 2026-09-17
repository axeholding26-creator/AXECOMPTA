import React, { useState } from 'react';
import { JournalEntry, ClientDossier } from '../../types';
import { Printer } from 'lucide-react';

interface FinancialStatementsProps {
  entries: JournalEntry[];
  activeDossier: ClientDossier;
}

export const FinancialStatements: React.FC<FinancialStatementsProps> = ({
  entries,
  activeDossier
}) => {
  const [activeTab, setActiveTab] = useState<'bilan' | 'resultat'>('bilan');

  const validatedEntries = entries.filter(e => e.clientDossierId === activeDossier.id && e.status === 'validated');

  // Aggregation of key accounts
  let sales701 = 0;
  let purchases601 = 0;
  let services605_62_63 = 0;
  let personnel66 = 0;
  let amort68 = 30000; // standard periodic depreciation

  let immobilized2 = 2500000;
  let stocks3 = 1800000;
  let receivables4 = 850000;
  let treasuryCashBank5 = 2390000;

  let capital1 = 5000000;
  let debts4 = 1500000;

  validatedEntries.forEach(entry => {
    // Products
    if (entry.creditAccountCode.startsWith('701')) sales701 += entry.amount;
    // Costs
    if (entry.debitAccountCode.startsWith('601')) purchases601 += entry.amount;
    if (entry.debitAccountCode.startsWith('605') || entry.debitAccountCode.startsWith('62') || entry.debitAccountCode.startsWith('63')) {
      services605_62_63 += entry.amount;
    }
    if (entry.debitAccountCode.startsWith('66')) personnel66 += entry.amount;
  });

  // Base adjustments if few entries exist in demo
  if (sales701 === 0) sales701 = 2800000;
  if (purchases601 === 0) purchases601 = 1200000;
  if (services605_62_63 === 0) services605_62_63 = 240000;

  // Intermediate balances of management (Soldes Intermédiaires de Gestion - SYSCOHADA)
  const commercialMargin = sales701 - purchases601;
  const addedValue = commercialMargin - services605_62_63;
  const ebe = addedValue - personnel66;
  const operatingResult = ebe - amort68;
  const corporateTax = operatingResult > 0 ? Math.round(operatingResult * 0.25) : 0;
  const netProfit = operatingResult - corporateTax;

  // Bilan equilibrium
  const totalActif = immobilized2 + stocks3 + receivables4 + treasuryCashBank5;
  const calculatedReserves = totalActif - (capital1 + debts4 + netProfit);
  const totalPassif = capital1 + calculatedReserves + netProfit + debts4;

  return (
    <div className="space-y-4">
      {/* Header with Switcher & Actions */}
      <div className="bg-white border border-[#DDD6FE] p-5 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#7024E3] font-bold">
            Système Normal & SMT • OHADA
          </span>
          <h3 className="font-heading text-xl font-bold text-[#1E084A]">
            États Financiers SYSCOHADA Révisé
          </h3>
          <p className="text-xs text-[#7C709A]">
            {activeDossier.name} • Exercice 2026
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tab buttons */}
          <div className="bg-[#F8F7FD] p-1 rounded-xl border border-[#DDD6FE] flex">
            <button
              onClick={() => setActiveTab('bilan')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'bilan' 
                  ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-2xs' 
                  : 'text-[#1E084A] hover:bg-[#EDE9FE]'
              }`}
            >
              Bilan (Actif / Passif)
            </button>
            <button
              onClick={() => setActiveTab('resultat')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'resultat' 
                  ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-2xs' 
                  : 'text-[#1E084A] hover:bg-[#EDE9FE]'
              }`}
            >
              Compte de Résultat
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2.5 bg-[#F8F7FD] text-[#1E084A] rounded-xl border border-[#DDD6FE] hover:bg-[#EDE9FE] transition-colors shadow-2xs"
            title="Imprimer les états"
          >
            <Printer className="w-4 h-4 text-[#7024E3]" />
          </button>
        </div>
      </div>

      {/* BILAN VIEW */}
      {activeTab === 'bilan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ACTIF */}
          <div className="bg-white border border-[#DDD6FE] rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-[#1E084A] text-white p-3.5 border-b border-[#3B1578] flex items-center justify-between">
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide">Bilan Actif</h4>
              <span className="text-[10px] font-mono text-[#A78BFA]">Montants Nets (FCFA)</span>
            </div>

            <div className="p-4 space-y-4 text-xs font-sans">
              {/* Actif Immobilise */}
              <div>
                <div className="flex justify-between font-bold text-[#1E084A] border-b border-[#EDE9FE] pb-1.5">
                  <span>ACTIF IMMOBILISÉ (Classe 2)</span>
                  <span className="font-tabular font-black">{immobilized2.toLocaleString('fr-FR')}</span>
                </div>
                <div className="pl-3 pt-1.5 text-[11px] text-[#7C709A] flex justify-between">
                  <span>Matériel d'exploitation, outillage & agencements</span>
                  <span className="font-tabular font-mono text-[#1E084A]">{immobilized2.toLocaleString('fr-FR')}</span>
                </div>
              </div>

              {/* Actif Circulant */}
              <div>
                <div className="flex justify-between font-bold text-[#1E084A] border-b border-[#EDE9FE] pb-1.5">
                  <span>ACTIF CIRCULANT (Classes 3 & 4)</span>
                  <span className="font-tabular font-black">{(stocks3 + receivables4).toLocaleString('fr-FR')}</span>
                </div>
                <div className="pl-3 pt-1.5 space-y-1.5 text-[11px] text-[#7C709A]">
                  <div className="flex justify-between">
                    <span>Stocks de marchandises (Compte 31)</span>
                    <span className="font-tabular font-mono text-[#1E084A]">{stocks3.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Créances clients et comptes rattachés (Compte 41)</span>
                    <span className="font-tabular font-mono text-[#1E084A]">{receivables4.toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Tresorerie Actif */}
              <div>
                <div className="flex justify-between font-bold text-[#1E084A] border-b border-[#EDE9FE] pb-1.5">
                  <span>TRÉSORERIE - ACTIF (Classe 5)</span>
                  <span className="font-tabular font-black text-[#10B981]">{treasuryCashBank5.toLocaleString('fr-FR')}</span>
                </div>
                <div className="pl-3 pt-1.5 text-[11px] text-[#7C709A] flex justify-between">
                  <span>Banques, Mobile Money (OM, Wave) & Caisse</span>
                  <span className="font-tabular font-mono text-[#10B981] font-bold">{treasuryCashBank5.toLocaleString('fr-FR')}</span>
                </div>
              </div>

              {/* Total Actif */}
              <div className="pt-3 border-t-2 border-[#1E084A] flex justify-between font-extrabold text-sm text-[#1E084A]">
                <span className="uppercase">Total Général de l'Actif</span>
                <span className="font-tabular font-black text-[#10B981] text-base">{totalActif.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>

          {/* PASSIF */}
          <div className="bg-white border border-[#DDD6FE] rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-[#1E084A] text-white p-3.5 border-b border-[#3B1578] flex items-center justify-between">
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide">Bilan Passif</h4>
              <span className="text-[10px] font-mono text-[#A78BFA]">Capitaux & Dettes (FCFA)</span>
            </div>

            <div className="p-4 space-y-4 text-xs font-sans">
              {/* Capitaux Propres */}
              <div>
                <div className="flex justify-between font-bold text-[#1E084A] border-b border-[#EDE9FE] pb-1.5">
                  <span>CAPITAUX PROPRES & RESSOURCES (Classe 1)</span>
                  <span className="font-tabular font-black">{(capital1 + calculatedReserves + netProfit).toLocaleString('fr-FR')}</span>
                </div>
                <div className="pl-3 pt-1.5 space-y-1.5 text-[11px] text-[#7C709A]">
                  <div className="flex justify-between">
                    <span>Capital social (Compte 101)</span>
                    <span className="font-tabular font-mono text-[#1E084A]">{capital1.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Réserves et reports à nouveau</span>
                    <span className="font-tabular font-mono text-[#1E084A]">{calculatedReserves.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#10B981]">
                    <span>Résultat net de la période (bénéfice)</span>
                    <span className="font-tabular font-mono">+{netProfit.toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Passif Circulant */}
              <div>
                <div className="flex justify-between font-bold text-[#1E084A] border-b border-[#EDE9FE] pb-1.5">
                  <span>PASSIF CIRCULANT (Classe 4)</span>
                  <span className="font-tabular font-black">{debts4.toLocaleString('fr-FR')}</span>
                </div>
                <div className="pl-3 pt-1.5 text-[11px] text-[#7C709A] flex justify-between">
                  <span>Fournisseurs d'exploitation et dettes fiscales (Compte 40)</span>
                  <span className="font-tabular font-mono text-[#1E084A]">{debts4.toLocaleString('fr-FR')}</span>
                </div>
              </div>

              {/* Tresorerie Passif */}
              <div>
                <div className="flex justify-between font-bold text-[#1E084A] border-b border-[#EDE9FE] pb-1.5">
                  <span>TRÉSORERIE - PASSIF (Classe 5)</span>
                  <span className="font-tabular font-black">0</span>
                </div>
                <div className="pl-3 pt-1.5 text-[11px] text-[#7C709A] flex justify-between">
                  <span>Crédits d'escompte & découverts bancaires</span>
                  <span className="font-tabular font-mono text-[#1E084A]">0</span>
                </div>
              </div>

              {/* Total Passif */}
              <div className="pt-3 border-t-2 border-[#1E084A] flex justify-between font-extrabold text-sm text-[#1E084A]">
                <span className="uppercase">Total Général du Passif</span>
                <span className="font-tabular font-black text-[#10B981] text-base">{totalPassif.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPTE DE RESULTAT VIEW */}
      {activeTab === 'resultat' && (
        <div className="bg-white border border-[#DDD6FE] rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-[#1E084A] text-white p-4 border-b border-[#3B1578] flex items-center justify-between">
            <div>
              <h4 className="font-heading text-base font-bold">
                Compte de Résultat SYSCOHADA Révisé (Soldes Intermédiaires de Gestion)
              </h4>
              <p className="text-[10px] text-[#C4B5FD] mt-0.5">
                Formation du résultat d'exploitation et de la valeur ajoutée
              </p>
            </div>
            <span className="px-2.5 py-1 bg-[#2A0E68] border border-[#3B1578] text-[#A78BFA] text-xs font-mono font-bold rounded-lg">
              Norme OHADA
            </span>
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="w-full text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-[#DDD6FE] font-mono text-[11px] uppercase text-[#7C709A]">
                  <th className="py-2.5 text-left">Rubriques Comptables SYSCOHADA</th>
                  <th className="py-2.5 text-left">Postes & Comptes</th>
                  <th className="py-2.5 text-right">Montant (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE9FE]">
                <tr>
                  <td className="py-2.5 font-bold text-[#1E084A]">Ventes de marchandises</td>
                  <td className="py-2.5 text-[#7C709A] font-mono">Compte 701</td>
                  <td className="py-2.5 text-right font-tabular font-bold text-[#10B981]">
                    +{sales701.toLocaleString('fr-FR')}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 font-bold text-[#1E084A]">Achats de marchandises</td>
                  <td className="py-2.5 text-[#7C709A] font-mono">Compte 601</td>
                  <td className="py-2.5 text-right font-tabular font-bold text-[#EF4444]">
                    -{purchases601.toLocaleString('fr-FR')}
                  </td>
                </tr>

                {/* Marge Commerciale */}
                <tr className="bg-[#FAF8FF] font-bold">
                  <td className="py-2.5 uppercase text-[#1E084A]">= MARGE COMMERCIALE</td>
                  <td className="py-2.5 text-[#7C709A]">Ventes - Achats</td>
                  <td className="py-2.5 text-right font-tabular text-[#1E084A]">
                    {commercialMargin.toLocaleString('fr-FR')}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 font-bold text-[#1E084A]">Services extérieurs & autres charges</td>
                  <td className="py-2.5 text-[#7C709A] font-mono">Comptes 605, 62, 63</td>
                  <td className="py-2.5 text-right font-tabular font-bold text-[#EF4444]">
                    -{services605_62_63.toLocaleString('fr-FR')}
                  </td>
                </tr>

                {/* Valeur Ajoutee */}
                <tr className="bg-[#FAF8FF] font-bold">
                  <td className="py-2.5 uppercase text-[#1E084A]">= VALEUR AJOUTÉE (VA)</td>
                  <td className="py-2.5 text-[#7C709A]">Marge - Consommations externes</td>
                  <td className="py-2.5 text-right font-tabular text-[#10B981]">
                    {addedValue.toLocaleString('fr-FR')}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 font-bold text-[#1E084A]">Charges de personnel</td>
                  <td className="py-2.5 text-[#7C709A] font-mono">Compte 66</td>
                  <td className="py-2.5 text-right font-tabular font-bold text-[#EF4444]">
                    -{personnel66.toLocaleString('fr-FR')}
                  </td>
                </tr>

                {/* EBE */}
                <tr className="bg-[#FAF8FF] font-bold">
                  <td className="py-2.5 uppercase text-[#1E084A]">= EXCÉDENT BRUT D'EXPLOITATION (EBE)</td>
                  <td className="py-2.5 text-[#7C709A]">VA - Personnel</td>
                  <td className="py-2.5 text-right font-tabular text-[#10B981]">
                    {ebe.toLocaleString('fr-FR')}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 font-bold text-[#1E084A]">Dotations aux amortissements</td>
                  <td className="py-2.5 text-[#7C709A] font-mono">Compte 681</td>
                  <td className="py-2.5 text-right font-tabular font-bold text-[#EF4444]">
                    -{amort68.toLocaleString('fr-FR')}
                  </td>
                </tr>

                {/* Resultat Exploitation */}
                <tr className="bg-[#FAF8FF] font-bold">
                  <td className="py-2.5 uppercase text-[#1E084A]">= RÉSULTAT D'EXPLOITATION</td>
                  <td className="py-2.5 text-[#7C709A]">EBE - Amortissements</td>
                  <td className="py-2.5 text-right font-tabular text-[#1E084A]">
                    {operatingResult.toLocaleString('fr-FR')}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 font-bold text-[#1E084A]">Impôts sur les bénéfices (IS / IMF)</td>
                  <td className="py-2.5 text-[#7C709A] font-mono">Compte 89</td>
                  <td className="py-2.5 text-right font-tabular font-bold text-[#EF4444]">
                    -{corporateTax.toLocaleString('fr-FR')}
                  </td>
                </tr>

                {/* Resultat Net Final */}
                <tr className="bg-[#1E084A] text-white font-extrabold text-sm">
                  <td className="py-3.5 uppercase text-[#A78BFA]">= RÉSULTAT NET DE L'EXERCICE (BÉNÉFICE)</td>
                  <td className="py-3.5 text-[#C4B5FD] font-mono text-xs">Compte 131</td>
                  <td className="py-3.5 text-right font-tabular text-[#10B981] text-base">
                    +{netProfit.toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
