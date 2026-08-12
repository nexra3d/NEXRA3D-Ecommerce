import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { loginSchema } from '../lib/validation';
import { User } from '../types';
import { setStoredAuth } from '../lib/api';
import { signInWithGoogle, isSupabaseConfigured } from '../lib/supabase';
import { OTPVerificationModal } from './OTPVerificationModal';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
  onNavigateForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegister,
  onNavigateHome,
  onNavigateForgotPassword
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // OTP Modal state for unverified account login attempts
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setGoogleLoading(false);
        setErrorMsg('Google Login requires Supabase configuration (SUPABASE_URL and SUPABASE_ANON_KEY).');
        return;
      }
      await signInWithGoogle();
    } catch (err: any) {
      setGoogleLoading(false);
      setErrorMsg(err?.message || 'Failed to initiate Google Login.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Zod Client-Side Validation
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid form input';
      setErrorMsg(firstError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data: any = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || data.message || 'Invalid email or password. Please try again.');
      } else if (data.requiresEmailVerification) {
        setUnverifiedEmail(data.email || email.toLowerCase().trim());
        setShowOtpModal(true);
      } else {
        setStoredAuth(data.token, data.user);
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error. Unable to connect to authentication server.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="flex items-center justify-between mb-3">
            <span className="bg-indigo-600/80 text-indigo-100 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-400/30">
              Account Login
            </span>
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-white transition-colors underline cursor-pointer"
            >
              Back to Store
            </button>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-300 mt-1">
            Log in to manage your profile, account preferences, and view order history.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Error Message Alert */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-2xl flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-extrabold text-xs py-3 px-4 rounded-2xl transition-all flex items-center justify-center space-x-2.5 cursor-pointer shadow-2xs hover:border-slate-400 disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{googleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 my-2">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Or email login</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Email Address
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  Password
                </label>
                {onNavigateForgotPassword && (
                  <button
                    type="button"
                    onClick={onNavigateForgotPassword}
                    className="text-[11px] text-indigo-600 font-extrabold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl pl-10 pr-10 py-3 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3.5 rounded-2xl transition-all cursor-pointer shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Account</span>
                </>
              )}
            </button>
          </form>

          {/* Registration Redirect Footer */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={onNavigateRegister}
                className="text-indigo-600 font-extrabold hover:underline cursor-pointer inline-flex items-center gap-0.5"
              >
                <span>Create New Account</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOtpModal}
        email={unverifiedEmail}
        onClose={() => setShowOtpModal(false)}
        onSuccess={(user) => {
          setShowOtpModal(false);
          onLoginSuccess(user);
        }}
      />
    </div>
  );
};


