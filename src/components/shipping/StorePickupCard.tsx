import React from 'react';
import { Store, MapPin, Clock, Phone, ShieldCheck, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';
import { OrderStatus } from '../../types';

interface StorePickupCardProps {
  orderNumber: string;
  orderStatus?: OrderStatus | string;
  paymentStatus?: string;
  storeName?: string;
  storeAddress?: string;
  storeCity?: string;
  storeTimings?: string;
  storePhone?: string;
  pickupToken?: string;
  className?: string;
}

export const StorePickupCard: React.FC<StorePickupCardProps> = ({
  orderNumber,
  orderStatus = 'PENDING',
  paymentStatus = 'PAID',
  storeName = 'NEXRA 3D Experience & Pickup Hub',
  storeAddress = 'Plot no 484, TNGOs Colony, Gachibowli',
  storeCity = 'Hyderabad, Telangana - 500046',
  storeTimings = 'Mon – Sat: 10:00 AM – 8:00 PM (Closed on Sundays)',
  storePhone = '+91 98765 43210',
  pickupToken,
  className = ''
}) => {
  const normStatus = String(orderStatus).toUpperCase();
  const isCancelled = normStatus === 'CANCELLED';
  const isReady = normStatus === 'SHIPPED' || normStatus === 'OUT_FOR_DELIVERY' || normStatus === 'READY_FOR_PICKUP';
  const isCompleted = normStatus === 'DELIVERED' || normStatus === 'COMPLETED' || normStatus === 'PICKED_UP';
  const isProcessing = normStatus === 'PROCESSING' || normStatus === 'PACKED';

  const getStatusBadge = () => {
    if (isCancelled) {
      return (
        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-extrabold text-[11px] px-3 py-1 rounded-full border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5" /> Order Cancelled
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-3 py-1 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Collected & Completed
        </span>
      );
    }
    if (isReady) {
      return (
        <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 font-extrabold text-[11px] px-3 py-1 rounded-full border border-indigo-200 animate-pulse">
          <Store className="w-3.5 h-3.5 text-indigo-600" /> Ready for Store Pickup
        </span>
      );
    }
    if (isProcessing) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-extrabold text-[11px] px-3 py-1 rounded-full border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" /> Preparing at Facility
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 font-extrabold text-[11px] px-3 py-1 rounded-full border border-blue-200">
        <Clock className="w-3.5 h-3.5 text-blue-600" /> Order Acknowledged
      </span>
    );
  };

  return (
    <div className={`bg-gradient-to-br from-white to-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${className}`}>
      {/* Header with Store Hub Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-slate-900">{storeName}</h4>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                Direct Pickup
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block">Self-collection at NEXRA Experience Facility</span>
          </div>
        </div>

        <div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Pickup Address & Verification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Location Box */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 space-y-2">
          <div className="flex items-center gap-1.5 text-indigo-600 font-bold uppercase text-[10px] tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Store Pickup Address</span>
          </div>
          <div className="text-slate-800 font-semibold text-xs leading-relaxed">
            <div>{storeAddress}</div>
            <div>{storeCity}</div>
            <div className="text-slate-500 text-[11px] mt-0.5">Landmark: Near Financial District & ORR Junction</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <a
              href="https://maps.google.com/?q=Gachibowli+Hyderabad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-1"
            >
              <Navigation className="w-3 h-3" /> Get Map Directions
            </a>
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" /> {storePhone}
            </span>
          </div>
        </div>

        {/* Store Timings & Pickup Instructions */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 space-y-2.5">
          <div>
            <div className="flex items-center gap-1.5 text-slate-600 font-bold uppercase text-[10px] tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Store Operating Hours</span>
            </div>
            <p className="text-xs font-semibold text-slate-800">{storeTimings}</p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Pickup Order Ref #</span>
              <span className="font-mono font-extrabold text-slate-900 text-xs">{pickupToken || orderNumber}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal flex items-start gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Present this Order ID or your registered mobile number at the store counter upon arrival.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
