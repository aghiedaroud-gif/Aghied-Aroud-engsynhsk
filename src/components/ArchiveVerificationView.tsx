import React, { useState } from 'react';
import { UserRole, BranchCode } from '../types';
import { FolderLock, Stamp, FileCheck, AlertCircle } from 'lucide-react';

interface ArchiveVerificationViewProps {
  currentRole: UserRole;
  currentBranch: BranchCode;
  userName: string;
}

export const ArchiveVerificationView: React.FC<ArchiveVerificationViewProps> = ({
  currentRole,
  currentBranch,
  userName
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('ARC-HAS-2026-0001');
  const [verificationItems, setVerificationItems] = useState<Record<string, boolean>>({
    id_card: true,
    property_title: true,
    blueprint_sealed: true,
    schmidt_report: true,
    soils_test: true,
    tax_clearance: true
  });

  const isArchiveOfficer = currentRole === 'archive_officer' || currentRole === 'hub_auditor';

  const toggleItem = (key: string) => {
    if (!isArchiveOfficer) return;
    setVerificationItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allVerified = Object.values(verificationItems).every(v => v);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#151515] text-white p-5 rounded border border-[#222]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#0A0A0A] text-[#00FFD1] border border-[#333] flex items-center justify-center font-bold">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#00FFD1] uppercase tracking-widest">
                ARCHIVE_VAULT // SoD_CLEARANCE
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                نظام الأرشيف والتوثيق الورقي وفصل المهام (Archive & SoD Verification)
              </h2>
            </div>
          </div>
          <div className="bg-[#0A0A0A] px-3 py-1.5 rounded border border-[#333] text-xs font-mono font-bold text-[#00FFD1]">
            ROLE: {currentRole.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Archive Dossier Details */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#151515] rounded border border-[#222] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#00FFD1]" />
                <span>قائمة فحص المصنف الورقي (Checklist): <span className="font-mono text-[#00FFD1]">{selectedFolder}</span></span>
              </h3>
              <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                allVerified ? 'bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/30' : 'bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/30'
              }`}>
                {allVerified ? 'VERIFIED_COMPLETE' : 'IN_AUDIT'}
              </span>
            </div>

            {!isArchiveOfficer && (
              <div className="bg-[#0A0A0A] border border-[#FF4D00]/40 text-[#FF4D00] p-3 rounded text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>SoD_WARNING:</strong> You are logged in as ({currentRole}). Only Archive Officers or Hub Auditors can stamp physical dossiers.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { key: 'id_card', label: '1. صورة الهوية الشخصية لصاحب العلاقة', desc: 'مطابقة للاسم الثلاثي والرقم الوطني' },
                { key: 'property_title', label: '2. بيان القيد العقاري وسند الملكية (طابو أخضر)', desc: 'مختوم ومصدق أصولاً من السجل المؤقت أو الدائم' },
                { key: 'blueprint_sealed', label: '3. المخططات الهندسية السبعة الأصلية', desc: 'موقعة باليد الحية من مهندسي الدراسة والمدققين' },
                { key: 'schmidt_report', label: '4. تقرير فحص مطرقة شميدت والبيتون', desc: 'تقرير معتمد ومرفق بمنحنيات المعايرة' },
                { key: 'soils_test', label: '5. تقرير فحص التربة والجيوتكنيك', desc: 'مرفق بسبر الآبار الميدانية' },
                { key: 'tax_clearance', label: '6. براءة ذمة مالية ورسوم نقابية', desc: 'إشعار إيداع بنكي صادر من صندوق النقابة' }
              ].map(item => (
                <div 
                  key={item.key}
                  onClick={() => toggleItem(item.key)}
                  className={`p-3.5 rounded border text-xs cursor-pointer transition flex items-start gap-3 ${
                    verificationItems[item.key]
                      ? 'bg-[#0A0A0A] border-[#00FFD1]/40 text-white'
                      : 'bg-[#0A0A0A] border-[#222] text-[#777] hover:border-[#333]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={verificationItems[item.key] || false}
                    onChange={() => {}}
                    disabled={!isArchiveOfficer}
                    className="mt-0.5 w-4 h-4 accent-[#00FFD1] cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-white text-xs">{item.label}</div>
                    <div className="text-[11px] font-mono text-[#888] mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Archival Seal Button */}
            <div className="pt-4 border-t border-[#222] flex items-center justify-between">
              <div className="text-xs font-mono text-[#666]">
                OFFICER: <strong>{userName}</strong> ({currentBranch})
              </div>
              <button
                disabled={!isArchiveOfficer || !allVerified}
                className={`px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition ${
                  isArchiveOfficer && allVerified
                    ? 'bg-[#00FFD1] text-black hover:bg-[#00FFD1]/90'
                    : 'bg-[#222] text-[#555] cursor-not-allowed'
                }`}
              >
                <Stamp className="w-4 h-4" />
                <span>SEAL_PHYSICAL_DOSSIER</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Archived Folders Index */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#151515] rounded border border-[#222] p-4 space-y-3">
            <h3 className="font-mono text-xs font-bold text-[#888] uppercase border-b border-[#222] pb-2">
              PHYSICAL_VAULT_INDEX // خزينة المصنفات
            </h3>

            <div className="space-y-2">
              {[
                { id: 'ARC-HAS-2026-0001', name: 'دلال عبد الحكيم العلي', loc: 'الرف B-4 / الحسكة', status: 'مكتمل' },
                { id: 'ARC-QAM-2026-0002', name: 'كاوا احمد صالح', loc: 'الرف A-1 / القامشلي', status: 'مكتمل' },
                { id: 'ARC-DER-2026-0003', name: 'شيار مصطفى عمر', loc: 'الرف C-2 / ديريك', status: 'قيد المراجعة' },
                { id: 'ARC-HAS-2026-0004', name: 'جهاد عبد الله المحمود', loc: 'الرف B-5 / الحسكة', status: 'مكتمل' }
              ].map(folder => (
                <div 
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`p-2.5 rounded border text-xs cursor-pointer transition ${
                    selectedFolder === folder.id
                      ? 'bg-[#0A0A0A] border-[#00FFD1] text-white font-bold'
                      : 'bg-[#0A0A0A] border-[#222] text-[#888] hover:border-[#333]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[11px] text-[#00FFD1]">{folder.id}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      folder.status === 'مكتمل' ? 'bg-[#00FFD1]/10 text-[#00FFD1]' : 'bg-[#FF4D00]/10 text-[#FF4D00]'
                    }`}>
                      {folder.status === 'مكتمل' ? 'VERIFIED' : 'REVIEW'}
                    </span>
                  </div>
                  <div className="text-xs text-white mt-1">{folder.name}</div>
                  <div className="text-[10px] font-mono text-[#666] mt-0.5">{folder.loc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
