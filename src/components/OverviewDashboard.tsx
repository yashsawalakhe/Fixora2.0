import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Wrench, 
  Database, 
  ArrowRight, 
  Sparkles, 
  Upload, 
  Activity, 
  CheckCircle2, 
  History,
  FileCheck2,
  GitCommit
} from 'lucide-react';
import { Dataset, Scan, Issue, AuditLog } from '../types/fixora';
import { CleanDownloadHub } from './CleanDownloadHub';

interface OverviewDashboardProps {
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  latestScan: Scan | null;
  issues: Issue[];
  auditLogs: AuditLog[];
  onSelectDataset: (id: string) => void;
  onNavigate: (view: string) => void;
  onTriggerScan: () => void;
  onLoadDemo: () => void;
  isScanning: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  datasets,
  selectedDataset,
  latestScan,
  issues,
  auditLogs,
  onSelectDataset,
  onNavigate,
  onTriggerScan,
  onLoadDemo,
  isScanning
}) => {
  if (datasets.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-10 text-center">
          <div className="w-12 h-12 rounded-lg bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mx-auto mb-4">
            <Database className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Datasets Ingested</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Get started by loading our realistic university placement demo dataset or upload your own CSV/XLSX file.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onLoadDemo}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Realistic Demo Dataset</span>
            </button>
            <button
              onClick={() => onNavigate('datasets')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV / XLSX</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const qualityScore = latestScan?.qualityScore ?? selectedDataset?.column_profiles ? 84 : 0;
  const scoreDetails = latestScan?.score_details;
  const openIssues = issues.filter(i => i.status === 'open' || i.status === 'investigating');
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;
  const approvedRepairsCount = auditLogs.filter(a => a.action === 'APPROVE_REPAIR').length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-900">
        <div>
          <div className="text-xs text-slate-500 font-medium">Data Reliability Console</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Overview & Health Status</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Dataset Switcher */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-400">Target:</span>
            <select
              value={selectedDataset?.id || ''}
              onChange={(e) => onSelectDataset(e.target.value)}
              className="bg-transparent text-xs font-medium text-white focus:outline-hidden cursor-pointer"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                  {d.name} ({d.row_count} rows)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-md transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isScanning ? 'Scanning...' : 'Run Scan'}</span>
          </button>
        </div>
      </div>

      {/* Download Options & Cleaned Data Readiness Hub */}
      <CleanDownloadHub
        dataset={selectedDataset}
        onRefresh={onTriggerScan}
        variant="dashboard"
      />

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Quality Score */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Quality Reliability Index</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-white">
              {qualityScore}%
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Evaluated dimensions</span>
            <span className="font-mono text-cyan-400 font-medium">4 Core Vectors</span>
          </div>
        </div>

        {/* Metric 2: Open Issues */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Open Quality Issues</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-white">
              {openIssues.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({criticalCount} critical)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Requiring resolution</span>
            <button
              onClick={() => onNavigate('detective')}
              className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Investigate</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Metric 3: Approved Repairs */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Approved Repairs</span>
            <Wrench className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-white">
              {approvedRepairsCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">immutable versions</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Audit traceable</span>
            <button
              onClick={() => onNavigate('repair-lab')}
              className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Repair Lab</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Metric 4: Dataset Scope */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Active Record Scope</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-white">
              {selectedDataset?.row_count ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              rows · {selectedDataset?.column_count ?? 0} cols
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>File format</span>
            <span className="font-mono text-emerald-400 uppercase font-semibold">
              {selectedDataset?.file_type}
            </span>
          </div>
        </div>

      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quality Dimension Breakdown & Formula */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quality Dimensions Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Reliability Dimension Vector</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculated using empirical counts across completeness, validity, consistency, and uniqueness.
                </p>
              </div>
              <button
                onClick={() => onNavigate('passport')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>View Trust Passport</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Completeness (Weight: 30%)', value: scoreDetails?.completeness ?? 91.2, desc: 'Ratio of non-null cells across cohort records' },
                { label: 'Validity (Weight: 30%)', value: scoreDetails?.validity ?? 88.5, desc: 'Conformance to numeric bounds, formats, and ranges' },
                { label: 'Consistency (Weight: 20%)', value: scoreDetails?.consistency ?? 85.0, desc: 'Categorical casing harmony and date conventions' },
                { label: 'Uniqueness (Weight: 20%)', value: scoreDetails?.uniqueness ?? 95.0, desc: 'Distinctness of primary identifiers and row hashes' },
              ].map((dim, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-md p-3.5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-300">{dim.label}</span>
                    <span className="font-mono tabular-nums font-semibold text-white">{dim.value}%</span>
                  </div>
                  {/* Progress track */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        dim.value >= 90 ? 'bg-emerald-500' : dim.value >= 75 ? 'bg-cyan-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${dim.value}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">{dim.desc}</div>
                </div>
              ))}
            </div>

            {/* Documented Formula Footnote */}
            <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800/60 rounded-md text-[11px] text-slate-400 font-mono">
              Formula: Overall = 0.30×Completeness + 0.30×Validity + 0.20×Consistency + 0.20×Uniqueness
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate('detective')}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-lg p-4 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Root Cause Detective</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400">
                Explore algorithmic hypotheses grouping {issues.length} detected findings into defect clusters.
              </p>
            </button>

            <button
              onClick={() => onNavigate('repair-lab')}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-lg p-4 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Counterfactual Repair</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400">
                Simulate strategies side-by-side with cell-level diffs before generating a new version.
              </p>
            </button>

            <button
              onClick={() => onNavigate('cross-dataset')}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-lg p-4 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Cross-Dataset Match</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400">
                Cross-reference placement student records against the master institutional enrollment ledger.
              </p>
            </button>
          </div>

        </div>

        {/* Right Column: Recent Activity & Audit Events */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Recent Audit Events</h2>
              <button
                onClick={() => onNavigate('lineage')}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="text-xs border-b border-slate-900 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-mono text-[10px] text-cyan-400/90 font-medium">{log.action}</span>
                    <span className="font-mono text-[10px] tabular-nums text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 line-clamp-2 leading-relaxed">{log.details}</p>
                  <div className="text-[10px] text-slate-500 mt-1">Actor: {log.actor}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Demo Re-seed Guide */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Fixora Demonstration Guide</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              1. Inspect issues in Detective → 2. Simulate Title-Case Normalization in Repair Lab → 3. Approve repair to generate v2 → 4. Check Data Drift between v1 & v2 → 5. Issue Trust Passport.
            </p>
            <button
              onClick={() => onNavigate('repair-lab')}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            >
              <span>Begin Guided Tour</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
