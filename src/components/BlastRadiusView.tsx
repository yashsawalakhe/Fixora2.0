import React, { useState } from 'react';
import { 
  GitFork, 
  ArrowRight, 
  Layers, 
  CheckCircle, 
  FileText, 
  AlertTriangle, 
  RefreshCw,
  Cpu
} from 'lucide-react';
import { Dataset, BlastRadiusAnalysis } from '../types/fixora';
import { FixoraDataEngine } from '../../server/engine';

interface BlastRadiusViewProps {
  dataset: Dataset | null;
  onNavigateToRepair: () => void;
}

export const BlastRadiusView: React.FC<BlastRadiusViewProps> = ({
  dataset,
  onNavigateToRepair
}) => {
  const [targetColumn, setTargetColumn] = useState<string>('department');

  // Generate dynamic analysis based on selected column
  const mockScenario = {
    id: 'scen_active',
    dataset_id: dataset?.id || 'ds1',
    dataset_version_id: dataset?.current_version_id || 'ver1',
    name: `Repair of ${targetColumn}`,
    strategy: 'canonical_normalization' as const,
    target_columns: [targetColumn],
    parameters: {},
    assumptions: ['Downstream formula bindings recalculated upon version promotion.'],
    risk_level: 'low' as const,
    affected_records_count: targetColumn === 'department' ? 4 : targetColumn === 'package_lpa' ? 3 : 2,
    unresolved_issues_count: 5,
    new_warnings: ['Downstream reporting dashboards will reflect consolidated categories.'],
    estimated_score_before: 84,
    estimated_score_after: 92,
    transformations_summary: `Harmonize ${targetColumn}`,
    diff_preview: [],
    created_at: new Date().toISOString(),
    status: 'simulated' as const
  };

  const analysis: BlastRadiusAnalysis = FixoraDataEngine.analyzeBlastRadius([], mockScenario);

  if (!dataset) {
    return <div className="p-8 text-center text-slate-400">No dataset selected.</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Dependency Model</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">{dataset.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Blast-Radius Dependency Map</h1>
          <p className="text-xs text-slate-400 mt-1">
            Predict downstream ripple effects across calculated fields, aggregations, validation rules, and reports.
          </p>
        </div>

        {/* Target Column Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 self-start sm:self-auto">
          <span className="text-xs text-slate-400">Inspect Impact for:</span>
          <select
            value={targetColumn}
            onChange={(e) => setTargetColumn(e.target.value)}
            className="bg-transparent text-xs font-mono font-medium text-cyan-400 focus:outline-hidden cursor-pointer"
          >
            <option value="department" className="bg-slate-900 text-white">department (Casing & Placement Rates)</option>
            <option value="package_lpa" className="bg-slate-900 text-white">package_lpa (Salary Aggregates & NIRF)</option>
            <option value="student_id" className="bg-slate-900 text-white">student_id (Key Integrity & Roster)</option>
          </select>
        </div>
      </div>

      {/* KPI Impact Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Directly Impacted Records</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {analysis.direct_records_affected}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cells undergoing modification</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Derived Metrics Requiring Recomputation</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400">
            {analysis.affected_derived_metrics.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Formulas bound to this attribute</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Recomputation Overhead</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 uppercase">
            {analysis.recomputation_effort}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Sub-second incremental re-index</div>
        </div>
      </div>

      {/* Interactive Topology Graph */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Dependency Flow & Ripple Graph</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing how modifications in <code className="text-cyan-400 font-mono">{targetColumn}</code> propagate through business logic.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">DAG Invariants Enforced</span>
        </div>

        {/* Nodes Visual Flow */}
        <div className="p-6 bg-slate-950/80 rounded-lg border border-slate-850">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            
            {/* Stage 1: Source Attribute */}
            <div className="bg-slate-900 border-2 border-cyan-500/80 rounded-lg p-4 text-center">
              <div className="text-[10px] text-cyan-400 font-mono uppercase font-bold tracking-wider">
                Primary Column
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {targetColumn}
              </div>
              <div className="text-[10px] text-slate-400 mt-2">
                Origin point of simulated repair
              </div>
            </div>

            {/* Stage 2: Derived Formulas */}
            <div className="space-y-3">
              <div className="text-[10px] text-slate-500 font-mono text-center">COMPUTES VIA FORMULA</div>
              {analysis.affected_derived_metrics.slice(0, 2).map((metric, i) => (
                <div key={i} className="bg-slate-900/90 border border-slate-800 rounded-md p-3 text-left">
                  <div className="text-xs font-semibold text-white font-mono">{metric.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{metric.formula}</div>
                </div>
              ))}
            </div>

            {/* Stage 3: Validation Invariants */}
            <div className="space-y-3">
              <div className="text-[10px] text-slate-500 font-mono text-center">GOVERNED BY RULES</div>
              {analysis.related_validation_rules.map((rule, i) => (
                <div key={i} className="bg-slate-900/90 border border-slate-800 rounded-md p-3 text-left">
                  <div className="text-xs font-semibold text-violet-300 font-mono">{rule}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Schema assertion active</div>
                </div>
              ))}
            </div>

            {/* Stage 4: Downstream Reports */}
            <div className="space-y-3">
              <div className="text-[10px] text-slate-500 font-mono text-center">DOWNSTREAM CONSUMERS</div>
              {analysis.dependent_reports.map((rep, i) => (
                <div key={i} className="bg-slate-900/90 border border-emerald-900/60 rounded-md p-3 text-left">
                  <div className="text-xs font-semibold text-emerald-300">{rep}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Table export artifact</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Detailed Impact Ledger */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Specific Metric Deltas:</h3>
          <div className="divide-y divide-slate-850 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60">
            {analysis.affected_derived_metrics.map((m, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-white font-mono">{m.name}</div>
                  <div className="text-slate-400 mt-0.5">{m.impact_description}</div>
                </div>
                <div className="flex items-center gap-3 font-mono shrink-0">
                  <div className="text-slate-500 line-through">{m.current_value}</div>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  <div className="text-emerald-400 font-semibold">{m.simulated_value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
