import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PublicLanding } from './components/PublicLanding';
import { OverviewDashboard } from './components/OverviewDashboard';
import { DatasetExplorer } from './components/DatasetExplorer';
import { DataDetective } from './components/DataDetective';
import { RepairLab } from './components/RepairLab';
import { BlastRadiusView } from './components/BlastRadiusView';
import { DriftRadar } from './components/DriftRadar';
import { RuleBuilder } from './components/RuleBuilder';
import { CrossDatasetView } from './components/CrossDatasetView';
import { FirewallView } from './components/FirewallView';
import { TimeMachineView } from './components/TimeMachineView';
import { TrustPassportView } from './components/TrustPassportView';
import { AuditLogView } from './components/AuditLogView';
import { SettingsView } from './components/SettingsView';
import { SignInView } from './components/auth/SignInView';
import { SignUpView } from './components/auth/SignUpView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { ResetPasswordView } from './components/auth/ResetPasswordView';
import { Dataset, DatasetVersion, Scan, Issue, AuditLog, User } from './types/fixora';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [resetToken, setResetToken] = useState<string>('');
  
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [versions, setVersions] = useState<DatasetVersion[]>([]);
  const [latestScan, setLatestScan] = useState<Scan | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [repairLabInitialStrategy, setRepairLabInitialStrategy] = useState<string | undefined>(undefined);

  // Check URL parameters and authentication on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }

        // Check URL for reset token or specific path
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token') || urlParams.get('reset_token');
        if (tokenFromUrl) {
          setResetToken(tokenFromUrl);
          setCurrentView('reset-password');
        } else if (window.location.pathname === '/login') {
          setCurrentView('login');
        } else if (window.location.pathname === '/register') {
          setCurrentView('register');
        } else if (window.location.pathname === '/forgot-password') {
          setCurrentView('forgot-password');
        } else if (user) {
          // If already logged in and on root, default to landing or overview
          // keep landing as entry or let user launch console
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    initAuth();
    loadInitialData();
  }, []);

  // Initial load of datasets and audit logs
  const loadInitialData = async () => {
    try {
      const dsList = await api.getDatasets();
      setDatasets(dsList);

      if (dsList.length > 0) {
        const defaultDs = dsList[0];
        setSelectedDataset(defaultDs);
        await loadDatasetDetails(defaultDs.id);
      }

      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to initialize Fixora data', err);
    }
  };

  const loadDatasetDetails = async (datasetId: string) => {
    try {
      const { dataset, versions: verList } = await api.getDataset(datasetId);
      setSelectedDataset(dataset);
      setVersions(verList);

      const scanData = await api.getLatestScan(datasetId);
      if (scanData) {
        setLatestScan(scanData.scan);
        setIssues(scanData.issues);
      }
    } catch (err) {
      console.error('Failed to load dataset details', err);
    }
  };

  const handleSelectDataset = (id: string) => {
    loadDatasetDetails(id);
  };

  const handleTriggerScan = async () => {
    if (!selectedDataset) return;
    setIsScanning(true);
    try {
      const result = await api.triggerScan(selectedDataset.id, selectedDataset.current_version_id);
      setLatestScan(result.scan);
      setIssues(result.issues);
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Scan trigger error', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      // If user is not yet logged in, automatically log in as demo investigator
      if (!currentUser) {
        try {
          const authRes = await api.login('investigator@fixora.io', 'Password123!', false);
          setCurrentUser(authRes.user);
        } catch {
          // Non-blocking if demo login failed
        }
      }
      await api.loadDemoDataset();
      await loadInitialData();
      setCurrentView('overview');
    } catch (err) {
      console.error('Failed to reload demo dataset', err);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleNavigateToRepair = (strategy?: string) => {
    if (strategy) {
      setRepairLabInitialStrategy(strategy);
    }
    handleNavigateProtected('repair-lab');
  };

  // Safe navigation with authentication route protection
  const handleNavigateProtected = (view: string) => {
    const authViews = ['login', 'register', 'forgot-password', 'reset-password', 'landing'];
    if (!authViews.includes(view) && !currentUser) {
      // Prompt user to sign in first to access console
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout error', err);
    } finally {
      setCurrentUser(null);
      setCurrentView('landing');
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView('overview');
    loadInitialData();
  };

  const isAuthScreen = ['login', 'register', 'forgot-password', 'reset-password'].includes(currentView);
  const isInApp = !['landing', 'login', 'register', 'forgot-password', 'reset-password'].includes(currentView);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigateProtected}
        onLoadDemo={handleLoadDemo}
        isLoadingDemo={isLoadingDemo}
        isInApp={isInApp}
        user={currentUser}
        onLogout={handleLogout}
        onNavigateToSignIn={() => setCurrentView('login')}
        onNavigateToSignUp={() => setCurrentView('register')}
      />

      {/* Auth Screens */}
      {currentView === 'login' && (
        <SignInView
          onSuccess={handleAuthSuccess}
          onNavigateToSignUp={() => setCurrentView('register')}
          onNavigateToForgotPassword={() => setCurrentView('forgot-password')}
          onNavigateToLanding={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'register' && (
        <SignUpView
          onSuccess={handleAuthSuccess}
          onNavigateToSignIn={() => setCurrentView('login')}
          onNavigateToLanding={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'forgot-password' && (
        <ForgotPasswordView
          onNavigateToSignIn={() => setCurrentView('login')}
          onNavigateToResetPassword={(token) => {
            setResetToken(token);
            setCurrentView('reset-password');
          }}
          onNavigateToLanding={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'reset-password' && (
        <ResetPasswordView
          token={resetToken}
          onSuccess={() => setCurrentView('login')}
          onNavigateToSignIn={() => setCurrentView('login')}
          onNavigateToForgotPassword={() => setCurrentView('forgot-password')}
          onNavigateToLanding={() => setCurrentView('landing')}
        />
      )}

      {/* Public Landing Page */}
      {currentView === 'landing' && (
        <PublicLanding
          onStartAnalysis={() => {
            if (currentUser) {
              setCurrentView('datasets');
            } else {
              setCurrentView('login');
            }
          }}
          onExploreDemo={handleLoadDemo}
          onNavigate={handleNavigateProtected}
        />
      )}

      {/* Protected In-App Workspace */}
      {isInApp && (
        <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
          {/* Persistent Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigateProtected}
            openIssuesCount={issues.filter(i => i.status === 'open' || i.status === 'investigating').length}
            qualityScore={latestScan?.qualityScore}
            user={currentUser}
            onLogout={handleLogout}
          />

          {/* Application Viewport */}
          <main className="flex-1 overflow-y-auto bg-slate-950">
            {currentView === 'overview' && (
              <OverviewDashboard
                datasets={datasets}
                selectedDataset={selectedDataset}
                latestScan={latestScan}
                issues={issues}
                auditLogs={auditLogs}
                onSelectDataset={handleSelectDataset}
                onNavigate={handleNavigateProtected}
                onTriggerScan={handleTriggerScan}
                onLoadDemo={handleLoadDemo}
                isScanning={isScanning}
              />
            )}

            {currentView === 'datasets' && (
              <DatasetExplorer
                dataset={selectedDataset}
                datasets={datasets}
                onSelectDataset={handleSelectDataset}
                onTriggerScan={handleTriggerScan}
                onRefresh={loadInitialData}
                isScanning={isScanning}
              />
            )}

            {currentView === 'detective' && (
              <DataDetective
                dataset={selectedDataset}
                issues={issues}
                clusters={latestScan?.clusters || []}
                scanId={latestScan?.id || ''}
                onNavigateToRepair={handleNavigateToRepair}
                onRefreshIssues={() => {
                  if (selectedDataset) loadDatasetDetails(selectedDataset.id);
                }}
              />
            )}

            {currentView === 'repair-lab' && (
              <RepairLab
                dataset={selectedDataset}
                initialStrategy={repairLabInitialStrategy}
                onNavigateToLineage={() => setCurrentView('lineage')}
                onRefreshDataset={() => {
                  if (selectedDataset) loadDatasetDetails(selectedDataset.id);
                }}
              />
            )}

            {currentView === 'blast-radius' && (
              <BlastRadiusView
                dataset={selectedDataset}
                onNavigateToRepair={() => setCurrentView('repair-lab')}
              />
            )}

            {currentView === 'drift' && (
              <DriftRadar
                dataset={selectedDataset}
                versions={versions}
              />
            )}

            {currentView === 'rules' && (
              <RuleBuilder
                dataset={selectedDataset}
                onRefreshScan={handleTriggerScan}
              />
            )}

            {currentView === 'cross-dataset' && (
              <CrossDatasetView
                datasets={datasets}
              />
            )}

            {currentView === 'firewall' && (
              <FirewallView
                dataset={selectedDataset}
                onRefreshAudit={async () => {
                  const logs = await api.getAuditLogs();
                  setAuditLogs(logs);
                }}
              />
            )}

            {currentView === 'lineage' && (
              <TimeMachineView
                dataset={selectedDataset}
                versions={versions}
                onRefreshDataset={() => {
                  if (selectedDataset) loadDatasetDetails(selectedDataset.id);
                }}
                onNavigateToRepair={() => setCurrentView('repair-lab')}
              />
            )}

            {currentView === 'passport' && (
              <TrustPassportView
                dataset={selectedDataset}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
