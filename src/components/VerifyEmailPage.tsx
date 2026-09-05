import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiFetch, setStoredAuth } from '../lib/api';
import { User } from '../types';

interface VerifyEmailPageProps {
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
  onLoginSuccess: (user: User) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({
  onNavigateLogin,
  onNavigateHome,
  onLoginSuccess
}) => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryToken = urlParams.get('token');
    if (queryToken) {
      setToken(queryToken);
      handleVerify(queryToken);
    }
  }, []);

  const handleVerify = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) {
      setStatus('error');
      setErrorMessage('Verification token is required.');
      return;
    }

    setStatus('verifying');
    setErrorMessage('');

    try {
      const res = await apiFetch(`/api/auth/verify-email?token=${encodeURIComponent(tokenToVerify.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || data.message || 'Verification link is invalid or expired.');
      } else {
        setStatus('success');
        if (data.token && data.user) {
          setStoredAuth(data.token, data.user);
          onLoginSuccess(data.user);
        }
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network connection error. Please try again.');
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes('@')) {
      setResendStatus('error');
      setResendMessage('Please enter a valid email address.');
      return;
    }

    setResendStatus('loading');
    setResendMessage('');

    try {
      const res = await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setResendStatus('error');
        setResendMessage(data.error || 'Failed to resend verification email.');
      } else {
        setResendStatus('success');
        setResendMessage(data.message || 'Verification email dispatched. Please check your inbox.');
      }
    } catch {
      setResendStatus('error');
      setResendMessage('Network error. Please try again later.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="flex items-center justify-between mb-3">
            <span className="bg-indigo-600 text-indigo-100 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Email Verification</span>
            </span>
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-white transition-colors underline cursor-pointer"
            >
              Back to Store
            </button>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Verify Your Email</h1>
          <p className="text-xs text-slate-300 mt-1">
            Complete email validation to secure your NEXRA 3D account.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {status === 'verifying' && (
            <div className="py-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-800">Verifying your email token...</p>
              <p className="text-xs text-slate-500">Please wait while we confirm your security credentials.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-950">Email Verified!</h3>
                <p className="text-xs text-emerald-800 mt-1">
                  Your account is now fully verified. You have access to all order tracking, quotes, and rapid checkout features.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-rose-900">Verification Failed</p>
                  <p className="mt-0.5">{errorMessage}</p>
                </div>
              </div>

              {/* Resend Verification Form */}
              <div className="border border-slate-200 bg-slate-50 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Resend Verification Link</span>
                </h4>
                <p className="text-[11px] text-slate-600">
                  Enter your email address and we'll dispatch a fresh verification link to your inbox.
                </p>

                {resendMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      resendStatus === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {resendMessage}
                  </div>
                )}

                <form onSubmit={handleResend} className="space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={resendStatus === 'loading'}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-60"
                  >
                    {resendStatus === 'loading' ? 'Sending...' : 'Send Verification Email'}
                  </button>
                </form>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  Return to Login
                </button>
              </div>
            </div>
          )}

          {status === 'idle' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste your verification token below or check the link sent to your registered email address.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Paste verification token here"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-mono focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleVerify(token)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100"
                >
                  Verify Token
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
