import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Upload,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { FAQ, Service } from '../types';
import { WhatsAppIcon } from './WhatsAppFloatingButton';

interface ContactPageProps {
  services?: Service[];
  faqs?: FAQ[];
  onRequestQuoteClick?: () => void;
  onSuccessToast?: (msg: string) => void;
}

const DEFAULT_FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'What CAD file formats do you accept for quotation?',
    answer: 'We accept standard 3D CAD geometry formats including .STL, .STEP (.STP), .IGES (.IGS), .OBJ, .3MF, and native SolidWorks files. For 2D engineering drawings, we support .PDF and .DXF.'
  },
  {
    id: 'faq-2',
    question: 'What is your standard lead time for prototyping orders?',
    answer: 'Standard lead times for SLA, SLS, and FDM prototyping range from 24 to 48 hours for dispatch across India. Complex post-processing or metallic DMLS parts typically take 3 to 5 business days.'
  },
  {
    id: 'faq-3',
    question: 'Do you sign Non-Disclosure Agreements (NDAs)?',
    answer: 'Yes, absolutely. We prioritize your intellectual property. You can download our standard mutual NDA or upload your proprietary NDA document before submitting CAD files.'
  },
  {
    id: 'faq-4',
    question: 'What dimensional tolerances can NEXRA 3D achieve?',
    answer: 'Our SLA photopolymer printers achieve layer resolutions of 25 to 50 microns with dimensional tolerances of ±0.05mm. SLS nylon parts achieve ±0.1mm tolerances.'
  }
];

export const ContactPage: React.FC<ContactPageProps> = ({
  services = [],
  faqs,
  onRequestQuoteClick,
  onSuccessToast
}) => {
  const activeFaqs = Array.isArray(faqs) && faqs.length > 0 ? faqs : DEFAULT_FAQS;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [message, setMessage] = useState('');
  const [materialPreference, setMaterialPreference] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openFaqId, setOpenFaqId] = useState<string | null>(activeFaqs[0]?.id || null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setFileName(file.name);
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setFileUrl(data.url);
      } else {
        setFileUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800');
      }
    } catch (err) {
      console.error(err);
      setFileUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !message) {
      setError('Please provide your Name, Email, and Message / Description.');
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
      serviceName: selectedSrv?.name || 'General Contact Inquiry',
      projectDescription: message,
      quantity: Number(quantity) || 1,
      materialPreference: materialPreference || undefined,
      fileUrl: fileUrl || undefined
    };

    try {
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit inquiry.');
        return;
      }

      setSuccess(true);
      if (onSuccessToast) onSuccessToast('Contact inquiry & quote request submitted successfully!');
    } catch (err: any) {
      console.error(err);
      setError('Network error submitting contact form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Header */}
      <section className="bg-slate-900 text-white relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> NEXRA 3D — Industrial Additive Manufacturing
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Get in Touch with NEXRA 3D
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Have questions about SLA 3D printers, engineering resin compatibility, or need a custom CAD manufacturing quote? Our application engineering team is ready to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* Contact Info Cards + Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Business & Facility Information
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Additive Facility Address</h5>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Plot no 484, TNGOs Colony, Gachibowli, Hyderabad - 500046, Telangana, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Phone & Mobile Support</h5>
                    <p className="text-slate-600 mt-0.5">+91 88861 49998</p>
                    <p className="text-slate-600 mt-0.5">+91 88861 59998</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
                  <div className="w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-2xs" style={{ backgroundColor: '#25D366' }}>
                    <WhatsAppIcon className="w-5 h-5 fill-white" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-900 flex items-center justify-between">
                      WhatsApp Chat
                      <span className="text-[10px] bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full uppercase">Instant</span>
                    </h5>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">+91 8886159998</p>
                    <a
                      href="https://wa.me/918886159998?text=Hello%20NEXRA%203D%2C%20I%20have%20an%20inquiry%20regarding%203D%20printing%20services."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 mt-1.5 group"
                    >
                      <span>Start WhatsApp Chat</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Email Contact</h5>
                    <p className="text-slate-600 mt-0.5">Sales: <a href="mailto:sales@nexra3d.in" className="text-cyan-600 hover:underline">sales@nexra3d.in</a></p>
                    <p className="text-slate-600 mt-0.5">Enquiry: <a href="mailto:Enquiry@nexra3d.in" className="text-cyan-600 hover:underline">Enquiry@nexra3d.in</a></p>
                    <p className="text-slate-600 mt-0.5">Support: <a href="mailto:support@nexra3d.in" className="text-cyan-600 hover:underline">support@nexra3d.in</a></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Working Hours</h5>
                    <p className="text-slate-600 mt-0.5">Monday – Saturday: 9:00 AM – 7:00 PM IST</p>
                    <p className="text-slate-500 text-xs">Closed on Sundays & National Holidays</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase">
                <ShieldCheck className="w-4 h-4" /> Confidentiality Guarantee
              </div>
              <h4 className="font-bold text-base">NDA & Proprietary CAD Geometry</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                All uploaded STL/STEP files and technical drawings are handled under strict NDA protocols. Your IP remains 100% confidential.
              </p>
            </div>
          </div>

          {/* Interactive Contact & Quote Form Column */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Send Message or Quote Request</h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6">
              Fill in the details below to receive a engineering response or custom price quote within 2 to 4 business hours.
            </p>

            {success ? (
              <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-xl font-bold text-slate-900">Inquiry Received Successfully!</h4>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Thank you for reaching out to NEXRA 3D. An application engineer will review your inquiry and get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
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
                    <label className="block font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Apex Engineering Solutions"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Service Required</label>
                    <select
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    >
                      <option value="">Select Service (Optional)</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estimated Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Project Message / Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your requirements, dimensions, material preferences, or inquiry..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                  />
                </div>

                {/* File Attachment */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Attach CAD File / Drawing</label>
                  <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Upload className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-slate-600 truncate text-xs">
                        {fileName ? fileName : 'Upload STL, STEP, 3MF, or PDF drawing'}
                      </span>
                    </div>
                    <label className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer shrink-0">
                      Browse
                      <input
                        type="file"
                        accept=".stl,.step,.stp,.iges,.3mf,.png,.jpg,.jpeg,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {isUploading && <p className="text-[11px] text-cyan-600 mt-1">Uploading attachment...</p>}
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Sending Message...' : 'Submit Contact Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FAQs Section */}
        {activeFaqs && activeFaqs.length > 0 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="space-y-1">
              <span className="text-cyan-600 font-extrabold text-xs uppercase tracking-wider block">
                Frequently Asked Questions
              </span>
              <h3 className="text-2xl font-bold text-slate-900">NEXRA 3D Service & Ordering FAQ</h3>
            </div>

            <div className="space-y-3 pt-2">
              {activeFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full p-4 text-left font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-4 cursor-pointer text-sm"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
