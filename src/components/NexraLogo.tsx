import React from 'react';

interface NexraLogoProps {
  variant?: 'light' | 'dark' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

interface SpiralMarkProps {
  idSuffix: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isDarkBg?: boolean;
}

const SpiralMark: React.FC<SpiralMarkProps> = ({ idSuffix, size = 'md', isDarkBg = false }) => {
  const iconHeights = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24'
  };

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconHeights[size]} w-auto shrink-0 select-none drop-shadow-xs`}
    >
      <defs>
        <linearGradient id={`goldGradient_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="30%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>

      {/* Golden Feather Spiral Nautilus Shell */}
      <g transform="translate(60, 48)">
        {[
          { deg: -120, scale: 0.32, opacity: 0.50 },
          { deg: -100, scale: 0.36, opacity: 0.55 },
          { deg: -80, scale: 0.40, opacity: 0.60 },
          { deg: -60, scale: 0.45, opacity: 0.65 },
          { deg: -40, scale: 0.50, opacity: 0.70 },
          { deg: -20, scale: 0.56, opacity: 0.75 },
          { deg: 0, scale: 0.62, opacity: 0.80 },
          { deg: 20, scale: 0.68, opacity: 0.84 },
          { deg: 40, scale: 0.74, opacity: 0.88 },
          { deg: 60, scale: 0.80, opacity: 0.92 },
          { deg: 80, scale: 0.86, opacity: 0.95 },
          { deg: 100, scale: 0.92, opacity: 0.98 },
          { deg: 120, scale: 0.98, opacity: 1.00 },
          { deg: 140, scale: 1.04, opacity: 1.00 },
          { deg: 160, scale: 1.10, opacity: 1.00 }
        ].map((item, idx) => (
          <path
            key={idx}
            d="M 0 0 C 10 -22 38 -18 40 -2 Q 24 -8 0 0 Z"
            fill={`url(#goldGradient_${idSuffix})`}
            opacity={item.opacity}
            transform={`rotate(${item.deg}) scale(${item.scale})`}
          />
        ))}
      </g>

      {/* Embedded Emblem Text: NEXRA 3D */}
      <text
        x="60"
        y="100"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="900"
        fontSize="11"
        fill={isDarkBg ? "#FBBF24" : "#B45309"}
        letterSpacing="1.2"
      >
        NEXRA 3D
      </text>

      {/* Embedded Tagline: EVERY LAYER BY PRECISION */}
      <text
        x="60"
        y="112"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="800"
        fontSize="5"
        fill={isDarkBg ? "#9CA3AF" : "#6B7280"}
        letterSpacing="0.8"
      >
        EVERY LAYER BY PRECISION
      </text>
    </svg>
  );
};

export const NexraLogo: React.FC<NexraLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const isDarkBg = variant === 'dark';

  const titleFontSizes = {
    sm: 'text-base font-black',
    md: 'text-xl font-black',
    lg: 'text-3xl font-black',
    xl: 'text-5xl font-black'
  };

  const subFontSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-sm',
    xl: 'text-lg'
  };

  const primaryTextColor = isDarkBg ? 'text-white' : 'text-slate-900';
  const companyTextColor = isDarkBg ? 'text-amber-300 font-medium' : 'text-amber-800 font-semibold';

  if (variant === 'icon-only') {
    // Prefer using an authored JPEG logo when present in the public folder.
    // Place your `Nexra 3D logo.jpeg` at `public/nexra-logo.jpeg` (lowercase, no spaces)
    // The fallback is the existing SVG SpiralMark.
    const imgSrc = '/nexra-logo.jpeg';

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imgSrc}
        alt="NEXRA 3D"
        className={`block h-auto w-auto ${size === 'sm' ? 'h-9' : size === 'md' ? 'h-12' : size === 'lg' ? 'h-16' : 'h-24'}`}
        onError={(e) => {
          // If the JPEG isn't available, fall back to the SVG mark
          const target = e.currentTarget as HTMLImageElement;
          target.replaceWith(SpiralMark({ idSuffix: 'fallback', size, isDarkBg } as any) as any);
        }}
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-3.5 sm:gap-5 select-none ${className}`}>
      {/* 1. First: Separated Logo Icon Emblem - prefer authored JPEG, fall back to SVG */}
      <img
        src="/nexra-logo.jpeg"
        alt="NEXRA 3D"
        className={`shrink-0 select-none drop-shadow-xs ${size === 'sm' ? 'h-9' : size === 'md' ? 'h-12' : size === 'lg' ? 'h-16' : 'h-24'}`}
        onError={(e) => {
          const t = e.currentTarget as HTMLImageElement;
          t.onerror = null;
          t.src = '/logo.svg';
        }}
      />

      {/* 2. Then: Separated Header & Company Name */}
      <div className="flex flex-col justify-center">
        {/* Main Title: NEXRA 3D */}
        <div className={`tracking-tight leading-none flex items-center gap-2 ${titleFontSizes[size]} ${primaryTextColor}`}>
          <span>NEXRA</span>
          <span className="text-cyan-500 font-black">3D</span>
        </div>

        {/* Subtitle / Company Name: VL Technologies Private Limited */}
        {showSubtitle && (
          <div className={`tracking-wide mt-0.5 sm:mt-1 leading-tight font-serif hidden sm:block ${subFontSizes[size]} ${companyTextColor}`}>
            VL Technologies Private Limited
          </div>
        )}
      </div>
    </div>
  );
};
