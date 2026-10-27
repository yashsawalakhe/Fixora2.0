import { 
  User,
  Dataset, 
  DatasetVersion, 
  Scan, 
  Issue, 
  RepairScenario, 
  BlastRadiusAnalysis, 
  DriftComparison, 
  ValidationRule, 
  CrossDatasetResult, 
  TrustPassport, 
  AuditLog, 
  FirewallCheckResult,
  CleaningStats,
  AppliedCorrection,
  CleaningResult,
  CleaningOptions
} from '../types/fixora';

export const api = {
  // Authentication
  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string, remember_me: boolean = false): Promise<{ user: User; sessionId: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember_me })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sign in');
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; sessionId: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; devResetToken?: string; devResetUrl?: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password reset request failed');
    return data;
  },

  async validateResetToken(token: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      return !!data.valid;
    } catch {
      return false;
    }
  },

  async resetPassword(token: string, new_password: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password reset failed');
    return data;
  },

  // Datasets
  async getDatasets(): Promise<Dataset[]> {
    const res = await fetch('/api/datasets');
    const data = await res.json();
    return data.datasets || [];
  },

  async getDataset(id: string): Promise<{ dataset: Dataset; versions: DatasetVersion[] }> {
    const res = await fetch(`/api/datasets/${id}`);
    if (!res.ok) throw new Error('Dataset not found');
    return res.json();
  },

  async deleteDataset(id: string): Promise<boolean> {
    const res = await fetch(`/api/datasets/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  async getPreview(datasetId: string, versionId?: string, page = 1, limit = 50, search = ''): Promise<{
    dataset: Dataset;
    version_id: string;
    total_records: number;
    page: number;
    limit: number;
    total_pages: number;
    columns: string[];
    column_profiles: any[];
    rows: Record<string, any>[];
  }> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search
    });
    if (versionId) params.append('version_id', versionId);
    const res = await fetch(`/api/datasets/${datasetId}/preview?${params.toString()}`);
    return res.json();
  },

  async uploadDataset(formData: FormData): Promise<{ dataset: Dataset; version: DatasetVersion; scan: Scan }> {
    const res = await fetch('/api/datasets/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload dataset');
    }
    return res.json();
  },

  async loadDemoDataset(): Promise<void> {
    const res = await fetch('/api/datasets/load-demo', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to load demo data');
  },

  // Cleaning & Download Endpoints
  async cleanDataset(datasetId: string, options: CleaningOptions = {}): Promise<{
    success: boolean;
    stats: CleaningStats;
    applied_corrections: AppliedCorrection[];
    unresolved_issues: Issue[];
    cleaned_at: string;
    version_id: string;
  }> {
    const res = await fetch(`/api/datasets/${datasetId}/clean`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ options })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clean dataset');
    return data;
  },

  async getCleanedPreview(datasetId: string, page = 1, limit = 50, search = ''): Promise<{
    dataset_id: string;
    dataset_name: string;
    total_records: number;
    page: number;
    limit: number;
    total_pages: number;
    columns: string[];
    rows: Record<string, any>[];
    stats: CleaningStats;
    applied_corrections: AppliedCorrection[];
    unresolved_issues: Issue[];
  }> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search
    });
    const res = await fetch(`/api/datasets/${datasetId}/preview-cleaned?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to retrieve cleaned preview');
    return res.json();
  },

  async getComparison(datasetId: string): Promise<{
    dataset_id: string;
    dataset_name: string;
    stats: CleaningStats;
    applied_corrections: AppliedCorrection[];
    unresolved_issues: Issue[];
    sample_original: Record<string, any>[];
    sample_cleaned: Record<string, any>[];
  }> {
    const res = await fetch(`/api/datasets/${datasetId}/comparison`);
    if (!res.ok) throw new Error('Failed to retrieve comparison');
    return res.json();
  },

  getDownloadCleanedUrl(datasetId: string, format: 'xlsx' | 'csv' = 'xlsx'): string {
    return `/api/datasets/${datasetId}/download?format=${format}`;
  },

  getDownloadOriginalUrl(datasetId: string): string {
    return `/api/datasets/${datasetId}/download-original`;
  },

  // Scans & Issues
  async triggerScan(datasetId: string, versionId?: string): Promise<{ scan: Scan; issues: Issue[] }> {
    const res = await fetch(`/api/datasets/${datasetId}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version_id: versionId })
    });
    if (!res.ok) throw new Error('Failed to run quality scan');
    return res.json();
  },

  async getLatestScan(datasetId: string, versionId?: string): Promise<{ scan: Scan; issues: Issue[] }> {
    const url = versionId 
      ? `/api/datasets/${datasetId}/latest-scan?version_id=${versionId}`
      : `/api/datasets/${datasetId}/latest-scan`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch scan data');
    return res.json();
  },

  async updateIssueStatus(scanId: string, issueId: string, status: Issue['status']): Promise<Issue> {
    const res = await fetch(`/api/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scan_id: scanId, status })
    });
    const data = await res.json();
    return data.issue;
  },

  // Repair Lab
  async simulateRepair(payload: {
    dataset_id: string;
    version_id: string;
    name: string;
    strategy: string;
    target_columns: string[];
    parameters?: Record<string, any>;
  }): Promise<{ scenario: RepairScenario }> {
    const res = await fetch('/api/repair-scenarios/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Repair simulation failed');
    return res.json();
  },

  async approveRepair(scenarioId: string): Promise<{ success: boolean; newVersion: DatasetVersion; diffsApplied: number }> {
    const res = await fetch(`/api/repair-scenarios/${scenarioId}/approve`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to approve repair');
    return res.json();
  },

  async rejectRepair(scenarioId: string, reason?: string): Promise<void> {
    await fetch(`/api/repair-scenarios/${scenarioId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
  },

  // Blast Radius
  async analyzeBlastRadius(datasetId: string, scenarioId: string): Promise<{ analysis: BlastRadiusAnalysis }> {
    const res = await fetch('/api/impact/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset_id: datasetId, scenario_id: scenarioId })
    });
    if (!res.ok) throw new Error('Blast radius calculation failed');
    return res.json();
  },

  // Drift
  async compareDrift(datasetId: string, baseVersionId: string, targetVersionId: string): Promise<{ comparison: DriftComparison }> {
    const res = await fetch('/api/drift/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataset_id: datasetId,
        base_version_id: baseVersionId,
        target_version_id: targetVersionId
      })
    });
    if (!res.ok) throw new Error('Drift comparison failed');
    return res.json();
  },

  // Rules
  async getRules(datasetId: string): Promise<ValidationRule[]> {
    const res = await fetch(`/api/datasets/${datasetId}/rules`);
    const data = await res.json();
    return data.rules || [];
  },

  async createRule(datasetId: string, rule: Partial<ValidationRule>): Promise<ValidationRule> {
    const res = await fetch(`/api/datasets/${datasetId}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    const data = await res.json();
    return data.rule;
  },

  async toggleRule(datasetId: string, ruleId: string): Promise<ValidationRule> {
    const res = await fetch(`/api/rules/${ruleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset_id: datasetId })
    });
    const data = await res.json();
    return data.rule;
  },

  // Cross Dataset
  async compareCrossDataset(payload: {
    dataset_a_id: string;
    dataset_b_id: string;
    key_column_a?: string;
    key_column_b?: string;
    mapped_columns?: { col_a: string; col_b: string }[];
  }): Promise<{ result: CrossDatasetResult }> {
    const res = await fetch('/api/cross-dataset/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Cross-dataset comparison failed');
    return res.json();
  },

  // Trust Passport
  async generatePassport(datasetId: string, versionId?: string): Promise<{ passport: TrustPassport }> {
    const res = await fetch(`/api/datasets/${datasetId}/passport`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version_id: versionId })
    });
    if (!res.ok) throw new Error('Failed to generate Trust Passport');
    return res.json();
  },

  async getPassport(reportId: string): Promise<{ passport: TrustPassport }> {
    const res = await fetch(`/api/passports/${reportId}`);
    if (!res.ok) throw new Error('Passport not found');
    return res.json();
  },

  // Rollback
  async rollbackVersion(datasetId: string, targetVersionId: string): Promise<DatasetVersion> {
    const res = await fetch(`/api/datasets/${datasetId}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_version_id: targetVersionId })
    });
    const data = await res.json();
    return data.rollback_version;
  },

  // Firewall
  async testFirewall(formData: FormData): Promise<{ firewall_result: FirewallCheckResult }> {
    const res = await fetch('/api/firewall/validate', {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async overrideQuarantine(holdingId: string, reason: string): Promise<void> {
    const res = await fetch('/api/firewall/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holding_id: holdingId, reason })
    });
    if (!res.ok) throw new Error('Override failed');
  },

  // Audit Logs
  async getAuditLogs(datasetId?: string): Promise<AuditLog[]> {
    const url = datasetId ? `/api/audit-logs?dataset_id=${datasetId}` : '/api/audit-logs';
    const res = await fetch(url);
    const data = await res.json();
    return data.logs || [];
  },

  // AI Assistance
  async getAIStatus(): Promise<{ ai_configured: boolean; provider: string; status: string }> {
    const res = await fetch('/api/ai/status');
    return res.json();
  },

  async explainCluster(payload: any): Promise<any> {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};
