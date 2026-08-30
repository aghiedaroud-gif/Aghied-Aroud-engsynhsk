import React from 'react';
import { BranchCode, UserRole } from '../types';
import { BRANCH_CONFIG } from '../data/branchConfig';
import { Building2, Shield, DollarSign, Image as ImageIcon, Wifi, WifiOff, RefreshCw, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  currentBranch: BranchCode;
  onBranchChange: (branch: BranchCode) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  exchangeRate: number;
  onExchangeRateChange: (rate: number) => void;
  onOpenWorkspaceTools: () => void;
  onOpenBranchLogos?: () => void;
  isOnline?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  currentBranch,
  onBranchChange,
  currentRole,
  onRoleChange,
  exchangeRate,
  onExchangeRateChange,
  onOpenWorkspaceTools,
  onOpenBranchLogos,
  isOnline = true
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const branchInfo = BRANCH_CONFIG[currentBranch];

  const isLight = theme === 'light';

  return (
    <footer className={`border-t py-4 px-4 sm:px-6 lg:px-8 mt-12 transition-colors duration-200 ${
      isLight ? 'bg-white text-slate-700 border-slate-200 shadow-inner' : 'bg-[#0F0F0F] text-slate-300 border-[#222]'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left / Copyright & System Info */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="font-mono font-bold tracking-tight">
              S.E.P.H // SYN-ACCT 2026
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">نقابة المهندسين في سورية - فرع الجزيرة</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Branch: {branchInfo.code}</span>
            <span>•</span>
            <span>{isOnline ? 'Online Synced' : 'Offline Mode'}</span>
          </div>
        </div>

        {/* Right / Secondary Controls (Moved from Header for clean uncluttered layout) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs">
          
          {/* Theme Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                : 'bg-[#181818] hover:bg-[#222] text-[#00FFD1] border-[#333]'
            }`}
            title="تبديل مظهر العرض (فاتح / داكن)"
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>الوضع الداكن (Dark)</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>الوضع الفاتح (Light)</span>
              </>
            )}
          </button>

          {/* Branch Seals Inspector Button */}
          {onOpenBranchLogos && (
            <button
              onClick={onOpenBranchLogos}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono transition cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                  : 'bg-[#151515] hover:bg-[#202020] text-[#00FFD1] border-[#333]'
              }`}
              title="معاينة أختام وشعارات الوحدات الثلاث (Hasakah - Qamishlo - Derik)"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>BRANCH_SEALS</span>
            </button>
          )}

          {/* Exchange Rate Input */}
          <div className={`flex items-center rounded-lg border px-2.5 py-1 ${
            isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#151515] border-[#222] text-slate-300'
          }`}>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 ml-1" />
            <span className="ml-1 text-[10px] font-mono uppercase text-slate-400">FX_RATE:</span>
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => onExchangeRateChange(Number(e.target.value) || 14000)}
              className={`w-20 font-mono font-bold rounded px-1.5 py-0.5 text-center focus:outline-none ${
                isLight ? 'bg-white text-slate-900 border border-slate-300 focus:border-emerald-500' : 'bg-[#0A0A0A] text-[#00FFD1] border border-[#333]'
              }`}
            />
            <span className="mr-1 text-[10px] font-mono text-slate-400">SYP</span>
          </div>

          {/* Branch Selector */}
          <div className={`flex items-center rounded-lg border px-2.5 py-1 ${
            isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#151515] border-[#222] text-white'
          }`}>
            <Building2 className="w-3.5 h-3.5 text-blue-600 ml-1.5" />
            <select
              id="footer-branch-selector"
              value={currentBranch}
              onChange={(e) => onBranchChange(e.target.value as BranchCode)}
              className="bg-transparent font-mono font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="HAS">وحدة الحسكة (HAS)</option>
              <option value="QAM">وحدة القامشلي (QAM)</option>
              <option value="DER">وحدة ديريك (DER)</option>
            </select>
          </div>

          {/* SoD Role Selector */}
          <div className={`flex items-center rounded-lg border px-2.5 py-1 ${
            isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#151515] border-[#222] text-white'
          }`}>
            <Shield className="w-3.5 h-3.5 text-amber-600 ml-1.5" />
            <select
              id="footer-role-selector"
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="accountant">محاسب الوحدة (Accountant)</option>
              <option value="archive_officer">مسؤول الأرشيف (Archive Officer)</option>
              <option value="branch_auditor">مدقق الفرع (Branch Auditor)</option>
              <option value="hub_auditor">مدقق مركزي عام (Hub Auditor)</option>
            </select>
          </div>

          {/* Google Workspace & Sheets Sync */}
          <button
            id="footer-workspace-sync-btn"
            onClick={onOpenWorkspaceTools}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono font-semibold transition cursor-pointer ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                : 'bg-[#1A1A1A] hover:bg-[#252525] text-white border-[#333]'
            }`}
            title="أدوات Google Workspace والمزامنة مع Google Sheets"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>SYNC_SHEETS</span>
          </button>

          {/* Offline / Online Status Indicator */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono border text-[10px] font-bold ${
              isOnline 
                ? (isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-[#151515] border-[#222] text-[#00FFD1]')
                : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>ONLINE // CACHED</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>OFFLINE</span>
              </>
            )}
          </div>

        </div>

      </div>
    </footer>
  );
};
