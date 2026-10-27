import { 
  Dataset, 
  DatasetVersion, 
  Scan, 
  Issue, 
  RepairScenario, 
  ValidationRule, 
  AuditLog, 
  TrustPassport, 
  FirewallCheckResult,
  CleaningStats,
  AppliedCorrection,
  CleaningResult,
  CleaningOptions
} from '../src/types/fixora.ts';
import { SAMPLE_PLACEMENT_DATA, SAMPLE_ENROLLMENT_LEDGER } from './sampleData.ts';
import { FixoraDataEngine } from './engine.ts';

export class FixoraStorage {
  private datasets = new Map<string, Dataset>();
  private datasetVersions = new Map<string, DatasetVersion>();
  private versionRows = new Map<string, Record<string, any>[]>(); // versionId -> rows
  private scans = new Map<string, Scan>();
  private scanIssues = new Map<string, Issue[]>(); // scanId -> issues
  private repairScenarios = new Map<string, RepairScenario>();
  private validationRules = new Map<string, ValidationRule[]>(); // datasetId -> rules
  private auditLogs: AuditLog[] = [];
  private trustPassports = new Map<string, TrustPassport>();
  private quarantineHoldings = new Map<string, FirewallCheckResult>();
  private cleanedDatasets = new Map<string, {
    rows: Record<string, any>[];
    stats: CleaningStats;
    applied_corrections: AppliedCorrection[];
    unresolved_issues: Issue[];
    cleaned_at: string;
    version_id: string;
  }>();

  constructor() {
    this.seedDemoData();
  }

