import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { sendForgotPasswordEmail, isSupabaseConfigured } from '../lib/supabase';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateHome
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Fallback / Guidance if Supabase environment variables are missing
        setLoading(false);
        setSuccessMsg(
          `Password reset request received for ${email}. Note: Supabase project credentials (SUPABASE_URL, SUPABASE_ANON_KEY) must be configured in environment settings to dispatch the email link.`
        );
        return;
      }

      await sendForgotPasswordEmail(email);
      setLoading(false);
      setSuccessMsg(
        `Password reset link has been sent to ${email}. Please check your inbox or spam folder and click the link to reset your password.`
      );
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Failed to send password reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="flex items-center justify-between mb-3">
            <span className="bg-amber-500/80 text-amber-950 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
              <KeyRound className="w-3 h-3" />
              <span>Password Recovery</span>
            </span>
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-white transition-colors underline cursor-pointer"
            >
              Back to Store
            </button>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Forgot Password?</h1>
          <p className="text-xs text-slate-300 mt-1">
            Enter your account email address below and we'll send you a password reset link.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-2xl flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-4 rounded-2xl flex items-start space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1 text-emerald-900">Email Dispatched!</p>
                <p>{successMsg}</p>
              </div>
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3.5 rounded-2xl transition-all cursor-pointer shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>Sending Reset Link...</span>
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-xs text-indigo-600 font-extrabold hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
