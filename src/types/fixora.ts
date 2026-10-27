export interface User {
  id: string;
  name: string;
  email: string;
  role: 'investigator' | 'admin' | 'auditor';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IssueCategory = 
  | 'missing_value'
  | 'duplicate'
  | 'type_violation'
  | 'format_inconsistency'
  | 'validation_violation'
  | 'statistical_anomaly';

export type IssueStatus = 'open' | 'investigating' | 'approved_for_repair' | 'rejected' | 'deferred' | 'resolved';

export interface Issue {
  id: string;
  scan_id: string;
  dataset_id: string;
  dataset_version_id: string;
  record_identifier: string; // e.g. "Row 4 (STU-1084)"
  row_index: number;
  column_name: string;
  original_value: any;
  category: IssueCategory;
  severity: IssueSeverity;
  rule_id: string;
  rule_name: string;
  evidence: string;
  explanation: string;
  suggested_action?: string;
  confidence_method: string;
  status: IssueStatus;
}

export interface IssueCluster {
  id: string;
  title: string;
  category: IssueCategory;
  severity: IssueSeverity;
  column_name: string;
  issue_count: number;
  affected_percentage: number;
  hypothesis: string;
  evidence_summary: string;
  recommended_strategy: string;
  issue_ids: string[];
}

export interface ColumnProfile {
  name: string;
  inferred_type: 'string' | 'number' | 'date' | 'boolean' | 'email';
  total_count: number;
  null_count: number;
  null_percentage: number;
  unique_count: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  std_dev?: number;
  sample_values: any[];
  top_categories?: { value: string; count: number }[];
}

export interface DatasetVersion {
  id: string;
  dataset_id: string;
  version_number: number;
  parent_version_id: string | null;
  change_summary: string;
  row_count: number;
  column_count: number;
  created_at: string;
  created_by: string;
  is_immutable: boolean;
  quality_score?: number;
}

export interface Dataset {
  id: string;
  name: string;
  original_filename: string;
  file_type: 'csv' | 'xlsx' | 'json';
  row_count: number;
  column_count: number;
  columns: string[];
  column_profiles: ColumnProfile[];
  current_version_id: string;
  created_at: string;
  updated_at: string;
  is_demo?: boolean;
}

export interface QualityScoreDetails {
  completeness: number; // 0-100
  validity: number;     // 0-100
  consistency: number;  // 0-100
  uniqueness: number;   // 0-100
  overall: number;      // 0-100
  formula: string;
  inapplicable_dimensions: string[];
}

export interface Scan {
  id: string;
  dataset_id: string;
  dataset_version_id: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  quality_score: number;
  qualityScore?: number;
  score_details: QualityScoreDetails;
  total_issues: number;
  issues_by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  issues_by_category: Record<IssueCategory, number>;
  clusters: IssueCluster[];
  started_at: string;
  completed_at: string;
}

export type RepairStrategyType =
  | 'flag_for_review'
  | 'statistical_imputation'
  | 'canonical_normalization'
  | 'deduplicate'
  | 'trusted_reference_match'
  | 'exclude_from_analysis'
  | 'custom_rule';

export interface CellDiff {
  row_index: number;
  record_identifier: string;
  column: string;
  old_value: any;
  new_value: any;
  rationale: string;
  status: 'proposed' | 'approved' | 'rejected';
}

export interface RepairScenario {
  id: string;
  dataset_id: string;
  dataset_version_id: string;
  name: string;
  strategy: RepairStrategyType;
  target_columns: string[];
  parameters: Record<string, any>;
  assumptions: string[];
  risk_level: 'low' | 'moderate' | 'high';
  affected_records_count: number;
  unresolved_issues_count: number;
  new_warnings: string[];
  estimated_score_before: number;
  estimated_score_after: number;
  transformations_summary: string;
  diff_preview: CellDiff[];
  created_at: string;
  status: 'simulated' | 'approved' | 'rejected';
}

export interface BlastRadiusNode {
  id: string;
  label: string;
  type: 'column' | 'derived_metric' | 'validation_rule' | 'report' | 'dependent_dataset';
  impact_level: 'direct' | 'high_ripple' | 'moderate_ripple' | 'unaffected';
  details: string;
}

export interface BlastRadiusEdge {
  from: string;
  to: string;
  relationship: string;
}

export interface BlastRadiusAnalysis {
  scenario_id: string;
  target_column: string;
  direct_records_affected: number;
  affected_derived_metrics: {
    name: string;
    formula: string;
    current_value: string;
    simulated_value: string;
    impact_description: string;
  }[];
  related_validation_rules: string[];
  dependent_reports: string[];
  nodes: BlastRadiusNode[];
  edges: BlastRadiusEdge[];
  warnings: string[];
  recomputation_effort: 'instant' | 'moderate' | 'heavy';
}

export interface DriftColumnStat {
  column: string;
  type: string;
  v1_null_rate: number;
  v2_null_rate: number;
  null_rate_delta: number;
  v1_unique_count: number;
  v2_unique_count: number;
  v1_mean?: number;
  v2_mean?: number;
  v1_min?: any;
  v2_min?: any;
  v1_max?: any;
  v2_max?: any;
  v1_distribution?: { category: string; percentage: number }[];
  v2_distribution?: { category: string; percentage: number }[];
  drift_severity: 'none' | 'low' | 'moderate' | 'high';
  drift_summary: string;
}

export interface DriftComparison {
  id: string;
  dataset_id: string;
  base_version_id: string;
  base_version_number: number;
  target_version_id: string;
  target_version_number: number;
  compared_at: string;
  total_columns_compared: number;
  columns_with_drift: number;
  schema_changes: {
    added_columns: string[];
    removed_columns: string[];
    type_changes: { column: string; from: string; to: string }[];
  };
  column_stats: DriftColumnStat[];
  overall_drift_score: number; // 0 to 100
  summary: string;
}

export interface ValidationRule {
  id: string;
  dataset_id: string;
  name: string;
  description: string;
  rule_type: 
    | 'required_field'
    | 'unique_value'
    | 'numeric_range'
    | 'allowed_category'
    | 'date_format_range'
    | 'regex_format'
    | 'cross_column'
    | 'custom_missing_policy';
  target_column: string;
  secondary_column?: string;
  parameters: Record<string, any>;
  severity: IssueSeverity;
  enabled: boolean;
  version: number;
  created_at: string;
}

export interface CrossDatasetMatch {
  key_value: string;
  dataset_a_row_index: number;
  dataset_b_row_index: number;
  status: 'exact_match' | 'conflict_detected' | 'unmatched_in_b' | 'unmatched_in_a';
  conflicts: {
    attribute: string;
    value_a: any;
    value_b: any;
  }[];
  rationale: string;
}

export interface CrossDatasetResult {
  dataset_a_id: string;
  dataset_b_id: string;
  dataset_a_name: string;
  dataset_b_name: string;
  key_column_a: string;
  key_column_b: string;
  mapped_columns: { col_a: string; col_b: string }[];
  total_a_records: number;
  total_b_records: number;
  exact_matches: number;
  conflicting_records: number;
  unmatched_a_records: number;
  unmatched_b_records: number;
  sample_matches: CrossDatasetMatch[];
}

export interface TrustPassport {
  id: string;
  dataset_id: string;
  dataset_name: string;
  dataset_version_id: string;
  version_number: number;
  report_id: string;
  report_hash: string; // SHA-256
  generated_at: string;
  scan_timestamp: string;
  quality_score: number;
  score_details: QualityScoreDetails;
  total_records: number;
  total_columns: number;
  issue_counts_by_severity: Record<IssueSeverity, number>;
  issue_counts_by_category: Record<IssueCategory, number>;
  approved_repairs_count: number;
  rejected_repairs_count: number;
  remaining_unresolved_count: number;
  provenance: {
    original_filename: string;
    parent_version: string | null;
    created_by: string;
  };
  known_limitations: string[];
  audit_reference_id: string;
}

export interface AuditLog {
  id: string;
  dataset_id?: string;
  dataset_name?: string;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  timestamp: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface FirewallCheckResult {
  file_name: string;
  status: 'passed' | 'quarantined' | 'rejected';
  schema_conformance: {
    matches_expected_columns: boolean;
    missing_columns: string[];
    unexpected_columns: string[];
  };
  critical_violations_count: number;
  violations: {
    rule_name: string;
    column: string;
    severity: IssueSeverity;
    message: string;
  }[];
  is_held_in_quarantine: boolean;
  quarantine_reason?: string;
  override_allowed: boolean;
  overridden_by?: string;
  override_reason?: string;
}

export interface AppliedCorrection {
  id: string;
  row_index: number;
  record_identifier: string;
  column: string;
  original_value: any;
  cleaned_value: any;
  category: string;
  rule_name: string;
  rationale: string;
  applied: boolean;
}

export interface CleaningStats {
  original_row_count: number;
  cleaned_row_count: number;
  original_column_count: number;
  cleaned_column_count: number;
  missing_values_before: number;
  missing_values_after: number;
  duplicates_before: number;
  duplicates_after: number;
  invalid_values_before: number;
  invalid_values_after: number;
  corrections_applied: number;
  unresolved_issues: number;
  quality_score_before: number;
  quality_score_after: number;
}

export interface CleaningResult {
  dataset_id: string;
  dataset_name: string;
  cleaned_version_id: string;
  cleaned_at: string;
  stats: CleaningStats;
  applied_corrections: AppliedCorrection[];
  unresolved_issues: Issue[];
}

export interface CleaningOptions {
  normalize_casing_whitespace?: boolean;
  standardize_dates?: boolean;
  remove_duplicates?: boolean;
  impute_missing_numeric?: boolean;
  fix_numeric_bounds?: boolean;
  normalize_emails?: boolean;
  normalize_column_names?: boolean;
  approved_issue_ids?: string[];
  rejected_issue_ids?: string[];
}