  private seedDemoData() {
    // 1. Placement Dataset
    const ds1Id = 'ds_placement_2025_2026';
    const v1Id = 'ver_placement_v1';
    
    const { columns: cols1, profiles: prof1 } = FixoraDataEngine.profileDataset(SAMPLE_PLACEMENT_DATA);

    const ds1: Dataset = {
      id: ds1Id,
      name: 'Student Placement & Academic Records (Batch 2025-2026)',
      original_filename: 'campus_placement_cohort_2025.csv',
      file_type: 'csv',
      row_count: SAMPLE_PLACEMENT_DATA.length,
      column_count: cols1.length,
      columns: cols1,
      column_profiles: prof1,
      current_version_id: v1Id,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      is_demo: true
    };

    const ver1: DatasetVersion = {
      id: v1Id,
      dataset_id: ds1Id,
      version_number: 1,
      parent_version_id: null,
      change_summary: 'Initial immutable upload of campus placement raw ingest.',
      row_count: SAMPLE_PLACEMENT_DATA.length,
      column_count: cols1.length,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      created_by: 'Placement Officer (System)',
      is_immutable: true
    };

    this.datasets.set(ds1Id, ds1);
    this.datasetVersions.set(v1Id, ver1);
    this.versionRows.set(v1Id, JSON.parse(JSON.stringify(SAMPLE_PLACEMENT_DATA)));

    // 2. Enrollment Master Ledger
    const ds2Id = 'ds_enrollment_ledger';
    const v2Id = 'ver_enrollment_v1';
    const { columns: cols2, profiles: prof2 } = FixoraDataEngine.profileDataset(SAMPLE_ENROLLMENT_LEDGER);

    const ds2: Dataset = {
      id: ds2Id,
      name: 'Central Academic Enrollment Ledger',
      original_filename: 'central_academic_enrollment_2022_2026.csv',
      file_type: 'csv',
      row_count: SAMPLE_ENROLLMENT_LEDGER.length,
      column_count: cols2.length,
      columns: cols2,
      column_profiles: prof2,
      current_version_id: v2Id,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      is_demo: true
    };

    const ver2: DatasetVersion = {
      id: v2Id,
      dataset_id: ds2Id,
      version_number: 1,
      parent_version_id: null,
      change_summary: 'Verified institutional enrollment register snapshot.',
      row_count: SAMPLE_ENROLLMENT_LEDGER.length,
      column_count: cols2.length,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      created_by: 'Registrar Office',
      is_immutable: true
    };

    this.datasets.set(ds2Id, ds2);
    this.datasetVersions.set(v2Id, ver2);
    this.versionRows.set(v2Id, JSON.parse(JSON.stringify(SAMPLE_ENROLLMENT_LEDGER)));

    // Seed initial validation rules
    const rules: ValidationRule[] = [
      {
        id: 'rule_gpa_bounds',
        dataset_id: ds1Id,
        name: 'GPA Scale Bounds [0.0 - 10.0]',
        description: 'Cumulative academic GPA must be bounded between 0.0 and 10.0.',
        rule_type: 'numeric_range',
        target_column: 'gpa',
        parameters: { min: 0.0, max: 10.0 },
        severity: 'critical',
        enabled: true,
        version: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'rule_required_student_id',
        dataset_id: ds1Id,
        name: 'Mandatory Student Identifier',
        description: 'Every record must possess a non-empty student ID.',
        rule_type: 'required_field',
        target_column: 'student_id',
        parameters: {},
        severity: 'critical',
        enabled: true,
        version: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'rule_status_domain',
        dataset_id: ds1Id,
        name: 'Placement Status Controlled Taxonomy',
        description: 'Status must belong to authorized institutional category enum.',
        rule_type: 'allowed_category',
        target_column: 'placement_status',
        parameters: { categories: ['Placed', 'Unplaced', 'Opted Out', 'Higher Studies', 'Internship'] },
        severity: 'high',
        enabled: true,
        version: 1,
        created_at: new Date().toISOString()
      }
    ];
    this.validationRules.set(ds1Id, rules);

    // Initial scan on Dataset 1
    const scanResult = FixoraDataEngine.scanDataset(ds1Id, v1Id, SAMPLE_PLACEMENT_DATA, rules);
    const initialScan: Scan = {
      id: `scan_${ds1Id}_v1`,
      dataset_id: ds1Id,
      dataset_version_id: v1Id,
      status: 'completed',
      quality_score: scanResult.qualityScore,
      score_details: scanResult.scoreDetails,
      total_issues: scanResult.issues.length,
      issues_by_severity: {
        critical: scanResult.issues.filter(i => i.severity === 'critical').length,
        high: scanResult.issues.filter(i => i.severity === 'high').length,
        medium: scanResult.issues.filter(i => i.severity === 'medium').length,
        low: scanResult.issues.filter(i => i.severity === 'low').length
      },
      issues_by_category: {
        missing_value: scanResult.issues.filter(i => i.category === 'missing_value').length,
        duplicate: scanResult.issues.filter(i => i.category === 'duplicate').length,
        type_violation: scanResult.issues.filter(i => i.category === 'type_violation').length,
        format_inconsistency: scanResult.issues.filter(i => i.category === 'format_inconsistency').length,
        validation_violation: scanResult.issues.filter(i => i.category === 'validation_violation').length,
        statistical_anomaly: scanResult.issues.filter(i => i.category === 'statistical_anomaly').length
      },
      clusters: scanResult.clusters,
      started_at: new Date(Date.now() - 3600000 * 20).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 20 + 2400).toISOString()
    };

    ver1.quality_score = scanResult.qualityScore;
    this.scans.set(initialScan.id, initialScan);
    this.scanIssues.set(initialScan.id, scanResult.issues);

