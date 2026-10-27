import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Database, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsView: React.FC = () => {
  const [aiStatus, setAiStatus] = useState<{
    ai_configured: boolean;
    provider: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    api.getAIStatus().then(setAiStatus).catch(console.error);
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-900">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span>Administration</span>
          <span>/</span>
          <span className="text-slate-200 font-medium">Platform Governance</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System & AI Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage AI isolation boundaries, deterministic heuristics, storage quotas, and security invariants.
        </p>
      </div>

      {/* AI Integration & Privacy Isolation Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-950/80 border border-violet-800/40 flex items-center justify-center text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Assistance Isolation Layer</h2>
              <div className="text-xs text-slate-400">Google Gemini Developer API (Server-Side Proxy)</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {aiStatus?.ai_configured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>API KEY CONFIGURED</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>DETERMINISTIC FALLBACK ACTIVE</span>
              </span>
            )}
          </div>
        </div>

        {/* Anti-Leakage & Privacy Contract */}
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-850 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Strict Zero-Leakage Data Protection Contract:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Raw dataset rows are NEVER transmitted to external models by default.</li>
            <li>Only minimized, aggregated defect descriptors (e.g. "Column 'department' has 3 casing variants") are passed to the AI summarizer.</li>
            <li>All AI suggestions are treated as non-authoritative hypotheses; repairs require human approval.</li>
            <li>Fixora functions with 100% feature completeness even with zero AI API keys configured.</li>
          </ul>
        </div>
      </div>

      {/* Storage & Limits */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Storage & Engine Thresholds</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded border border-slate-850">
            <span className="text-slate-500">Max File Upload Limit</span>
            <div className="text-base font-bold text-white tabular-nums mt-0.5">25 MB (CSV/XLSX)</div>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-850">
            <span className="text-slate-500">Outlier Detection Method</span>
            <div className="text-base font-bold text-cyan-400 mt-0.5">IQR [Q1 - 1.5×IQR, Q3 + 1.5×IQR]</div>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-850">
            <span className="text-slate-500">Security Architecture</span>
            <div className="text-base font-bold text-emerald-400 uppercase mt-0.5">Immutable Append-Only</div>
          </div>
        </div>
      </div>

      {/* Scoring Weights */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-white">Quality Reliability Model Formula</h2>
        <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-950 p-3 rounded border border-slate-850">
          Overall Score = 0.30 × Completeness + 0.30 × Validity + 0.20 × Consistency + 0.20 × Uniqueness
        </p>
        <p className="text-xs text-slate-500">
          Formula excludes inapplicable dimensions rather than treating them as perfect, preventing inflated scores.
        </p>
      </div>

    </div>
  );
};
