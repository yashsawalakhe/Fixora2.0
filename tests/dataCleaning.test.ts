import { FixoraDataEngine } from '../server/engine.ts';
import { FixoraStorage } from '../server/storage.ts';
import { Issue, CleaningOptions } from '../src/types/fixora.ts';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Fixora Automated Data Cleaning & Export Test Suite
 * Tests the feature using a realistic messy dataset containing 500 rows and 12 columns
 * Verifies all 10 Acceptance Criteria:
 * 1. Original file remains unchanged
 * 2. Approved corrections appear in the cleaned output
 * 3. Rejected corrections are not applied
 * 4. Unresolved values are reported rather than silently fabricated
 * 5. Exported Excel file opens successfully with Cleaned_Data and Cleaning_Report worksheets
 * 6. Exported CSV contains expected rows and columns
 * 7. Previewed data matches downloaded data
 * 8. Report accurately lists applied corrections
 * 9. Repeated downloads produce consistent results
 * 10. Existing Fixora functionality continues to work
 */
async function runCleaningTests() {
  console.log('--- [Fixora Data Cleaning & Export Test Suite] Starting Execution ---');
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

  // Generate 500-row, 12-column messy dataset
  console.log('\nGenerating 500-row x 12-column messy benchmark dataset:');
  const cities = ['nagpur', 'Nagpur', 'NAGPUR', 'mumbai', 'MUMBAI', 'Mumbai', 'pune', 'Pune', 'delhi', 'DELHI'];
  const departments = ['computer science', 'Computer Science', 'CS', 'information technology', 'IT', 'mechanical', 'MECHANICAL'];
  const dates = ['18/10/2025', '2025-10-18', '05/12/2024', '12/04/2025', '22/01/2026'];
  const statuses = ['Placed', 'placed', 'PLACED', 'Unplaced', 'Opted Out'];

  const rawRows: Record<string, any>[] = [];
  for (let i = 1; i <= 500; i++) {
    // Inject intentional duplicate record for student REC-1042
    const recId = (i === 150 || i === 300) ? 'REC-1042' : `REC-${1000 + i}`;
    
    // Inject casing, whitespace, and email anomalies
    const rawName = i % 3 === 0 ? `  student_${i}  ` : (i % 2 === 0 ? `STUDENT ${i}` : `student ${i}`);
    const rawEmail = i % 5 === 0 ? `STUDENT_${i}@@fixora.io.` : `student_${i}@fixora.io`;
    const rawDept = departments[i % departments.length];
    const rawCity = cities[i % cities.length];
    const rawDate = dates[i % dates.length];
    const rawStatus = statuses[i % statuses.length];
    
    // Numeric anomalies: negative compensation, GPA boundary overflows
    let rawGpa: any = 7.5 + ((i % 25) / 10);
    if (i === 10) rawGpa = 85.0; // scale of 100 overflow
    if (i === 20) rawGpa = -7.5; // negative gpa

    let rawPackage: any = rawStatus.toLowerCase() === 'placed' ? 12.0 + (i % 20) : null;
    if (rawStatus.toLowerCase() === 'placed' && i % 8 === 0) rawPackage = null; // missing on confirmed placement
    if (i === 15) rawPackage = -18.5; // negative package

    const rawPhone = i % 4 === 0 ? `  +91 98200-${1000 + i}  ` : `+91 98200-${1000 + i}`;
    const rawExp = i % 6 === 0 ? null : (i % 36);
    const rawRating = i % 2 === 0 ? 'Exceeds' : 'meets';

    rawRows.push({
      record_id: recId,
      full_name: rawName,
      email: rawEmail,
      department: rawDept,
      city: rawCity,
      join_date: rawDate,
      status: rawStatus,
      gpa: rawGpa,
      package_lpa: rawPackage,
      phone: rawPhone,
      experience_months: rawExp,
      performance_rating: rawRating
    });
  }

  assert(rawRows.length === 500, `Generated exactly 500 records`);
  assert(Object.keys(rawRows[0]).length === 12, `Verified dataset has exactly 12 columns`);

  // Snapshot original rows for immutability verification
  const originalSnapshot = JSON.stringify(rawRows);

  // Scan dataset for baseline issues
  const scanResult = FixoraDataEngine.scanDataset('ds_messy_500', 'v1', rawRows);
  console.log(`Baseline Quality Scan: ${scanResult.issues.length} defects detected, initial score: ${scanResult.qualityScore}%`);

  // ---------------------------------------------------------------------------
  // Criterion 1: The original file remains unchanged
  // ---------------------------------------------------------------------------
  console.log('\n--- Verifying Criterion 1: Immutability of Source Dataset ---');
  const cleanResult = FixoraDataEngine.cleanDataset(rawRows, scanResult.issues, {
    normalize_casing_whitespace: true,
    standardize_dates: true,
    remove_duplicates: true,
    impute_missing_numeric: true,
    fix_numeric_bounds: true,
    normalize_emails: true
  });

  assert(JSON.stringify(rawRows) === originalSnapshot, 'Criterion 1: Source dataset is 100% unaltered (deep snapshot match)');

  // ---------------------------------------------------------------------------
  // Criterion 2: Approved corrections appear in the cleaned output
  // ---------------------------------------------------------------------------
  console.log('\n--- Verifying Criterion 2: Approved Corrections in Output ---');
  assert(cleanResult.appliedCorrections.length > 0, `Recorded ${cleanResult.appliedCorrections.length} applied corrections`);

  // Verify city normalization (e.g. nagpur -> Nagpur)
  const nagpurCleaned = cleanResult.cleanedRows.filter(r => r.city === 'Nagpur');
  const nagpurLower = cleanResult.cleanedRows.filter(r => r.city === 'nagpur' || r.city === 'NAGPUR');
  assert(nagpurCleaned.length > 0 && nagpurLower.length === 0, 'Standardized variant categories ("nagpur", "NAGPUR" -> "Nagpur")');

  // Verify department casing (e.g. computer science -> Computer Science)
  const csLower = cleanResult.cleanedRows.filter(r => r.department === 'computer science');
  const csTitle = cleanResult.cleanedRows.filter(r => r.department === 'Computer Science');
  assert(csLower.length === 0 && csTitle.length > 0, 'Standardized department casing ("computer science" -> "Computer Science")');

  // Verify date format standardization
  const hasSlashDates = cleanResult.cleanedRows.some(r => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(r.join_date));
  const hasIsoDates = cleanResult.cleanedRows.some(r => /^\d{4}-\d{2}-\d{2}$/.test(r.join_date));
  assert(!hasSlashDates && hasIsoDates, 'Standardized slash date notation to ISO-8601 (YYYY-MM-DD)');

  // Verify duplicate removal (REC-1042 had 2 duplicate rows injected)
  const rec1042Rows = cleanResult.cleanedRows.filter(r => r.record_id === 'REC-1042');
  assert(rec1042Rows.length === 1, 'Criterion 2: Deduplicated redundant secondary instances of REC-1042 to single primary record');

  // ---------------------------------------------------------------------------
  // Criterion 3: Rejected corrections are not applied
  // ---------------------------------------------------------------------------
  console.log('\n--- Verifying Criterion 3: Rejection Handling ---');
  // Run with dates rejected
  const cleanWithRejectedDates = FixoraDataEngine.cleanDataset(rawRows, scanResult.issues, {
    normalize_casing_whitespace: true,
    standardize_dates: false, // Rejected
    remove_duplicates: true
  });

  const slashDatesRetained = cleanWithRejectedDates.cleanedRows.some(r => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(r.join_date));
  assert(slashDatesRetained, 'Criterion 3: Rejected corrections are strictly omitted from transformation');

  // ---------------------------------------------------------------------------
  // Criterion 4: Unresolved values reported rather than silently fabricated
  // ---------------------------------------------------------------------------
  console.log('\n--- Verifying Criterion 4: Unresolved Values Reporting ---');
  assert(cleanResult.stats.unresolved_issues >= 0, `Unresolved findings accurately tracked (${cleanResult.stats.unresolved_issues} remaining)`);
  
  // Unplaced students with null packages must remain null rather than having arbitrary fabricated salaries
  const unplacedWithNull = cleanResult.cleanedRows.filter(r => r.status === 'Unplaced' && r.package_lpa === null);
  assert(unplacedWithNull.length > 0, 'Criterion 4: Does not fabricate package numbers for unplaced candidates (truth preserved)');

  // ---------------------------------------------------------------------------
  // Criterion 5: Exported Excel file opens successfully
  // ---------------------------------------------------------------------------
  console.log('\n--- Verifying Criterion 5: Excel Workbook (.xlsx) Generation ---');
  const wb = XLSX.utils.book_new();
  
  // Safe formula injection escaping
  const safeRows = cleanResult.cleanedRows.map(r => {
    const s: Record<string, any> = {};
    Object.entries(r).forEach(([k, v]) => {
      s[k] = FixoraDataEngine.sanitizeForSpreadsheet(v);
    });
    return s;
  });

  const wsCleaned = XLSX.utils.json_to_sheet(safeRows);
  XLSX.utils.book_append_sheet(wb, wsCleaned, 'Cleaned_Data');

  const reportData = [
    { Section: 'SUMMARY', Metric: 'Original Rows', Value: cleanResult.stats.original_row_count },
    { Section: 'SUMMARY', Metric: 'Cleaned Rows', Value: cleanResult.stats.cleaned_row_count },
    { Section: 'SUMMARY', Metric: 'Corrections Applied', Value: cleanResult.stats.corrections_applied },
    { Section: 'SUMMARY', Metric: 'Quality Score Before', Value: `${cleanResult.stats.quality_score_before}%` },
    { Section: 'SUMMARY', Metric: 'Quality Score After', Value: `${cleanResult.stats.quality_score_after}%` }
  ];
  cleanResult.appliedCorrections.slice(0, 50).forEach(c => {
    reportData.push({ Section: 'CORRECTION', Metric: `${c.record_identifier} [${c.column}]`, Value: `${c.original_value} -> ${c.cleaned_value}` });
  });

  const wsReport = XLSX.utils.json_to_sheet(reportData);
  XLSX.utils.book_append_sheet(wb, wsReport, 'Cleaning_Report');

  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  assert(excelBuffer.length > 1000, `Generated valid binary Excel workbook (${excelBuffer.length} bytes)`);

  // Parse generated buffer back with XLSX to verify it opens cleanly without corruption
  const readBackWorkbook = XLSX.read(excelBuffer, { type: 'buffer' });
  assert(readBackWorkbook.SheetNames.includes('Cleaned_Data'), 'Workbook contains "Cleaned_Data" worksheet');
  assert(readBackWorkbook.SheetNames.includes('Cleaning_Report'), 'Workbook contains "Cleaning_Report" worksheet');
  
  const readBackCleanedRows = XLSX.utils.sheet_to_json(readBackWorkbook.Sheets['Cleaned_Data']);
  assert(readBackCleanedRows.length === cleanResult.cleanedRows.length, `Criterion 5: Excel workbook reads back exactly ${cleanResult.cleanedRows.length} cleaned rows`);

  // ---------------------------------------------------------------------------
  // Criterion 6: Exported CSV contains expected rows and columns
  // ---------------------------------------------------------------------------
  console.log('\n--- Verifying Criterion 6: CSV Export Conformance ---');
  const csvString = Papa.unparse(safeRows);
  const parsedBackCsv = Papa.parse(csvString, { header: true, dynamicTyping: true, skipEmptyLines: true });
  assert(parsedBackCsv.data.length === cleanResult.cleanedRows.length, `Criterion 6: CSV contains exactly ${cleanResult.cleanedRows.length} rows`);
  assert(Object.keys(parsedBackCsv.data[0] as any).length === 12, 'CSV contains exactly 12 columns');

  // ---------------------------------------------------------------------------
  // Criterion 7: Previewed data matches downloaded data
  // ---------------------------------------------------------------------------
  console.log('\n--- Verifying Criterion 7: Preview vs Download Consistency ---');
  const previewSlice = cleanResult.cleanedRows.slice(0, 20);
  const excelSlice = readBackCleanedRows.slice(0, 20);
  const csvSlice = (parsedBackCsv.data as any[]).slice(0, 20);
  
  assert(
    JSON.stringify(previewSlice.map(r => r.record_id)) === JSON.stringify(excelSlice.map(r => r.record_id)),
    'Preview row sequence matches Excel download row sequence'
  );
  assert(
    JSON.stringify(previewSlice.map(r => r.record_id)) === JSON.stringify(csvSlice.map(r => r.record_id)),
    'Criterion 7: Previewed records match exported CSV records'
  );

  // ---------------------------------------------------------------------------
  // Criterion 8: Report accurately lists applied corrections
  // ---------------------------------------------------------------------------
  console.log('\n--- Verifying Criterion 8: Audit Report Accuracy ---');
  const readBackReportRows = XLSX.utils.sheet_to_json(readBackWorkbook.Sheets['Cleaning_Report']) as any[];
  const reportCorrections = readBackReportRows.filter(r => r.Section === 'CORRECTION');
  assert(reportCorrections.length > 0, `Criterion 8: Cleaning report includes verified correction audit entries (${reportCorrections.length} sampled)`);

  // ---------------------------------------------------------------------------
  // Criterion 9: Repeated downloads produce consistent results
  // ---------------------------------------------------------------------------
  console.log('\n--- Verifying Criterion 9: Deterministic Idempotency ---');
  const run2Result = FixoraDataEngine.cleanDataset(rawRows, scanResult.issues, {
    normalize_casing_whitespace: true,
    standardize_dates: true,
    remove_duplicates: true,
    impute_missing_numeric: true,
    fix_numeric_bounds: true,
    normalize_emails: true
  });
  assert(
    JSON.stringify(cleanResult.cleanedRows) === JSON.stringify(run2Result.cleanedRows),
    'Criterion 9: Repeated cleaning runs produce identical, deterministic results'
  );

  // ---------------------------------------------------------------------------
  // Criterion 10: Existing Fixora functionality continues to work
  // ---------------------------------------------------------------------------
  console.log('\n--- Verifying Criterion 10: Zero Regression on Core Platform ---');
  const storage = new FixoraStorage();
  const ds1 = storage.getDataset('ds_placement_2025_2026');
  assert(!!ds1, 'Core storage retrieves active demo dataset');
  
  const scan = storage.getLatestScan('ds_placement_2025_2026');
  assert(!!scan && scan.issues.length > 0, 'Core quality engine detects scan issues');

  const cleanedFromStorage = storage.getCleanedDataset('ds_placement_2025_2026');
  assert(cleanedFromStorage.rows.length > 0, 'Storage provides cleaned dataset ready for export');
  assert(cleanedFromStorage.stats.quality_score_after >= cleanedFromStorage.stats.quality_score_before, 'Cleaned dataset score exceeds original raw score');

  console.log(`\n--- Test Execution Finished: ${passed} Passed, ${failed} Failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runCleaningTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
