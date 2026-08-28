export type BranchCode = 'HAS' | 'QAM' | 'DER';

export type UserRole = 
  | 'accountant' // محاسب الوحدة
  | 'archive_officer' // مسؤول الأرشيف والتوثيق
  | 'branch_auditor' // مدقق الفرع
  | 'hub_auditor'; // مدقق مركزي عام

export interface BranchInfo {
  code: BranchCode;
  name_ar: string;
  city_ar: string;
  header_title: string;
  sub_kurdish: string;
  default_accountant: string;
  address: string;
  phone: string;
}

export type EngineerRank = 'استشاري' | 'ممارس' | 'متدرب' | 'مشارك';
export type FundStatus = 'داخل' | 'خارج';
export type RoleQualification = 'دراسة' | 'دراسة,تدريب' | 'دراسة,تدريب,تدقيق';

export interface EngineerRecord {
  id: string;
  serial: number;
  fullName: string;
  department: string; // مدني, عمارة, ميكانيك, كهرباء
  specialization: string; // مدني, عمارة, ميكانيك, كهرباء, مائية, جيولوجيا, جيوتكنيك
  roleQualification: string; // دراسة, دراسة,تدريب, etc.
  rank: EngineerRank;
  fundStatus: FundStatus;
  phone: string;
  otherPhone?: string;
  workCity: string;
  birthDate?: string;
  gender?: string;
  workPlace?: string;
  points: number;
  monthlyPoints: number;
  ytdPoints: number;
  highPerformerStatus?: string;
  lastUpdated?: string;
  notes?: string;
  // Archive verification fields (SoD)
  archiveRef?: string; // الرقم الأرشيفي الورقي
  degreeCertNo?: string; // رقم المصدقة الجامعية
  examDecreeNo?: string; // رقم قرار لجنة الاختبار
  verifiedBy?: string; // الموظف الموثّق
  verificationDate?: string;
  branch: BranchCode;
}

export interface DisciplinePipelineResult {
  disciplineKey: string;
  disciplineAr: string;
  studyEngName: string;
  coachEngName: string;
  auditorEngName: string;
  grossAmount: number;
  syndicateFee: number; // 15% or 7.5% or 10%
  auditingFee: number; // 20%
  fundFee: number; // 10% or 25%
  coachFee: number; // 15% or 0%
  printShare: number;
  netStudyFee: number;
  netCoachFee: number;
  fundStatus: FundStatus;
  hasCoach: boolean;
}

export interface ProjectCategory {
  id: string;
  code: string; // e.g. RES-01, COM-02, IND-03
  name_ar: string; // e.g. الأبنية السكنية والفلل
  name_ku: string; // e.g. Avahiyên Niştecîbûnê
  nameAr?: string; // alias
  nameKu?: string; // alias
  color: string; // HEX color e.g. #00FFD1
  description: string;
  icon?: string;
  targetSharePct?: number; // Target share benchmark
  isDefault?: boolean;
  createdAt?: string;
}

export interface ProjectInputs {
  clientName: string;
  clientPhone: string;
  zoneLoc: string;
  parcelNo: number;
  propNo: number;
  projectType: string;
  serviceType: string;
  totalArea: number;
  builtArea: number;
  floorsCount: number;
  elevatorsCount: number;
  elecCapacity: number;
  unitRate: number;
  exchangeRate: number;
  categoryId?: string;
}

export interface InvoiceRecord {
  id: string;
  date: string;
  time: string;
  invoiceNumber: string;
  clientName: string;
  clientPhone: string;
  totalAmount: number;
  currency: 'SYP' | 'USD';
  branchCode: BranchCode;
  modelType: string;
  status: 'Issued' | 'Audited' | 'Settled';
  issuedBy: string;
  categoryId?: string;
  categoryName?: string;
  relatedProject?: Partial<ProjectInputs>;
}

export interface PayOrderRecord {
  id: string;
  date: string;
  time: string;
  payOrderNumber: string;
  relatedInvoice: string;
  totalAmount: number;
  currency: 'SYP' | 'USD';
  branchCode: BranchCode;
  modelType: string;
  status: 'Issued' | 'Approved' | 'Disbursed';
  issuedBy: string;
  breakdown: Array<{
    engineerName: string;
    discipline: string;
    role: 'دراسة' | 'تدريب' | 'تدقيق' | 'إشراف' | 'فحص';
    netAmount: number;
  }>;
}

export interface SyndicateDepositRecord {
  id: string;
  date: string;
  time: string;
  depositNumber: string;
  relatedInvoice: string;
  totalAmount: number;
  currency: 'SYP' | 'USD';
  branchCode: BranchCode;
  modelType: string;
  issuedBy: string;
  fundsBreakdown: Array<{
    fundName: string;
    amount: number;
    description: string;
  }>;
}

export interface SyndicateContributionRecord {
  id: string;
  date: string;
  depositId: string;
  relatedInvoice: string;
  branch?: BranchCode;
  modelType?: string;
  fundName: string;
  engineerName: string;
  discipline: string;
  roleType?: string;
  fundStatus: string;
  amount: number;
  currency: 'SYP' | 'USD';
}

export type FundContributionRecord = SyndicateContributionRecord;

export interface LedgerEntry {
  id: string;
  documentId?: string;
  date?: string;
  timestamp?: string;
  branchCode?: BranchCode;
  accountCode?: string;
  accountName: string;
  description?: string;
  debit: number;
  credit: number;
  balance?: number;
  partyName?: string;
  currency?: 'SYP' | 'USD';
  notes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userRole?: string;
  role?: string;
  branch?: BranchCode;
  branchCode?: BranchCode;
  action?: string;
  actionType?: string;
  targetTable?: string;
  targetId?: string;
  details?: string;
  checksum?: string;
  oldValue?: string;
  newValue?: string;
}
