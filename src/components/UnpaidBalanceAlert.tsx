import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Sliders, 
  ArrowRight, 
  Clock, 
  CreditCard, 
  Layers, 
  Eye, 
  TrendingUp, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Zap,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { InvoiceRecord, PayOrderRecord, BranchCode, UserRole } from '../types';

interface UnpaidBalanceAlertProps {
  invoices: InvoiceRecord[];
  payOrders: PayOrderRecord[];
  currentBranch: BranchCode;
  userRole: UserRole;
  exchangeRate: number;
  threshold: number;
  onUpdateThreshold: (newThreshold: number) => void;
  onUpdateInvoiceStatus: (invoiceId: string, newStatus: 'Issued' | 'Audited' | 'Settled') => void;
  onNavigateToInvoices: () => void;
}

export const UnpaidBalanceAlert: React.FC<UnpaidBalanceAlertProps> = ({
  invoices,
  payOrders,
  currentBranch,
  userRole,
  exchangeRate,
  threshold,
  onUpdateThreshold,
  onUpdateInvoiceStatus,
  onNavigateToInvoices
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [customThresholdInput, setCustomThresholdInput] = useState(threshold.toString());
  const [filterByBranch, setFilterByBranch] = useState<boolean>(false);
  const [selectedInvoiceToSettle, setSelectedInvoiceToSettle] = useState<string | null>(null);

  // Filter invoices and pay orders
  const relevantInvoices = invoices.filter(inv => {
    if (filterByBranch && inv.branchCode !== currentBranch) return false;
    return inv.status !== 'Settled';
  });

  const relevantPayOrders = payOrders.filter(epo => {
    if (filterByBranch && epo.branchCode !== currentBranch) return false;
    return epo.status !== 'Disbursed';
  });

  // Calculate unpaid invoice balance in SYP
  const unpaidInvoicesSYP = relevantInvoices.reduce((acc, inv) => {
    const amountSYP = inv.currency === 'USD' ? inv.totalAmount * exchangeRate : inv.totalAmount;
    return acc + amountSYP;
  }, 0);

  // Calculate pending engineer disbursements in SYP
  const pendingPayOrdersSYP = relevantPayOrders.reduce((acc, epo) => {
    const amountSYP = epo.currency === 'USD' ? epo.totalAmount * exchangeRate : epo.totalAmount;
    return acc + amountSYP;
  }, 0);

  // Total unpaid balance / exposure
  const totalUnpaidBalanceSYP = unpaidInvoicesSYP;

  // Threshold comparison
  const isThresholdExceeded = totalUnpaidBalanceSYP > threshold;
  const isNearThreshold = totalUnpaidBalanceSYP > threshold * 0.8 && !isThresholdExceeded;
  const excessAmountSYP = totalUnpaidBalanceSYP - threshold;
  const excessPercentage = threshold > 0 ? (totalUnpaidBalanceSYP / threshold) * 100 : 0;

  // Severity Level
  const isCritical = excessPercentage >= 150;
  const isHigh = isThresholdExceeded && !isCritical;
  const isModerate = isNearThreshold;

  // Quick preset thresholds in SYP
  const presetThresholds = [
    { label: '10M ل.س', value: 10000000 },
    { label: '15M ل.س', value: 15000000 },
    { label: '20M ل.س', value: 20000000 },
    { label: '30M ل.س', value: 30000000 },
    { label: '50M ل.س', value: 50000000 },
  ];

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customThresholdInput.replace(/,/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      onUpdateThreshold(val);
      setIsSettingsOpen(false);
    }
  };

  const handleQuickSettle = (invoiceId: string) => {
    onUpdateInvoiceStatus(invoiceId, 'Settled');
    setSelectedInvoiceToSettle(null);
  };

  // If dismissed or not exceeding/near threshold (and not accountant requesting manual view), show minimal badge or return
  if (!isThresholdExceeded && !isNearThreshold && isDismissed) {
    return null;
  }

  // Floating Re-open pill if accountant dismissed the full banner
  if (isDismissed && isThresholdExceeded) {
    return (
      <div 
        id="unpaid-balance-minimized-alert"
        className="fixed bottom-5 left-5 z-40 animate-bounce"
      >
        <button
          onClick={() => setIsDismissed(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-red-950/90 hover:bg-red-900 border-2 border-red-500/80 text-white shadow-2xl backdrop-blur-md transition-all font-mono text-xs"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="font-bold">تحذير سيولة: {totalUnpaidBalanceSYP.toLocaleString()} ل.س غير مسددة</span>
          <span className="text-[10px] bg-red-500/30 px-2 py-0.5 rounded-full text-red-200">
            {excessPercentage.toFixed(0)}%
          </span>
        </button>
      </div>
    );
  }

  // If balance is healthy (under 80% threshold), don't show the warning unless settings or expanded
  if (!isThresholdExceeded && !isNearThreshold && !isSettingsOpen) {
    return null;
  }

  return (
    <div 
      id="unpaid-balance-liquidity-alert-banner"
      className={`border-b transition-all duration-300 ${
        isCritical 
          ? 'bg-gradient-to-r from-[#200A0A] via-[#1A0C0C] to-[#120808] border-red-500/60 shadow-lg shadow-red-950/40'
          : isHigh
          ? 'bg-gradient-to-r from-[#221005] via-[#1A0E08] to-[#140B06] border-amber-500/60 shadow-md shadow-amber-950/30'
          : 'bg-gradient-to-r from-[#1E1906] via-[#171408] to-[#121106] border-yellow-500/40'
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Main Alert Header Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left / Primary Alert Identity */}
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
              isCritical
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : isHigh
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
            }`}>
              {isCritical ? (
                <ShieldAlert className="w-6 h-6 text-red-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              )}
            </div>

            <div>
              <div className="flex items-center flex-wrap gap-2">
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isCritical
                    ? 'bg-red-500/30 text-red-200 border-red-500/60'
                    : isHigh
                    ? 'bg-amber-500/30 text-amber-200 border-amber-500/60'
                    : 'bg-yellow-500/30 text-yellow-200 border-yellow-500/60'
                }`}>
                  {isCritical 
                    ? 'CRITICAL_LIQUIDITY_ALERT // تحذير سيولة حرج'
                    : isHigh
                    ? 'UNPAID_BALANCE_WARNING // تنبيه تجاوز سقف الذمم غير المسددة'
                    : 'LIQUIDITY_NOTICE // اقتراب من سقف الأمان المالي'}
                </span>

                <span className="text-[11px] font-mono text-[#AAA] hidden sm:inline">
                  {filterByBranch ? `فرع [${currentBranch}]` : 'جميع الفروع المركزية'}
                </span>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-[#CCC] border border-[#444]">
                  {relevantInvoices.length} فواتير غير مسددة
                </span>
              </div>

              <div className="text-xs sm:text-sm text-[#DDD] mt-1 flex items-baseline flex-wrap gap-x-2 gap-y-1">
                <span>إجمالي الأرصدة والذمم غير المحصلة:</span>
                <span className="font-mono font-bold text-white text-base sm:text-lg">
                  {totalUnpaidBalanceSYP.toLocaleString()} <span className="text-xs text-[#00FFD1]">ل.س</span>
                </span>
                <span className="text-[#888] text-xs">
                  (سقف الأمان المحدد: <strong className="text-[#BBB] font-mono">{threshold.toLocaleString()} ل.س</strong>)
                </span>
                {isThresholdExceeded && (
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40">
                    تجاوز بمقدار +{excessAmountSYP.toLocaleString()} ل.س ({excessPercentage.toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center flex-wrap gap-2 mr-auto lg:mr-0 self-end lg:self-center">
            
            {/* Toggle Branch vs Global */}
            <button
              onClick={() => setFilterByBranch(prev => !prev)}
              className={`px-2.5 py-1.5 rounded text-[11px] font-mono transition border ${
                filterByBranch 
                  ? 'bg-[#00FFD1]/20 border-[#00FFD1] text-[#00FFD1]' 
                  : 'bg-[#1A1A1A] hover:bg-[#252525] border-[#444] text-[#AAA]'
              }`}
              title="التبديل بين رصيد الفرع الحالي أو جميع الفروع"
            >
              <Building2 className="w-3.5 h-3.5 inline ml-1" />
              <span>{filterByBranch ? `فرع (${currentBranch}) فقط` : 'الرصيد الكلي'}</span>
            </button>

            {/* Threshold Settings Trigger */}
            <button
              id="adjust-threshold-btn"
              onClick={() => setIsSettingsOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white border border-[#444] hover:border-[#888] font-mono text-[11px] transition"
              title="تعديل سقف الأمان للسيولة المالية"
            >
              <Sliders className="w-3.5 h-3.5 text-[#00FFD1]" />
              <span>سقف الأمان</span>
            </button>

            {/* Expand / Collapse Details */}
            <button
              id="toggle-unpaid-details-btn"
              onClick={() => setIsExpanded(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[11px] transition border ${
                isExpanded 
                  ? 'bg-[#00FFD1] text-black border-[#00FFD1] font-bold' 
                  : 'bg-[#222] hover:bg-[#333] text-white border-[#444]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isExpanded ? 'إخفاء الفواتير' : 'معاينة وتسوية'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Dismiss / Snooze */}
            <button
              id="dismiss-unpaid-alert-btn"
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded bg-[#222]/80 hover:bg-[#333] text-[#888] hover:text-white transition"
              title="إخفاء التنبيه مؤقتاً"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Liquidity Stress Bar */}
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-3">
          <div className="flex-1 bg-black/60 rounded-full h-2 overflow-hidden border border-white/10 relative">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isCritical 
                  ? 'bg-gradient-to-r from-amber-500 to-red-500' 
                  : isHigh 
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500' 
                  : 'bg-[#00FFD1]'
              }`}
              style={{ width: `${Math.min(100, excessPercentage)}%` }}
            ></div>
            {/* Safety Marker at 100% */}
            <div className="absolute right-[100%] top-0 bottom-0 w-0.5 bg-white/60"></div>
          </div>
          <div className="text-[10px] font-mono font-bold text-[#AAA] whitespace-nowrap">
            نسبة الإشغال المالي: <span className={isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-[#00FFD1]'}>
              {excessPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Settings Dropdown / Panel */}
        {isSettingsOpen && (
          <div 
            id="threshold-settings-panel"
            className="mt-3 p-4 bg-[#111] border border-[#333] rounded-xl animate-fadeIn space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sliders className="w-4 h-4 text-[#00FFD1]" />
                <span>إعدادات سقف الأمان للرصيد غير المسدد (Unpaid Balance Liquidity Threshold)</span>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-[#888] hover:text-white text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#888]">
              يحدد هذا السقف الحد الأقصى المسموح به لمجموع الفواتير غير المسددة قبل إطلاق التنبيهات للمحاسب لتفادي أزمات السيولة النقدية والمستحقات العالقة.
            </p>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[#AAA] ml-2">خيارات سريعة:</span>
              {presetThresholds.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    onUpdateThreshold(preset.value);
                    setCustomThresholdInput(preset.value.toString());
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition border ${
                    threshold === preset.value
                      ? 'bg-[#00FFD1]/20 border-[#00FFD1] text-[#00FFD1] font-bold'
                      : 'bg-[#181818] hover:bg-[#222] border-[#333] text-[#CCC]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleSaveThreshold} className="flex items-center gap-2 pt-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={customThresholdInput}
                  onChange={(e) => setCustomThresholdInput(e.target.value)}
                  placeholder="أدخل سقف مخصص بالليرة السورية..."
                  className="w-full bg-[#181818] border border-[#444] focus:border-[#00FFD1] rounded px-3 py-1.5 text-xs text-white font-mono outline-none"
                />
                <span className="absolute left-3 top-2 text-[10px] font-mono text-[#777]">SYP</span>
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#00FFD1] hover:brightness-110 text-black font-mono font-bold text-xs rounded transition"
              >
                حفظ السقف
              </button>
            </form>
          </div>
        )}

        {/* Expanded Drawer: List of Unsettled Invoices with 1-Click Settlement */}
        {isExpanded && (
          <div 
            id="unsettled-invoices-drawer"
            className="mt-3 p-4 bg-[#0D0D0D] border border-[#2B2B2B] rounded-xl space-y-3 animate-fadeIn"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00FFD1]" />
                <span className="text-xs font-bold text-white font-mono">
                  UNSETTLED_INVOICES_BREAKDOWN // تفصيل الفواتير والذمم غير المحصلة ({relevantInvoices.length})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onNavigateToInvoices}
                  className="text-xs font-mono text-[#00FFD1] hover:underline flex items-center gap-1"
                >
                  <span>فتح سجل الفواتير الكامل في قاعدة البيانات</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>
            </div>

            {/* Invoices List Table */}
            {relevantInvoices.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#777] font-mono">
                <CheckCircle2 className="w-6 h-6 text-[#00FFD1] mx-auto mb-2 opacity-80" />
                جميع الفواتير في هذا النطاق مسددة بالكامل ولا توجد ذمم متأخرة.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#222] rounded-lg">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#141414] border-b border-[#222] text-[10px] font-mono text-[#777] uppercase">
                    <tr>
                      <th className="p-2.5">رقم الفاتورة</th>
                      <th className="p-2.5">التاريخ</th>
                      <th className="p-2.5">صاحب العلاقة</th>
                      <th className="p-2.5">الفرع</th>
                      <th className="p-2.5 text-left">المبلغ</th>
                      <th className="p-2.5 text-center">الحالة الحالية</th>
                      <th className="p-2.5 text-center">إجراء التسوية السريعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F] font-mono text-[11px] bg-[#0A0A0A]">
                    {relevantInvoices.map((inv) => {
                      const amountSYP = inv.currency === 'USD' ? inv.totalAmount * exchangeRate : inv.totalAmount;
                      const isHighValue = amountSYP >= 5000000;
                      return (
                        <tr key={inv.id} className="hover:bg-[#151515] transition">
                          <td className="p-2.5 font-bold text-[#00FFD1]">{inv.invoiceNumber}</td>
                          <td className="p-2.5 text-[#888]">{inv.date}</td>
                          <td className="p-2.5 font-sans font-semibold text-white">{inv.clientName}</td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1A1A1A] text-[#CCC] border border-[#333]">
                              {inv.branchCode}
                            </span>
                          </td>
                          <td className="p-2.5 text-left font-bold">
                            <span className={isHighValue ? 'text-amber-400 font-bold' : 'text-white'}>
                              {inv.totalAmount.toLocaleString()} {inv.currency}
                            </span>
                            {inv.currency === 'USD' && (
                              <div className="text-[9px] text-[#777]">
                                ≈ {(inv.totalAmount * exchangeRate).toLocaleString()} ل.س
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              inv.status === 'Audited'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {inv.status === 'Audited' ? 'مدققة / غير مسددة' : 'صادرة / غير مسددة'}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              id={`settle-invoice-${inv.id}`}
                              onClick={() => handleQuickSettle(inv.id)}
                              className="px-3 py-1 bg-[#1A2E26] hover:bg-[#00FFD1] text-[#00FFD1] hover:text-black border border-[#00FFD1]/40 rounded font-mono font-bold text-[10px] transition flex items-center gap-1 mx-auto"
                              title="تأكيد تحصيل المبلغ وتسوية الفاتورة في النظام المحاسبي"
                            >
                              <Check className="w-3 h-3" />
                              <span>تسوية وتحصيل (SETTLE)</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Summary Bar within drawer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#141414] rounded-lg border border-[#222] text-xs">
              <div className="flex items-center gap-2 text-[#AAA]">
                <Activity className="w-4 h-4 text-[#00FFD1]" />
                <span>
                  ملاحظة للمحاسب: يؤدي تسوية الفواتير المحصلة فوراً إلى تحديث فجوة السيولة النقدية وإلغاء حالة التحذير.
                </span>
              </div>
              <div className="text-[11px] font-mono text-white">
                إجمالي المعلق: <strong className="text-amber-400">{totalUnpaidBalanceSYP.toLocaleString()}</strong> ل.س
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
