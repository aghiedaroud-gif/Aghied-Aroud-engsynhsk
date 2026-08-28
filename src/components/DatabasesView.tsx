import React, { useState } from 'react';
import { 
  InvoiceRecord, 
  PayOrderRecord, 
  SyndicateDepositRecord, 
  FundContributionRecord, 
  LedgerEntry, 
  AuditLogEntry, 
  BranchCode 
} from '../types';
import { DEFAULT_PROJECT_CATEGORIES } from '../data/categoriesData';
import { Database, Search, Filter, Printer, Download, Tag } from 'lucide-react';

interface DatabasesViewProps {
  invoices: InvoiceRecord[];
  payOrders: PayOrderRecord[];
  deposits: SyndicateDepositRecord[];
  contributions: FundContributionRecord[];
  ledgerEntries: LedgerEntry[];
  auditLogs: AuditLogEntry[];
  currentBranch: BranchCode;
  onViewDocument: (docId: string, docType: 'INV' | 'EPO' | 'SFD', payload: any) => void;
  onExportSheets: (modelName: string, data: any) => void;
}

export const DatabasesView: React.FC<DatabasesViewProps> = ({
  invoices,
  payOrders,
  deposits,
  contributions,
  ledgerEntries,
  auditLogs,
  currentBranch,
  onViewDocument,
  onExportSheets
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'payorders' | 'deposits' | 'contributions' | 'ledger' | 'audit'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('ALL');

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

  return (
    <div className="space-y-6">
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

          {/* Export Action */}
          <button
            onClick={() => onExportSheets(activeSubTab, activeSubTab === 'invoices' ? invoices : activeSubTab === 'payorders' ? payOrders : deposits)}
            className="flex items-center gap-2 bg-[#00FFD1] hover:brightness-90 text-black px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition shadow"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT_TO_SHEETS</span>
          </button>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-[#222]">
          {[
            { id: 'invoices', label: '1. الفواتير الصادرة', count: invoices.length },
            { id: 'payorders', label: '2. أوامر الصرف (EPO)', count: payOrders.length },
            { id: 'deposits', label: '3. إيداعات الصناديق (SFD)', count: deposits.length },
            { id: 'contributions', label: '4. اشتراكات المهندسين', count: contributions.length },
            { id: 'ledger', label: '5. دفتر الأستاذ العام', count: ledgerEntries.length },
            { id: 'audit', label: '6. سجل الرقابة والتدقيق', count: auditLogs.length }
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
          <div className="overflow-x-auto">
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/30">
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onViewDocument(inv.invoiceNumber, 'INV', inv)}
                          className="bg-[#1A1A1A] hover:bg-[#262626] text-[#00FFD1] border border-[#333] text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded flex items-center gap-1 mx-auto transition"
                        >
                          <Printer className="w-3 h-3" />
                          <span>PREVIEW</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Pay Orders Table */}
        {activeSubTab === 'payorders' && (
          <div className="overflow-x-auto">
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
        )}

        {/* 3. Syndicate Deposits Table */}
        {activeSubTab === 'deposits' && (
          <div className="overflow-x-auto">
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
        )}

        {/* 4. Fund Contributions Table */}
        {activeSubTab === 'contributions' && (
          <div className="overflow-x-auto">
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
                {contributions.map((c) => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. General Ledger Table */}
        {activeSubTab === 'ledger' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0A0A0A] border-b border-[#222] text-[10px] font-mono text-[#666] uppercase tracking-wider">
                <tr>
                  <th className="p-3">ENTRY_ID</th>
                  <th className="p-3">DATE</th>
                  <th className="p-3">ACC_CODE</th>
                  <th className="p-3">ACCOUNT_NAME</th>
                  <th className="p-3">DESCRIPTION</th>
                  <th className="p-3 text-left">DEBIT</th>
                  <th className="p-3 text-left">CREDIT</th>
                  <th className="p-3 text-left">BALANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222] font-mono text-[11px]">
                {ledgerEntries.map((l) => (
                  <tr key={l.id} className="hover:bg-[#1A1A1A] transition">
                    <td className="p-3 text-[#777]">{l.id}</td>
                    <td className="p-3 text-[#777]">{l.date}</td>
                    <td className="p-3 font-bold text-[#00FFD1]">{l.accountCode}</td>
                    <td className="p-3 font-sans font-semibold text-white">{l.accountName}</td>
                    <td className="p-3 font-sans text-[#AAA]">{l.description}</td>
                    <td className="p-3 text-left font-bold text-[#00FFD1]">
                      {l.debit > 0 ? `${l.debit.toLocaleString()} ${l.currency || 'SYP'}` : '—'}
                    </td>
                    <td className="p-3 text-left font-bold text-[#FF4D00]">
                      {l.credit > 0 ? `${l.credit.toLocaleString()} ${l.currency || 'SYP'}` : '—'}
                    </td>
                    <td className="p-3 text-left font-bold text-white">
                      {(l.balance ?? 0).toLocaleString()} {l.currency || 'SYP'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1A1A1A] transition">
                    <td className="p-3 text-[#777]">{log.timestamp}</td>
                    <td className="p-3 font-bold text-[#00FFD1]">{log.action || log.actionType}</td>
                    <td className="p-3 font-sans text-white">{log.userRole || log.role}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#222] text-[#00FFD1] border border-[#333]">{log.branchCode || log.branch}</span></td>
                    <td className="p-3 font-sans text-[#AAA]">{log.details}</td>
                    <td className="p-3 text-[10px] text-[#555]">{log.checksum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

