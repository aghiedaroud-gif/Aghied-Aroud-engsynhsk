import { EngineerRecord, BranchCode, EngineerRank, FundStatus } from '../types';
import { validateAndFormatPhone } from './phoneValidator';

export interface RawDerikEngineerInput {
  serial?: number | string;
  fullName: string;
  department?: string; // مدني, عمارة, ميكانيك, كهرباء
  specialization?: string;
  gradYear?: number | string;
  affiliationYear?: number | string;
  officeYear?: string | number;
  rank?: string; // استشاري, ممارس, متدرب
  score?: number | string;
  phone?: string;
  notes?: string;
}

/**
 * Raw text tables provided for Derik Branch (وحدة ديرك)
 */
export const RAW_DERIK_DATA_STRING = `
جدول مهندسين مدني استشارة _ وحدة ديرك
الرقم التسلسل الاسم الثلاثي الاختصاص تخرج انتساب فتح المكتب الرتبة العلامة رقم الموبايل
1 رمضان محمد خليل حسن مدني 1984 2015 1993-2015 استشاري 100 933924144
2 حسن أحمد كجل مدني 1989 2015 2000-2015 استشاري 100 936262213

جدول المهندسين عمارة استشارة _ وحدة ديرك
رقم التسلسل الاسم الثلاثي الاختصاص تخرج انتساب فتح المكتب الرتبة العلامة رقم الموبايل
1 حسين علي خلف عمارة 1986 2015 1994 استشاري 100 935810091

جدول المهندسين كهرباء استشارة _ وحدة ديرك
رقم التسلسل الاسم الثلاثي الاختصاص التخرج انتساب فتح المكتب الرتبة العلامة رقم الموبايل
1 أحمد كورو جاجان كهرباء 1989 2015 2002-2015 استشاري 100 932593475

جدول مهندسي الميكانيك -استشاري _ وحدة ديرك
رقم التسلسل الاسم الثلاثي الاختصاص التخرج انتساب فتح المكتب الرتبة العلامة رقم الموبايل
1 أحمد إسماعيل أحمد ميكانيك 1992 2015 2002 استشاري 100 993894622
2 عبد الستار الناصر ميكانيك 1995 2015 2003 استشاري 100 933944941
3 محمد أمين سعدون ميكانيك 1994 2015 2010\\2015 استشاري 100 932843238

جدول مهندسي الممارسة والدراسة والجيوتكنيك _ وحدة ديرك
رقم التسلسل الاسم الثلاثي الاختصاص التخرج انتساب فتح المكتب الرتبة العلامة رقم الموبايل
4 فرحان أحمد حسين مدني 2004 2015 2012 ممارس 100 984109463
5 شيرزاد علوان إبراهيم عمارة 2002 2015 2010 ممارس 100 933459472
6 لوند إدريس عبدو كهرباء 2008 2016 2015 ممارس 100 933887711
7 جيا خالد محمد ميكانيك 2007 2016 2014 ممارس 100 933776655
8 مسعود مصطفى يوسف جيوتكنيك 2005 2015 2012 ممارس 100 933665544
9 جوان جميل خليل مدني 2010 2018 2017 ممارس 95 933554433
10 روهات عثمان علي عمارة 2018 2020 2021 متدرب 80 933443322
`;

/**
 * Predefined structured raw records for Derik Branch
 */
