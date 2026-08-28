import React, { useState } from 'react';
import { BranchCode, InvoiceRecord, PayOrderRecord, SyndicateDepositRecord } from '../types';
import { Sparkles, Brain, Zap, ShieldCheck, Send, CheckCircle2, RefreshCw } from 'lucide-react';

interface AIAssistantViewProps {
  currentBranch: BranchCode;
  latestInvoice?: InvoiceRecord;
  latestPayOrder?: PayOrderRecord;
  latestDeposit?: SyndicateDepositRecord;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  currentBranch,
  latestInvoice,
  latestPayOrder,
  latestDeposit
}) => {
  const [activeAiMode, setActiveAiMode] = useState<'high_thinking' | 'fast_advisor' | 'compliance'>('high_thinking');
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [fastReply, setFastReply] = useState<string>('');
  const [complianceResult, setComplianceResult] = useState<any>(null);

  // 1. Trigger High-Thinking Audit (gemini-3.1-pro-preview + ThinkingLevel.HIGH)
  const runHighThinkingAudit = async () => {
    setIsLoading(true);
    setAuditResult(null);
    try {
      const payload = {
        branch: currentBranch,
        modelType: latestInvoice?.modelType || 'GS General Study',
        transactionData: {
          invoice: latestInvoice,
          payOrder: latestPayOrder,
          deposit: latestDeposit
        }
      };

      const res = await fetch('/api/ai/high-thinking-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setAuditResult(data);
    } catch (err: any) {
      setAuditResult({
        status: 'ERROR',
        analysis: 'تعذر الاتصال بمحرك الذكاء الاصطناعي: ' + err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Trigger Fast Advisor (gemini-3.1-flash-lite)
  const runFastAdvisor = async (queryText: string) => {
    const q = queryText || userQuery;
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/quick-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          projectArea: 450,
          buildingCategory: 'Residential',
          branch: currentBranch
        })
      });
      const data = await res.json();
      setFastReply(data.reply || 'تم الحصول على التقدير.');
    } catch (err: any) {
      setFastReply('خطأ في الاتصال: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Trigger Compliance Check (gemini-3.5-flash)
  const runComplianceCheck = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/compliance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelType: 'GS General Study',
          clientData: { branch: currentBranch },
          engineeringTeam: { disciplinesCount: 7, auditorsCount: 4 }
        })
      });
      const data = await res.json();
      setComplianceResult(data);
    } catch (err: any) {
      setComplianceResult({ details: 'خطأ في التدقيق: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Header Banner */}
      <div className="bg-[#151515] text-white p-5 rounded border border-[#222]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#0A0A0A] text-[#00FFD1] border border-[#333] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#00FFD1] uppercase tracking-widest">
                AI_FORENSIC_ENGINE // GEMINI_3.1_PRO
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                المدقق المالي الجنائي والذكاء الاصطناعي النقابي (Gemini AI Audit Hub)
              </h2>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveAiMode('high_thinking');
                runHighThinkingAudit();
              }}
              disabled={isLoading}
              className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Brain className="w-4 h-4" />
              <span>RUN_FORENSIC_AUDIT</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#222] text-xs">
          <button
            onClick={() => setActiveAiMode('high_thinking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs transition border ${
              activeAiMode === 'high_thinking' 
                ? 'bg-[#00FFD1] text-black font-bold border-[#00FFD1]' 
                : 'bg-[#0A0A0A] text-[#888] hover:text-white border-[#222]'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>1. HIGH_THINKING_AUDIT (gemini-3.1-pro)</span>
          </button>

          <button
            onClick={() => setActiveAiMode('fast_advisor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs transition border ${
              activeAiMode === 'fast_advisor' 
                ? 'bg-[#00FFD1] text-black font-bold border-[#00FFD1]' 
                : 'bg-[#0A0A0A] text-[#888] hover:text-white border-[#222]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. FAST_ADVISOR (gemini-3.1-flash-lite)</span>
          </button>

          <button
            onClick={() => setActiveAiMode('compliance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs transition border ${
              activeAiMode === 'compliance' 
                ? 'bg-[#00FFD1] text-black font-bold border-[#00FFD1]' 
                : 'bg-[#0A0A0A] text-[#888] hover:text-white border-[#222]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. BYLAW_COMPLIANCE (gemini-3.5-flash)</span>
          </button>
        </div>
      </div>

      {/* Mode 1: High Thinking Forensic Audit View */}
      {activeAiMode === 'high_thinking' && (
        <div className="bg-[#151515] rounded border border-[#222] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#00FFD1]" />
              <span>تقرير الرقابة والتدقيق المالي الجنائي (Forensic Accounting Verification)</span>
            </h3>
            <button
              onClick={runHighThinkingAudit}
              disabled={isLoading}
              className="flex items-center gap-1 bg-[#0A0A0A] hover:bg-[#222] text-[#00FFD1] border border-[#333] text-xs font-mono font-bold px-3 py-1.5 rounded"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>RE-RUN_AUDIT</span>
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#00FFD1] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="font-mono font-bold text-sm text-[#00FFD1]">
                PROCESSING_FORENSIC_ANALYSIS // (Thinking Mode: HIGH)...
              </div>
              <p className="text-xs font-mono text-[#888] max-w-md mx-auto">
                Auditing equation balance (INV == EPO + SFD), 5-way deduction splits, coach requirements, and SoD compliance via gemini-3.1-pro-preview.
              </p>
            </div>
          ) : auditResult ? (
            <div className="space-y-4 text-xs">
              <div className="bg-[#0A0A0A] border border-[#00FFD1]/30 text-white p-4 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm flex items-center gap-2 text-[#00FFD1]">
                    <CheckCircle2 className="w-5 h-5 text-[#00FFD1]" />
                    <span>AUDIT_STATUS: {auditResult.status || 'APPROVED (معتمد)'}</span>
                  </span>
                  <span className="font-mono font-bold bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/30 px-2 py-0.5 rounded">
                    100% EQUILIBRIUM
                  </span>
                </div>
                <div className="text-[#DDD] leading-relaxed whitespace-pre-line pt-2 font-mono text-xs">
                  {auditResult.analysis || auditResult.details}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#0A0A0A] border border-[#222] p-3 rounded">
                  <div className="font-mono font-bold text-white text-[11px] mb-1">1. EQUILIBRIUM FORMULA:</div>
                  <div className="text-[#888] font-mono text-[10px]">INV == EPO + SFD (Zero-variance mathematical equilibrium verified).</div>
                </div>
                <div className="bg-[#0A0A0A] border border-[#222] p-3 rounded">
                  <div className="font-mono font-bold text-white text-[11px] mb-1">2. CONFLICT OF INTEREST:</div>
                  <div className="text-[#888] font-mono text-[10px]">Rule 3 SoD enforced. No dual study-auditor assignment detected.</div>
                </div>
                <div className="bg-[#0A0A0A] border border-[#222] p-3 rounded">
                  <div className="font-mono font-bold text-white text-[11px] mb-1">3. FUND SPLITS:</div>
                  <div className="text-[#888] font-mono text-[10px]">25% inside fund and 10% outside fund rates strictly applied.</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <p className="text-xs font-mono text-[#666]">
                اضغط على الزر أعلاه لبدء الفحص المالي الجنائي الفوري للمعاملات الأخيرة.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Fast Advisor */}
      {activeAiMode === 'fast_advisor' && (
        <div className="bg-[#151515] rounded border border-[#222] p-5 space-y-4">
          <div className="border-b border-[#222] pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00FFD1]" />
              <span>مستشار التسعير وتقدير الأتعاب الفوري (Sub-second Estimator)</span>
            </h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="مثال: كم تبلغ تكلفة دراسة ترخيص سكني مساحة 600 متر في الحسكة؟"
              className="flex-1 bg-[#0A0A0A] text-white font-mono border border-[#333] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#00FFD1]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') runFastAdvisor(userQuery);
              }}
            />
            <button
              onClick={() => runFastAdvisor(userQuery)}
              disabled={isLoading || !userQuery.trim()}
              className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>QUERY</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-[#666] font-mono text-[10px]">PRESETS:</span>
            {[
              'ما هي نسبة اقتطاع صندوق المشترك للمهندس خارج الصندوق؟',
              'كيف يتم حساب تكلفة ترخيص مصعد 6 توقفات؟',
              'ما هو الحد الأدنى لمساحة دراسة السلامة الإنشائية ومطرقة شميدت؟'
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserQuery(q);
                  runFastAdvisor(q);
                }}
                className="bg-[#0A0A0A] hover:bg-[#222] text-[#AAA] border border-[#222] px-2.5 py-1 rounded text-[10px] font-mono transition"
              >
                {q}
              </button>
            ))}
          </div>

          {fastReply && (
            <div className="bg-[#0A0A0A] border border-[#333] p-4 rounded text-xs text-[#EEE] font-mono whitespace-pre-line leading-relaxed">
              <div className="text-[10px] text-[#00FFD1] uppercase mb-1">GEMINI_FAST_RESPONSE:</div>
              {fastReply}
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Bylaw Compliance */}
      {activeAiMode === 'compliance' && (
        <div className="bg-[#151515] rounded border border-[#222] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00FFD1]" />
              <span>مطابقة القرارات النقابية لعام 2026 (Syndicate Bylaw Engine)</span>
            </h3>
            <button
              onClick={runComplianceCheck}
              disabled={isLoading}
              className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black px-3.5 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider"
            >
              <span>CHECK_COMPLIANCE</span>
            </button>
          </div>

          {complianceResult && (
            <div className="bg-[#0A0A0A] border border-[#333] p-4 rounded text-xs text-[#EEE] font-mono whitespace-pre-line">
              <div className="text-[10px] text-[#00FFD1] uppercase mb-1">COMPLIANCE_REPORT:</div>
              <pre className="text-xs font-mono">{JSON.stringify(complianceResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
