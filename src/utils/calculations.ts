import { DisciplinePipelineResult, FundStatus } from '../types';

// ==========================================
// 1. GS - GENERAL STUDY CALCULATION ENGINE
// ==========================================
export interface GSClientBreakdown {
  feeBasic: number;
  feeGeo: number;
  feeGeotech: number;
  feeWater: number;
  feeInsul: number;
  feeColumns: number;
  feeQuake: number;
  feePanel: number;
  feeSolar: number;
  feeVent: number;
  feeLightning: number;
  feeFire: number;
  feeGround: number;
  feeElevators: number;
  feePrint: number;
  grandTotal: number;
}

export function calculateGSClientFees(
  totalArea: number,
  builtArea: number,
  floorsCount: number,
  elevatorsCount: number,
  elecCapacity: number,
  projectType: string,
  exchangeRate: number = 14000
): GSClientBreakdown {
  const projectRates: Record<string, number> = {
    'سكن ريفي': 600.0,
    'سكني وجمعيات': 1400.0,
    'سكني وتجاري': 1750.0,
    'منشآت خاصة': 2600.0,
  };
  const baseRate = projectRates[projectType] || 1400.0;

  const feeBasic = totalArea * baseRate;
  const feeGeo = (100.0 + 0.10 * builtArea) * exchangeRate;
  const feeGeotech = (100.0 + 0.10 * builtArea) * exchangeRate;
  const feeWater = 100000.0 + (300.0 * builtArea);
  const feeInsul = totalArea * 60.0;
  const feeColumns = 0.80 * (baseRate * builtArea);
  const feeQuake = (floorsCount <= 3 ? 0.20 : 0.35) * (baseRate * totalArea);

  let feePanel = 50000.0;
  if (elecCapacity > 1000) {
    feePanel = 100000.0;
  } else if (elecCapacity > 400) {
    feePanel = 75000.0;
  }

  const feeSolar = totalArea * 50.0;
  const feeVent = builtArea * 100.0;
  const feeLightning = totalArea * 50.0;
  const feeFire = 25000.0;
  const feeGround = 5000.0;
  const feeElevators = elevatorsCount * 100000.0;
  const feePrint = 125000.0;

  const grandTotal = 
    feeBasic + feeGeo + feeGeotech + feeWater + feeInsul + 
    feeColumns + feeQuake + feePanel + feeSolar + feeVent + 
    feeLightning + feeFire + feeGround + feeElevators + feePrint;

  return {
    feeBasic,
    feeGeo,
    feeGeotech,
    feeWater,
    feeInsul,
    feeColumns,
    feeQuake,
    feePanel,
    feeSolar,
    feeVent,
    feeLightning,
    feeFire,
    feeGround,
    feeElevators,
    feePrint,
    grandTotal
  };
}