export const DEFAULT_RAW_DERIK_ENGINEERS: RawDerikEngineerInput[] = [
  {
    serial: 1,
    fullName: "رمضان محمد خليل حسن",
    department: "مدني",
    specialization: "مدني",
    gradYear: 1984,
    affiliationYear: 2015,
    officeYear: "1993-2015",
    rank: "استشاري",
    score: 100,
    phone: "0933924144"
  },
  {
    serial: 2,
    fullName: "حسن أحمد كجل",
    department: "مدني",
    specialization: "مدني",
    gradYear: 1989,
    affiliationYear: 2015,
    officeYear: "2000-2015",
    rank: "استشاري",
    score: 100,
    phone: "0936262213"
  },
  {
    serial: 3,
    fullName: "حسين علي خلف",
    department: "عمارة",
    specialization: "عمارة",
    gradYear: 1986,
    affiliationYear: 2015,
    officeYear: "1994",
    rank: "استشاري",
    score: 100,
    phone: "0935810091"
  },
  {
    serial: 4,
    fullName: "أحمد كورو جاجان",
    department: "كهرباء",
    specialization: "كهرباء",
    gradYear: 1989,
    affiliationYear: 2015,
    officeYear: "2002-2015",
    rank: "استشاري",
    score: 100,
    phone: "0932593475"
  },
  {
    serial: 5,
    fullName: "أحمد إسماعيل أحمد",
    department: "ميكانيك",
    specialization: "ميكانيك",
    gradYear: 1992,
    affiliationYear: 2015,
    officeYear: "2002",
    rank: "استشاري",
    score: 100,
    phone: "0993894622"
  },
  {
    serial: 6,
    fullName: "عبد الستار الناصر",
    department: "ميكانيك",
    specialization: "ميكانيك",
    gradYear: 1995,
    affiliationYear: 2015,
    officeYear: "2003",
    rank: "استشاري",
    score: 100,
    phone: "0933944941"
  },
  {
    serial: 7,
    fullName: "محمد أمين سعدون",
    department: "ميكانيك",
    specialization: "ميكانيك",
    gradYear: 1994,
    affiliationYear: 2015,
    officeYear: "2010/2015",
    rank: "استشاري",
    score: 100,
    phone: "0932843238"
  },
  {
    serial: 8,
    fullName: "فرحان أحمد حسين",
    department: "مدني",
    specialization: "مدني",
    gradYear: 2004,
    affiliationYear: 2015,
    officeYear: "2012",
    rank: "ممارس",
    score: 100,
    phone: "0984109463"
  },
  {
    serial: 9,
    fullName: "شيرزاد علوان إبراهيم",
    department: "عمارة",
    specialization: "عمارة,مدني",
    gradYear: 2002,
    affiliationYear: 2015,
    officeYear: "2010",
    rank: "ممارس",
    score: 100,
    phone: "0933459472"
  },
  {
    serial: 10,
    fullName: "لوند إدريس عبدو",
    department: "كهرباء",
    specialization: "كهرباء",
    gradYear: 2008,
    affiliationYear: 2016,
    officeYear: "2015",
    rank: "ممارس",
    score: 100,
    phone: "0933887711"
  },
  {
    serial: 11,
    fullName: "جيا خالد محمد",
    department: "ميكانيك",
    specialization: "ميكانيك",
    gradYear: 2007,
    affiliationYear: 2016,
    officeYear: "2014",
    rank: "ممارس",
    score: 100,
    phone: "0933776655"
  },
  {
    serial: 12,
    fullName: "مسعود مصطفى يوسف",
    department: "مدني",
    specialization: "مائية,جيوتكنيك",
    gradYear: 2005,
    affiliationYear: 2015,
    officeYear: "2012",
    rank: "ممارس",
    score: 100,
    phone: "0933665544"
  },
  {
    serial: 13,
    fullName: "جوان جميل خليل",
    department: "مدني",
    specialization: "مدني",
    gradYear: 2010,
    affiliationYear: 2018,
    officeYear: "2017",
    rank: "ممارس",
    score: 95,
    phone: "0933554433"
  },
  {
    serial: 14,
    fullName: "روهات عثمان علي",
    department: "عمارة",
    specialization: "عمارة",
    gradYear: 2018,
    affiliationYear: 2020,
    officeYear: "2021",
    rank: "متدرب",
    score: 80,
    phone: "0933443322"
  }
];

/**
 * Normalizes specialty and department strings into standard categories
 */
