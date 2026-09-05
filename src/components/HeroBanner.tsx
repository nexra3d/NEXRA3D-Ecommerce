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
    <div className="space-y-6">
      {/* Main Hero Slider Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800">
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-cyan-500/20 border border-cyan-400/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>NEXRA 3D — A BRAND OF VL TECHNOLOGIES PRIVATE LIMITED</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Create. Customize. Print. <br />
            <span className="bg-linear-to-r from-cyan-400 via-indigo-200 to-emerald-300 bg-clip-text text-transparent">
              3D Printed Products & Additive Services
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            Discover premium 3D printed products, personalized creations, and professional additive manufacturing services from NEXRA 3D.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onExploreProducts}
              className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span>Shop Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onRequestQuoteClick}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-2xl border border-slate-700 transition-colors cursor-pointer"
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
            <h3 className="text-xl font-extrabold text-slate-900">Explore Product Categories</h3>
            <p className="text-xs text-slate-500">Premium 3D printed consumer creations & industrial supplies</p>
          </div>
          <span className="text-xs text-cyan-600 font-bold hidden sm:inline">NEXRA 3D Collections</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 hover:border-cyan-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="h-36 overflow-hidden relative">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <span className="absolute top-3 left-3 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                  {cat.slug.replace('-', ' ')}
                </span>
                <h4 className="absolute bottom-3 left-3 right-3 text-white font-extrabold text-base leading-tight">
                  {cat.name}
                </h4>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {cat.description || `Discover high quality 3D printed ${cat.name.toLowerCase()} from NEXRA 3D.`}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-cyan-600 group-hover:text-cyan-700">
                  <span>Explore {cat.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
