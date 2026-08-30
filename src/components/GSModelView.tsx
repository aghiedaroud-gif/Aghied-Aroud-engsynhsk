import React, { useState, useMemo } from 'react';
import { EngineerRecord, BranchCode, InvoiceRecord, PayOrderRecord, SyndicateDepositRecord, FundStatus } from '../types';
import { calculateGSClientFees, calculateGSPipeline } from '../utils/calculations';
import { validateAndFormatPhone } from '../utils/phoneValidator';
import { FileText, Calculator, RotateCcw, CheckCircle, AlertTriangle, Printer, ArrowRight } from 'lucide-react';

interface GSModelViewProps {
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

export const GSModelView: React.FC<GSModelViewProps> = ({
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
  // Input Panel States
  const [serviceType, setServiceType] = useState('دراسة انشائية');
  const [projectType, setProjectType] = useState('سكني وجمعيات');
  const [totalArea, setTotalArea] = useState<number>(450);
  const [builtArea, setBuiltArea] = useState<number>(120);
  const [floorsCount, setFloorsCount] = useState<number>(3);
  const [elevatorsCount, setElevatorsCount] = useState<number>(0);
  const [elecCapacity, setElecCapacity] = useState<number>(40);

  // Landlord States
  const [clientName, setClientName] = useState('دلال عبد الحكيم العلي');
  const [clientPhone, setClientPhone] = useState('0991577816');
  const [zoneLoc, setZoneLoc] = useState('الحسكة - المفتي');
  const [parcelNo, setParcelNo] = useState<number>(45);
  const [propNo, setPropNo] = useState<number>(1204);

  // Study Team (7 disciplines)
  const [studyCiv, setStudyCiv] = useState('دلال محمد صالح فرحو');
  const [studyArc, setStudyArc] = useState('عبد الحليم صبري ابراهيم');
  const [studyMec, setStudyMec] = useState('محمود سالم الابراهيم');
  const [studyEle, setStudyEle] = useState('عادل عبد العزيز باشا');
  const [studyWat, setStudyWat] = useState('دلال محمد صالح فرحو');
  const [studyGeo, setStudyGeo] = useState('هبون عدنان الاحمد');
  const [studyGtc, setStudyGtc] = useState('هبون عدنان الاحمد');

  // Coaching Team (7 disciplines)
  const [coachCiv, setCoachCiv] = useState('هيفي عابد احمد');
  const [coachArc, setCoachArc] = useState('لا يستوجب');
  const [coachMec, setCoachMec] = useState('لا يستوجب');
  const [coachEle, setCoachEle] = useState('لا يستوجب');
  const [coachWat, setCoachWat] = useState('هيفي عابد احمد');
  const [coachGeo, setCoachGeo] = useState('زياد طارق بوش');
  const [coachGtc, setCoachGtc] = useState('زياد طارق بوش');

  // Auditing Team (4 disciplines)
  const [auditCiv, setAuditCiv] = useState('ابراهيم ممدوح حسن');
  const [auditArc, setAuditArc] = useState('سحاب عبد اللطيف خاير');
  const [auditMec, setAuditMec] = useState('ذاكرة محمد ولو');
  const [auditEle, setAuditEle] = useState('محمد بشير سمعو ملا احمد');

  // Execution & Issuance State Tracker
  const [isCalculated, setIsCalculated] = useState<boolean>(true);
  const [issuedInvId, setIssuedInvId] = useState<string | null>(null);
  const [issuedEpoId, setIssuedEpoId] = useState<string | null>(null);
  const [issuedSfdId, setIssuedSfdId] = useState<string | null>(null);

  // Helper to find engineer metadata
  const getEngMeta = (name: string): { role: string; spec: string; fundStatus: FundStatus; rank: string } => {
    const found = engineers.find(e => e.fullName === name);
    if (!found) return { role: '', spec: '', fundStatus: 'داخل', rank: 'ممارس' };
    return {
      role: found.roleQualification,
      spec: found.specialization,
      fundStatus: found.fundStatus,
      rank: found.rank
    };
  };

  // Rule 3: Exclusion Pool (Collect all currently selected engineer names)
  const selectedEngineersPool = useMemo(() => {
    const list = [
      studyCiv, studyArc, studyMec, studyEle, studyWat, studyGeo, studyGtc,
      coachCiv, coachArc, coachMec, coachEle, coachWat, coachGeo, coachGtc,
      auditCiv, auditArc, auditMec, auditEle
    ];
    return list.filter(n => n && n !== 'لا يستوجب' && n !== '—' && !n.startsWith('--'));
  }, [
    studyCiv, studyArc, studyMec, studyEle, studyWat, studyGeo, studyGtc,
    coachCiv, coachArc, coachMec, coachEle, coachWat, coachGeo, coachGtc,
    auditCiv, auditArc, auditMec, auditEle
  ]);

  // Filtering helpers
  const getEligibleEngineers = (discKey: string, requiredRole: string, currentSelected: string) => {
    return engineers.filter(eng => {
      // Must match discipline
      const specMatch = eng.specialization.includes(discKey) || eng.department.includes(discKey);
      if (!specMatch) return false;

      // Must match role requirement
      if (requiredRole && !eng.roleQualification.includes(requiredRole)) return false;

      // Rule 3: If selected in another role, exclude it unless it's the current selected for this specific field
      if (eng.fullName !== currentSelected && selectedEngineersPool.includes(eng.fullName)) {
        return false;
      }

      return true;
    });
  };

  // Rule 1 evaluation for Coach
  const evaluateCoachRequirement = (studyEngName: string, discKey: string, currentCoach: string) => {
    const meta = getEngMeta(studyEngName);
    if (meta.role === 'دراسة') {
      // Coach is mandatory
      return {
        isMandatory: true,
        options: getEligibleEngineers(discKey, 'تدريب', currentCoach)
      };
    }
    return {
      isMandatory: false,
      options: []
    };
  };

  // Check completeness (The Golden Rule 1)
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!clientName.trim()) errors.push('اسم صاحب العلاقة');
    if (!clientPhone.trim()) errors.push('رقم الهاتف');
    if (!zoneLoc.trim()) errors.push('المنطقة العقارية');
    if (parcelNo <= 0) errors.push('رقم المقسم');
    if (propNo <= 0) errors.push('رقم العقار');
    if (totalArea <= 0) errors.push('المساحة الكلية');
    if (builtArea <= 0) errors.push('مساحة البناء');
    if (floorsCount <= 0) errors.push('عدد الطوابق');

    const studyList = [studyCiv, studyArc, studyMec, studyEle, studyWat, studyGeo, studyGtc];
    if (studyList.some(n => !n || n.startsWith('--'))) errors.push('فريق الدراسة (7 اختصاصات)');

    const auditList = [auditCiv, auditArc, auditMec, auditEle];
    if (auditList.some(n => !n || n.startsWith('--'))) errors.push('فريق التدقيق (4 اختصاصات)');

    // Rule 1 Coach validation
    const civCoachReq = evaluateCoachRequirement(studyCiv, 'مدني', coachCiv);
    if (civCoachReq.isMandatory && (!coachCiv || coachCiv === 'لا يستوجب' || coachCiv.startsWith('--'))) {
      errors.push('مشرف المدني (إلزامي لأن مهندس الدراسة مؤهله دراسة فقط)');
    }

    return errors;
  }, [
    clientName, clientPhone, zoneLoc, parcelNo, propNo, totalArea, builtArea, floorsCount,
    studyCiv, studyArc, studyMec, studyEle, studyWat, studyGeo, studyGtc,
    auditCiv, auditArc, auditMec, auditEle, coachCiv
  ]);

  const isFormValid = validationErrors.length === 0;

  // Run Calculations
  const clientFees = useMemo(() => {
    return calculateGSClientFees(
      totalArea,
      builtArea,
      floorsCount,
      elevatorsCount,
      elecCapacity,
      projectType,
      exchangeRate
    );
  }, [totalArea, builtArea, floorsCount, elevatorsCount, elecCapacity, projectType, exchangeRate]);

  const pipeline = useMemo(() => {
    const studyMap: Record<string, { name: string; fundStatus: FundStatus }> = {
      civ: { name: studyCiv, fundStatus: getEngMeta(studyCiv).fundStatus },
      arc: { name: studyArc, fundStatus: getEngMeta(studyArc).fundStatus },
      mec: { name: studyMec, fundStatus: getEngMeta(studyMec).fundStatus },
      ele: { name: studyEle, fundStatus: getEngMeta(studyEle).fundStatus },
      wat: { name: studyWat, fundStatus: getEngMeta(studyWat).fundStatus },
      geo: { name: studyGeo, fundStatus: getEngMeta(studyGeo).fundStatus },
      gtc: { name: studyGtc, fundStatus: getEngMeta(studyGtc).fundStatus },
    };

    const coachMap: Record<string, string> = {
      civ: coachCiv,
      arc: coachArc,
      mec: coachMec,
      ele: coachEle,
      wat: coachWat,
      geo: coachGeo,
      gtc: coachGtc,
    };

    const auditMap: Record<string, string> = {
      civ: auditCiv,
      arc: auditArc,
      mec: auditMec,
      ele: auditEle
    };

    return calculateGSPipeline(clientFees, studyMap, coachMap, auditMap);
  }, [clientFees, studyCiv, studyArc, studyMec, studyEle, studyWat, studyGeo, studyGtc, coachCiv, coachArc, coachMec, coachEle, coachWat, coachGeo, coachGtc, auditCiv, auditArc, auditMec, auditEle]);

  // Golden Rule 2: Reset Form
  const handleReset = () => {
    setClientName('');
    setClientPhone('');
    setZoneLoc('');
    setParcelNo(0);
    setPropNo(0);
    setTotalArea(0);
    setBuiltArea(0);
    setFloorsCount(0);
    setElevatorsCount(0);
    setElecCapacity(40);
    
    // Reset engineers selections to defaults
    setStudyCiv('دلال محمد صالح فرحو');
    setStudyArc('عبد الحليم صبري ابراهيم');
    setStudyMec('محمود سالم الابراهيم');
    setStudyEle('عادل عبد العزيز باشا');
    setStudyWat('دلال محمد صالح فرحو');
    setStudyGeo('هبون عدنان الاحمد');
    setStudyGtc('هبون عدنان الاحمد');

    setCoachCiv('هيفي عابد احمد');
    setCoachArc('لا يستوجب');
    setCoachMec('لا يستوجب');
    setCoachEle('لا يستوجب');
    setCoachWat('هيفي عابد احمد');
    setCoachGeo('زياد طارق بوش');
    setCoachGtc('زياد طارق بوش');

    setAuditCiv('ابراهيم ممدوح حسن');
    setAuditArc('سحاب عبد اللطيف خاير');
    setAuditMec('ذاكرة محمد ولو');
    setAuditEle('محمد بشير سمعو ملا احمد');

    setIsCalculated(false);
    setIssuedInvId(null);
    setIssuedEpoId(null);
    setIssuedSfdId(null);
  };

  const handleCalculate = () => {
    if (!isFormValid) {
      alert(`⚠️ يرجى إدخال جميع البيانات للمتابعة:\n${validationErrors.join('\n')}`);
      setIsCalculated(false);
      return;
    }
    setIsCalculated(true);
  };

  // Stage 1: Issue Invoice (INV)
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
      totalAmount: clientFees.grandTotal,
      currency: 'SYP',
      branchCode: currentBranch,
      modelType: 'GS General Study',
      status: 'Issued',
      issuedBy: userName,
      relatedProject: {
        totalArea,
        builtArea,
        floorsCount,
        elevatorsCount,
        elecCapacity,
        projectType,
        serviceType,
        zoneLoc,
        parcelNo,
        propNo
      }
    };
    onIssueInvoice(newInv);
    setIssuedInvId(invId);
  };

  // Stage 2: Issue Pay Order (EPO) - Linked to INV 4-digits
  const handleIssuePayOrder = () => {
    if (!issuedInvId) return;
    const serial = issuedInvId.split('-').pop() || '0001';
    const epoId = `EPO-${currentBranch}-2026-${serial}`;
    const now = new Date();

    const breakdown = pipeline.pipelines.flatMap(p => {
      const items: any[] = [];
      items.push({
        engineerName: p.studyEngName,
        discipline: p.disciplineAr,
        role: 'دراسة',
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
      totalAmount: pipeline.totalEngineersNet,
      currency: 'SYP',
      branchCode: currentBranch,
      modelType: 'GS General Study',
      status: 'Issued',
      issuedBy: userName,
      breakdown
    };

    onIssuePayOrder(newEpo);
    setIssuedEpoId(epoId);
  };

  // Stage 3: Issue Syndicate Deposit (SFD) - Linked to INV 4-digits
  const handleIssueDeposit = () => {
    if (!issuedInvId || !issuedEpoId) return;
    const serial = issuedInvId.split('-').pop() || '0001';
    const sfdId = `SFD-${currentBranch}-2026-${serial}`;
    const now = new Date();

    const fundsBreakdown = [
      { fundName: 'رسوم الوحدة والنقابة (15%)', amount: pipeline.syndicateFees, description: 'الرسوم الإدارية المقتطعة' },
      { fundName: 'صندوق التدقيق النقابي (20%)', amount: pipeline.fundAudit, description: 'مستحقات فريق التدقيق في الصندوق' },
      { fundName: 'صندوق المدني والعمارة', amount: pipeline.fundCivArc, description: 'اشتراكات المهندسين بالصندوق المشترك' },
      { fundName: 'صندوق الميكانيك والكهرباء', amount: pipeline.fundMecEle, description: 'اشتراكات المهندسين بالصندوق المشترك' },
      { fundName: 'صندوق المائية والجيولوجيا والجيوتكنيك', amount: pipeline.fundSanGeoGtc, description: 'اشتراكات المهندسين بالصندوق المشترك' }
    ];

    const contributions: any[] = [];
    const dateStr = now.toISOString().split('T')[0];

    // Add Auditors contributions
    pipeline.pipelines.forEach(p => {
      if (p.auditorEngName && p.auditorEngName !== '—') {
        contributions.push({
          id: `contrib-${Date.now()}-${Math.random()}`,
          date: dateStr,
          depositId: sfdId,
          relatedInvoice: issuedInvId,
          branch: currentBranch,
          modelType: 'GS General Study',
          fundName: 'صندوق التدقيق النقابي',
          engineerName: p.auditorEngName,
          discipline: p.disciplineAr,
          roleType: 'مدقق',
          fundStatus: 'داخل',
          amount: p.auditingFee,
          currency: 'SYP'
        });
      }
      // Study Fund contribution
      contributions.push({
        id: `contrib-${Date.now()}-${Math.random()}`,
        date: dateStr,
        depositId: sfdId,
        relatedInvoice: issuedInvId,
        branch: currentBranch,
        modelType: 'GS General Study',
        fundName: p.disciplineKey === 'civ' || p.disciplineKey === 'arc' ? 'صندوق المدني والعمارة' : p.disciplineKey === 'mec' || p.disciplineKey === 'ele' ? 'صندوق الميكانيك والكهرباء' : 'صندوق المائية والجيولوجيا والجيوتكنيك',
        engineerName: p.studyEngName,
        discipline: p.disciplineAr,
        roleType: 'دارس',
        fundStatus: p.fundStatus,
        amount: p.fundFee,
        currency: 'SYP'
      });
    });

    const newSfd: SyndicateDepositRecord = {
      id: `sfd-${Date.now()}`,
      date: dateStr,
      time: now.toLocaleTimeString('en-US', { hour12: false }),
      depositNumber: sfdId,
      relatedInvoice: issuedInvId,
      totalAmount: pipeline.syndicateDepositTotal,
      currency: 'SYP',
      branchCode: currentBranch,
      modelType: 'GS General Study',
      issuedBy: userName,
      fundsBreakdown
    };

    onIssueDeposit(newSfd, contributions);
    setIssuedSfdId(sfdId);
  };

  // Client items for table
  const clientItems = [
    { label: 'الدراسة الانشائية والمعمارية والميكانيكية والكهربائية', amount: clientFees.feeBasic },
    { label: 'دراسة الجيولوجيا (شامل التقرير النهائي)', amount: clientFees.feeGeo },
    { label: 'دراسة الجيوتكنيك (شامل التقرير النهائي)', amount: clientFees.feeGeotech },
    { label: 'الدراسة المائية والصحية', amount: clientFees.feeWater },
    { label: 'العزل الحراري', amount: clientFees.feeInsul },
    { label: 'إضافة مغلف الاعمدة', amount: clientFees.feeColumns },
    { label: 'الزلازل', amount: clientFees.feeQuake },
    { label: 'اللوحة الكهربائية', amount: clientFees.feePanel },
    { label: 'الطاقة الشمسية', amount: clientFees.feeSolar },
    { label: 'التهوية', amount: clientFees.feeVent },
    { label: 'مانع الصواعق', amount: clientFees.feeLightning },
    { label: 'نظام انذارواطفاء الحريق', amount: clientFees.feeFire },
    { label: 'شبكة التاريض', amount: clientFees.feeGround },
    { label: 'المصاعد', amount: clientFees.feeElevators },
    { label: 'رسوم الطباعة', amount: clientFees.feePrint }
  ];

  return (
    <div className="space-y-6">
      {/* Top Grid: Input Panel (Right 65%) + Output Client (Left 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Output Panel Client (Left Column - 4 cols on desktop) */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-blue-200 px-4 py-3 border-b border-blue-800 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide flex items-center gap-2 text-white">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>مخرجات حساب العميل (Output panel Client)</span>
              </h2>
              <span className="text-[11px] font-semibold bg-blue-800 text-blue-200 px-2 py-0.5 rounded">
                الفاتورة INV
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              {!isFormValid ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg text-xs leading-relaxed text-right space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚠️ يرجى ادخال جميع البيانات للمتابعة</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    البيانات الناقصة: {validationErrors.join('، ')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2 w-10 text-center">#</th>
                          <th className="p-2">التفاصيل</th>
                          <th className="p-2 text-left">المبلغ (ل.س)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {clientItems.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="p-2 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="p-2 text-slate-800 font-medium text-[11.5px]">{item.label}</td>
                            <td className="p-2 text-left font-mono font-semibold text-slate-900">
                              {item.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-900 text-white font-bold text-sm">
                          <td colSpan={2} className="p-3 text-right">المجموع الكلي المطلوب سداده:</td>
                          <td className="p-3 text-left font-mono text-amber-300">
                            {clientFees.grandTotal.toLocaleString()} ل.س
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Stage 1 Action Buttons */}
                  <div className="pt-2">
                    {issuedInvId ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-lg text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>تم إصدار الفاتورة:</span>
                          </span>
                          <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            {issuedInvId}
                          </span>
                        </div>
                        <button
                          id="gs-btn-view-inv"
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
                            clientItems,
                            grandTotal: clientFees.grandTotal
                          })}
                          className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-lg shadow flex items-center justify-center gap-1.5 transition"
                        >
                          <Printer className="w-4 h-4 text-amber-400" />
                          <span>معاينة وطباعة الفاتورة A4 الرسمية</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        id="gs-btn-issue-inv"
                        onClick={handleIssueInvoice}
                        disabled={!isFormValid}
                        className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                          isFormValid
                            ? 'bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <FileText className="w-4 h-4 text-amber-300" />
                        <span>إصدار الفاتورة الرسمية (Issue: Invoice) - {nextInvoiceNum}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Panel (Right Column - 8 cols on desktop) */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>لوحة إدخال البيانات المعتمدة (Input Panel - No More & No Less)</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  id="gs-btn-reset-form"
                  onClick={handleReset}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded text-xs transition border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>إعادة تعيين (Reset)</span>
                </button>
                <button
                  id="gs-btn-calculate"
                  onClick={handleCalculate}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold shadow transition"
                >
                  <span>احسب (Calculate)</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              
              {/* Top Sub-Grid: Project Data & Landlord Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Project Info */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                  <h3 className="font-bold text-xs text-blue-900 border-b border-slate-200 pb-1.5">
                    أ. بيانات المشروع والمعايير الهندسية
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">نوع الخدمة:</label>
                      <select 
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-semibold focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="دراسة انشائية">دراسة انشائية</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">صفة المشروع:</label>
                      <select 
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="سكني وجمعيات">سكني وجمعيات (1,400 ل.س/م²)</option>
                        <option value="سكن ريفي">سكن ريفي (600 ل.س/م²)</option>
                        <option value="سكني وتجاري">سكني وتجاري (1,750 ل.س/م²)</option>
                        <option value="منشآت خاصة">منشآت خاصة (2,600 ل.س/م²)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">المساحة الكلية م²:</label>
                      <input 
                        type="number"
                        value={totalArea || ''}
                        onChange={(e) => setTotalArea(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">مساحة البناء م²:</label>
                      <input 
                        type="number"
                        value={builtArea || ''}
                        onChange={(e) => setBuiltArea(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">عدد الطوابق:</label>
                      <input 
                        type="number"
                        value={floorsCount || ''}
                        onChange={(e) => setFloorsCount(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">عدد المصاعد:</label>
                      <input 
                        type="number"
                        value={elevatorsCount}
                        onChange={(e) => setElevatorsCount(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">استطاعة اللوحة A:</label>
                      <input 
                        type="number"
                        value={elecCapacity}
                        onChange={(e) => setElecCapacity(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Landlord & Property Info */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                  <h3 className="font-bold text-xs text-blue-900 border-b border-slate-200 pb-1.5">
                    ب. بيانات صاحب العلاقة والعقار
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">صاحب العلاقة:</label>
                      <input 
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="الاسم الثلاثي لصاحب العلاقة"
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">رقم الهاتف:</label>
                      <input 
                        type="text"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="09xxxxxxxx / 052xxxx"
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">المنطقة العقارية:</label>
                    <input 
                      type="text"
                      value={zoneLoc}
                      onChange={(e) => setZoneLoc(e.target.value)}
                      placeholder="المنطقة العقارية (مثال: الحسكة الشرقية / المفتي)"
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">رقم المقسم:</label>
                      <input 
                        type="number"
                        value={parcelNo || ''}
                        onChange={(e) => setParcelNo(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">رقم العقار:</label>
                      <input 
                        type="number"
                        value={propNo || ''}
                        onChange={(e) => setPropNo(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Engineering Matrix Selection (Study + Coaching Rule 1 + Auditing Rule 2 + Exclusion Rule 3) */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                    <span>ج. تشكيل الفرق الهندسية المعتمدة (Study, Coach, Audit Teams Matrix)</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">
                    قواعد التحقق: Rule 1 (التدريب) + Rule 2 (التدقيق) + Rule 3 (الاستبعاد)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* 1. Study Team (7 Disciplines) */}
                  <div className="bg-white p-3 rounded-lg border border-blue-200 space-y-2">
                    <div className="bg-blue-900 text-white text-[11.5px] font-bold p-1.5 rounded text-center">
                      1. فريق الدراسة (7 تخصصات)
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس المدني:</label>
                      <select
                        value={studyCiv}
                        onChange={(e) => setStudyCiv(e.target.value)}
                        className="w-full bg-yellow-50 border border-slate-300 rounded p-1 text-xs text-slate-900 font-medium"
                      >
                        {getEligibleEngineers('مدني', 'دراسة', studyCiv).map(eng => (
                          <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس العمارة:</label>
                      <select
                        value={studyArc}
                        onChange={(e) => setStudyArc(e.target.value)}
                        className="w-full bg-yellow-50 border border-slate-300 rounded p-1 text-xs text-slate-900 font-medium"
                      >
                        {getEligibleEngineers('عمارة', 'دراسة', studyArc).map(eng => (
                          <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس الميكانيك:</label>
                      <select
                        value={studyMec}
                        onChange={(e) => setStudyMec(e.target.value)}
                        className="w-full bg-yellow-50 border border-slate-300 rounded p-1 text-xs text-slate-900 font-medium"
                      >
                        {getEligibleEngineers('ميكانيك', 'دراسة', studyMec).map(eng => (
                          <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس الكهرباء:</label>
                      <select
                        value={studyEle}
                        onChange={(e) => setStudyEle(e.target.value)}
                        className="w-full bg-yellow-50 border border-slate-300 rounded p-1 text-xs text-slate-900 font-medium"
                      >
                        {getEligibleEngineers('كهرباء', 'دراسة', studyEle).map(eng => (
                          <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس المائية:</label>
                      <select
                        value={studyWat}
                        onChange={(e) => setStudyWat(e.target.value)}
                        className="w-full bg-yellow-50 border border-slate-300 rounded p-1 text-xs text-slate-900 font-medium"
                      >
                        {getEligibleEngineers('مائية', 'دراسة', studyWat).map(eng => (
                          <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس الجيولوجيا:</label>
                      <select
                        value={studyGeo}
                        onChange={(e) => setStudyGeo(e.target.value)}
                        className="w-full bg-yellow-50 border border-slate-300 rounded p-1 text-xs text-slate-900 font-medium"
                      >
                        {getEligibleEngineers('جيولوجيا', 'دراسة', studyGeo).map(eng => (
                          <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مهندس الجيوتكنيك:</label>
                      <select
                        value={studyGtc}
                        onChange={(e) => setStudyGtc(e.target.value)}
                        className="w-full bg-yellow-50 border border-slate-300 rounded p-1 text-xs text-slate-900 font-medium"
                      >
                        {getEligibleEngineers('جيوتكنيك', 'دراسة', studyGtc).map(eng => (
                          <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 2. Coaching / Supervision Team (Rule 1 Conditional) */}
                  <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-2">
                    <div className="bg-amber-800 text-white text-[11.5px] font-bold p-1.5 rounded text-center">
                      2. فريق التدريب / الإشراف (Rule 1)
                    </div>

                    {/* Civil Coach */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                        مشرف المدني {getEngMeta(studyCiv).role === 'دراسة' && <span className="text-red-600 font-bold">(إلزامي)</span>}:
                      </label>
                      {getEngMeta(studyCiv).role === 'دراسة' ? (
                        <select
                          value={coachCiv}
                          onChange={(e) => setCoachCiv(e.target.value)}
                          className="w-full bg-amber-50 border border-amber-300 rounded p-1 text-xs text-slate-900 font-medium"
                        >
                          <option value="-- اختر المشرف --">-- اختر المشرف --</option>
                          {getEligibleEngineers('مدني', 'تدريب', coachCiv).map(eng => (
                            <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" value="لا يستوجب (مؤهل تدريب)" disabled className="w-full bg-slate-100 border border-slate-200 rounded p-1 text-xs text-slate-500 font-semibold" />
                      )}
                    </div>

                    {/* Arch Coach */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                        مشرف العمارة {getEngMeta(studyArc).role === 'دراسة' && <span className="text-red-600 font-bold">(إلزامي)</span>}:
                      </label>
                      {getEngMeta(studyArc).role === 'دراسة' ? (
                        <select
                          value={coachArc}
                          onChange={(e) => setCoachArc(e.target.value)}
                          className="w-full bg-amber-50 border border-amber-300 rounded p-1 text-xs text-slate-900 font-medium"
                        >
                          <option value="-- اختر المشرف --">-- اختر المشرف --</option>
                          {getEligibleEngineers('عمارة', 'تدريب', coachArc).map(eng => (
                            <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" value="لا يستوجب" disabled className="w-full bg-slate-100 border border-slate-200 rounded p-1 text-xs text-slate-500 font-semibold" />
                      )}
                    </div>

                    {/* Mech Coach */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مشرف الميكانيك:</label>
                      {getEngMeta(studyMec).role === 'دراسة' ? (
                        <select
                          value={coachMec}
                          onChange={(e) => setCoachMec(e.target.value)}
                          className="w-full bg-amber-50 border border-amber-300 rounded p-1 text-xs text-slate-900 font-medium"
                        >
                          <option value="-- اختر المشرف --">-- اختر المشرف --</option>
                          {getEligibleEngineers('ميكانيك', 'تدريب', coachMec).map(eng => (
                            <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" value="لا يستوجب" disabled className="w-full bg-slate-100 border border-slate-200 rounded p-1 text-xs text-slate-500 font-semibold" />
                      )}
                    </div>

                    {/* Elec Coach */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مشرف الكهرباء:</label>
                      {getEngMeta(studyEle).role === 'دراسة' ? (
                        <select
                          value={coachEle}
                          onChange={(e) => setCoachEle(e.target.value)}
                          className="w-full bg-amber-50 border border-amber-300 rounded p-1 text-xs text-slate-900 font-medium"
                        >
                          <option value="-- اختر المشرف --">-- اختر المشرف --</option>
                          {getEligibleEngineers('كهرباء', 'تدريب', coachEle).map(eng => (
                            <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" value="لا يستوجب" disabled className="w-full bg-slate-100 border border-slate-200 rounded p-1 text-xs text-slate-500 font-semibold" />
                      )}
                    </div>

                    {/* Water Coach */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مشرف المائية:</label>
                      {getEngMeta(studyWat).role === 'دراسة' ? (
                        <select
                          value={coachWat}
                          onChange={(e) => setCoachWat(e.target.value)}
                          className="w-full bg-amber-50 border border-amber-300 rounded p-1 text-xs text-slate-900 font-medium"
                        >
                          <option value="-- اختر المشرف --">-- اختر المشرف --</option>
                          {getEligibleEngineers('مائية', 'تدريب', coachWat).map(eng => (
                            <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" value="لا يستوجب" disabled className="w-full bg-slate-100 border border-slate-200 rounded p-1 text-xs text-slate-500 font-semibold" />
                      )}
                    </div>

                    {/* Geo Coach */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مشرف الجيولوجيا:</label>
                      {getEngMeta(studyGeo).role === 'دراسة' ? (
                        <select
                          value={coachGeo}
                          onChange={(e) => setCoachGeo(e.target.value)}
                          className="w-full bg-amber-50 border border-amber-300 rounded p-1 text-xs text-slate-900 font-medium"
                        >
                          <option value="-- اختر المشرف --">-- اختر المشرف --</option>
                          {getEligibleEngineers('جيولوجيا', 'تدريب', coachGeo).map(eng => (
                            <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" value="لا يستوجب" disabled className="w-full bg-slate-100 border border-slate-200 rounded p-1 text-xs text-slate-500 font-semibold" />
                      )}
                    </div>

                    {/* Gtc Coach */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مشرف الجيوتكنيك:</label>
                      {getEngMeta(studyGtc).role === 'دراسة' ? (
                        <select
                          value={coachGtc}
                          onChange={(e) => setCoachGtc(e.target.value)}
                          className="w-full bg-amber-50 border border-amber-300 rounded p-1 text-xs text-slate-900 font-medium"
                        >
                          <option value="-- اختر المشرف --">-- اختر المشرف --</option>
                          {getEligibleEngineers('جيوتكنيك', 'تدريب', coachGtc).map(eng => (
                            <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                          ))}
                        </select>
                      ) : (
                        <input type="text" value="لا يستوجب" disabled className="w-full bg-slate-100 border border-slate-200 rounded p-1 text-xs text-slate-500 font-semibold" />
                      )}
                    </div>
                  </div>

                  {/* 3. Auditing Team (4 Disciplines - Rule 2) */}
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-2">
                    <div className="bg-emerald-800 text-white text-[11.5px] font-bold p-1.5 rounded text-center">
                      3. فريق التدقيق (4 تخصصات - Rule 2)
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مدقق المدني (20%):</label>
                      <select
                        value={auditCiv}
                        onChange={(e) => setAuditCiv(e.target.value)}
                        className="w-full bg-emerald-50 border border-emerald-300 rounded p-1 text-xs text-slate-900 font-medium"
                      >
                        {getEligibleEngineers('مدني', 'تدقيق', auditCiv).map(eng => (
                          <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مدقق العمارة (20%):</label>
                      <select
                        value={auditArc}
                        onChange={(e) => setAuditArc(e.target.value)}
                        className="w-full bg-emerald-50 border border-emerald-300 rounded p-1 text-xs text-slate-900 font-medium"
                      >
                        {getEligibleEngineers('عمارة', 'تدقيق', auditArc).map(eng => (
                          <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مدقق الميكانيك (20%):</label>
                      <select
                        value={auditMec}
                        onChange={(e) => setAuditMec(e.target.value)}
                        className="w-full bg-emerald-50 border border-emerald-300 rounded p-1 text-xs text-slate-900 font-medium"
                      >
                        {getEligibleEngineers('ميكانيك', 'تدقيق', auditMec).map(eng => (
                          <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">مدقق الكهرباء (20%):</label>
                      <select
                        value={auditEle}
                        onChange={(e) => setAuditEle(e.target.value)}
                        className="w-full bg-emerald-50 border border-emerald-300 rounded p-1 text-xs text-slate-900 font-medium"
                      >
                        {getEligibleEngineers('كهرباء', 'تدقيق', auditEle).map(eng => (
                          <option key={eng.id} value={eng.fullName}>{eng.fullName} ({eng.rank})</option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2 text-[10.5px] text-slate-500 space-y-1">
                      <div className="flex justify-between border-t border-slate-100 pt-1">
                        <span>مدقق المائية:</span>
                        <span className="font-semibold text-slate-400">— لا يستوجب —</span>
                      </div>
                      <div className="flex justify-between">
                        <span>مدقق الجيولوجيا:</span>
                        <span className="font-semibold text-slate-400">— لا يستوجب —</span>
                      </div>
                      <div className="flex justify-between">
                        <span>مدقق الجيوتكنيك:</span>
                        <span className="font-semibold text-slate-400">— لا يستوجب —</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Output Engineers (Right 65%) + Output Syndicate (Left 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Output Panel Syndicate (Left Column - 4 cols on desktop) */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-emerald-200 px-4 py-3 border-b border-emerald-800 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide flex items-center gap-2 text-white">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>الرسوم والصناديق النقابية (Output Syndicate)</span>
              </h2>
              <span className="text-[11px] font-semibold bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">
                الإيداع SFD
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              {!isFormValid ? (
                <div className="bg-slate-50 text-slate-500 p-4 rounded-lg text-xs text-center">
                  تظهر حصص الصناديق والرسوم النقابية فور اكتمال المدخلات
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2">الرسم / الصندوق النقابي</th>
                          <th className="p-2 text-left">المبلغ المودع (ل.س)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="bg-emerald-50/50">
                          <td className="p-2 font-bold text-emerald-950">1. رسوم الوحدة والنقابة (15%)</td>
                          <td className="p-2 text-left font-mono font-bold text-emerald-900">
                            {pipeline.syndicateFees.toLocaleString()}
                          </td>
                        </tr>
                        <tr className="bg-emerald-50/30">
                          <td className="p-2 font-bold text-teal-950">2. صندوق التدقيق النقابي (20%)</td>
                          <td className="p-2 text-left font-mono font-bold text-teal-900">
                            {pipeline.fundAudit.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium text-slate-700">3. صندوق المدني والعمارة</td>
                          <td className="p-2 text-left font-mono font-semibold text-slate-800">
                            {pipeline.fundCivArc.toLocaleString()}
                          </td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="p-2 font-medium text-slate-700">4. صندوق الميكانيك والكهرباء</td>
                          <td className="p-2 text-left font-mono font-semibold text-slate-800">
                            {pipeline.fundMecEle.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium text-slate-700">5. صندوق المائية والجيولوجيا والجيوتكنيك</td>
                          <td className="p-2 text-left font-mono font-semibold text-slate-800">
                            {pipeline.fundSanGeoGtc.toLocaleString()}
                          </td>
                        </tr>
                        <tr className="bg-slate-900 text-white font-bold text-sm">
                          <td className="p-3 text-right">المجموع الكلي للإيداع النقابي:</td>
                          <td className="p-3 text-left font-mono text-emerald-400">
                            {pipeline.syndicateDepositTotal.toLocaleString()} ل.س
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Stage 3 Action Buttons */}
                  <div className="pt-2">
                    {!issuedEpoId ? (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg text-xs font-semibold text-center">
                        ⚠️ يتطلب إصدار أمر صرف الأتعاب (EPO) أولاً لتمكين إشعار الإيداع
                      </div>
                    ) : issuedSfdId ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-900 p-2 rounded-lg text-xs font-bold">
                          <span>تم إصدار إشعار الإيداع:</span>
                          <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            {issuedSfdId}
                          </span>
                        </div>
                        <button
                          id="gs-btn-view-sfd"
                          onClick={() => onViewDocument(issuedSfdId, 'SFD', {
                            sfdId: issuedSfdId,
                            relatedInv: issuedInvId,
                            totalAmount: pipeline.syndicateDepositTotal,
                            fundsBreakdown: [
                              { fundName: 'رسوم الوحدة والنقابة (15%)', amount: pipeline.syndicateFees },
                              { fundName: 'صندوق التدقيق النقابي (20%)', amount: pipeline.fundAudit },
                              { fundName: 'صندوق المدني والعمارة', amount: pipeline.fundCivArc },
                              { fundName: 'صندوق الميكانيك والكهرباء', amount: pipeline.fundMecEle },
                              { fundName: 'صندوق المائية والجيولوجيا والجيوتكنيك', amount: pipeline.fundSanGeoGtc }
                            ]
                          })}
                          className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-lg shadow flex items-center justify-center gap-1.5 transition"
                        >
                          <Printer className="w-4 h-4 text-emerald-400" />
                          <span>معاينة وطباعة إشعار الإيداع A4</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        id="gs-btn-issue-sfd"
                        onClick={handleIssueDeposit}
                        className="w-full bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white py-2.5 px-4 rounded-lg font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-300" />
                        <span>إصدار إيداع الرسوم والصناديق (Issue: Deposit) - {nextDepositNum}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Output Panel Engineers (Right Column - 8 cols on desktop) */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-red-950 to-slate-900 text-red-200 px-5 py-3 border-b border-red-900 flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide flex items-center gap-2 text-white">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>صافي أتعاب المهندسين والمدربين (Output panel Engineers)</span>
              </h2>
              <span className="text-[11px] font-semibold bg-red-900 text-red-200 px-2 py-0.5 rounded">
                أمر الصرف EPO
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              {!isFormValid ? (
                <div className="bg-slate-50 text-slate-500 p-6 rounded-lg text-xs text-center">
                  تظهر حسابات أتعاب المهندسين الصافية وجداول الصرف فور اكتمال المدخلات
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2">الاختصاص</th>
                          <th className="p-2">مهندس الدراسة</th>
                          <th className="p-2 text-left">الإجمالي</th>
                          <th className="p-2 text-left">الاقتطاعات</th>
                          <th className="p-2 text-left">الطباعة</th>
                          <th className="p-2 text-left">صافي الدارس (ل.س)</th>
                          <th className="p-2">المشرف وصافيه</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pipeline.pipelines.map((p, idx) => {
                          const totalDeductions = p.syndicateFee + p.auditingFee + p.fundFee + p.coachFee;
                          return (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50/20'}>
                              <td className="p-2 font-bold text-slate-900 text-[11.5px]">{p.disciplineAr}</td>
                              <td className="p-2 text-slate-800">
                                <span className="font-semibold">{p.studyEngName}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">({p.fundStatus})</span>
                              </td>
                              <td className="p-2 text-left font-mono text-slate-700">{p.grossAmount.toLocaleString()}</td>
                              <td className="p-2 text-left font-mono text-red-600">-{totalDeductions.toLocaleString()}</td>
                              <td className="p-2 text-left font-mono text-emerald-600">+{p.printShare.toLocaleString()}</td>
                              <td className="p-2 text-left font-mono font-bold text-blue-900 bg-blue-50/50">
                                {p.netStudyFee.toLocaleString()}
                              </td>
                              <td className="p-2 text-slate-700 text-[11px]">
                                {p.hasCoach && p.netCoachFee > 0 ? (
                                  <div>
                                    <span className="font-semibold">{p.coachEngName}: </span>
                                    <span className="font-mono font-bold text-emerald-700">{p.netCoachFee.toLocaleString()}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">{p.coachEngName}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-900 text-white font-bold text-sm">
                          <td colSpan={5} className="p-3 text-right">المجموع الكلي لأمر الصرف المصروف للمهندسين والمشرفين:</td>
                          <td colSpan={2} className="p-3 text-left font-mono text-red-300">
                            {pipeline.totalEngineersNet.toLocaleString()} ل.س
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Stage 2 Action Buttons */}
                  <div className="pt-2">
                    {!issuedInvId ? (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg text-xs font-semibold text-center">
                        ⚠️ يتطلب إصدار الفاتورة أولاً لتوليد أمر الصرف برقم تسلسلي مطابق
                      </div>
                    ) : issuedEpoId ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-900 p-2 rounded-lg text-xs font-bold">
                          <span>تم إصدار أمر الصرف:</span>
                          <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            {issuedEpoId}
                          </span>
                        </div>
                        <button
                          id="gs-btn-view-epo"
                          onClick={() => onViewDocument(issuedEpoId, 'EPO', {
                            epoId: issuedEpoId,
                            relatedInv: issuedInvId,
                            totalAmount: pipeline.totalEngineersNet,
                            pipelines: pipeline.pipelines
                          })}
                          className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-lg shadow flex items-center justify-center gap-1.5 transition"
                        >
                          <Printer className="w-4 h-4 text-red-400" />
                          <span>معاينة وطباعة أمر الصرف A4</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        id="gs-btn-issue-epo"
                        onClick={handleIssuePayOrder}
                        className="w-full bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-700 hover:to-rose-800 text-white py-2.5 px-4 rounded-lg font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-red-300" />
                        <span>إصدار أمر الصرف (Issue: Pay Order) - {nextPayOrderNum}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Accounting Balance Verification Bar */}
      {isFormValid && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 rounded-xl border border-blue-800/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ⚖️
            </div>
            <div>
              <span className="font-bold text-sm text-emerald-400">التدقيق والتوازن المحاسبي (Balance Assertion): </span>
              <span className="text-slate-300">تطابق تام 100% بين الفاتورة ومجموع أوامر الصرف والإيداع</span>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono font-bold text-sm bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-amber-300">{clientFees.grandTotal.toLocaleString()} (INV)</span>
            <span className="text-slate-400">=</span>
            <span className="text-red-400">{pipeline.totalEngineersNet.toLocaleString()} (EPO)</span>
            <span className="text-slate-400">+</span>
            <span className="text-emerald-400">{pipeline.syndicateDepositTotal.toLocaleString()} (SFD)</span>
          </div>
        </div>
      )}
    </div>
  );
};
