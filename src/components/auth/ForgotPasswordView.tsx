import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';

interface ForgotPasswordViewProps {
  onNavigateToSignIn: () => void;
  onNavigateToResetPassword: (token: string) => void;
  onNavigateToLanding: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onNavigateToSignIn,
  onNavigateToResetPassword,
  onNavigateToLanding
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setSubmitted(true);
      if (res.devResetToken) {
        setDevResetToken(res.devResetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to process your request. Please try again.');
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
          <h1 className="text-xl font-bold text-white mt-3">Reset your password</h1>
          <p className="text-xs text-slate-400 mt-1">
            We will dispatch cryptographic single-use instructions to verify your identity.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          {error && (
            <div className="mb-4 p-3.5 bg-rose-950/60 border border-rose-900/80 rounded-lg text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {submitted ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-semibold">Instructions Dispatched</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If an active account is registered with <span className="font-mono text-cyan-300">{email}</span>, a secure password-reset link valid for 60 minutes has been created.
                </p>
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Security Notice:</span> In adherence to Fixora data privacy protocols, this system does not disclose account existence.
                </div>
              </div>

              {/* Dev mode token helper when SMTP is not configured */}
              {devResetToken && (
                <div className="p-3.5 bg-cyan-950/40 border border-cyan-800/60 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-cyan-300">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Development Mode Simulation</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    External SMTP email server is not configured. A single-use token was securely generated and hashed on the server.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateToResetPassword(devResetToken)}
                    className="w-full mt-1 py-2 px-3 text-xs font-medium text-cyan-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-semibold"
                  >
                    <span>Proceed to Reset Password with Token</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onNavigateToSignIn}
                className="w-full mt-2 py-2.5 px-4 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Account email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Request...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onNavigateToSignIn}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
