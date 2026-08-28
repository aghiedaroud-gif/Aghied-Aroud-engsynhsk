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
import { Navigation, NavTabId } from './components/Navigation';
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

export const App: React.FC = () => {
  // Global State
  const [currentBranch, setCurrentBranch] = useState<BranchCode>('HAS');
  const [currentRole, setCurrentRole] = useState<UserRole>('accountant');
  const [exchangeRate, setExchangeRate] = useState<number>(14000);
  const [activeTab, setActiveTab] = useState<NavTabId>('gs');
  const [userName, setUserName] = useState<string>('المحاسب المالي المعتمد');

  // Master Data Collections
  const [engineers, setEngineers] = useState<EngineerRecord[]>(() => {
    const saved = localStorage.getItem('syn_engineers_v1');
    return saved ? JSON.parse(saved) : INITIAL_ENGINEERS;
  });

  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    const saved = localStorage.getItem('syn_invoices_v1');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [payOrders, setPayOrders] = useState<PayOrderRecord[]>(() => {
    const saved = localStorage.getItem('syn_payorders_v1');
    return saved ? JSON.parse(saved) : INITIAL_PAY_ORDERS;
  });

  const [deposits, setDeposits] = useState<SyndicateDepositRecord[]>(() => {
    const saved = localStorage.getItem('syn_deposits_v1');
    return saved ? JSON.parse(saved) : INITIAL_SYNDICATE_DEPOSITS;
  });

  const [contributions, setContributions] = useState<FundContributionRecord[]>(() => {
    const saved = localStorage.getItem('syn_contributions_v1');
    return saved ? JSON.parse(saved) : INITIAL_CONTRIBUTIONS;
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem('syn_ledger_v1');
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('syn_auditlogs_v1');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [categories, setCategories] = useState<ProjectCategory[]>(() => {
    return getStoredCategories();
  });

  // Modals state
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [selectedDocType, setSelectedDocType] = useState<'INV' | 'EPO' | 'SFD'>('INV');
  const [selectedDocPayload, setSelectedDocPayload] = useState<any>(null);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [branchLogosModalOpen, setBranchLogosModalOpen] = useState(false);

  // LocalStorage Persistence
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

  // Sequential ID generators (4-digit format: e.g. INV-HAS-2026-0002)
  const nextSerial = String(invoices.length + 1).padStart(4, '0');
  const nextInvoiceNum = `INV-${currentBranch}-2026-${nextSerial}`;
  const nextPayOrderNum = `EPO-${currentBranch}-2026-${nextSerial}`;
  const nextDepositNum = `SFD-${currentBranch}-2026-${nextSerial}`;

  // Issuance Handlers
  const handleIssueInvoice = (newInv: InvoiceRecord) => {
    setInvoices(prev => [newInv, ...prev]);

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
    setPayOrders(prev => [newEpo, ...prev]);

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
    setDeposits(prev => [newSfd, ...prev]);
    if (newContribs.length > 0) {
      setContributions(prev => [...newContribs, ...prev]);
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

  const isBalanced = Math.abs(totalInvoicedSYP - (totalPayOrdersSYP + totalDepositsSYP)) < 100;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F0F0F0] flex flex-col font-sans selection:bg-[#00FFD1] selection:text-black" dir="rtl">
      
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
      />

      {/* 2. Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={currentRole}
        invoicesCount={invoices.length}
        categoriesCount={categories.length}
      />

      {/* Bold Typography Executive Metrics Banner */}
      <section className="bg-[#151515] border-b border-[#222] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="text-[10px] font-mono text-[#00FFD1] mb-2 uppercase tracking-widest flex items-center gap-2">
              <span>TOTAL_PROJECT_VOLUME // إجمالي العمليات المالية المعتمدة</span>
              <span className="h-2 w-2 rounded-full bg-[#00FFD1] animate-pulse"></span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[0.9] tracking-[-0.04em] text-white font-mono">
              {totalInvoicedSYP.toLocaleString()} <span className="text-xl sm:text-2xl tracking-tighter opacity-40">.00</span> <span className="text-base sm:text-lg text-[#00FFD1] not-italic font-bold">SYP</span>
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 mt-4">
              <div>
                <div className="text-[10px] font-mono text-[#666] uppercase">Net Engineer Payouts (EPO)</div>
                <div className="text-base sm:text-lg font-mono font-bold text-white">
                  {totalPayOrdersSYP.toLocaleString()} <span className="text-xs text-[#888]">SYP</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#666] uppercase">Syndicate Fund Share (SFD)</div>
                <div className="text-base sm:text-lg font-mono font-bold text-[#00FFD1]">
                  {totalDepositsSYP.toLocaleString()} <span className="text-xs text-[#888]">SYP</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#666] uppercase">Equilibrium Status</div>
                <div className={`text-base sm:text-lg font-mono font-bold ${isBalanced ? 'text-[#00FFD1]' : 'text-[#FF4D00]'}`}>
                  {isBalanced ? 'BALANCED 100%' : 'VARIANCE DETECTED'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end justify-between self-stretch">
            <div className="text-right">
              <div className="text-[10px] font-mono text-[#666] uppercase">Accredited Engineers</div>
              <div className="text-sm font-mono font-bold text-white">{engineers.length} ACTIVE (74 TOTAL)</div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2 bg-[#0A0A0A] border border-[#333] px-3 py-1.5 rounded">
              <span className="w-2 h-2 rounded-full bg-[#00FFD1]"></span>
              <span className="text-[10px] font-mono uppercase text-[#AAA]">SoD Engine: Strict Clearance</span>
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
            currentBranch={currentBranch}
            onViewDocument={handleViewDocument}
            onExportSheets={() => setWorkspaceModalOpen(true)}
          />
        )}

        {/* 74 Engineers Directory */}
        {activeTab === 'engineers' && (
          <EngineersDirectoryView
            engineers={engineers}
            currentBranch={currentBranch}
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

      {/* 4. Live Status Bar & Footer */}
      <div className="h-9 bg-[#00FFD1] text-black flex items-center px-4 sm:px-6 lg:px-8 justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
          <span>LIVE SESSION // SYRIAN ENGINEERING SYNDICATE</span>
        </div>
        <div className="hidden sm:block">NODE: {currentBranch} (HASAKAH - QAMISHLI - DERIK)</div>
        <div>SYS_VER: 2026.02</div>
      </div>

      <footer className="bg-[#0A0A0A] text-[#666] text-xs py-4 border-t border-[#1A1A1A] text-center space-y-1 font-mono text-[11px]">
        <div className="text-[#888]">
          الجمهورية العربية السورية - نقابة المهندسين (فرع الحسكة / القامشلي / ديريك)
        </div>
        <div className="text-[10px] text-[#555]">
          Unified Engineering Accounting Platform v2.0 • Syrian Engineering Syndicate Law Compliant (2026)
        </div>
      </footer>

      {/* Official A4 Document Modal */}
      <DocumentModal
        isOpen={documentModalOpen}
        onClose={() => setDocumentModalOpen(false)}
        documentId={selectedDocId}
        documentType={selectedDocType}
        data={selectedDocPayload}
        branch={currentBranch}
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

    </div>
  );
};

export default App;
