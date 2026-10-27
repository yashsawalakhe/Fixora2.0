import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Check,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { api } from '../../services/api';

interface ResetPasswordViewProps {
  token: string;
  onSuccess: () => void;
  onNavigateToSignIn: () => void;
  onNavigateToForgotPassword: () => void;
  onNavigateToLanding: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  token,
  onSuccess,
  onNavigateToSignIn,
  onNavigateToForgotPassword,
  onNavigateToLanding
}) => {
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetComplete, setResetComplete] = useState(false);

  // Validate token on mount
  useEffect(() => {
    let active = true;
    const checkToken = async () => {
      if (!token) {
        if (active) {
          setTokenValid(false);
          setIsValidatingToken(false);
        }
        return;
      }

      const valid = await api.validateResetToken(token);
      if (active) {
        setTokenValid(valid);
        setIsValidatingToken(false);
      }
    };

    checkToken();
    return () => { active = false; };
  }, [token]);

  // Password strength calculation
  const strength = useMemo(() => {
    if (!newPassword) return { score: 0, label: 'Empty', color: 'bg-slate-700', text: 'text-slate-500' };
    
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score === 3 || score === 4) return { score: 2, label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-400' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
  }, [newPassword]);

  const passwordChecks = useMemo(() => [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Contains number or symbol', met: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword) },
  ], [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, newPassword);
      setResetComplete(true);
    } catch (err: any) {
      setError(err.message || 'Password reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-950 relative overflow-hidden">
      {/* Background Ambient Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[250px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6">
        
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <button 
            onClick={onNavigateToLanding}
            className="inline-flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity mb-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-md shadow-violet-900/40">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight font-sans text-white">Fixora</span>
          </button>
          <div className="text-xs font-mono font-medium text-cyan-400 tracking-wide">
            Make Every Dataset Trustworthy.
          </div>
          <h1 className="text-xl font-bold text-white mt-3">Choose a new password</h1>
          <p className="text-xs text-slate-400 mt-1">
            Ensure your account uses a strong, resilient credential.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          {isValidatingToken ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              <p className="text-xs text-slate-400">Verifying cryptographic reset token...</p>
            </div>
          ) : tokenValid === false ? (
            <div className="space-y-4">
              <div className="p-4 bg-rose-950/60 border border-rose-900/80 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-semibold text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span>Invalid or Expired Link</span>
                </div>
                <p className="text-xs text-rose-200/80 leading-relaxed">
                  This single-use password reset link is invalid, has already been used, or has exceeded its 60-minute expiration window.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={onNavigateToForgotPassword}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Request a New Reset Link</span>
                </button>
                <button
                  type="button"
                  onClick={onNavigateToSignIn}
                  className="w-full py-2 px-3 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-center"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : resetComplete ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/60 border border-emerald-900/80 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span>Password Reset Successfully</span>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Your password has been updated securely. All prior active sessions have been terminated. You may now sign in with your new credential.
                </p>
              </div>

              <button
                type="button"
                onClick={onSuccess}
                className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="p-3 bg-rose-950/60 border border-rose-900/80 rounded-lg text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{error}</div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label htmlFor="reset-new-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className={`font-medium ${strength.text}`}>{strength.label}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5">
                      <div className={`rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                      <div className={`rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                      <div className={`rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                    </div>

                    <div className="pt-1 grid grid-cols-1 gap-1 text-[11px] text-slate-400">
                      {passwordChecks.map((chk, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          {chk.met ? (
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 ml-0.5 mr-1" />
                          )}
                          <span className={chk.met ? 'text-emerald-300' : 'text-slate-500'}>
                            {chk.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reset-confirm-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`w-full bg-slate-950 border rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 transition-colors ${
                      confirmPassword && confirmPassword !== newPassword 
                        ? 'border-rose-700 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[11px] text-rose-400 mt-1">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm New Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
