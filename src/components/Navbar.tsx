import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  ShieldAlert
} from 'lucide-react';
import { User } from '../types/fixora';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLoadDemo: () => void;
  isLoadingDemo: boolean;
  isInApp: boolean;
  user?: User | null;
  onLogout?: () => void;
  onNavigateToSignIn?: () => void;
  onNavigateToSignUp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onLoadDemo,
  isLoadingDemo,
  isInApp,
  user,
  onLogout,
  onNavigateToSignIn,
  onNavigateToSignUp
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Strict Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Nav Links) — Zone 3 (Actions & Auth) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onNavigate(user ? 'overview' : 'landing')}
          className="flex items-center gap-2.5 text-left text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-sm shadow-violet-900/40">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white font-sans">Fixora</span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {!isInApp ? (
            <>
              <button
                onClick={() => onNavigate('landing')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentView === 'landing' ? 'text-cyan-400' : 'hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => onNavigate('detective')}
                className="whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer"
              >
                Data Detective
              </button>
              <button
                onClick={() => onNavigate('repair-lab')}
                className="whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer"
              >
                Repair Lab
              </button>
              <button
                onClick={() => onNavigate('drift')}
                className="whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer"
              >
                Drift Radar
              </button>
              <button
                onClick={() => onNavigate('passport')}
                className="whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer"
              >
                Trust Passport
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('overview')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentView === 'overview' ? 'text-cyan-400' : 'hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('datasets')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentView === 'datasets' ? 'text-cyan-400' : 'hover:text-white'
                }`}
              >
                Datasets
              </button>
              <button
                onClick={() => onNavigate('detective')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentView === 'detective' ? 'text-cyan-400' : 'hover:text-white'
                }`}
              >
                Detective
              </button>
              <button
                onClick={() => onNavigate('repair-lab')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentView === 'repair-lab' ? 'text-cyan-400' : 'hover:text-white'
                }`}
              >
                Repair Lab
              </button>
              <button
                onClick={() => onNavigate('lineage')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  currentView === 'lineage' ? 'text-cyan-400' : 'hover:text-white'
                }`}
              >
                Audit & Versions
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & User Authentication Menu */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onLoadDemo}
            disabled={isLoadingDemo}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Load realistic sample placement & enrollment datasets"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isLoadingDemo ? 'Resetting Demo...' : 'Load Demo Data'}</span>
          </button>

          {user ? (
            /* Authenticated User Menu */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                aria-label="User Profile Menu"
              >
                <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-medium text-white max-w-[120px] truncate">{user.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono capitalize">{user.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950 text-violet-300 border border-violet-800/60 uppercase tracking-wider">
                      Role: {user.role}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('overview');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-md transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span>Workspace Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-md transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span>Settings & Keys</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Visitor Options */
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToSignIn}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onNavigateToSignUp}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-md shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isInApp && user && (
            <button
              onClick={() => onNavigate('datasets')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-md shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Ingest</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
