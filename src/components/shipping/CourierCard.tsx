import React from 'react';
import { Truck, ExternalLink, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';

interface CourierCardProps {
  provider?: string;
  awbNumber?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;
  manifestUrl?: string;
  estimatedDelivery?: string;
  shipmentStatus?: string;
  pickupRequested?: boolean;
  onTrackClick?: () => void;
  className?: string;
}

export const CourierCard: React.FC<CourierCardProps> = ({
  provider = 'Delhivery',
  awbNumber,
  trackingNumber,
  trackingUrl,
  labelUrl,
  manifestUrl,
  estimatedDelivery,
  shipmentStatus = 'CREATED',
  pickupRequested = false,
  onTrackClick,
  className = ''
}) => {
  const displayAwb = awbNumber || trackingNumber || 'Awaiting Generation';
  const displayUrl = trackingUrl || (awbNumber ? `https://track.delhivery.com/track/package/${awbNumber}` : '#');

  return (
    <div className={`bg-gradient-to-br from-white to-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm font-black text-xs">
            DLHV
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{provider} Express Logistics</h4>
            <span className="text-[11px] text-slate-500 block">Delhivery Surface & Air Courier</span>
          </div>
        </div>
        <ShipmentStatusBadge status={shipmentStatus} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Waybill / AWB No.</span>
          <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{displayAwb}</span>
        </div>

        {estimatedDelivery && (
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Estimated Delivery</span>
            <span className="font-semibold text-slate-800 text-xs mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              {estimatedDelivery}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        {pickupRequested ? (
          <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" /> Pickup Requested
          </span>
        ) : (
          <span className="text-slate-500 text-[11px] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Pickup Hub: Hyderabad
          </span>
        )}

        <div className="flex items-center gap-2">
          {onTrackClick ? (
            <button
              type="button"
              onClick={onTrackClick}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs transition-colors flex items-center gap-1 shadow-sm"
            >
              Track Live
            </button>
          ) : (
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs transition-colors flex items-center gap-1 shadow-sm"
            >
              Track on Delhivery <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
