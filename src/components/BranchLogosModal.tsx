import React, { useEffect } from 'react';
import { X, ShieldCheck, Check } from 'lucide-react';
import { BranchCode } from '../types';
import { BranchLogo } from './BranchLogo';
import { BRANCH_CONFIG } from '../data/branchConfig';

interface BranchLogosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBranch: BranchCode;
  onSelectBranch: (branch: BranchCode) => void;
}

export const BranchLogosModal: React.FC<BranchLogosModalProps> = ({
  isOpen,
  onClose,
  currentBranch,
  onSelectBranch
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const branches: BranchCode[] = ['HAS', 'QAM', 'DER'];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-[#151515] w-full max-w-4xl rounded-xl border border-[#333] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0A0A0A] px-6 py-4 border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#151515] border border-[#333] flex items-center justify-center text-[#00FFD1]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#00FFD1] uppercase tracking-wider">
                OFFICIAL_SEALS // S.E.P.H 2026
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                الشعارات والأختام الرسمية للوحدات الهندسية الثلاث (Official Branch Seals)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-white bg-[#222] hover:bg-[#333] p-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            title="إغلاق (Esc)"
          >
            <X className="w-4 h-4" />
            <span>إغلاق</span>
          </button>
        </div>

        {/* Seals Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b) => {
            const info = BRANCH_CONFIG[b];
            const isSelected = currentBranch === b;

            return (
              <div
                key={b}
                className={`bg-[#0A0A0A] rounded-xl border p-5 flex flex-col items-center text-center space-y-4 transition ${
                  isSelected
                    ? 'border-[#00FFD1] ring-1 ring-[#00FFD1]/50'
                    : 'border-[#222] hover:border-[#444]'
                }`}
              >
                {/* Badge */}
                <div className="w-full flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-[#00FFD1] bg-[#151515] px-2 py-0.5 rounded border border-[#333]">
                    NODE: {b}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-[#00FFD1] font-bold">
                      <Check className="w-3 h-3" /> ACTIVE
                    </span>
                  )}
                </div>

                {/* High Resolution Circular Seal Graphic */}
                <div className="p-2 bg-white rounded-full shadow-lg border border-slate-200">
                  <BranchLogo branch={b} size="2xl" />
                </div>

                {/* Branch Info */}
                <div className="space-y-1 w-full">
                  <h3 className="font-bold text-sm text-white">{info.name_ar}</h3>
                  <div className="text-[11px] text-[#888] font-mono">{info.sub_kurdish}</div>
                  <div className="text-[10px] text-[#666] font-mono pt-1">
                    {info.address} • {info.phone}
                  </div>
                </div>

                {/* Switch Action */}
                <button
                  onClick={() => {
                    onSelectBranch(b);
                  }}
                  className={`w-full py-2.5 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#00FFD1] text-black cursor-default'
                      : 'bg-[#151515] hover:bg-[#222] text-[#DDD] border border-[#333]'
                  }`}
                >
                  {isSelected ? 'الوحدة النشطة حالياً (CURRENT)' : `التبديل إلى ${info.name_ar}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Notes */}
        <div className="bg-[#0A0A0A] px-6 py-3.5 border-t border-[#222] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#777]">
          <span>S.E.P.H: Sendîkaya Endezyaran li parêzgeha Hesekê (نقابة المهندسين في محافظة الحسكة)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#222] hover:bg-[#333] text-white rounded-lg transition text-xs font-mono cursor-pointer"
          >
            إغلاق النافذة (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
