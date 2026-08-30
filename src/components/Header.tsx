import React from 'react';
import { BranchCode, UserRole } from '../types';
import { BRANCH_CONFIG } from '../data/branchConfig';
import { Sparkles, Globe, Sun, Moon } from 'lucide-react';
import { BranchLogo } from './BranchLogo';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../utils/translations';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentBranch: BranchCode;
  onBranchChange: (branch: BranchCode) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  exchangeRate: number;
  onExchangeRateChange: (rate: number) => void;
  onOpenWorkspaceTools: () => void;
  onOpenAIAssistant: () => void;
  onOpenBranchLogos?: () => void;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentBranch,
  onOpenAIAssistant,
  onOpenBranchLogos
}) => {
  const branchInfo = BRANCH_CONFIG[currentBranch];
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const isLight = theme === 'light';

  return (
    <header className={`border-b sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors duration-200 liquid-glass ${
      isLight ? 'text-slate-900 border-slate-200/80 shadow-sm' : 'text-[#F0F0F0] border-[#222]/80 shadow-md'
    }`}>
      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand Side with Larger Branch Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenBranchLogos}
            className={`p-1.5 rounded-xl transition flex items-center justify-center shrink-0 shadow cursor-pointer ${
              isLight ? 'bg-slate-100 hover:ring-2 hover:ring-emerald-500' : 'bg-white hover:ring-2 hover:ring-[#00FFD1]'
            }`}
            title="انقر لاستعراض الشعارات والأختام الرسمية للوحدات الثلاث (S.E.P.H)"
          >
            <BranchLogo branch={currentBranch} size="lg" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded ${
                isLight ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-[#1A1A1A] text-[#00FFD1] border border-[#333]'
              }`}>
                S.E.P.H // 2026
              </span>
              <h1 className={`text-base sm:text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {branchInfo.header_title}
              </h1>
              <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                isLight ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-[#1A1A1A] text-[#00FFD1] border border-[#333]'
              }`}>
                {branchInfo.code}
              </span>
            </div>
            <p className={`text-xs font-medium mt-0.5 ${isLight ? 'text-slate-600' : 'text-[#888]'}`}>
              {branchInfo.sub_kurdish} • نظام المحاسبة والمالية الهندسية
            </p>
          </div>
        </div>

        {/* Clean Header Action Controls (Language, Theme & AI Auditor) */}
        <div className="flex items-center gap-3">
          
          {/* Trilingual Language Selector (Ar / Ku / En) */}
          <div className={`flex items-center rounded-lg border px-3 py-1.5 text-xs shadow-sm ${
            isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#151515] border-[#222] text-white'
          }`}>
            <Globe className="w-4 h-4 text-emerald-600 ml-2" />
            <select
              id="trilingual-language-selector"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="ar" className={isLight ? 'bg-white text-slate-900' : 'bg-[#151515] text-white'}>العربية (Arabic)</option>
              <option value="ku" className={isLight ? 'bg-white text-slate-900' : 'bg-[#151515] text-white'}>کورمانجی (Kurmangi - LTR)</option>
              <option value="en" className={isLight ? 'bg-white text-slate-900' : 'bg-[#151515] text-white'}>English (إنجليزي)</option>
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-xs transition cursor-pointer shadow-sm ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                : 'bg-[#181818] hover:bg-[#222] text-[#00FFD1] border-[#333]'
            }`}
            title="تبديل مظهر العرض (فاتح / داكن)"
          >
            {isLight ? (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">داكن</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">فاتح</span>
              </>
            )}
          </button>

          {/* AI Assistant High-Contrast Button */}
          <button
            id="header-ai-auditor-btn"
            onClick={onOpenAIAssistant}
            className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg transition shadow-md cursor-pointer ${
              isLight
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-[#00FFD1] text-black hover:brightness-90'
            }`}
            title="المدقق الجنائي الذكي Gemini AI"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI AUDIT // GEMINI</span>
          </button>

        </div>

      </div>
    </header>
  );
};
