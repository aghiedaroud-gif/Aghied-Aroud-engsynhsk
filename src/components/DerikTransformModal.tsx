import React, { useState } from 'react';
import { EngineerRecord } from '../types';
import { 
  RAW_DERIK_DATA_STRING, 
  transformRawDerikEngineers, 
  parseRawDerikText 
} from '../utils/derikEngineerTransformer';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  FileCode, 
  Database, 
  Users, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface DerikTransformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectEngineers: (transformed: EngineerRecord[]) => void;
  currentCount: number;
}

export const DerikTransformModal: React.FC<DerikTransformModalProps> = ({
  isOpen,
  onClose,
  onInjectEngineers,
  currentCount
}) => {
  const [rawText, setRawText] = useState<string>(RAW_DERIK_DATA_STRING.trim());
  const [previewTab, setPreviewTab] = useState<'table' | 'json' | 'raw'>('table');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const transformedEngineers = transformRawDerikEngineers(rawText);

  const handleExecuteInjection = () => {
    onInjectEngineers(transformedEngineers);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetToPreset = () => {
    setRawText(RAW_DERIK_DATA_STRING.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#181818] border-b border-[#2B2B2B] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#00FFD1] uppercase">DATA PIPELINE // DERIK UNIT</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#00FFD1]/20 text-[#00FFD1]">DER</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                محول ومحقن بيانات مهندسي وحدة ديرك (Derik Engineer Transformer)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#252525] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="bg-[#151515] border-b border-[#222] px-6 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewTab('table')}
              className={`px-3 py-1.5 rounded font-mono font-semibold transition ${
                previewTab === 'table' 
                  ? 'bg-[#00FFD1] text-black shadow' 
                  : 'bg-[#202020] text-[#AAA] hover:text-white'
              }`}
            >
              جدول المعاينة المحولة ({transformedEngineers.length})
            </button>
            <button
              onClick={() => setPreviewTab('json')}
              className={`px-3 py-1.5 rounded font-mono font-semibold transition ${
                previewTab === 'json' 
                  ? 'bg-[#00FFD1] text-black shadow' 
                  : 'bg-[#202020] text-[#AAA] hover:text-white'
              }`}
            >
              JSON Schema View
            </button>
            <button
              onClick={() => setPreviewTab('raw')}
              className={`px-3 py-1.5 rounded font-mono font-semibold transition ${
                previewTab === 'raw' 
                  ? 'bg-[#00FFD1] text-black shadow' 
                  : 'bg-[#202020] text-[#AAA] hover:text-white'
              }`}
            >
              تعديل النص الخام (Raw Input)
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#888] flex items-center gap-3">
            <span>المهندسون الحاليون: <strong className="text-white">{currentCount}</strong></span>
            <span>المهندسون المحولون: <strong className="text-[#00FFD1]">{transformedEngineers.length}</strong></span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
          
          {/* Instructions Box */}
          <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-3.5 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#00FFD1] shrink-0 mt-0.5" />
            <div className="text-[#CCC] text-xs leading-relaxed space-y-1">
              <p>
                تقوم هذه الأداة بتحويل الجداول والبيانات النصية الخام لمهندسي فرع ديريك إلى كائنات برمجية تطابق المعيار المالي المعتمد <code className="text-[#00FFD1]">EngineerRecord</code>، مع تعيين الاختصاص، الرتبة (استشاري/ممارس)، صلاحيات التدقيق، وأرقام الهواتف والأرشيف.
              </p>
            </div>
          </div>

          {/* Tab 1: Table Preview */}
          {previewTab === 'table' && (
            <div className="border border-[#262626] rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[360px]">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#1A1A1A] text-[#888] sticky top-0 border-b border-[#333]">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">الاسم الثلاثي</th>
                      <th className="p-2.5">الشعبة / الاختصاص</th>
                      <th className="p-2.5">الرتبة</th>
                      <th className="p-2.5">التأهيل والصلاحيات</th>
                      <th className="p-2.5">الهاتف</th>
                      <th className="p-2.5">الوحدة</th>
                      <th className="p-2.5 text-center">الرصيد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {transformedEngineers.map((eng, idx) => (
                      <tr key={eng.id || idx} className="hover:bg-[#1E1E1E] transition">
                        <td className="p-2.5 text-[#666] font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-white">{eng.fullName}</td>
                        <td className="p-2.5 text-[#00FFD1]">
                          <span className="px-1.5 py-0.5 rounded bg-[#00FFD1]/10 border border-[#00FFD1]/20 text-[10px]">
                            {eng.department} - {eng.specialization}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            eng.rank === 'استشاري' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {eng.rank}
                          </span>
                        </td>
                        <td className="p-2.5 text-[10px] text-[#AAA]">{eng.roleQualification}</td>
                        <td className="p-2.5 text-slate-300 font-mono" dir="ltr">{eng.phone}</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            {eng.branch}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-[#00FFD1]">{eng.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: JSON View */}
          {previewTab === 'json' && (
            <div className="relative">
              <pre className="bg-[#0A0A0A] border border-[#2B2B2B] rounded-lg p-4 text-[#00FFD1] text-[11px] font-mono max-h-[360px] overflow-y-auto leading-normal" dir="ltr">
                {JSON.stringify(transformedEngineers, null, 2)}
              </pre>
            </div>
          )}

          {/* Tab 3: Raw Input Editor */}
          {previewTab === 'raw' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#888]">يمكنك لصق أو تعديل نص الجداول الخام هنا:</label>
                <button
                  onClick={handleResetToPreset}
                  className="flex items-center gap-1 text-[10px] text-[#00FFD1] hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>استعادة جدول ديرك الافتراضي</span>
                </button>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={12}
                className="w-full bg-[#0A0A0A] text-slate-200 border border-[#333] rounded-lg p-3 font-mono text-xs focus:outline-none focus:border-[#00FFD1] leading-relaxed"
                placeholder="ألصق جدول مهندسي ديرك الخام هنا..."
              />
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-[#181818] border-t border-[#2B2B2B] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#888]">
            <ShieldCheck className="w-4 h-4 text-[#00FFD1]" />
            <span>سيتم دمج السجلات وتحديث حالة المهندسين في ذاكرة النظام والمزامنة التلقائية.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#252525] text-white hover:bg-[#303030] text-xs font-semibold transition"
            >
              إلغاء
            </button>
            <button
              onClick={handleExecuteInjection}
              disabled={isSuccess || transformedEngineers.length === 0}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs transition shadow-lg ${
                isSuccess
                  ? 'bg-emerald-500 text-black'
                  : 'bg-[#00FFD1] text-black hover:brightness-95'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>تم حقن وتحديث السجلات بنجاح!</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>حقن وتحديث سجلات مهندسي ديريك ({transformedEngineers.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
