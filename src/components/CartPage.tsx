import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Check,
  Tag,
  ShieldCheck,
  RefreshCw,
  Info,
  Truck,
  Store,
  MapPin
} from 'lucide-react';
import { User } from '../types';

interface CartItemData {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  unitMrp: number;
  lineTotal: number;
  availableStock: number;
  isAvailable: boolean;
  isStockSufficient: boolean;
  stockIssue: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    mrp: number;
    imageUrl: string;
    isActive: boolean;
    category?: { id: string; name: string; slug: string } | null;
    taxPercentage?: number;
  };
  variant?: {
    id: string;
    sku: string;
    name: string;
    price: number;
    mrp: number;
    stockQuantity: number;
    attributes: any;
    isActive: boolean;
  } | null;
}

interface CartResponse {
  id: string;
  userId: string;
  items: CartItemData[];
  totalItems: number;
  subtotal: number;
  tax?: number;
  shippingFee?: number;
  totalAmount: number;
}

interface CartPageProps {
  currentUser: User | null;
  cartData: CartResponse | null;
  isLoading: boolean;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onClearCart: () => Promise<void>;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  onProceedToCheckout?: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  currentUser,
  cartData,
  isLoading,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateHome,
  onNavigateLogin,
  onProceedToCheckout
}) => {
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'nimbuspost' | 'standard' | 'pickup'>('nimbuspost');

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xl space-y-6">
          <div className="w-20 h-20 bg-cyan-50 text-cyan-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-cyan-100">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Sign in to View Your Cart</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Please log in to access your saved shopping cart, check out available items, and place your order.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={onNavigateLogin}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm px-7 py-3.5 rounded-2xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer transform hover:-translate-y-0.5"
            >
              Sign In to Account
            </button>
            <button
              onClick={onNavigateHome}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm px-6 py-3.5 rounded-2xl transition-all cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = cartData?.items || [];
  const hasOutofStockItems = items.some((item) => !item.isStockSufficient);
  const subtotal = cartData?.subtotal || 0;
  const tax = cartData?.tax ?? Math.round(
    items.reduce((total, item) => {
      return (
        total +
        ((item.product?.price || 0) * item.quantity * (item.product?.taxPercentage ?? 0)) / 100
      );
    }, 0)
  );
  const baseShippingFee = cartData?.shippingFee ?? (subtotal > 999 || items.length === 0 ? 0 : 99);
  const shippingFee = shippingMethod === 'pickup' ? 0 : baseShippingFee;
  const grandTotal = subtotal + tax + shippingFee;

  const handleQtyChange = async (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemove(itemId);
      return;
    }
    setErrorMsg(null);
    setUpdatingItemId(itemId);
    try {
      await onUpdateQuantity(itemId, newQty);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update item quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setErrorMsg(null);
    setUpdatingItemId(itemId);
    try {
      await onRemoveItem(itemId);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to remove item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear your entire cart?')) return;
    setErrorMsg(null);
    setIsClearing(true);
    try {
      await onClearCart();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to clear cart');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800 mb-2 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <span>Shopping Cart</span>
            <span className="text-xs bg-cyan-100 text-cyan-800 border border-cyan-200 px-3 py-1 rounded-full font-black">
              {cartData?.totalItems || 0} {cartData?.totalItems === 1 ? 'Item' : 'Items'}
            </span>
          </h1>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClear}
            disabled={isClearing}
            className="inline-flex items-center space-x-2 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto border border-rose-200"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isClearing ? 'Clearing...' : 'Clear Cart'}</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading your shopping cart...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto my-8 space-y-6">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Your Cart is Currently Empty</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our fresh collection and find great deals!
            </p>
          </div>
          <button
            onClick={onNavigateHome}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm px-7 py-3.5 rounded-2xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer inline-flex items-center space-x-2"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {hasOutofStockItems && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-start space-x-3 text-xs font-semibold">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">Action Required: Stock issues detected</p>
                  <p className="text-amber-700 mt-0.5">
                    Some items in your cart exceed available inventory or are currently unavailable. Please adjust quantities or remove out-of-stock items before proceeding to checkout.
                  </p>
                </div>
              </div>
            )}

            {items.map((item) => {
              const isUpdating = updatingItemId === item.id;
              const hasVariant = Boolean(item.variant);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all ${
                    !item.isStockSufficient
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-slate-200/90 shadow-xs hover:border-cyan-500/60 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Product Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-slate-200 overflow-hidden shrink-0 bg-slate-50 relative p-1">
                      <img
                        src={item.product.imageUrl || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                      {!item.isStockSufficient && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-1 text-center">
                          <span className="text-[9px] font-black text-white uppercase bg-rose-600 px-1.5 py-0.5 rounded">
                            {item.availableStock <= 0 ? 'Out of Stock' : 'Stock Limit'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product & Variant Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {item.product.category && (
                        <span className="text-[10px] font-black text-cyan-700 uppercase tracking-wider">
                          {item.product.category.name}
                        </span>
                      )}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {item.product.name}
                      </h3>

                      {hasVariant && item.variant && (
                        <div className="inline-flex items-center space-x-1.5 bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                          <span className="text-slate-400">Variant:</span>
                          <span className="font-bold">{item.variant.name}</span>
                          <span className="text-slate-400">({item.variant.sku})</span>
                        </div>
                      )}

                      {/* Lamp Option Attributes */}
                      {((item as any).selectedColour || (item as any).selectedWattage || (item.variant as any)?.colour || (item.variant as any)?.wattage) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {((item as any).selectedColour || (item.variant as any)?.colour) && (
                            <span className="bg-cyan-50 text-cyan-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-cyan-100 flex items-center gap-1">
                              <span>Colour:</span>
                              <span className="text-cyan-950">{(item as any).selectedColour || (item.variant as any)?.colour}</span>
                            </span>
                          )}
                          {((item as any).selectedWattage || (item.variant as any)?.wattage) && (
                            <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-amber-100 flex items-center gap-1">
                              <span>Wattage:</span>
                              <span className="text-amber-950">{(item as any).selectedWattage || (item.variant as any)?.wattage}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stock Alert Badge */}
                      {item.stockIssue && (
                        <p className="text-xs font-bold text-amber-600 flex items-center gap-1 pt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.stockIssue}</span>
                        </p>
                      )}

                      {/* Pricing */}
                      <div className="flex items-baseline space-x-2 pt-1">
                        <span className="text-base font-black text-slate-900">
                          ₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}
                        </span>
                        {item.unitMrp > item.unitPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{Number(item.unitMrp || 0).toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-500">
                          × {item.quantity} = <strong className="text-cyan-700 font-black">₹{Number(item.lineTotal || 0).toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="flex sm:flex-col items-center justify-between sm:items-end w-full sm:w-auto gap-3 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                        <button
                          onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                          disabled={isUpdating}
                          className="px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-3 py-1.5 text-xs font-black text-slate-900 bg-white min-w-[2.5rem] text-center">
                          {isUpdating ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                          disabled={isUpdating || item.quantity >= item.availableStock}
                          className="px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-30"
                          title={item.quantity >= item.availableStock ? 'Max stock reached' : 'Increase quantity'}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isUpdating}
                        className="text-xs font-bold text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer inline-flex items-center space-x-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Summary Sidebar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartData?.totalItems || 0} items)</span>
                <span className="font-bold text-slate-900">₹{Number(subtotal || 0).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated GST Tax</span>
                <span className="font-bold text-slate-900">₹{Number(tax || 0).toLocaleString('en-IN')}</span>
              </div>

              {/* Shipping Method Note */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Truck className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  Shipping Options
                </span>
                <span className="text-[10px] text-cyan-700 font-bold bg-cyan-100/60 px-2 py-0.5 rounded-md">
                  Calculated at Checkout
                </span>
              </div>

              <div className="pt-2 flex justify-between items-baseline border-t border-slate-100">
                <span className="text-sm font-black text-slate-900">Estimated Total</span>
                <span className="text-xl font-black text-cyan-700">
                  ₹{Number((subtotal + tax) || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => onProceedToCheckout && onProceedToCheckout()}
              disabled={hasOutofStockItems || items.length === 0}
              className={`w-full font-black text-sm py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer ${
                hasOutofStockItems || items.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5'
              }`}
            >
              <span>Continue to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Verified Price & Stock Guard</span>
              </div>
              <p>Prices and inventory availability are verified live directly against database records.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
