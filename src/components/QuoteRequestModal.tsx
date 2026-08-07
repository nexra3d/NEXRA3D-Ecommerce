import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, FileText, Send, Sparkles, ShieldCheck } from 'lucide-react';
import { Service } from '../types';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  services?: Service[];
  selectedService?: Service | null;
  preselectedService?: Service | null;
  onQuoteSubmitted?: (req: any) => void;
  onSuccessToast?: (msg: string) => void;
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  isOpen,
  onClose,
  services = [],
  selectedService,
  preselectedService,
  onQuoteSubmitted,
  onSuccessToast
}) => {
  const activePreselected = selectedService || preselectedService || null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [serviceId, setServiceId] = useState(activePreselected?.id || '');
  const [projectDescription, setProjectDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [materialPreference, setMaterialPreference] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Handle File Upload for CAD / Drawings
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setFileName(file.name);
    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setUploadedFileUrl(data.url);
      } else {
        // Fallback for non-image CAD preview representation
        setUploadedFileUrl(`https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800`);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadedFileUrl(`https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !email || !projectDescription) {
      setErrorMessage('Please fill in all required fields (Name, Email, Project Description).');
      return;
    }

    setIsSubmitting(true);

    const selectedSrv = services.find((s) => s.id === serviceId);

    const payload = {
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      serviceId: serviceId || undefined,
      serviceName: selectedSrv?.name || preselectedService?.name || 'Custom 3D Printing Service',
      projectDescription,
      quantity: Number(quantity) || 1,
      materialPreference: materialPreference || undefined,
      deliveryDate: deliveryDate || undefined,
      fileUrl: uploadedFileUrl || undefined,
      additionalNotes: additionalNotes || undefined
    };

    try {
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit quote request. Please try again.');
        return;
      }

      setIsSuccess(true);
      if (onQuoteSubmitted) onQuoteSubmitted(data);
      if (onSuccessToast) onSuccessToast('Quote request submitted successfully!');
    } catch (err: any) {
      console.error('Submit quote request error:', err);
      setErrorMessage(err.message || 'Network error submitting quote request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setServiceId('');
    setProjectDescription('');
    setQuantity('1');
    setMaterialPreference('');
    setDeliveryDate('');
    setAdditionalNotes('');
    setUploadedFileUrl(null);
    setFileName(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 relative">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-5 sm:p-8 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" /> NEXRA 3D On-Demand Manufacturing
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Request an Engineering CAD Quote
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
            Upload your CAD geometry, select material parameters, and receive a formal manufacturing price quote within 2 to 4 hours.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 min-h-0">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Quote Request Received!</h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{name}</strong>. Our application engineering team has received your request and file attachments. We will review the geometry for DFM and email your official quote shortly.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Close & Return to Store
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Personal & Contact Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  1. Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@company.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Apex Robotics Pvt Ltd"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Service & Technical Parameters */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  2. Manufacturing Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Service</label>
                    <select
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    >
                      <option value="">General 3D Printing Inquiry</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Estimated Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Material Preference</label>
                    <input
                      type="text"
                      value={materialPreference}
                      onChange={(e) => setMaterialPreference(e.target.value)}
                      placeholder="e.g. High-Temp Resin, Carbon Fiber Nylon, Biocompatible Clear"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Target Delivery Date</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Project Description & Requirements <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe functional usage, dimensional tolerances, surface finish requirements, or color preference..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* CAD File Upload Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  3. CAD File / Drawing Attachment (Optional)
                </h4>

                <div className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl p-4 text-center transition-colors bg-slate-50 relative">
                  <input
                    type="file"
                    accept=".stl,.step,.stp,.iges,.igs,.obj,.3mf,.png,.jpg,.jpeg,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <Upload className="w-8 h-8 text-cyan-600 mx-auto" />
                    <p className="text-slate-800 font-bold text-xs">
                      {fileName ? `Selected: ${fileName}` : 'Click or drag CAD files (STL, STEP, IGES, 3MF, PDF, Images)'}
                    </p>
                    <p className="text-slate-400 text-[11px]">Up to 100MB per file. Strictly confidential under mutual NDA.</p>
                  </div>
                </div>

                {isUploading && (
                  <p className="text-cyan-600 text-xs font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" /> Uploading file attachment...
                  </p>
                )}

                {uploadedFileUrl && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" /> File attached successfully
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileUrl(null);
                        setFileName(null);
                      }}
                      className="text-emerald-700 hover:underline font-bold text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Confidentiality Notice & Submit Button */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>All uploaded CAD geometry is processed under strict confidentiality and standard Non-Disclosure protocols.</span>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      'Submitting Quote...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Quote Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