export function calculateGSPipeline(
  clientBreakdown: GSClientBreakdown,
  studyEngs: Record<string, { name: string; fundStatus: FundStatus }>,
  coachEngs: Record<string, string>,
  auditorEngs: Record<string, string>
): {
  pipelines: DisciplinePipelineResult[];
  totalEngineersNet: number;
  syndicateDepositTotal: number;
  fundAudit: number;
  fundCivArc: number;
  fundMecEle: number;
  fundSanGeoGtc: number;
  syndicateFees: number;
} {
  const {
    feeBasic, feeGeo, feeGeotech, feeWater, feeInsul,
    feeColumns, feeQuake, feePanel, feeSolar, feeVent,
    feeLightning, feeFire, feeGround, feeElevators, feePrint
  } = clientBreakdown;

  // Gross fee distributions
  const grossCiv = (feeBasic * 0.46) + (feeColumns * 0.50) + feeQuake;
  const grossArc = (feeBasic * 0.32) + (feeInsul * 0.50) + (feeColumns * 0.50);
  const grossMec = (feeBasic * 0.11) + (feeInsul * 0.50) + feeSolar + feeVent + feeFire + feeGround + (feeLightning * 0.50);
  const grossEle = (feeBasic * 0.11) + feePanel + feeElevators + (feeLightning * 0.50);
  const grossWat = feeWater;
  const grossGeo = feeGeo;
  const grossGtc = feeGeotech;

  const printShares: Record<string, number> = {
    civ: feePrint * 0.20,
    arc: feePrint * 0.20,
    mec: feePrint * 0.15,
    ele: feePrint * 0.15,
    wat: feePrint * 0.20,
    geo: feePrint * 0.05,
    gtc: feePrint * 0.05
  };

  const disciplines = [
    { key: 'civ', label: 'الهندسة المدنية', gross: grossCiv },
    { key: 'arc', label: 'الهندسة المعمارية', gross: grossArc },
    { key: 'mec', label: 'الهندسة الميكانيكية', gross: grossMec },
    { key: 'ele', label: 'الهندسة الكهربائية', gross: grossEle },
    { key: 'wat', label: 'هندسة الري والمائية', gross: grossWat },
    { key: 'geo', label: 'الهندسة الجيولوجية', gross: grossGeo },
    { key: 'gtc', label: 'الهندسة الجيوتكنيكية', gross: grossGtc }
  ];

  const pipelines: DisciplinePipelineResult[] = [];

  for (const disc of disciplines) {
    const sEng = studyEngs[disc.key] || { name: '—', fundStatus: 'داخل' };
    const cEngName = coachEngs[disc.key] || 'لا يستوجب';
    const aEngName = auditorEngs[disc.key] || '—';
    const hasCoach = cEngName !== 'لا يستوجب' && cEngName !== '—' && !cEngName.startsWith('--') && cEngName.trim() !== '';

    const fundPct = sEng.fundStatus === 'خارج' ? 0.10 : 0.25;

    // Stage 1: Syndicate and Unit Fee (15%)
    const syndicateFee = disc.gross * 0.15;
    const rem1 = disc.gross - syndicateFee;

    // Stage 2: Audit Fee (20%) -> to Auditors Fund
    const auditingFee = rem1 * 0.20;
    const rem2 = rem1 - auditingFee;

    // Stage 3: Fund Subscription (10% or 25%) -> to Fund
    const fundFee = rem2 * fundPct;
    const rem3 = rem2 - fundFee;

    // Stage 4: Coach Fee (15% or 0%) -> Direct to Coach
    const coachFee = hasCoach ? rem3 * 0.15 : 0;
    const rem4 = rem3 - coachFee;

    // Stage 5: Print Allowance
    const printShare = printShares[disc.key] || 0;
    const netStudyFee = rem4 + printShare;
    const netCoachFee = coachFee;

    pipelines.push({
      disciplineKey: disc.key,
      disciplineAr: disc.label,
      studyEngName: sEng.name,
      coachEngName: cEngName,
      auditorEngName: aEngName,
      grossAmount: disc.gross,
      syndicateFee,
      auditingFee,
      fundFee,
      coachFee,
      printShare,
      netStudyFee,
      netCoachFee,
      fundStatus: sEng.fundStatus,
      hasCoach
    });
  }

  const totalEngineersNet = pipelines.reduce((sum, p) => sum + p.netStudyFee + p.netCoachFee, 0);
  const syndicateFees = pipelines.reduce((sum, p) => sum + p.syndicateFee, 0);
  const fundAudit = pipelines.reduce((sum, p) => sum + p.auditingFee, 0);

  const civPipe = pipelines.find(p => p.disciplineKey === 'civ')!;
  const arcPipe = pipelines.find(p => p.disciplineKey === 'arc')!;
  const mecPipe = pipelines.find(p => p.disciplineKey === 'mec')!;
  const elePipe = pipelines.find(p => p.disciplineKey === 'ele')!;
  const watPipe = pipelines.find(p => p.disciplineKey === 'wat')!;
  const geoPipe = pipelines.find(p => p.disciplineKey === 'geo')!;
  const gtcPipe = pipelines.find(p => p.disciplineKey === 'gtc')!;

  const fundCivArc = (civPipe.fundFee + arcPipe.fundFee);
  const fundMecEle = (mecPipe.fundFee + elePipe.fundFee);
  const fundSanGeoGtc = (watPipe.fundFee + geoPipe.fundFee + gtcPipe.fundFee);

  const syndicateDepositTotal = syndicateFees + fundAudit + fundCivArc + fundMecEle + fundSanGeoGtc;

  return {
    pipelines,
    totalEngineersNet,
    syndicateDepositTotal,
    fundAudit,
    fundCivArc,
    fundMecEle,
    fundSanGeoGtc,
    syndicateFees
  };
}

