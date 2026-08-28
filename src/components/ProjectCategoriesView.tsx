import React, { useState, useMemo } from 'react';
import { 
  ProjectCategory, 
  InvoiceRecord, 
  PayOrderRecord, 
  SyndicateDepositRecord, 
  BranchCode 
} from '../types';
import { 
  Tags, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Printer, 
  Search, 
  Check, 
  X, 
  PieChart as PieChartIcon, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Layers, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { BranchLogo } from './BranchLogo';

interface ProjectCategoriesViewProps {
  categories: ProjectCategory[];
  onAddCategory: (cat: Omit<ProjectCategory, 'id' | 'createdAt'>) => void;
  onUpdateCategory: (cat: ProjectCategory) => void;
  onDeleteCategory: (id: string) => void;
  onResetCategories: () => void;
  invoices: InvoiceRecord[];
  payOrders: PayOrderRecord[];
  deposits: SyndicateDepositRecord[];
  onAssignCategory: (invoiceId: string, categoryId: string) => void;
  currentBranch: BranchCode;
  exchangeRate: number;
}

export const ProjectCategoriesView: React.FC<ProjectCategoriesViewProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onResetCategories,
  invoices,
  payOrders,
  deposits,
  onAssignCategory,
  currentBranch,
  exchangeRate
}) => {
  // Tabs: 'reports' | 'categories_management' | 'assign_projects'
  const [activeSubTab, setActiveSubTab] = useState<'reports' | 'categories_management' | 'assign_projects'>('reports');
  
  // Category Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameKu, setFormNameKu] = useState('');
  const [formColor, setFormColor] = useState('#00FFD1');
  const [formDesc, setFormDesc] = useState('');
  const [formTargetShare, setFormTargetShare] = useState<number>(10);

  // Filters for reports and tables
  const [filterBranch, setFilterBranch] = useState<'ALL' | BranchCode>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyMode, setCurrencyMode] = useState<'SYP' | 'USD'>('SYP');

  // Open Create Category Modal
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormCode(`CAT-${String(categories.length + 1).padStart(2, '0')}`);
    setFormNameAr('');
    setFormNameKu('');
    setFormColor('#00FFD1');
    setFormDesc('');
    setFormTargetShare(10);
    setIsModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditModal = (cat: ProjectCategory) => {
    setEditingCategory(cat);
    setFormCode(cat.code);
    setFormNameAr(cat.name_ar);
    setFormNameKu(cat.name_ku || '');
    setFormColor(cat.color);
    setFormDesc(cat.description || '');
    setFormTargetShare(cat.targetSharePct || 10);
    setIsModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim() || !formCode.trim()) return;

    if (editingCategory) {
      onUpdateCategory({
        ...editingCategory,
        code: formCode.trim().toUpperCase(),
        name_ar: formNameAr.trim(),
        name_ku: formNameKu.trim(),
        color: formColor,
        description: formDesc.trim(),
        targetSharePct: Number(formTargetShare) || 10
      });
    } else {
      onAddCategory({
        code: formCode.trim().toUpperCase(),
        name_ar: formNameAr.trim(),
        name_ku: formNameKu.trim(),
        color: formColor,
        description: formDesc.trim(),
        targetSharePct: Number(formTargetShare) || 10
      });
    }
    setIsModalOpen(false);
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (filterBranch !== 'ALL' && inv.branchCode !== filterBranch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = inv.clientName.toLowerCase().includes(q);
        const matchesNum = inv.invoiceNumber.toLowerCase().includes(q);
        const matchesModel = inv.modelType.toLowerCase().includes(q);
        if (!matchesClient && !matchesNum && !matchesModel) return false;
      }
      return true;
    });
  }, [invoices, filterBranch, searchQuery]);

  // Aggregated Report Metrics by Category
  const categoryReports = useMemo(() => {
    // Map invoice amounts in SYP and USD
    const catMap: Record<string, {
      category: ProjectCategory;
      count: number;
      totalSYP: number;
      totalUSD: number;
      epoAmountSYP: number;
      sfdAmountSYP: number;
      branchCounts: { HAS: number; QAM: number; DER: number };
      branchSYP: { HAS: number; QAM: number; DER: number };
    }> = {};

    // Initialize all existing categories
    categories.forEach(cat => {
      catMap[cat.id] = {
        category: cat,
        count: 0,
        totalSYP: 0,
        totalUSD: 0,
        epoAmountSYP: 0,
        sfdAmountSYP: 0,
        branchCounts: { HAS: 0, QAM: 0, DER: 0 },
        branchSYP: { HAS: 0, QAM: 0, DER: 0 }
      };
    });

    // Unassigned category container
    const unassignedCat: ProjectCategory = {
      id: 'unassigned',
      code: 'UNASSIGNED',
      name_ar: 'مشاريع غير مصنفة (عام)',
      name_ku: 'Bê pol',
      color: '#6B7280',
      description: 'مشاريع لم يتم تحديد تصنيف مخصص لها بعد',
      isDefault: false
    };

    catMap['unassigned'] = {
      category: unassignedCat,
      count: 0,
      totalSYP: 0,
      totalUSD: 0,
      epoAmountSYP: 0,
      sfdAmountSYP: 0,
      branchCounts: { HAS: 0, QAM: 0, DER: 0 },
      branchSYP: { HAS: 0, QAM: 0, DER: 0 }
    };

    filteredInvoices.forEach(inv => {
      const catId = inv.categoryId && catMap[inv.categoryId] ? inv.categoryId : 'unassigned';
      const target = catMap[catId];
      const sypVal = inv.currency === 'USD' ? inv.totalAmount * exchangeRate : inv.totalAmount;
      const usdVal = inv.currency === 'USD' ? inv.totalAmount : inv.totalAmount / exchangeRate;

      target.count += 1;
      target.totalSYP += sypVal;
      target.totalUSD += usdVal;

      // Find matching pay orders (EPO) and deposits (SFD)
      const relatedEpos = payOrders.filter(p => p.relatedInvoice === inv.invoiceNumber);
      const epoSyp = relatedEpos.reduce((acc, p) => acc + (p.currency === 'USD' ? p.totalAmount * exchangeRate : p.totalAmount), 0);
      
      const relatedSfds = deposits.filter(d => d.relatedInvoice === inv.invoiceNumber);
      const sfdSyp = relatedSfds.reduce((acc, d) => acc + (d.currency === 'USD' ? d.totalAmount * exchangeRate : d.totalAmount), 0);

      // If epo/sfd are calculated, add them, otherwise fallback to standard syndicate standard ratio (65% EPO, 35% SFD)
      target.epoAmountSYP += epoSyp > 0 ? epoSyp : sypVal * 0.65;
      target.sfdAmountSYP += sfdSyp > 0 ? sfdSyp : sypVal * 0.35;

      const br = inv.branchCode as BranchCode;
      if (br && target.branchCounts[br] !== undefined) {
        target.branchCounts[br] += 1;
        target.branchSYP[br] += sypVal;
      }
    });

    const list = Object.values(catMap).filter(item => item.count > 0 || item.category.id !== 'unassigned');
    const grandTotalSYP = list.reduce((acc, item) => acc + item.totalSYP, 0);

    return list.map(item => ({
      ...item,
      sharePct: grandTotalSYP > 0 ? (item.totalSYP / grandTotalSYP) * 100 : 0,
      avgSYP: item.count > 0 ? item.totalSYP / item.count : 0,
      avgUSD: item.count > 0 ? item.totalUSD / item.count : 0
    }));
  }, [categories, filteredInvoices, payOrders, deposits, exchangeRate]);

  // Overall Totals
  const grandTotalSYP = useMemo(() => {
    return categoryReports.reduce((acc, item) => acc + item.totalSYP, 0);
  }, [categoryReports]);

  const grandTotalUSD = useMemo(() => {
    return categoryReports.reduce((acc, item) => acc + item.totalUSD, 0);
  }, [categoryReports]);

  const grandTotalProjects = useMemo(() => {
    return categoryReports.reduce((acc, item) => acc + item.count, 0);
  }, [categoryReports]);

  // Pie chart data
  const pieChartData = useMemo(() => {
    return categoryReports
      .filter(item => item.totalSYP > 0)
      .map(item => ({
        name: item.category.name_ar,
        code: item.category.code,
        value: currencyMode === 'SYP' ? item.totalSYP : Math.round(item.totalUSD),
        color: item.category.color,
        count: item.count
      }));
  }, [categoryReports, currencyMode]);

  // Branch Comparison Bar Chart Data
  const branchBarChartData = useMemo(() => {
    return categoryReports
      .filter(item => item.count > 0)
      .map(item => ({
        name: item.category.code,
        fullName: item.category.name_ar,
        الحسكة_HAS: currencyMode === 'SYP' ? item.branchSYP.HAS : Math.round(item.branchSYP.HAS / exchangeRate),
        القامشلي_QAM: currencyMode === 'SYP' ? item.branchSYP.QAM : Math.round(item.branchSYP.QAM / exchangeRate),
        ديريك_DER: currencyMode === 'SYP' ? item.branchSYP.DER : Math.round(item.branchSYP.DER / exchangeRate)
      }));
  }, [categoryReports, currencyMode, exchangeRate]);

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = [
      'Category Code',
      'Category Name (Arabic)',
      'Category Name (Kurdish)',
      'Projects Count',
      'Total Volume (SYP)',
      'Total Volume (USD)',
      'Engineer Payouts EPO (SYP)',
      'Syndicate Fund SFD (SYP)',
      'Average Project Value (SYP)',
      'Volume Share (%)'
    ];

    const rows = categoryReports.map(item => [
      item.category.code,
      `"${item.category.name_ar}"`,
      `"${item.category.name_ku || ''}"`,
      item.count,
      item.totalSYP.toFixed(0),
      item.totalUSD.toFixed(2),
      item.epoAmountSYP.toFixed(0),
      item.sfdAmountSYP.toFixed(0),
      item.avgSYP.toFixed(0),
      item.sharePct.toFixed(2) + '%'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `engineering_categories_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-[#151515] text-white p-5 rounded border border-[#222] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#0A0A0A] text-[#00FFD1] border border-[#333] flex items-center justify-center font-bold">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#00FFD1] uppercase tracking-widest flex items-center gap-2">
                <span>PROJECT_CLASSIFICATION // TAXONOMY & REPORTING ENGINE</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FFD1]"></span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                نظام تصنيف المشاريع الهندسية والتقارير التحليلية المتقدمة
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black px-3.5 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>ADD_CATEGORY</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-[#0A0A0A] hover:bg-[#222] text-white border border-[#333] px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-[#00FFD1]" />
              <span>EXPORT_CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#0A0A0A] hover:bg-[#222] text-white border border-[#333] px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5 text-[#00FFD1]" />
              <span>PRINT_A4</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#222] text-xs">
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded font-mono text-xs transition border ${
              activeSubTab === 'reports'
                ? 'bg-[#00FFD1] text-black font-bold border-[#00FFD1]'
                : 'bg-[#0A0A0A] text-[#888] hover:text-white border-[#222]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>1. تقارير ومخططات التصنيف (Category Reports)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories_management')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded font-mono text-xs transition border ${
              activeSubTab === 'categories_management'
                ? 'bg-[#00FFD1] text-black font-bold border-[#00FFD1]'
                : 'bg-[#0A0A0A] text-[#888] hover:text-white border-[#222]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. إدارة وهيكلة التصنيفات ({categories.length} فئات)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('assign_projects')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded font-mono text-xs transition border ${
              activeSubTab === 'assign_projects'
                ? 'bg-[#00FFD1] text-black font-bold border-[#00FFD1]'
                : 'bg-[#0A0A0A] text-[#888] hover:text-white border-[#222]'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>3. إسناد وتخصيص المشاريع ({invoices.length} مشروع)</span>
          </button>
        </div>
      </div>

      {/* Global Filters & Currency Selector */}
      <div className="bg-[#151515] border border-[#222] p-3.5 rounded flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Branch Filter */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#00FFD1]" />
            <span className="font-mono text-[11px] text-[#888] uppercase">BRANCH_FILTER:</span>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value as any)}
              className="bg-[#0A0A0A] text-white font-mono border border-[#333] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#00FFD1]"
            >
              <option value="ALL">جميع الوحدات (All Branches)</option>
              <option value="HAS">وحدة الحسكة (HAS)</option>
              <option value="QAM">وحدة القامشلي (QAM)</option>
              <option value="DER">وحدة ديريك (DER)</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#666] absolute right-2 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم صاحب المشروع أو الفاتورة..."
              className="bg-[#0A0A0A] text-white font-mono border border-[#333] rounded pr-7 pl-3 py-1 text-xs focus:outline-none focus:border-[#00FFD1] placeholder-[#555] w-56"
            />
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#333] p-1 rounded">
          <span className="text-[10px] font-mono text-[#666] px-1.5 uppercase">CURRENCY:</span>
          <button
            onClick={() => setCurrencyMode('SYP')}
            className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-bold transition ${
              currencyMode === 'SYP'
                ? 'bg-[#00FFD1] text-black'
                : 'text-[#888] hover:text-white'
            }`}
          >
            SYP (ل.س)
          </button>
          <button
            onClick={() => setCurrencyMode('USD')}
            className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-bold transition ${
              currencyMode === 'USD'
                ? 'bg-[#00FFD1] text-black'
                : 'text-[#888] hover:text-white'
            }`}
          >
            USD ($)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: COMPREHENSIVE CATEGORY REPORTS & ANALYTICS                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          
          {/* Executive KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-[#151515] border border-[#222] p-4 rounded space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-[#888]">
                <span>TOTAL_INVOICED_VOLUME</span>
                <DollarSign className="w-4 h-4 text-[#00FFD1]" />
              </div>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {currencyMode === 'SYP' 
                  ? grandTotalSYP.toLocaleString() 
                  : grandTotalUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                <span className="text-xs text-[#00FFD1] mr-1"> {currencyMode}</span>
              </div>
              <div className="text-[10px] font-mono text-[#666]">
                عبر {grandTotalProjects} مشروع هندسي مسجل
              </div>
            </div>

            <div className="bg-[#151515] border border-[#222] p-4 rounded space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-[#888]">
                <span>ACTIVE_CATEGORIES</span>
                <Layers className="w-4 h-4 text-[#00FFD1]" />
              </div>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {categories.length} <span className="text-xs text-[#888]">تصنيفات</span>
              </div>
              <div className="text-[10px] font-mono text-[#00FFD1]">
                {categoryReports.filter(c => c.count > 0).length} تصنيفات نشطة بالمشاريع
              </div>
            </div>

            <div className="bg-[#151515] border border-[#222] p-4 rounded space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-[#888]">
                <span>TOP_CATEGORY</span>
                <TrendingUp className="w-4 h-4 text-[#00FFD1]" />
              </div>
              {categoryReports.length > 0 ? (
                <>
                  <div className="text-base font-bold text-white truncate">
                    {[...categoryReports].sort((a, b) => b.totalSYP - a.totalSYP)[0]?.category.name_ar || 'N/A'}
                  </div>
                  <div className="text-[10px] font-mono text-[#00FFD1]">
                    حصة: {[...categoryReports].sort((a, b) => b.totalSYP - a.totalSYP)[0]?.sharePct.toFixed(1)}% من الإجمالي
                  </div>
                </>
              ) : (
                <div className="text-xs text-[#666]">لا توجد بيانات</div>
              )}
            </div>

            <div className="bg-[#151515] border border-[#222] p-4 rounded space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-[#888]">
                <span>AVERAGE_PER_PROJECT</span>
                <Sparkles className="w-4 h-4 text-[#00FFD1]" />
              </div>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {grandTotalProjects > 0
                  ? (currencyMode === 'SYP' 
                      ? (grandTotalSYP / grandTotalProjects).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                      : (grandTotalUSD / grandTotalProjects).toLocaleString(undefined, { maximumFractionDigits: 0 }))
                  : 0}
                <span className="text-xs text-[#00FFD1] mr-1"> {currencyMode}</span>
              </div>
              <div className="text-[10px] font-mono text-[#666]">
                متوسط القيمة التعاقدية للمشروع
              </div>
            </div>

          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Donut Chart: Revenue Distribution by Category */}
            <div className="lg:col-span-5 bg-[#151515] rounded border border-[#222] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-[#00FFD1]" />
                  <h3 className="font-bold text-sm text-white">توزيع الإيرادات المالية حسب التصنيف</h3>
                </div>
                <span className="font-mono text-[10px] text-[#00FFD1] bg-[#0A0A0A] px-2 py-0.5 rounded border border-[#333]">
                  SHARE_DONUT
                </span>
              </div>

              <div className="h-64 w-full">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#00FFD1'} stroke="#0F0F0F" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0A0A0A',
                          border: '1px solid #333',
                          borderRadius: '4px',
                          color: '#FFF',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                        formatter={(value: any) => [`${Number(value).toLocaleString()} ${currencyMode}`, 'القيمة']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-[#666] font-mono">
                    NO_DATA_AVAILABLE
                  </div>
                )}
              </div>

              {/* Legend List */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#222]">
                {pieChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-white font-mono text-[11px]">{item.code}:</span>
                    <span className="font-mono text-[10px] text-[#888]">{item.count} م</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart: Branch Breakdown per Category */}
            <div className="lg:col-span-7 bg-[#151515] rounded border border-[#222] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#00FFD1]" />
                  <h3 className="font-bold text-sm text-white">مقارنة حجم التصنيفات عبر الوحدات الهندسية الثلاث</h3>
                </div>
                <span className="font-mono text-[10px] text-[#00FFD1] bg-[#0A0A0A] px-2 py-0.5 rounded border border-[#333]">
                  BRANCH_MATRIX
                </span>
              </div>

              <div className="h-64 w-full">
                {branchBarChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchBarChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis stroke="#666" tick={{ fontSize: 10, fill: '#888' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0A0A0A',
                          border: '1px solid #333',
                          borderRadius: '4px',
                          color: '#FFF',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="الحسكة_HAS" fill="#00FFD1" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="القامشلي_QAM" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="ديريك_DER" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-[#666] font-mono">
                    NO_DATA_AVAILABLE
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#666] pt-2 border-t border-[#222]">
                <span>HAS = وحدة الحسكة • QAM = وحدة القامشلي • DER = وحدة ديريك</span>
                <span className="text-[#00FFD1]">FX: 1 USD = {exchangeRate.toLocaleString()} SYP</span>
              </div>
            </div>

          </div>

          {/* Comprehensive Category Breakdown Table */}
          <div className="bg-[#151515] rounded border border-[#222] overflow-hidden shadow">
            <div className="p-4 border-b border-[#222] flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00FFD1]" />
                <span>التقرير المالي التراكمي المفصل حسب تصنيف المشاريع (Category Breakdown Ledger)</span>
              </h3>
              <span className="font-mono text-xs text-[#888]">
                {categoryReports.length} CATEGORIES
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-[#0A0A0A] text-[#888] font-mono border-b border-[#222]">
                    <th className="py-3 px-4">كود الفئة</th>
                    <th className="py-3 px-4">اسم التصنيف (عربي / كردي)</th>
                    <th className="py-3 px-4 text-center">عدد المشاريع</th>
                    <th className="py-3 px-4 text-left">إجمالي القيمة ({currencyMode})</th>
                    <th className="py-3 px-4 text-left">صرف المهندسين (EPO)</th>
                    <th className="py-3 px-4 text-left">صندوق النقابة (SFD)</th>
                    <th className="py-3 px-4 text-left">متوسط المشروع</th>
                    <th className="py-3 px-4 text-center">الحصة النسبية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222] font-mono">
                  {categoryReports.map(item => {
                    const totalVal = currencyMode === 'SYP' ? item.totalSYP : item.totalUSD;
                    const epoVal = currencyMode === 'SYP' ? item.epoAmountSYP : item.epoAmountSYP / exchangeRate;
                    const sfdVal = currencyMode === 'SYP' ? item.sfdAmountSYP : item.sfdAmountSYP / exchangeRate;
                    const avgVal = currencyMode === 'SYP' ? item.avgSYP : item.avgUSD;

                    return (
                      <tr key={item.category.id} className="hover:bg-[#1A1A1A] transition">
                        <td className="py-3 px-4">
                          <span 
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ 
                              backgroundColor: `${item.category.color}15`, 
                              color: item.category.color,
                              border: `1px solid ${item.category.color}40`
                            }}
                          >
                            {item.category.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white font-sans text-xs">{item.category.name_ar}</div>
                          {item.category.name_ku && (
                            <div className="text-[10px] text-[#666] font-sans">{item.category.name_ku}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-white font-bold">
                          {item.count}
                        </td>
                        <td className="py-3 px-4 text-left font-bold text-[#00FFD1]" dir="ltr">
                          {totalVal.toLocaleString(undefined, { maximumFractionDigits: currencyMode === 'USD' ? 2 : 0 })}
                        </td>
                        <td className="py-3 px-4 text-left text-[#EEE]" dir="ltr">
                          {epoVal.toLocaleString(undefined, { maximumFractionDigits: currencyMode === 'USD' ? 2 : 0 })}
                        </td>
                        <td className="py-3 px-4 text-left text-[#AAA]" dir="ltr">
                          {sfdVal.toLocaleString(undefined, { maximumFractionDigits: currencyMode === 'USD' ? 2 : 0 })}
                        </td>
                        <td className="py-3 px-4 text-left text-[#888]" dir="ltr">
                          {avgVal.toLocaleString(undefined, { maximumFractionDigits: currencyMode === 'USD' ? 2 : 0 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-12 bg-[#222] h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full" 
                                style={{ 
                                  width: `${Math.min(item.sharePct, 100)}%`,
                                  backgroundColor: item.category.color 
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-white">
                              {item.sharePct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#0A0A0A] font-bold border-t-2 border-[#333] text-white">
                    <td colSpan={2} className="py-3.5 px-4 font-mono">
                      الإجمالي العام (GRAND TOTAL):
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-[#00FFD1]">
                      {grandTotalProjects} مشاريع
                    </td>
                    <td className="py-3.5 px-4 text-left font-mono text-[#00FFD1] text-sm" dir="ltr">
                      {(currencyMode === 'SYP' ? grandTotalSYP : grandTotalUSD).toLocaleString(undefined, { maximumFractionDigits: currencyMode === 'USD' ? 2 : 0 })} {currencyMode}
                    </td>
                    <td colSpan={4} className="py-3.5 px-4 text-left font-mono text-[#888]">
                      100.0% Portfolio
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: CATEGORIES MANAGEMENT (DEFINE / ADD / EDIT / DELETE)             */}
      {/* ========================================================================= */}
      {activeSubTab === 'categories_management' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">هيكلية التصنيفات وقواعد البيانات</h3>
              <p className="text-xs text-[#888] font-mono mt-0.5">
                يمكنك تعريف تصنيفات مخصصة جديدة، تعديل الألوان، أو تعيين الحصص المستهدفة
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onResetCategories}
                className="bg-[#0A0A0A] hover:bg-[#222] text-[#888] hover:text-white border border-[#333] px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط للافتراضي (Reset)</span>
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black px-3.5 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة تصنيف جديد</span>
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const report = categoryReports.find(r => r.category.id === cat.id);
              const projectCount = report ? report.count : 0;
              const totalVal = report ? (currencyMode === 'SYP' ? report.totalSYP : report.totalUSD) : 0;

              return (
                <div
                  key={cat.id}
                  className="bg-[#151515] rounded border border-[#222] p-4 flex flex-col justify-between space-y-4 hover:border-[#333] transition"
                >
                  <div className="space-y-2.5">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#222] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3.5 h-3.5 rounded-sm"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-mono text-xs font-bold text-white">
                          {cat.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="text-[#888] hover:text-[#00FFD1] p-1 rounded transition"
                          title="تعديل التصنيف"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {!cat.isDefault && (
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف التصنيف (${cat.name_ar})؟`)) {
                                onDeleteCategory(cat.id);
                              }
                            }}
                            className="text-[#888] hover:text-[#FF4D00] p-1 rounded transition"
                            title="حذف التصنيف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Titles */}
                    <div>
                      <h4 className="font-bold text-sm text-white">{cat.name_ar}</h4>
                      {cat.name_ku && (
                        <div className="text-[11px] text-[#00FFD1] font-mono mt-0.5">{cat.name_ku}</div>
                      )}
                      <p className="text-[11px] text-[#888] mt-1.5 leading-relaxed">
                        {cat.description || 'لا يوجد وصف مدخل لهذا التصنيف.'}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Footer */}
                  <div className="pt-3 border-t border-[#222] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[#666] text-[10px]">PROJECTS: </span>
                      <strong className="text-white">{projectCount}</strong>
                    </div>
                    <div>
                      <span className="text-[#666] text-[10px]">TOTAL: </span>
                      <strong className="text-[#00FFD1]">
                        {totalVal.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currencyMode}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: ASSIGN PROJECTS TO CATEGORIES (INTERACTIVE MATRIX)               */}
      {/* ========================================================================= */}
      {activeSubTab === 'assign_projects' && (
        <div className="bg-[#151515] rounded border border-[#222] overflow-hidden space-y-4 p-4 shadow">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">إسناد وتعيين التصنيفات للمشاريع والفواتير</h3>
              <p className="text-xs text-[#888] font-mono mt-0.5">
                يمكنك تعديل وتحديث تصنيف أي معاملة هندسية مباشرة من القائمة المنسدلة
              </p>
            </div>
            <div className="text-xs font-mono text-[#00FFD1] bg-[#0A0A0A] px-3 py-1 rounded border border-[#333]">
              TOTAL_PROJECTS: {filteredInvoices.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-[#0A0A0A] text-[#888] font-mono border-b border-[#222]">
                  <th className="py-2.5 px-3">رقم الفاتورة</th>
                  <th className="py-2.5 px-3">صاحب المشروع / العميل</th>
                  <th className="py-2.5 px-3">الوحدة</th>
                  <th className="py-2.5 px-3">النموذج الهندسي</th>
                  <th className="py-2.5 px-3 text-left">القيمة التعاقدية</th>
                  <th className="py-2.5 px-3">التصنيف الحالي (Category Assignment)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredInvoices.map((inv) => {
                  const currentCat = categories.find(c => c.id === inv.categoryId);

                  return (
                    <tr key={inv.id} className="hover:bg-[#1A1A1A] transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {inv.clientName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#00FFD1]">
                        {inv.branchCode}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#AAA]">
                        {inv.modelType}
                      </td>
                      <td className="py-2.5 px-3 text-left font-mono font-bold text-white" dir="ltr">
                        {inv.totalAmount.toLocaleString()} <span className="text-[10px] text-[#888]">{inv.currency}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={inv.categoryId || ''}
                          onChange={(e) => onAssignCategory(inv.id, e.target.value)}
                          className="bg-[#0A0A0A] text-white font-mono text-xs border border-[#333] rounded px-2.5 py-1 focus:outline-none focus:border-[#00FFD1] cursor-pointer"
                          style={{
                            borderColor: currentCat ? currentCat.color : '#333'
                          }}
                        >
                          <option value="">-- غير مصنف (Unassigned) --</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              [{cat.code}] {cat.name_ar}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CUSTOM CATEGORY                                         */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] w-full max-w-lg rounded border border-[#333] shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#0A0A0A] px-5 py-3.5 border-b border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tags className="w-4 h-4 text-[#00FFD1]" />
                <h3 className="font-bold text-sm text-white">
                  {editingCategory ? 'تعديل بيانات التصنيف الهندسي' : 'إضافة تصنيف مشاريع جديد'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#888] hover:text-white p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#888] mb-1">
                    كود التصنيف (CODE) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="مثال: EDU-08"
                    className="w-full bg-[#0A0A0A] text-white font-mono border border-[#333] rounded px-3 py-1.5 focus:outline-none focus:border-[#00FFD1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#888] mb-1">
                    لون التمييز (COLOR BADGE)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-8 h-8 rounded bg-transparent cursor-pointer border border-[#333]"
                    />
                    <input
                      type="text"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="flex-1 bg-[#0A0A0A] text-white font-mono border border-[#333] rounded px-2.5 py-1.5 uppercase focus:outline-none focus:border-[#00FFD1]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#888] mb-1">
                  اسم التصنيف بالعربية (Arabic Title) *
                </label>
                <input
                  type="text"
                  required
                  value={formNameAr}
                  onChange={(e) => setFormNameAr(e.target.value)}
                  placeholder="مثال: المنشآت التعليمية والمدارس"
                  className="w-full bg-[#0A0A0A] text-white border border-[#333] rounded px-3 py-1.5 focus:outline-none focus:border-[#00FFD1]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#888] mb-1">
                  الاسم بالكردية (Kurdish Title)
                </label>
                <input
                  type="text"
                  value={formNameKu}
                  onChange={(e) => setFormNameKu(e.target.value)}
                  placeholder="مثال: Saziyên Perwerdehiyê"
                  className="w-full bg-[#0A0A0A] text-white font-mono border border-[#333] rounded px-3 py-1.5 focus:outline-none focus:border-[#00FFD1]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#888] mb-1">
                  الحصة النسبية المستهدفة (Target Share %)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formTargetShare}
                  onChange={(e) => setFormTargetShare(Number(e.target.value))}
                  className="w-full bg-[#0A0A0A] text-white font-mono border border-[#333] rounded px-3 py-1.5 focus:outline-none focus:border-[#00FFD1]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#888] mb-1">
                  الوصف والملاحظات الهندسية (Description)
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="وصف تفصيلي لأنواع المشاريع المندرجة تحت هذا التصنيف..."
                  className="w-full bg-[#0A0A0A] text-white border border-[#333] rounded p-2.5 focus:outline-none focus:border-[#00FFD1]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#222] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-[#0A0A0A] hover:bg-[#222] text-[#888] border border-[#333] px-3.5 py-1.5 rounded font-mono"
                >
                  إلغاء (Cancel)
                </button>
                <button
                  type="submit"
                  className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black font-mono font-bold px-4 py-1.5 rounded uppercase tracking-wider"
                >
                  {editingCategory ? 'حفظ التعديلات' : 'إنشاء التصنيف'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
