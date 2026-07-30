import React from 'react';
import { ShieldAlert, ArrowLeft, UserCheck, Lock } from 'lucide-react';

interface UnauthorizedPageProps {
  onNavigateHome: () => void;
  onNavigateAccount: () => void;
  onNavigateLogin: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  onNavigateHome,
  onNavigateAccount,
  onNavigateLogin
}) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center">
        {/* Header Banner */}
        <div className="bg-rose-950 p-8 text-white relative">
          <div className="w-16 h-16 bg-rose-600/30 border border-rose-500/40 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-rose-500/30">
            HTTP 403 Access Forbidden
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-2">Unauthorized Access</h1>
          <p className="text-xs text-rose-200 mt-1 max-w-sm mx-auto">
            You do not have administrative permissions to view or access this section.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2 text-left">
            <div className="flex items-center space-x-2 text-slate-900 font-bold">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Role-Based Access Control (RBAC) Enforced</span>
            </div>
            <p>
              Admin routes (<code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">/admin/*</code>) require a user account with the <strong className="text-slate-900">ADMIN</strong> role. Standard customer accounts are strictly prevented from viewing store analytics and administrative settings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onNavigateHome}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </button>

            <button
              onClick={onNavigateAccount}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl transition-all shadow-md shadow-slate-200 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Go to My Account</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onNavigateLogin}
              className="text-xs text-indigo-600 hover:underline font-extrabold cursor-pointer"
            >
              Need Admin access? Switch or Log in with an Admin account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
