import React, { useState, useEffect } from 'react';
import { Shield, FileText, CheckCircle, Clock, XCircle, AlertTriangle, UserCheck, RefreshCw, Filter, Search } from 'lucide-react';
import { apiFetch } from '../lib/api';

export const AdminPrivacyTab: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'consents' | 'events'>('requests');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Selected Request Modal / Detail View
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('COMPLETED');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, reqsRes, consentRes, eventsRes] = await Promise.all([
        apiFetch('/api/admin/privacy/stats').then(r => r ? r.json() : null).catch(() => null),
        apiFetch('/api/admin/privacy/requests').then(r => r ? r.json() : null).catch(() => null),
        apiFetch('/api/admin/privacy/consents').then(r => r ? r.json() : null).catch(() => null),
        apiFetch('/api/admin/privacy/security-events').then(r => r ? r.json() : null).catch(() => null)
      ]);

      if (statsRes && statsRes.success) setStats(statsRes.stats);
      if (reqsRes && reqsRes.success) setRequests(reqsRes.requests || []);
      if (consentRes && consentRes.success) setConsents(consentRes.consents || []);
      if (eventsRes && eventsRes.success) setSecurityEvents(eventsRes.events || []);
    } catch (err) {
      console.warn('Failed to load admin privacy data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsUpdating(true);
    try {
      const res = await apiFetch(`/api/admin/privacy/requests/${selectedRequest.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: updateStatus,
          adminNotes
        })
      });
      const data = await res.json();

      if (data && data.success) {
        setSelectedRequest(null);
        setAdminNotes('');
        loadData();
      }
    } catch (err: any) {
      alert('Failed to update request: ' + (err.message || String(err)));
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-extrabold tracking-tight">Privacy & Security Management</h2>
          </div>
          <p className="text-xs text-slate-300">
            Monitor privacy requests, consent audit logs, security events, and data protection KPIs.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Grievances</span>
          <div className="text-2xl font-black text-amber-600">{stats?.pendingRequests ?? 0}</div>
          <p className="text-[11px] text-slate-400">Target Resolution SLA</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Requests</span>
          <div className="text-2xl font-black text-emerald-600">{stats?.completedRequests ?? 0}</div>
          <p className="text-[11px] text-slate-400">Total Privacy Requests Resolved</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Consent Records</span>
          <div className="text-2xl font-black text-indigo-600">{stats?.totalConsents ?? 0}</div>
          <p className="text-[11px] text-slate-400">Recorded Audit Entries</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Anonymized Accounts</span>
          <div className="text-2xl font-black text-slate-700">{stats?.anonymizedUsers ?? 0}</div>
          <p className="text-[11px] text-slate-400">Anonymized on account deletion</p>
        </div>

      </div>

      {/* Subtabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'requests', label: `Grievances & Requests (${requests.length})`, icon: FileText },
            { id: 'consents', label: `Consent Audit Logs (${consents.length})`, icon: UserCheck },
            { id: 'events', label: `Security Event Logs (${securityEvents.length})`, icon: AlertTriangle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeSubTab === 'requests' && (
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Only</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: GRIEVANCES & REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No privacy requests found matching filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">ID / Date</th>
                    <th className="p-3">User / Email</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-semibold text-slate-900">
                        {req.id.substring(0, 8)}... <br />
                        <span className="text-[10px] text-slate-400 font-sans">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{req.name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-500">{req.email}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {req.requestType}
                      </td>
                      <td className="p-3 max-w-xs truncate" title={req.description}>
                        {req.description}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setUpdateStatus(req.status === 'PENDING' ? 'COMPLETED' : req.status);
                            setAdminNotes(req.adminNotes || '');
                          }}
                          className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold hover:bg-indigo-100 transition-colors"
                        >
                          Review & Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONSENT AUDIT LOGS */}
      {activeSubTab === 'consents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Principal Email</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">IP / Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consents.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-[10px]">{new Date(c.createdAt).toLocaleString()}</td>
                    <td className="p-3 font-semibold text-slate-900">{c.email || 'Anonymous Guest'}</td>
                    <td className="p-3 font-bold text-slate-800">{c.purpose}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'GRANTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3">{c.noticeVersion}</td>
                    <td className="p-3 text-[10px] text-slate-500 font-mono truncate max-w-xs">{c.ipAddress || 'unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY EVENT LOGS */}
      {activeSubTab === 'events' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {securityEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-[10px]">{new Date(evt.createdAt).toLocaleString()}</td>
                    <td className="p-3 font-bold text-slate-900">{evt.eventType}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        evt.severity === 'HIGH' || evt.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        evt.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td className="p-3">{evt.description}</td>
                    <td className="p-3 font-mono text-[10px]">{evt.userId ? `${evt.userId.substring(0, 8)}...` : 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Review & Resolve Privacy Grievance</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div><strong>Principal:</strong> {selectedRequest.name} ({selectedRequest.email})</div>
              <div><strong>Request Type:</strong> {selectedRequest.requestType}</div>
              <div><strong>Submitted:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</div>
              <div className="pt-2 text-slate-800 border-t border-slate-200 mt-2">
                <strong>Description:</strong> <br />
                {selectedRequest.description}
              </div>
            </div>

            <form onSubmit={handleUpdateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800"
                >
                  <option value="IN_REVIEW">IN_REVIEW (Under Analysis)</option>
                  <option value="COMPLETED">COMPLETED (Resolved)</option>
                  <option value="REJECTED">REJECTED (Invalid / Rejected)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Resolution Notes (Internal)</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record steps taken to resolve this privacy request..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
                >
                  {isUpdating ? 'Saving...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
