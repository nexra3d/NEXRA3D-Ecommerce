import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Printer,
  Compass,
  Factory
} from 'lucide-react';

interface AboutPageProps {
  onRequestQuoteClick?: () => void;
  onNavigateServices?: () => void;
  onExploreServices?: () => void;
  onNavigateProducts?: () => void;
  onExploreProducts?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onRequestQuoteClick,
  onNavigateServices,
  onExploreServices,
  onNavigateProducts,
  onExploreProducts
}) => {
  const handleServices = onNavigateServices || onExploreServices;
  const handleProducts = onNavigateProducts || onExploreProducts;
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Header */}
      <section className="bg-slate-900 text-white relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> NEXRA 3D — Industrial Additive Manufacturing
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6">
              Pioneering Industrial 3D Printing & Additive Manufacturing
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              NEXRA 3D is a premier industrial 3D printing, rapid prototyping, and precision custom manufacturing platform. We bridge the gap between initial CAD concepts and end-use production parts with micron-level accuracy.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onRequestQuoteClick}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                Request Instant CAD Quote
              </button>
              <button
                onClick={onNavigateServices}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Explore Services
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To empower engineers, architects, surgeons, and designers with seamless access to industrial-grade 3D printers, biocompatible resins, and rapid custom manufacturing services without capital overhead.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To establish NEXRA 3D as the benchmark for on-demand digital manufacturing across Asia-Pacific, supporting distributed production, zero inventory waste, and agile prototyping.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Quality Guarantee</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every component manufactured in our facility undergoes rigorous CMM dimensional inspection, density testing, and surface finish validation to meet tight engineering tolerances.
            </p>
          </div>
        </div>

        {/* Detailed Overview Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-cyan-600 font-extrabold text-xs uppercase tracking-widest block">
              Why Choose NEXRA 3D
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              State-of-the-Art Additive Manufacturing Infrastructure
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              At NEXRA 3D, we operate advanced 4K SLA photopolymer resin systems, high-temperature dual-extruder FDM machines, and SLS powder bed fusion technology. Our cleanroom facilities produce precision industrial tooling, aerospace-grade carbon fiber components, and architectural masterplans.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">0.02mm Layer Repeatability</h4>
                  <p className="text-slate-500 text-xs">Micron-accurate feature resolution for intricate snap-fits and bezel assemblies.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Rapid Turnaround (24 - 48 Hours)</h4>
                  <p className="text-slate-500 text-xs">Fast DFM automated quote generation and express courier delivery across India.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Engineering Materials Portfolio</h4>
                  <p className="text-slate-500 text-xs">High-temp resins, carbon fiber filled Nylon, PEEK, TPU, and zero-ash castable resins.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] min-h-[250px] w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 group">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200"
                alt="Bambu Lab High-Speed 3D Printers - NEXRA Industrial Printing Facility"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 bg-slate-900/90 text-white px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-extrabold flex items-center gap-2 backdrop-blur-xs shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Bambu Lab X1-Carbon High-Speed Print Farm</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-slate-900 text-white p-6 rounded-2xl shadow-xl hidden sm:block border border-slate-800 max-w-xs">
              <div className="text-3xl font-black text-cyan-400">10,000+</div>
              <p className="text-xs text-slate-300 mt-1">Precision prototypes and production components delivered nationwide.</p>
            </div>
          </div>
        </div>

        {/* Industrial Application Capabilities */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Industries Served</h2>
            <p className="text-slate-600 text-sm">
              NEXRA 3D provides specialized additive manufacturing solutions tailored for high-stakes industries.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2 hover:border-cyan-500 transition-colors">
              <div className="text-3xl font-bold text-cyan-600">Aero</div>
              <h4 className="font-bold text-slate-900 text-sm">Aerospace & Defense</h4>
              <p className="text-slate-500 text-xs">Lightweight carbon fiber ducting and structural components.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2 hover:border-cyan-500 transition-colors">
              <div className="text-3xl font-bold text-indigo-600">Tool</div>
              <h4 className="font-bold text-slate-900 text-sm">Industrial Tooling</h4>
              <p className="text-slate-500 text-xs">Custom assembly jigs, CMM fixtures & inspection gauges.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2 hover:border-cyan-500 transition-colors">
              <div className="text-3xl font-bold text-emerald-600">Auto</div>
              <h4 className="font-bold text-slate-900 text-sm">Automotive Engineering</h4>
              <p className="text-slate-500 text-xs">Functional intake manifolds, housings, and custom jigs.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2 hover:border-cyan-500 transition-colors">
              <div className="text-3xl font-bold text-amber-600">Arch</div>
              <h4 className="font-bold text-slate-900 text-sm">Architecture & BIM</h4>
              <p className="text-slate-500 text-xs">High-detail masterplan physical models & facades.</p>
            </div>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight">Ready to Bring Your CAD Geometry to Life?</h2>
            <p className="text-slate-300 text-sm">
              Submit your project files today or shop our e-commerce store for 3D printers, engineering resins, and replacement components.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={onRequestQuoteClick}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                Request a Quote
              </button>
              <button
                onClick={onNavigateProducts}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Browse Shop Catalog
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
