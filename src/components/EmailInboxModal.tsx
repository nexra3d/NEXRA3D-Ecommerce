import React from 'react';
import { X, Mail, CheckCircle2, Clock, Send } from 'lucide-react';
import { EmailNotification } from '../types';

interface EmailInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: EmailNotification[];
}

export const EmailInboxModal: React.FC<EmailInboxModalProps> = ({ isOpen, onClose, emails }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-extrabold">Resend Transactional Email Logs</h2>
              <p className="text-xs text-slate-400">Live preview of automated notifications</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3">
          {emails.length > 0 ? (
            emails.map((eml) => (
              <div key={eml.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{eml.subject}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{eml.status}</span>
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                  <span>To: <strong>{eml.toEmail}</strong></span>
                  <span>•</span>
                  <span>Sent: {new Date(eml.sentAt).toLocaleString()}</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {eml.content}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No transactional emails logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
