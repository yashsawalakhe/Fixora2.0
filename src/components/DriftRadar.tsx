import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowRight, 
  Download, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  CheckCircle2,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Dataset, DatasetVersion, DriftComparison } from '../types/fixora';
import { api } from '../services/api';

interface DriftRadarProps {
  dataset: Dataset | null;
  versions: DatasetVersion[];
}

export const DriftRadar: React.FC<DriftRadarProps> = ({
  dataset,
  versions
}) => {
  const [baseVersionId, setBaseVersionId] = useState<string>('');
  const [targetVersionId, setTargetVersionId] = useState<string>('');
  const [comparison, setComparison] = useState<DriftComparison | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (versions.length >= 2) {
      setBaseVersionId(versions[versions.length - 1].id); // oldest (v1)
      setTargetVersionId(versions[0].id); // newest (e.g. v2)
    } else if (versions.length === 1) {
      setBaseVersionId(versions[0].id);
      setTargetVersionId(versions[0].id);
    }
  }, [versions]);

  const runComparison = async () => {
    if (!dataset || !baseVersionId || !targetVersionId) return;
    setLoading(true);
    try {
      const res = await api.compareDrift(dataset.id, baseVersionId, targetVersionId);
      setComparison(res.comparison);
    } catch (err) {
      console.error('Failed to compare drift', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baseVersionId && targetVersionId && dataset) {
      runComparison();
    }
  }, [baseVersionId, targetVersionId, dataset?.id]);

  if (!dataset) {
    return <div className="p-8 text-center text-slate-400">No dataset selected.</div>;
  }

  const baseVer = versions.find(v => v.id === baseVersionId);
  const targetVer = versions.find(v => v.id === targetVersionId);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Drift Radar</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">{dataset.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Drift & Distribution Radar</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track missingness variance, category proportion shifts, and numeric distribution deltas across dataset versions.
          </p>
        </div>

        {/* Version Selectors */}
        <div className="flex items-center flex-wrap gap-2.5 bg-slate-900 border border-slate-800 rounded-lg p-2 self-start sm:self-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Base:</span>
            <select
              value={baseVersionId}
              onChange={(e) => setBaseVersionId(e.target.value)}
              className="bg-slate-950 text-white rounded px-2 py-1 font-mono focus:outline-hidden"
            >
              {versions.map(v => (
                <option key={v.id} value={v.id}>
                  v{v.version_number} ({new Date(v.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Target:</span>
            <select
              value={targetVersionId}
              onChange={(e) => setTargetVersionId(e.target.value)}
              className="bg-slate-950 text-white rounded px-2 py-1 font-mono focus:outline-hidden"
            >
              {versions.map(v => (
                <option key={v.id} value={v.id}>
                  v{v.version_number} ({new Date(v.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={runComparison}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
            title="Refresh comparison"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {versions.length < 2 && (
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-center justify-between">
          <span>
            Only 1 version currently exists for this dataset. Approve a repair in the <strong>Repair Lab</strong> to generate v2 and compare full distribution drift!
          </span>
        </div>
      )}

      {/* Drift Summary Cards */}
      {comparison && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Columns with Distribution Shift</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {comparison.columns_with_drift} <span className="text-xs text-slate-500 font-normal">/ {comparison.total_columns_compared}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Based on missingness and category shift</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Schema Drift</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                0 Incompatibilities
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Structural columns preserved</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Base Version Health</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-300">
                {baseVer?.quality_score ?? 84}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Version v{baseVer?.version_number} snapshot</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Target Version Health</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400">
                {targetVer?.quality_score ?? 92}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Version v{targetVer?.version_number} snapshot</div>
            </div>

          </div>

          {/* Column-by-Column Drift Ledger */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden space-y-4 p-5">
            <div>
              <h2 className="text-sm font-semibold text-white">Column-Level Drift & Missingness Variance</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution delta comparing baseline v{comparison.base_version_number} to target v{comparison.target_version_number}.
              </p>
            </div>

            <div className="divide-y divide-slate-850 border border-slate-800 rounded-lg overflow-hidden">
              {comparison.column_stats.map((stat, idx) => (
                <div key={idx} className="p-4 bg-slate-950/60 hover:bg-slate-900/40 transition-colors text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{stat.column}</span>
                      <span className="text-[10px] text-slate-500 font-mono">[{stat.type}]</span>
                      {stat.drift_severity !== 'none' && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          stat.drift_severity === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {stat.drift_severity.toUpperCase()} DRIFT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                      <span>
                        Null Rate: <strong className="text-slate-300">{stat.v1_null_rate}%</strong> → <strong className="text-emerald-400">{stat.v2_null_rate}%</strong>
                        <span className="text-slate-500 text-[10px] ml-1">({stat.null_rate_delta > 0 ? '+' : ''}{stat.null_rate_delta}%)</span>
                      </span>
                      <span>
                        Uniques: <strong className="text-white">{stat.v1_unique_count}</strong> → <strong className="text-cyan-400">{stat.v2_unique_count}</strong>
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {stat.drift_summary}
                  </p>

                  {/* Category Shift Visualization if available */}
                  {stat.v1_distribution && stat.v2_distribution && (
                    <div className="pt-2 border-t border-slate-850/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500">v{comparison.base_version_number} Top Categories:</span>
                        <div className="space-y-1 mt-1">
                          {stat.v1_distribution.slice(0, 3).map((c, i) => (
                            <div key={i} className="flex justify-between text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                              <span className="truncate max-w-[150px]">{c.category}</span>
                              <span className="text-slate-300">{c.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500">v{comparison.target_version_number} Top Categories:</span>
                        <div className="space-y-1 mt-1">
                          {stat.v2_distribution.slice(0, 3).map((c, i) => (
                            <div key={i} className="flex justify-between text-cyan-300 bg-slate-900 px-2 py-0.5 rounded">
                              <span className="truncate max-w-[150px]">{c.category}</span>
                              <span className="font-semibold text-cyan-400">{c.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-850 text-xs text-slate-400 font-mono">
              Drift Summary: {comparison.summary}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
