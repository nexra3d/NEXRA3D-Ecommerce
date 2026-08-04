import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login' ? { email, password } : { name, email, phone, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Authentication failed');
      } else {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error. Please try again.');
    }
  };

  const handleQuickDemoLogin = async (role: 'CUSTOMER' | 'ADMIN') => {
    const demoEmail = role === 'ADMIN' ? 'admin@store.com' : 'alex@example.com';
    const demoPassword = role === 'ADMIN' ? 'admin123' : 'customer123';
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Quick login failed.');
      }
    } catch (err) {
      setErrorMsg('Network error on quick login.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold">{mode === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
            <p className="text-xs text-slate-400">Access your orders, wishlist, and profile</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick Demo Login Preset Buttons */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 space-y-2">
            <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant 1-Click Demo Login</span>
            </span>
            <div>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('CUSTOMER')}
                className="w-full bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer shadow-2xs text-center"
              >
                Customer Login (1-Click)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 my-2">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Or Sign In Manually</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {errorMsg && (
            <div className="bg-rose-50 text-rose-700 text-xs font-bold p-3 rounded-xl border border-rose-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'register' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3 rounded-2xl transition-colors cursor-pointer shadow-xs"
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMsg('');
              }}
              className="text-xs text-indigo-600 hover:underline font-bold"
            >
              {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
