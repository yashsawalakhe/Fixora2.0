import React from 'react';
import { 
  ShieldCheck, 
  SearchCode, 
  Wrench, 
  Activity, 
  GitFork, 
  FileCheck2, 
  CheckSquare, 
  ArrowRight, 
  Lock, 
  History, 
  Sparkles,
  TrendingUp,
  GraduationCap,
  Building2,
  Landmark,
  Microscope,
  Cpu
} from 'lucide-react';

interface PublicLandingProps {
  onStartAnalysis: () => void;
  onExploreDemo: () => void;
  onNavigate: (view: string) => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  onStartAnalysis,
  onExploreDemo,
  onNavigate
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-900 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[400px] h-[250px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 rounded-md mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Deterministic Data Reliability & Investigation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 font-sans text-balance leading-tight">
            Your data deserves evidence, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">
              not guesses.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed text-balance">
            Detect data quality issues, investigate root causes, simulate counterfactual repair strategies, and verify every change before it ever touches your workflow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartAnalysis}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-lg shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Analyze your dataset</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Explore live demo dataset</span>
            </button>
          </div>

          <div className="mt-14 pt-8 border-t border-slate-900 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1">Immutable Raw Sources</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400">6 Engines</div>
              <div className="text-xs text-slate-400 mt-1">Deterministic Scanners</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-violet-400">Zero</div>
              <div className="text-xs text-slate-400 mt-1">Silent In-Place Mutations</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">SHA-256</div>
              <div className="text-xs text-slate-400 mt-1">Cryptographic Passports</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Step Workflow */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              The 6-Step Reliability Workflow
            </h2>
            <p className="text-sm text-slate-400">
              From ingestion to downstream consumption, every operation is governed by strict evidence and human approval.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { step: '01', title: 'Upload', desc: 'Secure CSV/XLSX ingest with pre-flight schema quarantine.' },
              { step: '02', title: 'Detect', desc: 'Deterministic scan across missing, duplicates, casing, and outliers.' },
              { step: '03', title: 'Investigate', desc: 'Root cause clustering and causal hypothesis isolation.' },
              { step: '04', title: 'Simulate', desc: 'Counterfactual Repair Lab compares strategies side by side.' },
              { step: '05', title: 'Approve', desc: 'Human-in-the-loop signoff spawns new immutable version.' },
              { step: '06', title: 'Verify', desc: 'Cryptographic Trust Passport generation and drift audit.' },
            ].map((st, i) => (
              <div 
                key={i}
                className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-xs font-mono font-semibold text-cyan-400 mb-2">
                    Step {st.step}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{st.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flagship Differentiating Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Engineered for Rigorous Investigation
            </h2>
            <p className="text-sm text-slate-400">
              Fixora replaces blind script find-and-replace with transparent causal analysis and isolated simulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-violet-950/80 border border-violet-800/40 flex items-center justify-center text-violet-400 mb-4">
                <SearchCode className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Detective & Hypotheses</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Clusters correlated findings into verifiable root-cause hypotheses—distinguishing format drift from bulk ingestion corruption and primary identifier collisions.
              </p>
              <button
                onClick={() => onNavigate('detective')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Explore Detective</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors relative overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-4">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Counterfactual Repair Lab</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Test alternative strategies (Median Imputation, Canonical Normalization, Deduplication, or Flag for Review) in an isolated sandbox with cell-level diff previews.
              </p>
              <button
                onClick={() => onNavigate('repair-lab')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Repair Lab</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-4">
                <GitFork className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Blast-Radius Dependency Map</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Map column ripple effects onto calculated metrics, aggregate department reports, and downstream validation rules before applying any repair.
              </p>
              <button
                onClick={() => onNavigate('blast-radius')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Dependency Map</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-800/40 flex items-center justify-center text-sky-400 mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Drift Radar</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Compare dataset versions to track missingness deltas, category distribution shifts, and quantile changes without mistaking valid updates for errors.
              </p>
              <button
                onClick={() => onNavigate('drift')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect Drift Radar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800/40 flex items-center justify-center text-amber-400 mb-4">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Adaptive Rule Builder</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Define and test custom validation rules (bounds, categories, regex, and cross-column rules) with instant test evaluation against real records.
              </p>
              <button
                onClick={() => onNavigate('rules')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Configure Rules</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800/40 flex items-center justify-center text-indigo-400 mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Verifiable Trust Passport</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Generate tamper-evident quality passport certificates featuring SHA-256 fingerprinting, documented scoring formulas, and immutable audit logs.
              </p>
              <button
                onClick={() => onNavigate('passport')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Passport Spec</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Target Domain Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Built for Critical Domain Operations
            </h2>
            <p className="text-sm text-slate-400">
              Where data quality failure translates directly to failed decisions, lost revenue, or accreditation violations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Higher Education & Placements',
                desc: 'Audit student cohorts, detect duplicate roll numbers, reconcile placement CTCs, and verify NIRF / accreditation disclosures.'
              },
              {
                icon: Building2,
                title: 'Enterprise BI & Financials',
                desc: 'Prevent casing fractures in department aggregations and isolate missing values before data reaches executive dashboards.'
              },
              {
                icon: Landmark,
                title: 'Public-Sector & Regulatory',
                desc: 'Ensure compliance with official taxonomies and retain full cryptographic provenance for every record change.'
              },
              {
                icon: Microscope,
                title: 'Scientific & Clinical Trials',
                desc: 'Strictly distinguish statistical outliers from equipment failure; never fabricate missing patient indicators.'
              },
              {
                icon: Cpu,
                title: 'Data Platform Engineers',
                desc: 'Run pre-flight firewall tests on incoming batches to quarantine malformed schemas and prevent pipeline downtime.'
              },
              {
                icon: TrendingUp,
                title: 'Operational Reporting',
                desc: 'Maintain version history time machine so operations can instantly roll back to known clean historical snapshots.'
              }
            ].map((uc, i) => {
              const Icon = uc.icon;
              return (
                <div key={i} className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{uc.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{uc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & First Principles Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              The Fixora Reliability Compact
            </h2>
            <p className="text-sm text-slate-400">
              Our core product principles guarantee data integrity at every tier.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Lock,
                title: '1. Never silently modify uploaded data',
                desc: 'The original uploaded file is permanently preserved as an immutable source snapshot. All modifications exist only as derived versions.'
              },
              {
                icon: CheckSquare,
                title: '2. Human approval required for every repair',
                desc: 'Every transformation must be previewed side-by-side in the Repair Lab with cell-level diffs before any derived version is published.'
              },
              {
                icon: SearchCode,
                title: '3. Distinguish observed facts from hypotheses',
                desc: 'Scan findings represent empirical facts. Root-cause clusters and AI suggestions are explicitly labeled as hypotheses.'
              },
              {
                icon: History,
                title: '4. Reversible lineage with tamper-evident audit logs',
                desc: 'Every change is logged with actor, timestamp, and rationale. Any dataset can be rolled back to any prior version instantly.'
              }
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">{p.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-500 text-xs border-t border-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-slate-300">Fixora 2.0</span>
            <span aria-hidden="true">·</span>
            <span>Fix the noise. Find the truth.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('detective')} className="hover:text-slate-300 transition-colors cursor-pointer">Data Detective</button>
            <button onClick={() => onNavigate('repair-lab')} className="hover:text-slate-300 transition-colors cursor-pointer">Repair Lab</button>
            <button onClick={() => onNavigate('lineage')} className="hover:text-slate-300 transition-colors cursor-pointer">Lineage</button>
            <button onClick={() => onNavigate('passport')} className="hover:text-slate-300 transition-colors cursor-pointer">Trust Passport</button>
          </div>

          <div className="text-slate-600">
            Evidence-Driven Data Reliability Platform
          </div>
        </div>
      </footer>
    </div>
  );
};
