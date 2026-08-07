import React from 'react';
import { Truck, ExternalLink } from 'lucide-react';

interface TrackingButtonProps {
  awbNumber?: string;
  trackingUrl?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrackingButton: React.FC<TrackingButtonProps> = ({
  awbNumber,
  trackingUrl,
  onClick,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const url = trackingUrl || (awbNumber ? `https://track.delhivery.com/track/package/${awbNumber}` : '#');

  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500';
  
  let sizeStyles = 'px-3.5 py-2 text-xs';
  if (size === 'sm') sizeStyles = 'px-2.5 py-1.5 text-[11px]';
  if (size === 'lg') sizeStyles = 'px-5 py-2.5 text-sm';

  let variantStyles = 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm';
  if (variant === 'secondary') variantStyles = 'bg-slate-100 hover:bg-slate-200 text-slate-800';
  if (variant === 'outline') variantStyles = 'border border-slate-300 hover:bg-slate-50 text-slate-700';

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}>
        <Truck className="w-3.5 h-3.5 shrink-0" />
        <span>Track Shipment</span>
      </button>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
    >
      <Truck className="w-3.5 h-3.5 shrink-0" />
      <span>Track Shipment</span>
      <ExternalLink className="w-3 h-3 opacity-70" />
    </a>
  );
};
