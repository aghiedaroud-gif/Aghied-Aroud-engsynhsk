import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  HardHat, 
  Compass, 
  ShieldCheck, 
  Zap, 
  Database, 
  Users, 
  FolderLock, 
  Sparkles,
  Tags,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export type NavTabId = 
  | 'gs' 
  | 'sc' 
  | 'bs' 
  | 'co' 
  | 'express_q' 
  | 'categories'
  | 'databases' 
  | 'engineers' 
  | 'archive' 
  | 'ai_audit';

interface NavigationProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  userRole: UserRole;
  invoicesCount: number;
  categoriesCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  userRole,
  invoicesCount,
  categoriesCount
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const tabs = [
    { id: 'gs' as NavTabId, code: '01', label: t('nav.gs'), icon: FileSpreadsheet, badge: 'رئيسي' },
    { id: 'sc' as NavTabId, code: '02', label: t('nav.sc'), icon: HardHat, badge: 'USD' },
    { id: 'bs' as NavTabId, code: '03', label: t('nav.bs'), icon: Compass, badge: '50م²' },
    { id: 'co' as NavTabId, code: '04', label: t('nav.co'), icon: ShieldCheck, badge: 'LAB' },
    { id: 'express_q' as NavTabId, code: '05', label: t('nav.express_q'), icon: Zap, badge: 'QUICK' },
    { id: 'categories' as NavTabId, code: '06', label: t('nav.categories'), icon: Tags, badge: `${categoriesCount || 7}` },
    { id: 'databases' as NavTabId, code: '07', label: t('nav.databases'), icon: Database, count: invoicesCount },
    { id: 'engineers' as NavTabId, code: '08', label: t('nav.engineers'), icon: Users, badge: '74' },
    { id: 'archive' as NavTabId, code: '09', label: t('nav.archive'), icon: FolderLock, restrictedTo: ['archive_officer', 'hub_auditor'] },
    { id: 'ai_audit' as NavTabId, code: 'AI', label: t('nav.ai_audit'), icon: Sparkles, highlight: true }
  ];

  const currentActiveTabObj = tabs.find(tObj => tObj.id === activeTab) || tabs[0];
  const CurrentIcon = currentActiveTabObj.icon;

  const handleSelectTab = (tabId: NavTabId) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`border-b sticky top-[57px] md:top-[64px] z-30 transition-colors duration-200 ${
      isLight ? 'bg-white text-slate-800 border-slate-200 shadow-sm' : 'bg-[#0F0F0F] text-slate-200 border-[#222] shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Viewport: Collapsible Compact Bar with Hamburger Toggle */}
        <div className="md:hidden py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Active Tab Preview Button (Tapping also toggles dropdown) */}
            <button
              id="mobile-nav-current-tab-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg border text-right transition cursor-pointer ${
                isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#151515] hover:bg-[#1A1A1A] border-[#2B2B2B] text-white'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-[#0A0A0A] border-[#00FFD1]/30 text-[#00FFD1]'
              }`}>
                <CurrentIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-[#00FFD1]'}`}>{currentActiveTabObj.code}</span>
                  <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentActiveTabObj.label}</span>
                </div>
                <div className={`text-[9px] font-mono ${isLight ? 'text-slate-500' : 'text-[#777]'}`}>القسم النشط حالياً • انقر للتنقل</div>
              </div>
              {currentActiveTabObj.badge && (
                <span className={`px-1.5 py-0.5 text-[9px] font-mono uppercase rounded font-bold shrink-0 ${
                  isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-[#00FFD1] text-black'
                }`}>
                  {currentActiveTabObj.badge}
                </span>
              )}
            </button>

            {/* Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-[#151515] hover:bg-[#202020] text-[#00FFD1] border-[#333]'
              }`}
              title="القائمة الكاملة"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className={`mt-2 py-2 rounded-xl border shadow-xl space-y-1 ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#121212] border-[#2B2B2B]'
            }`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition cursor-pointer ${
                      isActive
                        ? isLight 
                          ? 'bg-emerald-50 text-emerald-800 font-bold border-r-4 border-emerald-600' 
                          : 'bg-[#00FFD1]/15 text-[#00FFD1] font-bold border-r-2 border-[#00FFD1]'
                        : isLight 
                        ? 'text-slate-700 hover:bg-slate-100' 
                        : 'text-slate-300 hover:bg-[#1A1A1A] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`font-mono text-[10px] w-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{tab.code}</span>
                      <Icon className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-[#00FFD1]'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                        isLight ? 'bg-slate-200 text-slate-800' : 'bg-[#222] text-[#00FFD1]'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Viewport: Horizontal Navigation Bar */}
        <div className="hidden md:flex items-center justify-between overflow-x-auto py-2.5 scrollbar-none">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isAi = tab.highlight;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? isAi 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-sm'
                        : isLight 
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 shadow-sm' 
                        : 'bg-[#181818] text-[#00FFD1] font-bold border border-[#333] shadow-sm'
                      : isAi
                      ? isLight ? 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200' : 'bg-purple-950/30 text-purple-300 hover:bg-purple-900/40 border border-purple-900/40'
                      : isLight 
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                      : 'text-slate-400 hover:text-white hover:bg-[#151515]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${
                    isActive 
                      ? (isAi ? 'text-white' : isLight ? 'text-emerald-700' : 'text-[#00FFD1]') 
                      : (isAi ? 'text-purple-600' : isLight ? 'text-slate-500' : 'text-slate-400')
                  }`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                      isLight ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-black/60 text-[#00FFD1]'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && tab.count === undefined && (
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] uppercase font-bold ${
                      isActive 
                        ? (isLight ? 'bg-emerald-200 text-emerald-900' : 'bg-[#00FFD1]/20 text-[#00FFD1]') 
                        : (isLight ? 'bg-slate-100 text-slate-600' : 'bg-black/40 text-slate-400')
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </nav>
  );
};
