import React, { useState, useEffect } from 'react';
import { 
  BranchCode, 
  UserRole, 
  EngineerRecord, 
  InvoiceRecord, 
  PayOrderRecord, 
  SyndicateDepositRecord, 
  FundContributionRecord, 
  LedgerEntry, 
  AuditLogEntry,
  ProjectCategory
} from './types';
import { 
  INITIAL_ENGINEERS, 
  INITIAL_INVOICES, 
  INITIAL_PAY_ORDERS, 
  INITIAL_SYNDICATE_DEPOSITS, 
  INITIAL_CONTRIBUTIONS, 
  INITIAL_LEDGER, 
  INITIAL_AUDIT_LOGS 
} from './data/engineersData';
import { 
  DEFAULT_PROJECT_CATEGORIES, 
  getStoredCategories, 
  saveStoredCategories 
} from './data/categoriesData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Navigation, NavTabId } from './components/Navigation';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CreditCard, ShieldAlert } from 'lucide-react';

import { GSModelView } from './components/GSModelView';
import { SCModelView } from './components/SCModelView';
import { BSModelView } from './components/BSModelView';
import { COModelView } from './components/COModelView';
import { ExpressQView } from './components/ExpressQView';
import { ProjectCategoriesView } from './components/ProjectCategoriesView';
import { DatabasesView } from './components/DatabasesView';
import { EngineersDirectoryView } from './components/EngineersDirectoryView';
import { ArchiveVerificationView } from './components/ArchiveVerificationView';
import { AIAssistantView } from './components/AIAssistantView';
import { DocumentModal } from './components/DocumentModal';
import { WorkspaceToolsModal } from './components/WorkspaceToolsModal';
import { BranchLogosModal } from './components/BranchLogosModal';
import { DerikTransformModal } from './components/DerikTransformModal';
import { mergeEngineersWithDerik } from './utils/derikEngineerTransformer';
import { cacheMasterDataOffline } from './utils/serviceWorkerRegistration';

