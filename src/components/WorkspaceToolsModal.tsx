import React, { useState } from 'react';
import { X, FileSpreadsheet, HardDrive, CheckCircle2, RefreshCw, ExternalLink, Download, FileText } from 'lucide-react';
import { BranchCode } from '../types';

interface WorkspaceToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBranch: BranchCode;
  invoicesCount: number;
}

export const WorkspaceToolsModal: React.FC<WorkspaceToolsModalProps> = ({
  isOpen,
  onClose,
  currentBranch,
  invoicesCount
}) => {
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleExportSheets = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/workspace/export-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelName: 'Master Invoices & Pay Orders', data: [] })
      });
      const data = await res.json();
      setSyncStatus(data.message || 'تم التصدير بنجاح إلى Google Sheets');
    } catch (err: any) {
      setSyncStatus('خطأ أثناء التصدير: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncDrive = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/workspace/sync-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: `DOC-${currentBranch}-MASTER`, docType: 'ALL' })
      });
      const data = await res.json();
      setSyncStatus(data.message || 'تمت المزامنة بنجاح مع Google Drive');
    } catch (err: any) {
      setSyncStatus('خطأ أثناء المزامنة: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base">
              تكامل Google Workspace (Sheets & Drive & Forms)
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs text-slate-800">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Google Sheets Card */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Google Sheets (جداول البيانات)</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  تصدير القيود، الفواتير، جداول الصرف، واشتراكات 74 مهندس إلى جدول إكسل سحابي متزامن.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleExportSheets}
                  disabled={isSyncing}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير السجلات الآن ({invoicesCount} فاتورة)</span>
                </button>

                <a
                  href="https://docs.google.com/spreadsheets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح الجدول السحابي المعتمد</span>
                </a>
              </div>
            </div>

            {/* Google Drive Card */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <span>Google Drive (الأرشيف السحابي)</span>
                </div>
                <p className="text-[11px] text-blue-700 mt-1">
                  حفظ النسخ الاحتياطية لمجلد (01-Accounting Models) ومزامنة الفواتير بصيغة PDF المشفرة.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSyncDrive}
                  disabled={isSyncing}
                  className="w-full bg-blue-800 hover:bg-blue-900 text-white py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>مزامنة المجلد النقابي السحابي</span>
                </button>

                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white border border-blue-300 text-blue-800 hover:bg-blue-50 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح مجلد Google Drive</span>
                </a>
              </div>
            </div>

          </div>

          {/* Sync Status Banner */}
          {syncStatus && (
            <div className="bg-slate-900 text-emerald-300 p-3 rounded-lg font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* Info note */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong>ملاحظة فنية:</strong> يتم استخدام Google Workspace APIs لمزامنة البيانات دورياً عند كل عملية إصدار فاتورة أو إيداع، مع دعم التصدير التلقائي واستيراد طلبات الملاك من Google Forms.
          </div>

        </div>

      </div>
    </div>
  );
};
