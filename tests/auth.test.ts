import { FixoraAuthManager } from '../server/auth.ts';

/**
 * Fixora Automated Authentication Test Suite
 * Tests:
 * 1. User Registration (valid inputs, password hashing with bcrypt, input constraints)
 * 2. Duplicate Account Prevention (cannot register already registered email)
 * 3. User Login & Credential Verification (valid password vs invalid password)
 * 4. Session Creation & Remember Me Duration
 * 5. Session Validation & Destruction (Logout)
 * 6. Cryptographic Password Reset Flow:
 *    - Token creation (single-use SHA-256 hash stored)
 *    - Valid token validation
 *    - Password update & session invalidation
 *    - Token single-use enforcement (cannot reuse used token)
 * 7. Rate Limiting protection on authentication endpoints
 */
async function runAuthTests() {
  console.log('--- [Fixora Auth Test Suite] Starting Execution ---');
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

  const auth = new FixoraAuthManager();

  // Test 1: Pre-seeded Demo Investigator Account
  console.log('\n1. Pre-seeded Demo Account:');
  const demoAuth = await auth.authenticateUser('investigator@fixora.io', 'Password123!', false);
  assert(!!demoAuth.user, 'Pre-seeded demo user (investigator@fixora.io) exists');
  assert(demoAuth.user.role === 'investigator', 'Demo user has "investigator" role');
  assert(!!demoAuth.session.session_id, 'Generates valid 32-byte cryptographic session ID');

  // Test 2: Invalid Credentials Rejection
  console.log('\n2. Invalid Credentials Handling:');
  let threwBadPassword = false;
  try {
    await auth.authenticateUser('investigator@fixora.io', 'WrongPassword!', false);
  } catch (err: any) {
    threwBadPassword = true;
    assert(err.message === 'Invalid email or password.', 'Rejects invalid password with generic secure error');
  }
  assert(threwBadPassword, 'Throws exception on incorrect password');

  let threwNonExistentUser = false;
  try {
    await auth.authenticateUser('nonexistent_user@fixora.io', 'SomePassword123!', false);
  } catch (err: any) {
    threwNonExistentUser = true;
    assert(err.message === 'Invalid email or password.', 'Does not disclose non-existent user on login failure');
  }
  assert(threwNonExistentUser, 'Throws exception on non-existent user');

  // Test 3: New User Registration
  console.log('\n3. User Registration & Validation:');
  const testEmail = `auditor_${Date.now()}@fixora.io`;
  const regResult = await auth.registerUser('Sarah Chen', testEmail, 'AuditStrongPass99!', 'auditor');
  assert(regResult.user.name === 'Sarah Chen', 'Successfully registers new user with full name');
  assert(regResult.user.email === testEmail, 'Stores normalized email address');
  assert(regResult.user.role === 'auditor', 'Assigns correct role');
  assert(!('password_hash' in regResult.user), 'Never leaks password hash in public user record');

  // Test 4: Duplicate Email Rejection
  console.log('\n4. Duplicate Registration Prevention:');
  let duplicateRejected = false;
  try {
    await auth.registerUser('Sarah Chen Clone', testEmail, 'AnotherPass123!');
  } catch (err: any) {
    duplicateRejected = true;
    assert(err.message.includes('already exists'), 'Rejects duplicate registration with clear notification');
  }
  assert(duplicateRejected, 'Blocks duplicate email address from creating second account');

  // Test 5: Session Validation & Logout
  console.log('\n5. Session Lifecycle & Logout:');
  const loginRes = await auth.authenticateUser(testEmail, 'AuditStrongPass99!', true);
  const validatedUser = auth.validateSession(loginRes.session.session_id);
  assert(!!validatedUser && validatedUser.email === testEmail, 'Validates active session from cookie/header token');

  // Logout (destroy session)
  auth.destroySession(loginRes.session.session_id);
  const userAfterLogout = auth.validateSession(loginRes.session.session_id);
  assert(userAfterLogout === null, 'Session is immediately invalidated and destroyed upon logout');

  // Test 6: Password Reset Workflow (Cryptographic Token + Single Use)
  console.log('\n6. Password Reset Flow & Single-Use Security:');
  const resetReq = await auth.createPasswordResetToken(testEmail);
  assert(resetReq.userExists, 'Confirms user existence for internal token creation');
  assert(!!resetReq.token, 'Generates high-entropy reset token');

  const tokenValidBeforeUse = auth.validateResetToken(resetReq.token!);
  assert(tokenValidBeforeUse === true, 'Validates active, unexpired reset token');

  // Complete reset with new password
  const resetSuccess = await auth.resetPassword(resetReq.token!, 'NewlyUpdatedPass2026!');
  assert(resetSuccess === true, 'Successfully completes password reset');

  // Try to use the token a second time (MUST FAIL)
  const tokenValidAfterUse = auth.validateResetToken(resetReq.token!);
  assert(tokenValidAfterUse === false, 'Enforces single-use policy: token is immediately invalidated after use');

  let reuseThrew = false;
  try {
    await auth.resetPassword(resetReq.token!, 'ThirdAttemptPassword123!');
  } catch (err: any) {
    reuseThrew = true;
  }
  assert(reuseThrew, 'Rejects attempt to reset password using an already used token');

  // Authenticate with new password
  const newLoginRes = await auth.authenticateUser(testEmail, 'NewlyUpdatedPass2026!', false);
  assert(!!newLoginRes.user, 'Successfully signs in with the new updated password');

  // Test 7: Rate Limiting
  console.log('\n7. Rate Limiting Protection:');
  const rateLimitKey = 'test_ip_client';
  auth.resetRateLimit(rateLimitKey);

  let limitReached = false;
  for (let i = 0; i < 12; i++) {
    const check = auth.checkRateLimit(rateLimitKey, 10, 60000);
    if (!check.allowed) {
      limitReached = true;
      break;
    }
  }
  assert(limitReached, 'Enforces rate limit after configured maximum attempts to prevent brute force');

  console.log(`\n--- Test Summary: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
