import React, { useState, useEffect } from 'react';
import { Shield, Download, Trash2, HelpCircle, Check, AlertTriangle, FileText, Lock, Clock } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface CustomerPrivacyTabProps {
  user: any;
  onLogout?: () => void;
}

export const CustomerPrivacyTab: React.FC<CustomerPrivacyTabProps> = ({ user, onLogout }) => {
  const [marketingOptIn, setMarketingOptIn] = useState<boolean>(Boolean(user?.marketingOptIn));
  const [analyticsOptIn, setAnalyticsOptIn] = useState<boolean>(Boolean(user?.analyticsOptIn));
  const [consentSuccessMsg, setConsentSuccessMsg] = useState<string | null>(null);

  // Data Export state
  const [isExporting, setIsExporting] = useState(false);

  // Privacy Request Form state
  const [requestType, setRequestType] = useState('ACCESS');
  const [description, setDescription] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [reqFeedback, setReqFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // My Requests List
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await apiFetch('/api/privacy/my-requests');
      const data = await res.json();
      if (data && data.success) {
        setMyRequests(data.requests || []);
      }
    } catch (err) {
      console.warn('Failed to fetch user privacy requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleToggleMarketing = async (newValue: boolean) => {
    setMarketingOptIn(newValue);
    try {
      await apiFetch('/api/privacy/consent', {
        method: 'POST',
        body: JSON.stringify({
          purpose: 'MARKETING_EMAIL',
          status: newValue ? 'GRANTED' : 'WITHDRAWN',
          noticeVersion: 'v1.0'
        })
      });
      setConsentSuccessMsg(`Marketing communication preferences updated (${newValue ? 'Subscribed' : 'Opted out'}).`);
      setTimeout(() => setConsentSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update marketing consent:', err);
    }
  };

  const handleToggleAnalytics = async (newValue: boolean) => {
    setAnalyticsOptIn(newValue);
    try {
      await apiFetch('/api/privacy/consent', {
        method: 'POST',
        body: JSON.stringify({
          purpose: 'ANALYTICS',
          status: newValue ? 'GRANTED' : 'WITHDRAWN',
          noticeVersion: 'v1.0'
        })
      });
      setConsentSuccessMsg(`Analytics preferences updated (${newValue ? 'Granted' : 'Opted out'}).`);
      setTimeout(() => setConsentSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update analytics consent:', err);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/privacy/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('nexra3d_auth_token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexra3d_personal_data_${user?.id || 'export'}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to download data archive: ' + (err.message || String(err)));
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmitPrivacyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmittingReq(true);
    setReqFeedback(null);

    try {
      const res = await apiFetch('/api/privacy/request', {
        method: 'POST',
        body: JSON.stringify({
          email: user?.email,
          name: user?.name,
          requestType,
          description: description.trim()
        })
      });
      const data = await res.json();

      if (data && data.success) {
        setReqFeedback({
          type: 'success',
          msg: 'Your request has been logged successfully! Our Grievance Officer will respond within 30 days.'
        });
        setDescription('');
        fetchMyRequests();
      } else {
        setReqFeedback({
          type: 'error',
          msg: data?.error || 'Failed to submit privacy request.'
        });
      }
    } catch (err: any) {
      setReqFeedback({
        type: 'error',
        msg: err.message || 'Submission failed'
      });
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== 'delete my account') {
      setDeleteError('Please type "DELETE MY ACCOUNT" to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await apiFetch('/api/privacy/delete-account', {
        method: 'POST'
      });
      const data = await res.json();

      if (data && data.success) {
        alert('Your account has been anonymized and deleted. Your saved addresses and active cart have been removed.');
        if (onLogout) {
          onLogout();
        } else {
          window.location.href = '/';
        }
      } else {
        setDeleteError(data?.error || 'Account deletion failed.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Deletion error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Privacy Center</h2>
          </div>
          <p className="text-xs text-slate-300">
            Manage your privacy preferences, download personal data, or submit privacy support inquiries.
          </p>
        </div>
        <span className="text-[10px] font-extrabold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full shrink-0">
          Notice v1.0
        </span>
      </div>

      {consentSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" /> {consentSuccessMsg}
        </div>
      )}

      {/* 1. Consent Settings */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" /> Active Consent Preferences
        </h3>

        <div className="divide-y divide-slate-100 text-sm">
          
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-900">Essential Processing & Session Security</div>
              <p className="text-xs text-slate-500">Processing necessary for order fulfillment, e-commerce transactions & account authentication.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full shrink-0">
              Mandatory
            </span>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-900">Marketing & Promotional Updates</div>
              <p className="text-xs text-slate-500">Receive discount coupons, custom 3D printing offers & new product launch updates via email.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => handleToggleMarketing(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-900">Performance & Usage Analytics</div>
              <p className="text-xs text-slate-500">Anonymous analytics to help improve rendering performance and platform usability.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={analyticsOptIn}
                onChange={(e) => handleToggleAnalytics(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

        </div>
      </div>

      {/* 2. Data Portability / Download My Data */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" /> Download Personal Data Archive
          </h3>
          <p className="text-xs text-slate-500 max-w-xl">
            Export a complete JSON archive of your personal profile, addresses, order history, custom lithophane upload metadata, and consent records.
          </p>
        </div>
        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Generating Package...' : 'Download My Data'}
        </button>
      </div>

      {/* 3. Submit Privacy / Grievance Request */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" /> Submit Privacy Request / Grievance
        </h3>

        {reqFeedback && (
          <div className={`p-3 rounded-xl text-xs font-semibold ${reqFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {reqFeedback.msg}
          </div>
        )}

        <form onSubmit={handleSubmitPrivacyRequest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Request Type</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="ACCESS">Request Access to Data Summary</option>
                <option value="CORRECTION">Request Correction of Inaccurate Profile Data</option>
                <option value="CONSENT_WITHDRAWAL">Request Consent Withdrawal</option>
                <option value="GRIEVANCE">Submit Privacy Grievance</option>
                <option value="OTHER">Other Privacy Enquiry</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Contact Email</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-100 font-medium text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Details of Request</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe your privacy request or grievance clearly..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingReq || !description.trim()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmittingReq ? 'Submitting...' : 'Submit Request to Grievance Officer'}
            </button>
          </div>
        </form>

        {/* Existing Requests */}
        {myRequests.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Your Submitted Privacy Requests</h4>
            <div className="space-y-2">
              {myRequests.map((req) => (
                <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-900">{req.requestType} &bull; <span className="text-slate-500 font-normal">{new Date(req.createdAt).toLocaleDateString()}</span></div>
                    <p className="text-slate-600 line-clamp-1">{req.description}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] shrink-0 ${
                    req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Danger Zone - Account Deletion */}
      <div className="bg-red-50/60 rounded-2xl p-6 border border-red-200 space-y-3">
        <div className="flex items-center gap-2 text-red-800 font-bold text-base">
          <AlertTriangle className="w-5 h-5 text-red-600" /> Danger Zone — Delete Account & Personal Data
        </div>
        <p className="text-xs text-red-700 leading-relaxed max-w-2xl">
          Request permanent deletion and anonymization of your customer profile. All personal identifiable details will be anonymized. Financial order records will be retained in anonymized format for statutory tax compliance.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-sm inline-flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Delete My Account
        </button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Confirm Account Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action is permanent and cannot be undone. Your profile details and saved addresses will be removed. Address information retained as part of previous orders will remain with those order records where required for accounting and fulfillment purposes.
            </p>

            {deleteError && (
              <div className="p-2.5 bg-red-100 text-red-800 text-xs font-semibold rounded-lg">
                {deleteError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Type <strong>DELETE MY ACCOUNT</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none font-bold text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText.trim().toLowerCase() !== 'delete my account'}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