// ==========================================
// 2. SC - SUPERVISION CONTRACT (IN USD $)
// ==========================================
export function calculateSCContract(
  totalArea: number,
  builtArea: number,
  unitRateUSD: number,
  studyEngs: Record<string, { name: string; fundStatus: FundStatus }>,
  coachEngs: Record<string, string>
) {
  const feeBasicUSD = totalArea * unitRateUSD;
  const feeWaterUSD = 60.0 + Math.max(0.0, builtArea - 250.0) * 0.10;
  const grandTotalUSD = feeBasicUSD + feeWaterUSD;

  const grossCiv = feeBasicUSD * 0.48;
  const grossArc = feeBasicUSD * 0.32;
  const grossMec = feeBasicUSD * 0.10;
  const grossEle = feeBasicUSD * 0.10;
  const grossWat = feeWaterUSD;

  const disciplines = [
    { key: 'civ', label: 'مهندس الإشراف المدني', gross: grossCiv },
    { key: 'arc', label: 'مهندس الإشراف المعماري', gross: grossArc },
    { key: 'mec', label: 'مهندس الإشراف الميكانيكي', gross: grossMec },
    { key: 'ele', label: 'مهندس الإشراف الكهربائي', gross: grossEle },
    { key: 'wat', label: 'مهندس الإشراف المائي والصحي', gross: grossWat }
  ];

  const pipelines = disciplines.map(disc => {
    const sEng = studyEngs[disc.key] || { name: '—', fundStatus: 'داخل' };
    const cEngName = coachEngs[disc.key] || 'لا يستوجب';
    const hasCoach = cEngName !== 'لا يستوجب' && cEngName !== '—' && !cEngName.startsWith('--') && cEngName.trim() !== '';

    const fundPct = sEng.fundStatus === 'داخل' ? 0.25 : 0.10;

    // Stage 1: Syndicate & Unit Fee (7.5%)
    const syndicateFee = disc.gross * 0.075;
    const rem1 = disc.gross - syndicateFee;

    // Stage 2: Fund Contribution (10% or 25%)
    const fundFee = rem1 * fundPct;
    const rem2 = rem1 - fundFee;

    // Stage 3: Coach Fee (15% or 0%)
    const coachFee = hasCoach ? rem2 * 0.15 : 0;
    const netStudyFee = rem2 - coachFee;
    const netCoachFee = coachFee;

    return {
      disciplineKey: disc.key,
      disciplineAr: disc.label,
      studyEngName: sEng.name,
      coachEngName: cEngName,
      auditorEngName: '—',
      grossAmount: disc.gross,
      syndicateFee,
      auditingFee: 0,
      fundFee,
      coachFee,
      printShare: 0,
      netStudyFee,
      netCoachFee,
      fundStatus: sEng.fundStatus,
      hasCoach
    };
  });

  const totalEngineersNet = pipelines.reduce((sum, p) => sum + p.netStudyFee + p.netCoachFee, 0);
  const syndicateFees = pipelines.reduce((sum, p) => sum + p.syndicateFee, 0);
  const fundCivArc = (pipelines.find(p => p.disciplineKey === 'civ')?.fundFee || 0) + 
                     (pipelines.find(p => p.disciplineKey === 'arc')?.fundFee || 0) +
                     (pipelines.find(p => p.disciplineKey === 'wat')?.fundFee || 0);
  const fundMecEle = (pipelines.find(p => p.disciplineKey === 'mec')?.fundFee || 0) + 
                     (pipelines.find(p => p.disciplineKey === 'ele')?.fundFee || 0);
  const syndicateDepositTotal = syndicateFees + fundCivArc + fundMecEle;

  return {
    feeBasicUSD,
    feeWaterUSD,
    grandTotalUSD,
    pipelines,
    totalEngineersNet,
    syndicateDepositTotal,
    syndicateFees,
    fundCivArc,
    fundMecEle
  };
}

