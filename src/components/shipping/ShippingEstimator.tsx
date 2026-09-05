import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle2, AlertCircle, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface ShippingEstimatorProps {
  initialPincode?: string;
  orderValue?: number;
  weightGrams?: number;
  onEstimateUpdated?: (estimate: { shippingCharge: number; serviceable: boolean; estimatedDays: number }) => void;
  className?: string;
}

export const ShippingEstimator: React.FC<ShippingEstimatorProps> = ({
  initialPincode = '',
  orderValue = 0,
  weightGrams = 500,
  onEstimateUpdated,
  className = ''
}) => {
  const [pincode, setPincode] = useState(initialPincode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceability, setServiceability] = useState<any | null>(null);
  const [shippingEstimate, setShippingEstimate] = useState<any | null>(null);

  useEffect(() => {
    if (initialPincode && initialPincode.replace(/\D/g, '').length === 6) {
      setPincode(initialPincode);
      handleCheckPincode(initialPincode);
    }
  }, [initialPincode, orderValue]);

  const handleCheckPincode = async (pinToCheck?: string) => {
    const targetPin = (pinToCheck || pincode).replace(/\D/g, '').trim();
    if (targetPin.length !== 6) {
      setError('Please enter a valid 6-digit Indian postal code');
      setServiceability(null);
      setShippingEstimate(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Check pincode serviceability with Delhivery
      const serviceRes = await apiFetch(`/api/shipping/pincode/${targetPin}`);
      const serviceData = await serviceRes.json();

      if (!serviceRes.ok || !serviceData.serviceable) {
        const errorMsg = serviceData.error || serviceData.remarks || 'Pincode not serviceable by Delhivery';
        setServiceability({ serviceable: false, remarks: errorMsg });
        if (serviceData.error) {
          setError(serviceData.error);
        }
        setShippingEstimate(null);
        if (onEstimateUpdated) {
          onEstimateUpdated({ shippingCharge: 0, serviceable: false, estimatedDays: 0 });
        }
        setLoading(false);
        return;
      }

      setServiceability(serviceData);

      // 2. Fetch shipping rate & delivery estimate
      const estimateRes = await apiFetch('/api/shipping/estimate', {
        method: 'POST',
        body: JSON.stringify({
          destinationPincode: targetPin,
          weight: weightGrams,
          orderValue
        })
      });

      const estimateData = await estimateRes.json();
      if (estimateRes.ok) {
        setShippingEstimate(estimateData);
        if (onEstimateUpdated) {
          onEstimateUpdated({
            shippingCharge: estimateData.shippingCharge ?? 0,
            serviceable: true,
            estimatedDays: estimateData.estimatedDays || 3
          });
        }
      }
    } catch (err: any) {
      console.error('Shipping estimation error:', err);
      setError('Could not verify pincode serviceability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-indigo-600" />
          <h4 className="text-sm font-semibold text-slate-800">Delhivery Shipping & Pincode Check</h4>
        </div>
        <span className="text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100/80">
          Express Air & Surface
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit Pincode"
            maxLength={6}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400 font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCheckPincode();
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => handleCheckPincode()}
          disabled={loading || pincode.length !== 6}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {serviceability && serviceability.serviceable && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2 text-xs">
          <div className="flex items-center justify-between text-emerald-700 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Delivery available {serviceability.city ? `to ${serviceability.city}, ${serviceability.state}` : ''}
            </span>
            <span className="text-[11px] bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md">
              Serviced
            </span>
          </div>

          {shippingEstimate && (
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 bg-white p-3 rounded-xl border border-slate-200/60">
              <div>
                <span className="text-slate-500 text-[11px] block">Estimated Delivery</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  {shippingEstimate.estimatedDeliveryDate || `${shippingEstimate.estimatedDays} Business Days`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[11px] block">Shipping Charge</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {shippingEstimate.isFreeShipping ? (
                    <span className="text-emerald-600 uppercase text-xs">FREE SHIPPING</span>
                  ) : (
                    `₹${shippingEstimate.shippingCharge}`
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {serviceability && !serviceability.serviceable && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200/60">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Pincode {pincode} is currently unserviceable by courier partners.</span>
        </div>
      )}
    </div>
  );
};
