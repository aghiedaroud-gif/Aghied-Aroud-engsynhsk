import React from 'react';
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
  Tags
} from 'lucide-react';
import { UserRole } from '../types';

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
  const tabs = [
    { id: 'gs' as NavTabId, code: '01', label: 'الدراسة العامة (GS)', icon: FileSpreadsheet, badge: 'رئيسي' },
    { id: 'sc' as NavTabId, code: '02', label: 'عقد الإشراف (SC)', icon: HardHat, badge: 'USD' },
    { id: 'bs' as NavTabId, code: '03', label: 'دراسة البياني (BS)', icon: Compass, badge: '50م²' },
    { id: 'co' as NavTabId, code: '04', label: 'السلامة الإنشائية (CO)', icon: ShieldCheck, badge: 'LAB' },
    { id: 'express_q' as NavTabId, code: '05', label: 'حاسبة Express_q', icon: Zap, badge: 'QUICK' },
    { id: 'categories' as NavTabId, code: '06', label: 'تصنيف المشاريع والتقارير', icon: Tags, badge: `${categoriesCount || 7} فئات` },
    { id: 'databases' as NavTabId, code: '07', label: 'دفتر الأستاذ والسجلات', icon: Database, count: invoicesCount },
    { id: 'engineers' as NavTabId, code: '08', label: 'سجل المهندسين (74)', icon: Users, badge: 'CAP' },
    { id: 'archive' as NavTabId, code: '09', label: 'الأرشيف والتوثيق', icon: FolderLock, restrictedTo: ['archive_officer', 'hub_auditor'] },
    { id: 'ai_audit' as NavTabId, code: 'AI', label: 'المدقق الذكي Gemini', icon: Sparkles, highlight: true }
  ];

  return (
    <nav className="bg-[#0F0F0F] border-b border-[#222] sticky top-[57px] md:top-[64px] z-30 overflow-x-auto shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 space-x-reverse min-w-max py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isRestricted = tab.restrictedTo && !tab.restrictedTo.includes(userRole);

            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white border-b-2 border-[#00FFD1] shadow-inner'
                    : 'text-[#888] hover:bg-[#151515] hover:text-[#F0F0F0] border-b-2 border-transparent'
                } ${tab.highlight ? 'bg-[#151515] text-[#00FFD1] border border-[#00FFD1]/30 hover:border-[#00FFD1]' : ''}`}
              >
                <span className="text-[10px] font-mono text-[#666]">{tab.code}</span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00FFD1]' : tab.highlight ? 'text-[#00FFD1]' : 'text-[#666]'}`} />
                <span className="tracking-tight">{tab.label}</span>

                {tab.badge && (
                  <span className={`px-1.5 py-0.2 text-[9px] font-mono uppercase rounded ${
                    isActive ? 'bg-[#00FFD1] text-black font-bold' : 'bg-[#222] text-[#AAA]'
                  }`}>
                    {tab.badge}
                  </span>
                )}

                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-mono rounded font-bold ${
                    isActive ? 'bg-[#FF4D00] text-white' : 'bg-[#222] text-[#00FFD1]'
                  }`}>
                    {tab.count}
                  </span>
                )}

                {isRestricted && (
                  <span className="text-[9px] font-mono text-[#FF4D00]">(SoD)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

