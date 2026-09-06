import React from 'react';
import { CheckCircle2, Circle, Clock, MapPin, Truck, Package, Home, ArrowRight } from 'lucide-react';

export interface TrackingStep {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TRACKING_MILESTONES: TrackingStep[] = [
  { key: 'CONFIRMED', label: 'Order Confirmed', description: 'Payment verified & order acknowledged', icon: CheckCircle2 },
  { key: 'PACKED', label: 'Packed', description: 'Item securely packed at fulfillment facility', icon: Package },
  { key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled', description: 'Delhivery courier agent assigned', icon: Clock },
  { key: 'PICKED_UP', label: 'Picked Up', description: 'Handed over to Delhivery logistics team', icon: Truck },
  { key: 'IN_TRANSIT', label: 'In Transit', description: 'En route through Delhivery express hub', icon: Truck },
  { key: 'REACHED_HUB', label: 'Reached Hub', description: 'Arrived at local destination sorting facility', icon: MapPin },
  { key: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', description: 'Out with delivery agent for doorstep drop', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', description: 'Successfully delivered to customer', icon: Home }
];

interface TrackingTimelineProps {
  currentStatus?: string;
  trackingHistory?: Array<{ date?: string; status?: string; location?: string; remark?: string }>;
  awbNumber?: string;
  expectedDelivery?: string;
  className?: string;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  currentStatus = 'CONFIRMED',
  trackingHistory = [],
  awbNumber,
  expectedDelivery,
  className = ''
}) => {
  // Normalize current status index
  const normalizedStatus = String(currentStatus || 'CONFIRMED').toUpperCase();

  let activeIndex = 0;
  if (normalizedStatus.includes('DELIVERED')) activeIndex = 7;
  else if (normalizedStatus.includes('OUT_FOR_DELIVERY') || normalizedStatus.includes('OUT FOR DELIVERY')) activeIndex = 6;
  else if (normalizedStatus.includes('REACHED') || normalizedStatus.includes('HUB')) activeIndex = 5;
  else if (normalizedStatus.includes('IN_TRANSIT') || normalizedStatus.includes('TRANSIT')) activeIndex = 4;
  else if (normalizedStatus.includes('PICKED_UP') || normalizedStatus.includes('PICKED')) activeIndex = 3;
  else if (normalizedStatus.includes('PICKUP') || normalizedStatus.includes('SCHEDULED')) activeIndex = 2;
  else if (normalizedStatus.includes('PACKED') || normalizedStatus.includes('PROCESSING')) activeIndex = 1;
  else activeIndex = 0;

  return (
    <div className={`bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm ${className}`}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">Live Shipment Tracking</span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">Delhivery Courier Timeline</h3>
        </div>
        {awbNumber && (
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">AWB:</span>
            <span className="font-mono font-bold text-slate-800">{awbNumber}</span>
          </div>
        )}
      </div>

      {expectedDelivery && (
        <div className="mb-6 bg-indigo-50/70 border border-indigo-100/80 rounded-xl p-3.5 flex items-center gap-3 text-xs text-indigo-900">
          <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <span className="font-semibold">Estimated Delivery Date: </span>
            <span>{expectedDelivery}</span>
          </div>
        </div>
      )}

      {/* Progress Steps Visualizer */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {TRACKING_MILESTONES.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="relative group">
              {/* Step Circle Indicator */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110 z-10'
                    : isDone
                    ? 'bg-emerald-500 text-white z-10'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Circle className="w-2.5 h-2.5" />
                )}
              </div>

              {/* Step Text Details */}
              <div className="pl-2">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </h4>
                  {isCurrent && (
                    <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${isDone ? 'text-slate-600' : 'text-slate-400'}`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Tracking Logs History */}
      {trackingHistory && trackingHistory.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Courier Scan History</h4>
          <div className="space-y-2.5 text-xs">
            {trackingHistory.map((scan, i) => (
              <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-800">{scan.status || scan.remark}</div>
                  {scan.location && <div className="text-slate-500 text-[11px] mt-0.5">Location: {scan.location}</div>}
                </div>
                {scan.date && (
                  <div className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(scan.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
