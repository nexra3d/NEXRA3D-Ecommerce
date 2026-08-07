import React from 'react';
import { Truck, CheckCircle2, Clock, AlertTriangle, XCircle, Package } from 'lucide-react';

interface ShipmentStatusBadgeProps {
  status?: string;
  className?: string;
}

export const ShipmentStatusBadge: React.FC<ShipmentStatusBadgeProps> = ({ status = 'CREATED', className = '' }) => {
  const norm = String(status || 'CREATED').toUpperCase();

  let config = {
    label: 'Created',
    bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
    icon: Package
  };

  if (norm.includes('DELIVERED')) {
    config = {
      label: 'Delivered',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: CheckCircle2
    };
  } else if (norm.includes('OUT_FOR_DELIVERY') || norm.includes('OUT FOR DELIVERY')) {
    config = {
      label: 'Out For Delivery',
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      icon: Truck
    };
  } else if (norm.includes('IN_TRANSIT') || norm.includes('TRANSIT')) {
    config = {
      label: 'In Transit',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: Truck
    };
  } else if (norm.includes('PICKED_UP') || norm.includes('PICKUP')) {
    config = {
      label: 'Picked Up',
      bg: 'bg-sky-50 text-sky-700 border-sky-200/80',
      icon: Truck
    };
  } else if (norm.includes('CANCEL')) {
    config = {
      label: 'Cancelled',
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: XCircle
    };
  } else if (norm.includes('READY') || norm.includes('PACKED')) {
    config = {
      label: 'Packed & Ready',
      bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      icon: Package
    };
  }

  const IconComp = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}>
      <IconComp className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
