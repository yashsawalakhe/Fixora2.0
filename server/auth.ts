import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'investigator' | 'admin' | 'auditor';
  created_at: string;
  last_login_at?: string;
}

export interface StoredSession {
  session_id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
  remember_me: boolean;
  ip?: string;
}

export interface StoredResetToken {
  token_hash: string;
  user_id: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

interface AuthStorageData {
  users: StoredUser[];
  sessions: StoredSession[];
  reset_tokens: StoredResetToken[];
}

export class FixoraAuthManager {
  private storageFilePath: string;
  private users = new Map<string, StoredUser>(); // email (lowercase) -> User
  private usersById = new Map<string, StoredUser>(); // id -> User
  private sessions = new Map<string, StoredSession>(); // session_id -> Session
  private resetTokens = new Map<string, StoredResetToken>(); // token_hash -> ResetToken
  private rateLimits = new Map<string, { attempts: number; resetAt: number }>();

  constructor() {
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        // Fallback to memory if directory creation restricted
      }
    }
    this.storageFilePath = path.resolve(dataDir, 'auth_storage.json');
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    let loaded = false;
    if (fs.existsSync(this.storageFilePath)) {
      try {
        const raw = fs.readFileSync(this.storageFilePath, 'utf-8');
        const data: AuthStorageData = JSON.parse(raw);
        if (data.users && Array.isArray(data.users)) {
          data.users.forEach(u => {
            this.users.set(u.email.toLowerCase(), u);
            this.usersById.set(u.id, u);
          });
          data.sessions?.forEach(s => this.sessions.set(s.session_id, s));
          data.reset_tokens?.forEach(r => this.resetTokens.set(r.token_hash, r));
          loaded = true;
        }
      } catch (err) {
        console.warn('[Fixora Auth] Could not read disk storage, re-initializing.');
      }
    }

    if (!loaded || !this.users.has('investigator@fixora.io')) {
      // Seed default demo user: investigator@fixora.io / Password123!
      const demoSalt = bcrypt.genSaltSync(10);
      const demoHash = bcrypt.hashSync('Password123!', demoSalt);
      const demoUser: StoredUser = {
        id: 'usr_investigator_demo',
        name: 'Lead Data Investigator',
        email: 'investigator@fixora.io',
        password_hash: demoHash,
        role: 'investigator',
        created_at: new Date().toISOString()
      };
      this.users.set(demoUser.email.toLowerCase(), demoUser);
      this.usersById.set(demoUser.id, demoUser);
      this.saveToDisk();
    }
  }

  private saveToDisk(): void {
    try {
      const data: AuthStorageData = {
        users: Array.from(this.users.values()),
        sessions: Array.from(this.sessions.values()),
        reset_tokens: Array.from(this.resetTokens.values())
      };
      fs.writeFileSync(this.storageFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      // Memory state remains intact even if write fails
    }
  }

  // --- Rate Limiting ---
  checkRateLimit(key: string, maxAttempts: number = 10, windowMs: number = 15 * 60 * 1000): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const entry = this.rateLimits.get(key);

    if (!entry || now > entry.resetAt) {
      this.rateLimits.set(key, { attempts: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    if (entry.attempts >= maxAttempts) {
      return { allowed: false, remaining: 0 };
    }

    entry.attempts++;
    return { allowed: true, remaining: maxAttempts - entry.attempts };
  }

  resetRateLimit(key: string): void {
    this.rateLimits.delete(key);
  }

  // --- User Registration ---
  async registerUser(name: string, email: string, password: string, role: StoredUser['role'] = 'investigator'): Promise<{ user: Omit<StoredUser, 'password_hash'> }> {
    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate
    if (this.users.has(normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    // Input validation
    if (!name || name.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters long.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Please provide a valid email address.');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role,
      created_at: new Date().toISOString()
    };

    this.users.set(normalizedEmail, newUser);
    this.usersById.set(newUser.id, newUser);
    this.saveToDisk();

    const { password_hash, ...publicUser } = newUser;
    return { user: publicUser };
  }

  // --- User Login ---
  async authenticateUser(email: string, password: string, rememberMe: boolean = false, ip?: string): Promise<{ user: Omit<StoredUser, 'password_hash'>; session: StoredSession }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.get(normalizedEmail);

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiryDuration = rememberMe ? 7 * 24 * 3600 * 1000 : 24 * 3600 * 1000; // 7 days vs 24h
    const session: StoredSession = {
      session_id: sessionId,
      user_id: user.id,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + expiryDuration).toISOString(),
      remember_me: rememberMe,
      ip
    };

    user.last_login_at = new Date().toISOString();
    this.sessions.set(sessionId, session);
    this.saveToDisk();

    const { password_hash, ...publicUser } = user;
    return { user: publicUser, session };
  }

  // --- Session Validation ---
  validateSession(sessionId: string): Omit<StoredUser, 'password_hash'> | null {
    if (!sessionId) return null;
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (new Date(session.expires_at).getTime() < Date.now()) {
      this.sessions.delete(sessionId);
      this.saveToDisk();
      return null;
    }

    const user = this.usersById.get(session.user_id);
    if (!user) return null;

    const { password_hash, ...publicUser } = user;
    return publicUser;
  }

  // --- Session Destruction (Logout) ---
  destroySession(sessionId: string): void {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      this.saveToDisk();
    }
  }

  destroyAllUserSessions(userId: string): void {
    for (const [sId, s] of this.sessions.entries()) {
      if (s.user_id === userId) {
        this.sessions.delete(sId);
      }
    }
    this.saveToDisk();
  }

  // --- Forgot Password Token Generation ---
  async createPasswordResetToken(email: string): Promise<{ token?: string; userExists: boolean }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.get(normalizedEmail);

    if (!user) {
      return { userExists: false };
    }

    // Generate random 32-byte token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord: StoredResetToken = {
      token_hash: tokenHash,
      user_id: user.id,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour expiry
      used: false,
      created_at: new Date().toISOString()
    };

    this.resetTokens.set(tokenHash, resetRecord);
    this.saveToDisk();

    return { token, userExists: true };
  }

  // --- Validate Reset Token ---
  validateResetToken(token: string): boolean {
    if (!token) return false;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = this.resetTokens.get(tokenHash);
    if (!record) return false;
    if (record.used) return false;
    if (new Date(record.expires_at).getTime() < Date.now()) return false;
    return true;
  }

  // --- Complete Password Reset ---
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    if (!token || !newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = this.resetTokens.get(tokenHash);

    if (!record || record.used || new Date(record.expires_at).getTime() < Date.now()) {
      throw new Error('This password reset link is invalid or has expired.');
    }

    const user = this.usersById.get(record.user_id);
    if (!user) {
      throw new Error('User account not found.');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);

    // Invalidate token
    record.used = true;

    // Invalidate all existing active sessions for security
    this.destroyAllUserSessions(user.id);
    this.saveToDisk();

    return true;
  }
}

export const fixoraAuthManager = new FixoraAuthManager();
