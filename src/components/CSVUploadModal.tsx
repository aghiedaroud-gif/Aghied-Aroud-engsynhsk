import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Download, 
  FileCheck, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Info,
  Check,
  Building2,
  Table
} from 'lucide-react';
import { BranchCode, InvoiceRecord, PayOrderRecord, SyndicateDepositRecord, FundContributionRecord, LedgerEntry, EngineerRecord } from '../types';
import { 
  CSVImportTarget, 
  validateAndParseCSV, 
  getSampleCSVTemplate, 
  CSVImportValidationResult 
} from '../utils/csvImporter';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBranch: BranchCode;
  onImportLedger?: (entries: LedgerEntry[]) => void;
  onImportInvoices?: (entries: InvoiceRecord[]) => void;
  onImportPayOrders?: (entries: PayOrderRecord[]) => void;
  onImportDeposits?: (entries: SyndicateDepositRecord[]) => void;
  onImportContributions?: (entries: FundContributionRecord[]) => void;
  onImportEngineers?: (entries: EngineerRecord[]) => void;
}

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  isOpen,
  onClose,
  currentBranch,
  onImportLedger,
  onImportInvoices,
  onImportPayOrders,
  onImportDeposits,
  onImportContributions,
  onImportEngineers
}) => {
  const [selectedTarget, setSelectedTarget] = useState<CSVImportTarget>('ledger');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeKb, setFileSizeKb] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<CSVImportValidationResult | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const targetOptions: Array<{ id: CSVImportTarget; label: string; sub: string; icon: any }> = [
    { id: 'ledger', label: '1. دفتر الأستاذ العام (General Ledger)', sub: 'قيود اليومية الثنائية (مدين، دائن، حسابات)', icon: Table },
    { id: 'invoices', label: '2. سجل الفواتير والمشاريع (Invoices)', sub: 'الفواتير الهندسية وأصحاب العلاقة والمبالغ', icon: FileSpreadsheet },
    { id: 'payorders', label: '3. أوامر الصرف المالي (Pay Orders - EPO)', sub: 'مستحقات المهندسين المفرزة للصرف', icon: Layers },
    { id: 'deposits', label: '4. إيداعات الصناديق (Deposits - SFD)', sub: 'حصة الصندوق المشترك والنقابة والرسوم', icon: Building2 },
    { id: 'contributions', label: '5. اشتراكات الصناديق (Contributions)', sub: 'استقطاعات الصناديق للمهندسين', icon: ShieldCheck },
    { id: 'engineers', label: '6. جدول المهندسين المعتمدين (Engineers)', sub: 'بيانات المهندسين والشعب والمراتب', icon: FileCheck }
  ];

  const handleFileRead = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      alert('يرجى تحديد ملف بتنسيق CSV (.csv) أو ملف نصي مفصول بفواصل.');
      return;
    }

    setFileName(file.name);
    setFileSizeKb(Math.round(file.size / 1024));
    setImportSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFileContent(text);
      // Automatically validate
      const result = validateAndParseCSV(selectedTarget, text, currentBranch);
      setValidationResult(result);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileRead(e.dataTransfer.files[0]);
    }
  };

  const handleTargetChange = (newTarget: CSVImportTarget) => {
    setSelectedTarget(newTarget);
    if (fileContent) {
      const result = validateAndParseCSV(newTarget, fileContent, currentBranch);
      setValidationResult(result);
    }
  };

  const handleDownloadTemplate = () => {
    const { filename, content } = getSampleCSVTemplate(selectedTarget, currentBranch);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExecuteImport = () => {
    if (!validationResult || validationResult.validRows === 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      try {
        const count = validationResult.validRows;
        if (selectedTarget === 'ledger' && onImportLedger) {
          onImportLedger(validationResult.parsedEntries);
        } else if (selectedTarget === 'invoices' && onImportInvoices) {
          onImportInvoices(validationResult.parsedEntries);
        } else if (selectedTarget === 'payorders' && onImportPayOrders) {
          onImportPayOrders(validationResult.parsedEntries);
        } else if (selectedTarget === 'deposits' && onImportDeposits) {
          onImportDeposits(validationResult.parsedEntries);
        } else if (selectedTarget === 'contributions' && onImportContributions) {
          onImportContributions(validationResult.parsedEntries);
        } else if (selectedTarget === 'engineers' && onImportEngineers) {
          onImportEngineers(validationResult.parsedEntries);
        }

        setImportSuccessMessage(`تم بنجاح استيراد وتخزين ${count} سجلاً في قاعدة البيانات المركزية!`);
        setIsProcessing(false);
        // Clear file input
        setFileContent(null);
        setFileName('');
        setValidationResult(null);
      } catch (err: any) {
        setIsProcessing(false);
        alert(`فشل الاستيراد: ${err.message}`);
      }
    }, 400);
  };

  return (
    <div 
      id="csv-upload-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="csv-upload-modal-dialog"
        className="bg-[#111] border border-[#333] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl animate-scaleUp text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 bg-[#151515] border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00FFD1]/10 border border-[#00FFD1]/30 text-[#00FFD1] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>استيراد وتحديث جداول البيانات (Upload CSV Utility)</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00FFD1]/20 text-[#00FFD1] border border-[#00FFD1]/30">
                  RFC 4180 / UTF-8
                </span>
              </h3>
              <p className="text-xs text-[#888] mt-0.5">
                استيراد قيود دفتر الأستاذ العام، الفواتير، أوامر الصرف، والإيداعات المحاسبية من ملفات Excel و CSV.
              </p>
            </div>
          </div>
          <button
            id="close-csv-upload-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#222] hover:bg-[#333] text-[#AAA] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Success Banner */}
          {importSuccessMessage && (
            <div className="p-4 bg-[#00FFD1]/10 border border-[#00FFD1]/40 rounded-lg flex items-center gap-3 text-white">
              <CheckCircle2 className="w-5 h-5 text-[#00FFD1] shrink-0" />
              <div className="flex-1 text-xs">
                <span className="font-bold text-[#00FFD1]">نجاح العملية: </span>
                {importSuccessMessage}
              </div>
            </div>
          )}

          {/* 1. Target Data Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-[#CCC] flex items-center justify-between">
              <span>1. اختر نوع السجل المحاسبي المستهدف للاستيراد:</span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-[11px] font-mono text-[#00FFD1] hover:underline flex items-center gap-1 bg-[#1A1A1A] px-2.5 py-1 rounded border border-[#00FFD1]/30 hover:border-[#00FFD1]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل نموذج CSV قياسي (Template)</span>
              </button>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {targetOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedTarget === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleTargetChange(opt.id)}
                    className={`p-3 rounded-lg border text-right transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#182824] border-[#00FFD1] text-white shadow-sm'
                        : 'bg-[#161616] hover:bg-[#1F1F1F] border-[#2B2B2B] text-[#AAA]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#00FFD1]' : 'text-[#777]'}`} />
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#00FFD1]"></span>}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#DDD]'}`}>
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-[#777] mt-0.5 leading-tight">
                        {opt.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Drag and Drop Upload Area */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-mono font-bold text-[#CCC]">
              2. قم برفع أو سحب وإفلات ملف CSV:
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileRead(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-[#00FFD1] bg-[#00FFD1]/10'
                  : fileName
                  ? 'border-[#00FFD1]/50 bg-[#161616]'
                  : 'border-[#333] hover:border-[#555] bg-[#141414] hover:bg-[#181818]'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-[#00FFD1]">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {fileName ? `تم اختيار الملف: ${fileName}` : 'انقر هنا لتصفح الملف أو اسحبه وأفلته هنا'}
                </div>
                <div className="text-[11px] text-[#777] mt-1 font-mono">
                  {fileName ? `${fileSizeKb} KB • جاهز للتحليل والتحقق المحاسبي` : 'يدعم ملفات CSV UTF-8 / RFC 4180 المفصولة بفواصل (Commas) أو فواصل منقوطة'}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Validation & Preview Panel */}
          {validationResult && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between bg-[#161616] p-3 rounded-lg border border-[#262626]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[#888]">إجمالي الأسطر:</span>
                    <span className="font-mono font-bold text-white">{validationResult.totalRows}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[#888]">سجلات صالحة:</span>
                    <span className="font-mono font-bold text-[#00FFD1]">{validationResult.validRows}</span>
                  </div>
                  {validationResult.errorRows > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[#888]">أخطاء / تم استبعادها:</span>
                      <span className="font-mono font-bold text-amber-400">{validationResult.errorRows}</span>
                    </div>
                  )}
                </div>
                <div className="text-[11px] font-mono text-[#AAA]">
                  الوحدة الحالية: <span className="text-[#00FFD1] font-bold">{currentBranch}</span>
                </div>
              </div>

              {/* Errors List if any */}
              {validationResult.errors.length > 0 && (
                <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-lg space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>تنبيهات التحقق من صحة البيانات (Validation Warnings):</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto text-[11px] text-amber-200/90 space-y-0.5 font-mono pr-2">
                    {validationResult.errors.map((err, i) => (
                      <div key={i}>
                        • السطر {err.row}: [{err.field}] {err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Data Table Preview */}
              {validationResult.sampleData.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-[#888]">
                    معاينة عينة من السجلات المقروءة ({validationResult.sampleData.length} أسطر):
                  </div>
                  <div className="overflow-x-auto border border-[#262626] rounded-lg">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#0A0A0A] border-b border-[#262626] text-[10px] font-mono text-[#777]">
                        <tr>
                          {validationResult.headers.slice(0, 6).map((h, i) => (
                            <th key={i} className="p-2 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222] font-mono text-[11px] bg-[#141414]">
                        {validationResult.sampleData.map((row, i) => (
                          <tr key={i} className="hover:bg-[#1A1A1A]">
                            {validationResult.headers.slice(0, 6).map((h, j) => (
                              <td key={j} className="p-2 text-[#CCC] whitespace-nowrap">
                                {row[h] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#151515] border-t border-[#222] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#222] hover:bg-[#333] text-white font-mono text-xs transition"
          >
            إلغاء
          </button>

          <button
            id="execute-import-csv-btn"
            onClick={handleExecuteImport}
            disabled={!validationResult || validationResult.validRows === 0 || isProcessing}
            className={`flex items-center gap-2 px-5 py-2 rounded font-mono font-bold text-xs uppercase tracking-wider transition ${
              !validationResult || validationResult.validRows === 0 || isProcessing
                ? 'bg-[#222] text-[#666] cursor-not-allowed border border-[#333]'
                : 'bg-[#00FFD1] hover:brightness-110 text-black shadow-lg shadow-[#00FFD1]/20 cursor-pointer'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'جارٍ استيراد السجلات...'
                : validationResult
                ? `تأكيد استيراد (${validationResult.validRows}) سجل`
                : 'تأكيد الاستيراد'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
