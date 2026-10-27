import React, { useState } from 'react';
import { 
  History, 
  ArrowRight, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  Lock
} from 'lucide-react';
import { Dataset, DatasetVersion } from '../types/fixora';
import { api } from '../services/api';

interface TimeMachineViewProps {
  dataset: Dataset | null;
  versions: DatasetVersion[];
  onRefreshDataset: () => void;
  onNavigateToRepair: () => void;
}

export const TimeMachineView: React.FC<TimeMachineViewProps> = ({
  dataset,
  versions,
  onRefreshDataset,
  onNavigateToRepair
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    versions[0]?.id || ''
  );
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackSuccess, setRollbackSuccess] = useState<string | null>(null);

  const handleRollback = async (targetVer: DatasetVersion) => {
    if (!dataset) return;
    if (confirm(`Confirm rollback: This will spawn a new clean version cloning v${targetVer.version_number}'s state without destroying historical versions.`)) {
      setIsRollingBack(true);
      setRollbackSuccess(null);
      try {
        const newVer = await api.rollbackVersion(dataset.id, targetVer.id);
        setRollbackSuccess(`Successfully rolled back to state of v${targetVer.version_number}. Generated v${newVer.version_number}.`);
        onRefreshDataset();
      } catch (err: any) {
        console.error('Rollback failed', err);
      } finally {
        setIsRollingBack(false);
      }
    }
  };

  if (!dataset) {
    return <div className="p-8 text-center text-slate-400">No dataset selected.</div>;
  }

  const selectedVer = versions.find(v => v.id === selectedVersionId) || versions[0];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Audit & Lineage</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">{dataset.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Lineage Time Machine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete provenance graph of immutable dataset versions. Roll back to any prior state without erasing history.
          </p>
        </div>

        <button
          onClick={onNavigateToRepair}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <span>New Repair Scenario</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {rollbackSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{rollbackSuccess}</span>
          </div>
          <button onClick={() => setRollbackSuccess(null)} className="text-slate-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Main Timeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Chronological Timeline */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-300">
            Version Timeline ({versions.length} Snapshots)
          </div>

          <div className="relative border-l border-slate-800 ml-3.5 pl-6 space-y-6">
            {versions.map((ver) => {
              const isSelected = selectedVer?.id === ver.id;
              const isCurrent = dataset.current_version_id === ver.id;

              return (
                <div 
                  key={ver.id}
                  onClick={() => setSelectedVersionId(ver.id)}
                  className="relative group cursor-pointer"
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 transition-all ${
                    isCurrent 
                      ? 'bg-cyan-400 border-cyan-300 ring-4 ring-cyan-500/20' 
                      : isSelected 
                      ? 'bg-violet-400 border-violet-300' 
                      : 'bg-slate-900 border-slate-700'
                  }`} />

                  <div className={`p-4 rounded-lg border transition-all text-xs ${
                    isSelected 
                      ? 'bg-slate-900 border-cyan-500/80 shadow-xs' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5 font-mono">
                      <span className="text-sm font-bold text-white">v{ver.version_number}</span>
                      {isCurrent ? (
                        <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          Parent: {ver.parent_version_id ? 'Prior' : 'Origin'}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-300 line-clamp-2 leading-relaxed mb-2">
                      {ver.change_summary}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-2">
                      <span>{ver.row_count} rows · {ver.column_count} cols</span>
                      <span>{new Date(ver.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Version Inspector & Rollback Controls */}
        <div className="lg:col-span-2 space-y-6">
          {selectedVer && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-850">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 font-mono">
                    <span className="text-cyan-400 font-bold">Version v{selectedVer.version_number}</span>
                    <span>·</span>
                    <span>ID: {selectedVer.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">Version Provenance Record</h2>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/datasets/${dataset.id}/export?version_id=${selectedVer.id}&format=csv`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </a>

                  {dataset.current_version_id !== selectedVer.id && (
                    <button
                      onClick={() => handleRollback(selectedVer)}
                      disabled={isRollingBack}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-900 rounded-md transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isRollingBack ? 'Restoring...' : 'Rollback to this Version'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Version Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded border border-slate-850">
                  <div className="text-slate-500">Row Count</div>
                  <div className="text-base font-bold text-white tabular-nums mt-0.5">{selectedVer.row_count}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-850">
                  <div className="text-slate-500">Column Count</div>
                  <div className="text-base font-bold text-white tabular-nums mt-0.5">{selectedVer.column_count}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-850">
                  <div className="text-slate-500">Quality Score</div>
                  <div className="text-base font-bold text-cyan-400 tabular-nums mt-0.5">{selectedVer.quality_score ?? 84}%</div>
                </div>
                <div className="p-3 bg-slate-950 rounded border border-slate-850">
                  <div className="text-slate-500">Storage Protection</div>
                  <div className="text-sm font-bold text-emerald-400 uppercase mt-0.5">Immutable</div>
                </div>
              </div>

              {/* Transformation Log */}
              <div className="bg-slate-950/70 border border-slate-850 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Transformation Summary:</div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {selectedVer.change_summary}
                </p>
                <div className="text-[11px] text-slate-500 mt-2 font-mono">
                  Author: {selectedVer.created_by} · Timestamp: {new Date(selectedVer.created_at).toLocaleString()}
                </div>
              </div>

              {/* Immutability Guarantee Compact */}
              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Immutability & Provenance Guarantee</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Version snapshots are append-only. Performing a rollback does not delete or overwrite any downstream versions; it generates a fresh version with lineage pointers to the historical state.
                </p>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
