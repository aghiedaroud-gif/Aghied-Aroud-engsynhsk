import React from 'react';
import { BranchCode, UserRole } from '../types';
import { BRANCH_CONFIG } from '../data/branchConfig';
import { Building2, Shield, RefreshCw, DollarSign, Sparkles, Image as ImageIcon } from 'lucide-react';
import { BranchLogo } from './BranchLogo';

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
}

export const Header: React.FC<HeaderProps> = ({
  currentBranch,
  onBranchChange,
  currentRole,
  onRoleChange,
  exchangeRate,
  onExchangeRateChange,
  onOpenWorkspaceTools,
  onOpenAIAssistant,
  onOpenBranchLogos
}) => {
  const branchInfo = BRANCH_CONFIG[currentBranch];

  const roleLabels: Record<UserRole, { ar: string; badge: string }> = {
    accountant: { ar: 'محاسب الوحدة (Accountant)', badge: 'LVL_1_ACC' },
    archive_officer: { ar: 'مسؤول الأرشيف (Archive Officer)', badge: 'LVL_2_ARC' },
    branch_auditor: { ar: 'مدقق الفرع (Branch Auditor)', badge: 'LVL_3_AUD' },
    hub_auditor: { ar: 'مدقق مركزي عام (Hub Auditor)', badge: 'LVL_7_CHIEF' }
  };

  return (
    <header className="h-auto md:h-16 bg-[#0F0F0F] text-[#F0F0F0] border-b border-[#222] sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-2 md:py-0 flex items-center shadow-md">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Right/Brand side (RTL Start) with official circular seal */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onOpenBranchLogos}
            className="p-1 rounded bg-white hover:ring-2 hover:ring-[#00FFD1] transition flex items-center justify-center shrink-0 shadow"
            title="انقر لاستعراض الشعارات والأختام الرسمية للوحدات الثلاث (S.E.P.H)"
          >
            <BranchLogo branch={currentBranch} size="sm" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono tracking-widest text-[#00FFD1] uppercase">
                S.E.P.H // SYN-ACCT 2026
              </span>
              <span className="h-3 w-px bg-[#333]"></span>
              <h1 className="text-sm font-bold tracking-tight text-white">
                {branchInfo.header_title}
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-[#1A1A1A] text-[#00FFD1] border border-[#333]">
                {branchInfo.code}
              </span>
            </div>
            <p className="text-[11px] text-[#888] font-medium leading-none mt-0.5">
              {branchInfo.sub_kurdish}
            </p>
          </div>
        </div>

        {/* System telemetry & controls (RTL End) */}
        <div className="flex flex-wrap items-center gap-2.5 justify-start md:justify-end text-xs">
          
          {/* Branch Seals Inspector Button */}
          {onOpenBranchLogos && (
            <button
              onClick={onOpenBranchLogos}
              className="flex items-center gap-1.5 bg-[#151515] hover:bg-[#202020] text-[#00FFD1] border border-[#333] px-2.5 py-1 rounded text-xs font-mono transition"
              title="معاينة أختام وشعارات الوحدات الثلاث (Hasakah - Qamishlo - Derik)"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>BRANCH_SEALS</span>
            </button>
          )}

          {/* Exchange Rate Input */}
          <div className="flex items-center bg-[#151515] border border-[#222] rounded px-2.5 py-1 text-xs text-[#AAA]">
            <DollarSign className="w-3.5 h-3.5 text-[#00FFD1] ml-1" />
            <span className="ml-1 text-[10px] font-mono uppercase text-[#666]">FX_RATE:</span>
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => onExchangeRateChange(Number(e.target.value) || 14000)}
              className="w-20 bg-[#0A0A0A] text-[#00FFD1] font-mono font-bold border border-[#333] rounded px-1.5 py-0.5 text-center focus:outline-none focus:border-[#00FFD1]"
            />
            <span className="mr-1 text-[10px] font-mono text-[#666]">SYP</span>
          </div>

          {/* Branch Selector */}
          <div className="flex items-center bg-[#151515] border border-[#222] rounded px-2.5 py-1 text-xs">
            <Building2 className="w-3.5 h-3.5 text-[#00FFD1] ml-1.5" />
            <select
              id="branch-selector-dropdown"
              value={currentBranch}
              onChange={(e) => onBranchChange(e.target.value as BranchCode)}
              className="bg-transparent text-white font-mono font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="HAS" className="bg-[#151515] text-white">وحدة الحسكة (HAS)</option>
              <option value="QAM" className="bg-[#151515] text-white">وحدة القامشلي (QAM)</option>
              <option value="DER" className="bg-[#151515] text-white">وحدة ديريك (DER)</option>
            </select>
          </div>

          {/* SoD Role Selector */}
          <div className="flex items-center bg-[#151515] border border-[#222] rounded px-2.5 py-1 text-xs">
            <Shield className="w-3.5 h-3.5 text-[#FF4D00] ml-1.5" />
            <select
              id="sod-role-selector-dropdown"
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="accountant" className="bg-[#151515] text-white">محاسب الوحدة (Accountant)</option>
              <option value="archive_officer" className="bg-[#151515] text-white">مسؤول الأرشيف (Archive Officer)</option>
              <option value="branch_auditor" className="bg-[#151515] text-white">مدقق الفرع (Branch Auditor)</option>
              <option value="hub_auditor" className="bg-[#151515] text-white">مدقق مركزي عام (Hub Auditor)</option>
            </select>
          </div>

          {/* AI Assistant High-Contrast Button */}
          <button
            id="header-ai-auditor-btn"
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1.5 bg-[#00FFD1] text-black text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:brightness-90 transition shadow"
            title="المدقق الجنائي الذكي Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>AI AUDIT // GEMINI</span>
          </button>

          {/* Google Workspace & Sheets Sync */}
          <button
            id="header-workspace-sync-btn"
            onClick={onOpenWorkspaceTools}
            className="flex items-center gap-1 bg-[#1A1A1A] hover:bg-[#252525] text-white text-xs font-mono font-semibold px-2.5 py-1.5 rounded border border-[#333] transition"
            title="أدوات Google Workspace والمزامنة مع Google Sheets"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00FFD1]" />
            <span>SYNC_SHEETS</span>
          </button>

        </div>
      </div>
    </header>
  );
};

