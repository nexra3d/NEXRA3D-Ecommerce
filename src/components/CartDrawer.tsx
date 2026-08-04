import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Tag, ArrowRight, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';
import { CartItem, Coupon } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  onApplyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  onRemoveCoupon: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  appliedCoupon,
  discountAmount,
  onApplyCoupon,
  onRemoveCoupon,
  onProceedToCheckout
}) => {
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );

  const tax = Math.round(subtotal * 0.18); // 18% GST standard
  const shippingFee = subtotal > 999 || cartItems.length === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal + tax + shippingFee - discountAmount);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplying(true);
    setCouponMsg(null);

    const res = await onApplyCoupon(couponCodeInput.trim());
    setIsApplying(false);
    if (res.success) {
      setCouponMsg({ type: 'success', text: res.message });
      setCouponCodeInput('');
    } else {
      setCouponMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Your Shopping Cart</h2>
              <span className="text-xs text-slate-500 font-medium">
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} Selected
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const itemPrice = item.product.salePrice || item.product.price;
              return (
                <div
                  key={item.productId}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex gap-3 items-center"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">{item.product.brand}</span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.title}</h4>
                    <span className="text-xs font-black text-slate-900 block">
                      ₹{Number(itemPrice || 0).toLocaleString('en-IN')}
                    </span>

                    <div className="flex items-center justify-between pt-1">
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => onRemoveItem(item.productId)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Cart is Empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Browse our catalog and add your favorite items to your cart.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Coupon Section */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-4">
            {/* Coupon Promo Box */}
            <div className="space-y-2">
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>
                      Coupon <strong>{appliedCoupon.code}</strong> Applied (-₹{discountAmount})
                    </span>
                  </div>
                  <button
                    onClick={onRemoveCoupon}
                    className="text-rose-600 hover:underline text-[11px] font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo coupon code"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 uppercase font-mono font-bold focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      {isApplying ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponMsg && (
                    <p
                      className={`text-[11px] font-semibold ${
                        couponMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {couponMsg.text}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Subtotal Calculation Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/80 pt-3">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-800">₹{Number(subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST Tax (18%)</span>
                <span className="font-bold text-slate-800">₹{Number(tax || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-800">
                  {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{Number(discountAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-indigo-600">₹{Number(grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Proceed CTA */}
            <button
              onClick={() => {
                onProceedToCheckout();
                onClose();
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-200 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