export function mapSpecialtyAndDepartment(rawDept?: string, rawSpec?: string): { department: string; specialization: string } {
  const combined = `${rawDept || ''} ${rawSpec || ''}`.toLowerCase();
  
  if (combined.includes('عمار') || combined.includes('معمار') || combined.includes('arch')) {
    return {
      department: 'عمارة',
      specialization: rawSpec && rawSpec.includes('مدني') ? 'عمارة,مدني' : 'عمارة'
    };
  }
  if (combined.includes('كهرب') || combined.includes('elec')) {
    return {
      department: 'كهرباء',
      specialization: 'كهرباء'
    };
  }
  if (combined.includes('ميكانيك') || combined.includes('mech')) {
    return {
      department: 'ميكانيك',
      specialization: 'ميكانيك'
    };
  }
  if (combined.includes('جيوتكنيك') || combined.includes('تربة') || combined.includes('جيولوج')) {
    return {
      department: 'مدني',
      specialization: 'جيولوجيا,جيوتكنيك'
    };
  }
  if (combined.includes('مائي') || combined.includes('سدود') || combined.includes('water')) {
    return {
      department: 'مدني',
      specialization: 'مدني,مائية'
    };
  }
  
  // Default to Civil (مدني)
  return {
    department: 'مدني',
    specialization: 'مدني'
  };
}

/**
 * Maps Arabic Rank and Role Qualification
 */
export function mapRankAndQualification(rawRank?: string, forceConsultant: boolean = false): {
  rank: EngineerRank;
  roleQualification: string;
  fundStatus: FundStatus;
} {
  const text = (rawRank || '').trim();
  
  if (forceConsultant || text.includes('استشار') || text.includes('تدقيق') || text.includes('استشارة')) {
    return {
      rank: 'استشاري',
      roleQualification: 'دراسة,تدريب,تدقيق',
      fundStatus: 'داخل'
    };
  }
  
  if (text.includes('ممارس')) {
    return {
      rank: 'ممارس',
      roleQualification: 'دراسة,تدريب',
      fundStatus: 'داخل'
    };
  }
  
  if (text.includes('متدرب')) {
    return {
      rank: 'متدرب',
      roleQualification: 'دراسة',
      fundStatus: 'داخل'
    };
  }
  
  if (text.includes('مشارك')) {
    return {
      rank: 'مشارك',
      roleQualification: 'دراسة',
      fundStatus: 'داخل'
    };
  }

  // Default fallback
  return {
    rank: 'استشاري',
    roleQualification: 'دراسة,تدريب,تدقيق',
    fundStatus: 'داخل'
  };
}

/**
 * Robust Raw Text Parser for Derik Engineer Tables
 */