    this.addAuditLog('System', 'INITIAL_INGEST', 'dataset', ds1Id, `Ingested immutable raw dataset '${ds1.name}'. Quality score: ${scanResult.qualityScore}% with ${scanResult.issues.length} detected findings.`);
  }

  getAllDatasets(): Dataset[] {
    return Array.from(this.datasets.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getDataset(id: string): Dataset | undefined {
    return this.datasets.get(id);
  }

  deleteDataset(id: string): boolean {
    const ds = this.datasets.get(id);
    if (!ds) return false;
    this.datasets.delete(id);
    this.addAuditLog('User', 'DELETE_DATASET', 'dataset', id, `Deleted dataset '${ds.name}'.`);
    return true;
  }

  createDataset(dataset: Dataset, initialRows: Record<string, any>[]): { dataset: Dataset; version: DatasetVersion } {
    this.datasets.set(dataset.id, dataset);
    
    const version: DatasetVersion = {
      id: dataset.current_version_id,
      dataset_id: dataset.id,
      version_number: 1,
      parent_version_id: null,
      change_summary: 'Initial raw upload snapshot (immutable source).',
      row_count: dataset.row_count,
      column_count: dataset.column_count,
      created_at: dataset.created_at,
      created_by: 'User Ingestion',
      is_immutable: true
    };

    this.datasetVersions.set(version.id, version);
    this.versionRows.set(version.id, initialRows);

    this.addAuditLog('User', 'UPLOAD_DATASET', 'dataset', dataset.id, `Uploaded '${dataset.original_filename}' (${dataset.row_count} rows, ${dataset.column_count} columns).`);

    return { dataset, version };
  }

  getDatasetVersions(datasetId: string): DatasetVersion[] {
    return Array.from(this.datasetVersions.values())
      .filter(v => v.dataset_id === datasetId)
      .sort((a, b) => b.version_number - a.version_number);
  }

  getVersion(versionId: string): DatasetVersion | undefined {
    return this.datasetVersions.get(versionId);
  }

  getVersionRows(versionId: string): Record<string, any>[] {
    return this.versionRows.get(versionId) || [];
  }

  createScan(datasetId: string, versionId?: string): { scan: Scan; issues: Issue[] } {
    const ds = this.datasets.get(datasetId);
    if (!ds) throw new Error('Dataset not found');

    const vId = versionId || ds.current_version_id;
    const rows = this.getVersionRows(vId);
    const rules = this.getRules(datasetId);

    const result = FixoraDataEngine.scanDataset(datasetId, vId, rows, rules);

    const scan: Scan = {
      id: `scan_${Date.now()}`,
      dataset_id: datasetId,
      dataset_version_id: vId,
      status: 'completed',
      quality_score: result.qualityScore,
      score_details: result.scoreDetails,
      total_issues: result.issues.length,
      issues_by_severity: {
        critical: result.issues.filter(i => i.severity === 'critical').length,
        high: result.issues.filter(i => i.severity === 'high').length,
        medium: result.issues.filter(i => i.severity === 'medium').length,
        low: result.issues.filter(i => i.severity === 'low').length
      },
      issues_by_category: {
        missing_value: result.issues.filter(i => i.category === 'missing_value').length,
        duplicate: result.issues.filter(i => i.category === 'duplicate').length,
        type_violation: result.issues.filter(i => i.category === 'type_violation').length,
        format_inconsistency: result.issues.filter(i => i.category === 'format_inconsistency').length,
        validation_violation: result.issues.filter(i => i.category === 'validation_violation').length,
        statistical_anomaly: result.issues.filter(i => i.category === 'statistical_anomaly').length
      },
      clusters: result.clusters,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    const ver = this.datasetVersions.get(vId);
    if (ver) {
      ver.quality_score = result.qualityScore;
    }

    this.scans.set(scan.id, scan);
    this.scanIssues.set(scan.id, result.issues);

    this.addAuditLog('User', 'RUN_SCAN', 'scan', scan.id, `Executed quality scan for ${ds.name} (Score: ${scan.quality_score}%, ${scan.total_issues} issues).`);

    return { scan, issues: result.issues };
  }

  getLatestScan(datasetId: string, versionId?: string): { scan: Scan; issues: Issue[] } | undefined {
    const dsScans = Array.from(this.scans.values())
      .filter(s => s.dataset_id === datasetId && (!versionId || s.dataset_version_id === versionId))
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

    if (dsScans.length === 0) return undefined;
    const latest = dsScans[0];
    return { scan: latest, issues: this.scanIssues.get(latest.id) || [] };
  }

  getScanIssues(scanId: string): Issue[] {
    return this.scanIssues.get(scanId) || [];
  }

  updateIssueStatus(scanId: string, issueId: string, status: Issue['status']): Issue | undefined {
    const issues = this.scanIssues.get(scanId);
    if (!issues) return undefined;
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return undefined;
    issue.status = status;
    this.addAuditLog('User', 'UPDATE_ISSUE', 'issue', issueId, `Marked issue '${issue.rule_name}' at ${issue.record_identifier} as ${status}.`);
    return issue;
  }

  createRepairScenario(scenario: RepairScenario): void {
    this.repairScenarios.set(scenario.id, scenario);
  }

  getRepairScenario(scenarioId: string): RepairScenario | undefined {
    return this.repairScenarios.get(scenarioId);
  }

  approveRepairScenario(scenarioId: string): { newVersion: DatasetVersion; diffsApplied: number } {
    const scenario = this.repairScenarios.get(scenarioId);
    if (!scenario) throw new Error('Scenario not found');

    const ds = this.datasets.get(scenario.dataset_id);
    if (!ds) throw new Error('Dataset not found');

    const parentVersion = this.datasetVersions.get(scenario.dataset_version_id);
    if (!parentVersion) throw new Error('Parent version not found');

    const parentRows = this.getVersionRows(parentVersion.id);
    const newRows = JSON.parse(JSON.stringify(parentRows)) as Record<string, any>[];

    let appliedCount = 0;
    scenario.diff_preview.forEach(diff => {
      if (diff.column === 'ALL_COLUMNS') {
        if (diff.new_value === '[Excluded Duplicate Row]') {
          newRows.splice(diff.row_index, 1);
          appliedCount++;
        }
      } else if (newRows[diff.row_index]) {
        newRows[diff.row_index][diff.column] = diff.new_value;
        appliedCount++;
      }
    });

    const newVersionNumber = parentVersion.version_number + 1;
    const newVersionId = `ver_${ds.id}_v${newVersionNumber}`;

    const newVersion: DatasetVersion = {
      id: newVersionId,
      dataset_id: ds.id,
      version_number: newVersionNumber,
      parent_version_id: parentVersion.id,
      change_summary: `Approved repair '${scenario.name}' (${scenario.strategy}). Applied ${appliedCount} transformations.`,
      row_count: newRows.length,
      column_count: Object.keys(newRows[0] || {}).length,
      created_at: new Date().toISOString(),
      created_by: 'Authorized Investigator',
      is_immutable: true,
      quality_score: scenario.estimated_score_after
    };

    ds.current_version_id = newVersionId;
    ds.row_count = newRows.length;
    ds.updated_at = new Date().toISOString();

    const { profiles: newProfiles } = FixoraDataEngine.profileDataset(newRows);
    ds.column_profiles = newProfiles;

    this.datasetVersions.set(newVersionId, newVersion);
    this.versionRows.set(newVersionId, newRows);

    scenario.status = 'approved';

    this.createScan(ds.id, newVersionId);

    this.addAuditLog('User', 'APPROVE_REPAIR', 'dataset_version', newVersionId, `Approved repair '${scenario.name}'. Generated immutable Dataset Version v${newVersionNumber} (${appliedCount} modifications).`);

    return { newVersion, diffsApplied: appliedCount };
  }

  rejectRepairScenario(scenarioId: string, reason: string = 'Rejected by investigator'): void {
    const scenario = this.repairScenarios.get(scenarioId);
    if (!scenario) throw new Error('Scenario not found');
    scenario.status = 'rejected';
    this.addAuditLog('User', 'REJECT_REPAIR', 'repair_scenario', scenarioId, `Rejected scenario '${scenario.name}'. Reason: ${reason}`);
  }

  rollbackToVersion(datasetId: string, targetVersionId: string): DatasetVersion {
    const ds = this.datasets.get(datasetId);
    if (!ds) throw new Error('Dataset not found');

    const targetVersion = this.datasetVersions.get(targetVersionId);
    if (!targetVersion) throw new Error('Target version not found');

    const targetRows = this.getVersionRows(targetVersion.id);
    const existingVersions = this.getDatasetVersions(datasetId);
    const maxVersionNumber = Math.max(...existingVersions.map(v => v.version_number));
    const rollbackVersionNumber = maxVersionNumber + 1;
    const rollbackVersionId = `ver_${datasetId}_v${rollbackVersionNumber}`;

    const rollbackVersion: DatasetVersion = {
      id: rollbackVersionId,
      dataset_id: datasetId,
      version_number: rollbackVersionNumber,
      parent_version_id: ds.current_version_id,
      change_summary: `Rollback: Cloned clean state from historical version v${targetVersion.version_number}.`,
      row_count: targetRows.length,
      column_count: Object.keys(targetRows[0] || {}).length,
      created_at: new Date().toISOString(),
      created_by: 'Authorized Investigator (Rollback)',
      is_immutable: true,
      quality_score: targetVersion.quality_score
    };

    ds.current_version_id = rollbackVersionId;
    ds.row_count = targetRows.length;
    ds.updated_at = new Date().toISOString();

    this.datasetVersions.set(rollbackVersionId, rollbackVersion);
    this.versionRows.set(rollbackVersionId, JSON.parse(JSON.stringify(targetRows)));

    this.addAuditLog('User', 'ROLLBACK_VERSION', 'dataset_version', rollbackVersionId, `Rolled back dataset '${ds.name}' to state of v${targetVersion.version_number}. Preserved historical audit trail.`);

    return rollbackVersion;
  }

  getRules(datasetId: string): ValidationRule[] {
    return this.validationRules.get(datasetId) || [];
  }

  addRule(rule: ValidationRule): void {
    const existing = this.validationRules.get(rule.dataset_id) || [];
    existing.push(rule);
    this.validationRules.set(rule.dataset_id, existing);
    this.addAuditLog('User', 'CREATE_RULE', 'validation_rule', rule.id, `Created rule '${rule.name}' for column '${rule.target_column}'.`);
  }

  toggleRule(datasetId: string, ruleId: string): ValidationRule | undefined {
    const rules = this.validationRules.get(datasetId);
    if (!rules) return undefined;
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return undefined;
    rule.enabled = !rule.enabled;
    this.addAuditLog('User', 'TOGGLE_RULE', 'validation_rule', ruleId, `${rule.enabled ? 'Enabled' : 'Disabled'} validation rule '${rule.name}'.`);
    return rule;
  }

  saveTrustPassport(passport: TrustPassport): void {
    this.trustPassports.set(passport.id, passport);
    this.addAuditLog('System', 'ISSUE_TRUST_PASSPORT', 'trust_passport', passport.report_id, `Generated verifiable Trust Passport '${passport.report_id}' with SHA-256: ${passport.report_hash.slice(0, 16)}...`);
  }

  getTrustPassport(reportId: string): TrustPassport | undefined {
    return Array.from(this.trustPassports.values()).find(p => p.report_id === reportId || p.id === reportId);
  }

  getLatestPassport(datasetId: string): TrustPassport | undefined {
    return Array.from(this.trustPassports.values())
      .filter(p => p.dataset_id === datasetId)
      .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())[0];
  }

  addAuditLog(actor: string, action: string, target_type: string, target_id: string, details: string, metadata?: Record<string, any>): void {
    this.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      actor,
      action,
      target_type,
      target_id,
      timestamp: new Date().toISOString(),
      details,
      metadata
    });
  }

  getAuditLogs(datasetId?: string): AuditLog[] {
    if (datasetId) {
      return this.auditLogs.filter(l => l.metadata?.dataset_id === datasetId || l.details.includes(datasetId));
    }
    return this.auditLogs;
  }

  holdInQuarantine(id: string, result: FirewallCheckResult): void {
    this.quarantineHoldings.set(id, result);
    this.addAuditLog('Firewall', 'QUARANTINE_FILE', 'firewall', id, `File '${result.file_name}' quarantined due to ${result.critical_violations_count} critical rule violations.`);
  }

  getQuarantineHolding(id: string): FirewallCheckResult | undefined {
    return this.quarantineHoldings.get(id);
  }

  overrideQuarantine(id: string, user: string, reason: string): boolean {
    const holding = this.quarantineHoldings.get(id);
    if (!holding) return false;
    holding.status = 'passed';
    holding.is_held_in_quarantine = false;
    holding.overridden_by = user;
    holding.override_reason = reason;
    this.addAuditLog(user, 'OVERRIDE_QUARANTINE', 'firewall', id, `Authorized override for quarantined file '${holding.file_name}'. Reason: ${reason}`);
    return true;
  }

  getOriginalRows(datasetId: string): { rows: Record<string, any>[]; filename: string; file_type: string } {
    const ds = this.datasets.get(datasetId);
    if (!ds) throw new Error('Dataset not found');

    const versions = this.getDatasetVersions(datasetId);
    const v1 = versions.find(v => v.version_number === 1) || versions[versions.length - 1];
    const originalRows = this.getVersionRows(v1 ? v1.id : ds.current_version_id);
    return {
      rows: JSON.parse(JSON.stringify(originalRows)),
      filename: ds.original_filename,
      file_type: ds.file_type
    };
  }

  getCleanedDataset(datasetId: string): {
    rows: Record<string, any>[];
    stats: CleaningStats;
    applied_corrections: AppliedCorrection[];
    unresolved_issues: Issue[];
    cleaned_at: string;
    version_id: string;
  } {
    const existing = this.cleanedDatasets.get(datasetId);
    if (existing) {
      return existing;
    }

    const ds = this.datasets.get(datasetId);
    if (!ds) throw new Error('Dataset not found');

    const rows = this.getVersionRows(ds.current_version_id);
    const scanData = this.getLatestScan(datasetId, ds.current_version_id);
    const cleanResult = FixoraDataEngine.cleanDataset(rows, scanData?.issues || []);

    const record = {
      rows: cleanResult.cleanedRows,
      stats: cleanResult.stats,
      applied_corrections: cleanResult.appliedCorrections,
      unresolved_issues: cleanResult.unresolvedIssues,
      cleaned_at: new Date().toISOString(),
      version_id: ds.current_version_id
    };

    this.cleanedDatasets.set(datasetId, record);
    return record;
  }

  cleanDataset(datasetId: string, options: CleaningOptions, user: string = 'Authorized Investigator'): {
    stats: CleaningStats;
    applied_corrections: AppliedCorrection[];
    unresolved_issues: Issue[];
    cleaned_at: string;
    version_id: string;
  } {
    const ds = this.datasets.get(datasetId);
    if (!ds) throw new Error('Dataset not found');

    const originalData = this.getOriginalRows(datasetId);
    const scanData = this.getLatestScan(datasetId);

    const cleanResult = FixoraDataEngine.cleanDataset(originalData.rows, scanData?.issues || [], options);

    const versions = this.getDatasetVersions(datasetId);
    const maxVer = Math.max(...versions.map(v => v.version_number), 1);
    const newVerNum = maxVer + 1;
    const newVersionId = `ver_${datasetId}_cleaned_v${newVerNum}`;

    const newVersion: DatasetVersion = {
      id: newVersionId,
      dataset_id: datasetId,
      version_number: newVerNum,
      parent_version_id: ds.current_version_id,
      change_summary: `Executed data cleaning: applied ${cleanResult.appliedCorrections.length} approved corrections. Score: ${cleanResult.stats.quality_score_after}%.`,
      row_count: cleanResult.cleanedRows.length,
      column_count: cleanResult.stats.cleaned_column_count,
      created_at: new Date().toISOString(),
      created_by: user,
      is_immutable: true,
      quality_score: cleanResult.stats.quality_score_after
    };

    this.datasetVersions.set(newVersionId, newVersion);
    this.versionRows.set(newVersionId, cleanResult.cleanedRows);

    const { profiles: newProfiles } = FixoraDataEngine.profileDataset(cleanResult.cleanedRows);
    ds.column_profiles = newProfiles;
    ds.row_count = cleanResult.cleanedRows.length;
    ds.current_version_id = newVersionId;
    ds.updated_at = new Date().toISOString();

    const record = {
      rows: cleanResult.cleanedRows,
      stats: cleanResult.stats,
      applied_corrections: cleanResult.appliedCorrections,
      unresolved_issues: cleanResult.unresolvedIssues,
      cleaned_at: new Date().toISOString(),
      version_id: newVersionId
    };

    this.cleanedDatasets.set(datasetId, record);
    this.createScan(datasetId, newVersionId);

    this.addAuditLog(user, 'CLEAN_DATASET', 'dataset', datasetId, `Cleaned dataset '${ds.name}' (${cleanResult.appliedCorrections.length} corrections applied, ${cleanResult.stats.unresolved_issues} unresolved). Generated version v${newVerNum}.`);

    return {
      stats: cleanResult.stats,
      applied_corrections: cleanResult.appliedCorrections,
      unresolved_issues: cleanResult.unresolvedIssues,
      cleaned_at: record.cleaned_at,
      version_id: newVersionId
    };
  }
}

export const fixoraStorage = new FixoraStorage();