export const App: React.FC = () => {
  const { theme } = useTheme();
  const { dir } = useLanguage();
  const isLight = theme === 'light';

  // Global State
  const [currentBranch, setCurrentBranch] = useState<BranchCode>('HAS');
  const [currentRole, setCurrentRole] = useState<UserRole>('accountant');
  const [exchangeRate, setExchangeRate] = useState<number>(14000);
  const [activeTab, setActiveTab] = useState<NavTabId>('gs');
  const [userName, setUserName] = useState<string>('المحاسب المالي المعتمد');
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Deduplication helper to prevent any duplicate documents or logs
  const deduplicateList = <T extends { id?: string; invoiceNumber?: string; payOrderNumber?: string; depositNumber?: string }>(items: T[]): T[] => {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = item.invoiceNumber || item.payOrderNumber || item.depositNumber || item.id || JSON.stringify(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Master Data Collections
  const [engineers, setEngineers] = useState<EngineerRecord[]>(() => {
    const saved = localStorage.getItem('syn_engineers_v1');
    return saved ? JSON.parse(saved) : INITIAL_ENGINEERS;
  });

  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    const saved = localStorage.getItem('syn_invoices_v1');
    const list = saved ? JSON.parse(saved) : INITIAL_INVOICES;
    return deduplicateList(list);
  });

  const [payOrders, setPayOrders] = useState<PayOrderRecord[]>(() => {
    const saved = localStorage.getItem('syn_payorders_v1');
    const list = saved ? JSON.parse(saved) : INITIAL_PAY_ORDERS;
    return deduplicateList(list);
  });

  const [deposits, setDeposits] = useState<SyndicateDepositRecord[]>(() => {
    const saved = localStorage.getItem('syn_deposits_v1');
    const list = saved ? JSON.parse(saved) : INITIAL_SYNDICATE_DEPOSITS;
    return deduplicateList(list);
  });

  const [contributions, setContributions] = useState<FundContributionRecord[]>(() => {
    const saved = localStorage.getItem('syn_contributions_v1');
    const list = saved ? JSON.parse(saved) : INITIAL_CONTRIBUTIONS;
    return deduplicateList(list);
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem('syn_ledger_v1');
    const list = saved ? JSON.parse(saved) : INITIAL_LEDGER;
    return deduplicateList(list);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('syn_auditlogs_v1');
    const list = saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    return deduplicateList(list);
  });

  const [categories, setCategories] = useState<ProjectCategory[]>(() => {
    return getStoredCategories();
  });

  // Defined Liquidity Threshold for Unpaid Balances (Defaults to 20,000,000 SYP)
  const [unpaidThreshold, setUnpaidThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('syn_unpaid_threshold_v1');
    return saved ? JSON.parse(saved) : 20000000;
  });

  // Modals state
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [selectedDocType, setSelectedDocType] = useState<'INV' | 'EPO' | 'SFD'>('INV');
  const [selectedDocPayload, setSelectedDocPayload] = useState<any>(null);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [branchLogosModalOpen, setBranchLogosModalOpen] = useState(false);
  const [derikModalOpen, setDerikModalOpen] = useState(false);

  // LocalStorage & Service Worker Offline Cache Persistence
  useEffect(() => {
    localStorage.setItem('syn_engineers_v1', JSON.stringify(engineers));
    cacheMasterDataOffline({ engineers, invoices, payOrders, deposits, categories });
  }, [engineers, invoices, payOrders, deposits, categories]);

  useEffect(() => {
    localStorage.setItem('syn_invoices_v1', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('syn_payorders_v1', JSON.stringify(payOrders));
  }, [payOrders]);

  useEffect(() => {
    localStorage.setItem('syn_deposits_v1', JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem('syn_contributions_v1', JSON.stringify(contributions));
  }, [contributions]);

  useEffect(() => {
    localStorage.setItem('syn_ledger_v1', JSON.stringify(ledgerEntries));
  }, [ledgerEntries]);

  useEffect(() => {
    localStorage.setItem('syn_auditlogs_v1', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    saveStoredCategories(categories);
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('syn_unpaid_threshold_v1', JSON.stringify(unpaidThreshold));
  }, [unpaidThreshold]);

  // Sequential ID generators (4-digit format: e.g. INV-HAS-2026-0002)
  const nextSerial = String(invoices.length + 1).padStart(4, '0');
  const nextInvoiceNum = `INV-${currentBranch}-2026-${nextSerial}`;
  const nextPayOrderNum = `EPO-${currentBranch}-2026-${nextSerial}`;
  const nextDepositNum = `SFD-${currentBranch}-2026-${nextSerial}`;

  // Issuance Handlers with strict deduplication
  const handleIssueInvoice = (newInv: InvoiceRecord) => {
    setInvoices(prev => {
      if (prev.some(inv => inv.invoiceNumber === newInv.invoiceNumber)) {
        return prev;
      }
      return [newInv, ...prev];
    });

    // Add Audit Log
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${newInv.date} ${newInv.time}`,
      action: 'إصدار فاتورة هندسية',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم إصدار الفاتورة [${newInv.invoiceNumber}] لصاحب العلاقة (${newInv.clientName}) بمبلغ ${newInv.totalAmount.toLocaleString()} ${newInv.currency}`,
      checksum: `SHA256-INV-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleIssuePayOrder = (newEpo: PayOrderRecord) => {
    setPayOrders(prev => {
      if (prev.some(epo => epo.payOrderNumber === newEpo.payOrderNumber)) {
        return prev;
      }
      return [newEpo, ...prev];
    });

    // Deduct points from engineers
    if (newEpo.breakdown) {
      setEngineers(prev => prev.map(eng => {
        const item = newEpo.breakdown?.find(b => b.engineerName === eng.fullName);
        if (item) {
          return {
            ...eng,
            pointsCurrent: Math.min(eng.pointsCap, eng.pointsCurrent + 10)
          };
        }
        return eng;
      }));
    }

    // Add Ledger Entry (Debit Expense / Credit Engineers)
    const newLedger: LedgerEntry = {
      id: `GL-${Date.now()}`,
      date: newEpo.date,
      accountCode: '3101',
      accountName: 'أتعاب المهندسين المستحقة للصرف',
      description: `أمر صرف [${newEpo.payOrderNumber}] للفاتورة [${newEpo.relatedInvoice}]`,
      debit: newEpo.totalAmount,
      credit: 0,
      balance: newEpo.totalAmount,
      currency: newEpo.currency
    };
    setLedgerEntries(prev => [newLedger, ...prev]);

    // Add Audit Log
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${newEpo.date} ${newEpo.time}`,
      action: 'إصدار أمر صرف أتعاب',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم إصدار أمر الصرف [${newEpo.payOrderNumber}] بمبلغ ${newEpo.totalAmount.toLocaleString()} ${newEpo.currency}`,
      checksum: `SHA256-EPO-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleIssueDeposit = (newSfd: SyndicateDepositRecord, newContribs: FundContributionRecord[]) => {
    setDeposits(prev => {
      if (prev.some(sfd => sfd.depositNumber === newSfd.depositNumber)) {
        return prev;
      }
      return [newSfd, ...prev];
    });
    if (newContribs.length > 0) {
      setContributions(prev => deduplicateList([...newContribs, ...prev]));
    }

    // Add Ledger Entry (Credit Syndicate Accounts)
    const newLedger: LedgerEntry = {
      id: `GL-${Date.now()}`,
      date: newSfd.date,
      accountCode: '2201',
      accountName: 'حساب الصناديق النقابية والرسوم المودعة',
      description: `إشعار إيداع [${newSfd.depositNumber}] للفاتورة [${newSfd.relatedInvoice}]`,
      debit: 0,
      credit: newSfd.totalAmount,
      balance: newSfd.totalAmount,
      currency: newSfd.currency
    };
    setLedgerEntries(prev => [newLedger, ...prev]);

    // Add Audit Log
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${newSfd.date} ${newSfd.time}`,
      action: 'إصدار إيداع الرسوم والصناديق',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم ترحيل إيداع الصناديق النقابية [${newSfd.depositNumber}] بمبلغ ${newSfd.totalAmount.toLocaleString()} ${newSfd.currency}`,
      checksum: `SHA256-SFD-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Category Handlers
  const handleAddCategory = (newCat: ProjectCategory) => {
    setCategories(prev => [...prev, newCat]);
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'إضافة تصنيف مشروع جديد',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم إضافة التصنيف الهندسي: ${newCat.name_ar || newCat.nameAr} (${newCat.code})`,
      checksum: `SHA256-CAT-ADD-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateCategory = (updatedCat: ProjectCategory) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'تعديل تصنيف مشروع',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم تعديل بيانات التصنيف الهندسي: ${updatedCat.name_ar || updatedCat.nameAr} (${updatedCat.code})`,
      checksum: `SHA256-CAT-UPD-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const deletedCat = categories.find(c => c.id === categoryId);
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    // Clear category from invoices that had it
    setInvoices(prev => prev.map(inv => inv.categoryId === categoryId ? { ...inv, categoryId: undefined } : inv));
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'حذف تصنيف مشروع',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم حذف التصنيف الهندسي: ${deletedCat?.name_ar || deletedCat?.nameAr || categoryId}`,
      checksum: `SHA256-CAT-DEL-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleResetCategories = () => {
    setCategories(DEFAULT_PROJECT_CATEGORIES);
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'إعادة ضبط التصنيفات الافتراضية',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم استعادة التصنيفات الهندسية الرسمية القياسية (7 تصنيفات)`,
      checksum: `SHA256-CAT-RST-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleAssignCategory = (invoiceId: string, categoryId: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          categoryId: categoryId || undefined,
          relatedProject: inv.relatedProject ? {
            ...inv.relatedProject,
            categoryId: categoryId || undefined
          } : undefined
        };
      }
      return inv;
    }));

    const cat = categories.find(c => c.id === categoryId);
    const inv = invoices.find(i => i.id === invoiceId);
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'تعيين تصنيف لمشروع',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم ربط المشروع/الفاتورة [${inv?.invoiceNumber || invoiceId}] بالتصنيف: ${cat?.name_ar || cat?.nameAr || 'غير مصنف'}`,
      checksum: `SHA256-CAT-ASN-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateInvoiceStatus = (invoiceId: string, newStatus: 'Issued' | 'Audited' | 'Settled') => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status: newStatus };
      }
      return inv;
    }));

    const targetInv = invoices.find(i => i.id === invoiceId);
    const now = new Date();
    const statusLabel = newStatus === 'Settled' ? 'مسددة (Settled)' : newStatus === 'Audited' ? 'مدققة (Audited)' : 'صادرة / غير مسددة (Issued)';
    
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'تحديث حالة تسوية الفاتورة',
      userRole: currentRole,
      branchCode: targetInv?.branchCode || currentBranch,
      details: `تم تحديث حالة الفاتورة [${targetInv?.invoiceNumber || invoiceId}] إلى: ${statusLabel} بمبلغ ${targetInv?.totalAmount.toLocaleString()} ${targetInv?.currency}`,
      checksum: `SHA256-INV-STATUS-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleImportLedger = (newEntries: LedgerEntry[]) => {
    setLedgerEntries(prev => [...newEntries, ...prev]);
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'استيراد قيود دفتر الأستاذ (CSV)',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم استيراد ${newEntries.length} قيد محاسبي ثنائي القيد لدفتر الأستاذ العام عبر ملف CSV`,
      checksum: `SHA256-IMP-LED-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleImportInvoices = (newInvoices: InvoiceRecord[]) => {
    setInvoices(prev => [...newInvoices, ...prev]);
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'استيراد فواتير مشاريع (CSV)',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم استيراد ${newInvoices.length} فاتورة مشروع هندسي عبر ملف CSV`,
      checksum: `SHA256-IMP-INV-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleImportPayOrders = (newPayOrders: PayOrderRecord[]) => {
    setPayOrders(prev => [...newPayOrders, ...prev]);
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'استيراد أوامر صرف مالي (CSV)',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم استيراد ${newPayOrders.length} أمر صرف مالي للمهندسين عبر ملف CSV`,
      checksum: `SHA256-IMP-EPO-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleImportDeposits = (newDeposits: SyndicateDepositRecord[]) => {
    setDeposits(prev => [...newDeposits, ...prev]);
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'استيراد إيداعات صناديق (CSV)',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم استيراد ${newDeposits.length} إشعار إيداع نقابي لصالح الصناديق عبر ملف CSV`,
      checksum: `SHA256-IMP-SFD-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleImportContributions = (newContributions: FundContributionRecord[]) => {
    setContributions(prev => [...newContributions, ...prev]);
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'استيراد اشتراكات صناديق (CSV)',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم استيراد ${newContributions.length} اشتراك صناديق نقابية عبر ملف CSV`,
      checksum: `SHA256-IMP-FND-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleImportEngineers = (newEngineers: EngineerRecord[]) => {
    setEngineers(prev => {
      const existingIds = new Set(prev.map(e => e.id));
      const filteredNew = newEngineers.filter(e => !existingIds.has(e.id));
      return [...prev, ...filteredNew];
    });
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'استيراد سجلات مهندسين (CSV)',
      userRole: currentRole,
      branchCode: currentBranch,
      details: `تم استيراد وتحديث ${newEngineers.length} سجل مهندس عبر ملف CSV`,
      checksum: `SHA256-IMP-ENG-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleInjectDerikEngineers = (transformedEngineers: EngineerRecord[]) => {
    setEngineers(prev => mergeEngineersWithDerik(prev, transformedEngineers));
    
    // Specialty breakdown for branch accountant audit trail
    const civilCount = transformedEngineers.filter(e => e.department === 'مدني').length;
    const archCount = transformedEngineers.filter(e => e.department === 'عمارة').length;
    const elecCount = transformedEngineers.filter(e => e.department === 'كهرباء').length;
    const mechCount = transformedEngineers.filter(e => e.department === 'ميكانيك').length;
    const otherCount = transformedEngineers.filter(e => !['مدني', 'عمارة', 'كهرباء', 'ميكانيك'].includes(e.department)).length;

    // Ranks breakdown
    const consultants = transformedEngineers.filter(e => e.rank === 'استشاري').length;
    const practitioners = transformedEngineers.filter(e => e.rank === 'ممارس').length;
    const trainees = transformedEngineers.filter(e => e.rank === 'متدرب').length;

    // Fund participation breakdown
    const insideFund = transformedEngineers.filter(e => e.fundStatus === 'داخل').length;
    const outsideFund = transformedEngineers.filter(e => e.fundStatus === 'خارج').length;

    const summaryReport = `تقرير استيراد وحقن مهندسي فرع ديرك (إجمالي ${transformedEngineers.length} مهندساً معتمداً): ` +
      `[مدني: ${civilCount} | عمارة: ${archCount} | كهرباء: ${elecCount} | ميكانيك: ${mechCount}${otherCount > 0 ? ` | اختصاصات أخرى: ${otherCount}` : ''}] ` +
      `• الرتب: (${consultants} استشاري، ${practitioners} ممارس، ${trainees} متدرب) ` +
      `• الصندوق: (${insideFund} داخل - 25%، ${outsideFund} خارج - 10%)`;

    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'تحويل وحقن سجلات مهندسي فرع ديرك',
      userRole: currentRole,
      branchCode: 'DER',
      details: summaryReport,
      checksum: `SHA256-DER-INJ-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
    
    // Automatically switch branch to DER so user immediately sees interface associated with Derik engineers
    setCurrentBranch('DER');
  };

  const handleUpdateEngineer = (updatedEng: EngineerRecord) => {
    setEngineers(prev => prev.map(e => e.id === updatedEng.id ? updatedEng : e));
    const now = new Date();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour12: false })}`,
      action: 'تعديل بيانات مهندس معتمد',
      userRole: currentRole,
      branchCode: updatedEng.branch || currentBranch,
      details: `تم تحديث بيانات المهندس [${updatedEng.fullName}] في وحدة [${updatedEng.branch || currentBranch}]`,
      checksum: `SHA256-ENG-UPD-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleViewDocument = (docId: string, docType: 'INV' | 'EPO' | 'SFD', payload: any) => {
    setSelectedDocId(docId);
    setSelectedDocType(docType);
    setSelectedDocPayload(payload);
    setDocumentModalOpen(true);
  };

  const totalInvoicedSYP = invoices.reduce((acc, inv) => {
    return acc + (inv.currency === 'USD' ? inv.totalAmount * exchangeRate : inv.totalAmount);
  }, 0);

  const totalPayOrdersSYP = payOrders.reduce((acc, epo) => {
    return acc + (epo.currency === 'USD' ? epo.totalAmount * exchangeRate : epo.totalAmount);
  }, 0);

  const totalDepositsSYP = deposits.reduce((acc, sfd) => {
    return acc + (sfd.currency === 'USD' ? sfd.totalAmount * exchangeRate : sfd.totalAmount);
  }, 0);

  // Unpaid Balances & Liquidity Risk Calculations
  const totalUnpaidInvoicesSYP = invoices
    .filter(inv => inv.status !== 'Settled')
    .reduce((acc, inv) => acc + (inv.currency === 'USD' ? inv.totalAmount * exchangeRate : inv.totalAmount), 0);

  const totalUnpaidCount = invoices.filter(inv => inv.status !== 'Settled').length;
  const isThresholdExceeded = totalUnpaidInvoicesSYP > unpaidThreshold;

  const isBalanced = Math.abs(totalInvoicedSYP - (totalPayOrdersSYP + totalDepositsSYP)) < 100;

  // Month-over-Month (MoM) Trend Calculations: August 2026 (Current) vs July 2026 (Previous)
  const currentMonthKey = '2026-08';
  const previousMonthKey = '2026-07';

  // Invoices MoM
  const currentMonthInvoicedSYP = invoices
    .filter(inv => inv.date && inv.date.startsWith(currentMonthKey))
    .reduce((acc, inv) => acc + (inv.currency === 'USD' ? inv.totalAmount * exchangeRate : inv.totalAmount), 0);

  const prevInvoicedRaw = invoices
    .filter(inv => inv.date && inv.date.startsWith(previousMonthKey))
    .reduce((acc, inv) => acc + (inv.currency === 'USD' ? inv.totalAmount * exchangeRate : inv.totalAmount), 0);

  const fallbackPrevInvoiced = INITIAL_INVOICES
    .filter(inv => inv.date && inv.date.startsWith(previousMonthKey))
    .reduce((acc, inv) => acc + (inv.currency === 'USD' ? inv.totalAmount * exchangeRate : inv.totalAmount), 0);

  const effectivePrevInvoicedSYP = prevInvoicedRaw > 0 ? prevInvoicedRaw : fallbackPrevInvoiced;

  // Pay Orders (EPO) MoM
  const currentMonthPayOrdersSYP = payOrders
    .filter(epo => epo.date && epo.date.startsWith(currentMonthKey))
    .reduce((acc, epo) => acc + (epo.currency === 'USD' ? epo.totalAmount * exchangeRate : epo.totalAmount), 0);

  const prevPayOrdersRaw = payOrders
    .filter(epo => epo.date && epo.date.startsWith(previousMonthKey))
    .reduce((acc, epo) => acc + (epo.currency === 'USD' ? epo.totalAmount * exchangeRate : epo.totalAmount), 0);

  const fallbackPrevPayOrders = INITIAL_PAY_ORDERS
    .filter(epo => epo.date && epo.date.startsWith(previousMonthKey))
    .reduce((acc, epo) => acc + (epo.currency === 'USD' ? epo.totalAmount * exchangeRate : epo.totalAmount), 0);

  const effectivePrevPayOrdersSYP = prevPayOrdersRaw > 0 ? prevPayOrdersRaw : fallbackPrevPayOrders;

  // Syndicate Deposits (SFD) MoM
  const currentMonthDepositsSYP = deposits
    .filter(sfd => sfd.date && sfd.date.startsWith(currentMonthKey))
    .reduce((acc, sfd) => acc + (sfd.currency === 'USD' ? sfd.totalAmount * exchangeRate : sfd.totalAmount), 0);

  const prevDepositsRaw = deposits
    .filter(sfd => sfd.date && sfd.date.startsWith(previousMonthKey))
    .reduce((acc, sfd) => acc + (sfd.currency === 'USD' ? sfd.totalAmount * exchangeRate : sfd.totalAmount), 0);

  const fallbackPrevDeposits = INITIAL_SYNDICATE_DEPOSITS
    .filter(sfd => sfd.date && sfd.date.startsWith(previousMonthKey))
    .reduce((acc, sfd) => acc + (sfd.currency === 'USD' ? sfd.totalAmount * exchangeRate : sfd.totalAmount), 0);

  const effectivePrevDepositsSYP = prevDepositsRaw > 0 ? prevDepositsRaw : fallbackPrevDeposits;

  // Trend Helper function
  const computeTrend = (current: number, previous: number) => {
    if (previous <= 0) {
      if (current > 0) return { pct: 100, isUp: true, isFlat: false, diff: current, prev: previous };
      return { pct: 0, isUp: true, isFlat: true, diff: 0, prev: 0 };
    }
    const diff = current - previous;
    const pct = (diff / previous) * 100;
    return {
      pct: Math.abs(pct),
      isUp: diff > 0,
      isFlat: Math.abs(diff) < 1,
      diff,
      prev: previous
    };
  };

  const invoiceMoMTrend = computeTrend(currentMonthInvoicedSYP, effectivePrevInvoicedSYP);
  const payOrderMoMTrend = computeTrend(currentMonthPayOrdersSYP, effectivePrevPayOrdersSYP);
  const depositMoMTrend = computeTrend(currentMonthDepositsSYP, effectivePrevDepositsSYP);

  // Reusable Trend Badge component
  const TrendBadge = ({
    trend,
    currentTotal,
    size = 'sm',
    showLabel = true,
    className = ''
  }: {
    trend: { pct: number; isUp: boolean; isFlat: boolean; diff: number; prev: number };
    currentTotal: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
  }) => {
    const isUp = trend.isUp;
    const isFlat = trend.isFlat;
    const pctSign = isUp ? '+' : '-';
    const pctFormatted = `${pctSign}${trend.pct.toFixed(1)}%`;
    const tooltipText = `مقارنة بالشهر السابق (تموز 2026): ${isUp ? 'ارتفاع' : 'انخفاض'} بنسبة ${pctFormatted} (${trend.diff > 0 ? '+' : ''}${Math.round(trend.diff).toLocaleString()} ل.س) | الشهر الحالي (آب): ${Math.round(currentTotal).toLocaleString()} ل.س vs السابق (تموز): ${Math.round(trend.prev).toLocaleString()} ل.س`;

    if (isFlat) {
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold rounded px-1.5 py-0.5 bg-[#222] text-[#888] border border-[#333] ${
            size === 'lg' ? 'text-xs px-2.5 py-1' : size === 'md' ? 'text-[11px] px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5'
          } ${className}`}
          title="لا يوجد تغيير ملحوظ مقارنة بالشهر السابق"
        >
          <Minus className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'} />
          <span>0.0% MoM</span>
        </span>
      );
    }

    if (isUp) {
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-bold rounded cursor-help transition-transform hover:scale-105 ${
            size === 'lg'
              ? 'text-xs px-2.5 py-1 bg-[#00FFD1]/15 text-[#00FFD1] border border-[#00FFD1]/40 shadow-sm'
              : size === 'md'
              ? 'text-[11px] px-2 py-0.5 bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/30'
              : 'text-[10px] px-1.5 py-0.5 bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/30'
          } ${className}`}
          title={tooltipText}
        >
          <TrendingUp className={size === 'lg' ? 'w-3.5 h-3.5 text-[#00FFD1]' : 'w-2.5 h-2.5 text-[#00FFD1]'} />
          <span>{pctFormatted}</span>
          {showLabel && (
            <span className="text-[9px] font-mono text-[#00FFD1]/80 hidden sm:inline">
              MoM
            </span>
          )}
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-bold rounded cursor-help transition-transform hover:scale-105 ${
          size === 'lg'
            ? 'text-xs px-2.5 py-1 bg-[#FF4D00]/15 text-[#FF4D00] border border-[#FF4D00]/40 shadow-sm'
            : size === 'md'
            ? 'text-[11px] px-2 py-0.5 bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/30'
            : 'text-[10px] px-1.5 py-0.5 bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/30'
        } ${className}`}
        title={tooltipText}
      >
        <TrendingDown className={size === 'lg' ? 'w-3.5 h-3.5 text-[#FF4D00]' : 'w-2.5 h-2.5 text-[#FF4D00]'} />
        <span>{pctFormatted}</span>
        {showLabel && (
          <span className="text-[9px] font-mono text-[#FF4D00]/80 hidden sm:inline">
            MoM
          </span>
        )}
      </span>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0F0F0F] text-[#F0F0F0]'} flex flex-col font-sans selection:bg-[#00FFD1] selection:text-black`} dir={dir}>
      
      {/* 1. Master Header */}
      <Header
        currentBranch={currentBranch}
        onBranchChange={setCurrentBranch}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        exchangeRate={exchangeRate}
        onExchangeRateChange={setExchangeRate}
        onOpenWorkspaceTools={() => setWorkspaceModalOpen(true)}
        onOpenAIAssistant={() => setActiveTab('ai_audit')}
        onOpenBranchLogos={() => setBranchLogosModalOpen(true)}
        isOnline={isOnline}
      />

      {/* 2. Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={currentRole}
        invoicesCount={invoices.length}
        categoriesCount={categories.length}
      />


      {/* Bold Typography Executive Metrics Banner with MoM Trend Indicators */}
      <section className={`border-b px-4 sm:px-6 lg:px-8 py-5 transition-colors duration-200 ${
        isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : 'bg-[#151515] border-[#222] text-white'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className={`text-[10px] font-mono mb-2 uppercase tracking-widest flex items-center flex-wrap gap-2 ${
              isLight ? 'text-emerald-700 font-bold' : 'text-[#00FFD1]'
            }`}>
              <span>TOTAL_PROJECT_VOLUME // إجمالي العمليات المالية المعتمدة</span>
              <span className={`h-2 w-2 rounded-full animate-pulse ${isLight ? 'bg-emerald-600' : 'bg-[#00FFD1]'}`}></span>
              <span className={`${isLight ? 'text-slate-500' : 'text-[#666]'} text-[10px] font-mono`}>| آب vs تموز 2026</span>
            </div>
            
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className={`text-3xl sm:text-5xl md:text-6xl font-bold leading-[0.9] tracking-[-0.04em] font-mono ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {totalInvoicedSYP.toLocaleString()} <span className="text-xl sm:text-2xl tracking-tighter opacity-40">.00</span> <span className={`text-base sm:text-lg not-italic font-bold ${isLight ? 'text-emerald-700' : 'text-[#00FFD1]'}`}>SYP</span>
              </h1>
              <TrendBadge
                trend={invoiceMoMTrend}
                currentTotal={currentMonthInvoicedSYP}
                size="lg"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 mt-4">
              <div>
                <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase ${isLight ? 'text-slate-500 font-semibold' : 'text-[#666]'}`}>
                  <span>Net Engineer Payouts (EPO)</span>
                  <TrendBadge
                    trend={payOrderMoMTrend}
                    currentTotal={currentMonthPayOrdersSYP}
                    size="sm"
                    showLabel={false}
                  />
                </div>
                <div className={`text-base sm:text-lg font-mono font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {totalPayOrdersSYP.toLocaleString()} <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#888]'}`}>SYP</span>
                </div>
              </div>

              <div>
                <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase ${isLight ? 'text-slate-500 font-semibold' : 'text-[#666]'}`}>
                  <span>Syndicate Fund Share (SFD)</span>
                  <TrendBadge
                    trend={depositMoMTrend}
                    currentTotal={currentMonthDepositsSYP}
                    size="sm"
                    showLabel={false}
                  />
                </div>
                <div className={`text-base sm:text-lg font-mono font-bold mt-0.5 ${isLight ? 'text-emerald-700' : 'text-[#00FFD1]'}`}>
                  {totalDepositsSYP.toLocaleString()} <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#888]'}`}>SYP</span>
                </div>
              </div>

              {/* Unpaid Balance Exposure / Liquidity Indicator */}
              <div 
                onClick={() => setActiveTab('databases')}
                className={`cursor-pointer group p-1.5 -m-1.5 rounded transition ${
                  isThresholdExceeded 
                    ? 'bg-amber-500/10 border border-amber-500/30' 
                    : isLight ? 'hover:bg-slate-100' : 'hover:bg-[#1A1A1A]'
                }`}
                title="اضغط لمعاينة وتسوية الذمم غير المحصلة"
              >
                <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase ${isLight ? 'text-slate-500 font-semibold' : 'text-[#666]'}`}>
                  <span>Unpaid Balances (AR)</span>
                  {isThresholdExceeded ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-amber-600 bg-amber-100 dark:bg-amber-400/20 px-1 py-0.2 rounded animate-pulse">
                      <AlertTriangle className="w-2.5 h-2.5" /> EXCEEDED
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                      isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-[#00FFD1]/10 text-[#00FFD1]'
                    }`}>
                      SAFE
                    </span>
                  )}
                </div>
                <div className={`text-base sm:text-lg font-mono font-bold mt-0.5 ${
                  isThresholdExceeded ? 'text-amber-600 dark:text-amber-400' : isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {totalUnpaidInvoicesSYP.toLocaleString()} <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#888]'}`}>SYP ({totalUnpaidCount})</span>
                </div>
              </div>

              <div>
                <div className={`text-[10px] font-mono uppercase ${isLight ? 'text-slate-500 font-semibold' : 'text-[#666]'}`}>Equilibrium Status</div>
                <div className={`text-base sm:text-lg font-mono font-bold mt-0.5 ${isBalanced ? (isLight ? 'text-emerald-700' : 'text-[#00FFD1]') : 'text-[#FF4D00]'}`}>
                  {isBalanced ? 'BALANCED 100%' : 'VARIANCE DETECTED'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end justify-between self-stretch">
            <div className="text-right">
              <div className={`flex items-center md:justify-end gap-1.5 text-[10px] font-mono uppercase ${isLight ? 'text-slate-500 font-semibold' : 'text-[#666]'}`}>
                <span>Accredited Engineers</span>
                <span className={`inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded border font-bold ${
                  isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-[#00FFD1]/10 text-[#00FFD1] border-[#00FFD1]/20'
                }`}>
                  <TrendingUp className="w-2.5 h-2.5" /> 100% Active
                </span>
              </div>
              <div className={`text-sm font-mono font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{engineers.length} ACTIVE (74 TOTAL)</div>
            </div>
            <div className={`mt-4 md:mt-0 flex items-center gap-2 px-3 py-1.5 rounded border ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-[#0A0A0A] border-[#333] text-[#AAA]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-emerald-600' : 'bg-[#00FFD1]'}`}></span>
              <span className="text-[10px] font-mono uppercase">MoM Baseline: July vs August 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Model 1: GS General Study */}
        {activeTab === 'gs' && (
          <GSModelView
            engineers={engineers}
            currentBranch={currentBranch}
            exchangeRate={exchangeRate}
            userName={userName}
            onIssueInvoice={handleIssueInvoice}
            onIssuePayOrder={handleIssuePayOrder}
            onIssueDeposit={handleIssueDeposit}
            onViewDocument={handleViewDocument}
            nextInvoiceNum={nextInvoiceNum}
            nextPayOrderNum={nextPayOrderNum}
            nextDepositNum={nextDepositNum}
          />
        )}

        {/* Model 2: SC Supervision Contract ($) */}
        {activeTab === 'sc' && (
          <SCModelView
            engineers={engineers}
            currentBranch={currentBranch}
            userName={userName}
            onIssueInvoice={handleIssueInvoice}
            onIssuePayOrder={handleIssuePayOrder}
            onIssueDeposit={handleIssueDeposit}
            onViewDocument={handleViewDocument}
            nextInvoiceNum={nextInvoiceNum}
            nextPayOrderNum={nextPayOrderNum}
            nextDepositNum={nextDepositNum}
          />
        )}

        {/* Model 3: BS Bayani Study */}
        {activeTab === 'bs' && (
          <BSModelView
            engineers={engineers}
            currentBranch={currentBranch}
            exchangeRate={exchangeRate}
            userName={userName}
            onIssueInvoice={handleIssueInvoice}
            onIssuePayOrder={handleIssuePayOrder}
            onIssueDeposit={handleIssueDeposit}
            onViewDocument={handleViewDocument}
            nextInvoiceNum={nextInvoiceNum}
            nextPayOrderNum={nextPayOrderNum}
            nextDepositNum={nextDepositNum}
          />
        )}

        {/* Model 4: CO Construction Safety */}
        {activeTab === 'co' && (
          <COModelView
            engineers={engineers}
            currentBranch={currentBranch}
            exchangeRate={exchangeRate}
            userName={userName}
            onIssueInvoice={handleIssueInvoice}
            onIssuePayOrder={handleIssuePayOrder}
            onIssueDeposit={handleIssueDeposit}
            onViewDocument={handleViewDocument}
            nextInvoiceNum={nextInvoiceNum}
            nextPayOrderNum={nextPayOrderNum}
            nextDepositNum={nextDepositNum}
          />
        )}

        {/* Rapid Calculator: Express_q */}
        {activeTab === 'express_q' && (
          <ExpressQView />
        )}

        {/* Project Categories & Analytics Reports */}
        {activeTab === 'categories' && (
          <ProjectCategoriesView
            categories={categories}
            invoices={invoices}
            payOrders={payOrders}
            deposits={deposits}
            currentBranch={currentBranch}
            exchangeRate={exchangeRate}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onResetCategories={handleResetCategories}
            onAssignCategory={handleAssignCategory}
            onViewDocument={handleViewDocument}
          />
        )}

        {/* Databases & General Ledger */}
        {activeTab === 'databases' && (
          <DatabasesView
            invoices={invoices}
            payOrders={payOrders}
            deposits={deposits}
            contributions={contributions}
            ledgerEntries={ledgerEntries}
            auditLogs={auditLogs}
            engineers={engineers}
            currentBranch={currentBranch}
            exchangeRate={exchangeRate}
            onViewDocument={handleViewDocument}
            onExportSheets={() => setWorkspaceModalOpen(true)}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onImportLedger={handleImportLedger}
            onImportInvoices={handleImportInvoices}
            onImportPayOrders={handleImportPayOrders}
            onImportDeposits={handleImportDeposits}
            onImportContributions={handleImportContributions}
            onImportEngineers={handleImportEngineers}
            onOpenDerikTransformer={() => setDerikModalOpen(true)}
          />
        )}

        {/* 74 Engineers Directory */}
        {activeTab === 'engineers' && (
          <EngineersDirectoryView
            engineers={engineers}
            currentBranch={currentBranch}
            onUpdateEngineer={handleUpdateEngineer}
            onOpenDerikTransformer={() => setDerikModalOpen(true)}
            onBranchChange={(b) => setCurrentBranch(b)}
            isOnline={isOnline}
          />
        )}

        {/* Physical Archive & SoD Verification */}
        {activeTab === 'archive' && (
          <ArchiveVerificationView
            currentRole={currentRole}
            currentBranch={currentBranch}
            userName={userName}
          />
        )}

        {/* Gemini AI Forensic Auditor */}
        {activeTab === 'ai_audit' && (
          <AIAssistantView
            currentBranch={currentBranch}
            latestInvoice={invoices[0]}
            latestPayOrder={payOrders[0]}
            latestDeposit={deposits[0]}
          />
        )}

      </main>

      {/* 4. Footer with Secondary Controls */}
      <Footer
        currentBranch={currentBranch}
        onBranchChange={setCurrentBranch}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        exchangeRate={exchangeRate}
        onExchangeRateChange={setExchangeRate}
        onOpenWorkspaceTools={() => setWorkspaceModalOpen(true)}
        onOpenBranchLogos={() => setBranchLogosModalOpen(true)}
        isOnline={isOnline}
      />

      {/* Official A4 Document Modal */}
      <DocumentModal
        isOpen={documentModalOpen}
        onClose={() => setDocumentModalOpen(false)}
        documentId={selectedDocId}
        documentType={selectedDocType}
        data={selectedDocPayload}
        branch={currentBranch}
        isOnline={isOnline}
      />

      {/* Google Workspace Tools Modal */}
      <WorkspaceToolsModal
        isOpen={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
        currentBranch={currentBranch}
        invoicesCount={invoices.length}
      />

      {/* Branch Logos & Official Seals Modal */}
      <BranchLogosModal
        isOpen={branchLogosModalOpen}
        onClose={() => setBranchLogosModalOpen(false)}
        currentBranch={currentBranch}
        onSelectBranch={(b) => setCurrentBranch(b)}
      />

      {/* Derik Engineers Data Transformer & Injector Modal */}
      <DerikTransformModal
        isOpen={derikModalOpen}
        onClose={() => setDerikModalOpen(false)}
        onInjectEngineers={handleInjectDerikEngineers}
        currentBranch={currentBranch}
      />

    </div>
  );
};

export default App;