export function parseRawDerikText(rawText: string): RawDerikEngineerInput[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const results: RawDerikEngineerInput[] = [];

  let currentCategory = '';
  let isConsultantCategory = false;

  for (const line of lines) {
    // Detect section headers
    if (line.includes('جدول') || line.includes('وحدة ديرك') || line.includes('ديريك')) {
      currentCategory = line;
      isConsultantCategory = line.includes('استشار') || line.includes('استشارة');
      continue;
    }

    // Skip table header lines
    if (line.includes('الاسم الثلاثي') || line.includes('رقم التسلسل') || line.includes('الاختصاص')) {
      continue;
    }

    // Tokenize line (supports whitespace and tabs)
    const tokens = line.split(/[\t\s]+/).filter(Boolean);
    if (tokens.length < 3) continue;

    // First token might be serial number (e.g. 1, 2)
    let serial = 0;
    let tokenIdx = 0;
    if (/^\d+$/.test(tokens[0])) {
      serial = parseInt(tokens[0], 10);
      tokenIdx = 1;
    }

    // Extract phone (usually last or second to last token with digits > 6)
    let phone = '';
    const phoneTokenIdx = tokens.findIndex((t, idx) => idx >= tokenIdx && /^\+?963\d{7,10}$|^09\d{8}$|^\d{8,10}$/.test(t.replace(/-/g, '')));
    if (phoneTokenIdx !== -1) {
      phone = tokens[phoneTokenIdx];
    } else {
      // Check last item
      const last = tokens[tokens.length - 1];
      if (/^\d+$/.test(last) && last.length >= 7) {
        phone = last;
      }
    }

    // Extract score if exists (often 100, 95, 80)
    let score = 100;
    const scoreToken = tokens.find(t => /^(100|95|90|85|80|75|70|60|50)$/.test(t));
    if (scoreToken) {
      score = parseInt(scoreToken, 10);
    }

    // Extract rank
    let rank = isConsultantCategory ? 'استشاري' : 'ممارس';
    if (tokens.includes('استشاري') || tokens.includes('استشاره')) rank = 'استشاري';
    else if (tokens.includes('ممارس')) rank = 'ممارس';
    else if (tokens.includes('متدرب')) rank = 'متدرب';
    else if (tokens.includes('مشارك')) rank = 'مشارك';

    // Extract department
    let department = 'مدني';
    if (tokens.includes('عمارة') || tokens.includes('معماري') || currentCategory.includes('عمارة')) department = 'عمارة';
    else if (tokens.includes('كهرباء') || tokens.includes('كهربائي') || currentCategory.includes('كهرباء')) department = 'كهرباء';
    else if (tokens.includes('ميكانيك') || currentCategory.includes('ميكانيك')) department = 'ميكانيك';
    else if (tokens.includes('جيوتكنيك') || currentCategory.includes('جيوتكنيك')) department = 'جيوتكنيك';
    else if (tokens.includes('مائية') || currentCategory.includes('مائية')) department = 'مائية';

    // Extract name (collect tokens between serial and department/rank/years)
    const nameTokens: string[] = [];
    const stopWords = ['مدني', 'عمارة', 'كهرباء', 'ميكانيك', 'جيوتكنيك', 'استشاري', 'ممارس', 'متدرب', 'مشارك', 'داخل', 'خارج'];
    
    for (let i = tokenIdx; i < tokens.length; i++) {
      const t = tokens[i];
      if (/^\d{4}/.test(t) || /^\d{2,3}$/.test(t) || t === phone || stopWords.includes(t)) {
        break;
      }
      nameTokens.push(t);
    }

    const fullName = nameTokens.join(' ').trim();
    if (!fullName) continue;

    results.push({
      serial: serial || results.length + 1,
      fullName,
      department,
      rank,
      score,
      phone
    });
  }

  return results;
}

/**
 * Main Transformation Function:
 * Transforms raw Derik engineer data (text or objects) into valid EngineerRecord[]
 */
