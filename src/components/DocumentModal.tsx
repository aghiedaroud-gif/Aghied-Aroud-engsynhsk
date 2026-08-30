import React, { useEffect, useState } from 'react';
import { X, Printer, CheckCircle, Shield, Stamp, QrCode, WifiOff, HardDriveDownload, Layers, FileText, UserCheck, Landmark } from 'lucide-react';
import { BRANCH_CONFIG } from '../data/branchConfig';
import { BranchCode } from '../types';
import { BranchLogo } from './BranchLogo';
import { DocumentQRCode } from './DocumentQRCode';
import { cacheDocumentForOffline } from '../utils/serviceWorkerRegistration';

export interface OfficialCopyConfig {
  copyNumber: number;
  label: string;
  shortLabel: string;
  recipientTitle: string;
  recipientDesc: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  stampNote: string;
  icon: string;
}

export const OFFICIAL_COPIES: OfficialCopyConfig[] = [
  {
    copyNumber: 1,
    label: '1. نسخة صاحب العلاقة / المستفيد',
    shortLabel: 'نسخة المالك',
    recipientTitle: 'النسخة الأولى (Copy 1) — صاحب العلاقة / المستفيد المباشر',
    recipientDesc: 'تسلم لصاحب المشروع كوثيقة أتعاب ورسوم مالية وقانونية معتمدة',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-950',
    badgeBorder: 'border-blue-300',
    stampNote: 'نسخة أصلية لصاحب العلاقة',
    icon: 'user'
  },
  {
    copyNumber: 2,
    label: '2. نسخة الدائرة المالية والفرع',
    shortLabel: 'نسخة المالية',
    recipientTitle: 'النسخة الثانية (Copy 2) — الدائرة المالية وشؤون الصندوق بالفرع',
    recipientDesc: 'تحفظ في سجلات قسم الحسابات والشؤون المالية والمصرفية لفرع النقابة',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-950',
    badgeBorder: 'border-amber-300',
    stampNote: 'نسخة معتمدة لقسم الحسابات والمالية',
    icon: 'landmark'
  },
  {
    copyNumber: 3,
    label: '3. نسخة هيئة الرقابة والتدقيق',
    shortLabel: 'نسخة التدقيق',
    recipientTitle: 'النسخة الثالثة (Copy 3) — هيئة الرقابة والتدقيق النقابي المركزي',
    recipientDesc: 'تسلم لهيئة التدقيق لمطابقة جداول الحصص والنسب والأتعاب المعتمدة',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-950',
    badgeBorder: 'border-teal-300',
    stampNote: 'نسخة معتمدة لهيئة التدقيق والرقابة',
    icon: 'shield'
  },
  {
    copyNumber: 4,
    label: '4. نسخة الأرشيف والسجل العقاري',
    shortLabel: 'نسخة الأرشيف',
    recipientTitle: 'النسخة الرابعة (Copy 4) — الأرشيف المركزي والسجل العقاري والبلدية',
    recipientDesc: 'تحفظ في الأرشيف الدائم للوحدة وترفق مع ملف الترخيص البلدي والعقاري',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-950',
    badgeBorder: 'border-purple-300',
    stampNote: 'نسخة الحفظ الدائم والأرشيف العقاري',
    icon: 'file'
  }
];

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentType: 'INV' | 'EPO' | 'SFD';
  data: any;
  branch: BranchCode;
  isOnline?: boolean;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentType,
  data,
  branch,
  isOnline = true
}) => {
  // Default to 'single' (1 copy) so user does NOT get 4 duplicate copies when printing!
  const [activeTab, setActiveTab] = useState<'single' | 'all' | 1 | 2 | 3 | 4>('single');

  useEffect(() => {
    if (isOpen && documentId && data) {
      // Auto cache document in Service Worker Cache & localStorage for offline browsing
      cacheDocumentForOffline(documentId, documentType, data);
    }
  }, [isOpen, documentId, documentType, data]);

  if (!isOpen) return null;

  const branchInfo = BRANCH_CONFIG[branch] || BRANCH_CONFIG.HAS;
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });

  const totalAmount = documentType === 'INV' 
    ? (data?.grandTotal || data?.totalAmount || 0)
    : (data?.totalAmount || 0);

  const currency = data?.currency || 'ل.س';

  const handlePrint = () => {
    window.print();
  };

  // Determine what to render based on user's selection:
  // 'single' (Default) => exactly 1 single official document page
  // 'all' => 4 copies set
  // 1, 2, 3, 4 => specific copy
  const isSingleDefault = activeTab === 'single';

  const copiesToRender: (OfficialCopyConfig | { isSingle: true; copyNumber: number; label: string; recipientTitle: string; recipientDesc: string; badgeBg: string; badgeText: string; badgeBorder: string; stampNote: string })[] = 
    activeTab === 'single'
      ? [{
          isSingle: true,
          copyNumber: 1,
          label: 'النسخة الرسمية المعتمدة (Original Certified Document)',
          recipientTitle: 'الوثيقة الرسمية الصادرة والمعتمدة أصولاً',
          recipientDesc: 'وثيقة رسمية معتمدة ومسجلة في القيود المالية والنقابية لدى فرع نقابة المهندسين',
          badgeBg: 'bg-emerald-50',
          badgeText: 'text-emerald-950',
          badgeBorder: 'border-emerald-300',
          stampNote: 'وثيقة رسمية معتمدة ومختومة أصولاً'
        }]
      : activeTab === 'all'
      ? OFFICIAL_COPIES
      : OFFICIAL_COPIES.filter(c => c.copyNumber === activeTab);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:static print:bg-white print:overflow-visible">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Toolbar (Non-printable) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00FFD1]/10 border border-[#00FFD1]/30 flex items-center justify-center text-[#00FFD1]">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  معاينة وطباعة المستند الرسمي ({documentType} - {documentId})
                </span>
                <span className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
                  activeTab === 'single'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                }`}>
                  <FileText className="w-3 h-3" />
                  <span>{activeTab === 'single' ? 'نسخة مفردة (1 Copy)' : activeTab === 'all' ? 'طقم 4 نسخ (4 Copies)' : `النسخة رقم ${activeTab}`}</span>
                </span>
                {!isOnline && (
                  <span className="flex items-center gap-1 text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    <span>عرض محلي</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {activeTab === 'single'
                  ? 'جاهز للطباعة المباشرة كنسخة رسمية واحدة مفردة دون تكرار'
                  : 'تحديد خيارات الطباعة المتقدمة والأطقم المتعددة'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="print-document-modal-btn"
              onClick={handlePrint}
              className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition font-mono uppercase cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {activeTab === 'single'
                  ? 'طباعة المستند الرسمي (Print 1 Copy)'
                  : activeTab === 'all'
                  ? 'طباعة طقم النسخ الأربع (Print 4 Copies)'
                  : `طباعة النسخة ${activeTab} فقط`}
              </span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copy Selection Sub-Bar (Non-printable) */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 print:hidden text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Layers className="w-4 h-4 text-[#00FFD1]" />
            <span>خيارات النسخ والطباعة:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-sans">
            {/* Primary default: Single Official Copy (1 page) */}
            <button
              onClick={() => setActiveTab('single')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'single'
                  ? 'bg-[#00FFD1] text-black shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>نسخة مفردة واحدة (Single Copy - افتراضي)</span>
            </button>

            {/* Optional 4-set bundle */}
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
              title="طباعة طقم النسخ الأربع (صاحب العلاقة + المالية + الرقابة + الأرشيف)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>طقم النسخ الأربع (4-Set)</span>
            </button>

            {/* Individual copies */}
            {OFFICIAL_COPIES.map(copy => (
              <button
                key={copy.copyNumber}
                onClick={() => setActiveTab(copy.copyNumber as 1 | 2 | 3 | 4)}
                className={`px-2 py-1 rounded-md text-xs transition flex items-center gap-1 cursor-pointer ${
                  activeTab === copy.copyNumber
                    ? 'bg-amber-400 text-black font-bold shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                <span>{copy.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Printable Container */}
        <div className="overflow-y-auto bg-slate-100 p-4 sm:p-8 space-y-8 print:p-0 print:bg-white print:space-y-0 print:overflow-visible">
          {copiesToRender.map((copyConfig, copyIdx) => {
            const isLast = copyIdx === copiesToRender.length - 1;
            const isSingle = 'isSingle' in copyConfig && copyConfig.isSingle;

            return (
              <div
                key={copyConfig.copyNumber || copyIdx}
                className={`printable-document bg-white text-slate-900 text-right font-sans relative p-8 sm:p-12 rounded-xl shadow-md border border-slate-200 print:border-none print:shadow-none print:rounded-none print:p-0 ${
                  !isLast ? 'doc-page-break' : ''
                }`}
              >
                {/* Background Watermark Seal */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
                  <BranchLogo branch={branch} size="watermark" />
                </div>

                {/* Top Official Copy Destination Banner */}
                <div className={`mb-5 p-2.5 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs relative z-10 ${copyConfig.badgeBg} ${copyConfig.badgeBorder}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                      {isSingle ? '✓' : copyConfig.copyNumber}
                    </span>
                    <div>
                      <strong className={`block text-xs sm:text-sm font-bold ${copyConfig.badgeText}`}>
                        {copyConfig.recipientTitle}
                      </strong>
                      <span className="text-[11px] text-slate-600 block">
                        {copyConfig.recipientDesc}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 font-mono text-[10px] text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-300">
                    <Stamp className="w-3 h-3 text-slate-500" />
                    <span>
                      {isSingle 
                        ? 'OFFICIAL CERTIFIED DOCUMENT // S.E.P.H' 
                        : `SET 4-COPIES // COPY ${copyConfig.copyNumber} OF 4`}
                    </span>
                  </div>
                </div>

                {/* Header Banner */}
                <div className="border-b-2 border-slate-900 pb-4 mb-6 relative z-10">
                  <div className="flex items-center justify-between gap-4">
                    
                    {/* Right Title (Arabic) */}
                    <div className="text-right space-y-1 flex-1">
                      <h1 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                        {branchInfo.header_title}
                      </h1>
                      <p className="text-xs text-slate-700 font-semibold">
                        {branchInfo.sub_kurdish}
                      </p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        فرع {branchInfo.city_ar} - الدائرة المالية وشؤون المشاريع
                      </p>
                    </div>

                    {/* Center Official Syndicate Seal (S.E.P.H) */}
                    <div className="p-1.5 rounded-full border-2 border-slate-300 shadow-md bg-white shrink-0 flex items-center justify-center">
                      <BranchLogo branch={branch} size="2xl" />
                    </div>

                    {/* Left Title (Metadata / Ref + Header QR) */}
                    <div className="text-left font-mono text-xs space-y-1 flex-1 flex items-center justify-end gap-3" dir="ltr">
                      <div className="space-y-0.5 text-right">
                        <div><strong>Doc ID:</strong> <span className="text-blue-900 font-bold">{documentId}</span></div>
                        <div><strong>Date:</strong> {dateStr}</div>
                        <div><strong>Branch:</strong> {branchInfo.code}</div>
                        <div><strong>Total:</strong> <span className="font-bold text-slate-900">{totalAmount.toLocaleString()} {currency}</span></div>
                      </div>
                      <div className="shrink-0">
                        <DocumentQRCode
                          documentId={documentId}
                          documentType={documentType}
                          totalAmount={totalAmount}
                          currency={currency}
                          branch={branch}
                          clientName={data?.clientName}
                          size={70}
                          showCaption={false}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Document Specific Title */}
                  <div className="mt-4 text-center">
                    <span className="inline-block bg-slate-900 text-white px-6 py-1.5 rounded-lg text-sm font-bold tracking-wide shadow-sm">
                      {documentType === 'INV' && 'فاتورة أتعاب ورسوم دراسة هندسية رسمية (Official Invoice)'}
                      {documentType === 'EPO' && 'أمر صرف مستحقات المهندسين المعتمدين (Engineers Pay Order)'}
                      {documentType === 'SFD' && 'إشعار إيداع الرسوم والصناديق المشتركة (Syndicate Deposit Notice)'}
                    </span>
                  </div>
                </div>

                {/* Document Body: Invoice Type */}
                {documentType === 'INV' && (
                  <div className="space-y-5 text-xs">
                    
                    {/* Landlord / Project Info Grid */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-slate-500 block">صاحب العلاقة:</span>
                        <strong className="text-slate-900 text-sm">{data?.clientName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">رقم الهاتف:</span>
                        <strong className="font-mono text-slate-900" dir="ltr">{data?.clientPhone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">المنطقة العقارية:</span>
                        <strong className="text-slate-900">{data?.zoneLoc}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">المقسم / العقار:</span>
                        <strong className="font-mono text-slate-900">{data?.parcelNo} / {data?.propNo}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">المساحة الإجمالية:</span>
                        <strong className="font-mono text-slate-900">{data?.totalArea} م²</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">مساحة البناء:</span>
                        <strong className="font-mono text-slate-900">{data?.builtArea || '—'} م²</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">عدد الطوابق:</span>
                        <strong className="font-mono text-slate-900">{data?.floorsCount || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">صفة المشروع:</span>
                        <strong className="text-slate-900">{data?.projectType || 'سكني وجمعيات'}</strong>
                      </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-right border border-slate-300 rounded overflow-hidden">
                      <thead className="bg-slate-800 text-white font-bold">
                        <tr>
                          <th className="p-2.5 w-12 text-center">#</th>
                          <th className="p-2.5">بيان الأتعاب والرسوم النقابية المعتمدة</th>
                          <th className="p-2.5 text-left">القيمة ({data?.currency || 'ل.س'})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(data?.clientItems || []).map((item: any, idx: number) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-2 text-center text-slate-500 font-mono">{idx + 1}</td>
                            <td className="p-2 text-slate-800 font-medium">{item.label}</td>
                            <td className="p-2 text-left font-mono font-bold text-slate-900">
                              {item.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-900 text-white font-bold text-sm">
                          <td colSpan={2} className="p-3 text-right">المجموع الكلي الإجمالي المطلوب سداده:</td>
                          <td className="p-3 text-left font-mono text-amber-300">
                            {data?.grandTotal?.toLocaleString()} {data?.currency || 'ل.س'}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                  </div>
                )}

                {/* Document Body: Pay Order Type */}
                {documentType === 'EPO' && (
                  <div className="space-y-5 text-xs">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between">
                      <div>
                        <span className="text-slate-500 block">رقم الفاتورة المرجعية:</span>
                        <strong className="font-mono text-blue-900 text-sm">{data?.relatedInvoice || data?.relatedInv}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">إجمالي أتعاب المهندسين المصروفة:</span>
                        <strong className="font-mono text-red-700 text-sm">{data?.totalAmount?.toLocaleString()} {data?.currency || 'ل.س'}</strong>
                      </div>
                    </div>

                    <table className="w-full text-right border border-slate-300 rounded overflow-hidden">
                      <thead className="bg-slate-800 text-white font-bold">
                        <tr>
                          <th className="p-2.5">الاختصاص الهيكلي</th>
                          <th className="p-2.5">اسم المهندس المستفيد</th>
                          <th className="p-2.5 text-center">الصفة</th>
                          <th className="p-2.5 text-left">صافي المبلغ المستحق ({data?.currency || 'ل.س'})</th>
                          <th className="p-2.5 text-center">توقيع المستلم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(data?.pipelines || data?.breakdown || []).map((p: any, idx: number) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-2.5 font-bold text-slate-900">{p.disciplineAr || p.discipline}</td>
                            <td className="p-2.5 text-slate-800 font-semibold">{p.studyEngName || p.engineerName}</td>
                            <td className="p-2.5 text-center text-slate-600">{p.role || 'دارس'}</td>
                            <td className="p-2.5 text-left font-mono font-bold text-blue-950">
                              {(p.netStudyFee || p.netAmount || 0).toLocaleString()}
                            </td>
                            <td className="p-2.5 text-center text-slate-400 font-serif">.......................</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-900 text-white font-bold text-sm">
                          <td colSpan={3} className="p-3 text-right">المجموع الكلي لأمر الصرف المعتمد:</td>
                          <td colSpan={2} className="p-3 text-left font-mono text-red-300">
                            {data?.totalAmount?.toLocaleString()} {data?.currency || 'ل.س'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Document Body: Syndicate Deposit Type */}
                {documentType === 'SFD' && (
                  <div className="space-y-5 text-xs">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between">
                      <div>
                        <span className="text-slate-500 block">رقم الفاتورة المرتبطة:</span>
                        <strong className="font-mono text-blue-900 text-sm">{data?.relatedInvoice || data?.relatedInv}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">إجمالي المبالغ المودعة بحساب الصناديق:</span>
                        <strong className="font-mono text-emerald-700 text-sm">{data?.totalAmount?.toLocaleString()} {data?.currency || 'ل.س'}</strong>
                      </div>
                    </div>

                    <table className="w-full text-right border border-slate-300 rounded overflow-hidden">
                      <thead className="bg-slate-800 text-white font-bold">
                        <tr>
                          <th className="p-2.5">اسم الصندوق النقابي / الحساب البنكي</th>
                          <th className="p-2.5">الوصف</th>
                          <th className="p-2.5 text-left">المبلغ المودع ({data?.currency || 'ل.س'})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(data?.fundsBreakdown || []).map((f: any, idx: number) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-2.5 font-bold text-slate-900">{f.fundName}</td>
                            <td className="p-2.5 text-slate-600">{f.description || 'اشتراكات الصندوق والرسوم النقابية المعتمدة'}</td>
                            <td className="p-2.5 text-left font-mono font-bold text-emerald-900">
                              {f.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-900 text-white font-bold text-sm">
                          <td colSpan={2} className="p-3 text-right">المجموع الكلي للإيداع النقابي:</td>
                          <td className="p-3 text-left font-mono text-emerald-300">
                            {data?.totalAmount?.toLocaleString()} {data?.currency || 'ل.س'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Signatures, Official Seal, and Archive QR Verification Footer */}
                <div className="mt-8 pt-5 border-t-2 border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs avoid-break">
                  
                  <div className="space-y-4">
                    <div className="font-bold text-slate-900">محاسب الوحدة المعتمد</div>
                    <div className="h-9 text-slate-400 font-serif italic text-[11px] pt-3">
                      (توقيع المحاسب المالي)
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">ID: ACC-{branchInfo.code}-2026</div>
                  </div>

                  <div className="space-y-3 flex flex-col items-center">
                    <div className="font-bold text-slate-900">خاتم الفرع والتصديق</div>
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-red-700/60 flex items-center justify-center text-red-700/80 font-bold text-[9px] transform -rotate-12">
                      <div className="text-center leading-tight">
                        نقابة المهندسين<br/>فرع {branchInfo.city_ar}<br/>★ معتمد 2026 ★
                      </div>
                    </div>
                    <div className="text-[9px] text-red-800 font-bold">
                      {copyConfig.stampNote}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="font-bold text-slate-900">رئيس الدائرة الفنية</div>
                    <div className="h-9 text-slate-400 font-serif italic text-[11px] pt-3">
                      (توقيع رئيس الفرع)
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">ID: AUD-{branchInfo.code}-2026</div>
                  </div>

                  <div className="space-y-1.5 flex flex-col items-center justify-center bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="font-bold text-[11px] text-slate-900">التحقق الأرشيفي (QR)</div>
                    <DocumentQRCode
                      documentId={documentId}
                      documentType={documentType}
                      totalAmount={totalAmount}
                      currency={currency}
                      branch={branch}
                      clientName={data?.clientName}
                      size={66}
                      showCaption={false}
                      compact={true}
                    />
                    <div className="font-mono text-[9px] text-slate-600 font-bold" dir="ltr">
                      {documentId}
                    </div>
                  </div>

                </div>

                {/* Bottom Security Note */}
                <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1 font-mono">
                  <span>Doc Checksum: VER-{documentId.replace(/[^a-zA-Z0-9]/g, '')}-{totalAmount}</span>
                  <span className="font-bold text-slate-700">{copyConfig.recipientTitle}</span>
                  <span>{isSingle ? 'وثيقة أصلية معتمدة' : `صفحة ${copyConfig.copyNumber} من 4`}</span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
