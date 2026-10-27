import { FixoraDataEngine } from '../server/engine.ts';
import { FixoraStorage } from '../server/storage.ts';
import { SAMPLE_PLACEMENT_DATA } from '../server/sampleData.ts';

/**
 * Fixora Automated Quality Engine & Integration Test Suite
 * Verifies end-to-end reliability principles:
 * Upload → Scan → Investigate → Simulate → Approve → Validate → Export
 */
async function runTests() {
  console.log('--- [Fixora Test Suite] Starting Execution ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // Test 1: Deterministic Quality Scanning & Detection
  console.log('\n1. Testing Scanning Engine & Rules:');
  const scanResult = FixoraDataEngine.scanDataset('ds_test', 'v1', SAMPLE_PLACEMENT_DATA);
  assert(scanResult.issues.length > 0, 'Detects data quality issues on realistic sample dataset');
  assert(scanResult.qualityScore > 0 && scanResult.qualityScore < 100, `Calculates empirical quality score (${scanResult.qualityScore}%)`);
  
  const missingIssues = scanResult.issues.filter(i => i.category === 'missing_value');
  assert(missingIssues.length >= 2, 'Flags missing compensation packages for confirmed placements');

  const dupIssues = scanResult.issues.filter(i => i.category === 'duplicate');
  assert(dupIssues.length >= 1, 'Identifies duplicate student identifier collision (STU-1082)');

  const casingIssues = scanResult.issues.filter(i => i.rule_id === 'R_CASING_INCONSISTENCY');
  assert(casingIssues.length >= 2, 'Flags department casing inconsistencies ("computer science")');

  const outlierIssues = scanResult.issues.filter(i => i.category === 'statistical_anomaly');
  assert(outlierIssues.length >= 1, 'Flags IQR statistical outliers (e.g. 94.5 LPA) without labeling as automatic errors');

  // Test 2: Counterfactual Repair Simulation (Zero In-Place Mutation)
  console.log('\n2. Testing Counterfactual Repair Simulator:');
  const storage = new FixoraStorage();
  const ds = storage.getDataset('ds_placement_2025_2026');
  assert(!!ds, 'Storage initializes pre-seeded realistic demo dataset');

  const originalSnapshot = JSON.stringify(SAMPLE_PLACEMENT_DATA);
  const scenario = FixoraDataEngine.simulateRepair(ds!.id, ds!.current_version_id, SAMPLE_PLACEMENT_DATA, {
    name: 'Test Canonical Normalization',
    strategy: 'canonical_normalization',
    target_columns: ['department', 'offer_date']
  });

  assert(scenario.diff_preview.length > 0, `Generates ${scenario.diff_preview.length} cell-level proposed diffs`);
  assert(scenario.estimated_score_after >= scenario.estimated_score_before, 'Forecasts improvement in quality reliability score');
  assert(JSON.stringify(SAMPLE_PLACEMENT_DATA) === originalSnapshot, 'CORE PRINCIPLE: Source dataset remains 100% immutable and unmutated during simulation');

  // Test 3: Approval and Derived Immutable Version Creation
  console.log('\n3. Testing Approval & Version Generation:');
  const v1Count = storage.getDatasetVersions(ds!.id).length;
  storage.createRepairScenario(scenario);
  const approval = storage.approveRepairScenario(scenario.id);

  assert(approval.diffsApplied > 0, `Applied ${approval.diffsApplied} diffs to generate derived version`);
  const v2Count = storage.getDatasetVersions(ds!.id).length;
  assert(v2Count === v1Count + 1, 'Approving repair produces new immutable version without overwriting prior');

  // Test 4: Rollback Lineage Capability
  console.log('\n4. Testing Time Machine Rollback:');
  const rollbackVer = storage.rollbackToVersion(ds!.id, 'ver_placement_v1');
  assert(rollbackVer.version_number === 3, 'Rollback produces clean derived version v3 pointing to historical state');

  // Test 5: Drift Radar Calculations
  console.log('\n5. Testing Data Drift Radar:');
  const r1 = storage.getVersionRows('ver_placement_v1');
  const r2 = storage.getVersionRows('ver_ds_placement_2025_2026_v2');
  const drift = FixoraDataEngine.compareDrift(ds!.id, 
    { id: 'v1', version_number: 1, rows: r1 },
    { id: 'v2', version_number: 2, rows: r2 }
  );
  assert(drift.total_columns_compared > 0, 'Compares column-by-column distribution shifts');

  // Test 6: Cryptographic Trust Passport Generation
  console.log('\n6. Testing Trust Passport & Cryptographic Fingerprinting:');
  const passport = FixoraDataEngine.generateTrustPassport(
    { id: ds!.id, name: ds!.name, original_filename: ds!.original_filename },
    { id: 'v2', version_number: 2, rows: r2, parent_version_id: 'v1' },
    { quality_score: 92, score_details: scanResult.scoreDetails, issues: [], completed_at: new Date().toISOString() },
    2,
    0
  );
  assert(passport.report_hash.length === 64, `Calculated 64-char SHA-256 report hash (${passport.report_hash.slice(0, 8)}...)`);
  assert(passport.report_id.startsWith('PASSPORT-'), 'Generates unique verifiable passport identifier');

  // Test Summary
  console.log(`\n--- Execution Summary: ${passed} Passed, ${failed} Failed ---`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
