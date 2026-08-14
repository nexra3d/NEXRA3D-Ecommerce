import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  Layers,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Gift,
  Compass,
  Palette
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
              <Sparkles className="w-3.5 h-3.5" /> NEXRA 3D — Custom 3D Printed Creations
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6">
              Transforming Ideas into Personalized 3D Printed Art
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              NEXRA 3D is India's premier destination for custom 3D-printed products, personalized photo lithophane lamps, divine idols, anime collectibles, bespoke keychains, and tailored gifts crafted with ultra-fine precision.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleProducts}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                Browse Shop Catalog
              </button>
              <button
                onClick={handleServices}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Custom 3D Printing Services
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
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Customized For You</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every memory deserves a tangible keepsake. We turn your cherished photos, names, and concepts into personalized 3D lithophane lamps and bespoke gifts.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Artisan Finish & Detail</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              From intricate divine temple idols to collectible anime figurines, every creation is printed with ultra-high resolution and meticulously hand-finished.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Quality Guarantee</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              We use premium eco-friendly materials and durable lighting components to ensure your custom pieces stay vibrant and lasting for years to come.
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
              Precision 3D Craftsmanship Delivered to Your Door
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              At NEXRA 3D, we combine cutting-edge additive technology with creative design to produce bespoke home decor, spiritual statues, and personalized gifting experiences.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Ultra-Fine Resolution</h4>
                  <p className="text-slate-500 text-xs">Micron-accurate detail brings out every contour in photo lithophanes and intricate sculptures.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Safe & Fast Delivery Across India</h4>
                  <p className="text-slate-500 text-xs">Secured shock-proof packaging with end-to-end order tracking via top courier networks.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">100% Satisfaction & Custom Previews</h4>
                  <p className="text-slate-500 text-xs">Direct photo upload assistance and live previews for all personalized and engraved items.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] min-h-[250px] w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 group">
              <img
                src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1200"
                alt="Personalized 3D Printed Lithophane Moon Lamp"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 bg-slate-900/90 text-white px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-extrabold flex items-center gap-2 backdrop-blur-xs shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Handcrafted & Precision 3D Printed</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-slate-900 text-white p-6 rounded-2xl shadow-xl hidden sm:block border border-slate-800 max-w-xs">
              <div className="text-3xl font-black text-cyan-400">10,000+</div>
              <p className="text-xs text-slate-300 mt-1">Custom 3D printed products and gifts delivered to happy customers nationwide.</p>
            </div>
          </div>
        </div>

        {/* Categories / Highlights */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">What We Create</h2>
            <p className="text-slate-600 text-sm">
              Discover our diverse collections of personalized, decorative, and spiritual 3D printed items.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2 hover:border-cyan-500 transition-colors">
              <div className="text-3xl font-bold text-cyan-600">Lamps</div>
              <h4 className="font-bold text-slate-900 text-sm">Lithophane Lamps</h4>
              <p className="text-slate-500 text-xs">Moon lamps, cylinder lamps, and customized night lights.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2 hover:border-cyan-500 transition-colors">
              <div className="text-3xl font-bold text-indigo-600">Idols</div>
              <h4 className="font-bold text-slate-900 text-sm">Divine & Spiritual Idols</h4>
              <p className="text-slate-500 text-xs">Exquisite temple statues with metallic and marble finishes.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2 hover:border-cyan-500 transition-colors">
              <div className="text-3xl font-bold text-emerald-600">Gifts</div>
              <h4 className="font-bold text-slate-900 text-sm">Personalized Gifts</h4>
              <p className="text-slate-500 text-xs">Custom keychains, photo frames, and anniversary keepsakes.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2 hover:border-cyan-500 transition-colors">
              <div className="text-3xl font-bold text-amber-600">Decor</div>
              <h4 className="font-bold text-slate-900 text-sm">Home & Office Decor</h4>
              <p className="text-slate-500 text-xs">Parametric wall clocks, planters, and modern tabletop art.</p>
            </div>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight">Have a Custom 3D Printing Idea?</h2>
            <p className="text-slate-300 text-sm">
              Whether you want a personalized gift, custom figure, or batch manufacturing for your business, we are ready to print.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={handleProducts}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                Shop Popular Products
              </button>
              <button
                onClick={handleServices}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Custom Printing Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
