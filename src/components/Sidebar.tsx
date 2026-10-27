import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  SearchCode, 
  Wrench, 
  Activity, 
  GitFork, 
  CheckSquare, 
  ArrowLeftRight, 
  History, 
  FileCheck2, 
  Flame, 
  Settings,
  ChevronRight,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { User } from '../types/fixora';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  openIssuesCount?: number;
  qualityScore?: number;
  user?: User | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  openIssuesCount = 0,
  qualityScore,
  user,
  onLogout
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'datasets', label: 'Datasets', icon: Database },
    { 
      id: 'detective', 
      label: 'Data Detective', 
      icon: SearchCode,
      badge: openIssuesCount > 0 ? openIssuesCount : undefined
    },
    { id: 'repair-lab', label: 'Repair Lab', icon: Wrench, highlight: true },
    { id: 'drift', label: 'Drift Radar', icon: Activity },
    { id: 'blast-radius', label: 'Dependency Map', icon: GitFork },
    { id: 'rules', label: 'Validation Rules', icon: CheckSquare },
    { id: 'cross-dataset', label: 'Cross-Dataset Match', icon: ArrowLeftRight },
    { id: 'firewall', label: 'Reliability Firewall', icon: Flame },
    { id: 'lineage', label: 'Audit & Versions', icon: History },
    { id: 'passport', label: 'Trust Passport', icon: FileCheck2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-900">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium text-slate-300">Auditing Workspace</span>
          {qualityScore !== undefined && (
            <span className="tabular-nums font-mono text-cyan-400 font-semibold">{qualityScore}% Score</span>
          )}
        </div>
        <div className="text-xs text-slate-500 truncate">
          Placement Cohort 2025-2026
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-slate-800/90 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? (item.highlight ? 'text-cyan-400' : 'text-violet-400') : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono tabular-nums font-semibold bg-rose-950/80 text-rose-300 border border-rose-900/40 rounded">
                  {item.badge}
                </span>
              )}

              {isActive && item.badge === undefined && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & session footer */}
      {user && (
        <div className="p-3 border-t border-slate-900 bg-slate-950/80">
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-medium text-white truncate">{user.name}</span>
                <span className="text-[10px] font-mono text-cyan-400 truncate">{user.email}</span>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out of Fixora"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-slate-900/80 bg-slate-950/40">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
          <span className="text-[11px] font-sans">Deterministic Core Active</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500">
          Source originals preserved immutable.
        </div>
      </div>
    </aside>
  );
};
