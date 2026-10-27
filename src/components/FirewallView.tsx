import React, { useState } from 'react';
import { 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  Upload, 
  AlertOctagon, 
  X, 
  FileSpreadsheet, 
  Lock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Dataset, FirewallCheckResult } from '../types/fixora';
import { api } from '../services/api';

interface FirewallViewProps {
  dataset: Dataset | null;
  onRefreshAudit: () => void;
}

export const FirewallView: React.FC<FirewallViewProps> = ({ dataset, onRefreshAudit }) => {
  const [testFile, setTestFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<FirewallCheckResult | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState(false);

  const handleTestIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataset) return;
    setIsValidating(true);
    setResult(null);
    setOverrideSuccess(false);

    try {
      const formData = new FormData();
      formData.append('target_dataset_id', dataset.id);
      if (testFile) {
        formData.append('file', testFile);
      }

      const res = await api.testFirewall(formData);
      setResult(res.firewall_result);
    } catch (err) {
      console.error('Firewall validation failed', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleOverride = async () => {
    if (!result || !overrideReason.trim()) return;
    setIsOverriding(true);
    try {
      await api.overrideQuarantine((result as any).holding_id || 'quarantine_active', overrideReason);
      setOverrideSuccess(true);
      setResult({
        ...result,
        status: 'passed',
        is_held_in_quarantine: false,
        overridden_by: 'Authorized Investigator',
        override_reason: overrideReason
      });
      onRefreshAudit();
    } catch (err) {
      console.error('Override failed', err);
    } finally {
      setIsOverriding(false);
    }
  };

  if (!dataset) {
    return <div className="p-8 text-center text-slate-400">No dataset selected.</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Pre-Flight Ingestion Gate</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">Data Reliability Firewall</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ingestion Firewall & Quarantine Gate</h1>
          <p className="text-xs text-slate-400 mt-1">
            Validate incoming batch files against active schema assertions and domain bounds before granting pipeline entry.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs font-mono text-cyan-400 self-start sm:self-auto">
          Profile: {dataset.name}
        </div>
      </div>

      {/* Test Runner Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white">Pre-Flight Batch Ingestion Test</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a candidate batch file to test schema conformance and critical constraints, or run a simulated test batch.
          </p>
        </div>

        <form onSubmit={handleTestIngest} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setTestFile(e.target.files?.[0] || null)}
            className="w-full sm:w-auto text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
          />

          <button
            type="submit"
            disabled={isValidating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isValidating ? 'Validating Batch...' : (testFile ? 'Execute Ingest Inspection' : 'Run Simulated Defect Batch')}</span>
          </button>
        </form>
      </div>

      {/* Validation Result Inspection */}
      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Pre-Flight Inspection Verdict</h2>
            <span className="font-mono text-xs text-slate-400">File: {result.file_name}</span>
          </div>

          {/* Verdict Banner */}
          <div className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            result.status === 'passed' 
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' 
              : 'bg-rose-950/50 border-rose-850 text-rose-200'
          }`}>
            <div className="flex items-start gap-3">
              {result.status === 'passed' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-base font-bold text-white">
                  {result.status === 'passed' ? 'PASSED · Batch Approved for Ingest' : 'HELD IN QUARANTINE · Critical Invariants Failed'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {result.quarantine_reason || 'Batch satisfies all expected schema constraints and validation invariants.'}
                </p>
                {result.overridden_by && (
                  <div className="text-[11px] text-cyan-300 font-mono mt-2">
                    Authorized Override by: {result.overridden_by} · Reason: "{result.override_reason}"
                  </div>
                )}
              </div>
            </div>

            <div className="text-right sm:text-right shrink-0 font-mono">
              <div className="text-xs text-slate-400">Critical Violations</div>
              <div className="text-2xl font-bold tabular-nums text-white mt-0.5">{result.critical_violations_count}</div>
            </div>
          </div>

          {/* Violations List */}
          {result.violations.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-semibold text-white">Intercepted Rule Violations:</h3>
              <div className="space-y-2">
                {result.violations.map((v, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded border border-slate-850 flex items-start gap-3 text-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-white">{v.rule_name}</span>
                        <span className="text-[10px] text-rose-400 uppercase font-semibold">{v.severity}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5 font-mono">{v.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authorized Override Drawer if Quarantined */}
          {result.is_held_in_quarantine && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Lock className="w-4 h-4" />
                <span>Authorized Investigator Override Gate</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                If this file contains known exceptions or backdated records, an authorized investigator may manually override the quarantine gate. A permanent, non-repudiable audit event will be recorded.
              </p>

              <div className="space-y-2 text-xs">
                <label className="block font-medium text-slate-300">Mandatory Override Justification / Reason</label>
                <textarea
                  rows={2}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Approved by Dean of Admissions for manual verification of provisional transfer cohort..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <button
                onClick={handleOverride}
                disabled={isOverriding || !overrideReason.trim()}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
              >
                {isOverriding ? 'Logging Override...' : 'Confirm Authorized Override & Ingest'}
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
