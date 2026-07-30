import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Sparkles, Send } from 'lucide-react';
import { Category } from '../types';
import { INITIAL_CATEGORIES } from '../data/mockData';

interface HeroBannerProps {
  categories: Category[];
  mode?: 'launch' | 'home';
  launchDate?: Date;
  onSelectCategory?: (catId: string) => void;
  onExploreProducts: () => void;
  onRequestQuoteClick?: () => void;
  onExploreServices?: () => void;
  onLaunchComplete?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  categories,
  mode = 'launch',
  launchDate: launchDateProp,
  onSelectCategory,
  onExploreProducts,
  onRequestQuoteClick,
  onExploreServices,
  onLaunchComplete
}) => {
  const displayCategories = (Array.isArray(categories) && categories.length > 0) ? categories : INITIAL_CATEGORIES;
  const isLaunchMode = mode === 'launch';

  const launchDate = useMemo(() => {
    if (!isLaunchMode) {
      return new Date();
    }
    if (launchDateProp) {
      return launchDateProp;
    }
    const target = new Date();
    target.setSeconds(target.getSeconds() + 30);
    return target;
  }, [isLaunchMode, launchDateProp]);

  const [timeLeft, setTimeLeft] = useState(() => {
    if (!isLaunchMode) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const now = new Date();
    const diff = launchDate.getTime() - now.getTime();
    return diff > 0
      ? {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        }
      : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  });

  const [isBlasting, setIsBlasting] = useState(false);
  const launchCompletedRef = React.useRef(false);
  const onLaunchCompleteRef = React.useRef(onLaunchComplete);

  useEffect(() => {
    onLaunchCompleteRef.current = onLaunchComplete;
  }, [onLaunchComplete]);

  useEffect(() => {
    if (!isLaunchMode) {
      return;
    }

    const timer = window.setInterval(() => {
      const now = new Date();
      const diff = launchDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!launchCompletedRef.current) {
          launchCompletedRef.current = true;
          setIsBlasting(true);
          window.clearInterval(timer);
          window.setTimeout(() => {
            setIsBlasting(false);
            onLaunchCompleteRef.current?.();
          }, 1600);
        }
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLaunchMode, launchDate]);

  if (mode === 'home') {
    return (
      <div className="space-y-8 rounded-[36px] bg-white border border-slate-200 p-10 shadow-xl shadow-slate-200/80">
        <div className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-600">NEXRA 3D is now live</p>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-950">Explore our advanced 3D solutions</h1>
          <p className="mx-auto max-w-2xl text-slate-600 leading-7">
            Your launch is complete. Browse products, request quotes, or explore aerospace services with a clean experience.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <button
            className="rounded-3xl bg-cyan-600 px-6 py-5 text-white font-bold hover:bg-cyan-700"
            onClick={onExploreProducts}
          >
            Browse Products
          </button>
          <button
            className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 font-bold hover:bg-slate-100"
            onClick={onExploreServices}
          >
            Explore Services
          </button>
          <button
            className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 font-bold hover:bg-slate-100"
            onClick={onRequestQuoteClick}
          >
            Request a Quote
          </button>
        </div>

        {displayCategories.length > 0 && onSelectCategory && (
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Browse by category</p>
            <div className="flex flex-wrap gap-3">
              {displayCategories.slice(0, 6).map((category) => (
                <button
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:border-cyan-400 hover:text-cyan-700"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isBlasting) {
    return (
      <div className="relative min-h-[420px] overflow-hidden rounded-[36px] bg-slate-950 border border-slate-800 shadow-2xl shadow-slate-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.98))]" />
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-10 px-4 py-8">
          <div className="relative flex h-56 w-32 items-end justify-center">
            <div className="absolute inset-x-0 bottom-0 h-32 rounded-full bg-orange-400/20 blur-2xl animate-[pulse_1.4s_ease-out_infinite]" />
            <div className="absolute inset-x-0 bottom-0 h-24 w-16 rounded-full bg-orange-300/30 blur-xl animate-[pulse_1.2s_ease-out_infinite]" />
            <div className="absolute inset-x-0 bottom-0 h-16 w-9 rounded-full bg-amber-400/70 blur-lg animate-[pulse_1s_ease-out_infinite]" />
            <div className="relative flex h-48 w-16 flex-col items-center justify-start rounded-full bg-slate-100 shadow-[0_0_30px_rgba(148,163,184,0.4)]">
              <div className="mt-2 h-10 w-10 rounded-full bg-slate-900 shadow-inner" />
              <div className="mt-2 h-14 w-10 rounded-full bg-slate-900" />
              <div className="absolute -left-4 top-14 h-14 w-8 rounded-r-full bg-red-500" />
              <div className="absolute -right-4 top-14 h-14 w-8 rounded-l-full bg-red-500" />
              <div className="absolute -bottom-5 h-12 w-12 rounded-full border border-white/30 bg-orange-500 blur-sm" />
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Launching...
            </div>
            <div className="h-2 w-full rounded-full bg-slate-700">
              <div className="h-full w-full rounded-full bg-amber-400 animate-[pulse_1.6s_ease-in-out_1]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Launch Panel */}
      <div className="overflow-hidden rounded-[36px] bg-white border border-slate-200 p-8 sm:p-10 shadow-xl shadow-slate-200/80">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-600/90">Launching at 6:00 PM today</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black text-slate-950 leading-tight">
              NEXRA 3D is going live soon.
            </h1>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((unit) => (
                <div key={unit.label} className="rounded-3xl bg-white px-4 py-5 shadow-sm border border-slate-200">
                  <div className="text-3xl font-black text-slate-950">{String(unit.value).padStart(2, '0')}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
