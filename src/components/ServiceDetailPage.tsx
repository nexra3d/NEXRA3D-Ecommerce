import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Send,
  Upload,
  AlertCircle,
  Building2,
  ChevronRight
} from 'lucide-react';
import { Service } from '../types';

interface ServiceDetailPageProps {
  service: Service;
  onBack?: () => void;
  onBackToServices?: () => void;
  onRequestQuote?: (service: Service) => void;
  onNavigateContact?: () => void;
  allServices?: Service[];
  onSelectService?: (service: Service) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  service,
  onBack,
  onBackToServices,
  onRequestQuote,
  onNavigateContact,
  allServices,
  onSelectService
}) => {
  const handleBack = onBack || onBackToServices || (() => {});
  const handleQuote = onRequestQuote || (() => {});
  const handleContact = onNavigateContact || (() => {});

  const [selectedImage, setSelectedImage] = useState<string>(
    service?.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200'
  );

  const galleryList = Array.isArray(service.gallery) ? service.gallery : [selectedImage];
  const industriesList = Array.isArray(service.industries)
    ? service.industries
    : ['Aerospace', 'Automotive', 'Medical & Dental', 'Consumer Electronics', 'Industrial Machinery'];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-slate-900 text-white py-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Services
          </button>
          <div className="flex items-center gap-2 text-slate-400">
            <span>NEXRA 3D Services</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-cyan-400 font-bold">{service.name}</span>
          </div>
        </div>
      </div>

      {/* Main Service Overview Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Industrial Additive Manufacturing Service
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {service.name}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {service.shortDescription || service.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => handleQuote(service)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Request Quote for {service.name}
              </button>
              <button
                onClick={handleContact}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Contact Application Engineers
              </button>
            </div>
          </div>

          {/* Service Main Preview Image & Gallery */}
          <div className="space-y-4">
            <div className="aspect-16/10 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950 relative">
              <img
                src={selectedImage}
                alt={service.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {galleryList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {galleryList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImage === imgUrl ? 'border-cyan-500 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Detailed Technical Content & Specifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Full Description & Capabilities */}
        <div className="lg:col-span-2 space-y-10">
          {/* Detailed Description */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
              Service Capabilities & Process Overview
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {service.description ||
                `${service.name} at NEXRA 3D combines state-of-the-art additive equipment with meticulous design-for-additive-manufacturing (DFAM) analysis. Our high-precision process delivers isotropic mechanical properties, crisp surface detailing, and consistent layer adhesion suitable for critical engineering evaluations.`}
            </div>

            {/* Key Advantages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Micron Accuracy</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Tight engineering tolerances down to ±0.05mm across dimensions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Clock className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">24-48 Hour Dispatch</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Express processing and priority courier delivery throughout India.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Strict NDA Protection</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">100% confidential CAD data handling and encrypted file storage.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Sparkles className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Post-Processing</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">UV curing, bead blasting, vapor smoothing, and custom coloring.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Target Industries */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-600" /> Target Industries & Applications
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              This manufacturing service is specifically optimized for applications in the following industrial sectors:
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {industriesList.map((ind, idx) => (
                <span
                  key={idx}
                  className="bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold text-xs px-3.5 py-2 rounded-xl"
                >
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quote Trigger Card & Contact Support */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800 space-y-6 sticky top-24">
            <div className="space-y-2">
              <span className="text-cyan-400 font-extrabold text-xs uppercase tracking-wider block">
                Instant CAD Quote
              </span>
              <h3 className="text-2xl font-black text-white">Ready for Production?</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Upload your CAD model geometry (STL, STEP, IGES) and specify quantity to receive a formal quotation within 2 to 4 hours.
              </p>
            </div>

            <button
              onClick={() => handleQuote(service)}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm py-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Request Quote Now
            </button>

            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero obligation geometry analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Expert DFM engineering guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>GST Tax Invoice provided</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
