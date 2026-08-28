import React, { useState, useMemo } from 'react';
import { EngineerRecord, BranchCode, InvoiceRecord, PayOrderRecord, SyndicateDepositRecord, FundStatus } from '../types';
import { calculateCOSafety } from '../utils/calculations';
import { ShieldCheck, RotateCcw, CheckCircle, Printer, FileText } from 'lucide-react';

interface COModelViewProps {
  engineers: EngineerRecord[];
  currentBranch: BranchCode;
  exchangeRate: number;
  userName: string;
  onIssueInvoice: (inv: InvoiceRecord) => void;
  onIssuePayOrder: (epo: PayOrderRecord) => void;
  onIssueDeposit: (sfd: SyndicateDepositRecord, contributions: any[]) => void;
  onViewDocument: (docId: string, docType: 'INV' | 'EPO' | 'SFD', payload: any) => void;
  nextInvoiceNum: string;
  nextPayOrderNum: string;
  nextDepositNum: string;
}

export const COModelView: React.FC<COModelViewProps> = ({
  engineers,
  currentBranch,
  exchangeRate,
  userName,
  onIssueInvoice,
  onIssuePayOrder,
  onIssueDeposit,
  onViewDocument,
  nextInvoiceNum,
  nextPayOrderNum,
  nextDepositNum
}) => {
  const [totalArea, setTotalArea] = useState<number>(300);
  const [unitRateUSD, setUnitRateUSD] = useState<number>(0.50);
  const [clientName, setClientName] = useState('جهاد عبد الله المحمود');
  const [clientPhone, setClientPhone] = useState('0988123789');
  const [zoneLoc, setZoneLoc] = useState('الحسكة - غويران');
  const [parcelNo, setParcelNo] = useState<number>(14);
  const [propNo, setPropNo] = useState<number>(890);

  // 4 Equal Shares (25% each)
  const [leadCiv, setLeadCiv] = useState('دلال محمد صالح فرحو');
  const [secCiv, setSecCiv] = useState('هيفي عابد احمد');
  const [geotechEng, setGeotechEng] = useState('هبون عدنان الاحمد');
  const [archEng, setArchEng] = useState('عبد الحليم صبري ابراهيم');

  const [issuedInvId, setIssuedInvId] = useState<string | null>(null);
  const [issuedEpoId, setIssuedEpoId] = useState<string | null>(null);
  const [issuedSfdId, setIssuedSfdId] = useState<string | null>(null);

  const getEngMeta = (name: string): { role: string; fundStatus: FundStatus } => {
    const found = engineers.find(e => e.fullName === name);
    if (!found) return { role: '', fundStatus: 'داخل' };
    return { role: found.roleQualification, fundStatus: found.fundStatus };
  };

  const coResult = useMemo(() => {
    const studyMap: Record<string, { name: string; fundStatus: FundStatus }> = {
      lead_civ: { name: leadCiv, fundStatus: getEngMeta(leadCiv).fundStatus },
      sec_civ: { name: secCiv, fundStatus: getEngMeta(secCiv).fundStatus },
      geotech: { name: geotechEng, fundStatus: getEngMeta(geotechEng).fundStatus },
      arch: { name: archEng, fundStatus: getEngMeta(archEng).fundStatus },
    };

    return calculateCOSafety(totalArea, unitRateUSD, exchangeRate, studyMap);
  }, [totalArea, unitRateUSD, exchangeRate, leadCiv, secCiv, geotechEng, archEng]);

  const isFormValid = totalArea > 0 && clientName.trim() !== '';

  const handleIssueInvoice = () => {
    if (!isFormValid) return;
    const invId = nextInvoiceNum;
    const now = new Date();
    const newInv: InvoiceRecord = {
      id: `inv-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour12: false }),
      invoiceNumber: invId,
      clientName,
      clientPhone,
      totalAmount: coResult.grandTotalSYP,
      currency: 'SYP',
      branchCode: currentBranch,
      modelType: 'CO Construction Safety',
      status: 'Issued',
      issuedBy: userName
    };
    onIssueInvoice(newInv);
    setIssuedInvId(invId);
  };

  const handleIssuePayOrder = () => {
    if (!issuedInvId) return;
    const serial = issuedInvId.split('-').pop() || '0001';
    const epoId = `EPO-${currentBranch}-2026-${serial}`;
    const now = new Date();

    const breakdown = coResult.pipelines.map(p => ({
      engineerName: p.studyEngName,
      discipline: p.disciplineAr,
      role: 'دراسة وفحص',
      netAmount: p.netStudyFee
    }));

    const newEpo: PayOrderRecord = {
      id: `epo-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour12: false }),
      payOrderNumber: epoId,
      relatedInvoice: issuedInvId,
      totalAmount: coResult.totalEngineersNet,
      currency: 'SYP',
      branchCode: currentBranch,
      modelType: 'CO Construction Safety',
      status: 'Issued',
      issuedBy: userName,
      breakdown
    };

    onIssuePayOrder(newEpo);
    setIssuedEpoId(epoId);
  };

  const handleIssueDeposit = () => {
    if (!issuedInvId || !issuedEpoId) return;
    const serial = issuedInvId.split('-').pop() || '0001';
    const sfdId = `SFD-${currentBranch}-2026-${serial}`;
    const now = new Date();

    const fundsBreakdown = [
      { fundName: 'رسوم الوحدة والنقابة (10%)', amount: coResult.syndicateFees, description: 'الرسوم الإدارية' },
      { fundName: 'صندوق المشترك للسلامة الإنشائية', amount: coResult.totalFundFees, description: 'اشتراك الصندوق المشترك' }
    ];

    const newSfd: SyndicateDepositRecord = {
      id: `sfd-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour12: false }),
      depositNumber: sfdId,
      relatedInvoice: issuedInvId,
      totalAmount: coResult.syndicateDepositTotal,
      currency: 'SYP',
      branchCode: currentBranch,
      modelType: 'CO Construction Safety',
      issuedBy: userName,
      fundsBreakdown
    };

    onIssueDeposit(newSfd, []);
    setIssuedSfdId(sfdId);
  };

  return (
    <div className="space-y-6">
      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Output Client */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-xs text-blue-950 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>حساب العميل (تقرير السلامة الإنشائية)</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-mono">INV</span>
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-950 space-y-1">
              <div>المساحة المحسوبة: <strong>{coResult.effectiveArea} م²</strong> {totalArea < 300 && <span className="text-amber-700">(تم تطبيق الحد الأدنى 300 م²)</span>}</div>
              <div>تكلفة الدراسة: <strong>${coResult.feeStudyUSD.toFixed(2)}</strong> = <strong>{coResult.feeStudySYP.toLocaleString()} ل.س</strong></div>
            </div>

            <table className="w-full text-right text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2">أتعاب دراسة السلامة ومطرقة شميدت</td>
                  <td className="p-2 text-left font-mono font-bold text-slate-800">{coResult.feeStudySYP.toLocaleString()} ل.س</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-2">رسوم الطباعة والتقرير الموحد</td>
                  <td className="p-2 text-left font-mono font-bold text-slate-800">{coResult.feePrintSYP.toLocaleString()} ل.س</td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold text-sm">
                  <td className="p-2.5">المجموع الكلي:</td>
                  <td className="p-2.5 text-left font-mono text-amber-300">{coResult.grandTotalSYP.toLocaleString()} ل.س</td>
                </tr>
              </tbody>
            </table>

            {issuedInvId ? (
              <div className="space-y-2">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2 rounded text-xs font-bold text-center">
                  تم إصدار الفاتورة: {issuedInvId}
                </div>
                <button
                  onClick={() => onViewDocument(issuedInvId, 'INV', {
                    invId: issuedInvId,
                    clientName,
                    clientPhone,
                    zoneLoc,
                    parcelNo,
                    propNo,
                    totalArea: coResult.effectiveArea,
                    projectType: 'تقرير السلامة الإنشائية ومطرقة شميدت',
                    clientItems: [
                      { label: `تقرير السلامة الإنشائية وفحص الخرسانة (${coResult.effectiveArea} م² × $${unitRateUSD})`, amount: coResult.feeStudySYP },
                      { label: 'رسوم طباعة التقرير الفني والمخططات', amount: coResult.feePrintSYP }
                    ],
                    grandTotal: coResult.grandTotalSYP
                  })}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded shadow flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>طباعة الفاتورة A4</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleIssueInvoice}
                disabled={!isFormValid}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 px-4 rounded-lg font-bold text-xs shadow transition flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>إصدار فاتورة السلامة - {nextInvoiceNum}</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Panel */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>لوحة إدخال تقرير السلامة الإنشائية (Construction Safety & Schmidt Hammer)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <h3 className="font-bold text-xs text-blue-900 border-b border-slate-200 pb-1">المساحة وسعر المتر</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">المساحة (م²):</label>
                    <input type="number" value={totalArea || ''} onChange={(e) => setTotalArea(Number(e.target.value))} className="w-full bg-white text-slate-900 font-mono font-bold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">السعر ($/م²):</label>
                    <input type="number" step="0.05" value={unitRateUSD} onChange={(e) => setUnitRateUSD(Number(e.target.value))} className="w-full bg-white text-slate-900 font-mono font-bold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <span className="text-[10.5px] text-slate-500 block">قاعدة السلامة: حد أدنى 300 م²</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <h3 className="font-bold text-xs text-blue-900 border-b border-slate-200 pb-1">بيانات صاحب العلاقة</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">الاسم:</label>
                    <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">الهاتف:</label>
                    <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full bg-white text-slate-900 font-mono font-bold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">المنطقة:</label>
                  <input type="text" value={zoneLoc} onChange={(e) => setZoneLoc(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" />
                </div>
              </div>
            </div>

            {/* 4 Equal Shares Engineers Selection */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
              <h3 className="font-bold text-xs text-blue-900 border-b border-slate-200 pb-1">فريق السلامة والتقرير (4 حصص متساوية 25% لكل عضو)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مدني استشاري رئيسي (25%):</label>
                  <select value={leadCiv} onChange={(e) => setLeadCiv(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    {engineers.filter(e => e.department === 'مدني' && (e.rank === 'استشاري' || e.roleQualification.includes('دراسة'))).map(e => (
                      <option key={e.id} value={e.fullName}>{e.fullName} ({e.rank})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مدني ممارس / مشارك (25%):</label>
                  <select value={secCiv} onChange={(e) => setSecCiv(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    {engineers.filter(e => e.department === 'مدني').map(e => (
                      <option key={e.id} value={e.fullName}>{e.fullName} ({e.rank})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">جيوتكنيك / فحص شميدت (25%):</label>
                  <select value={geotechEng} onChange={(e) => setGeotechEng(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    {engineers.filter(e => e.specialization.includes('جيوتكنيك') || e.specialization.includes('جيولوجيا') || e.department === 'مدني').map(e => (
                      <option key={e.id} value={e.fullName}>{e.fullName} ({e.rank})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">عمارة ومطابقة (25%):</label>
                  <select value={archEng} onChange={(e) => setArchEng(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    {engineers.filter(e => e.department === 'عمارة').map(e => (
                      <option key={e.id} value={e.fullName}>{e.fullName} ({e.rank})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-xs text-emerald-950 border-b border-slate-200 pb-2">الصناديق والرسوم النقابية (ل.س)</h3>
            <table className="w-full text-right text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2">رسوم الوحدة والنقابة (10%)</td>
                  <td className="p-2 text-left font-mono font-bold text-emerald-800">{coResult.syndicateFees.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2">صندوق السلامة الإنشائية المشترك</td>
                  <td className="p-2 text-left font-mono font-bold text-slate-800">{coResult.totalFundFees.toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="p-2.5">المجموع المودع بالصناديق:</td>
                  <td className="p-2.5 text-left font-mono text-emerald-400">{coResult.syndicateDepositTotal.toLocaleString()} ل.س</td>
                </tr>
              </tbody>
            </table>
            {issuedEpoId && !issuedSfdId && (
              <button onClick={handleIssueDeposit} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-lg text-xs font-bold shadow">
                إصدار إيداع الرسوم - {nextDepositNum}
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-xs text-red-950 border-b border-slate-200 pb-2">صافي أتعاب فريق التقرير (أمر الصرف EPO)</h3>
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2">الدور والحصة</th>
                  <th className="p-2">اسم المهندس</th>
                  <th className="p-2 text-left">الإجمالي (25%)</th>
                  <th className="p-2 text-left">الطباعة</th>
                  <th className="p-2 text-left">صافي المهندس (ل.س)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coResult.pipelines.map((p, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-bold">{p.disciplineAr}</td>
                    <td className="p-2">{p.studyEngName} ({p.fundStatus})</td>
                    <td className="p-2 text-left font-mono">{p.grossAmount.toLocaleString()}</td>
                    <td className="p-2 text-left font-mono text-emerald-600">+{p.printShare.toLocaleString()}</td>
                    <td className="p-2 text-left font-mono font-bold text-blue-900 bg-blue-50/50">{p.netStudyFee.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-slate-900 text-white font-bold">
                  <td colSpan={4} className="p-2.5 text-right">إجمالي مستحقات أمر الصرف:</td>
                  <td className="p-2.5 text-left font-mono text-red-400">{coResult.totalEngineersNet.toLocaleString()} ل.س</td>
                </tr>
              </tbody>
            </table>

            {issuedInvId && !issuedEpoId && (
              <button onClick={handleIssuePayOrder} className="w-full bg-red-800 hover:bg-red-900 text-white py-2 px-3 rounded-lg text-xs font-bold shadow">
                إصدار أمر الصرف - {nextPayOrderNum}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
