import React from 'react';
import { ArrowRight, Sparkles, Send } from 'lucide-react';
import { Category } from '../types';
import { INITIAL_CATEGORIES } from '../data/mockData';

interface HeroBannerProps {
  categories: Category[];
  onSelectCategory: (catId: string) => void;
  onExploreProducts: () => void;
  onRequestQuoteClick?: () => void;
  onExploreServices?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  categories,
  onSelectCategory,
  onExploreProducts,
  onRequestQuoteClick,
  onExploreServices
}) => {
  const displayCategories = (Array.isArray(categories) && categories.length > 0) ? categories : INITIAL_CATEGORIES;
  return (
    <div className="space-y-8">
      {/* Main Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-800/80">
        {/* Glowing Radial Gradients */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center space-x-1.5 bg-cyan-500/15 border border-cyan-400/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-cyan-300 shadow-xs">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse shrink-0" />
            <span className="tracking-wide">NEXRA 3D — A BRAND OF VL TECHNOLOGIES PVT LTD</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Create. Customize. Print. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-200 to-emerald-300 bg-clip-text text-transparent">
              3D Printed Products & Additive Services
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            Discover premium 3D printed products, personalized creations, and professional additive manufacturing services from NEXRA 3D.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={onExploreProducts}
              className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-7 py-3.5 rounded-2xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Shop Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onRequestQuoteClick}
              className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800 text-white font-bold px-7 py-3.5 rounded-2xl border border-slate-700/80 transition-all cursor-pointer backdrop-blur-sm"
            >
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Get a Custom Quote</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Visual Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Explore Product Categories</h3>
            <p className="text-xs text-slate-500 font-medium">Premium 3D printed consumer creations & industrial supplies</p>
          </div>
          <span className="text-xs text-cyan-600 font-bold hidden sm:inline bg-cyan-50 border border-cyan-200/60 px-3 py-1 rounded-full">NEXRA 3D Collections</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="h-40 overflow-hidden relative">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-cyan-500/95 backdrop-blur-md text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-xs tracking-wider">
                  {cat.slug.replace('-', ' ')}
                </span>
                <h4 className="absolute bottom-3 left-3 right-3 text-white font-black text-base leading-tight">
                  {cat.name}
                </h4>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {cat.description || `Discover high quality 3D printed ${cat.name.toLowerCase()} from NEXRA 3D.`}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-cyan-600 group-hover:text-cyan-700">
                  <span>Explore {cat.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
