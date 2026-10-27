import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  History, 
  HelpCircle, 
  FileDiff,
  Sparkles,
  GitCommit,
  XCircle,
  Eye
} from 'lucide-react';
import { Dataset, RepairScenario, CellDiff, RepairStrategyType } from '../types/fixora';
import { api } from '../services/api';

interface RepairLabProps {
  dataset: Dataset | null;
  initialStrategy?: string;
  onNavigateToLineage: () => void;
  onRefreshDataset: () => void;
}

export const RepairLab: React.FC<RepairLabProps> = ({
  dataset,
  initialStrategy = 'canonical_normalization',
  onNavigateToLineage,
  onRefreshDataset
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<RepairStrategyType>(
    (initialStrategy as RepairStrategyType) || 'canonical_normalization'
  );
  const [targetColumns, setTargetColumns] = useState<string[]>(['department', 'offer_date']);
  const [scenarioName, setScenarioName] = useState('Canonical Title-Case & Date Standardization');
  const [activeScenario, setActiveScenario] = useState<RepairScenario | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState<{
    newVersionNumber: number;
    diffsApplied: number;
  } | null>(null);

  // Available strategies catalogue
  const strategies = [
    {
      id: 'canonical_normalization',
      label: 'Canonical Normalization',
      badge: 'Recommended',
      description: 'Standardize non-uniform casing (e.g. "computer science" → "Computer Science") and convert legacy date formats (DD/MM/YYYY) to ISO-8601.',
      defaultCols: ['department', 'offer_date'],
      defaultName: 'Canonical Department Casing & ISO Date Normalization',
      risk: 'Low'
    },
    {
      id: 'statistical_imputation',
      label: 'Statistical Cohort Imputation',
      badge: 'Review Needed',
      description: 'Impute missing compensation packages for confirmed placed students using the cohort median (18.5 LPA) to avoid sample distortion.',
      defaultCols: ['package_lpa'],
      defaultName: 'Cohort Median Imputation for Placed Students',
      risk: 'Moderate'
    },
    {
      id: 'deduplicate',
      label: 'Entity Deduplication',
      badge: 'Integrity',
      description: 'Identify duplicated student keys (e.g. STU-1082) and retain chronological primary record while archiving duplicate ingest.',
      defaultCols: ['student_id'],
      defaultName: 'Primary Student Identifier Deduplication',
      risk: 'Moderate'
    },
    {
      id: 'flag_for_review',
      label: 'Flag for Committee Review',
      badge: 'Zero Mutation',
      description: 'Leaves raw values completely unaltered. Appends audit verification flags for manual review by placement officer.',
      defaultCols: ['gpa', 'placement_status'],
      defaultName: 'Audit Review Flagging (Zero Mutation)',
      risk: 'Low'
    }
  ];

  const handleSelectStrategy = (stratId: RepairStrategyType) => {
    setSelectedStrategy(stratId);
    const item = strategies.find(s => s.id === stratId);
    if (item) {
      setTargetColumns(item.defaultCols);
      setScenarioName(item.defaultName);
    }
    setActiveScenario(null);
    setApprovalSuccess(null);
  };

  const handleRunSimulation = async () => {
    if (!dataset) return;
    setIsSimulating(true);
    setApprovalSuccess(null);
    try {
      const res = await api.simulateRepair({
        dataset_id: dataset.id,
        version_id: dataset.current_version_id,
        name: scenarioName,
        strategy: selectedStrategy,
        target_columns: targetColumns,
        parameters: {}
      });
      setActiveScenario(res.scenario);
    } catch (err) {
      console.error('Failed to simulate repair', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Run simulation on mount
  useEffect(() => {
    if (dataset && !activeScenario) {
      handleRunSimulation();
    }
  }, [dataset?.id, selectedStrategy]);

  const handleApproveRepair = async () => {
    if (!activeScenario) return;
    setIsApproving(true);
    try {
      const res = await api.approveRepair(activeScenario.id);
      setApprovalSuccess({
        newVersionNumber: res.newVersion.version_number,
        diffsApplied: res.diffsApplied
      });
      onRefreshDataset();
    } catch (err) {
      console.error('Failed to approve repair scenario', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectScenario = async () => {
    if (!activeScenario) return;
    if (confirm('Are you sure you want to reject this simulated scenario?')) {
      await api.rejectRepair(activeScenario.id, 'Rejected by investigator after diff inspection');
      setActiveScenario(null);
    }
  };

  if (!dataset) {
    return (
      <div className="p-8 text-center text-slate-400">
        No dataset selected.
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Repair Lab</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">{dataset.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Counterfactual Repair Simulator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare alternative repair strategies in an isolated sandbox. Source data is never modified without explicit approval.
          </p>
        </div>

        <button
          onClick={onNavigateToLineage}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
        >
          <History className="w-3.5 h-3.5 text-violet-400" />
          <span>Version Lineage</span>
        </button>
      </div>

      {/* Success Notification after approval */}
      {approvalSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-lg flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-white">
                Repair Approved · Immutable Dataset Version v{approvalSuccess.newVersionNumber} Published
              </div>
              <div className="text-xs text-emerald-200/80 mt-0.5">
                Successfully applied {approvalSuccess.diffsApplied} cell transformations. Original v1 source remains intact.
              </div>
            </div>
          </div>
          <button
            onClick={onNavigateToLineage}
            className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            Inspect in Time Machine
          </button>
        </div>
      )}

      {/* Step 1: Strategy Chooser */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-300">
          1. Select Candidate Repair Strategy
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {strategies.map((strat) => {
            const isSelected = selectedStrategy === strat.id;
            return (
              <button
                key={strat.id}
                onClick={() => handleSelectStrategy(strat.id as RepairStrategyType)}
                className={`p-4 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-xs'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-white">{strat.label}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{strat.badge}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                    {strat.description}
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 font-mono border-t border-slate-800/80 pt-2 flex items-center justify-between">
                  <span>Risk Level: {strat.risk}</span>
                  <span>{strat.defaultCols.join(', ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Simulation Dashboard & Side-by-Side Impact */}
      {activeScenario && (
        <div className="space-y-6">
          <div className="text-xs font-semibold text-slate-300">
            2. Counterfactual Simulation & Impact Forecast
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Impact Metric 1: Quality Score Delta */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Quality Reliability Index</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-400 line-through">
                  {activeScenario.estimated_score_before}%
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                  {activeScenario.estimated_score_after}%
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-1">
                +{activeScenario.estimated_score_after - activeScenario.estimated_score_before}% improvement
              </div>
            </div>

            {/* Impact Metric 2: Cells to Transform */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Proposed Transformations</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {activeScenario.affected_records_count}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Cell modifications previewed below
              </div>
            </div>

            {/* Impact Metric 3: Remaining Issues */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Remaining Open Findings</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                {activeScenario.unresolved_issues_count}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Require separate or manual resolution
              </div>
            </div>

            {/* Impact Metric 4: Risk & Governance */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Risk Classification</div>
              <div className={`text-xl font-bold font-mono uppercase ${
                activeScenario.risk_level === 'low' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {activeScenario.risk_level} Risk
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Reversible via lineage rollback
              </div>
            </div>

          </div>

          {/* Assumptions & Warnings Strip */}
          <div className="bg-slate-950/70 border border-slate-850 rounded-lg p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Assumptions & Methodological Grounding:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              {activeScenario.assumptions.map((ass, i) => (
                <li key={i}>{ass}</li>
              ))}
              {activeScenario.new_warnings.map((warn, i) => (
                <li key={`w-${i}`} className="text-amber-400/90">{warn}</li>
              ))}
            </ul>
          </div>

          {/* Step 3: Interactive Cell-Level Diff Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">
                  3. Cell-Level Transformation Diff ({activeScenario.diff_preview.length} Changes)
                </div>
                <div className="text-[11px] text-slate-400">
                  Inspect every exact before/after value proposed for modification.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRejectScenario}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/60 rounded-md transition-colors cursor-pointer"
                >
                  Reject Scenario
                </button>

                <button
                  onClick={handleApproveRepair}
                  disabled={isApproving || activeScenario.diff_preview.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 disabled:opacity-50 rounded-md shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isApproving ? 'Generating Version...' : 'Approve & Publish New Version'}</span>
                </button>
              </div>
            </div>

            {/* Diff Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3 whitespace-nowrap">Record Context</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Target Column</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Before (Raw State)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">After (Simulated State)</th>
                      <th className="py-2.5 px-3">Methodological Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {activeScenario.diff_preview.map((diff, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-300">
                          {diff.record_identifier}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-cyan-400">
                          {diff.column}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-rose-400 line-through">
                          {diff.old_value === null ? '<null>' : String(diff.old_value)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-emerald-400 font-semibold">
                          {String(diff.new_value)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {diff.rationale}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
