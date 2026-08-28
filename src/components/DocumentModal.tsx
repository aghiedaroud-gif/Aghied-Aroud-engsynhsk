import React from 'react';
import { X, Printer, CheckCircle, Shield, Stamp } from 'lucide-react';
import { BRANCH_CONFIG } from '../data/branchConfig';
import { BranchCode } from '../types';
import { BranchLogo } from './BranchLogo';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentType: 'INV' | 'EPO' | 'SFD';
  data: any;
  branch: BranchCode;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentType,
  data,
  branch
}) => {
  if (!isOpen) return null;

  const branchInfo = BRANCH_CONFIG[branch] || BRANCH_CONFIG.HAS;
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Toolbar (Non-printable) */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#00FFD1]" />
            <span className="font-bold text-sm">
              معاينة المستند الرسمي A4 ({documentType} - {documentId})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition font-mono uppercase"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند A4 (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Printable Sheet (A4 format) */}
        <div id="printable-doc" className="printable-document p-8 sm:p-12 overflow-y-auto bg-white text-slate-900 text-right font-sans relative">
          
          {/* Background Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
            <BranchLogo branch={branch} size="watermark" />
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
              <div className="p-1 rounded-full border border-slate-300 shadow-sm bg-white shrink-0 flex items-center justify-center">
                <BranchLogo branch={branch} size="xl" />
              </div>

              {/* Left Title (Metadata / Ref) */}
              <div className="text-left font-mono text-xs space-y-1 flex-1" dir="ltr">
                <div><strong>Doc ID:</strong> {documentId}</div>
                <div><strong>Date:</strong> {dateStr}</div>
                <div><strong>Branch:</strong> {branchInfo.code}</div>
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

          {/* Signatures and Official Syndicate Seal Footer */}
          <div className="mt-10 pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-center text-xs">
            
            <div className="space-y-6">
              <div className="font-bold text-slate-900">محاسب الوحدة المعتمد</div>
              <div className="h-10 text-slate-400 font-serif italic text-[11px] pt-4">
                (توقيع المحاسب المالي)
              </div>
              <div className="text-[10px] text-slate-500 font-mono">ID: ACC-HAS-2026</div>
            </div>

            <div className="space-y-4 flex flex-col items-center">
              <div className="font-bold text-slate-900">خاتم النقابة الرسمي والتصديق</div>
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-red-700/60 flex items-center justify-center text-red-700/80 font-bold text-[10px] transform -rotate-12">
                <div className="text-center leading-tight">
                  نقابة المهندسين<br/>فرع الحسكة<br/>★ معتمد 2026 ★
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="font-bold text-slate-900">رئيس الدائرة الفنية والتدقيق</div>
              <div className="h-10 text-slate-400 font-serif italic text-[11px] pt-4">
                (توقيع رئيس الفرع)
              </div>
              <div className="text-[10px] text-slate-500 font-mono">ID: AUD-CHIEF-2026</div>
            </div>

          </div>

          {/* Bottom Security Note */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Security Hash: SHA256-SYN-2026-HAS-OK</span>
            <span>وثيقة رسمية صادرة إلكترونياً عن النظام المالي الموحد لنقابة المهندسين</span>
            <span>Page 1 of 1</span>
          </div>

        </div>

      </div>
    </div>
  );
};
