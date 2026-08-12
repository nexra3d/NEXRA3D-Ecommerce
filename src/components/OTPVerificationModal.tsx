import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { User } from '../types';
import { apiFetch, setStoredAuth } from '../lib/api';

interface OTPVerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSuccess: (user: User, token?: string) => void;
  onBackToRegister?: () => void;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  email,
  onClose,
  onSuccess,
  onBackToRegister
}) => {
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount / open
  useEffect(() => {
    if (isOpen) {
      setOtpValues(['', '', '', '', '', '']);
      setErrorMsg('');
      setInfoMsg('');
      setResendTimer(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Countdown timer for resend code
  useEffect(() => {
    if (!isOpen) return;
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, resendTimer]);

  if (!isOpen) return null;

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal && value !== '') return;

    const newOtp = [...otpValues];
    // Take last entered character if multiple characters provided
    newOtp[index] = cleanVal ? cleanVal[cleanVal.length - 1] : '';
    setOtpValues(newOtp);
    setErrorMsg('');

    // Auto focus next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/[^0-9]/g, '').trim();
    if (!pastedText) return;

    const digits = pastedText.slice(0, 6).split('');
    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtpValues(newOtp);
    setErrorMsg('');

    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const fullOtp = otpValues.join('').trim();
    if (fullOtp.length !== 6 || !/^\d{6}$/.test(fullOtp)) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      setLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || data.error || 'Verification failed. Please check the code and try again.');
      } else {
        if (data.token) {
          setStoredAuth(data.token, data.user);
        }
        onSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Network connection error. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || resendLoading) return;

    setResendLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const res = await apiFetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      setResendLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || data.error || 'Failed to resend verification code.');
      } else {
        setInfoMsg(data.message || 'A new 6-digit verification code has been sent to your email.');
        setResendTimer(60);
        setOtpValues(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setResendLoading(false);
      setErrorMsg('Network error while resending verification code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-auto">
        {/* Header */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-indigo-400" />
          </div>

          <h2 className="text-2xl font-black tracking-tight">Verify Your Email</h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            We sent a 6-digit verification code to <span className="font-extrabold text-white underline decoration-indigo-400">{email}</span>. Please enter it below to activate your account.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Messages */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-2xl flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {infoMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-4 rounded-2xl flex items-start space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">{infoMsg}</div>
            </div>
          )}

          {/* OTP Digits Input Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 text-center uppercase tracking-wider mb-3">
                6-Digit Security Code
              </label>

              <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-11 h-14 sm:w-12 sm:h-14 text-center font-black text-xl text-slate-900 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all outline-hidden shadow-2xs"
                  />
                ))}
              </div>
            </div>

            {/* Submit Verification Button */}
            <button
              type="submit"
              disabled={loading || otpValues.join('').length !== 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3.5 rounded-2xl transition-all cursor-pointer shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </div>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Resend Code Option */}
          <div className="pt-2 text-center border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-600">
              <span>Didn't receive the email code?</span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0 || resendLoading}
                className="text-indigo-600 font-extrabold hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1"
              >
                {resendLoading ? (
                  <span>Sending...</span>
                ) : resendTimer > 0 ? (
                  <span>Resend in {resendTimer}s</span>
                ) : (
                  <span>Resend Code</span>
                )}
              </button>
            </div>

            {onBackToRegister && (
              <div>
                <button
                  type="button"
                  onClick={onBackToRegister}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer"
                >
                  Entered wrong email? Change email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
