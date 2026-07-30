import React, { useState } from 'react';
import { Service } from '../types';
import {
  Box,
  Layers,
  Cpu,
  Building,
  Activity,
  Gem,
  Wrench,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Upload
} from 'lucide-react';

interface ServicesPageProps {
  services?: Service[];
  onSelectServiceForQuote?: (service: Service) => void;
  onRequestQuoteClick?: () => void;
  onViewServiceDetail?: (service: Service) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services = [],
  onSelectServiceForQuote,
  onRequestQuoteClick,
  onViewServiceDetail
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');

  const allIndustries = Array.from(
    new Set(
      services.flatMap((s) => s.industries || [])
    )
  );

  const filteredServices = services.filter((s) => {
    if (selectedIndustry === 'ALL') return true;
    return s.industries?.includes(selectedIndustry);
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Hero Header */}
      <section className="bg-slate-900 text-white relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> NEXRA 3D Industrial Additive Services
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Precision 3D Printing & Custom Manufacturing Services
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              From micron-accurate SLA prototypes and Class IIa biocompatible dental splints to high-temp carbon fiber engineering jigs and architectural masterplans. Receive engineering quotes in under 4 hours.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onRequestQuoteClick}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-5 h-5" /> Request Instant CAD Quote
              </button>
              <div className="flex items-center gap-6 text-sm text-slate-400 border-l border-slate-700 pl-6">
                <div>
                  <div className="text-white font-bold text-base">0.02mm</div>
                  <div>Layer Precision</div>
                </div>
                <div>
                  <div className="text-white font-bold text-base">24-48 hrs</div>
                  <div>Standard Turnaround</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Industry Filter Bar */}
        <div className="mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap pl-2">Filter Industry:</span>
          <button
            onClick={() => setSelectedIndustry('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              selectedIndustry === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Industries ({services.length})
          </button>
          {allIndustries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                selectedIndustry === ind
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div className="relative h-48 bg-slate-900 overflow-hidden">
                <img
                  src={service.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                {service.isFeatured && (
                  <span className="absolute top-3 right-3 bg-cyan-500 text-slate-950 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md shadow-xs">
                    Featured Service
                  </span>
                )}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {service.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {service.shortDescription || service.description}
                  </p>

                  {/* Industries tags */}
                  {service.industries && service.industries.length > 0 && (
                    <div className="mb-6">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Industries Served</span>
                      <div className="flex flex-wrap gap-1.5">
                        {service.industries.slice(0, 3).map((ind, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200/60"
                          >
                            {ind}
                          </span>
                        ))}
                        {service.industries.length > 3 && (
                          <span className="bg-slate-50 text-slate-500 text-xs px-2 py-1 rounded-md font-medium">
                            +{service.industries.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onViewServiceDetail(service)}
                    className="text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectServiceForQuote(service)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Process */}
        <div className="mt-20 bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-3xl mb-10">
            <span className="text-cyan-400 text-xs font-extrabold uppercase tracking-widest block mb-2">
              Simple 4-Step Production Workflow
            </span>
            <h2 className="text-3xl font-bold tracking-tight">How NEXRA 3D On-Demand Manufacturing Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h4 className="font-bold text-lg mb-2">Upload CAD File</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Upload STL, STEP, IGES, or 3MF files up to 100MB along with quantity and material requirements.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h4 className="font-bold text-lg mb-2">Engineering DFM Review</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Our application engineers review wall thickness and draft angles and deliver a formal quote within 4 hours.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h4 className="font-bold text-lg mb-2">Additive Production</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Parts are 3D printed on NEXRA 4K SLA / High-Temp FDM systems in controlled clean environments.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-4">
                04
              </div>
              <h4 className="font-bold text-lg mb-2">Quality Control & Dispatch</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                CMM dimensional inspection, ESD protective packaging, and express door delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
