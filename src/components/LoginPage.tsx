import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { loginSchema } from '../lib/validation';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegister,
  onNavigateHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

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
      } else {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error. Unable to connect to authentication server.');
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
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
          {/* Quick Demo Credentials Panel */}
          <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center space-x-1.5 text-indigo-900 font-extrabold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Demo Account (1-Click Fill):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('nexra3d@gmail.com', 'admin123')}
                className="bg-white hover:bg-indigo-100 text-indigo-900 font-bold py-2 px-2.5 rounded-xl border border-indigo-200 transition-colors text-left cursor-pointer shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div className="text-[9px] text-indigo-500 uppercase font-black">NEXRA OWNER</div>
                  <div className="truncate font-mono text-[11px]">nexra3d@gmail.com</div>
                </div>
                <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-extrabold">Fill</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('alex@example.com', 'customer123')}
                className="bg-white hover:bg-indigo-100 text-indigo-900 font-bold py-2 px-2.5 rounded-xl border border-indigo-200 transition-colors text-left cursor-pointer shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div className="text-[9px] text-indigo-500 uppercase font-black">CUSTOMER</div>
                  <div className="truncate font-mono text-[11px]">alex@example.com</div>
                </div>
                <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-extrabold">Fill</span>
              </button>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-2xl flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

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
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Password
              </label>
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
    </div>
  );
};
