import React from 'react';

interface NexraLogoProps {
  variant?: 'light' | 'dark' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'stacked';
  showSubtitle?: boolean;
  className?: string;
}

interface MarkProps {
  idSuffix: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isDarkBg?: boolean;
}

const CubeParticleMark: React.FC<MarkProps> = ({ idSuffix, size = 'md', isDarkBg = false }) => {
  const iconHeights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-13 sm:h-15',
    xl: 'h-18 sm:h-20'
  };

  return (
    <svg
      viewBox="0 0 110 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconHeights[size]} w-auto shrink-0 select-none drop-shadow-xs`}
    >
      <defs>
        <linearGradient id={`nexraCubeGrad_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="35%" stopColor="#A855F7" />
          <stop offset="70%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <linearGradient id={`nexraLineGrad_${idSuffix}`} x1="20%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#D946EF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Disintegrating Particle Cloud on Left Side */}
      <g opacity="0.92">
        {/* Outer dispersed dots */}
        <circle cx="12" cy="38" r="1.5" fill="#8B5CF6" opacity="0.45" />
        <circle cx="16" cy="26" r="2" fill="#9333EA" opacity="0.5" />
        <circle cx="18" cy="50" r="1.8" fill="#A855F7" opacity="0.6" />
        <circle cx="14" cy="62" r="1.5" fill="#C084FC" opacity="0.5" />
        <circle cx="8" cy="46" r="1.2" fill="#7C3AED" opacity="0.4" />
        
        <circle cx="22" cy="18" r="2.2" fill="#8B5CF6" opacity="0.6" />
        <circle cx="24" cy="34" r="2.5" fill="#9333EA" opacity="0.7" />
        <circle cx="26" cy="44" r="2" fill="#A855F7" opacity="0.75" />
        <circle cx="22" cy="56" r="2.2" fill="#D946EF" opacity="0.65" />
        <circle cx="20" cy="70" r="1.8" fill="#E11D48" opacity="0.55" />

        <circle cx="30" cy="14" r="2" fill="#A855F7" opacity="0.7" />
        <circle cx="32" cy="28" r="2.8" fill="#9333EA" opacity="0.8" />
        <circle cx="34" cy="38" r="2.2" fill="#C084FC" opacity="0.85" />
        <circle cx="30" cy="50" r="2.5" fill="#D946EF" opacity="0.8" />
        <circle cx="28" cy="64" r="2" fill="#EC4899" opacity="0.7" />
        <circle cx="26" cy="76" r="1.5" fill="#F43F5E" opacity="0.5" />

        {/* Medium density transition dots */}
        <circle cx="38" cy="22" r="2.5" fill="#9333EA" opacity="0.85" />
        <circle cx="40" cy="32" r="3" fill="#A855F7" opacity="0.9" />
        <circle cx="42" cy="44" r="2.8" fill="#C084FC" opacity="0.9" />
        <circle cx="38" cy="56" r="2.6" fill="#D946EF" opacity="0.85" />
        <circle cx="36" cy="68" r="2.2" fill="#EC4899" opacity="0.8" />

        <circle cx="46" cy="18" r="2.2" fill="#8B5CF6" opacity="0.85" />
        <circle cx="48" cy="28" r="2.5" fill="#A855F7" opacity="0.95" />
        <circle cx="50" cy="38" r="2.8" fill="#C084FC" opacity="0.9" />
        <circle cx="46" cy="50" r="3" fill="#D946EF" opacity="0.9" />
        <circle cx="44" cy="62" r="2.5" fill="#EC4899" opacity="0.85" />
        <circle cx="42" cy="74" r="2" fill="#F43F5E" opacity="0.7" />
      </g>

      {/* Wireframe Lines connecting isometric cube vertices */}
      <g stroke={`url(#nexraLineGrad_${idSuffix})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Main Isometric Cube Outer Edges */}
        <line x1="55" y1="14" x2="88" y2="31" />
        <line x1="88" y1="31" x2="88" y2="67" />
        <line x1="88" y1="67" x2="55" y2="84" />
        <line x1="55" y1="84" x2="45" y2="69" />
        <line x1="55" y1="14" x2="43" y2="28" />

        {/* Center Y Lines */}
        <line x1="55" y1="14" x2="55" y2="49" />
        <line x1="55" y1="49" x2="88" y2="31" />
        <line x1="55" y1="49" x2="55" y2="84" />
        <line x1="55" y1="49" x2="43" y2="44" />

        {/* Inner grid lines */}
        <line x1="71" y1="22" x2="71" y2="58" opacity="0.65" />
        <line x1="55" y1="31" x2="88" y2="49" opacity="0.65" />
        <line x1="71" y1="40" x2="88" y2="31" opacity="0.55" />
        <line x1="55" y1="67" x2="88" y2="49" opacity="0.65" />
      </g>

      {/* Nodes / Vertices (Circles) */}
      <g fill={`url(#nexraCubeGrad_${idSuffix})`}>
        <circle cx="55" cy="14" r="3.5" />
        <circle cx="88" cy="31" r="3.5" fill="#EC4899" />
        <circle cx="88" cy="67" r="3.5" fill="#F43F5E" />
        <circle cx="55" cy="84" r="3.5" />
        <circle cx="55" cy="49" r="4" />
        
        {/* Intermediate grid nodes */}
        <circle cx="71" cy="22" r="2.5" />
        <circle cx="71" cy="58" r="2.5" fill="#E11D48" />
        <circle cx="71" cy="40" r="2.5" />
      </g>

      {/* Embedded Text Underneath the Particle Cube: Nexra 3D */}
      <text
        x="55"
        y="108"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="17"
        letterSpacing="-0.3"
      >
        <tspan fill={isDarkBg ? "#E2E8F0" : "#1E1B4B"} fontWeight="300">Nexra </tspan>
        <tspan fill="#C084FC" fontWeight="300">3D</tspan>
      </text>
    </svg>
  );
};

export const NexraLogo: React.FC<NexraLogoProps> = ({
  variant = 'light',
  size = 'md',
  layout = 'horizontal',
  className = ''
}) => {
  const isDarkBg = variant === 'dark';

  const titleFontSizes = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-3xl sm:text-4xl'
  };

  const primaryTextColor = isDarkBg ? 'text-white' : 'text-slate-900';

  if (variant === 'icon-only') {
    return <CubeParticleMark idSuffix="iconOnly" size={size} isDarkBg={isDarkBg} />;
  }

  const NexraText = (
    <div className={`tracking-tight leading-none flex items-center gap-1 font-sans ${titleFontSizes[size]} ${primaryTextColor}`}>
      <span className="font-extrabold tracking-tight">NEXRA</span>
      <span className="font-extrabold text-cyan-500 tracking-normal">3D</span>
    </div>
  );

  if (layout === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center justify-center gap-1 select-none text-center ${className}`}>
        {/* Top: Vector Particle Mark */}
        <CubeParticleMark idSuffix={`stacked_${variant}`} size={size} isDarkBg={isDarkBg} />

        {/* Bottom: Nexra 3D Name */}
        {NexraText}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2.5 select-none ${className}`}>
      {/* Logo Icon Mark */}
      <CubeParticleMark idSuffix={variant} size={size} isDarkBg={isDarkBg} />

      {/* Text on right next to logo */}
      {NexraText}
    </div>
  );
};

