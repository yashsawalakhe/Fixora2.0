import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Layers, 
  ArrowRight,
  Database,
  Filter
} from 'lucide-react';
import { Dataset, CrossDatasetResult } from '../types/fixora';
import { api } from '../services/api';

interface CrossDatasetViewProps {
  datasets: Dataset[];
}

export const CrossDatasetView: React.FC<CrossDatasetViewProps> = ({ datasets }) => {
  const [datasetAId, setDatasetAId] = useState<string>('');
  const [datasetBId, setDatasetBId] = useState<string>('');
  const [keyColA, setKeyColA] = useState('student_id');
  const [keyColB, setKeyColB] = useState('student_id');
  const [result, setResult] = useState<CrossDatasetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'conflicts' | 'exact' | 'unmatched'>('all');

  useEffect(() => {
    if (datasets.length >= 2) {
      setDatasetAId(datasets[0].id);
      setDatasetBId(datasets[1].id);
    } else if (datasets.length === 1) {
      setDatasetAId(datasets[0].id);
    }
  }, [datasets]);

  const handleRunMatch = async () => {
    if (!datasetAId || !datasetBId) return;
    setLoading(true);
    try {
      const res = await api.compareCrossDataset({
        dataset_a_id: datasetAId,
        dataset_b_id: datasetBId,
        key_column_a: keyColA,
        key_column_b: keyColB,
        mapped_columns: [
          { col_a: 'student_name', col_b: 'official_name' },
          { col_a: 'department', col_b: 'official_department' }
        ]
      });
      setResult(res.result);
    } catch (err) {
      console.error('Cross dataset comparison failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datasetAId && datasetBId) {
      handleRunMatch();
    }
  }, [datasetAId, datasetBId]);

  const filteredMatches = result?.sample_matches.filter(m => {
    if (filterMode === 'conflicts') return m.status === 'conflict_detected';
    if (filterMode === 'exact') return m.status === 'exact_match';
    if (filterMode === 'unmatched') return m.status.startsWith('unmatched');
    return true;
  }) || [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Integrity Invariants</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">Cross-Dataset Reconciliation</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cross-Dataset Consistency Checker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconcile entity attributes between two independent datasets. Never silently merges without explicit verification.
          </p>
        </div>

        <button
          onClick={handleRunMatch}
          disabled={loading || !datasetAId || !datasetBId}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-md transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>{loading ? 'Reconciling...' : 'Run Consistency Match'}</span>
        </button>
      </div>

      {/* Dataset Pair Selection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        {/* Dataset A */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Table (Dataset A)</label>
          <select
            value={datasetAId}
            onChange={(e) => setDatasetAId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-2 focus:outline-hidden"
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.row_count} rows)</option>
            ))}
          </select>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">Join Key: {keyColA}</div>
        </div>

        {/* Dataset B */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Reference Table (Dataset B)</label>
          <select
            value={datasetBId}
            onChange={(e) => setDatasetBId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded p-2 focus:outline-hidden"
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.row_count} rows)</option>
            ))}
          </select>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">Join Key: {keyColB}</div>
        </div>
      </div>

      {/* Match Results Summary */}
      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Exact Matches</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                {result.exact_matches}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Confirmed across both ledgers</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Conflicting Records</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-rose-400">
                {result.conflicting_records}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Divergent attributes detected</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Unmatched in Table B</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                {result.unmatched_a_records}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">In Placement but not Enrollment</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Unmatched in Table A</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-400">
                {result.unmatched_b_records}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">In Enrollment but not Placement</div>
            </div>

          </div>

          {/* Filter Bar & Reconciliation Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Reconciliation Sample Records</h2>
              
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-md text-xs">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({result.sample_matches.length})
                </button>
                <button
                  onClick={() => setFilterMode('conflicts')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterMode === 'conflicts' ? 'bg-rose-950 text-rose-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Conflicts ({result.conflicting_records})
                </button>
                <button
                  onClick={() => setFilterMode('exact')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterMode === 'exact' ? 'bg-emerald-950 text-emerald-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Matches ({result.exact_matches})
                </button>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3 whitespace-nowrap">Entity Key</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-3">Conflicting Attributes (Dataset A vs Dataset B)</th>
                      <th className="py-2.5 px-3">Reconciliation Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredMatches.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-white">
                          {m.key_value}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            m.status === 'exact_match' ? 'bg-emerald-950 text-emerald-300 border border-emerald-900/60' :
                            m.status === 'conflict_detected' ? 'bg-rose-950 text-rose-300 border border-rose-900/60' :
                            'bg-amber-950 text-amber-300 border border-amber-900/60'
                          }`}>
                            {m.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {m.conflicts.length > 0 ? (
                            <div className="space-y-1">
                              {m.conflicts.map((c, i) => (
                                <div key={i} className="font-mono text-[11px]">
                                  <span className="text-slate-500">{c.attribute}:</span>{' '}
                                  <span className="text-rose-400 font-semibold">"{c.value_a}"</span>{' '}
                                  <span className="text-slate-600">vs</span>{' '}
                                  <span className="text-cyan-400 font-semibold">"{c.value_b}"</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 font-mono text-[11px]">— Zero Conflicts —</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {m.rationale}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
