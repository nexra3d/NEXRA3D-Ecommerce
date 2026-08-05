import React from 'react';
import { Plane, Rocket, Clock, ShieldCheck, Cpu, ArrowRight, Send, CheckCircle2, Sparkles } from 'lucide-react';

interface AerospacePageProps {
  onRequestQuote: () => void;
  onNavigateShop: () => void;
  onNavigateContact: () => void;
}

export const AerospacePage: React.FC<AerospacePageProps> = ({
  onRequestQuote,
  onNavigateShop,
  onNavigateContact,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero / Coming Soon Banner */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Catalog Coming Soon</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Aerospace <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Additive Catalog</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            We are curating our specialized industrial catalog for satellite brackets, ultra-lightweight carbon-fiber structural components, and high-temperature aerospace enclosures.
          </p>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Need Custom Aerospace Parts Right Now?</h4>
                <p className="text-xs text-slate-400">Our engineering team processes custom CAD models & NDAs immediately.</p>
              </div>
            </div>
            <button
              onClick={onRequestQuote}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Request Custom Quote</span>
            </button>
          </div>
        </div>
      </div>

      {/* Planned Capabilities / Preview Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Upcoming Aerospace Solutions</h2>
          <p className="text-slate-600 text-sm">
            NEXRA 3D provides precision additive manufacturing for mission-critical flight & satellite platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs hover:border-cyan-200 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Carbon Fiber Structures</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              SLS Nylon 12 + Carbon Fiber composite structural ribs, brackets, and motor mounts optimized for weight and impact resistance.
            </p>
            <div className="pt-2 text-[11px] font-bold text-cyan-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Strength-to-Weight
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs hover:border-cyan-200 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Avionics & Payload Housing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Custom flight controller enclosures, camera gimbals, thermal shroud covers, and vibration-damped battery bays.
            </p>
            <div className="pt-2 text-[11px] font-bold text-blue-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> IP-65 Rated Enclosures
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs hover:border-cyan-200 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Aerospace Jigs & Tooling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              CMM inspection fixtures, assembly alignment jigs, and composite lay-up tooling manufactured in flame-retardant polymers.
            </p>
            <div className="pt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> FAR 25.853 Compliance
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs hover:border-cyan-200 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Aerodynamic Ducting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Smooth inner-wall nacelles, prop ducts, and internal cooling airflow channels optimized with liquid resin SLA & DMLS.
            </p>
            <div className="pt-2 text-[11px] font-bold text-purple-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sub-0.05mm Tolerances
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Explore Available E-Commerce Products & Additive Services</h3>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          In the meantime, feel free to browse our standard shop catalog or explore our specialized industrial 3D printing services.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onNavigateShop}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>Browse Shop Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateContact}
            className="px-5 py-2.5 rounded-xl bg-white text-slate-800 border border-slate-300 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Contact Engineering Team
          </button>
        </div>
      </div>
    </div>
  );
};