// ==========================================
// 3. BS - BAYANI STUDY CALCULATION ENGINE
// ==========================================
export function calculateBSStudy(
  totalArea: number,
  unitRateUSD: number = 80.0,
  exchangeRate: number = 14000,
  studyEngs: Record<string, { name: string; fundStatus: FundStatus }>,
  coachEngs: Record<string, string>,
  auditorEngs: Record<string, string>
) {
  const unitsCount = Math.ceil(totalArea / 50.0);
  const feeBasicUSD = unitsCount * unitRateUSD;
  const feeBasicSYP = feeBasicUSD * exchangeRate;
  const feePrintSYP = 125000.0;
  const grandTotalSYP = feeBasicSYP + feePrintSYP;
  const grandTotalUSD = feeBasicUSD + (feePrintSYP / exchangeRate);

  const grossCivSYP = feeBasicSYP * 0.50;
  const grossMecSYP = feeBasicSYP * 0.25;
  const grossEleSYP = feeBasicSYP * 0.25;

  const prnCiv = feePrintSYP * 0.50;
  const prnMec = feePrintSYP * 0.25;
  const prnEle = feePrintSYP * 0.25;

  const disciplines = [
    { key: 'civ', label: 'مدني / عمارة (50%)', gross: grossCivSYP, printShare: prnCiv },
    { key: 'mec', label: 'الميكانيك (25%)', gross: grossMecSYP, printShare: prnMec },
    { key: 'ele', label: 'الكهرباء (25%)', gross: grossEleSYP, printShare: prnEle }
  ];

  const pipelines = disciplines.map(disc => {
    const sEng = studyEngs[disc.key] || { name: '—', fundStatus: 'داخل' };
    const cEngName = coachEngs[disc.key] || 'لا يستوجب';
    const aEngName = auditorEngs[disc.key] || '—';
    const hasCoach = cEngName !== 'لا يستوجب' && cEngName !== '—' && !cEngName.startsWith('--') && cEngName.trim() !== '';

    const fundPct = sEng.fundStatus === 'داخل' ? 0.25 : 0.10;

    // Stage 1: Syndicate (10%)
    const syndicateFee = disc.gross * 0.10;
    const rem1 = disc.gross - syndicateFee;

    // Stage 2: Audit Fee (20%)
    const auditingFee = rem1 * 0.20;
    const rem2 = rem1 - auditingFee;

    // Stage 3: Fund (10% / 25%)
    const fundFee = rem2 * fundPct;
    const rem3 = rem2 - fundFee;

    // Stage 4: Coach Fee (15%)
    const coachFee = hasCoach ? rem3 * 0.15 : 0;
    const netStudyFee = rem3 - coachFee + disc.printShare;
    const netCoachFee = coachFee;

    return {
      disciplineKey: disc.key,
      disciplineAr: disc.label,
      studyEngName: sEng.name,
      coachEngName: cEngName,
      auditorEngName: aEngName,
      grossAmount: disc.gross,
      syndicateFee,
      auditingFee,
      fundFee,
      coachFee,
      printShare: disc.printShare,
      netStudyFee,
      netCoachFee,
      fundStatus: sEng.fundStatus,
      hasCoach
    };
  });

  const totalEngineersNet = pipelines.reduce((sum, p) => sum + p.netStudyFee + p.netCoachFee + p.auditingFee, 0);
  const syndicateFees = pipelines.reduce((sum, p) => sum + p.syndicateFee, 0);
  const fundCivArc = pipelines.find(p => p.disciplineKey === 'civ')?.fundFee || 0;
  const fundMecEle = (pipelines.find(p => p.disciplineKey === 'mec')?.fundFee || 0) + (pipelines.find(p => p.disciplineKey === 'ele')?.fundFee || 0);
  const syndicateDepositTotal = syndicateFees + fundCivArc + fundMecEle;

  return {
    unitsCount,
    feeBasicUSD,
    feeBasicSYP,
    feePrintSYP,
    grandTotalSYP,
    grandTotalUSD,
    pipelines,
    totalEngineersNet,
    syndicateDepositTotal,
    syndicateFees,
    fundCivArc,
    fundMecEle
  };
}

