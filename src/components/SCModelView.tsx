import React, { useState, useMemo } from 'react';
import { EngineerRecord, BranchCode, InvoiceRecord, PayOrderRecord, SyndicateDepositRecord, FundStatus } from '../types';
import { calculateSCContract } from '../utils/calculations';
import { HardHat, DollarSign, RotateCcw, CheckCircle, AlertTriangle, Printer, FileText } from 'lucide-react';

interface SCModelViewProps {
  engineers: EngineerRecord[];
  currentBranch: BranchCode;
  userName: string;
  onIssueInvoice: (inv: InvoiceRecord) => void;
  onIssuePayOrder: (epo: PayOrderRecord) => void;
  onIssueDeposit: (sfd: SyndicateDepositRecord, contributions: any[]) => void;
  onViewDocument: (docId: string, docType: 'INV' | 'EPO' | 'SFD', payload: any) => void;
  nextInvoiceNum: string;
  nextPayOrderNum: string;
  nextDepositNum: string;
}

export const SCModelView: React.FC<SCModelViewProps> = ({
  engineers,
  currentBranch,
  userName,
  onIssueInvoice,
  onIssuePayOrder,
  onIssueDeposit,
  onViewDocument,
  nextInvoiceNum,
  nextPayOrderNum,
  nextDepositNum
}) => {
  const [projectType, setProjectType] = useState('سكني وجمعيات');
  const [unitRateUSD, setUnitRateUSD] = useState<number>(2.40);
  const [totalArea, setTotalArea] = useState<number>(400);
  const [builtArea, setBuiltArea] = useState<number>(200);
  const [floorsCount, setFloorsCount] = useState<number>(4);

  const [clientName, setClientName] = useState('كاوا احمد صالح');
  const [clientPhone, setClientPhone] = useState('0932738559');
  const [zoneLoc, setZoneLoc] = useState('القامشلي - السياحي');
  const [parcelNo, setParcelNo] = useState<number>(12);
  const [propNo, setPropNo] = useState<number>(680);

  // 5 Disciplines Team
  const [engCiv, setEngCiv] = useState('كاوا احمد صالح');
  const [engArc, setEngArc] = useState('ذاكرة محمد ولو');
  const [engMec, setEngMec] = useState('محمود سالم الابراهيم');
  const [engEle, setEngEle] = useState('محمد بشير سمعو ملا احمد');
  const [engWat, setEngWat] = useState('هيفي عابد احمد');

  // Coaches
  const [coachCiv, setCoachCiv] = useState('رزقو الياس ججو');
  const [coachArc, setCoachArc] = useState('لا يستوجب');
  const [coachMec, setCoachMec] = useState('محمود سالم الابراهيم');
  const [coachEle, setCoachEle] = useState('عبد الرحمن محمد ولو');
  const [coachWat, setCoachWat] = useState('عبد المناف بكر سليمان');

  const [issuedInvId, setIssuedInvId] = useState<string | null>(null);
  const [issuedEpoId, setIssuedEpoId] = useState<string | null>(null);
  const [issuedSfdId, setIssuedSfdId] = useState<string | null>(null);

  const getEngMeta = (name: string): { role: string; fundStatus: FundStatus } => {
    const found = engineers.find(e => e.fullName === name);
    if (!found) return { role: '', fundStatus: 'داخل' };
    return { role: found.roleQualification, fundStatus: found.fundStatus };
  };

  const scResult = useMemo(() => {
    const studyMap: Record<string, { name: string; fundStatus: FundStatus }> = {
      civ: { name: engCiv, fundStatus: getEngMeta(engCiv).fundStatus },
      arc: { name: engArc, fundStatus: getEngMeta(engArc).fundStatus },
      mec: { name: engMec, fundStatus: getEngMeta(engMec).fundStatus },
      ele: { name: engEle, fundStatus: getEngMeta(engEle).fundStatus },
      wat: { name: engWat, fundStatus: getEngMeta(engWat).fundStatus },
    };

    const coachMap: Record<string, string> = {
      civ: coachCiv,
      arc: coachArc,
      mec: coachMec,
      ele: coachEle,
      wat: coachWat,
    };

    return calculateSCContract(totalArea, builtArea, unitRateUSD, studyMap, coachMap);
  }, [totalArea, builtArea, unitRateUSD, engCiv, engArc, engMec, engEle, engWat, coachCiv, coachArc, coachMec, coachEle, coachWat]);

  const isFormValid = totalArea > 0 && clientName.trim() !== '' && clientPhone.trim() !== '';

  const handleReset = () => {
    setClientName('');
    setClientPhone('');
    setZoneLoc('');
    setParcelNo(0);
    setPropNo(0);
    setTotalArea(0);
    setBuiltArea(0);
    setFloorsCount(0);

    // Reset engineer selections to defaults
    setEngCiv('كاوا احمد صالح');
    setEngArc('ذاكرة محمد ولو');
    setEngMec('محمود سالم الابراهيم');
    setEngEle('محمد بشير سمعو ملا احمد');
    setEngWat('هيفي عابد احمد');

    setCoachCiv('رزقو الياس ججو');
    setCoachArc('لا يستوجب');
    setCoachMec('محمود سالم الابراهيم');
    setCoachEle('عبد الرحمن محمد ولو');
    setCoachWat('عبد المناف بكر سليمان');

    setIssuedInvId(null);
    setIssuedEpoId(null);
    setIssuedSfdId(null);
  };

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
      totalAmount: scResult.grandTotalUSD,
      currency: 'USD',
      branchCode: currentBranch,
      modelType: 'SC Supervision Contract ($)',
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

    const breakdown = scResult.pipelines.flatMap(p => {
      const items: any[] = [];
      items.push({
        engineerName: p.studyEngName,
        discipline: p.disciplineAr,
        role: 'إشراف',
        netAmount: p.netStudyFee
      });
      if (p.hasCoach && p.netCoachFee > 0) {
        items.push({
          engineerName: p.coachEngName,
          discipline: `مشرف ${p.disciplineAr}`,
          role: 'تدريب',
          netAmount: p.netCoachFee
        });
      }
      return items;
    });

    const newEpo: PayOrderRecord = {
      id: `epo-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour12: false }),
      payOrderNumber: epoId,
      relatedInvoice: issuedInvId,
      totalAmount: scResult.totalEngineersNet,
      currency: 'USD',
      branchCode: currentBranch,
      modelType: 'SC Supervision Contract ($)',
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
      { fundName: 'رسوم الوحدة والنقابة (7.5%)', amount: scResult.syndicateFees, description: 'الرسوم الإدارية' },
      { fundName: 'صندوق المدني والعمارة والمائية', amount: scResult.fundCivArc, description: 'اشتراك الصندوق المشترك' },
      { fundName: 'صندوق الميكانيك والكهرباء', amount: scResult.fundMecEle, description: 'اشتراك الصندوق المشترك' }
    ];

    const contributions: any[] = [];
    const dateStr = now.toISOString().split('T')[0];

    scResult.pipelines.forEach(p => {
      contributions.push({
        id: `contrib-${Date.now()}-${Math.random()}`,
        date: dateStr,
        depositId: sfdId,
        relatedInvoice: issuedInvId,
        branch: currentBranch,
        modelType: 'SC Supervision Contract ($)',
        fundName: 'صندوق الإشراف المشترك',
        engineerName: p.studyEngName,
        discipline: p.disciplineAr,
        roleType: 'إشراف',
        fundStatus: p.fundStatus,
        amount: p.fundFee,
        currency: 'USD'
      });
    });

    const newSfd: SyndicateDepositRecord = {
      id: `sfd-${Date.now()}`,
      date: dateStr,
      time: now.toLocaleTimeString('en-US', { hour12: false }),
      depositNumber: sfdId,
      relatedInvoice: issuedInvId,
      totalAmount: scResult.syndicateDepositTotal,
      currency: 'USD',
      branchCode: currentBranch,
      modelType: 'SC Supervision Contract ($)',
      issuedBy: userName,
      fundsBreakdown
    };

    onIssueDeposit(newSfd, contributions);
    setIssuedSfdId(sfdId);
  };

  return (
    <div className="space-y-6">
      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Output Client Panel */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-blue-200 px-4 py-3 border-b border-blue-800 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide flex items-center gap-2 text-white">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>حساب العميل (عقد الإشراف بالدولار $)</span>
              </h2>
              <span className="text-[11px] font-semibold bg-blue-800 text-blue-200 px-2 py-0.5 rounded">
                USD ($)
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2">البيان</th>
                        <th className="p-2 text-left">القيمة ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2">الإشراف الإنشائي والمعماري والميكانيكي والكهربائي</td>
                        <td className="p-2 text-left font-mono font-bold">${scResult.feeBasicUSD.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2">الإشراف المائي والصحي</td>
                        <td className="p-2 text-left font-mono font-bold">${scResult.feeWaterUSD.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-slate-900 text-white font-bold text-sm">
                        <td className="p-3 text-right">الإجمالي الكلي ($):</td>
                        <td className="p-3 text-left font-mono text-emerald-400">${scResult.grandTotalUSD.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Invoice Button */}
                <div className="pt-2">
                  {issuedInvId ? (
                    <div className="space-y-2">
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-lg text-xs font-bold flex justify-between">
                        <span>تم إصدار فاتورة الإشراف:</span>
                        <span className="font-mono">{issuedInvId}</span>
                      </div>
                      <button
                        onClick={() => onViewDocument(issuedInvId, 'INV', {
                          invId: issuedInvId,
                          clientName,
                          clientPhone,
                          zoneLoc,
                          parcelNo,
                          propNo,
                          totalArea,
                          builtArea,
                          floorsCount,
                          projectType,
                          clientItems: [
                            { label: 'الإشراف الإنشائي والمعماري والميكانيكي والكهربائي', amount: scResult.feeBasicUSD },
                            { label: 'الإشراف المائي والصحي', amount: scResult.feeWaterUSD }
                          ],
                          grandTotal: scResult.grandTotalUSD,
                          currency: 'USD'
                        })}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-lg shadow flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-4 h-4 text-emerald-400" />
                        <span>طباعة فاتورة الإشراف A4 ($)</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleIssueInvoice}
                      disabled={!isFormValid}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 px-4 rounded-lg font-bold text-xs shadow transition flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-emerald-300" />
                      <span>إصدار فاتورة الإشراف ($) - {nextInvoiceNum}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Panel */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-400" />
                <span>لوحة إدخال عقد الإشراف والسلامة (Supervision Contract)</span>
              </h2>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs transition border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>إعادة تعيين</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <h3 className="font-bold text-xs text-blue-900 border-b border-slate-200 pb-1">بيانات العقد</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">صفة المشروع:</label>
                      <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        <option value="سكني وجمعيات">سكني وجمعيات</option>
                        <option value="سكن ريفي">سكن ريفي</option>
                        <option value="سكني وتجاري">سكني وتجاري</option>
                        <option value="منشآت خاصة">منشآت خاصة</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">سعر المتر ($):</label>
                      <input type="number" step="0.1" value={unitRateUSD} onChange={(e) => setUnitRateUSD(Number(e.target.value))} className="w-full bg-white text-slate-900 font-mono font-bold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">المساحة الكلية:</label>
                      <input type="number" value={totalArea || ''} onChange={(e) => setTotalArea(Number(e.target.value))} className="w-full bg-white text-slate-900 font-mono font-bold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">مساحة البناء:</label>
                      <input type="number" value={builtArea || ''} onChange={(e) => setBuiltArea(Number(e.target.value))} className="w-full bg-white text-slate-900 font-mono font-bold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">عدد الطوابق:</label>
                      <input type="number" value={floorsCount || ''} onChange={(e) => setFloorsCount(Number(e.target.value))} className="w-full bg-white text-slate-900 font-mono font-bold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <h3 className="font-bold text-xs text-blue-900 border-b border-slate-200 pb-1">بيانات صاحب العلاقة</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">صاحب العلاقة:</label>
                      <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">رقم الهاتف:</label>
                      <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full bg-white text-slate-900 font-mono font-bold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">المنطقة العقارية:</label>
                    <input type="text" value={zoneLoc} onChange={(e) => setZoneLoc(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" />
                  </div>
                </div>
              </div>

              {/* 5 Disciplines Team Selection */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <h3 className="font-bold text-xs text-blue-900 border-b border-slate-200 pb-1">فريق الإشراف الميداني (5 اختصاصات)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس المدني:</label>
                    <select value={engCiv} onChange={(e) => setEngCiv(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      {engineers.filter(e => e.department === 'مدني').map(e => (
                        <option key={e.id} value={e.fullName}>{e.fullName} ({e.rank})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مشرف المدني (عند اللزوم):</label>
                    <select value={coachCiv} onChange={(e) => setCoachCiv(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <option value="لا يستوجب">لا يستوجب</option>
                      {engineers.filter(e => e.department === 'مدني' && e.roleQualification.includes('تدريب')).map(e => (
                        <option key={e.id} value={e.fullName}>{e.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس العمارة:</label>
                    <select value={engArc} onChange={(e) => setEngArc(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      {engineers.filter(e => e.department === 'عمارة').map(e => (
                        <option key={e.id} value={e.fullName}>{e.fullName} ({e.rank})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس الميكانيك:</label>
                    <select value={engMec} onChange={(e) => setEngMec(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      {engineers.filter(e => e.department === 'ميكانيك').map(e => (
                        <option key={e.id} value={e.fullName}>{e.fullName} ({e.rank})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس الكهرباء:</label>
                    <select value={engEle} onChange={(e) => setEngEle(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      {engineers.filter(e => e.department === 'كهرباء').map(e => (
                        <option key={e.id} value={e.fullName}>{e.fullName} ({e.rank})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس المائية:</label>
                    <select value={engWat} onChange={(e) => setEngWat(e.target.value)} className="w-full bg-white text-slate-900 font-semibold border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      {engineers.filter(e => e.specialization.includes('مائية') || e.department === 'مدني').map(e => (
                        <option key={e.id} value={e.fullName}>{e.fullName} ({e.rank})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Bottom Output Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Syndicate Deposit Panel */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-xs text-emerald-950 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>الرسوم والصناديق النقابية ($)</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono">SFD</span>
            </h3>
            <table className="w-full text-right text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2">رسوم الوحدة والنقابة (7.5%)</td>
                  <td className="p-2 text-left font-mono font-bold text-emerald-800">${scResult.syndicateFees.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2">صندوق المدني والعمارة والمائية</td>
                  <td className="p-2 text-left font-mono font-bold text-slate-800">${scResult.fundCivArc.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2">صندوق الميكانيك والكهرباء</td>
                  <td className="p-2 text-left font-mono font-bold text-slate-800">${scResult.fundMecEle.toFixed(2)}</td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="p-2.5">المجموع المودع بالصناديق ($):</td>
                  <td className="p-2.5 text-left font-mono text-emerald-400">${scResult.syndicateDepositTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {issuedEpoId && !issuedSfdId && (
              <button onClick={handleIssueDeposit} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-lg text-xs font-bold shadow">
                إصدار إشعار إيداع الرسوم ($) - {nextDepositNum}
              </button>
            )}
            {issuedSfdId && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2 rounded text-xs font-bold text-center">
                تم إصدار الإيداع: {issuedSfdId}
              </div>
            )}
          </div>
        </div>

        {/* Engineers Payout Panel */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-xs text-red-950 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>صافي أتعاب مهندسي الإشراف (Pay Order in USD $)</span>
              <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded font-mono">EPO</span>
            </h3>
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2">الاختصاص</th>
                  <th className="p-2">اسم المهندس</th>
                  <th className="p-2 text-left">الإجمالي ($)</th>
                  <th className="p-2 text-left">النقابة (7.5%)</th>
                  <th className="p-2 text-left">الصندوق</th>
                  <th className="p-2 text-left">صافي المهندس ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scResult.pipelines.map((p, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-bold">{p.disciplineAr}</td>
                    <td className="p-2">{p.studyEngName} ({p.fundStatus})</td>
                    <td className="p-2 text-left font-mono">${p.grossAmount.toFixed(2)}</td>
                    <td className="p-2 text-left font-mono text-red-600">-${p.syndicateFee.toFixed(2)}</td>
                    <td className="p-2 text-left font-mono text-amber-600">-${p.fundFee.toFixed(2)}</td>
                    <td className="p-2 text-left font-mono font-bold text-blue-900 bg-blue-50/50">${p.netStudyFee.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-900 text-white font-bold">
                  <td colSpan={5} className="p-2.5 text-right">إجمالي مستحقات أمر الصرف ($):</td>
                  <td className="p-2.5 text-left font-mono text-red-400">${scResult.totalEngineersNet.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {issuedInvId && !issuedEpoId && (
              <button onClick={handleIssuePayOrder} className="w-full bg-red-800 hover:bg-red-900 text-white py-2 px-3 rounded-lg text-xs font-bold shadow">
                إصدار أمر صرف الإشراف ($) - {nextPayOrderNum}
              </button>
            )}
            {issuedEpoId && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2 rounded text-xs font-bold text-center">
                تم إصدار أمر الصرف: {issuedEpoId}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
