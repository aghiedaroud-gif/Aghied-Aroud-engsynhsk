import React, { useState, useEffect } from 'react';
import { EngineerRecord, BranchCode } from '../types';
import { 
  Users, 
  Search, 
  Phone, 
  CheckCircle, 
  Filter, 
  Download, 
  Printer, 
  Award, 
  FileSpreadsheet, 
  LayoutGrid, 
  Table as TableIcon,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Edit3,
  X,
  WifiOff,
  Database,
  Building2,
  Cpu
} from 'lucide-react';
import { validateAndFormatPhone } from '../utils/phoneValidator';

interface EngineersDirectoryViewProps {
  engineers: EngineerRecord[];
  currentBranch: BranchCode;
  onUpdateEngineer?: (eng: EngineerRecord) => void;
  onOpenDerikTransformer?: () => void;
  onBranchChange?: (branch: BranchCode) => void;
  isOnline?: boolean;
}

export const EngineersDirectoryView: React.FC<EngineersDirectoryViewProps> = ({
  engineers,
  currentBranch,
  onUpdateEngineer,
  onOpenDerikTransformer,
  onBranchChange,
  isOnline = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('ALL');
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterFund, setFilterFund] = useState<string>('ALL');
  const [filterRank, setFilterRank] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingEng, setEditingEng] = useState<EngineerRecord | null>(null);

  // Sync initial branch filter with current active branch if preferred, or allow quick toggle
  useEffect(() => {
    // Keep user's manual selection if changed, but initialize cleanly
  }, [currentBranch]);

  // Branch and Department counts
  const derikCount = engineers.filter(e => e.branch === 'DER' || e.workCity === 'ديريك').length;
  const hasakahCount = engineers.filter(e => e.branch === 'HAS' || (!e.branch && e.workCity === 'الحسكة')).length;
  const qamishloCount = engineers.filter(e => e.branch === 'QAM' || e.workCity === 'القامشلي').length;

  const civilCount = engineers.filter(e => e.department === 'مدني').length;
  const archCount = engineers.filter(e => e.department === 'عمارة').length;
  const mechCount = engineers.filter(e => e.department === 'ميكانيك').length;
  const elecCount = engineers.filter(e => e.department === 'كهرباء').length;

  const filteredEngineers = engineers.filter(eng => {
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = 
      !query ||
      eng.fullName.toLowerCase().includes(query) || 
      (eng.phone && eng.phone.includes(query)) ||
      (eng.specialization && eng.specialization.toLowerCase().includes(query)) ||
      (eng.id && eng.id.toLowerCase().includes(query)) ||
      (eng.workCity && eng.workCity.toLowerCase().includes(query));
    
    const engBranch = eng.branch || (eng.workCity === 'ديريك' ? 'DER' : eng.workCity === 'القامشلي' ? 'QAM' : 'HAS');
    const matchBranch = filterBranch === 'ALL' || engBranch === filterBranch;
    const matchDept = filterDept === 'ALL' || eng.department === filterDept;
    const matchFund = filterFund === 'ALL' || eng.fundStatus === filterFund;
    const matchRank = filterRank === 'ALL' || eng.rank === filterRank;

    return matchSearch && matchBranch && matchDept && matchFund && matchRank;
  });

  // Export CSV matching exact schema
  const handleExportCSV = () => {
    const headers = ["Engineer Name", "Department", "Specialization", "Monthly Points Balance", "YTD Points", "High Performer Status", "Last Updated", "Notes", "Rank", "Fund Status", "Phone", "Work City", "Branch", "Archive Ref"];
    const rows = filteredEngineers.map(e => [
      `"${e.fullName}"`,
      `"${e.department}"`,
      `"${e.specialization || e.department}"`,
      e.monthlyPoints ?? e.points ?? 0,
      e.ytdPoints ?? 0,
      `"${e.highPerformerStatus || ''}"`,
      `"${e.lastUpdated || '2026-08-29'}"`,
      `"${e.notes || ''}"`,
      `"${e.rank}"`,
      `"${e.fundStatus}"`,
      `"${e.phone || ''}"`,
      `"${e.workCity || ''}"`,
      `"${e.branch || ''}"`,
      `"${e.archiveRef || ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `engineers_roster_${filterBranch}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEngineer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEng || !onUpdateEngineer) return;
    onUpdateEngineer(editingEng);
    setEditingEng(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#151515] border border-[#222] p-5 rounded-xl shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0A0A0A] border border-[#333] text-[#00FFD1] flex items-center justify-center font-bold shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#00FFD1] uppercase tracking-widest flex items-center gap-2">
                <span>ROSTER_REGISTRY // MULTI_BRANCH_ACCREDITED</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] animate-pulse"></span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>سجل المهندسين المعتمدين ونظام ترصيد النقاط الهندسية</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#222] text-[#00FFD1] border border-[#333]">
                  {engineers.length} مهندساً معتمداً
                </span>
              </h2>
              <p className="text-xs text-[#888] mt-0.5">
                قاعدة البيانات الرسمية المشتركة لوحدات النقابة (الحسكة • القامشلي • ديريك)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Derik Transformer Trigger Button */}
            {onOpenDerikTransformer && (
              <button
                id="open-derik-transformer-btn"
                onClick={onOpenDerikTransformer}
                className="bg-[#00FFD1]/10 hover:bg-[#00FFD1]/20 text-[#00FFD1] border border-[#00FFD1]/40 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition shadow-sm"
                title="تحويل وحقن بيانات مهندسي وحدة ديريك من الجداول الخام إلى نموذج EngineerRecord"
              >
                <Cpu className="w-4 h-4 text-[#00FFD1]" />
                <span>محول بيانات فرع ديرك (DERIK_INJECT)</span>
              </button>
            )}

            {/* Offline persistence indicator */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border ${
                isOnline 
                  ? 'bg-[#0A0A0A] border-[#222] text-[#00FFD1]' 
                  : 'bg-[#FF4D00]/10 border-[#FF4D00]/40 text-[#FF4D00]'
              }`}
              title="دليل المهندسين محفوظ محلياً في ذاكرة التخزين المؤقت للعمل دون إنترنت"
            >
              <Database className="w-3.5 h-3.5 text-[#00FFD1]" />
              <span className="text-[10px] font-bold">ROSTER_CACHED</span>
            </div>

            <div className="flex rounded-lg border border-[#333] bg-[#0A0A0A] p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'table' ? 'bg-[#00FFD1] text-black shadow' : 'text-[#888] hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>TABLE_VIEW</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'cards' ? 'bg-[#00FFD1] text-black shadow' : 'text-[#888] hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>CARDS_VIEW</span>
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="bg-[#0A0A0A] hover:bg-[#1f1f1f] text-[#00FFD1] border border-[#333] px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT_CSV</span>
            </button>
          </div>
        </div>

        {/* Branch Selection Association Tabs */}
        <div className="mt-4 pt-4 border-t border-[#222]">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
            <div className="text-[11px] font-mono text-[#AAA] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#00FFD1]" />
              <span>تصفية وربط الواجهة بالوحدات الهندسية (Branch Association):</span>
            </div>
            {currentBranch && (
              <span className="text-[10px] font-mono text-[#888]">
                الوحدة النشطة في النظام حالياً: <strong className="text-[#00FFD1]">{currentBranch}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setFilterBranch('ALL')}
              className={`p-2.5 rounded-lg border text-right transition flex items-center justify-between ${
                filterBranch === 'ALL'
                  ? 'bg-[#1A1A1A] border-[#00FFD1] text-white shadow'
                  : 'bg-[#0A0A0A] border-[#222] text-[#888] hover:text-white hover:border-[#333]'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-sans">جميع الوحدات</div>
                <div className="text-[10px] font-mono text-[#666]">ALL BRANCHES</div>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#151515] text-[#00FFD1] border border-[#333]">
                {engineers.length}
              </span>
            </button>

            <button
              onClick={() => {
                setFilterBranch('DER');
                if (onBranchChange && currentBranch !== 'DER') onBranchChange('DER');
              }}
              className={`p-2.5 rounded-lg border text-right transition flex items-center justify-between ${
                filterBranch === 'DER'
                  ? 'bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow'
                  : 'bg-[#0A0A0A] border-[#222] text-[#888] hover:text-white hover:border-[#333]'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-sans text-emerald-400">وحدة ديريك (DER)</div>
                <div className="text-[10px] font-mono text-[#666]">DERIK ENGINEERS</div>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {derikCount}
              </span>
            </button>

            <button
              onClick={() => {
                setFilterBranch('HAS');
                if (onBranchChange && currentBranch !== 'HAS') onBranchChange('HAS');
              }}
              className={`p-2.5 rounded-lg border text-right transition flex items-center justify-between ${
                filterBranch === 'HAS'
                  ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 shadow'
                  : 'bg-[#0A0A0A] border-[#222] text-[#888] hover:text-white hover:border-[#333]'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-sans text-cyan-400">وحدة الحسكة (HAS)</div>
                <div className="text-[10px] font-mono text-[#666]">HASAKAH ENGINEERS</div>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                {hasakahCount}
              </span>
            </button>

            <button
              onClick={() => {
                setFilterBranch('QAM');
                if (onBranchChange && currentBranch !== 'QAM') onBranchChange('QAM');
              }}
              className={`p-2.5 rounded-lg border text-right transition flex items-center justify-between ${
                filterBranch === 'QAM'
                  ? 'bg-amber-950/40 border-amber-400 text-amber-300 shadow'
                  : 'bg-[#0A0A0A] border-[#222] text-[#888] hover:text-white hover:border-[#333]'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-sans text-amber-400">وحدة القامشلي (QAM)</div>
                <div className="text-[10px] font-mono text-[#666]">QAMISHLO ENGINEERS</div>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">
                {qamishloCount}
              </span>
            </button>
          </div>
        </div>

        {/* 4 Departments Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#222]">
          <div className="bg-[#0A0A0A] border border-[#222] p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#888] uppercase">CIVIL // مدني</div>
              <div className="text-base font-bold text-[#00FFD1] font-mono">{civilCount} مهندساً</div>
            </div>
            <span className="text-[10px] font-mono bg-[#151515] text-[#888] px-2 py-0.5 rounded border border-[#222]">
              {engineers.length > 0 ? Math.round((civilCount / engineers.length) * 100) : 0}%
            </span>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222] p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#888] uppercase">ARCH // عمارة</div>
              <div className="text-base font-bold text-[#FFB800] font-mono">{archCount} مهندساً</div>
            </div>
            <span className="text-[10px] font-mono bg-[#151515] text-[#888] px-2 py-0.5 rounded border border-[#222]">
              {engineers.length > 0 ? Math.round((archCount / engineers.length) * 100) : 0}%
            </span>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222] p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#888] uppercase">MECH // ميكانيك</div>
              <div className="text-base font-bold text-[#FF4D00] font-mono">{mechCount} مهندساً</div>
            </div>
            <span className="text-[10px] font-mono bg-[#151515] text-[#888] px-2 py-0.5 rounded border border-[#222]">
              {engineers.length > 0 ? Math.round((mechCount / engineers.length) * 100) : 0}%
            </span>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222] p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#888] uppercase">ELEC // كهرباء</div>
              <div className="text-base font-bold text-[#00E5FF] font-mono">{elecCount} مهندساً</div>
            </div>
            <span className="text-[10px] font-mono bg-[#151515] text-[#888] px-2 py-0.5 rounded border border-[#222]">
              {engineers.length > 0 ? Math.round((elecCount / engineers.length) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#222] text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-[#666] absolute right-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم، المدينة، التخصص، الهاتف..."
              className="w-full bg-[#0A0A0A] text-white font-mono border border-[#333] rounded-lg pr-9 pl-3 py-2 text-xs focus:outline-none focus:border-[#00FFD1] placeholder-[#555]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00FFD1]" />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full bg-[#0A0A0A] text-white font-mono border border-[#333] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00FFD1]"
            >
              <option value="ALL">جميع الأقسام ({engineers.length})</option>
              <option value="مدني">الهندسة المدنية ({civilCount})</option>
              <option value="عمارة">الهندسة المعمارية ({archCount})</option>
              <option value="ميكانيك">الهندسة الميكانيكية ({mechCount})</option>
              <option value="كهرباء">الهندسة الكهربائية ({elecCount})</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterRank}
              onChange={(e) => setFilterRank(e.target.value)}
              className="w-full bg-[#0A0A0A] text-white font-mono border border-[#333] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00FFD1]"
            >
              <option value="ALL">جميع الرتب الهندسية</option>
              <option value="استشاري">استشاري (Consultant)</option>
              <option value="ممارس">ممارس (Practitioner)</option>
              <option value="متدرب">متدرب (Trainee)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterFund}
              onChange={(e) => setFilterFund(e.target.value)}
              className="w-full bg-[#0A0A0A] text-white font-mono border border-[#333] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00FFD1]"
            >
              <option value="ALL">حالة الاشتراك بالصندوق (الكل)</option>
              <option value="داخل">مشترك في الصندوق (داخل - 25%)</option>
              <option value="خارج">غير مشترك (خارج - 10%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#888] font-mono px-1">
        <div>
          عرض <span className="text-[#00FFD1] font-bold">{filteredEngineers.length}</span> من أصل <span className="text-white font-bold">{engineers.length}</span> مهندس معتمد
          {filterBranch !== 'ALL' && (
            <span className="mr-2 text-emerald-400 font-bold">
              [الوحدة المحددة: {filterBranch}]
            </span>
          )}
        </div>
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="text-[#FF4D00] hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>مسح البحث</span>
          </button>
        )}
      </div>

      {/* VIEW 1: Full CSV Table View */}
      {viewMode === 'table' ? (
        <div className="bg-[#151515] rounded-xl border border-[#222] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead className="bg-[#0A0A0A] text-[#888] font-mono text-[11px] border-b border-[#222]">
                <tr>
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">اسم المهندس (Engineer Name)</th>
                  <th className="p-3">الوحدة (Branch)</th>
                  <th className="p-3">القسم والاختصاص</th>
                  <th className="p-3 text-center">الرصيد الشهري</th>
                  <th className="p-3 text-center">النقاط التراكمية (YTD)</th>
                  <th className="p-3 text-center">حالة التميز</th>
                  <th className="p-3 text-center">الرتبة والمؤهل</th>
                  <th className="p-3 text-center">الصندوق</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222] font-mono text-xs">
                {filteredEngineers.map((eng, idx) => {
                  const deptColors: Record<string, { bg: string; text: string; border: string }> = {
                    'مدني': { bg: 'bg-[#00FFD1]/10', text: 'text-[#00FFD1]', border: 'border-[#00FFD1]/30' },
                    'عمارة': { bg: 'bg-[#FFB800]/10', text: 'text-[#FFB800]', border: 'border-[#FFB800]/30' },
                    'ميكانيك': { bg: 'bg-[#FF4D00]/10', text: 'text-[#FF4D00]', border: 'border-[#FF4D00]/30' },
                    'كهرباء': { bg: 'bg-[#00E5FF]/10', text: 'text-[#00E5FF]', border: 'border-[#00E5FF]/30' },
                  };
                  const color = deptColors[eng.department] || { bg: 'bg-[#222]', text: 'text-white', border: 'border-[#333]' };
                  const engBranch = eng.branch || (eng.workCity === 'ديريك' ? 'DER' : eng.workCity === 'القامشلي' ? 'QAM' : 'HAS');

                  return (
                    <tr key={eng.id || idx} className="hover:bg-[#1A1A1A] transition">
                      <td className="p-3 text-center text-[#666] font-bold">
                        {eng.serial || idx + 1}
                      </td>
                      <td className="p-3">
                        <div className="font-sans font-bold text-white text-sm">
                          {eng.fullName}
                        </div>
                        <div className="text-[10px] text-[#777] font-mono flex items-center gap-2 mt-0.5">
                          <span>{eng.workCity}</span>
                          <span>•</span>
                          <span dir="ltr">{eng.phone}</span>
                          {eng.archiveRef && (
                            <>
                              <span>•</span>
                              <span className="text-[#555]">{eng.archiveRef}</span>
                            </>
                          )}
                        </div>
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
                        <span className={`inline-flex px-2.5 py-1 rounded text-[11px] font-sans font-bold border ${color.bg} ${color.text} ${color.border}`}>
                          {eng.department} {eng.specialization && eng.specialization !== eng.department ? `(${eng.specialization})` : ''}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-white text-sm bg-[#0A0A0A] px-2.5 py-1 rounded border border-[#222]">
                          {eng.monthlyPoints ?? eng.points ?? 0}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-[#00FFD1] text-sm bg-[#0A0A0A] px-2.5 py-1 rounded border border-[#222]">
                          {eng.ytdPoints ?? 0}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {eng.highPerformerStatus ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/30">
                            <Sparkles className="w-3 h-3" />
                            <span>{eng.highPerformerStatus}</span>
                          </span>
                        ) : (
                          <span className="text-[#555] text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="text-[11px] font-bold text-white">{eng.rank}</div>
                        <div className="text-[10px] text-[#888] font-sans">{eng.roleQualification}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          eng.fundStatus === 'داخل'
                            ? 'bg-[#00FFD1]/10 text-[#00FFD1] border-[#00FFD1]/30'
                            : 'bg-[#FF4D00]/10 text-[#FF4D00] border-[#FF4D00]/30'
                        }`}>
                          {eng.fundStatus === 'داخل' ? 'داخل (25%)' : 'خارج (10%)'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setEditingEng(eng)}
                          className="bg-[#0A0A0A] hover:bg-[#262626] text-[#00FFD1] border border-[#333] text-[10px] font-bold px-2.5 py-1 rounded transition flex items-center gap-1 mx-auto"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>تعديل</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 2: Profile Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEngineers.map((eng) => {
            const phoneValid = validateAndFormatPhone(eng.phone || '');
            const pointsMax = 500;
            const pointsPct = Math.min(100, Math.round(((eng.ytdPoints || 0) / pointsMax) * 100));
            const engBranch = eng.branch || (eng.workCity === 'ديريك' ? 'DER' : eng.workCity === 'القامشلي' ? 'QAM' : 'HAS');

            return (
              <div 
                key={eng.id}
                className="bg-[#151515] rounded-xl border border-[#222] p-4 hover:border-[#333] transition flex flex-col justify-between space-y-3 shadow-md"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#222] pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#00FFD1] bg-[#0A0A0A] px-1.5 py-0.5 rounded border border-[#333]">
                          #{eng.serial}
                        </span>
                        <h3 className="font-bold text-sm text-white leading-snug">
                          {eng.fullName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                        <span className="text-[#AAA] bg-[#0A0A0A] px-1.5 py-0.5 rounded border border-[#222]">
                          {eng.department}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${
                          engBranch === 'DER'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : engBranch === 'QAM'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-cyan-950 text-cyan-400 border-cyan-800'
                        }`}>
                          {engBranch}
                        </span>
                        <span className="text-[#888] bg-[#0A0A0A] px-1.5 py-0.5 rounded border border-[#222]">
                          {eng.workCity}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      eng.rank === 'استشاري' 
                        ? 'bg-[#222] text-[#00FFD1] border border-[#00FFD1]/40' 
                        : eng.rank === 'ممارس'
                        ? 'bg-[#1A1A1A] text-white border border-[#333]'
                        : 'bg-[#1A1A1A] text-[#FF4D00] border border-[#FF4D00]/40'
                    }`}>
                      {eng.rank}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="pt-2.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[#888]">
                      <span className="font-mono text-[11px]">QUALIFICATION:</span>
                      <span className="font-bold text-white bg-[#0A0A0A] px-2 py-0.5 rounded border border-[#222]">
                        {eng.roleQualification}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#888]">
                      <span className="font-mono text-[11px]">FUND_STATUS:</span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                        eng.fundStatus === 'داخل'
                          ? 'bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/30'
                          : 'bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/30'
                      }`}>
                        {eng.fundStatus === 'داخل' ? 'INSIDE_FUND (25%)' : 'OUTSIDE_FUND (10%)'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#888]">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-[#666]" />
                        <span>PHONE:</span>
                      </span>
                      <span className="font-mono font-semibold text-[#EEE]" dir="ltr">
                        {phoneValid.isValid ? phoneValid.e164 : (eng.phone || '—')}
                      </span>
                    </div>

                    {/* Points Progress */}
                    <div className="pt-1 bg-[#0A0A0A] p-2 rounded-lg border border-[#222]">
                      <div className="flex justify-between text-[11px] font-mono text-[#AAA] mb-1">
                        <span>MONTHLY / YTD:</span>
                        <span className="font-bold text-white">
                          <span className="text-[#00FFD1]">{eng.monthlyPoints ?? 0}</span> / {eng.ytdPoints ?? 0} PTS
                        </span>
                      </div>
                      <div className="w-full bg-[#222] h-1.5 rounded overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00FFD1] to-[#00E5FF] transition-all"
                          style={{ width: `${Math.max(5, pointsPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="border-t border-[#222] pt-2 flex items-center justify-between text-[10px] font-mono text-[#666]">
                  <span>UPDATED: <strong>{eng.lastUpdated || '2026-08-29'}</strong></span>
                  <button
                    onClick={() => setEditingEng(eng)}
                    className="text-[#00FFD1] hover:underline flex items-center gap-1 font-bold"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>EDIT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Engineer Modal */}
      {editingEng && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#333] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00FFD1]" />
                <h3 className="font-bold text-white text-base">
                  تعديل بيانات المهندس المعتمد
                </h3>
              </div>
              <button 
                onClick={() => setEditingEng(null)}
                className="text-[#888] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEngineer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#888] mb-1 font-mono">FULL_NAME:</label>
                <input 
                  type="text" 
                  value={editingEng.fullName}
                  onChange={(e) => setEditingEng({ ...editingEng, fullName: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded p-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888] mb-1 font-mono">DEPARTMENT:</label>
                  <select
                    value={editingEng.department}
                    onChange={(e) => setEditingEng({ ...editingEng, department: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded p-2 text-white font-bold"
                  >
                    <option value="مدني">مدني</option>
                    <option value="عمارة">عمارة</option>
                    <option value="ميكانيك">ميكانيك</option>
                    <option value="كهرباء">كهرباء</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#888] mb-1 font-mono">BRANCH:</label>
                  <select
                    value={editingEng.branch || 'DER'}
                    onChange={(e) => setEditingEng({ ...editingEng, branch: e.target.value as BranchCode })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded p-2 text-white font-bold"
                  >
                    <option value="DER">وحدة ديريك (DER)</option>
                    <option value="HAS">وحدة الحسكة (HAS)</option>
                    <option value="QAM">وحدة القامشلي (QAM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888] mb-1 font-mono">RANK:</label>
                  <select
                    value={editingEng.rank}
                    onChange={(e) => setEditingEng({ ...editingEng, rank: e.target.value as any })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded p-2 text-white font-bold"
                  >
                    <option value="استشاري">استشاري</option>
                    <option value="ممارس">ممارس</option>
                    <option value="متدرب">متدرب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#888] mb-1 font-mono">FUND_STATUS:</label>
                  <select
                    value={editingEng.fundStatus}
                    onChange={(e) => setEditingEng({ ...editingEng, fundStatus: e.target.value as any })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded p-2 text-white font-bold"
                  >
                    <option value="داخل">داخل (25%)</option>
                    <option value="خارج">خارج (10%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888] mb-1 font-mono">MONTHLY_POINTS:</label>
                  <input 
                    type="number" 
                    value={editingEng.monthlyPoints ?? 0}
                    onChange={(e) => setEditingEng({ ...editingEng, monthlyPoints: Number(e.target.value) })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[#888] mb-1 font-mono">YTD_POINTS:</label>
                  <input 
                    type="number" 
                    value={editingEng.ytdPoints ?? 0}
                    onChange={(e) => setEditingEng({ ...editingEng, ytdPoints: Number(e.target.value) })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded p-2 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888] mb-1 font-mono">PHONE:</label>
                  <input 
                    type="text" 
                    value={editingEng.phone || ''}
                    onChange={(e) => setEditingEng({ ...editingEng, phone: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#888] mb-1 font-mono">WORK_CITY:</label>
                  <input 
                    type="text" 
                    value={editingEng.workCity || ''}
                    onChange={(e) => setEditingEng({ ...editingEng, workCity: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setEditingEng(null)}
                  className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded font-mono font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-[#00FFD1] hover:bg-[#00e5bc] text-black px-5 py-2 rounded font-mono font-bold"
                >
                  SAVE_CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
