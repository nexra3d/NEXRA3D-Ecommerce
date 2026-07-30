import React from 'react';

interface NexraLogoProps {
  variant?: 'light' | 'dark' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

const logoSrc = '/logo.jpeg';

const imageHeights = {
  sm: 'h-10',
  md: 'h-14',
  lg: 'h-18',
  xl: 'h-28'
};

const titleSizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl'
};

const subtitleSizes = {
  sm: 'text-[10px]',
  md: 'text-[11px]',
  lg: 'text-[12px]',
  xl: 'text-[13px]'
};

export const NexraLogo: React.FC<NexraLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const isDarkBg = variant === 'dark';
  const titleColor = isDarkBg ? 'text-white' : 'text-slate-900';
  const subtitleColor = isDarkBg ? 'text-slate-300' : 'text-slate-500';

  if (variant === 'icon-only') {
    return (
      <img
        src={logoSrc}
        alt="NEXRA 3D logo"
        className={`${imageHeights[size]} w-auto object-contain select-none ${className}`}
        loading="eager"
        decoding="async"
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src={logoSrc}
        alt="NEXRA 3D logo"
        className={`${imageHeights[size]} w-auto object-contain rounded-md border border-slate-200 dark:border-slate-700 shadow-sm`}
        loading="eager"
        decoding="async"
      />

      <div className="flex flex-col justify-center min-w-0">
        <span className={`font-extrabold tracking-tight uppercase leading-none ${titleSizes[size]} ${titleColor}`}>
          NEXRA <span className="text-cyan-500">3D</span>
        </span>
        {showSubtitle && (
          <span className={`mt-0.5 ${subtitleColor} ${subtitleSizes[size]} truncate`}>
            VL Technologies Private Limited
          </span>
        )}
      </div>
    </div>
  );
};



