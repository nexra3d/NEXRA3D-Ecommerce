import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Plus,
  Lock,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { Address, CartItem, Coupon, Order, PaymentMethod } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  savedAddresses: Address[];
  appliedCoupon: Coupon | null;
  discountAmount: number;
  onAddNewAddress: (address: Partial<Address>) => Promise<Address>;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  savedAddresses,
  appliedCoupon,
  discountAmount,
  onAddNewAddress,
  onOrderCompleted
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'address' | 'payment' | 'razorpay_modal' | 'success'>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.find((a) => a.isDefault)?.id || savedAddresses[0]?.id || ''
  );

  const [showAddAddressForm, setShowAddAddressForm] = useState(savedAddresses.length === 0);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('RAZORPAY');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.18);
  const shippingFee = subtotal > 999 || cartItems.length === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal + tax + shippingFee - discountAmount);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newStreet || !newCity || !newPostalCode) return;
    const created = await onAddNewAddress({
      fullName: newFullName,
      phone: newPhone || '+91 98765 43210',
      streetAddress: newStreet,
      city: newCity,
      state: newState || 'Karnataka',
      postalCode: newPostalCode,
      country: 'India',
      type: 'HOME'
    });
    setSelectedAddressId(created.id);
    setShowAddAddressForm(false);
  };

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [razorpayOrderDetails, setRazorpayOrderDetails] = useState<any | null>(null);

  const handleExecuteCheckout = async () => {
    setCheckoutError(null);
    const chosenAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];
    if (!chosenAddress) {
      setCheckoutError('Please select or add a shipping address.');
      return;
    }

    setIsProcessingOrder(true);

    try {
      const payload = {
        userId: chosenAddress.userId,
        customerName: chosenAddress.fullName,
        customerEmail: 'customer@example.com',
        customerPhone: chosenAddress.phone,
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.selectedVariant,
          quantity: item.quantity
        })),
        shippingAddress: chosenAddress,
        couponCode: appliedCoupon?.code,
        paymentMethod
      };

      const res = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate order checkout');
      }

      setIsProcessingOrder(false);

      if (paymentMethod === 'COD') {
        setCreatedOrder(data.order);
        onOrderCompleted(data.order);
        setStep('success');
      } else {
        setRazorpayOrderDetails(data);
        setStep('razorpay_modal');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message || 'An error occurred during checkout');
      setIsProcessingOrder(false);
    }
  };

  const handleSimulateRazorpaySuccess = async () => {
    if (!razorpayOrderDetails) return;
    setIsProcessingOrder(true);
    setCheckoutError(null);

    const rzpPayId = `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const rzpOrderId = razorpayOrderDetails.razorpayOrderId;
    const mockSignature = `sig_${Math.random().toString(36).substring(2, 12)}`;

    try {
      const res = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: razorpayOrderDetails.orderId,
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: rzpPayId,
          razorpay_signature: mockSignature
        })
      });

      const data = await res.json();
      setIsProcessingOrder(false);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment signature verification failed');
      }

      setCreatedOrder(data.order);
      onOrderCompleted(data.order);
      setStep('success');
    } catch (err: any) {
      console.error('Payment Verification Error:', err);
      setCheckoutError(err.message || 'Payment verification failed');
      setIsProcessingOrder(false);
    }
  };

  const handleSimulateRazorpayFailure = async (reason: string) => {
    if (!razorpayOrderDetails) return;
    setIsProcessingOrder(true);

    try {
      await fetch('/api/payments/razorpay/fail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: razorpayOrderDetails.orderId,
          razorpay_order_id: razorpayOrderDetails.razorpayOrderId,
          failureReason: reason
        })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingOrder(false);
      setStep('payment');
      setCheckoutError(`Payment failed: ${reason}. You can retry payment.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-extrabold">256-Bit Encrypted Secure Checkout</h2>
              <p className="text-xs text-slate-400">Order Total: ₹{grandTotal.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {checkoutError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs font-medium flex items-center justify-between">
              <span>{checkoutError}</span>
              <button onClick={() => setCheckoutError(null)} className="text-red-600 font-bold hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Progress Indicator */}
          {step !== 'success' && (
            <div className="flex items-center justify-center space-x-4 text-xs font-bold border-b border-slate-200 pb-4">
              <span className={`flex items-center gap-1 ${step === 'address' ? 'text-indigo-600' : 'text-slate-400'}`}>
                1. Delivery Address
              </span>
              <span className="text-slate-300">/</span>
              <span className={`flex items-center gap-1 ${step === 'payment' || step === 'razorpay_modal' ? 'text-indigo-600' : 'text-slate-400'}`}>
                2. Payment Gateway
              </span>
            </div>
          )}

          {/* STEP 1: ADDRESS SELECTION */}
          {step === 'address' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Select Delivery Address</span>
                </h3>

                <button
                  onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                  className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Saved Addresses Cards */}
              <div className="grid grid-cols-1 gap-3">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                      selectedAddressId === addr.id
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selected_address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 text-xs space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                          {addr.type}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        {addr.streetAddress}, {addr.apartment && `${addr.apartment}, `}
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <span className="text-slate-500 font-medium block">Ph: {addr.phone}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Add New Address Inline Form */}
              {showAddAddressForm && (
                <form onSubmit={handleSaveAddress} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Add New Shipping Address</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Mobile Phone Number"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Street Address, House/Flat No."
                    required
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="PIN Code"
                      required
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Save Address & Continue
                  </button>
                </form>
              )}

              <button
                disabled={!selectedAddressId}
                onClick={() => setStep('payment')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD CHOICE */}
          {step === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-sm font-extrabold text-slate-900">Select Payment Method</h3>

              <div className="space-y-3">
                {/* Razorpay Online Option */}
                <label
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                        RZP
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm block">
                          Razorpay Online Payment (UPI, Cards, NetBanking)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Instant verification & 100% money back guarantee
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    RECOMMENDED
                  </span>
                </label>

                {/* Cash on Delivery Option */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'COD'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-6 h-6 text-slate-700" />
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">Cash on Delivery (COD)</span>
                        <span className="text-[11px] text-slate-500">Pay cash upon parcel arrival</span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('address')}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-2xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleExecuteCheckout}
                  disabled={isProcessingOrder}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {paymentMethod === 'RAZORPAY' ? 'Launch Razorpay Gateway' : 'Confirm Order (COD)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RAZORPAY SIMULATION POPUP */}
          {step === 'razorpay_modal' && (
            <div className="space-y-6 text-center py-4">
              <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg space-y-3">
                <div className="w-12 h-12 bg-white text-blue-600 font-black rounded-xl flex items-center justify-center text-lg mx-auto shadow-md">
                  RZP
                </div>
                <h3 className="text-xl font-extrabold">Razorpay Payment Gateway</h3>
                <p className="text-blue-100 text-xs">
                  Simulated Razorpay Modal • Order Amount: <strong>₹{grandTotal.toLocaleString('en-IN')}</strong>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Merchant:</span>
                  <span className="font-bold text-slate-800">BrandStore E-Commerce</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Key ID:</span>
                  <span className="font-mono text-slate-800 font-bold">rzp_test_sample_key</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supported Methods:</span>
                  <span className="text-slate-800 font-medium">Google Pay, PhonePe, Cards, NetBanking</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleSimulateRazorpaySuccess}
                  disabled={isProcessingOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isProcessingOrder ? (
                    <span>Verifying Signature & Creating Order...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Simulate Successful Razorpay Payment</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleSimulateRazorpayFailure('Payment declined by issuing bank')}
                  disabled={isProcessingOrder}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Simulate Payment Failure
                </button>

                <button
                  onClick={() => handleSimulateRazorpayFailure('Payment cancelled by user')}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold block mx-auto"
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT */}
          {step === 'success' && createdOrder && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Order Number: <strong className="text-indigo-600 font-mono">{createdOrder.orderNumber}</strong>
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Delivery:</span>
                  <span className="font-bold text-emerald-600">{createdOrder.estimatedDeliveryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Courier Partner:</span>
                  <span className="font-bold text-slate-800">{createdOrder.courierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tracking Number:</span>
                  <span className="font-mono font-bold text-slate-800">{createdOrder.trackingNumber}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-sm py-3.5 rounded-2xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
