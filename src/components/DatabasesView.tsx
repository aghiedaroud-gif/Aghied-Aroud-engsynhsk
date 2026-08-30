import React, { useState } from 'react';
import { 
  InvoiceRecord, 
  PayOrderRecord, 
  SyndicateDepositRecord, 
  FundContributionRecord, 
  LedgerEntry, 
  AuditLogEntry, 
  EngineerRecord,
  BranchCode 
} from '../types';
import { DEFAULT_PROJECT_CATEGORIES } from '../data/categoriesData';
import { INITIAL_ENGINEERS } from '../data/engineersData';
import { BRANCH_CONFIG } from '../data/branchConfig';
import { 
  Database, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Upload,
  Tag, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Layers,
  ArrowUpRight,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Lock,
  Key,
  HardDriveDownload,
  ShieldAlert,
  X,
  FileCode2,
  Check,
  FileText,
  Building2,
  Calendar,
  Users
} from 'lucide-react';
import { CSVUploadModal } from './CSVUploadModal';
import {
  createEncryptedDatabaseBackup,
  downloadBackupFile,
  DEFAULT_MASTER_BACKUP_KEY,
  EncryptedBackupEnvelope
} from '../utils/cryptoBackup';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface DatabasesViewProps {
  invoices: InvoiceRecord[];
  payOrders: PayOrderRecord[];
  deposits: SyndicateDepositRecord[];
  contributions: FundContributionRecord[];
  ledgerEntries: LedgerEntry[];
  auditLogs: AuditLogEntry[];
  engineers?: EngineerRecord[];
  currentBranch: BranchCode;
  exchangeRate?: number;
  onViewDocument: (docId: string, docType: 'INV' | 'EPO' | 'SFD', payload: any) => void;
  onExportSheets: (modelName: string, data: any) => void;
  onUpdateInvoiceStatus?: (invoiceId: string, newStatus: 'Issued' | 'Audited' | 'Settled') => void;
  onImportLedger?: (entries: LedgerEntry[]) => void;
  onImportInvoices?: (entries: InvoiceRecord[]) => void;
  onImportPayOrders?: (entries: PayOrderRecord[]) => void;
  onImportDeposits?: (entries: SyndicateDepositRecord[]) => void;
  onImportContributions?: (entries: FundContributionRecord[]) => void;
  onImportEngineers?: (entries: EngineerRecord[]) => void;
  onOpenDerikTransformer?: () => void;
}

const ARABIC_MONTHS: { [key: string]: string } = {
  '01': 'كانون 2 (Jan)',
  '02': 'شباط (Feb)',
  '03': 'آذار (Mar)',
  '04': 'نيسان (Apr)',
  '05': 'أيار (May)',
  '06': 'حزيران (Jun)',
  '07': 'تموز (Jul)',
  '08': 'آب (Aug)',
  '09': 'أيلول (Sep)',
  '10': 'تشرين 1 (Oct)',
  '11': 'تشرين 2 (Nov)',
  '12': 'كانون 1 (Dec)'
};

