import React from 'react';
import { BrandLogo } from './BrandLogo';
import { ClientDossier } from '../types';
import { useTheme } from '../context/ThemeContext';
import { 
  Building2, 
  Store, 
  ShieldCheck, 
  ChevronDown, 
  Check, 
  FileSpreadsheet,
  Sun,
  Moon,
  Bell,
  Settings,
  Plus
} from 'lucide-react';

interface HeaderProps {
  currentMode: 'simplified' | 'expert';
  onModeChange: (mode: 'simplified' | 'expert') => void;
  dossiers: ClientDossier[];
  activeDossier: ClientDossier;
  onSelectDossier: (dossier: ClientDossier) => void;
  pendingValidationCount: number;
  anomalyCount: number;
  onOpenExcelImport?: () => void;
  unreadNotificationCount?: number;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  dossiers,
  activeDossier,
  onSelectDossier,
  pendingValidationCount,
  anomalyCount,
  onOpenExcelImport,
  unreadNotificationCount = 0,
  onOpenNotifications,
  onOpenSettings
}) => {
  const [dossierMenuOpen, setDossierMenuOpen] = React.useState(false);
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <header className="w-full bg-white/95 dark:bg-[#120726]/95 backdrop-blur-md border-b border-[#EDE9FE] dark:border-[#2C184D] px-4 lg:px-8 py-3 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Brand Logo + Mobile Controls */}
        <div className="flex items-center justify-between">
          <BrandLogo variant="full" />
          
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-lg border border-[#DDD6FE] dark:border-[#35225E] bg-[#F5F3FF] dark:bg-[#1C0F38] text-[#7024E3] dark:text-[#C4B5FD] transition-all"
              title="Centre de notifications"
              aria-label="Centre de notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#E11D48] text-white text-[9px] font-black rounded-full flex items-center justify-center font-mono">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Mobile Settings Button */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg border border-[#DDD6FE] dark:border-[#35225E] bg-[#F5F3FF] dark:bg-[#1C0F38] text-[#7024E3] dark:text-[#C4B5FD]"
                title="Paramètres & Gestion des projets"
                aria-label="Paramètres"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Dark Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-[#DDD6FE] dark:border-[#35225E] bg-[#F5F3FF] dark:bg-[#1C0F38] text-[#7024E3] dark:text-[#C4B5FD]"
              title={isDark ? "Mode clair" : "Mode sombre"}
              aria-label="Basculer le thème"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#FBBF24]" /> : <Moon className="w-4 h-4 text-[#7024E3]" />}
            </button>

            {/* Mobile Mode Switcher */}
            <div className="flex items-center bg-[#F5F3FF] dark:bg-[#1C0F38] p-1 rounded-xl border border-[#DDD6FE] dark:border-[#35225E]">
              <button
                onClick={() => onModeChange('simplified')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentMode === 'simplified'
                    ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs'
                    : 'text-[#534674] dark:text-[#A594C9]'
                }`}
              >
                Commerçant
              </button>
              <button
                onClick={() => onModeChange('expert')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentMode === 'expert'
                    ? 'bg-[#1E084A] dark:bg-[#2A1054] text-white shadow-xs'
                    : 'text-[#534674] dark:text-[#A594C9]'
                }`}
              >
                Cabinet
              </button>
            </div>
          </div>
        </div>

        {/* Center: Desktop Dual Persona Switcher */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#F5F3FF] dark:bg-[#1C0F38] p-1.5 rounded-xl border border-[#DDD6FE] dark:border-[#35225E]">
          <button
            onClick={() => onModeChange('simplified')}
            className={`flex items-center gap-2 px-4 py-2 text-xs lg:text-sm font-bold rounded-lg transition-all ${
              currentMode === 'simplified'
                ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-sm'
                : 'text-[#534674] dark:text-[#C4B5FD] hover:text-[#1E084A] dark:hover:text-white hover:bg-[#EDE9FE] dark:hover:bg-[#2A174E]'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Mode Entrepreneur (Simplifié)</span>
          </button>

          <button
            onClick={() => onModeChange('expert')}
            className={`flex items-center gap-2 px-4 py-2 text-xs lg:text-sm font-bold rounded-lg transition-all relative ${
              currentMode === 'expert'
                ? 'bg-[#1E084A] dark:bg-[#2A1054] text-white shadow-sm'
                : 'text-[#534674] dark:text-[#C4B5FD] hover:text-[#1E084A] dark:hover:text-white hover:bg-[#EDE9FE] dark:hover:bg-[#2A174E]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Mode Cabinet (Expert)</span>
            {(pendingValidationCount > 0 || anomalyCount > 0) && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-[#F59E0B] text-white rounded-full shadow-xs">
                {pendingValidationCount + anomalyCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Client Dossier Selector + Excel Import + Dark Mode Toggle + Notifications + AI Status */}
        <div className="flex items-center gap-2.5">
          {/* Notification Bell Button Desktop */}
          <button
            onClick={onOpenNotifications}
            className="relative flex items-center gap-2 p-2.5 rounded-xl border border-[#DDD6FE] dark:border-[#35225E] bg-[#F5F3FF] dark:bg-[#1C0F38] text-[#7024E3] dark:text-[#C4B5FD] hover:bg-[#EDE9FE] dark:hover:bg-[#2A174E] transition-all shadow-2xs hover:scale-105"
            title="Centre de notifications et alertes sonores"
            aria-label="Centre de notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#E11D48] text-white text-[10px] font-black rounded-full flex items-center justify-center font-mono shadow-xs animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
            <span className="text-[11px] font-bold hidden 2xl:inline">
              Alertes
            </span>
          </button>

          {/* Settings Button Desktop */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 p-2.5 rounded-xl border border-[#DDD6FE] dark:border-[#35225E] bg-[#F5F3FF] dark:bg-[#1C0F38] text-[#7024E3] dark:text-[#C4B5FD] hover:bg-[#EDE9FE] dark:hover:bg-[#2A174E] transition-all shadow-2xs hover:scale-105"
              title="Paramètres de la plateforme & Gestion des projets"
              aria-label="Paramètres"
            >
              <Settings className="w-4 h-4" />
              <span className="text-[11px] font-bold hidden xl:inline">
                Paramètres
              </span>
            </button>
          )}

          {/* Dark Mode Toggle Desktop */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-[#DDD6FE] dark:border-[#35225E] bg-[#F5F3FF] dark:bg-[#1C0F38] text-[#7024E3] dark:text-[#C4B5FD] hover:bg-[#EDE9FE] dark:hover:bg-[#2A174E] transition-all shadow-2xs hover:scale-105"
            title={isDark ? "Passer en mode clair (jour)" : "Passer en mode sombre (confort visuel de nuit)"}
            aria-label="Basculer le thème"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#FBBF24] transition-transform animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-[#7024E3] transition-transform" />
            )}
            <span className="text-[11px] font-bold hidden xl:inline">
              {isDark ? 'Mode Nuit' : 'Mode Jour'}
            </span>
          </button>

          {/* Excel Import Quick Action Button */}
          {onOpenExcelImport && (
            <button
              onClick={onOpenExcelImport}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
              title="Importer un document Excel (.xlsx, .xls, .csv)"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Importer Excel</span>
            </button>
          )}

          {/* Dossier Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDossierMenuOpen(!dossierMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-[#180D33] hover:bg-[#FAF8FF] dark:hover:bg-[#221345] border border-[#DDD6FE] dark:border-[#35225E] hover:border-[#7024E3] rounded-xl text-left transition-all shadow-2xs"
            >
              <div className="flex flex-col">
                <span className="text-[9.5px] uppercase tracking-wider text-[#7C709A] dark:text-[#A78BFA] font-bold">
                  Dossier en cours
                </span>
                <span className="text-xs font-bold text-[#1E084A] dark:text-[#F3EFFF] truncate max-w-[140px] lg:max-w-[170px]">
                  {activeDossier.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7024E3] dark:text-[#A78BFA] shrink-0" />
            </button>

            {dossierMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-[#180D33] border border-[#DDD6FE] dark:border-[#35225E] shadow-xl z-50 rounded-xl py-1 overflow-hidden">
                <div className="px-3.5 py-2 border-b border-[#EDE9FE] dark:border-[#2D1A54] bg-[#F8F7FD] dark:bg-[#140A28]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7024E3] dark:text-[#C4B5FD]">
                    Portefeuille Cabinet KM Consulting
                  </span>
                </div>
                {dossiers.map(d => {
                  const isSelected = d.id === activeDossier.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectDossier(d);
                        setDossierMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex flex-col border-b border-[#F5F3FF] dark:border-[#231444] hover:bg-[#F5F3FF] dark:hover:bg-[#231444] transition-colors ${
                        isSelected ? 'bg-[#EDE9FE]/50 dark:bg-[#2D1855] font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1E084A] dark:text-[#F3EFFF] flex items-center gap-1.5">
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#7024E3] dark:text-[#A78BFA]" />}
                          {d.name}
                        </span>
                        <span className="text-[10px] text-[#7024E3] dark:text-[#A78BFA] font-mono font-bold bg-[#EDE9FE] dark:bg-[#2A164F] px-1.5 py-0.5 rounded">
                          {d.country}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#534674] dark:text-[#A594C9] truncate mt-0.5">{d.activity}</span>
                      <span className="text-[9px] text-[#7C709A] dark:text-[#8E7BB8] font-mono mt-0.5">RCCM: {d.rccm}</span>
                    </button>
                  );
                })}

                {/* Manage Dossiers / Settings Quick Action */}
                {onOpenSettings && (
                  <div className="p-2 border-t border-[#EDE9FE] dark:border-[#2D1A54] bg-[#FAF8FF] dark:bg-[#180C30]">
                    <button
                      onClick={() => {
                        setDossierMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full py-2 px-3 bg-[#7024E3] hover:bg-[#5B18C4] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Gérer ou Créer un projet...</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Syscohada Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F3FF] dark:bg-[#1C0F38] border border-[#DDD6FE] dark:border-[#35225E] rounded-xl text-[11px] text-[#7024E3] dark:text-[#C4B5FD] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#7024E3] dark:text-[#A78BFA]" />
            <span>SYSCOHADA v2026</span>
          </div>
        </div>
      </div>
    </header>
  );
};
