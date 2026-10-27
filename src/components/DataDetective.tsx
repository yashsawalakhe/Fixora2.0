import React, { useState } from 'react';
import { 
  SearchCode, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  X,
  Filter,
  Eye,
  GitCommit,
  Network
} from 'lucide-react';
import { Issue, IssueCluster, IssueSeverity, IssueCategory, IssueStatus, Dataset } from '../types/fixora';
import { api } from '../services/api';

interface DataDetectiveProps {
  dataset: Dataset | null;
  issues: Issue[];
  clusters: IssueCluster[];
  scanId: string;
  onNavigateToRepair: (strategy?: string) => void;
  onRefreshIssues: () => void;
}

export const DataDetective: React.FC<DataDetectiveProps> = ({
  dataset,
  issues,
  clusters,
  scanId,
  onNavigateToRepair,
  onRefreshIssues
}) => {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<IssueCluster | null>(clusters[0] || null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'hypotheses' | 'issues'>('hypotheses');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<{
    explanation: string;
    is_ai_generated: boolean;
    recommended_steps: string[];
  } | null>(null);

  // Filtered issues
  const filteredIssues = issues.filter(issue => {
    if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        issue.column_name.toLowerCase().includes(q) ||
        issue.record_identifier.toLowerCase().includes(q) ||
        issue.evidence.toLowerCase().includes(q) ||
        issue.rule_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = async (issueId: string, status: IssueStatus) => {
    try {
      await api.updateIssueStatus(scanId, issueId, status);
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue({ ...selectedIssue, status });
      }
      onRefreshIssues();
    } catch (err) {
      console.error('Failed to update issue status', err);
    }
  };

  const handleRequestAIExplanation = async (cluster: IssueCluster) => {
    setAiLoading(true);
    setAiExplanation(null);
    try {
      const result = await api.explainCluster({
        cluster_title: cluster.title,
        category: cluster.category,
        column: cluster.column_name,
        issue_count: cluster.issue_count,
        evidence_summary: cluster.evidence_summary,
        sample_values: []
      });
      setAiExplanation(result);
    } catch (err) {
      console.error('Failed to fetch AI explanation', err);
    } finally {
      setAiLoading(false);
    }
  };

  const getSeverityBadge = (sev: IssueSeverity) => {
    switch (sev) {
      case 'critical':
        return <span className="text-rose-400 font-mono text-[10px] font-semibold uppercase">Critical</span>;
      case 'high':
        return <span className="text-amber-400 font-mono text-[10px] font-semibold uppercase">High</span>;
      case 'medium':
        return <span className="text-cyan-400 font-mono text-[10px] font-semibold uppercase">Medium</span>;
      default:
        return <span className="text-slate-400 font-mono text-[10px] font-semibold uppercase">Low</span>;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Investigation</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">{dataset?.name || 'Active Dataset'}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Detective Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Evidence-grounded quality findings grouped into causal hypotheses. Distinguishes observed facts from inferred explanations.
          </p>
        </div>

        {/* View Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('hypotheses')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'hypotheses' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Root Cause Hypotheses ({clusters.length})
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'issues' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Findings ({issues.length})
          </button>
        </div>
      </div>

      {/* Severity Tally Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Critical Severity', count: issues.filter(i => i.severity === 'critical').length, color: 'text-rose-400', desc: 'Primary key collisions & type errors' },
          { label: 'High Severity', count: issues.filter(i => i.severity === 'high').length, color: 'text-amber-400', desc: 'Null values on active business fields' },
          { label: 'Medium Severity', count: issues.filter(i => i.severity === 'medium').length, color: 'text-cyan-400', desc: 'Casing & date convention drift' },
          { label: 'Statistical Anomalies', count: issues.filter(i => i.category === 'statistical_anomaly').length, color: 'text-violet-400', desc: 'Candidates for review (IQR outliers)' },
        ].map((tally, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">{tally.label}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-bold font-mono tabular-nums ${tally.color}`}>{tally.count}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 leading-tight">{tally.desc}</span>
          </div>
        ))}
      </div>

      {/* Main Tab 1: Root Cause Hypotheses Explorer */}
      {activeTab === 'hypotheses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 1-col: Cluster Cards List */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300">
              Algorithmic Root Cause Clusters
            </div>

            {clusters.map((cluster) => {
              const isSelected = selectedCluster?.id === cluster.id;
              return (
                <div
                  key={cluster.id}
                  onClick={() => {
                    setSelectedCluster(cluster);
                    setAiExplanation(null);
                  }}
                  className={`p-4 rounded-lg border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-cyan-400 font-semibold">{cluster.column_name}</span>
                    {getSeverityBadge(cluster.severity)}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{cluster.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {cluster.hypothesis}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-2 font-mono">
                    <span>{cluster.issue_count} affected records</span>
                    <span className="tabular-nums">{cluster.affected_percentage}% cohort</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 2-col: Cluster Evidence Graph & Detail Drawer */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCluster ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-850">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <span>Root Cause Hypothesis</span>
                      <span>·</span>
                      <span className="font-mono text-cyan-400">Cluster: {selectedCluster.id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedCluster.title}</h2>
                  </div>

                  <button
                    onClick={() => onNavigateToRepair(
                      selectedCluster.category === 'format_inconsistency' ? 'canonical_normalization' :
                      selectedCluster.category === 'missing_value' ? 'statistical_imputation' :
                      selectedCluster.category === 'duplicate' ? 'deduplicate' : 'flag_for_review'
                    )}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
                  >
                    <span>Simulate Repair</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Empirical Evidence vs Inferred Hypothesis Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/70 border border-slate-850 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Empirical Observation (Fact)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {selectedCluster.evidence_summary}
                    </p>
                    <div className="mt-3 text-[11px] text-slate-500">
                      Grounded in deterministic pattern detection.
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-850 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 mb-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Inferred Root Cause (Hypothesis)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedCluster.hypothesis}
                    </p>
                    <div className="mt-3 text-[11px] text-slate-500">
                      Hypothesis requires validation prior to destructive correction.
                    </div>
                  </div>
                </div>

                {/* Interactive Dependency Relationship Graph Simulation */}
                <div className="bg-slate-950/80 border border-slate-850 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <Network className="w-4 h-4 text-cyan-400" />
                      <span>Cluster Topology & Causal Relationships</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Relational Invariants</span>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-center p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-mono">TARGET ATTRIBUTE</div>
                      <div className="text-xs font-bold text-white font-mono mt-1">{selectedCluster.column_name}</div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-cyan-500 shrink-0 hidden md:block" />

                    <div className="flex-1 text-center p-3 bg-slate-950 rounded border border-cyan-800/40">
                      <div className="text-[10px] text-cyan-400 font-mono">DEFECT CLUSTER</div>
                      <div className="text-xs font-bold text-white mt-1">{selectedCluster.category.replace('_', ' ').toUpperCase()}</div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-violet-500 shrink-0 hidden md:block" />

                    <div className="flex-1 text-center p-3 bg-slate-950 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-mono">RECOMMENDED FIX</div>
                      <div className="text-xs font-bold text-violet-300 mt-1">{selectedCluster.recommended_strategy}</div>
                    </div>
                  </div>
                </div>

                {/* Optional AI Plain-Language Assistant Panel */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs font-semibold text-white">AI Evidence Explanation</span>
                    </div>
                    <button
                      onClick={() => handleRequestAIExplanation(selectedCluster)}
                      disabled={aiLoading}
                      className="px-2.5 py-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 rounded transition-colors cursor-pointer"
                    >
                      {aiLoading ? 'Synthesizing...' : 'Explain Root Cause'}
                    </button>
                  </div>

                  {aiExplanation ? (
                    <div className="space-y-3 mt-3 text-xs">
                      <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-slate-300 leading-relaxed">
                        {aiExplanation.explanation}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 mb-1">Recommended Investigation Steps:</div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                          {aiExplanation.recommended_steps.map((st, i) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-[10px] text-slate-500 italic">
                        {aiExplanation.is_ai_generated ? 'Generated by Gemini using sanitized evidence parameters.' : 'Generated deterministically.'}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">
                      Click 'Explain Root Cause' to generate an evidence-grounded summary and recommended steps.
                    </p>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                Select a cluster to inspect its evidence and topology.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Main Tab 2: All Findings Table */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1 text-xs focus:outline-hidden"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1 text-xs focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                <option value="missing_value">Missing Values</option>
                <option value="duplicate">Duplicates</option>
                <option value="type_violation">Type Violations</option>
                <option value="format_inconsistency">Format / Casing Drift</option>
                <option value="validation_violation">Validation Violations</option>
                <option value="statistical_anomaly">Statistical Anomalies</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1 text-xs focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="approved_for_repair">Approved for Repair</option>
                <option value="rejected">Rejected</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by column, rule, or record ID..."
              className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-hidden"
            />
          </div>

          {/* Issues Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3 whitespace-nowrap">Severity</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Record</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Column</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Rule / Check</th>
                    <th className="py-2.5 px-3">Evidence</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No findings match selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map((issue) => (
                      <tr 
                        key={issue.id} 
                        onClick={() => setSelectedIssue(issue)}
                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          selectedIssue?.id === issue.id ? 'bg-slate-800/50' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {getSeverityBadge(issue.severity)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-300">
                          {issue.record_identifier}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-cyan-400">
                          {issue.column_name}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-white font-medium">
                          {issue.rule_name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                          {issue.evidence}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            issue.status === 'open' ? 'bg-amber-950 text-amber-300 border border-amber-900/60' :
                            issue.status === 'approved_for_repair' ? 'bg-cyan-950 text-cyan-300 border border-cyan-900/60' :
                            issue.status === 'rejected' ? 'bg-rose-950 text-rose-300 border border-rose-900/60' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {issue.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIssue(issue);
                            }}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Slide-in Issue Details Drawer */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full overflow-y-auto p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs mb-1">
                  {getSeverityBadge(selectedIssue.severity)}
                  <span className="text-slate-500 font-mono">· ID: {selectedIssue.id}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedIssue.rule_name}</h3>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Details */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded border border-slate-850">
                <div className="text-slate-500">Record Context</div>
                <div className="text-white font-semibold mt-0.5">{selectedIssue.record_identifier}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-850">
                <div className="text-slate-500">Column Name</div>
                <div className="text-cyan-400 font-semibold mt-0.5">{selectedIssue.column_name}</div>
              </div>
            </div>

            {/* Evidence & Explanation */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded border border-slate-850">
                <div className="text-xs font-semibold text-slate-400 mb-1">Observed Empirical Evidence</div>
                <p className="text-xs text-slate-200 font-mono leading-relaxed">{selectedIssue.evidence}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-850">
                <div className="text-xs font-semibold text-slate-400 mb-1">Causal Impact & Explanation</div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedIssue.explanation}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-850">
                <div className="text-xs font-semibold text-slate-400 mb-1">Suggested Investigator Action</div>
                <p className="text-xs text-cyan-300 leading-relaxed">{selectedIssue.suggested_action}</p>
                <div className="text-[10px] text-slate-500 mt-2 font-mono">Detection Method: {selectedIssue.confidence_method}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-2">Investigator Decision:</div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedIssue.id, 'approved_for_repair')}
                  className="px-3 py-2 text-xs font-medium text-cyan-300 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 rounded-md transition-colors cursor-pointer text-center"
                >
                  Approve for Repair
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedIssue.id, 'investigating')}
                  className="px-3 py-2 text-xs font-medium text-amber-300 bg-amber-950 hover:bg-amber-900 border border-amber-800/60 rounded-md transition-colors cursor-pointer text-center"
                >
                  Mark In-Progress
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedIssue.id, 'resolved')}
                  className="px-3 py-2 text-xs font-medium text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/60 rounded-md transition-colors cursor-pointer text-center"
                >
                  Mark as Reviewed
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedIssue.id, 'rejected')}
                  className="px-3 py-2 text-xs font-medium text-rose-300 bg-rose-950 hover:bg-rose-900 border border-rose-900/60 rounded-md transition-colors cursor-pointer text-center"
                >
                  Reject Finding
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedIssue(null);
                  onNavigateToRepair();
                }}
                className="w-full mt-3 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer"
              >
                Proceed to Counterfactual Repair Lab
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