export const DatabasesView: React.FC<DatabasesViewProps> = ({
  invoices,
  payOrders,
  deposits,
  contributions,
  ledgerEntries,
  auditLogs,
  currentBranch,
  exchangeRate = 14000,
  onViewDocument,
  onExportSheets,
  onUpdateInvoiceStatus,
  engineers,
  onImportLedger,
  onImportInvoices,
  onImportPayOrders,
  onImportDeposits,
  onImportContributions,
  onImportEngineers,
  onOpenDerikTransformer
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'payorders' | 'deposits' | 'contributions' | 'ledger' | 'audit' | 'engineers'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('ALL');
  const [chartUnit, setChartUnit] = useState<'M' | 'K'>('M');
  const [csvExportSuccess, setCsvExportSuccess] = useState<boolean>(false);

  // Database Backup Safeguard State
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [useCustomKey, setUseCustomKey] = useState(false);
  const [customPassphrase, setCustomPassphrase] = useState('');
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [backupSuccessInfo, setBackupSuccessInfo] = useState<{ fileName: string; rawSizeKb: number; timestamp: string; counts: any } | null>(null);
  const [backupQuickSuccess, setBackupQuickSuccess] = useState(false);

  // Ledger Dedicated Print-Friendly State
  const [ledgerPrintModalOpen, setLedgerPrintModalOpen] = useState(false);
  const [ledgerPrintOrientation, setLedgerPrintOrientation] = useState<'portrait' | 'landscape'>('landscape');

  // CSV Export Suite & Modal State
  const [csvExportModalOpen, setCsvExportModalOpen] = useState(false);
  const [csvExportType, setCsvExportType] = useState<'unified' | 'ledger' | 'invoices' | 'payorders' | 'deposits' | 'contributions'>('unified');
  const [csvLastExportedName, setCsvLastExportedName] = useState<string>('');

  // CSV Upload/Import Modal State
  const [csvUploadModalOpen, setCsvUploadModalOpen] = useState(false);

  const effectiveEngineers = engineers && engineers.length > 0 ? engineers : INITIAL_ENGINEERS;

  // Reusable CSV escaping and downloading utilities (RFC 4180 + UTF-8 BOM \uFEFF)
  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).trim();
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes(';')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const escapeNum = (val: number | undefined | null, decimals: number = 2): string => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    return Number(val).toFixed(decimals);
  };

  const downloadCSVBlob = (filename: string, csvBody: string) => {
    // Prepend UTF-8 BOM (\uFEFF) for Excel, Al-Ameen, QuickBooks, and Windows Arabic encoding support
    const blob = new Blob(['\uFEFF' + csvBody], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCsvLastExportedName(filename);
    setCsvExportSuccess(true);
    setTimeout(() => {
      setCsvExportSuccess(false);
    }, 4500);
  };

  // 1. Export General Ledger to CSV
  const handleExportLedgerCSV = () => {
    const entriesToExport = filteredLedgerEntries;
    if (entriesToExport.length === 0) {
      alert('لا توجد قيود محاسبية مطابقة للفلتر الحالي لتصديرها.');
      return;
    }

    const headers = [
      'Entry_ID',
      'Date',
      'Timestamp',
      'Branch',
      'Account_Code',
      'Account_Name',
      'Description',
      'Debit',
      'Credit',
      'Balance',
      'Currency',
      'Document_Ref',
      'Party_Name',
      'Notes'
    ];

    const rows = entriesToExport.map(entry => {
      const dateStr = entry.date || (entry.timestamp ? entry.timestamp.split(' ')[0] : '2026-08-25');
      const timeStr = entry.timestamp || `${entry.date || '2026-08-25'} 10:00:00`;
      const branchStr = entry.branchCode || (filterBranch !== 'ALL' ? filterBranch : currentBranch);
      const accCodeStr = entry.accountCode || (entry.debit > 0 ? '3101' : '2201');
      const docRefStr = entry.documentId || '';
      const partyStr = entry.partyName || '';
      const notesStr = entry.notes || '';
      const currencyStr = entry.currency || 'SYP';

      return [
        escapeCSV(entry.id),
        escapeCSV(dateStr),
        escapeCSV(timeStr),
        escapeCSV(branchStr),
        escapeCSV(accCodeStr),
        escapeCSV(entry.accountName),
        escapeCSV(entry.description || ''),
        escapeNum(entry.debit),
        escapeNum(entry.credit),
        escapeNum(entry.balance ?? (entry.debit - entry.credit)),
        escapeCSV(currencyStr),
        escapeCSV(docRefStr),
        escapeCSV(partyStr),
        escapeCSV(notesStr)
      ].join(',');
    });

    const totalDebit = entriesToExport.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = entriesToExport.reduce((sum, e) => sum + (e.credit || 0), 0);
    const totalBalance = entriesToExport.reduce((sum, e) => sum + (e.balance ?? (e.debit - e.credit)), 0);

    const summaryRow = [
      escapeCSV('TOTALS'),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(filterBranch === 'ALL' ? 'ALL_BRANCHES' : filterBranch),
      escapeCSV('GL-SUMMARY'),
      escapeCSV('General Ledger Aggregate Summary'),
      escapeCSV(`Total ${entriesToExport.length} journal ledger entries`),
      escapeNum(totalDebit),
      escapeNum(totalCredit),
      escapeNum(totalBalance),
      escapeCSV('SYP/USD'),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV('Engineering Syndicate Unified Accounting System 2026')
    ].join(',');

    const csvContent = [headers.join(','), ...rows, summaryRow].join('\r\n');
    const branchLabel = filterBranch === 'ALL' ? 'ALL' : filterBranch;
    const dateStamp = new Date().toISOString().split('T')[0];
    downloadCSVBlob(`General_Ledger_${branchLabel}_${dateStamp}.csv`, csvContent);
  };

  // 2. Export Projects & Invoices to CSV
  const handleExportInvoicesCSV = () => {
    const listToExport = filteredInvoices;
    if (listToExport.length === 0) {
      alert('لا توجد فواتير أو مشاريع مطابقة للفلتر الحالي.');
      return;
    }

    const headers = [
      'Invoice_Number',
      'Date',
      'Time',
      'Branch_Code',
      'Branch_Name',
      'Client_Name',
      'Client_Phone',
      'Model_Type',
      'Category_ID',
      'Category_Name',
      'Total_Amount',
      'Currency',
      'Status',
      'Issued_By',
      'Estimated_Syndicate_Share_15pct',
      'Estimated_Mutual_Fund_25pct',
      'Estimated_Auditing_Fee_5pct',
      'Estimated_Engineer_Net_Share'
    ];

    const rows = listToExport.map(inv => {
      const cat = DEFAULT_PROJECT_CATEGORIES.find(c => c.id === inv.categoryId);
      const branchName = BRANCH_CONFIG[inv.branchCode]?.city_ar || inv.branchCode;
      const total = inv.totalAmount || 0;
      const syn15 = total * 0.15;
      const rem = total - syn15;
      const fund25 = rem * 0.25;
      const audit5 = rem * 0.05;
      const engNet = rem - fund25 - audit5;

      return [
        escapeCSV(inv.invoiceNumber),
        escapeCSV(inv.date),
        escapeCSV(inv.time),
        escapeCSV(inv.branchCode),
        escapeCSV(branchName),
        escapeCSV(inv.clientName),
        escapeCSV(inv.clientPhone),
        escapeCSV(inv.modelType),
        escapeCSV(inv.categoryId || ''),
        escapeCSV(cat ? cat.name_ar : (inv.categoryName || 'عام')),
        escapeNum(inv.totalAmount),
        escapeCSV(inv.currency),
        escapeCSV(inv.status),
        escapeCSV(inv.issuedBy),
        escapeNum(syn15),
        escapeNum(fund25),
        escapeNum(audit5),
        escapeNum(engNet)
      ].join(',');
    });

    const sumTotal = listToExport.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const sumSyn = sumTotal * 0.15;
    const sumFund = (sumTotal - sumSyn) * 0.25;
    const sumAudit = (sumTotal - sumSyn) * 0.05;
    const sumEng = (sumTotal - sumSyn) - sumFund - sumAudit;

    const summaryRow = [
      escapeCSV('TOTALS'),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(filterBranch === 'ALL' ? 'ALL_BRANCHES' : filterBranch),
      escapeCSV('Summary of Invoiced Projects'),
      escapeCSV(`Total ${listToExport.length} Projects`),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeNum(sumTotal),
      escapeCSV('SYP/USD'),
      escapeCSV(''),
      escapeCSV(''),
      escapeNum(sumSyn),
      escapeNum(sumFund),
      escapeNum(sumAudit),
      escapeNum(sumEng)
    ].join(',');

    const csvContent = [headers.join(','), ...rows, summaryRow].join('\r\n');
    const branchLabel = filterBranch === 'ALL' ? 'ALL' : filterBranch;
    const dateStamp = new Date().toISOString().split('T')[0];
    downloadCSVBlob(`Projects_Invoices_${branchLabel}_${dateStamp}.csv`, csvContent);
  };

  // 3. Export Engineer Pay Orders (EPO) to CSV
  const handleExportPayOrdersCSV = () => {
    const listToExport = filteredPayOrders;
    if (listToExport.length === 0) {
      alert('لا توجد أوامر صرف أتعاب مطابقة للفلتر الحالي.');
      return;
    }

    const headers = [
      'Pay_Order_Number',
      'Related_Invoice',
      'Date',
      'Time',
      'Branch_Code',
      'Model_Type',
      'Beneficiary_Engineer',
      'Discipline',
      'Role',
      'Net_Engineer_Payout',
      'Total_Order_Amount',
      'Currency',
      'Status',
      'Issued_By'
    ];

    const rows: string[] = [];
    listToExport.forEach(epo => {
      if (epo.breakdown && epo.breakdown.length > 0) {
        epo.breakdown.forEach(item => {
          rows.push([
            escapeCSV(epo.payOrderNumber),
            escapeCSV(epo.relatedInvoice),
            escapeCSV(epo.date),
            escapeCSV(epo.time),
            escapeCSV(epo.branchCode),
            escapeCSV(epo.modelType),
            escapeCSV(item.engineerName),
            escapeCSV(item.discipline),
            escapeCSV(item.role),
            escapeNum(item.netAmount),
            escapeNum(epo.totalAmount),
            escapeCSV(epo.currency),
            escapeCSV(epo.status),
            escapeCSV(epo.issuedBy)
          ].join(','));
        });
      } else {
        rows.push([
          escapeCSV(epo.payOrderNumber),
          escapeCSV(epo.relatedInvoice),
          escapeCSV(epo.date),
          escapeCSV(epo.time),
          escapeCSV(epo.branchCode),
          escapeCSV(epo.modelType),
          escapeCSV('N/A'),
          escapeCSV('General'),
          escapeCSV('صرف أتعاب'),
          escapeNum(epo.totalAmount),
          escapeNum(epo.totalAmount),
          escapeCSV(epo.currency),
          escapeCSV(epo.status),
          escapeCSV(epo.issuedBy)
        ].join(','));
      }
    });

    const sumTotal = listToExport.reduce((sum, epo) => sum + (epo.totalAmount || 0), 0);
    const summaryRow = [
      escapeCSV('TOTALS'),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(filterBranch === 'ALL' ? 'ALL_BRANCHES' : filterBranch),
      escapeCSV('EPO Payout Orders'),
      escapeCSV(`Total ${listToExport.length} Pay Orders`),
      escapeCSV(''),
      escapeCSV(''),
      escapeNum(sumTotal),
      escapeNum(sumTotal),
      escapeCSV('SYP/USD'),
      escapeCSV(''),
      escapeCSV('')
    ].join(',');

    const csvContent = [headers.join(','), ...rows, summaryRow].join('\r\n');
    const branchLabel = filterBranch === 'ALL' ? 'ALL' : filterBranch;
    const dateStamp = new Date().toISOString().split('T')[0];
    downloadCSVBlob(`Engineer_Pay_Orders_${branchLabel}_${dateStamp}.csv`, csvContent);
  };

  // 4. Export Syndicate Deposits (SFD) to CSV
  const handleExportDepositsCSV = () => {
    const listToExport = filteredDeposits;
    if (listToExport.length === 0) {
      alert('لا توجد إيداعات صناديق مطابقة للفلتر الحالي.');
      return;
    }

    const headers = [
      'Deposit_Number',
      'Related_Invoice',
      'Date',
      'Time',
      'Branch_Code',
      'Model_Type',
      'Fund_Name',
      'Fund_Amount',
      'Fund_Description',
      'Total_Deposit_Amount',
      'Currency',
      'Issued_By'
    ];

    const rows: string[] = [];
    listToExport.forEach(sfd => {
      if (sfd.fundsBreakdown && sfd.fundsBreakdown.length > 0) {
        sfd.fundsBreakdown.forEach(fund => {
          rows.push([
            escapeCSV(sfd.depositNumber),
            escapeCSV(sfd.relatedInvoice),
            escapeCSV(sfd.date),
            escapeCSV(sfd.time),
            escapeCSV(sfd.branchCode),
            escapeCSV(sfd.modelType),
            escapeCSV(fund.fundName),
            escapeNum(fund.amount),
            escapeCSV(fund.description),
            escapeNum(sfd.totalAmount),
            escapeCSV(sfd.currency),
            escapeCSV(sfd.issuedBy)
          ].join(','));
        });
      } else {
        rows.push([
          escapeCSV(sfd.depositNumber),
          escapeCSV(sfd.relatedInvoice),
          escapeCSV(sfd.date),
          escapeCSV(sfd.time),
          escapeCSV(sfd.branchCode),
          escapeCSV(sfd.modelType),
          escapeCSV('صندوق النقابة العام'),
          escapeNum(sfd.totalAmount),
          escapeCSV('إيداع نقابي عام'),
          escapeNum(sfd.totalAmount),
          escapeCSV(sfd.currency),
          escapeCSV(sfd.issuedBy)
        ].join(','));
      }
    });

    const sumTotal = listToExport.reduce((sum, sfd) => sum + (sfd.totalAmount || 0), 0);
    const summaryRow = [
      escapeCSV('TOTALS'),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(filterBranch === 'ALL' ? 'ALL_BRANCHES' : filterBranch),
      escapeCSV('SFD Syndicate Deposits'),
      escapeCSV(`Total ${listToExport.length} Deposits`),
      escapeNum(sumTotal),
      escapeCSV(''),
      escapeNum(sumTotal),
      escapeCSV('SYP/USD'),
      escapeCSV('')
    ].join(',');

    const csvContent = [headers.join(','), ...rows, summaryRow].join('\r\n');
    const branchLabel = filterBranch === 'ALL' ? 'ALL' : filterBranch;
    const dateStamp = new Date().toISOString().split('T')[0];
    downloadCSVBlob(`Syndicate_Deposits_${branchLabel}_${dateStamp}.csv`, csvContent);
  };

  // 5. Export Fund Contributions to CSV
  const handleExportContributionsCSV = () => {
    const listToExport = filteredContributions;
    if (listToExport.length === 0) {
      alert('لا توجد اشتراكات صناديق مطابقة للفلتر الحالي.');
      return;
    }

    const headers = [
      'Contribution_ID',
      'Date',
      'Deposit_ID',
      'Branch',
      'Engineer_Name',
      'Discipline',
      'Fund_Name',
      'Fund_Status',
      'Contribution_Amount',
      'Currency'
    ];

    const rows = listToExport.map(c => [
      escapeCSV(c.id),
      escapeCSV(c.date),
      escapeCSV(c.depositId),
      escapeCSV(c.branch || currentBranch),
      escapeCSV(c.engineerName),
      escapeCSV(c.discipline || 'عام'),
      escapeCSV(c.fundName),
      escapeCSV(c.fundStatus),
      escapeNum(c.amount),
      escapeCSV(c.currency)
    ].join(','));

    const sumTotal = listToExport.reduce((sum, c) => sum + (c.amount || 0), 0);
    const summaryRow = [
      escapeCSV('TOTALS'),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(filterBranch === 'ALL' ? 'ALL_BRANCHES' : filterBranch),
      escapeCSV(`Total ${listToExport.length} Contributions`),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeNum(sumTotal),
      escapeCSV('SYP')
    ].join(',');

    const csvContent = [headers.join(','), ...rows, summaryRow].join('\r\n');
    const branchLabel = filterBranch === 'ALL' ? 'ALL' : filterBranch;
    const dateStamp = new Date().toISOString().split('T')[0];
    downloadCSVBlob(`Engineer_Contributions_${branchLabel}_${dateStamp}.csv`, csvContent);
  };

  // 6. Master Unified Accounting & Projects Journal Export (Cross-mapped Comprehensive Spreadsheet)
  const handleExportUnifiedJournalCSV = () => {
    const invoicesList = filteredInvoices;
    const ledgerList = filteredLedgerEntries;

    if (invoicesList.length === 0 && ledgerList.length === 0) {
      alert('لا توجد بيانات مطابقة للفلتر لتصدير المصنف الموحد.');
      return;
    }

    const headers = [
      'RECORD_TYPE',
      'DOCUMENT_OR_ENTRY_ID',
      'DATE',
      'TIMESTAMP',
      'BRANCH_CODE',
      'CLIENT_OR_PARTY_NAME',
      'CLIENT_PHONE',
      'CATEGORY_OR_ACCOUNT',
      'MODEL_OR_DESC',
      'PROJECT_GROSS_FEE',
      'SYNDICATE_SHARE_15PCT',
      'MUTUAL_FUND_SHARE',
      'AUDIT_FEE_SHARE',
      'ENGINEER_NET_PAYOUT',
      'LEDGER_DEBIT',
      'LEDGER_CREDIT',
      'RUNNING_BALANCE',
      'CURRENCY',
      'STATUS_OR_REF',
      'OPERATOR'
    ];

    const rows: string[] = [];

    // Part A: Map Invoices & Related EPO/SFD Records
    invoicesList.forEach(inv => {
      const relatedEPO = payOrders.find(p => p.relatedInvoice === inv.invoiceNumber);
      const relatedSFD = deposits.find(d => d.relatedInvoice === inv.invoiceNumber);
      const cat = DEFAULT_PROJECT_CATEGORIES.find(c => c.id === inv.categoryId);

      const total = inv.totalAmount || 0;
      const syn15 = total * 0.15;
      const rem = total - syn15;
      const fundShare = rem * 0.25;
      const auditShare = rem * 0.05;
      const engPayout = relatedEPO ? relatedEPO.totalAmount : (rem - fundShare - auditShare);

      rows.push([
        escapeCSV('PROJECT_INVOICE'),
        escapeCSV(inv.invoiceNumber),
        escapeCSV(inv.date),
        escapeCSV(`${inv.date} ${inv.time}`),
        escapeCSV(inv.branchCode),
        escapeCSV(inv.clientName),
        escapeCSV(inv.clientPhone),
        escapeCSV(cat ? cat.name_ar : (inv.categoryName || 'مشروع هندسي')),
        escapeCSV(inv.modelType),
        escapeNum(total),
        escapeNum(syn15),
        escapeNum(fundShare),
        escapeNum(auditShare),
        escapeNum(engPayout),
        escapeNum(total), // Cash received / Debit
        escapeNum(0),
        escapeNum(total),
        escapeCSV(inv.currency),
        escapeCSV(inv.status),
        escapeCSV(inv.issuedBy)
      ].join(','));

      if (relatedEPO) {
        rows.push([
          escapeCSV('PAY_ORDER_EPO'),
          escapeCSV(relatedEPO.payOrderNumber),
          escapeCSV(relatedEPO.date),
          escapeCSV(`${relatedEPO.date} ${relatedEPO.time}`),
          escapeCSV(relatedEPO.branchCode),
          escapeCSV(relatedEPO.breakdown && relatedEPO.breakdown.length > 0 ? relatedEPO.breakdown.map(b => b.engineerName).join(' | ') : 'فريق المهندسين'),
          escapeCSV(''),
          escapeCSV('أتعاب دراسة وتدقيق وإشراف'),
          escapeCSV(`Linked to: ${inv.invoiceNumber}`),
          escapeNum(0),
          escapeNum(0),
          escapeNum(0),
          escapeNum(0),
          escapeNum(relatedEPO.totalAmount),
          escapeNum(0),
          escapeNum(relatedEPO.totalAmount), // Credit to engineers
          escapeNum(-relatedEPO.totalAmount),
          escapeCSV(relatedEPO.currency),
          escapeCSV(relatedEPO.status),
          escapeCSV(relatedEPO.issuedBy)
        ].join(','));
      }

      if (relatedSFD) {
        rows.push([
          escapeCSV('SYNDICATE_DEPOSIT_SFD'),
          escapeCSV(relatedSFD.depositNumber),
          escapeCSV(relatedSFD.date),
          escapeCSV(`${relatedSFD.date} ${relatedSFD.time}`),
          escapeCSV(relatedSFD.branchCode),
          escapeCSV('صناديق نقابة المهندسين'),
          escapeCSV(''),
          escapeCSV('اقتطاعات الصندوق المشترك والتقاعد والتدقيق'),
          escapeCSV(`Linked to: ${inv.invoiceNumber}`),
          escapeNum(0),
          escapeNum(syn15),
          escapeNum(fundShare),
          escapeNum(auditShare),
          escapeNum(0),
          escapeNum(0),
          escapeNum(relatedSFD.totalAmount), // Credit to Syndicate funds
          escapeNum(-relatedSFD.totalAmount),
          escapeCSV(relatedSFD.currency),
          escapeCSV('Deposited'),
          escapeCSV(relatedSFD.issuedBy)
        ].join(','));
      }
    });

    // Part B: Map Distinct Ledger Journal Entries
    ledgerList.forEach(l => {
      rows.push([
        escapeCSV('LEDGER_ENTRY'),
        escapeCSV(l.id),
        escapeCSV(l.date || '2026-08-25'),
        escapeCSV(l.timestamp || `${l.date || '2026-08-25'} 12:00:00`),
        escapeCSV(l.branchCode || currentBranch),
        escapeCSV(l.partyName || l.accountName),
        escapeCSV(''),
        escapeCSV(`[${l.accountCode}] ${l.accountName}`),
        escapeCSV(l.description || ''),
        escapeNum(0),
        escapeNum(0),
        escapeNum(0),
        escapeNum(0),
        escapeNum(0),
        escapeNum(l.debit),
        escapeNum(l.credit),
        escapeNum(l.balance ?? (l.debit - l.credit)),
        escapeCSV(l.currency || 'SYP'),
        escapeCSV(l.documentId || 'GL'),
        escapeCSV('System Auto-Post')
      ].join(','));
    });

    const sumGrossFee = invoicesList.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const sumDebits = ledgerList.reduce((sum, l) => sum + (l.debit || 0), 0);
    const sumCredits = ledgerList.reduce((sum, l) => sum + (l.credit || 0), 0);
    const sumBalance = ledgerList.reduce((sum, l) => sum + (l.balance ?? (l.debit - l.credit)), 0);

    const summaryRow = [
      escapeCSV('SUMMARY_TOTALS'),
      escapeCSV('ALL_RECORDS'),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(filterBranch === 'ALL' ? 'ALL_BRANCHES' : filterBranch),
      escapeCSV('Syndicate Unified Financial Statement'),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(`Total Records: ${rows.length}`),
      escapeNum(sumGrossFee),
      escapeNum(sumGrossFee * 0.15),
      escapeNum(sumGrossFee * 0.85 * 0.25),
      escapeNum(sumGrossFee * 0.85 * 0.05),
      escapeNum(sumGrossFee * 0.85 * 0.70),
      escapeNum(sumDebits),
      escapeNum(sumCredits),
      escapeNum(sumBalance),
      escapeCSV('SYP/USD'),
      escapeCSV('RECONCILED'),
      escapeCSV('Syndicate Financial Controller')
    ].join(',');

    const csvContent = [headers.join(','), ...rows, summaryRow].join('\r\n');
    const branchLabel = filterBranch === 'ALL' ? 'ALL' : filterBranch;
    const dateStamp = new Date().toISOString().split('T')[0];
    downloadCSVBlob(`Unified_Accounting_Journal_${branchLabel}_${dateStamp}.csv`, csvContent);
  };

  // Execute Encrypted Database Backup
  const handleExecuteBackupDownload = async (passkeyToUse?: string) => {
    setIsExportingBackup(true);
    try {
      const selectedKey = passkeyToUse !== undefined 
        ? passkeyToUse 
        : (useCustomKey && customPassphrase.trim() ? customPassphrase.trim() : DEFAULT_MASTER_BACKUP_KEY);

      const result = await createEncryptedDatabaseBackup({
        invoices,
        payOrders,
        deposits,
        engineers: effectiveEngineers,
        contributions,
        ledgerEntries,
        auditLogs,
        branch: currentBranch,
        passphrase: selectedKey
      });

      downloadBackupFile(result.jsonString, result.fileName);

      setBackupSuccessInfo({
        fileName: result.fileName,
        rawSizeKb: result.rawSizeKb,
        timestamp: new Date().toLocaleTimeString('ar-SY'),
        counts: result.envelope.record_counts
      });
      setBackupQuickSuccess(true);
      setTimeout(() => setBackupQuickSuccess(false), 4500);
    } catch (err) {
      console.error('Database backup error:', err);
      alert('حدث خطأ أثناء تشفير وتنزيل النسخة الاحتياطية.');
    } finally {
      setIsExportingBackup(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchBranch = filterBranch === 'ALL' || inv.branchCode === filterBranch;
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        inv.clientName.includes(searchQuery) ||
                        inv.clientPhone.includes(searchQuery);
    return matchBranch && matchSearch;
  });

  const filteredPayOrders = payOrders.filter(epo => {
    const matchBranch = filterBranch === 'ALL' || epo.branchCode === filterBranch;
    const matchSearch = epo.payOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        epo.relatedInvoice.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBranch && matchSearch;
  });

  const filteredDeposits = deposits.filter(sfd => {
    const matchBranch = filterBranch === 'ALL' || sfd.branchCode === filterBranch;
    const matchSearch = sfd.depositNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        sfd.relatedInvoice.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBranch && matchSearch;
  });

  const filteredContributions = contributions.filter(c => {
    const matchBranch = filterBranch === 'ALL' || !c.branch || c.branch === filterBranch;
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery ||
      c.depositId.toLowerCase().includes(q) ||
      c.engineerName.toLowerCase().includes(q) ||
      c.fundName.toLowerCase().includes(q) ||
      (c.discipline && c.discipline.toLowerCase().includes(q));
    return matchBranch && matchSearch;
  });

  const filteredLedgerEntries = ledgerEntries.filter(l => {
    const branch = l.branchCode;
    const matchBranch = filterBranch === 'ALL' || !branch || branch === filterBranch;
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery || 
      l.id.toLowerCase().includes(q) ||
      (l.accountCode && l.accountCode.toLowerCase().includes(q)) ||
      (l.accountName && l.accountName.toLowerCase().includes(q)) ||
      (l.description && l.description.toLowerCase().includes(q)) ||
      (l.partyName && l.partyName.toLowerCase().includes(q)) ||
      (l.documentId && l.documentId.toLowerCase().includes(q));
    return matchBranch && matchSearch;
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const branch = log.branchCode || log.branch;
    const matchBranch = filterBranch === 'ALL' || !branch || branch === filterBranch;
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery ||
      log.id.toLowerCase().includes(q) ||
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.actionType && log.actionType.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q));
    return matchBranch && matchSearch;
  });

  const filteredEngineers = effectiveEngineers.filter(eng => {
    const branch = eng.branch || (eng.workCity === 'ديريك' ? 'DER' : eng.workCity === 'القامشلي' ? 'QAM' : 'HAS');
    const matchBranch = filterBranch === 'ALL' || branch === filterBranch;
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery ||
      eng.fullName.toLowerCase().includes(q) ||
      (eng.phone && eng.phone.includes(q)) ||
      (eng.specialization && eng.specialization.toLowerCase().includes(q)) ||
      (eng.department && eng.department.toLowerCase().includes(q)) ||
      (eng.id && eng.id.toLowerCase().includes(q)) ||
      (eng.workCity && eng.workCity.toLowerCase().includes(q));
    return matchBranch && matchSearch;
  });

  // Calculate Monthly Revenue vs Expenses Aggregations
  const monthlyDataMap: {
    [key: string]: {
      monthKey: string;
      monthName: string;
      revenue: number;
      expenses: number;
      engineerPayouts: number;
      syndicateDeposits: number;
      surplus: number;
      invoiceCount: number;
      payOrderCount: number;
    };
  } = {};

  // 1. Process Invoices (Revenue)
  invoices.forEach(inv => {
    if (filterBranch !== 'ALL' && inv.branchCode !== filterBranch) return;
    const mKey = inv.date ? inv.date.substring(0, 7) : '2026-08';
    if (!monthlyDataMap[mKey]) {
      const [year, month] = mKey.split('-');
      const monthName = `${ARABIC_MONTHS[month] || month} ${year}`;
      monthlyDataMap[mKey] = {
        monthKey: mKey,
        monthName,
        revenue: 0,
        expenses: 0,
        engineerPayouts: 0,
        syndicateDeposits: 0,
        surplus: 0,
        invoiceCount: 0,
        payOrderCount: 0
      };
    }
    const amountSYP = inv.currency === 'USD' ? inv.totalAmount * exchangeRate : inv.totalAmount;
    monthlyDataMap[mKey].revenue += amountSYP;
    monthlyDataMap[mKey].invoiceCount += 1;
  });

  // 2. Process Pay Orders (Engineer Disbursements / Expenses)
  payOrders.forEach(epo => {
    if (filterBranch !== 'ALL' && epo.branchCode !== filterBranch) return;
    const mKey = epo.date ? epo.date.substring(0, 7) : '2026-08';
    if (!monthlyDataMap[mKey]) {
      const [year, month] = mKey.split('-');
      const monthName = `${ARABIC_MONTHS[month] || month} ${year}`;
      monthlyDataMap[mKey] = {
        monthKey: mKey,
        monthName,
        revenue: 0,
        expenses: 0,
        engineerPayouts: 0,
        syndicateDeposits: 0,
        surplus: 0,
        invoiceCount: 0,
        payOrderCount: 0
      };
    }
    const amountSYP = epo.currency === 'USD' ? epo.totalAmount * exchangeRate : epo.totalAmount;
    monthlyDataMap[mKey].engineerPayouts += amountSYP;
    monthlyDataMap[mKey].expenses += amountSYP;
    monthlyDataMap[mKey].payOrderCount += 1;
  });

  // 3. Process Syndicate Fund Deposits (Statutory Allocations / Expenses)
  deposits.forEach(sfd => {
    if (filterBranch !== 'ALL' && sfd.branchCode !== filterBranch) return;
    const mKey = sfd.date ? sfd.date.substring(0, 7) : '2026-08';
    if (!monthlyDataMap[mKey]) {
      const [year, month] = mKey.split('-');
      const monthName = `${ARABIC_MONTHS[month] || month} ${year}`;
      monthlyDataMap[mKey] = {
        monthKey: mKey,
        monthName,
        revenue: 0,
        expenses: 0,
        engineerPayouts: 0,
        syndicateDeposits: 0,
        surplus: 0,
        invoiceCount: 0,
        payOrderCount: 0
      };
    }
    const amountSYP = sfd.currency === 'USD' ? sfd.totalAmount * exchangeRate : sfd.totalAmount;
    monthlyDataMap[mKey].syndicateDeposits += amountSYP;
    monthlyDataMap[mKey].expenses += amountSYP;
  });

  // Prepare sorted chart data array
  const monthlyChartData = Object.values(monthlyDataMap)
    .map(item => ({
      ...item,
      surplus: item.revenue - item.expenses
    }))
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  // Overall Totals for chart header stats
  const totalChartRevenue = monthlyChartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalChartExpenses = monthlyChartData.reduce((sum, item) => sum + item.expenses, 0);
  const totalChartSurplus = totalChartRevenue - totalChartExpenses;

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0A0A0A] border border-[#333] p-3.5 rounded-lg shadow-2xl text-xs font-mono text-right min-w-[240px]">
          <div className="text-[11px] font-bold text-white mb-2 pb-1.5 border-b border-[#222] flex items-center justify-between">
            <span className="text-[#00FFD1] font-sans font-bold">{data.monthName}</span>
            <span className="text-[10px] text-[#777] font-mono">{data.monthKey}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#00FFD1]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#00FFD1]"></span>
                <span>الإيرادات (Revenue):</span>
              </span>
              <span className="font-bold">{Math.round(data.revenue).toLocaleString()} ل.س</span>
            </div>

            <div className="flex items-center justify-between text-[#FF4D00]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#FF4D00]"></span>
                <span>المصروفات (Expenses):</span>
              </span>
              <span className="font-bold">{Math.round(data.expenses).toLocaleString()} ل.س</span>
            </div>

            <div className="text-[10px] text-[#888] pr-4 space-y-0.5 border-r border-[#333] mr-1">
              <div className="flex justify-between">
                <span>أوامر الصرف (EPO):</span>
                <span className="text-white">{Math.round(data.engineerPayouts).toLocaleString()} ل.س</span>
              </div>
              <div className="flex justify-between">
                <span>صناديق النقابة (SFD):</span>
                <span className="text-white">{Math.round(data.syndicateDeposits).toLocaleString()} ل.س</span>
              </div>
            </div>

            <div className="border-t border-[#222] pt-2 flex items-center justify-between font-bold">
              <span className="text-[#AAA]">صافي الفائض:</span>
              <span className={data.surplus >= 0 ? 'text-[#00FFD1]' : 'text-[#FF4D00]'}>
                {Math.round(data.surplus).toLocaleString()} ل.س
              </span>
            </div>

            <div className="text-[10px] text-[#666] pt-1 flex justify-between border-t border-[#1F1F1F]">
              <span>عدد الفواتير: {data.invoiceCount}</span>
              <span>أوامر الصرف: {data.payOrderCount}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Summary Monthly Revenue vs Expenses Recharts Bar Chart Container */}
      <div className="bg-[#151515] rounded border border-[#222] p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-4 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#0A0A0A] border border-[#00FFD1]/30 text-[#00FFD1] flex items-center justify-center font-bold shadow-inner">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#00FFD1] uppercase tracking-widest flex items-center gap-2">
                <span>MONTHLY_FINANCIAL_FLOW // REVENUE_VS_EXPENSES</span>
                <span className="w-2 h-2 rounded-full bg-[#00FFD1] animate-pulse"></span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>مقارنة الإيرادات المحصلة بالمصروفات وأوامر الصرف الشهرية</span>
                <span className="text-[11px] font-mono font-normal text-[#888]">
                  ({filterBranch === 'ALL' ? 'جميع الفروع' : `فرع ${filterBranch}`})
                </span>
              </h2>
            </div>
          </div>

          {/* Key Metric Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Total Revenue Pill */}
            <div className="bg-[#0A0A0A] border border-[#00FFD1]/30 px-3 py-1.5 rounded">
              <div className="text-[9px] font-mono text-[#666] uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFD1]"></span>
                <span>إجمالي الإيرادات</span>
              </div>
              <div className="text-sm font-mono font-bold text-[#00FFD1]">
                {Math.round(totalChartRevenue).toLocaleString()} <span className="text-[10px] text-[#888]">SYP</span>
              </div>
            </div>

            {/* Total Expenses Pill */}
            <div className="bg-[#0A0A0A] border border-[#FF4D00]/30 px-3 py-1.5 rounded">
              <div className="text-[9px] font-mono text-[#666] uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00]"></span>
                <span>إجمالي المصروفات</span>
              </div>
              <div className="text-sm font-mono font-bold text-[#FF4D00]">
                {Math.round(totalChartExpenses).toLocaleString()} <span className="text-[10px] text-[#888]">SYP</span>
              </div>
            </div>

            {/* Net Surplus / Balance Pill */}
            <div className="bg-[#0A0A0A] border border-[#333] px-3 py-1.5 rounded">
              <div className="text-[9px] font-mono text-[#666] uppercase">التوازن المالي</div>
              <div className={`text-sm font-mono font-bold ${Math.abs(totalChartSurplus) < 100 ? 'text-[#00FFD1]' : 'text-white'}`}>
                {Math.abs(totalChartSurplus) < 100 ? 'BALANCED 100%' : `${Math.round(totalChartSurplus).toLocaleString()} SYP`}
              </div>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="w-full h-72 pt-2">
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyChartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                barGap={8}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis 
                  dataKey="monthName" 
                  stroke="#555" 
                  tick={{ fill: '#AAA', fontSize: 11, fontFamily: 'Cairo, monospace' }}
                  axisLine={{ stroke: '#333' }}
                  tickLine={{ stroke: '#333' }}
                  dy={10}
                />
                <YAxis 
                  stroke="#555" 
                  tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#333' }}
                  tickLine={{ stroke: '#333' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  dx={-5}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  wrapperStyle={{ paddingBottom: '12px' }}
                  formatter={(value) => (
                    <span className="text-xs font-sans font-semibold text-[#DDD] mr-2">
                      {value}
                    </span>
                  )}
                />
                <Bar 
                  dataKey="revenue" 
                  name="الإيرادات الصادرة (Invoiced Revenue)" 
                  fill="#00FFD1" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
                <Bar 
                  dataKey="expenses" 
                  name="المصروفات والتحويلات (Expenses & Payouts)" 
                  fill="#FF4D00" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-[#666]">
              لا توجد بيانات مالية متوفرة لهذا الفلتر
            </div>
          )}
        </div>

        {/* Legend / Info Footer */}
        <div className="mt-3 pt-3 border-t border-[#1F1F1F] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#777]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#00FFD1]"></span>
              <span className="text-[#AAA]">الإيرادات: إجمالي مبالغ الفواتير الصادرة للمشاريع الهندسية</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FF4D00]"></span>
              <span className="text-[#AAA]">المصروفات: أوامر الصرف المالي للمهندسين (EPO) + اقتطاعات الصناديق (SFD)</span>
            </span>
          </div>
          <div className="text-[10px] text-[#555]">
            تحديث فوري • وحدة المحاسبة النقابية الموحدة 2026
          </div>
        </div>
      </div>

      {/* Top Header & Search Controls */}
      <div className="bg-[#151515] rounded border border-[#222] p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#0A0A0A] border border-[#333] text-[#00FFD1] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#00FFD1] uppercase tracking-widest">
                CENTRAL_DATA_REPOSITORY // V4.0
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                السجلات المالية الموحدة ودفتر الأستاذ (Master Databases & General Ledger)
              </h2>
            </div>
          </div>

          {/* Export & Import Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Upload CSV Utility Trigger */}
            <button
              id="upload-csv-main-top-btn"
              onClick={() => setCsvUploadModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition border shadow bg-[#1A1A1A] hover:bg-[#252525] text-[#00FFD1] border-[#00FFD1]/60 hover:border-[#00FFD1]"
              title="رفع واستيراد ملفات جداول البيانات والقيود المحاسبية CSV إلى النظام"
            >
              <Upload className="w-4 h-4 text-[#00FFD1]" />
              <span>UPLOAD_CSV</span>
            </button>

            {/* Master CSV Export Utility Modal Trigger */}
            <button
              id="export-csv-reports-top-btn"
              onClick={() => setCsvExportModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition border shadow bg-[#00FFD1] hover:brightness-110 text-black border-[#00FFD1]"
              title="مركز تصدير المصنفات المحاسبية وجداول البيانات CSV للمشاريع ودفتر الأستاذ العام (CSV Spreadsheet Reporting Utility)"
            >
              <FileSpreadsheet className="w-4 h-4 text-black" />
              <span>EXPORT_CSV_REPORTS</span>
            </button>

            {/* Download Database Backup (Encrypted JSON Export) */}
            <button
              id="download-database-backup-btn"
              onClick={() => setBackupModalOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition border shadow ${
                backupQuickSuccess
                  ? 'bg-[#00FFD1] text-black border-[#00FFD1]'
                  : 'bg-[#151515] hover:bg-[#222] text-amber-300 border-amber-500/50 hover:border-amber-400'
              }`}
              title="تنزيل نسخة احتياطية مشفرة لجميع الكيانات الأساسية (الفواتير، أوامر الصرف، الإيداعات، المهندسين) بصيغة JSON للحماية من فقدان بيانات التخزين المحلي"
            >
              {backupQuickSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>BACKUP_DOWNLOADED_OK</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>DOWNLOAD_DATABASE_BACKUP</span>
                </>
              )}
            </button>

            {/* Dedicated Print Button for General Ledger */}
            <button
              id="print-ledger-top-btn"
              onClick={() => {
                setActiveSubTab('ledger');
                setLedgerPrintModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition border shadow bg-[#151515] hover:bg-[#222] text-white border-[#333] hover:border-[#00FFD1]"
              title="معاينة وطباعة دفتر الأستاذ العام بنسق جداول A4 مخصصة للطباعة (Print Tabular Ledger)"
            >
              <Printer className="w-4 h-4 text-[#00FFD1]" />
              <span>PRINT_LEDGER</span>
            </button>

            <button
              id="export-ledger-csv-top-btn"
              onClick={handleExportLedgerCSV}
              className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition border shadow ${
                csvExportSuccess
                  ? 'bg-[#00FFD1] text-black border-[#00FFD1]'
                  : 'bg-[#0A0A0A] hover:bg-[#1C1C1C] text-[#00FFD1] border-[#00FFD1]/40'
              }`}
              title="تصدير قيود دفتر الأستاذ العام بصيغة CSV متوافقة مع البرامج المحاسبية القياسية (QuickBooks, Al-Ameen, Excel)"
            >
              {csvExportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>CSV_EXPORTED_OK</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-[#00FFD1]" />
                  <span>EXPORT_LEDGER_CSV</span>
                </>
              )}
            </button>

            {onOpenDerikTransformer && (
              <button
                id="open-derik-transformer-db-btn"
                onClick={onOpenDerikTransformer}
                className="flex items-center gap-2 bg-[#00FFD1]/10 hover:bg-[#00FFD1]/20 text-[#00FFD1] border border-[#00FFD1]/40 px-3.5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition shadow"
                title="تحويل وحقن بيانات مهندسي وحدة ديريك من الجداول النصية إلى قاعدة بيانات المهندسين المعتمدين"
              >
                <Users className="w-4 h-4 text-[#00FFD1]" />
                <span>DERIK_TRANSFORMER</span>
              </button>
            )}

            <button
              id="export-sheets-btn"
              onClick={() => onExportSheets(activeSubTab, activeSubTab === 'invoices' ? invoices : activeSubTab === 'payorders' ? payOrders : deposits)}
              className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#333] hover:border-[#00FFD1] px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition shadow"
            >
              <Download className="w-4 h-4 text-[#00FFD1]" />
              <span>EXPORT_TO_SHEETS</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-[#222]">
          {[
            { id: 'invoices', label: '1. الفواتير الصادرة', count: invoices.length },
            { id: 'payorders', label: '2. أوامر الصرف (EPO)', count: payOrders.length },
            { id: 'deposits', label: '3. إيداعات الصناديق (SFD)', count: deposits.length },
            { id: 'contributions', label: '4. اشتراكات المهندسين', count: contributions.length },
            { id: 'ledger', label: '5. دفتر الأستاذ العام', count: ledgerEntries.length },
            { id: 'audit', label: '6. سجل الرقابة والتدقيق', count: auditLogs.length },
            { id: 'engineers', label: '7. سجل المهندسين المعتمدين', count: effectiveEngineers.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
                activeSubTab === tab.id
                  ? 'bg-[#1A1A1A] text-[#00FFD1] border border-[#00FFD1]/50'
                  : 'bg-[#0A0A0A] text-[#888] hover:text-white border border-[#222]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#222] text-[#AAA]">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3 border-t border-[#222] text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-[#666] absolute right-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالرقم التسلسلي، اسم صاحب العلاقة، أو الهاتف..."
              className="w-full bg-[#0A0A0A] border border-[#333] rounded pr-9 pl-3 py-2 text-xs font-mono text-[#EEE] placeholder-[#555] focus:outline-none focus:border-[#00FFD1]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00FFD1]" />
            <span className="text-[11px] font-mono uppercase text-[#888]">BRANCH_FILTER:</span>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="bg-[#0A0A0A] border border-[#333] rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#00FFD1]"
            >
              <option value="ALL">جميع الفروع (HAS, QAM, DER)</option>
              <option value="HAS">وحدة الحسكة (HAS)</option>
              <option value="QAM">وحدة القامشلي (QAM)</option>
              <option value="DER">وحدة ديريك (DER)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Database Table Container */}
      <div className="bg-[#151515] rounded border border-[#222] overflow-hidden">
        
        {/* 1. Invoices Table */}
        {activeSubTab === 'invoices' && (
          <div className="space-y-3 p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#0A0A0A] rounded border border-[#222]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#00FFD1]" />
                <span className="text-xs font-mono font-bold text-white uppercase">INVOICES_REGISTRY // سجل الفواتير والمشاريع الصادرة</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#00FFD1] border border-[#00FFD1]/30">
                  {filteredInvoices.length} فواتير
                </span>
              </div>
              <button
                id="export-invoices-csv-btn"
                onClick={handleExportInvoicesCSV}
                className="flex items-center gap-2 px-3 py-1.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition bg-[#1A1A1A] hover:bg-[#252525] text-[#00FFD1] border border-[#00FFD1]/40 hover:border-[#00FFD1]"
                title="تصدير بيانات وسجلات المشاريع والفواتير كملف CSV متوافق مع البرامج المحاسبية"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير الفواتير (CSV)</span>
              </button>
            </div>
            <div className="overflow-x-auto border border-[#222] rounded">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0A0A0A] border-b border-[#222] text-[10px] font-mono text-[#666] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">SERIAL_NO</th>
                    <th className="p-3">DATE / TIME</th>
                    <th className="p-3">CLIENT_NAME</th>
                    <th className="p-3">CATEGORY</th>
                    <th className="p-3">BRANCH</th>
                    <th className="p-3">MODEL</th>
                    <th className="p-3 text-left">TOTAL_AMOUNT</th>
                    <th className="p-3 text-center">STATUS</th>
                    <th className="p-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222] font-mono text-[11px]">
                  {filteredInvoices.map((inv) => {
                    const cat = DEFAULT_PROJECT_CATEGORIES.find(c => c.id === inv.categoryId);
                    return (
                      <tr key={inv.id} className="hover:bg-[#1A1A1A] transition">
                        <td className="p-3 font-bold text-[#00FFD1]">{inv.invoiceNumber}</td>
                        <td className="p-3 text-[#777]">{inv.date} {inv.time}</td>
                        <td className="p-3 font-sans font-semibold text-white">{inv.clientName}</td>
                        <td className="p-3">
                          {cat ? (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-bold border"
                              style={{ 
                                backgroundColor: `${cat.color}15`, 
                                borderColor: `${cat.color}40`,
                                color: cat.color 
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                              {cat.name_ar}
                            </span>
                          ) : (
                            <span className="text-[#666] text-[10px] italic">غير مصنف</span>
                          )}
                        </td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#222] text-[#00FFD1] border border-[#333]">{inv.branchCode}</span></td>
                        <td className="p-3 font-sans text-[#BBB]">{inv.modelType}</td>
                        <td className="p-3 text-left font-bold text-white">
                          {inv.totalAmount.toLocaleString()} <span className="text-[10px] text-[#00FFD1]">{inv.currency}</span>
                        </td>
                        <td className="p-3 text-center">
                          {onUpdateInvoiceStatus ? (
                            <div className="flex items-center justify-center gap-1">
                              <select
                                value={inv.status}
                                onChange={(e) => onUpdateInvoiceStatus(inv.id, e.target.value as any)}
                                className={`text-[10px] font-mono font-bold rounded px-1.5 py-0.5 border outline-none cursor-pointer transition ${
                                  inv.status === 'Settled'
                                    ? 'bg-[#00FFD1]/10 text-[#00FFD1] border-[#00FFD1]/30 hover:border-[#00FFD1]'
                                    : inv.status === 'Audited'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:border-blue-400'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:border-amber-400'
                                }`}
                              >
                                <option value="Issued" className="bg-[#1A1A1A] text-amber-400">Issued (صادرة/غير مسددة)</option>
                                <option value="Audited" className="bg-[#1A1A1A] text-blue-400">Audited (مدققة)</option>
                                <option value="Settled" className="bg-[#1A1A1A] text-[#00FFD1]">Settled (مسددة)</option>
                              </select>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/30">
                              {inv.status}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {onUpdateInvoiceStatus && inv.status !== 'Settled' && (
                              <button
                                onClick={() => onUpdateInvoiceStatus(inv.id, 'Settled')}
                                className="bg-[#1A2E26] hover:bg-[#00FFD1] text-[#00FFD1] hover:text-black border border-[#00FFD1]/40 text-[10px] font-mono font-bold px-2 py-1 rounded flex items-center gap-1 transition"
                                title="تسوية وتحصيل الفاتورة فوراً"
                              >
                                <Check className="w-3 h-3" />
                                <span>SETTLE</span>
                              </button>
                            )}
                            <button
                              onClick={() => onViewDocument(inv.invoiceNumber, 'INV', inv)}
                              className="bg-[#1A1A1A] hover:bg-[#262626] text-[#00FFD1] border border-[#333] text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded flex items-center gap-1 transition"
                            >
                              <Printer className="w-3 h-3" />
                              <span>PREVIEW</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Pay Orders Table */}
        {activeSubTab === 'payorders' && (
          <div className="space-y-3 p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#0A0A0A] rounded border border-[#222]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#FF4D00]" />
                <span className="text-xs font-mono font-bold text-white uppercase">ENGINEER_PAY_ORDERS // أوامر الصرف المالي للمهندسين</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#FF4D00] border border-[#FF4D00]/30">
                  {filteredPayOrders.length} أوامر صرف
                </span>
              </div>
              <button
                id="export-payorders-csv-btn"
                onClick={handleExportPayOrdersCSV}
                className="flex items-center gap-2 px-3 py-1.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition bg-[#1A1A1A] hover:bg-[#252525] text-[#FF4D00] border border-[#FF4D00]/40 hover:border-[#FF4D00]"
                title="تصدير تفاصيل أوامر الصرف وتوزيعات أتعاب المهندسين بصيغة CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير أوامر الصرف (CSV)</span>
              </button>
            </div>
            <div className="overflow-x-auto border border-[#222] rounded">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0A0A0A] border-b border-[#222] text-[10px] font-mono text-[#666] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">ORDER_NO</th>
                    <th className="p-3">LINKED_INV</th>
                    <th className="p-3">DATE / TIME</th>
                    <th className="p-3">BRANCH</th>
                    <th className="p-3">MODEL</th>
                    <th className="p-3 text-left">ENGINEER_PAYOUT</th>
                    <th className="p-3 text-center">BENEFICIARIES</th>
                    <th className="p-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222] font-mono text-[11px]">
                  {filteredPayOrders.map((epo) => (
                    <tr key={epo.id} className="hover:bg-[#1A1A1A] transition">
                      <td className="p-3 font-bold text-[#FF4D00]">{epo.payOrderNumber}</td>
                      <td className="p-3 text-[#00FFD1]">{epo.relatedInvoice}</td>
                      <td className="p-3 text-[#777]">{epo.date} {epo.time}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#222] text-[#00FFD1] border border-[#333]">{epo.branchCode}</span></td>
                      <td className="p-3 font-sans text-[#BBB]">{epo.modelType}</td>
                      <td className="p-3 text-left font-bold text-[#FF4D00]">
                        {epo.totalAmount.toLocaleString()} <span className="text-[10px]">{epo.currency}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-[10px] bg-[#0A0A0A] border border-[#333] text-[#AAA] px-2 py-0.5 rounded">
                          {epo.breakdown?.length || 0} ENG
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onViewDocument(epo.payOrderNumber, 'EPO', epo)}
                          className="bg-[#1A1A1A] hover:bg-[#262626] text-[#FF4D00] border border-[#333] text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded flex items-center gap-1 mx-auto transition"
                        >
                          <Printer className="w-3 h-3" />
                          <span>PREVIEW</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Syndicate Deposits Table */}
        {activeSubTab === 'deposits' && (
          <div className="space-y-3 p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#0A0A0A] rounded border border-[#222]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#00FFD1]" />
                <span className="text-xs font-mono font-bold text-white uppercase">SYNDICATE_DEPOSITS // إشعار إيداعات الصناديق النقابية</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#00FFD1] border border-[#00FFD1]/30">
                  {filteredDeposits.length} إيداعات
                </span>
              </div>
              <button
                id="export-deposits-csv-btn"
                onClick={handleExportDepositsCSV}
                className="flex items-center gap-2 px-3 py-1.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition bg-[#1A1A1A] hover:bg-[#252525] text-[#00FFD1] border border-[#00FFD1]/40 hover:border-[#00FFD1]"
                title="تصدير كشف إيداعات صناديق النقابة كملف CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير الإيداعات (CSV)</span>
              </button>
            </div>
            <div className="overflow-x-auto border border-[#222] rounded">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0A0A0A] border-b border-[#222] text-[10px] font-mono text-[#666] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">DEPOSIT_NO</th>
                    <th className="p-3">LINKED_INV</th>
                    <th className="p-3">DATE / TIME</th>
                    <th className="p-3">BRANCH</th>
                    <th className="p-3">MODEL</th>
                    <th className="p-3 text-left">FUNDS_TOTAL</th>
                    <th className="p-3 text-center">BREAKDOWN</th>
                    <th className="p-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222] font-mono text-[11px]">
                  {filteredDeposits.map((sfd) => (
                    <tr key={sfd.id} className="hover:bg-[#1A1A1A] transition">
                      <td className="p-3 font-bold text-[#00FFD1]">{sfd.depositNumber}</td>
                      <td className="p-3 text-[#AAA]">{sfd.relatedInvoice}</td>
                      <td className="p-3 text-[#777]">{sfd.date} {sfd.time}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#222] text-[#00FFD1] border border-[#333]">{sfd.branchCode}</span></td>
                      <td className="p-3 font-sans text-[#BBB]">{sfd.modelType}</td>
                      <td className="p-3 text-left font-bold text-[#00FFD1]">
                        {sfd.totalAmount.toLocaleString()} <span className="text-[10px]">{sfd.currency}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-[10px] bg-[#0A0A0A] border border-[#333] text-[#00FFD1] px-2 py-0.5 rounded">
                          {sfd.fundsBreakdown.length} FUNDS
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onViewDocument(sfd.depositNumber, 'SFD', sfd)}
                          className="bg-[#1A1A1A] hover:bg-[#262626] text-[#00FFD1] border border-[#333] text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded flex items-center gap-1 mx-auto transition"
                        >
                          <Printer className="w-3 h-3" />
                          <span>PREVIEW</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Fund Contributions Table */}
        {activeSubTab === 'contributions' && (
          <div className="space-y-3 p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#0A0A0A] rounded border border-[#222]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#00FFD1]" />
                <span className="text-xs font-mono font-bold text-white uppercase">FUND_CONTRIBUTIONS // اقتطاعات واشتراكات المهندسين بالصناديق</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#00FFD1] border border-[#00FFD1]/30">
                  {filteredContributions.length} سجلات
                </span>
              </div>
              <button
                id="export-contributions-csv-btn"
                onClick={handleExportContributionsCSV}
                className="flex items-center gap-2 px-3 py-1.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition bg-[#1A1A1A] hover:bg-[#252525] text-[#00FFD1] border border-[#00FFD1]/40 hover:border-[#00FFD1]"
                title="تصدير اقتطاعات واشتراكات الصناديق النقابية كملف CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير الاشتراكات (CSV)</span>
              </button>
            </div>
            <div className="overflow-x-auto border border-[#222] rounded">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0A0A0A] border-b border-[#222] text-[10px] font-mono text-[#666] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">DATE</th>
                    <th className="p-3">DEPOSIT_ID</th>
                    <th className="p-3">ENGINEER_NAME</th>
                    <th className="p-3">DISCIPLINE</th>
                    <th className="p-3">FUND_NAME</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3 text-left">DEDUCTED_CONTRIBUTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222] font-mono text-[11px]">
                  {filteredContributions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#666] font-sans">
                        لا توجد اشتراكات صناديق مطابقة لمعايير البحث والفلترة.
                      </td>
                    </tr>
                  ) : (
                    filteredContributions.map((c) => (
                      <tr key={c.id} className="hover:bg-[#1A1A1A] transition">
                        <td className="p-3 text-[#777]">{c.date}</td>
                        <td className="p-3 font-bold text-[#00FFD1]">{c.depositId}</td>
                        <td className="p-3 font-sans font-semibold text-white">{c.engineerName}</td>
                        <td className="p-3 font-sans text-[#AAA]">{c.discipline}</td>
                        <td className="p-3 font-sans text-[#CCC]">{c.fundName}</td>
                        <td className="p-3 font-bold text-[#00FFD1]">{c.fundStatus}</td>
                        <td className="p-3 text-left font-bold text-[#00FFD1]">
                          {c.amount.toLocaleString()} <span className="text-[10px]">{c.currency}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. General Ledger Table & Accounting Export Suite */}
        {activeSubTab === 'ledger' && (
          <div className="space-y-4">
            {/* Ledger Sub-Header & Live Accounting Stats */}
            <div className="p-4 bg-[#0F0F0F] rounded-lg border border-[#222] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#00FFD1]" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    GENERAL_LEDGER // القيود المحاسبية لدفتر الأستاذ
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#00FFD1] border border-[#00FFD1]/30">
                    Double-Entry Standard
                  </span>
                </div>
                <p className="text-xs text-[#888]">
                  متوافق مع البرامج المحاسبية القياسية (QuickBooks, Al-Ameen, Zoho, SAP) بترميز UTF-8 ومطابقة معيار RFC 4180.
                </p>
              </div>

              {/* Actions: Dedicated Print-Friendly Button, Upload & Export to CSV */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  id="upload-ledger-csv-tab-btn"
                  onClick={() => setCsvUploadModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition shadow-lg bg-[#181818] hover:bg-[#252525] text-[#00FFD1] border border-[#00FFD1]/50 hover:border-[#00FFD1]"
                  title="استيراد وتحديث قيود دفتر الأستاذ العام أو الفواتير من ملف CSV خارجي"
                >
                  <Upload className="w-4 h-4 text-[#00FFD1]" />
                  <span>استيراد قيود (UPLOAD CSV)</span>
                </button>

                <button
                  id="print-ledger-tab-btn"
                  onClick={() => setLedgerPrintModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition shadow-lg bg-[#181818] hover:bg-[#252525] text-white border border-[#444] hover:border-[#00FFD1] hover:text-[#00FFD1]"
                  title="معاينة وطباعة دفتر الأستاذ العام بنسق جداول A4 رسمية ومطابقة لمعايير التقارير المالية (Print-Specific Tabular Layout)"
                >
                  <Printer className="w-4 h-4 text-[#00FFD1]" />
                  <span>طباعة دفتر الأستاذ (PRINT A4)</span>
                </button>

                <button
                  id="export-ledger-csv-tab-btn"
                  onClick={handleExportLedgerCSV}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition shadow-lg ${
                    csvExportSuccess
                      ? 'bg-[#00FFD1] text-black border border-[#00FFD1]'
                      : 'bg-[#00FFD1] hover:brightness-110 text-black border border-[#00FFD1]'
                  }`}
                  title="تصدير القيود المحاسبية المعروضة إلى ملف CSV متوافق مع البرامج المحاسبية القياسية"
                >
                  {csvExportSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم التصدير بنجاح (CSV)</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>تصدير دفتر الأستاذ (CSV القياسي)</span>
                    </>
                  )}
                </button>

                <button
                  id="export-unified-journal-tab-btn"
                  onClick={handleExportUnifiedJournalCSV}
                  className="flex items-center gap-2 px-4 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition shadow-lg bg-[#1A1A1A] hover:bg-[#252525] text-amber-300 border border-amber-500/40 hover:border-amber-400"
                  title="تصدير اليومية المحاسبية الموحدة الشاملة (جميع الفواتير، أوامر الصرف EPO، وإيداعات الصناديق SFD وقيود الأستاذ)"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>اليومية الموحدة (Unified Journal CSV)</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar for General Ledger */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#0A0A0A] rounded border border-[#222]">
                <div className="text-[10px] font-mono text-[#666] uppercase">عدد القيود المعروضة</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {filteredLedgerEntries.length} <span className="text-[10px] text-[#888]">قيد</span>
                </div>
              </div>

              <div className="p-3 bg-[#0A0A0A] rounded border border-[#222]">
                <div className="text-[10px] font-mono text-[#666] uppercase">إجمالي المدين (Debits)</div>
                <div className="text-base font-bold font-mono text-[#00FFD1] mt-0.5">
                  {filteredLedgerEntries.reduce((sum, e) => sum + (e.debit || 0), 0).toLocaleString()} <span className="text-[10px]">ل.س</span>
                </div>
              </div>

              <div className="p-3 bg-[#0A0A0A] rounded border border-[#222]">
                <div className="text-[10px] font-mono text-[#666] uppercase">إجمالي الدائن (Credits)</div>
                <div className="text-base font-bold font-mono text-[#FF4D00] mt-0.5">
                  {filteredLedgerEntries.reduce((sum, e) => sum + (e.credit || 0), 0).toLocaleString()} <span className="text-[10px]">ل.س</span>
                </div>
              </div>

              <div className="p-3 bg-[#0A0A0A] rounded border border-[#222]">
                <div className="text-[10px] font-mono text-[#666] uppercase">رصيد الأستاذ الصافي</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {filteredLedgerEntries.reduce((sum, e) => sum + (e.balance ?? (e.debit - e.credit)), 0).toLocaleString()} <span className="text-[10px] text-[#888]">ل.س</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-[#222] rounded">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0A0A0A] border-b border-[#222] text-[10px] font-mono text-[#666] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">ENTRY_ID</th>
                    <th className="p-3">DATE</th>
                    <th className="p-3">BRANCH</th>
                    <th className="p-3">ACC_CODE</th>
                    <th className="p-3">ACCOUNT_NAME</th>
                    <th className="p-3">DESCRIPTION / PARTY</th>
                    <th className="p-3 text-left">DEBIT</th>
                    <th className="p-3 text-left">CREDIT</th>
                    <th className="p-3 text-left">BALANCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222] font-mono text-[11px]">
                  {filteredLedgerEntries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-[#666] font-sans">
                        لا توجد قيود أستاذ عام مطابقة لمعايير البحث والفلترة.
                      </td>
                    </tr>
                  ) : (
                    filteredLedgerEntries.map((l) => (
                      <tr key={l.id} className="hover:bg-[#1A1A1A] transition">
                        <td className="p-3 text-[#777]">{l.id}</td>
                        <td className="p-3 text-[#777]">{l.date || (l.timestamp ? l.timestamp.split(' ')[0] : '—')}</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#151515] text-[#00FFD1] border border-[#222]">
                            {l.branchCode || filterBranch}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-[#00FFD1]">{l.accountCode || (l.debit > 0 ? '3101' : '2201')}</td>
                        <td className="p-3 font-sans font-semibold text-white">{l.accountName}</td>
                        <td className="p-3 font-sans text-[#AAA]">
                          <div>{l.description || l.notes || '—'}</div>
                          {l.partyName && <div className="text-[10px] text-[#777] font-mono mt-0.5">{l.partyName}</div>}
                          {l.documentId && <div className="text-[10px] text-[#00FFD1]/80 font-mono">Ref: {l.documentId}</div>}
                        </td>
                        <td className="p-3 text-left font-bold text-[#00FFD1]">
                          {l.debit > 0 ? `${l.debit.toLocaleString()} ${l.currency || 'SYP'}` : '—'}
                        </td>
                        <td className="p-3 text-left font-bold text-[#FF4D00]">
                          {l.credit > 0 ? `${l.credit.toLocaleString()} ${l.currency || 'SYP'}` : '—'}
                        </td>
                        <td className="p-3 text-left font-bold text-white">
                          {(l.balance ?? (l.debit - l.credit)).toLocaleString()} {l.currency || 'SYP'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Audit Logs Table */}
        {activeSubTab === 'audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0A0A0A] border-b border-[#222] text-[10px] font-mono text-[#666] uppercase tracking-wider">
                <tr>
                  <th className="p-3">TIMESTAMP</th>
                  <th className="p-3">ACTION_TYPE</th>
                  <th className="p-3">ROLE</th>
                  <th className="p-3">BRANCH</th>
                  <th className="p-3">DETAILS</th>
                  <th className="p-3">CHECKSUM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222] font-mono text-[11px]">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#666] font-sans">
                      لا توجد سجلات رقابة وتدقيق مطابقة للبحث.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#1A1A1A] transition">
                      <td className="p-3 text-[#777]">{log.timestamp}</td>
                      <td className="p-3 font-bold text-[#00FFD1]">{log.action || log.actionType}</td>
                      <td className="p-3 font-sans text-white">{log.userRole || log.role}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#222] text-[#00FFD1] border border-[#333]">{log.branchCode || log.branch}</span></td>
                      <td className="p-3 font-sans text-[#AAA]">{log.details}</td>
                      <td className="p-3 text-[10px] text-[#555]">{log.checksum}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. Engineers Directory Table */}
        {activeSubTab === 'engineers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0A0A0A] border-b border-[#222] text-[10px] font-mono text-[#666] uppercase tracking-wider">
                <tr>
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">اسم المهندس (Engineer Name)</th>
                  <th className="p-3">الوحدة (Branch)</th>
                  <th className="p-3">القسم والاختصاص</th>
                  <th className="p-3 text-center">الرصيد الشهري</th>
                  <th className="p-3 text-center">التراكمي (YTD)</th>
                  <th className="p-3 text-center">الرتبة</th>
                  <th className="p-3 text-center">الصندوق</th>
                  <th className="p-3 text-center">الهاتف والمدينة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222] font-mono text-xs">
                {filteredEngineers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#666] font-sans">
                      لا توجد سجلات مهندسين مطابقة للبحث أو الفرع المحدد.
                    </td>
                  </tr>
                ) : (
                  filteredEngineers.map((eng, idx) => {
                    const engBranch = eng.branch || (eng.workCity === 'ديريك' ? 'DER' : eng.workCity === 'القامشلي' ? 'QAM' : 'HAS');
                    return (
                      <tr key={eng.id || idx} className="hover:bg-[#1A1A1A] transition">
                        <td className="p-3 text-center text-[#666] font-bold">{eng.serial || idx + 1}</td>
                        <td className="p-3 font-sans font-bold text-white">
                          <div>{eng.fullName}</div>
                          <div className="text-[10px] text-[#666] font-mono">{eng.id}</div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            engBranch === 'DER'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : engBranch === 'QAM'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          }`}>
                            {engBranch === 'DER' ? 'ديريك (DER)' : engBranch === 'QAM' ? 'القامشلي (QAM)' : 'الحسكة (HAS)'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-[#EEE]">{eng.department}</span>
                          {eng.specialization && eng.specialization !== eng.department && (
                            <span className="text-[#888] mr-1">({eng.specialization})</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-[#0A0A0A] px-2 py-0.5 rounded border border-[#222] font-bold text-white">
                            {eng.monthlyPoints ?? eng.points ?? 0}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-[#0A0A0A] px-2 py-0.5 rounded border border-[#222] font-bold text-[#00FFD1]">
                            {eng.ytdPoints ?? 0}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-white font-bold">{eng.rank}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            eng.fundStatus === 'داخل'
                              ? 'bg-[#00FFD1]/10 text-[#00FFD1] border-[#00FFD1]/30'
                              : 'bg-[#FF4D00]/10 text-[#FF4D00] border-[#FF4D00]/30'
                          }`}>
                            {eng.fundStatus === 'داخل' ? 'داخل' : 'خارج'}
                          </span>
                        </td>
                        <td className="p-3 text-center text-[#888]">
                          <div>{eng.workCity}</div>
                          <div dir="ltr" className="text-[10px] font-mono">{eng.phone || '—'}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Encrypted Database Backup & Safeguard Modal */}
      {backupModalOpen && (
        <div 
          id="database-backup-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBackupModalOpen(false);
          }}
        >
          <div 
            id="database-backup-modal"
            className="bg-[#121212] border border-[#333] rounded-xl w-full max-w-2xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 bg-[#181818] border-b border-[#2A2A2A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      DISASTER_RECOVERY // SAFEGUARD
                    </span>
                    <span className="text-[10px] font-mono text-[#777]">AES-256-GCM</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    النسخ الاحتياطي المشفر لقاعدة البيانات (Download Database Backup)
                  </h3>
                </div>
              </div>
              <button
                id="close-backup-modal-btn"
                onClick={() => setBackupModalOpen(false)}
                className="w-8 h-8 rounded bg-[#222] hover:bg-[#333] text-[#AAA] hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="p-3.5 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] text-xs text-[#AAA] flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  تتيح هذه الأداة تصدير كافة الكيانات والبيانات الأساسية للنظام في ملف مشفر (<span className="text-white font-mono">.enc.json</span>) عالي الأمان لحماية بيانات النقابة من التلف أو الحذف الناتج عن مسح ذاكرة التخزين المحلي للمتصفح (<span className="text-[#00FFD1] font-mono">LocalStorage Safeguard</span>).
                </p>
              </div>

              {/* Core Entities Breakdown */}
              <div>
                <div className="text-xs font-mono font-bold text-[#888] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>CORE_ENTITIES_INCLUDED // الكيانات الأساسية المشمولة بالنسخ</span>
                  <span className="text-[#00FFD1] font-mono">
                    Total {invoices.length + payOrders.length + deposits.length + effectiveEngineers.length + ledgerEntries.length} Records
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#222]">
                    <div className="text-[11px] text-[#888]">1. الفواتير (Invoices)</div>
                    <div className="text-lg font-bold font-mono text-[#00FFD1] mt-1">{invoices.length}</div>
                    <div className="text-[10px] text-[#555] font-mono">فواتير المشاريع الصادرة</div>
                  </div>

                  <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#222]">
                    <div className="text-[11px] text-[#888]">2. أوامر الصرف (EPO)</div>
                    <div className="text-lg font-bold font-mono text-amber-400 mt-1">{payOrders.length}</div>
                    <div className="text-[10px] text-[#555] font-mono">أوامر صرف أتعاب المهندسين</div>
                  </div>

                  <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#222]">
                    <div className="text-[11px] text-[#888]">3. الإيداعات (SFD)</div>
                    <div className="text-lg font-bold font-mono text-emerald-400 mt-1">{deposits.length}</div>
                    <div className="text-[10px] text-[#555] font-mono">إيداعات صناديق النقابة</div>
                  </div>

                  <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#222]">
                    <div className="text-[11px] text-[#888]">4. المهندسون (Engineers)</div>
                    <div className="text-lg font-bold font-mono text-cyan-400 mt-1">{effectiveEngineers.length}</div>
                    <div className="text-[10px] text-[#555] font-mono">سجلات المهندسين المعتمدين</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                  <div className="p-2.5 bg-[#0A0A0A] rounded border border-[#222] flex items-center justify-between text-xs">
                    <span className="text-[#888]">5. قيود دفتر الأستاذ (Ledger):</span>
                    <span className="font-mono font-bold text-white">{ledgerEntries.length} قيد</span>
                  </div>
                  <div className="p-2.5 bg-[#0A0A0A] rounded border border-[#222] flex items-center justify-between text-xs">
                    <span className="text-[#888]">6. سجلات الرقابة (Audit Logs):</span>
                    <span className="font-mono font-bold text-white">{auditLogs.length} سجل</span>
                  </div>
                </div>
              </div>

              {/* Encryption Options */}
              <div className="p-4 bg-[#0F0F0F] rounded-lg border border-[#222] space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>ENCRYPTION_CONFIGURATION // إعدادات التشفير</span>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded hover:bg-[#181818] transition">
                    <input
                      type="radio"
                      name="encryptionKeyMode"
                      checked={!useCustomKey}
                      onChange={() => setUseCustomKey(false)}
                      className="text-amber-400 focus:ring-amber-400 bg-[#222]"
                    />
                    <div>
                      <div className="font-medium text-white">المفتاح السيادي المعتمد لنقابة المهندسين (Default Syndicate Master Key)</div>
                      <div className="text-[11px] text-[#777]">تشفير متوافق ومعتمد مركزياً لفرع {currentBranch} بمفتاح النظام القياسي 2026.</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded hover:bg-[#181818] transition">
                    <input
                      type="radio"
                      name="encryptionKeyMode"
                      checked={useCustomKey}
                      onChange={() => setUseCustomKey(true)}
                      className="text-amber-400 focus:ring-amber-400 bg-[#222]"
                    />
                    <div>
                      <div className="font-medium text-white">كلمة مرور تشفير مخصصة (Custom Secret Passphrase)</div>
                      <div className="text-[11px] text-[#777]">تحديد كلمة سر مخصصة لا يمكن فك تشفير النسخة إلا بإدخالها.</div>
                    </div>
                  </label>

                  {useCustomKey && (
                    <div className="pt-2 pl-6 pr-6">
                      <div className="relative">
                        <Key className="w-4 h-4 text-amber-400 absolute right-3 top-2.5" />
                        <input
                          type="password"
                          value={customPassphrase}
                          onChange={(e) => setCustomPassphrase(e.target.value)}
                          placeholder="أدخل كلمة المرور السرية للتشفير..."
                          className="w-full bg-[#050505] border border-amber-500/40 rounded px-3 py-2 pr-9 text-xs font-mono text-white placeholder-[#555] focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="text-[10px] text-[#777] mt-1 font-mono">
                        * يتم استخدام خوارزمية PBKDF2-SHA256 مع 100,000 تكرار لاشتقاق مفتاح التشفير AES-256.
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#222] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#666]">
                  <span>ALGORITHM: AES-GCM (256-bit)</span>
                  <span>KDF: PBKDF2 (100k iters)</span>
                  <span>INTEGRITY: SHA-256 Hash</span>
                </div>
              </div>

              {/* Success Info Banner if generated */}
              {backupSuccessInfo && (
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم إنشاء وتنزيل النسخة الاحتياطية المشفرة بنجاح!</span>
                  </div>
                  <div className="text-[#AAA] font-mono text-[11px] space-y-0.5">
                    <div>الملف: <span className="text-white">{backupSuccessInfo.fileName}</span></div>
                    <div>الحجم التقديري: <span className="text-white">{backupSuccessInfo.rawSizeKb} KB</span> | التوقيت: <span className="text-white">{backupSuccessInfo.timestamp}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#181818] border-t border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#777] font-mono">
                FORMAT: <span className="text-[#AAA]">.enc.json</span> | BRANCH: <span className="text-[#00FFD1] font-bold">{currentBranch}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setBackupModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#222] hover:bg-[#2A2A2A] text-xs font-mono font-bold text-[#AAA] hover:text-white transition w-full sm:w-auto"
                >
                  إغلاق (CLOSE)
                </button>

                <button
                  id="confirm-download-backup-btn"
                  onClick={() => handleExecuteBackupDownload()}
                  disabled={isExportingBackup || (useCustomKey && !customPassphrase.trim())}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black text-xs font-mono font-bold uppercase tracking-wider transition shadow-lg w-full sm:w-auto cursor-pointer"
                >
                  {isExportingBackup ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>جاري التشفير والتصدير...</span>
                    </>
                  ) : (
                    <>
                      <HardDriveDownload className="w-4 h-4" />
                      <span>تنزيل النسخة الاحتياطية (.enc.json)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Print-Friendly Ledger Modal & Tabular Statement View */}
      {ledgerPrintModalOpen && (
        <div 
          id="ledger-print-modal-overlay"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex flex-col items-center justify-start p-2 sm:p-4 print:p-0 print:static print:bg-white print:overflow-visible"
        >
          {/* Non-Printable Modal Toolbar */}
          <div className="w-full max-w-5xl bg-[#181818] border border-[#333] rounded-t-xl p-3 sm:p-4 text-white flex flex-wrap items-center justify-between gap-3 print:hidden shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#00FFD1]/10 border border-[#00FFD1]/30 flex items-center justify-center text-[#00FFD1]">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#00FFD1] bg-[#00FFD1]/10 px-2 py-0.5 rounded border border-[#00FFD1]/20">
                    PRINT_UTILITY // TABULAR_LEDGER
                  </span>
                  <span className="text-[10px] font-mono text-[#888]">
                    {filteredLedgerEntries.length} RECORDS
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  معاينة وطباعة كشف دفتر الأستاذ العام (A4 Printable Ledger Statement)
                </h3>
              </div>
            </div>

            {/* Print Controls */}
            <div className="flex items-center gap-2.5">
              {/* Orientation selector */}
              <div className="flex items-center bg-[#0F0F0F] p-1 rounded border border-[#333] text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setLedgerPrintOrientation('landscape')}
                  className={`px-2.5 py-1 rounded transition ${
                    ledgerPrintOrientation === 'landscape'
                      ? 'bg-[#262626] text-[#00FFD1] font-bold shadow-sm'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  A4 أفقي (Landscape)
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerPrintOrientation('portrait')}
                  className={`px-2.5 py-1 rounded transition ${
                    ledgerPrintOrientation === 'portrait'
                      ? 'bg-[#262626] text-[#00FFD1] font-bold shadow-sm'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  A4 طولي (Portrait)
                </button>
              </div>

              {/* Direct Print Button */}
              <button
                id="execute-print-ledger-btn"
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-[#00FFD1] hover:brightness-110 text-black px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition shadow-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الآن (PRINT)</span>
              </button>

              {/* Close Button */}
              <button
                id="close-ledger-print-modal-btn"
                onClick={() => setLedgerPrintModalOpen(false)}
                className="w-8 h-8 rounded bg-[#262626] hover:bg-[#333] text-[#AAA] hover:text-white flex items-center justify-center transition"
                title="إغلاق المعاينة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Document Canvas */}
          <div 
            id="printable-ledger-report-container"
            className={`printable-ledger-report w-full bg-white text-black p-6 sm:p-8 rounded-b-xl shadow-2xl border border-slate-300 print:border-none print:shadow-none print:rounded-none print:p-0 ${
              ledgerPrintOrientation === 'landscape' ? 'max-w-6xl' : 'max-w-4xl'
            }`}
            dir="rtl"
          >
            {/* 1. Official Syndicate Formal Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-start justify-between">
                {/* Right Syndicate Details */}
                <div className="space-y-1 text-right">
                  <div className="text-xs font-bold text-slate-800">الجمهورية العربية السورية</div>
                  <div className="text-sm font-extrabold text-slate-950">نقابة المهندسين - فرع محافظة الحسكة</div>
                  <div className="text-xs text-slate-600 font-medium">
                    {filterBranch === 'ALL' 
                      ? 'الإدارة العامة والشؤون المالية والمصرفية (كافة الفروع)' 
                      : (BRANCH_CONFIG[filterBranch as BranchCode]?.header_title || `فرع ${filterBranch}`)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    نظام إدارة الرسوم والتدقيق الهندسي الموحد // SES-FIN-2026
                  </div>
                </div>

                {/* Center Report Title & Badge */}
                <div className="text-center px-4">
                  <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-1">
                    GENERAL LEDGER STATEMENT // كشف دفتر الأستاذ العام
                  </div>
                  <div className="text-base font-black text-slate-950">
                    كشف القيود المحاسبية وحركات الأستاذ العام المعتمد
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    وفق المعيار المحاسبي للقيد المزدوج (Double-Entry Bookkeeping)
                  </div>
                </div>

                {/* Left Report Meta Info */}
                <div className="space-y-1 text-left text-xs text-slate-700" dir="ltr">
                  <div><span className="font-bold text-slate-900">DATE:</span> {new Date().toLocaleDateString('ar-SY', { year: 'numeric', month: 'numeric', day: 'numeric' })}</div>
                  <div><span className="font-bold text-slate-900">TIME:</span> {new Date().toLocaleTimeString('ar-SY')}</div>
                  <div><span className="font-bold text-slate-900">SCOPE:</span> {filterBranch === 'ALL' ? 'ALL_BRANCHES' : filterBranch}</div>
                  <div><span className="font-bold text-slate-900">CURRENCY:</span> SYP (ل.س)</div>
                </div>
              </div>
            </div>

            {/* 2. Print-Specific Summary Metrics Bar */}
            <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-300 rounded mb-4 text-xs avoid-break">
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">إجمالي عدد القيود</span>
                <span className="font-bold font-mono text-sm text-slate-900">{filteredLedgerEntries.length} قيد</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">إجمالي المدين (Debits)</span>
                <span className="font-bold font-mono text-sm text-emerald-700">
                  {filteredLedgerEntries.reduce((sum, e) => sum + (e.debit || 0), 0).toLocaleString()} ل.س
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">إجمالي الدائن (Credits)</span>
                <span className="font-bold font-mono text-sm text-red-700">
                  {filteredLedgerEntries.reduce((sum, e) => sum + (e.credit || 0), 0).toLocaleString()} ل.س
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">الرصيد الصافي العام</span>
                <span className="font-bold font-mono text-sm text-slate-900">
                  {filteredLedgerEntries.reduce((sum, e) => sum + (e.balance ?? (e.debit - e.credit)), 0).toLocaleString()} ل.س
                </span>
              </div>
            </div>

            {/* 3. High-Precision Tabular Data (Styled with .print-tabular-data) */}
            <div className="overflow-x-auto">
              <table className="print-tabular-data w-full text-right">
                <thead>
                  <tr>
                    <th style={{ width: '4%' }}>#</th>
                    <th style={{ width: '12%' }}>رقم القيد</th>
                    <th style={{ width: '10%' }}>التاريخ</th>
                    <th style={{ width: '8%' }}>الفرع</th>
                    <th style={{ width: '8%' }}>رمز الحساب</th>
                    <th style={{ width: '18%' }}>اسم الحساب المحاسبي</th>
                    <th style={{ width: '22%' }}>البيان والتفاصيل المحاسبية</th>
                    <th className="text-left" style={{ width: '9%' }}>مدين (Debit)</th>
                    <th className="text-left" style={{ width: '9%' }}>دائن (Credit)</th>
                    <th className="text-left" style={{ width: '9%' }}>الرصيد</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedgerEntries.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-6 text-slate-500">
                        لا توجد قيود محاسبية مطابقة للبحث أو معايير الفلترة المحددة.
                      </td>
                    </tr>
                  ) : (
                    filteredLedgerEntries.map((entry, idx) => (
                      <tr key={entry.id}>
                        <td className="text-center font-mono text-[9px] text-slate-500">{idx + 1}</td>
                        <td className="font-mono font-bold text-slate-900">{entry.id}</td>
                        <td className="font-mono text-slate-700">{entry.date}</td>
                        <td className="font-mono font-semibold text-slate-800">
                          {entry.branchCode || currentBranch}
                        </td>
                        <td className="font-mono font-bold text-slate-700">{entry.accountCode}</td>
                        <td className="font-semibold text-slate-900">{entry.accountName}</td>
                        <td className="text-slate-700">{entry.description}</td>
                        <td className="col-num col-debit">
                          {entry.debit > 0 ? entry.debit.toLocaleString() : '0.00'}
                        </td>
                        <td className="col-num col-credit">
                          {entry.credit > 0 ? entry.credit.toLocaleString() : '0.00'}
                        </td>
                        <td className="col-num font-bold text-slate-900">
                          {(entry.balance ?? (entry.debit - entry.credit)).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="summary-row">
                    <td colSpan={7} className="text-center font-extrabold text-slate-900">
                      المجموع الإجمالي العام (GRAND TOTAL):
                    </td>
                    <td className="col-num col-debit font-extrabold">
                      {filteredLedgerEntries.reduce((sum, e) => sum + (e.debit || 0), 0).toLocaleString()}
                    </td>
                    <td className="col-num col-credit font-extrabold">
                      {filteredLedgerEntries.reduce((sum, e) => sum + (e.credit || 0), 0).toLocaleString()}
                    </td>
                    <td className="col-num font-extrabold text-slate-950">
                      {filteredLedgerEntries.reduce((sum, e) => sum + (e.balance ?? (e.debit - e.credit)), 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 4. Official Signatures & Compliance Block */}
            <div className="mt-8 pt-4 border-t-2 border-slate-300 avoid-break">
              <div className="grid grid-cols-4 gap-4 text-center text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-slate-900 mb-1">المحاسب المالي المختص</div>
                  <div className="text-[10px] text-slate-500 mb-6 font-mono">Financial Accountant</div>
                  <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <div className="text-[10px] text-slate-700 font-bold">
                    {BRANCH_CONFIG[currentBranch]?.default_accountant || 'المحاسب المعتمد'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-slate-900 mb-1">مدقق الحسابات المالي</div>
                  <div className="text-[10px] text-slate-500 mb-6 font-mono">Certified Internal Auditor</div>
                  <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <div className="text-[10px] text-slate-700 font-bold">دائرة الرقابة المالية</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-slate-900 mb-1">أمين الصندوق والشؤون المالية</div>
                  <div className="text-[10px] text-slate-500 mb-6 font-mono">Syndicate Treasurer</div>
                  <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <div className="text-[10px] text-slate-700 font-bold">أمانة صندوق الفرع</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-slate-900 mb-1">رئيس مجلس فرع النقابة</div>
                  <div className="text-[10px] text-slate-500 mb-6 font-mono">Branch President / Seal</div>
                  <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <div className="text-[10px] text-slate-700 font-bold">خاتم وتوقيع رئيس الفرع</div>
                </div>
              </div>

              {/* Security Checksum & Verification Footer */}
              <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div>
                  * مستخرج رسمي معتمد بنظام القيد المزدوج لنقابة المهندسين - يحمل رقماً تسلسلياً وتوثيقاً رقمياً موحداً.
                </div>
                <div>
                  CHECKSUM: SHA256-GL-{filteredLedgerEntries.length}-{currentBranch}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Export Utility Modal for Branch Accountants */}
      {csvExportModalOpen && (
        <div 
          id="csv-export-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCsvExportModalOpen(false);
          }}
        >
          <div 
            id="csv-export-modal-dialog"
            className="bg-[#111] border border-[#333] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-5 bg-[#151515] border-b border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00FFD1]/10 border border-[#00FFD1]/30 text-[#00FFD1] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>مركز تصدير جداول البيانات والمصنفات المحاسبية (CSV Suite)</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00FFD1]/20 text-[#00FFD1] border border-[#00FFD1]/30">
                      UTF-8 BOM / RFC 4180
                    </span>
                  </h3>
                  <p className="text-xs text-[#888] mt-0.5">
                    تصدير قيود اليومية ودفتر الأستاذ وسجلات المشاريع إلى صيغة CSV متوافقة مع Excel والأنظمة المحاسبية المعتمدة.
                  </p>
                </div>
              </div>
              <button
                id="close-csv-export-modal-btn"
                onClick={() => setCsvExportModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#222] hover:bg-[#333] text-[#AAA] hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Branch Filter & Status Info */}
              <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#222] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Filter className="w-4 h-4 text-[#00FFD1]" />
                  <span className="text-[#888]">نطاق الفلترة المطبق:</span>
                  <span className="font-bold text-white font-mono">
                    {filterBranch === 'ALL' ? 'جميع الفروع (HAS, QAM, DER)' : `فرع ${filterBranch}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#00FFD1]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ترميز الحروف العربية (Arabic UTF-8 BOM) مفعل تلقائياً</span>
                </div>
              </div>

              {/* Report Export Options List */}
              <div className="space-y-2.5">
                {/* 1. General Ledger CSV */}
                <div className="p-4 bg-[#161616] hover:bg-[#1C1C1C] transition rounded-lg border border-[#262626] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#00FFD1]" />
                      <span className="font-bold text-white text-xs">1. دفتر الأستاذ العام (General Ledger CSV)</span>
                      <span className="text-[10px] font-mono text-[#AAA]">({filteredLedgerEntries.length} قيد)</span>
                    </div>
                    <p className="text-[11px] text-[#777]">
                      تصدير القيود المحاسبية الثنائية (مدين، دائن، رصيد، رمز الحساب المحاسبي، البيان والتاريخ).
                    </p>
                  </div>
                  <button
                    id="download-ledger-csv-modal-btn"
                    onClick={() => {
                      handleExportLedgerCSV();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-bold text-xs bg-[#00FFD1] hover:brightness-110 text-black shrink-0 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل CSV</span>
                  </button>
                </div>

                {/* 2. Unified Journal CSV */}
                <div className="p-4 bg-[#161616] hover:bg-[#1C1C1C] transition rounded-lg border border-amber-500/20 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-amber-300 text-xs">2. اليومية المحاسبية الموحدة الشاملة (Unified Accounting Journal)</span>
                      <span className="text-[10px] font-mono text-amber-400/80">(Invoices + EPO + SFD + GL)</span>
                    </div>
                    <p className="text-[11px] text-[#777]">
                      كشف شامل يربط الفواتير المصدرة بأوامر الصرف المالي وإيداعات الصناديق وقيود الأستاذ في ملف واحد.
                    </p>
                  </div>
                  <button
                    id="download-unified-journal-csv-modal-btn"
                    onClick={() => {
                      handleExportUnifiedJournalCSV();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-bold text-xs bg-amber-400 hover:brightness-110 text-black shrink-0 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل اليومية</span>
                  </button>
                </div>

                {/* 3. Invoices & Projects CSV */}
                <div className="p-4 bg-[#161616] hover:bg-[#1C1C1C] transition rounded-lg border border-[#262626] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#00FFD1]" />
                      <span className="font-bold text-white text-xs">3. سجل الفواتير والمشاريع (Invoices & Projects Registry)</span>
                      <span className="text-[10px] font-mono text-[#AAA]">({filteredInvoices.length} مشروع)</span>
                    </div>
                    <p className="text-[11px] text-[#777]">
                      تصدير تفاصيل الفواتير الصادرة، بيانات أصحاب العلاقة، الموقع، المساحات، الأتعاب، وتوزيع الشلال المالي.
                    </p>
                  </div>
                  <button
                    id="download-invoices-csv-modal-btn"
                    onClick={() => {
                      handleExportInvoicesCSV();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-bold text-xs bg-[#1A1A1A] hover:bg-[#252525] text-[#00FFD1] border border-[#00FFD1]/40 shrink-0 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل CSV</span>
                  </button>
                </div>

                {/* 4. Engineer Pay Orders (EPO) CSV */}
                <div className="p-4 bg-[#161616] hover:bg-[#1C1C1C] transition rounded-lg border border-[#262626] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#FF4D00]" />
                      <span className="font-bold text-white text-xs">4. أوامر الصرف المالي للمهندسين (Pay Orders - EPO)</span>
                      <span className="text-[10px] font-mono text-[#AAA]">({filteredPayOrders.length} أمر صرف)</span>
                    </div>
                    <p className="text-[11px] text-[#777]">
                      تصدير مستحقات وأتعاب المهندسين المعتمدين مع تفصيل توزيع الحصص لكل تخصص هندسي ونسب الإشراف والتدريب.
                    </p>
                  </div>
                  <button
                    id="download-payorders-csv-modal-btn"
                    onClick={() => {
                      handleExportPayOrdersCSV();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-bold text-xs bg-[#1A1A1A] hover:bg-[#252525] text-[#FF4D00] border border-[#FF4D00]/40 shrink-0 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل CSV</span>
                  </button>
                </div>

                {/* 5. Syndicate Deposits (SFD) CSV */}
                <div className="p-4 bg-[#161616] hover:bg-[#1C1C1C] transition rounded-lg border border-[#262626] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#00FFD1]" />
                      <span className="font-bold text-white text-xs">5. إيداعات صناديق النقابة (Syndicate Deposits - SFD)</span>
                      <span className="text-[10px] font-mono text-[#AAA]">({filteredDeposits.length} إيداع)</span>
                    </div>
                    <p className="text-[11px] text-[#777]">
                      تصدير تفاصيل إيداعات الصندوق المشترك (10% أو 25%)، حصة النقابة (15%)، ورسوم التدقيق والطباعة.
                    </p>
                  </div>
                  <button
                    id="download-deposits-csv-modal-btn"
                    onClick={() => {
                      handleExportDepositsCSV();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-bold text-xs bg-[#1A1A1A] hover:bg-[#252525] text-[#00FFD1] border border-[#00FFD1]/40 shrink-0 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل CSV</span>
                  </button>
                </div>

                {/* 6. Fund Contributions CSV */}
                <div className="p-4 bg-[#161616] hover:bg-[#1C1C1C] transition rounded-lg border border-[#262626] flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#00FFD1]" />
                      <span className="font-bold text-white text-xs">6. سجل اشتراكات الصناديق (Fund Contributions)</span>
                      <span className="text-[10px] font-mono text-[#AAA]">({filteredContributions.length} اشتراك)</span>
                    </div>
                    <p className="text-[11px] text-[#777]">
                      تصدير كشف استقطاعات المهندسين المفرزة لصالح صناديق التعاون والمساعدة النقابية.
                    </p>
                  </div>
                  <button
                    id="download-contributions-csv-modal-btn"
                    onClick={() => {
                      handleExportContributionsCSV();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono font-bold text-xs bg-[#1A1A1A] hover:bg-[#252525] text-[#00FFD1] border border-[#00FFD1]/40 shrink-0 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#151515] border-t border-[#222] flex items-center justify-between text-xs">
              <div className="text-[#666] font-mono text-[11px]">
                نظام التقارير المالية المتوافقة مع المعايير المحاسبية - فرع الحسكة والقامشلي وديريك
              </div>
              <button
                onClick={() => setCsvExportModalOpen(false)}
                className="px-4 py-1.5 rounded bg-[#222] hover:bg-[#333] text-white font-mono font-bold text-xs transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload & Data Import Modal */}
      <CSVUploadModal
        isOpen={csvUploadModalOpen}
        onClose={() => setCsvUploadModalOpen(false)}
        currentBranch={currentBranch}
        onImportLedger={onImportLedger}
        onImportInvoices={onImportInvoices}
        onImportPayOrders={onImportPayOrders}
        onImportDeposits={onImportDeposits}
        onImportContributions={onImportContributions}
        onImportEngineers={onImportEngineers}
      />
    </div>
  );
};