// ==========================================
// 4. CO - CONSTRUCTION SAFETY & SCHMIDT HAMMER
// ==========================================
export function calculateCOSafety(
  totalArea: number,
  unitRateUSD: number = 0.50,
  exchangeRate: number = 14000,
  studyEngs: Record<string, { name: string; fundStatus: FundStatus }>
) {
  const effectiveArea = Math.max(300.0, totalArea);
  const feeStudyUSD = effectiveArea * unitRateUSD;
  const feeStudySYP = feeStudyUSD * exchangeRate;
  const feePrintSYP = 125000.0;
  const grandTotalSYP = feeStudySYP + feePrintSYP;
  const grandTotalUSD = feeStudyUSD + (feePrintSYP / exchangeRate);

  const grossEachSYP = feeStudySYP * 0.25;
  const printEachSYP = feePrintSYP * 0.25;

  const disciplines = [
    { key: 'lead_civ', label: 'مدني استشاري (25%)' },
    { key: 'sec_civ', label: 'مدني ممارس (25%)' },
    { key: 'geotech', label: 'جيوتكنيك / مطرقة (25%)' },
    { key: 'arch', label: 'مهندس عمارة (25%)' }
  ];

  const pipelines = disciplines.map(disc => {
    const sEng = studyEngs[disc.key] || { name: '—', fundStatus: 'داخل' };
    const fundPct = sEng.fundStatus === 'داخل' ? 0.25 : 0.10;

    // Stage 1: Syndicate (10%)
    const syndicateFee = grossEachSYP * 0.10;
    const rem1 = grossEachSYP - syndicateFee;

    // Stage 2: Fund (10% / 25%)
    const fundFee = rem1 * fundPct;
    const netStudyFee = (rem1 - fundFee) + printEachSYP;

    return {
      disciplineKey: disc.key,
      disciplineAr: disc.label,
      studyEngName: sEng.name,
      coachEngName: 'لا يستوجب',
      auditorEngName: '—',
      grossAmount: grossEachSYP,
      syndicateFee,
      auditingFee: 0,
      fundFee,
      coachFee: 0,
      printShare: printEachSYP,
      netStudyFee,
      netCoachFee: 0,
      fundStatus: sEng.fundStatus,
      hasCoach: false
    };
  });

  const totalEngineersNet = pipelines.reduce((sum, p) => sum + p.netStudyFee, 0);
  const syndicateFees = pipelines.reduce((sum, p) => sum + p.syndicateFee, 0);
  const totalFundFees = pipelines.reduce((sum, p) => sum + p.fundFee, 0);
  const syndicateDepositTotal = syndicateFees + totalFundFees;

  return {
    effectiveArea,
    feeStudyUSD,
    feeStudySYP,
    feePrintSYP,
    grandTotalSYP,
    grandTotalUSD,
    pipelines,
    totalEngineersNet,
    syndicateDepositTotal,
    syndicateFees,
    totalFundFees
  };
}

// ==========================================
// 5. EXPRESS_Q RAPID QUOTATIONS ENGINE
// ==========================================
export function calculateElevatorQuote(
  stops: number,
  capacityKg: number,
  elevatorType: 'Passenger' | 'Cargo / Freight' = 'Passenger'
) {
  const baseRate = 150.0;
  const ratePerStop = 15.0;
  const taxRate = 0.05;

  const typeMultiplier = elevatorType === 'Cargo / Freight' ? 1.3 : 1.0;
  const baseFee = baseRate * typeMultiplier;
  const stopsFee = Math.max(0, stops - 2) * ratePerStop;
  const capacityFee = (capacityKg / 100.0) * 5.0;

  const subtotal = baseFee + stopsFee + capacityFee;
  const syndicateTax = subtotal * taxRate;
  const totalFee = subtotal + syndicateTax;

  return {
    baseFee: Number(baseFee.toFixed(2)),
    stopsFee: Number(stopsFee.toFixed(2)),
    capacityFee: Number(capacityFee.toFixed(2)),
    syndicateTax: Number(syndicateTax.toFixed(2)),
    totalFee: Number(totalFee.toFixed(2))
  };
}

export function calculateElectricalLoadQuote(
  areaM2: number,
  buildingCategory: string,
  voltageSystem: string = '3-Phase (380V)',
  powerFactor: number = 0.85
) {
  const loadDensityMap: Record<string, number> = {
    'Residential (سكني)': 35.0,
    'Commercial (تجاري)': 65.0,
    'Industrial / Workshop (صناعي / حرفي)': 100.0,
    'Administrative / Office (إداري)': 50.0
  };

  const wattsPerM2 = loadDensityMap[buildingCategory] || 40.0;
  const totalWatts = areaM2 * wattsPerM2;
  const kva = totalWatts / (1000.0 * powerFactor);

  let amps = 0;
  if (voltageSystem === '3-Phase (380V)') {
    amps = (kva * 1000.0) / (Math.sqrt(3) * 380.0);
  } else {
    amps = (kva * 1000.0) / 220.0;
  }

  let tierRate = 2.0;
  if (kva <= 25) {
    tierRate = 3.0;
  } else if (kva <= 100) {
    tierRate = 2.5;
  }

  const subtotalFee = kva * tierRate;
  const tax = subtotalFee * 0.05;
  const totalFee = subtotalFee + tax;

  return {
    calculatedKva: Number(kva.toFixed(2)),
    requiredAmps: Number(amps.toFixed(2)),
    tierRate,
    syndicateFee: Number(subtotalFee.toFixed(2)),
    totalFee: Number(totalFee.toFixed(2))
  };
}
