import React from 'react';
import { X, Package, Truck, CheckCircle2, Clock, MapPin, Printer, ExternalLink, ShieldCheck } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const STATUS_STAGES: { status: OrderStatus; label: string }[] = [
    { status: 'PENDING', label: 'Order Placed' },
    { status: 'PROCESSING', label: 'Packed' },
    { status: 'SHIPPED', label: 'In Transit' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { status: 'DELIVERED', label: 'Delivered' }
  ];

  const getCurrentStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const activeStatus = order.orderStatus || order.status || 'PENDING';
  const currentStageIdx = getCurrentStageIndex(activeStatus);

  const activeShipments = order.shipments && order.shipments.length > 0
    ? order.shipments
    : (order.shipment ? [order.shipment] : []);

  const courierPartner = activeShipments[0]?.courier || activeShipments[0]?.provider || order.shipment?.courier || order.shipment?.provider || order.courierName || 'Awaiting Dispatch';
  const awbTrackingNumber = activeShipments[0]?.awbNumber || activeShipments[0]?.trackingNumber || order.shipment?.awbNumber || order.shipment?.trackingNumber || order.trackingNumber || 'Awaiting Dispatch';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <span>Order Tracking</span>
                <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-amber-400">
                  {order.orderNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[80vh]">
          {/* Visual Step Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Delivery Status</h3>

            <div className="relative flex items-center justify-between">
              {/* Connector Bar */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 z-0 transition-all duration-500"
                style={{ width: `${(currentStageIdx / (STATUS_STAGES.length - 1)) * 100}%` }}
              />

              {STATUS_STAGES.map((stage, idx) => {
                const isCompleted = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                return (
                  <div key={stage.status} className="relative z-10 flex flex-col items-center group">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-200 text-slate-500'
                      } ${isCurrent ? 'ring-4 ring-indigo-200 scale-110' : ''}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-2 text-center max-w-[70px] ${
                        isCurrent ? 'text-indigo-600 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier & AWB & Payment Details Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Invoice Number</span>
              <strong className="text-slate-900 font-mono font-bold text-sm block mt-0.5">
                {order.invoiceNumber || `INV-${order.orderNumber}`}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Payment Status</span>
              <span className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded mt-0.5 ${
                order.paymentStatus === 'CAPTURED' || order.paymentStatus === 'SUCCESS'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.paymentStatus === 'FAILED'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Courier Partner</span>
              <strong className="text-slate-800 font-semibold text-xs block mt-0.5">
                {courierPartner}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">AWB / Tracking Number</span>
              <strong className="text-indigo-600 font-mono text-xs block mt-0.5 truncate" title={awbTrackingNumber}>
                {awbTrackingNumber}
              </strong>
            </div>
          </div>

          {/* Active Shipments Detail Block */}
          {activeShipments.length > 0 && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Shipment Package ({activeShipments.length})</span>
              </h3>
              {activeShipments.map((shp) => (
                <div key={shp.id} className="bg-white p-3.5 rounded-xl border border-indigo-100 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{shp.shipmentNumber}</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[10px]">
                        {shp.provider} ({shp.serviceType || 'Standard'})
                      </span>
                    </div>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-[11px]">
                      {shp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block">AWB Number</span>
                      <span className="font-mono font-semibold text-slate-800">{shp.awbNumber || 'Pending'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Est. Delivery</span>
                      <span className="font-semibold text-slate-800">{shp.estimatedDeliveryDate || '3-5 Days'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Shipping Cost</span>
                      <span className="font-semibold text-slate-800">₹{Number(shp.shippingCost || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {shp.statusHistory && shp.statusHistory.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Latest Milestone</span>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{shp.statusHistory[shp.statusHistory.length - 1].description}</span>
                        <span className="text-[10px] text-slate-400">{shp.statusHistory[shp.statusHistory.length - 1].timestamp}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {order.paymentFailureReason && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs space-y-1">
              <span className="font-extrabold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Payment Failed: {order.paymentFailureReason}</span>
              </span>
              <p className="text-rose-600 text-[11px]">
                Your items remain in your pending order. You can safely retry payment below.
              </p>
            </div>
          )}

          {/* Timeline Tracking Events Stream */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Logistics Milestones</h3>
            <div className="space-y-3 border-l-2 border-slate-200 pl-4 ml-2">
              {(order.trackingEvents || []).map((evt, idx) => (
                <div key={idx} className="relative space-y-0.5">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">{evt.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600">{evt.description}</p>
                  {evt.location && <span className="text-[10px] text-slate-400 font-medium">📍 {evt.location}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Order Summary */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Itemized Bill</h3>
            <div className="space-y-2">
              {(order.items || []).map((item) => {
                const itemImg = item.productImage || (item as any).imageUrl || (item as any).product?.imageUrl || '';
                const itemTitle = item.productTitle || (item as any).product?.name || (item as any).product?.title || 'Product';
                const itemPrice = Number(item.price || (item as any).product?.price || 0);
                const itemQty = Number(item.quantity || 1);
                const lineTotal = Number(item.totalPrice ?? (item as any).total ?? (item as any).subtotal ?? (itemPrice * itemQty));

                return (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                    <div className="flex items-center space-x-3">
                      {itemImg ? (
                        <img src={itemImg} alt={itemTitle} className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                          3D
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 block">{itemTitle}</span>
                        <span className="text-[11px] text-slate-500">Qty: {itemQty} × ₹{itemPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">₹{lineTotal.toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 pt-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (GST 18%)</span>
                <span>₹{Number(order.tax ?? (order as any).taxAmount ?? Math.round(Number(order.subtotal || 0) * 0.18)).toLocaleString('en-IN')}</span>
              </div>
              {Number(order.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-₹{Number(order.discountAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Paid</span>
                <span className="text-indigo-600">₹{Number(order.totalAmount ?? (order as any).total ?? 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
