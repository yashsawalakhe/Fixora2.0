import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Play, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  ToggleLeft, 
  ToggleRight,
  ShieldAlert,
  Save
} from 'lucide-react';
import { Dataset, ValidationRule, IssueSeverity } from '../types/fixora';
import { api } from '../services/api';

interface RuleBuilderProps {
  dataset: Dataset | null;
  onRefreshScan: () => void;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  dataset,
  onRefreshScan
}) => {
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New rule form fields
  const [ruleName, setRuleName] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [ruleType, setRuleType] = useState<ValidationRule['rule_type']>('numeric_range');
  const [targetCol, setTargetCol] = useState('gpa');
  const [severity, setSeverity] = useState<IssueSeverity>('high');
  const [minVal, setMinVal] = useState('0.0');
  const [maxVal, setMaxVal] = useState('10.0');
  const [allowedCategories, setAllowedCategories] = useState('Placed, Unplaced, Internship');

  const loadRules = async () => {
    if (!dataset) return;
    setLoading(true);
    try {
      const data = await api.getRules(dataset.id);
      setRules(data);
    } catch (err) {
      console.error('Failed to load rules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, [dataset?.id]);

  const handleToggle = async (ruleId: string) => {
    if (!dataset) return;
    try {
      const updated = await api.toggleRule(dataset.id, ruleId);
      setRules(prev => prev.map(r => r.id === ruleId ? updated : r));
      onRefreshScan();
    } catch (err) {
      console.error('Failed to toggle rule', err);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataset) return;

    let parameters: Record<string, any> = {};
    if (ruleType === 'numeric_range') {
      parameters = { min: parseFloat(minVal), max: parseFloat(maxVal) };
    } else if (ruleType === 'allowed_category') {
      parameters = { categories: allowedCategories.split(',').map(s => s.trim()).filter(Boolean) };
    }

    try {
      const newRule = await api.createRule(dataset.id, {
        dataset_id: dataset.id,
        name: ruleName,
        description: ruleDesc,
        rule_type: ruleType,
        target_column: targetCol,
        parameters,
        severity,
        enabled: true
      });

      setRules(prev => [...prev, newRule]);
      setIsCreateModalOpen(false);
      setRuleName('');
      setRuleDesc('');
      onRefreshScan();
    } catch (err) {
      console.error('Failed to create rule', err);
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
            <span>Validation Rules</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">{dataset.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Adaptive Validation Rule Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure custom deterministic invariants, numeric boundaries, and domain memberships executed during scanning.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Validation Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-lg border transition-all text-xs flex flex-col justify-between ${
              rule.enabled
                ? 'bg-slate-900/60 border-slate-800'
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-cyan-400 font-bold">{rule.target_column}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    rule.severity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-900/60' : 'bg-amber-950 text-amber-300 border border-amber-900/60'
                  }`}>
                    {rule.severity.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleToggle(rule.id)}
                    className="cursor-pointer text-slate-400 hover:text-white"
                    title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                  >
                    {rule.enabled ? (
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white mb-1">{rule.name}</h3>
              <p className="text-slate-400 leading-relaxed mb-3">{rule.description}</p>
            </div>

            <div className="border-t border-slate-850 pt-3 text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Type: {rule.rule_type}</span>
              <span>Params: {JSON.stringify(rule.parameters)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Create Validation Rule</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enforce deterministic assertions on incoming batches and quality scans.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Mandatory Non-Negative Compensation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Description / Rationale</label>
                <input
                  type="text"
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  placeholder="e.g. Placement CTC values must be greater than zero."
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Target Column</label>
                  <select
                    value={targetCol}
                    onChange={(e) => setTargetCol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-white font-mono focus:outline-hidden"
                  >
                    {dataset.columns.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Rule Type</label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-white focus:outline-hidden"
                  >
                    <option value="numeric_range">Numeric Range [min, max]</option>
                    <option value="allowed_category">Allowed Category Set</option>
                    <option value="required_field">Required (Non-Empty)</option>
                    <option value="unique_value">Unique Value</option>
                  </select>
                </div>
              </div>

              {ruleType === 'numeric_range' && (
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="block font-sans font-medium text-slate-300 mb-1">Min Value</label>
                    <input
                      type="number"
                      step="any"
                      value={minVal}
                      onChange={(e) => setMinVal(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-white focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-sans font-medium text-slate-300 mb-1">Max Value</label>
                    <input
                      type="number"
                      step="any"
                      value={maxVal}
                      onChange={(e) => setMaxVal(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {ruleType === 'allowed_category' && (
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Allowed Categories (Comma separated)</label>
                  <input
                    type="text"
                    value={allowedCategories}
                    onChange={(e) => setAllowedCategories(e.target.value)}
                    placeholder="Placed, Unplaced, Higher Studies"
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-white focus:outline-hidden font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-300 mb-1">Violation Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-white font-mono focus:outline-hidden"
                >
                  <option value="critical">Critical (Blocks ingest / quarantine)</option>
                  <option value="high">High (Immediate investigation)</option>
                  <option value="medium">Medium (Format or reporting flag)</option>
                  <option value="low">Low (Advisory anomaly)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer"
                >
                  Save & Enable Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
