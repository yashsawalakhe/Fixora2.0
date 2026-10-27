import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Eye, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  X, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Check,
  Ban,
  FileCheck2,
  Info
} from 'lucide-react';
import { Dataset, CleaningStats, AppliedCorrection, Issue, CleaningOptions } from '../types/fixora';
import { api } from '../services/api';

interface CleanDownloadHubProps {
  dataset: Dataset | null;
  onRefresh?: () => void;
  variant?: 'dashboard' | 'explorer' | 'standalone';
}

export const CleanDownloadHub: React.FC<CleanDownloadHubProps> = ({
  dataset,
  onRefresh,
  variant = 'dashboard'
}) => {
  const [stats, setStats] = useState<CleaningStats | null>(null);
  const [appliedCorrections, setAppliedCorrections] = useState<AppliedCorrection[]>([]);
  const [unresolvedIssues, setUnresolvedIssues] = useState<Issue[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<'xlsx' | 'csv' | 'original' | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isReviewSettingsOpen, setIsReviewSettingsOpen] = useState(false);

  // Preview Modal state
  const [previewRows, setPreviewRows] = useState<Record<string, any>[]>([]);
  const [previewCols, setPreviewCols] = useState<string[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewTotalPages, setPreviewTotalPages] = useState(1);
  const [previewTotalRecords, setPreviewTotalRecords] = useState(0);
  const [previewSearch, setPreviewSearch] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Cleaning options
  const [options, setOptions] = useState<CleaningOptions>({
    normalize_casing_whitespace: true,
    standardize_dates: true,
    remove_duplicates: true,
    impute_missing_numeric: true,
    fix_numeric_bounds: true,
    normalize_emails: true
  });

  // Selected corrections to reject/approve
  const [rejectedCorrectionIds, setRejectedCorrectionIds] = useState<string[]>([]);

  // Load cleaning preview and stats on dataset change
  const fetchCleanedState = async (dsId: string) => {
    setLoadingStats(true);
    try {
      const data = await api.getCleanedPreview(dsId, 1, 10);
      setStats(data.stats);
      setAppliedCorrections(data.applied_corrections);
      setUnresolvedIssues(data.unresolved_issues);
      setPreviewRows(data.rows);
      setPreviewCols(data.columns);
      setPreviewTotalRecords(data.total_records);
      setPreviewTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to fetch cleaned preview', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (dataset) {
      fetchCleanedState(dataset.id);
    }
  }, [dataset?.id, dataset?.current_version_id]);

  // Handle direct file download
  const handleDownload = async (format: 'xlsx' | 'csv' | 'original') => {
    if (!dataset) return;
    setDownloadingFormat(format);
    setErrorToast(null);

    try {
      const downloadUrl = format === 'original' 
        ? api.getDownloadOriginalUrl(dataset.id) 
        : api.getDownloadCleanedUrl(dataset.id, format);

      // Trigger browser download via invisible link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const formatLabel = format === 'xlsx' ? 'Cleaned Excel workbook (.xlsx)' : format === 'csv' ? 'Cleaned CSV file (.csv)' : 'Original data snapshot';
      setSuccessToast(`Initiated download for ${formatLabel}.`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      setErrorToast(err.message || 'Download failed. Please try again.');
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setDownloadingFormat(null);
    }
  };

  // Execute cleaning with custom review configuration
  const handleApplyCustomCleaning = async () => {
    if (!dataset) return;
    setIsCleaning(true);
    setErrorToast(null);

    try {
      const payloadOptions: CleaningOptions = {
        ...options,
        rejected_issue_ids: rejectedCorrectionIds
      };

      const result = await api.cleanDataset(dataset.id, payloadOptions);
      setStats(result.stats);
      setAppliedCorrections(result.applied_corrections);
      setUnresolvedIssues(result.unresolved_issues);
      setIsReviewSettingsOpen(false);
      setSuccessToast(`Applied ${result.stats.corrections_applied} corrections. Quality score improved to ${result.stats.quality_score_after}%.`);
      setTimeout(() => setSuccessToast(null), 5000);

      if (onRefresh) onRefresh();
      fetchCleanedState(dataset.id);
    } catch (err: any) {
      setErrorToast(err.message || 'Failed to apply cleaning operations.');
    } finally {
      setIsCleaning(false);
    }
  };

  // Load paginated preview rows
  const handleLoadPreviewPage = async (newPage: number, query = previewSearch) => {
    if (!dataset) return;
    setLoadingPreview(true);
    try {
      const data = await api.getCleanedPreview(dataset.id, newPage, 20, query);
      setPreviewRows(data.rows);
      setPreviewCols(data.columns);
      setPreviewPage(newPage);
      setPreviewTotalPages(data.total_pages);
      setPreviewTotalRecords(data.total_records);
    } catch (err) {
      console.error('Failed to paginate preview', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleOpenPreviewModal = () => {
    setIsPreviewOpen(true);
    handleLoadPreviewPage(1, '');
  };

  const toggleRejectCorrection = (corrId: string) => {
    setRejectedCorrectionIds(prev => 
      prev.includes(corrId) ? prev.filter(id => id !== corrId) : [...prev, corrId]
    );
  };

  if (!dataset) return null;

  return (
    <div className="space-y-4">
      {/* Toast Notifications */}
      {successToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorToast && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button onClick={() => setErrorToast(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Download & Quality Readiness Card */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          
          {/* Status summary */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-950/70 border border-emerald-800/80 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cleaned Dataset Ready</span>
            </div>
            
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Your Dataset is Ready for Export</span>
            </h2>
            
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Fixora verified your data through deterministic detection, standardized formats, and preserved the immutable original. Download the corrected Excel or CSV file.
            </p>

            {/* Micro stats chip list */}
            {stats && (
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  Rows: <strong className="text-white">{stats.cleaned_row_count}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  Corrections: <strong className="text-cyan-400 font-bold">{stats.corrections_applied}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  Issues Remaining: <strong className={stats.unresolved_issues > 0 ? "text-amber-400" : "text-emerald-400"}>{stats.unresolved_issues}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  Quality Score: <strong className="text-cyan-400 font-bold">{stats.quality_score_before}% → {stats.quality_score_after}%</strong>
                </span>
              </div>
            )}
          </div>

          {/* Primary Action Buttons Hub */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            
            {/* Download Cleaned Excel (.xlsx) */}
            <button
              onClick={() => handleDownload('xlsx')}
              disabled={downloadingFormat !== null}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap group"
              title="Download full workbook with Cleaned_Data and Cleaning_Report worksheets"
            >
              {downloadingFormat === 'xlsx' ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-slate-950" />
              )}
              <span>Download Cleaned Excel (.xlsx)</span>
            </button>

            {/* Download Cleaned CSV (.csv) */}
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloadingFormat !== null}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap group"
              title="Download UTF-8 encoded cleaned CSV file"
            >
              {downloadingFormat === 'csv' ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-slate-950" />
              )}
              <span>Download Cleaned CSV (.csv)</span>
            </button>

            {/* Preview Cleaned Data */}
            <button
              onClick={handleOpenPreviewModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preview Cleaned Data</span>
            </button>

            {/* Compare Before & After */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-violet-400" />
              <span>Compare Before & After</span>
            </button>

            {/* Download Original Data */}
            <button
              onClick={() => handleDownload('original')}
              disabled={downloadingFormat !== null}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Download the unchanged immutable raw file"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Original</span>
            </button>

            {/* Review & Custom Rules Settings */}
            <button
              onClick={() => setIsReviewSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Configure Cleaning Strategies & Review Corrections"
            >
              <Sliders className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* PREVIEW CLEANED DATA MODAL */}
      {/* ========================================================================= */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Cleaned Dataset Preview</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-800 text-emerald-300">
                      Verified Corrections Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {previewTotalRecords} total records · Cleaned view reflects approved repairs and zero formula injection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload('xlsx')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download .xlsx</span>
                </button>
                <button
                  onClick={() => handleDownload('csv')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download .csv</span>
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/40">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={previewSearch}
                  onChange={(e) => {
                    setPreviewSearch(e.target.value);
                    handleLoadPreviewPage(1, e.target.value);
                  }}
                  placeholder="Filter records..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Pagination */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Page <strong className="text-white font-mono">{previewPage}</strong> of <strong className="text-white font-mono">{previewTotalPages}</strong></span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleLoadPreviewPage(previewPage - 1)}
                    disabled={previewPage <= 1 || loadingPreview}
                    className="p-1 bg-slate-900 border border-slate-800 rounded disabled:opacity-40 hover:bg-slate-800 text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleLoadPreviewPage(previewPage + 1)}
                    disabled={previewPage >= previewTotalPages || loadingPreview}
                    className="p-1 bg-slate-900 border border-slate-800 rounded disabled:opacity-40 hover:bg-slate-800 text-white cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="flex-1 overflow-auto p-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 z-10 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-12 font-mono text-[10px] text-slate-600">#</th>
                    {previewCols.map(col => (
                      <th key={col} className="py-2.5 px-3 whitespace-nowrap text-slate-300">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {loadingPreview ? (
                    <tr>
                      <td colSpan={previewCols.length + 1} className="py-12 text-center text-slate-400">
                        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Rendering cleaned records...</span>
                      </td>
                    </tr>
                  ) : previewRows.length === 0 ? (
                    <tr>
                      <td colSpan={previewCols.length + 1} className="py-12 text-center text-slate-500">
                        No records match your query.
                      </td>
                    </tr>
                  ) : (
                    previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-600">
                          {(previewPage - 1) * 20 + idx + 1}
                        </td>
                        {previewCols.map(col => {
                          const val = row[col];
                          const isNull = val === null || val === undefined || val === '';
                          return (
                            <td key={col} className="py-2 px-3 whitespace-nowrap font-mono text-slate-300">
                              {isNull ? (
                                <span className="text-slate-600 italic">null</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Displaying preview with safe formula escaping</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPARE BEFORE & AFTER MODAL */}
      {/* ========================================================================= */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-950 border border-violet-800/60 flex items-center justify-center text-violet-400">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Compare Before & After Cleaning</h3>
                  <p className="text-xs text-slate-400">
                    Audit of every transformation performed on the immutable source dataset
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload('xlsx')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download Cleaned Excel</span>
                </button>
                <button
                  onClick={() => setIsCompareOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Before vs After Score & Metrics Comparison Cards */}
            {stats && (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-800 bg-slate-950/40">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Reliability Score</div>
                  <div className="text-base font-bold font-mono text-cyan-400 mt-1">
                    {stats.quality_score_before}% → <span className="text-emerald-400">{stats.quality_score_after}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Row Count</div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {stats.original_row_count} → <span className="text-cyan-400">{stats.cleaned_row_count}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Duplicate Records</div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {stats.duplicates_before} → <span className="text-emerald-400">{stats.duplicates_after}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Corrections Applied</div>
                  <div className="text-base font-bold font-mono text-cyan-400 mt-1">
                    {stats.corrections_applied} fixes
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Changes Log */}
            <div className="flex-1 overflow-auto p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-300 mb-2">Cell-Level Modifications & Corrections ({appliedCorrections.length})</div>
              
              {appliedCorrections.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No modifications applied. Dataset matched all clean constraints.
                </div>
              ) : (
                appliedCorrections.map((corr) => (
                  <div 
                    key={corr.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{corr.record_identifier}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950/80 border border-violet-800 text-violet-300">
                          {corr.column}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">({corr.rule_name})</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-medium">Applied</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 rounded bg-rose-950/30 border border-rose-900/50 text-rose-300 truncate">
                        <span className="text-[10px] text-rose-500 block">ORIGINAL:</span>
                        <span>{corr.original_value === null ? 'null' : String(corr.original_value)}</span>
                      </div>
                      <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 truncate">
                        <span className="text-[10px] text-emerald-500 block">CORRECTED:</span>
                        <span>{corr.cleaned_value === null ? 'null' : String(corr.cleaned_value)}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      Rationale: {corr.rationale}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px]">Source dataset remains 100% immutable in storage</span>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors cursor-pointer"
              >
                Close Comparison
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVIEW & CUSTOM CLEANING SETTINGS MODAL */}
      {/* ========================================================================= */}
      {isReviewSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cleaning Review & Policy Controls</h3>
                  <p className="text-xs text-slate-400">Select which cleaning strategies and corrections to execute</p>
                </div>
              </div>
              <button
                onClick={() => setIsReviewSettingsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-4 text-xs">
              
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300">Cleaning Strategies:</div>

                {[
                  { key: 'normalize_casing_whitespace', title: 'Casing & Category Standardization', desc: 'Converts non-standard department casing and city variants (e.g. nagpur/NAGPUR -> Nagpur).' },
                  { key: 'standardize_dates', title: 'Date Format Normalization (ISO-8601)', desc: 'Converts slash and dash formats (DD/MM/YYYY) into unambiguous YYYY-MM-DD.' },
                  { key: 'remove_duplicates', title: 'Entity Record Deduplication', desc: 'Identifies duplicate student or customer identifiers and archives redundant instances.' },
                  { key: 'impute_missing_numeric', title: 'Statistical Cohort Median Imputation', desc: 'Imputes missing compensation packages for confirmed placed students using cohort median.' },
                  { key: 'fix_numeric_bounds', title: 'Numeric Bounds & Validity Rectification', desc: 'Inverts accidental negative compensation signs and normalizes scale overflow.' },
                  { key: 'normalize_emails', title: 'Email Format Normalization', desc: 'Converts emails to lowercase and removes trailing punctuation or typos.' },
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={Boolean((options as any)[item.key])}
                      onChange={(e) => setOptions({ ...options, [item.key]: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Individual Corrections Review */}
              {appliedCorrections.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Exclude Specific Corrections ({rejectedCorrectionIds.length} excluded):</div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-1">
                    {appliedCorrections.map((corr) => {
                      const isRejected = rejectedCorrectionIds.includes(corr.id);
                      return (
                        <div 
                          key={corr.id}
                          onClick={() => toggleRejectCorrection(corr.id)}
                          className={`flex items-center justify-between p-2 rounded border text-[11px] cursor-pointer transition-colors ${
                            isRejected 
                              ? 'bg-rose-950/40 border-rose-900/60 text-rose-300 line-through' 
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="truncate max-w-[280px]">
                            {corr.record_identifier} [{corr.column}]: {String(corr.original_value)} → {String(corr.cleaned_value)}
                          </span>
                          <span className={`text-[10px] font-mono font-medium ${isRejected ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {isRejected ? 'Excluded' : 'Approved'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button
                onClick={() => setIsReviewSettingsOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomCleaning}
                disabled={isCleaning}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {isCleaning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Applying Corrections...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Approved Corrections</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