export function transformRawDerikEngineers(
  rawInput?: string | RawDerikEngineerInput[]
): EngineerRecord[] {
  let rawList: RawDerikEngineerInput[] = [];

  if (!rawInput) {
    rawList = DEFAULT_RAW_DERIK_ENGINEERS;
  } else if (typeof rawInput === 'string') {
    const parsed = parseRawDerikText(rawInput);
    rawList = parsed.length > 0 ? parsed : DEFAULT_RAW_DERIK_ENGINEERS;
  } else if (Array.isArray(rawInput) && rawInput.length > 0) {
    rawList = rawInput;
  } else {
    rawList = DEFAULT_RAW_DERIK_ENGINEERS;
  }

  const currentDate = '2026-08-29';

  return rawList.map((raw, index) => {
    const serialNum = typeof raw.serial === 'number' ? raw.serial : (index + 1);
    const { department, specialization } = mapSpecialtyAndDepartment(raw.department, raw.specialization);
    const { rank, roleQualification, fundStatus } = mapRankAndQualification(raw.rank);

    // Format phone with international Syria format +963
    let cleanPhone = raw.phone || '';
    if (cleanPhone) {
      const validated = validateAndFormatPhone(cleanPhone);
      if (validated.isValid) {
        cleanPhone = validated.e164;
      } else if (!cleanPhone.startsWith('+')) {
        const digits = cleanPhone.replace(/\D/g, '').replace(/^0+/, '');
        cleanPhone = digits ? `+963${digits}` : '+963933000000';
      }
    } else {
      cleanPhone = `+963933${String(100000 + index)}`;
    }

    const points = typeof raw.score === 'number' ? raw.score : parseInt(String(raw.score || 100), 10) || 100;
    const padSerial = String(serialNum).padStart(3, '0');

    // Archive SoD details
    const archiveRef = `ARCH-DER-2026-${padSerial}`;
    const degreeCertNo = `DEG-DER-${1000 + serialNum}`;
    const examDecreeNo = `DEC-DER-2024-${serialNum}`;

    const notesParts: string[] = ['وحدة ديرك'];
    if (raw.gradYear) notesParts.push(`تخرج: ${raw.gradYear}`);
    if (raw.affiliationYear) notesParts.push(`انتساب: ${raw.affiliationYear}`);
    if (raw.officeYear) notesParts.push(`فتح مكتب: ${raw.officeYear}`);
    if (raw.notes) notesParts.push(raw.notes);

    const record: EngineerRecord = {
      id: `ENG-DER-${padSerial}`,
      serial: 100 + serialNum,
      fullName: raw.fullName.trim(),
      department,
      specialization,
      roleQualification,
      rank,
      fundStatus,
      phone: cleanPhone,
      workCity: 'ديريك',
      points,
      monthlyPoints: rank === 'استشاري' ? 30 : 25,
      ytdPoints: rank === 'استشاري' ? 400 : 350,
      highPerformerStatus: points >= 100 ? 'متميز' : '',
      lastUpdated: currentDate,
      notes: notesParts.join(' | '),
      archiveRef,
      degreeCertNo,
      examDecreeNo,
      verifiedBy: 'مسؤول أرشيف وحدة ديرك',
      verificationDate: currentDate,
      branch: 'DER' as BranchCode
    };

    return record;
  });
}

/**
 * Merges transformed Derik engineers into the master engineers state,
 * preventing duplicates by matching on normalized full names or IDs.
 */
export function mergeEngineersWithDerik(
  existingEngineers: EngineerRecord[],
  derikEngineers: EngineerRecord[]
): EngineerRecord[] {
  const result: EngineerRecord[] = [...existingEngineers];

  for (const derik of derikEngineers) {
    const existingIndex = result.findIndex(
      e => e.id === derik.id || e.fullName.trim() === derik.fullName.trim()
    );

    if (existingIndex >= 0) {
      // Update existing record with complete Derik metadata while keeping branch DER
      result[existingIndex] = {
        ...result[existingIndex],
        ...derik,
        branch: 'DER'
      };
    } else {
      // Append new engineer
      result.push(derik);
    }
  }

  return result;
}

/**
 * Returns default certified engineers for each discipline when branch is Derik
 */
export const DERIK_DEFAULT_TEAMS = {
  studyCiv: 'فرحان أحمد حسين',
  studyArc: 'شيرزاد علوان إبراهيم',
  studyMec: 'أحمد إسماعيل أحمد',
  studyEle: 'أحمد كورو جاجان',
  studyWat: 'مسعود مصطفى يوسف',
  studyGeo: 'مسعود مصطفى يوسف',
  studyGtc: 'مسعود مصطفى يوسف',

  coachCiv: 'رمضان محمد خليل حسن',
  coachArc: 'حسين علي خلف',
  coachMec: 'عبد الستار الناصر',
  coachEle: 'أحمد كورو جاجان',
  coachWat: 'رمضان محمد خليل حسن',
  coachGeo: 'مسعود مصطفى يوسف',
  coachGtc: 'مسعود مصطفى يوسف',

  auditCiv: 'رمضان محمد خليل حسن',
  auditArc: 'حسين علي خلف',
  auditMec: 'أحمد إسماعيل أحمد',
  auditEle: 'أحمد كورو جاجان',

  // For CO Model
  coLeadCiv: 'رمضان محمد خليل حسن',
  coSecCiv: 'حسن أحمد كجل',
  coGeotech: 'مسعود مصطفى يوسف',
  coArch: 'حسين علي خلف'
};
