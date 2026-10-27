import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  Activity, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  X, 
  Trash2
} from 'lucide-react';
import { Dataset, ColumnProfile } from '../types/fixora';
import { api } from '../services/api';
import { CleanDownloadHub } from './CleanDownloadHub';

interface DatasetExplorerProps {
  dataset: Dataset | null;
  datasets: Dataset[];
  onSelectDataset: (id: string) => void;
  onTriggerScan: () => void;
  onRefresh: () => void;
  isScanning: boolean;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  dataset,
  datasets,
  onSelectDataset,
  onTriggerScan,
  onRefresh,
  isScanning
}) => {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<ColumnProfile[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedColProfile, setSelectedColProfile] = useState<ColumnProfile | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadData = async (dsId: string, pageNum: number, query: string) => {
    setLoading(true);
    try {
      const data = await api.getPreview(dsId, undefined, pageNum, 20, query);
      setRows(data.rows);
      setColumns(data.columns);
      setProfiles(data.column_profiles || []);
      setTotalRecords(data.total_records);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to load dataset rows', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataset) {
      setPage(1);
      loadData(dataset.id, 1, search);
    }
  }, [dataset?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (dataset) {
      setPage(1);
      loadData(dataset.id, 1, search);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && dataset) {
      setPage(newPage);
      loadData(dataset.id, newPage, search);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      if (uploadName) formData.append('dataset_name', uploadName);

      const result = await api.uploadDataset(formData);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadName('');
      onRefresh();
      onSelectDataset(result.dataset.id);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!dataset) return;
    if (confirm(`Are you sure you want to delete dataset '${dataset.name}'?`)) {
      await api.deleteDataset(dataset.id);
      onRefresh();
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
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Datasets</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">{dataset.original_filename}</span>
            {dataset.is_demo && (
              <span className="text-[10px] text-cyan-400 font-mono">· Demo Cohort</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{dataset.name}</h1>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
            <span className="font-mono tabular-nums">{totalRecords} Total Records</span>
            <span>·</span>
            <span className="font-mono tabular-nums">{columns.length} Columns</span>
            <span>·</span>
            <span>Storage Key: <code className="text-slate-300 font-mono">{dataset.id.slice(0, 12)}</code></span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Dataset</span>
          </button>

          <a
            href={`/api/datasets/${dataset.id}/export?format=csv`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          <a
            href={`/api/datasets/${dataset.id}/export?format=json`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </a>

          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isScanning ? 'Scanning...' : 'Scan Quality'}</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer rounded-md hover:bg-slate-900"
            title="Delete dataset"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prominent Cleaned Data Download & Review Hub */}
      <CleanDownloadHub
        dataset={dataset}
        onRefresh={onRefresh}
        variant="explorer"
      />

      {/* Column Schema Badges Strip */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 overflow-x-auto">
        <div className="text-[11px] font-medium text-slate-400 mb-2">Column Profiles (Click to view distribution)</div>
        <div className="flex items-center gap-2">
          {profiles.map((col) => (
            <button
              key={col.name}
              onClick={() => setSelectedColProfile(col)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 rounded-md transition-colors whitespace-nowrap text-left cursor-pointer shrink-0"
            >
              <span className="font-medium text-slate-200">{col.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">[{col.inferred_type}]</span>
              {col.null_count > 0 && (
                <span className="text-[10px] text-amber-400 font-mono font-semibold">
                  {col.null_count} null
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar & Table Controls */}
      <div className="flex items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records by student name, ID, department..."
            className="w-full bg-slate-900 border border-slate-800 rounded-md pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition-colors"
          />
        </form>

        {/* Pagination Nav */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Page <strong className="text-white font-mono">{page}</strong> of <strong className="text-white font-mono">{totalPages}</strong></span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="p-1 bg-slate-900 border border-slate-800 rounded-md disabled:opacity-40 hover:bg-slate-800 text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="p-1 bg-slate-900 border border-slate-800 rounded-md disabled:opacity-40 hover:bg-slate-800 text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3 w-12 font-mono text-[10px] text-slate-600">#</th>
                {columns.map(col => (
                  <th key={col} className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-300">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-slate-500">
                    Loading records from secure storage...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-slate-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const rowNumber = (page - 1) * 20 + idx + 1;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] tabular-nums text-slate-500">
                        {rowNumber}
                      </td>
                      {columns.map(col => {
                        const val = row[col];
                        const isNull = val === null || val === undefined || (typeof val === 'string' && val.trim() === '');
                        
                        return (
                          <td key={col} className="py-2.5 px-3 whitespace-nowrap font-mono tabular-nums text-slate-300">
                            {isNull ? (
                              <span className="text-amber-500/80 italic text-[11px]">null</span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Column Profile Modal / Drawer */}
      {selectedColProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl relative">
            <button
              onClick={() => setSelectedColProfile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">{selectedColProfile.name}</h3>
                <div className="text-xs text-slate-400">Type: <span className="text-cyan-300">{selectedColProfile.inferred_type}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-md border border-slate-850">
                <div className="text-slate-500">Total Count</div>
                <div className="text-base font-semibold text-white tabular-nums">{selectedColProfile.total_count}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-md border border-slate-850">
                <div className="text-slate-500">Null / Missing</div>
                <div className="text-base font-semibold text-amber-400 tabular-nums">
                  {selectedColProfile.null_count} ({selectedColProfile.null_percentage}%)
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-md border border-slate-850">
                <div className="text-slate-500">Unique Values</div>
                <div className="text-base font-semibold text-white tabular-nums">{selectedColProfile.unique_count}</div>
              </div>
              {selectedColProfile.mean !== undefined && (
                <div className="bg-slate-950 p-2.5 rounded-md border border-slate-850">
                  <div className="text-slate-500">Mean / Median</div>
                  <div className="text-base font-semibold text-white tabular-nums">{selectedColProfile.mean} / {selectedColProfile.median}</div>
                </div>
              )}
            </div>

            {selectedColProfile.top_categories && selectedColProfile.top_categories.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-300 mb-2">Category Frequency Distribution:</div>
                <div className="space-y-1.5">
                  {selectedColProfile.top_categories.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono bg-slate-950 px-2.5 py-1.5 rounded border border-slate-850">
                      <span className="text-slate-300 truncate max-w-[200px]">{cat.value || '[empty]'}</span>
                      <span className="text-cyan-400 tabular-nums font-semibold">{cat.count} occurrences</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedColProfile(null)}
              className="w-full py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Ingest Dataset</h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload CSV or XLSX file. Raw file is stored immutably.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dataset Name (Optional)</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Q4 Campus Recruitment Batch"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select File (.csv or .xlsx)</label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              {uploadError && (
                <div className="p-2.5 bg-rose-950/60 border border-rose-900 rounded text-xs text-rose-300">
                  {uploadError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                >
                  {uploading ? 'Parsing & Scanning...' : 'Upload & Scan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
