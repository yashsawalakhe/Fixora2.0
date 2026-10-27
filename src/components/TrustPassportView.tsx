import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  Download, 
  Printer, 
  Hash, 
  Lock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  History,
  FileSpreadsheet,
  QrCode
} from 'lucide-react';
import { Dataset, TrustPassport } from '../types/fixora';
import { api } from '../services/api';

interface TrustPassportViewProps {
  dataset: Dataset | null;
}

export const TrustPassportView: React.FC<TrustPassportViewProps> = ({ dataset }) => {
  const [passport, setPassport] = useState<TrustPassport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadPassport = async () => {
    if (!dataset) return;
    setLoading(true);
    try {
      const res = await api.generatePassport(dataset.id, dataset.current_version_id);
      setPassport(res.passport);
    } catch (err) {
      console.error('Failed to load trust passport', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPassport();
  }, [dataset?.id, dataset?.current_version_id]);

  const handlePrint = () => {
    window.print();
  };

  if (!dataset) {
    return <div className="p-8 text-center text-slate-400">No dataset selected.</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Audit & Verification</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">Empirical Trust Passport</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dataset Trust Passport Certificate</h1>
          <p className="text-xs text-slate-400 mt-1">
            Cryptographically sealed report of quality dimensions, heuristic checks performed, and full audit provenance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Certificate</span>
          </button>

          <button
            onClick={loadPassport}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Re-issuing...' : 'Re-issue Passport'}</span>
          </button>
        </div>
      </div>

      {/* Verifiable Certificate Document Container */}
      {passport && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden font-sans space-y-8">
          
          {/* Subtle Security Guilloche Background Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/5 via-violet-500/5 to-transparent pointer-events-none rounded-bl-full" />

          {/* Certificate Header Lockup */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-800 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-violet-900/40 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 tracking-wider uppercase mb-1">
                  <span>Fixora Data Reliability Protocol</span>
                  <span>·</span>
                  <span>Version {passport.version_number}</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">{passport.dataset_name}</h2>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Report ID: <span className="text-slate-200">{passport.report_id}</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Stamp */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-right sm:text-right shrink-0">
              <div className="text-[10px] font-mono text-slate-500 uppercase">SHA-256 Provenance Fingerprint</div>
              <div className="text-xs font-mono text-cyan-300 font-semibold tracking-wider mt-0.5">
                {passport.report_hash.slice(0, 16)}...{passport.report_hash.slice(-8)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Issued: {new Date(passport.generated_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Quality Score Hero Block */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/70 border border-slate-850 rounded-lg p-5">
            <div className="border-r border-slate-850 pr-4">
              <div className="text-xs text-slate-400 font-medium">Empirical Quality Index</div>
              <div className="text-4xl font-black font-mono tabular-nums text-white mt-1">
                {passport.quality_score}%
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">
                Verified against 6 inspection rules
              </div>
            </div>

            <div className="col-span-3 space-y-2">
              <div className="text-xs font-semibold text-slate-300 mb-1">Dimension Vector Breakdown:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Completeness</span>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">{passport.score_details.completeness}%</div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Validity</span>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">{passport.score_details.validity}%</div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Consistency</span>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">{passport.score_details.consistency}%</div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px]">Uniqueness</span>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">{passport.score_details.uniqueness}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scope & Audit Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded border border-slate-850">
              <span className="text-slate-500">Total Records</span>
              <div className="text-base font-bold text-white tabular-nums mt-0.5">{passport.total_records}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-850">
              <span className="text-slate-500">Columns Profiled</span>
              <div className="text-base font-bold text-white tabular-nums mt-0.5">{passport.total_columns}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-850">
              <span className="text-slate-500">Approved Transformations</span>
              <div className="text-base font-bold text-emerald-400 tabular-nums mt-0.5">{passport.approved_repairs_count}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-850">
              <span className="text-slate-500">Remaining Findings</span>
              <div className="text-base font-bold text-amber-400 tabular-nums mt-0.5">{passport.remaining_unresolved_count}</div>
            </div>
          </div>

          {/* Finding Inventory by Severity & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-slate-850 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Findings by Severity Classification</h4>
              <div className="space-y-1.5 text-xs font-mono">
                {Object.entries(passport.issue_counts_by_severity).map(([sev, count]) => (
                  <div key={sev} className="flex justify-between items-center text-slate-400">
                    <span className="capitalize">{sev}:</span>
                    <span className="text-white font-semibold tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-850 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Findings by Defect Category</h4>
              <div className="space-y-1.5 text-xs font-mono">
                {Object.entries(passport.issue_counts_by_category).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between items-center text-slate-400">
                    <span className="capitalize">{cat.replace('_', ' ')}:</span>
                    <span className="text-white font-semibold tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Governance & Limitations Statement */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-xs space-y-2">
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Known Audit Limitations & Compliance Statement</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              This Trust Passport reflects the empirical checks and reproducible verification rules executed at generation time. In accordance with Fixora's Core Principles, this report does not claim universal perfection or external pipeline infallibility.
            </p>
            <ul className="list-disc pl-5 space-y-0.5 text-slate-400 text-[11px]">
              {passport.known_limitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>

          {/* Footer Provenance Seal */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
            <div>
              <span>Source File: {passport.provenance.original_filename}</span>
              {passport.provenance.parent_version && (
                <span className="ml-2">· Derived From: {passport.provenance.parent_version}</span>
              )}
            </div>
            <div className="text-slate-400 font-semibold">
              Auditor: {passport.provenance.created_by}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
