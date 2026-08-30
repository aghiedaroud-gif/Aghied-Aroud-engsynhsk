import React, { useState } from 'react';
import { UserRole, BranchCode } from '../types';
import { FolderLock, Stamp, FileCheck, AlertCircle, QrCode, Scan, CheckCircle2, ShieldCheck, RefreshCw, FileText, ArrowRight } from 'lucide-react';
import { DocumentQRCode } from './DocumentQRCode';

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

  // QR Scanning and Verification State
  const [scannedDocId, setScannedDocId] = useState<string>('INV-HAS-2026-0001');
  const [scannedDocType, setScannedDocType] = useState<'INV' | 'EPO' | 'SFD'>('INV');
  const [scannedAmount, setScannedAmount] = useState<number>(1250000);
  const [scannedCurrency, setScannedCurrency] = useState<string>('ل.س');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    verified: boolean;
    timestamp: string;
    docId: string;
    amount: number;
    currency: string;
    type: string;
    message: string;
  } | null>({
    verified: true,
    timestamp: new Date().toLocaleTimeString('ar-SY'),
    docId: 'INV-HAS-2026-0001',
    amount: 1250000,
    currency: 'ل.س',
    type: 'فاتورة رسمية معتمدة (Official Invoice)',
    message: 'تمت مطابقة المعرف الفريد والمبلغ الإجمالي مع السجل الأرشيفي بنجاح'
  });

  const isArchiveOfficer = currentRole === 'archive_officer' || currentRole === 'hub_auditor';

  const toggleItem = (key: string) => {
    if (!isArchiveOfficer) return;
    setVerificationItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSimulateScan = (docId: string, type: 'INV' | 'EPO' | 'SFD', amount: number, currency = 'ل.س') => {
    setIsScanning(true);
    setScannedDocId(docId);
    setScannedDocType(type);
    setScannedAmount(amount);
    setScannedCurrency(currency);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        verified: true,
        timestamp: new Date().toLocaleTimeString('ar-SY'),
        docId,
        amount,
        currency,
        type: type === 'INV' ? 'فاتورة أتعاب ورسوم دراسة (Invoice)' : type === 'EPO' ? 'أمر صرف مستحقات مهندسين (Pay Order)' : 'إشعار إيداع نقابي (Deposit Notice)',
        message: `تم التحقق من الرمز المشفر QR: المعرف [${docId}] والمبلغ الإجمالي [${amount.toLocaleString()} ${currency}] متطابقان أصولاً مع الإضبارة الورقية.`
      });

      // Automatically satisfy tax clearance and blueprint checks on successful QR scan
      setVerificationItems(prev => ({
        ...prev,
        tax_clearance: true,
        blueprint_sealed: true
      }));
    }, 600);
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
                ARCHIVE_VAULT // SoD_CLEARANCE & QR_VERIFICATION
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                نظام الأرشيف والتوثيق الورقي والتحقق بالرمز المشفر QR
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#0A0A0A] px-3 py-1.5 rounded border border-[#333] text-xs font-mono font-bold text-[#00FFD1]">
              ROLE: {currentRole.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Archive Verification Terminal (New Feature) */}
      <div className="bg-[#151515] rounded-xl border border-[#222] p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                ماسح ومولد الرمز المشفر (QR Code Document & Archive Decoder)
              </h3>
              <p className="text-[11px] text-slate-400">
                تشفير المعرف الفريد (ID) والمبلغ الإجمالي لتسهيل المطابقة مع المصنفات الورقية وفواتير وأوامر الصرف
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#00FFD1]">
            <ShieldCheck className="w-4 h-4" />
            <span>ENCODED_SHA256_ACTIVE</span>
          </div>
        </div>

        {/* Scanner & Quick Samples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Live QR Generator Box */}
          <div className="md:col-span-4 bg-[#0A0A0A] p-4 rounded-lg border border-[#2A2A2A] flex flex-col items-center justify-center text-center space-y-3 relative group">
            <div className="text-[11px] font-mono font-bold text-[#888] uppercase">
              LIVE_QR_PAYLOAD // الرمز الرسمي الصادر
            </div>
            
            <div className="bg-white p-2 rounded-lg shadow-inner">
              <DocumentQRCode
                documentId={scannedDocId}
                documentType={scannedDocType}
                totalAmount={scannedAmount}
                currency={scannedCurrency}
                branch={currentBranch}
                size={120}
                showCaption={false}
              />
            </div>

            <div className="w-full space-y-1 text-center font-mono">
              <div className="text-xs font-bold text-[#00FFD1]">{scannedDocId}</div>
              <div className="text-xs text-amber-400 font-extrabold" dir="ltr">
                {scannedAmount.toLocaleString()} {scannedCurrency}
              </div>
              <div className="text-[10px] text-[#666]">
                {scannedDocType === 'INV' ? 'فاتورة أتعاب ورسوم دراسة' : scannedDocType === 'EPO' ? 'أمر صرف مستحقات مهندسين' : 'إشعار إيداع نقابي'}
              </div>
            </div>
          </div>

          {/* Quick Select & Scanner Actions */}
          <div className="md:col-span-8 space-y-3">
            <div className="text-xs font-bold text-slate-300">
              اختبر مسح وتحقق الوثائق الرسمية الصادرة (Invoices & Pay Orders):
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleSimulateScan('INV-HAS-2026-0001', 'INV', 1250000, 'ل.س')}
                className={`p-2.5 rounded border text-right transition flex flex-col justify-between ${
                  scannedDocId === 'INV-HAS-2026-0001'
                    ? 'bg-[#00FFD1]/10 border-[#00FFD1] text-white'
                    : 'bg-[#0A0A0A] border-[#2A2A2A] text-slate-400 hover:border-[#444]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-[11px] text-[#00FFD1] font-bold">INV-HAS-0001</span>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-white mt-1">فاتورة دراسة كاملة</div>
                <div className="text-[11px] font-mono text-amber-400 font-bold" dir="ltr">1,250,000 ل.س</div>
              </button>

              <button
                onClick={() => handleSimulateScan('EPO-HAS-2026-0001', 'EPO', 485000, 'ل.س')}
                className={`p-2.5 rounded border text-right transition flex flex-col justify-between ${
                  scannedDocId === 'EPO-HAS-2026-0001'
                    ? 'bg-[#00FFD1]/10 border-[#00FFD1] text-white'
                    : 'bg-[#0A0A0A] border-[#2A2A2A] text-slate-400 hover:border-[#444]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-[11px] text-blue-400 font-bold">EPO-HAS-0001</span>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-white mt-1">أمر صرف مستحقات</div>
                <div className="text-[11px] font-mono text-red-400 font-bold" dir="ltr">485,000 ل.س</div>
              </button>

              <button
                onClick={() => handleSimulateScan('INV-QAM-2026-0012', 'INV', 3400000, 'ل.س')}
                className={`p-2.5 rounded border text-right transition flex flex-col justify-between ${
                  scannedDocId === 'INV-QAM-2026-0012'
                    ? 'bg-[#00FFD1]/10 border-[#00FFD1] text-white'
                    : 'bg-[#0A0A0A] border-[#2A2A2A] text-slate-400 hover:border-[#444]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-[11px] text-[#00FFD1] font-bold">INV-QAM-0012</span>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-white mt-1">فاتورة مجمع سكني</div>
                <div className="text-[11px] font-mono text-amber-400 font-bold" dir="ltr">3,400,000 ل.س</div>
              </button>
            </div>

            {/* Custom Input for physical scanner */}
            <div className="bg-[#0A0A0A] p-3 rounded-lg border border-[#222] flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                placeholder="أدخل معرّف الفاتورة أو امسح الباركود يدوياً (e.g., INV-HAS-2026-0005)"
                value={scannedDocId}
                onChange={(e) => setScannedDocId(e.target.value)}
                className="w-full bg-[#151515] text-white font-mono text-xs px-3 py-2 rounded border border-[#333] focus:border-[#00FFD1] outline-none"
              />
              <button
                onClick={() => handleSimulateScan(scannedDocId, scannedDocType, scannedAmount, scannedCurrency)}
                disabled={isScanning}
                className="w-full sm:w-auto shrink-0 bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black font-bold text-xs px-4 py-2 rounded flex items-center justify-center gap-1.5 transition font-mono"
              >
                {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Scan className="w-3.5 h-3.5" />}
                <span>{isScanning ? 'جارِ التحقق...' : 'مطابقة الرمز والأرشيف'}</span>
              </button>
            </div>

            {/* Verification Result Callout */}
            {scanResult && (
              <div className="bg-[#0A0A0A] border border-[#00FFD1]/40 rounded-lg p-3 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00FFD1] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#00FFD1] font-bold">{scanResult.docId}</span>
                    <span className="text-[#666]">|</span>
                    <span className="text-amber-400 font-bold" dir="ltr">{scanResult.amount.toLocaleString()} {scanResult.currency}</span>
                    <span className="text-[#666]">|</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      QR_AUTHENTIC_MATCH
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {scanResult.message}
                  </p>
                </div>
              </div>
            )}

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
                { key: 'blueprint_sealed', label: '3. المخططات الهندسية السبعة الأصلية + QR', desc: 'موقعة باليد الحية ومطابقة لرمز QR المعتمد' },
                { key: 'schmidt_report', label: '4. تقرير فحص مطرقة شميدت والبيتون', desc: 'تقرير معتمد ومرفق بمنحنيات المعايرة' },
                { key: 'soils_test', label: '5. تقرير فحص التربة والجيوتكنيك', desc: 'مرفق بسبر الآبار الميدانية' },
                { key: 'tax_clearance', label: '6. براءة ذمة مالية وإشعار إيداع مشفر (QR)', desc: 'مطابق للمعرف الفريد والمبلغ الإجمالي في رمز QR' }
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

