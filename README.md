# Fixora 2.0 — AI-Assisted Data Reliability, Investigation & Repair Platform

**Tagline:** *Make Every Dataset Trustworthy.*

Fixora is an evidence-driven data reliability platform that detects data quality defects, investigates their root causes, compares alternative counterfactual repair strategies, predicts potential downstream effects, validates new dataset versions, and maintains a transparent, tamper-evident audit trail.

---

## 1. Core Principles

1. **Never silently modify uploaded data:** Original uploaded files are preserved permanently as immutable source snapshots.
2. **Human approval for every repair:** Every modification must be previewed side-by-side with cell-level diffs before application.
3. **Reproducible detection:** Every issue is backed by deterministic rules and verifiable empirical evidence.
4. **Distinguish facts from hypotheses:** Scan findings represent empirical facts. Root-cause clusters and AI suggestions are explicitly labeled as hypotheses.
5. **Reversible lineage:** Approved repairs spawn new immutable versions (`v1` → `v2` → `v3`). Rollbacks create fresh versions without destroying historical records.
6. **Zero AI dependency:** Complete platform functions deterministically without external AI API credentials.
7. **Complete, secure authentication:** Full-stack password hashing (bcrypt), HttpOnly session cookies, rate limiting, and cryptographic single-use password resets.

---

## 2. Authentication System

Fixora 2.0 includes a production-grade authentication and user account management architecture:

- **Sign In (`SignInView`):**
  - Email and password verification against bcrypt hashes.
  - Password visibility toggle.
  - "Remember me" option extending session lifetime from 24 hours to 7 days.
  - Forgot password routing.
  - One-click demo investigator credential pre-fill (`investigator@fixora.io`).
  - Inline error notifications and input validation.

- **Sign Up (`SignUpView`):**
  - Full name, organization email, password, and confirm password fields.
  - Dynamic password strength meter evaluating length, casing, numbers, and symbols with live checklist.
  - Password visibility toggles.
  - Acceptance of the Fixora Data Reliability Charter and privacy terms.
  - Prevents duplicate registration with explicit conflict handling.

- **Forgot Password (`ForgotPasswordView`):**
  - Email input with rate limiting (5 attempts per 15 minutes per IP).
  - Secure single-use token generation stored as a SHA-256 hash with 60-minute expiry.
  - Generic confirmation response that never discloses whether an account exists.
  - Development simulation mode: when external SMTP credentials are not configured, surfaces a secure dev token navigation button so evaluators can test the complete reset flow end-to-end without dead ends.

- **Reset Password (`ResetPasswordView`):**
  - Validates reset token against server upon view load.
  - Displays expired/invalid state if token is reused, malformed, or older than 60 minutes.
  - Password strength meter and confirmation matching.
  - Single-use token consumption and immediate invalidation of all prior active user sessions.

- **User Profile & Navigation:**
  - Authenticated user avatar, name, email, and role badge displayed in top Navbar and persistent Sidebar.
  - Working `Sign Out` action that invalidates server-side session and clears `HttpOnly` cookie.
  - Protected route guard preventing unauthenticated access to data console workspaces (`/app/*`).

---

## 3. Flagship Features

- **Data Detective & Root Cause Hypotheses:** Groups related defects into clusters (e.g., casing drift across department taxonomies, duplicate student ID collisions, legacy date formats, missing packages on confirmed placements).
- **Counterfactual Repair Lab:** Compare alternative repair strategies (Canonical Normalization, Statistical Median Imputation, Deduplication, Flag for Review) in an isolated sandbox with cell-level diff previews.
- **Blast-Radius Analysis:** Computes ripple effects on downstream derived metrics (e.g., departmental placement rate, average CTC) and reporting artifacts before approving any repair.
- **Data Drift Radar:** Compares dataset versions or uploads to track missingness deltas, category distribution shifts, and quantile changes without mistaking valid updates for errors.
- **Adaptive Rule Builder:** Test and configure custom validation rules (numeric bounds, allowed categories, required fields, unique keys) on live datasets.
- **Cross-Dataset Consistency:** Reconcile entity records across independent tables (e.g. Placement Cohort vs Central Enrollment Register).
- **Data Reliability Firewall:** Pre-flight ingestion gate that inspects schema conformance, quarantines defective files, and supports authorized investigator overrides.
- **Verifiable Trust Passport:** Generates an empirical certificate featuring a cryptographic SHA-256 fingerprint, documented scoring formulas, and immutable audit logs.
- **Lineage Time Machine:** Complete version graph with parent/child relationships and non-destructive rollbacks.

---

## 4. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts
- **Backend:** Express, Node.js, TypeScript (`tsx`), `bcryptjs`, `cookie-parser`, PapaParse, XLSX, Cryptographic SHA-256 Engine
- **Auth Storage:** Persistent user & session store in `data/auth_storage.json`
- **Testing:** Automated test suites in `tests/auth.test.ts` and `tests/qualityEngine.test.ts`

---

## 5. Getting Started & Credentials

### Pre-seeded Demo Investigator Account
For instant testing and evaluation:
- **Email:** `investigator@fixora.io`
- **Password:** `Password123!`
- **Role:** Lead Data Investigator

### Local Development Commands
```bash
# Install dependencies
npm install

# Start full-stack development server (Express + Vite on port 3000)
npm run dev

# Run automated authentication test suite (23 assertions)
npx tsx tests/auth.test.ts

# Run automated reliability and quality engine test suite (16 assertions)
npx tsx tests/qualityEngine.test.ts

# Typecheck and linting
npm run lint

# Production build
npm run build
```

---

## 6. Environment Variables
Configure `.env` using `.env.example`:
```env
# Optional AI explanation assistant (Fixora works 100% deterministically without it)
GEMINI_API_KEY="your_api_key_here"
APP_URL="http://localhost:3000"

# Optional SMTP Configuration for email delivery (dev mode simulation active if omitted)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="security@fixora.io"
```
