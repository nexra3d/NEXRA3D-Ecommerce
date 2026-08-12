import React, { useState, useEffect } from 'react';
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
  Smartphone,
  Truck,
  Loader2,
  AlertCircle,
  Info,
  Tag
} from 'lucide-react';
import { Address, CartItem, Coupon, Order, PaymentMethod, User } from '../types';
import { apiFetch, getStoredToken } from '../lib/api';
import { INDIAN_STATES, lookupPincode } from '../lib/pincode';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cartSummary?: {
    subtotal?: number;
    tax?: number;
    shippingFee?: number;
    totalAmount?: number;
  } | null;
  savedAddresses: Address[];
  appliedCoupon: Coupon | null;
  discountAmount: number;
  onApplyCoupon?: (code: string) => Promise<{ success: boolean; message: string }>;
  onRemoveCoupon?: () => void;
  onAddNewAddress: (address: Partial<Address>) => Promise<Address>;
  onOrderCompleted: (order: Order) => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems = [],
  cartSummary,
  savedAddresses = [],
  appliedCoupon,
  discountAmount = 0,
  onApplyCoupon,
  onRemoveCoupon,
  onAddNewAddress,
  onOrderCompleted,
  currentUser,
  onOpenAuth
}) => {
  const [liveAddresses, setLiveAddresses] = useState<Address[]>(savedAddresses || []);
  const addressList = Array.isArray(liveAddresses) && liveAddresses.length > 0
    ? liveAddresses
    : (Array.isArray(savedAddresses) ? savedAddresses : []);
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  // Promo Code State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    if (isOpen) {
      apiFetch('/api/coupons')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setAvailableCoupons(data.filter((c: any) => c.isActive));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const [step, setStep] = useState<'address' | 'payment' | 'razorpay_modal' | 'success'>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const [showAddAddressForm, setShowAddAddressForm] = useState(addressList.length === 0);
  const [newFullName, setNewFullName] = useState(currentUser?.name || '');
  const [newPhone, setNewPhone] = useState(currentUser?.phone || '');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');

  // Live Delhivery Shipping State
  const [shippingEstimate, setShippingEstimate] = useState<any | null>(null);
  const [shippingLoading, setShippingLoading] = useState<boolean>(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string>('delhivery-surface');
  const [deliveryDetailsExpanded, setDeliveryDetailsExpanded] = useState<boolean>(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('RAZORPAY');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [razorpayOrderDetails, setRazorpayOrderDetails] = useState<any | null>(null);

  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0) {
      setLiveAddresses(savedAddresses);
    }
  }, [savedAddresses]);

  useEffect(() => {
    if (isOpen) {
      const syncAddresses = async () => {
        try {
          const res = await apiFetch('/api/addresses');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setLiveAddresses(data);
              const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
              if (defaultAddr && (!selectedAddressId || !data.some((a: any) => a.id === selectedAddressId))) {
                setSelectedAddressId(defaultAddr.id);
              }
              setShowAddAddressForm(false);
              return;
            }
          }
        } catch (err) {
          console.error('Checkout address sync error:', err);
        }

        if (savedAddresses && savedAddresses.length > 0) {
          const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
          if (defaultAddr && !selectedAddressId) {
            setSelectedAddressId(defaultAddr.id);
          }
          setShowAddAddressForm(false);
        } else {
          setShowAddAddressForm(true);
        }
      };

      syncAddresses();

      if (currentUser) {
        setNewFullName(currentUser.name || '');
        setNewPhone(currentUser.phone || '');
        if (currentUser.addresses && currentUser.addresses.length > 0) {
          const defaultUserAddr = currentUser.addresses.find((a: any) => a.isDefault) || currentUser.addresses[0];
          setNewStreet(defaultUserAddr.streetAddress || defaultUserAddr.addressLine1 || '');
          setNewCity(defaultUserAddr.city || '');
          setNewState(defaultUserAddr.state || '');
          setNewPostalCode(defaultUserAddr.postalCode || '');
        } else {
          setNewStreet(currentUser.addressLine1 || '');
          setNewCity(currentUser.city || '');
          setNewState(currentUser.state || '');
          setNewPostalCode(currentUser.postalCode || '');
        }
      }
    }
  }, [isOpen]);

  // Active Pincode & Cart Weight
  const selectedAddress = addressList.find((a) => a.id === selectedAddressId);
  const activePincode = (selectedAddress?.postalCode || newPostalCode || '').replace(/\D/g, '').trim();
  const cartWeightGrams = safeCartItems.reduce((acc, item) => acc + (item.quantity * 250), 500);

  // Auto-Fetch Delhivery Shipping Estimate whenever pincode, address, or cart items change
  useEffect(() => {
    if (!isOpen) {
      setDeliveryDetailsExpanded(false);
      setShippingEstimate(null);
      setShippingError(null);
      setShippingLoading(false);
      return;
    }

    if (activePincode.length !== 6) {
      setDeliveryDetailsExpanded(false);
      setShippingEstimate(null);
      setShippingError(null);
      return;
    }

    let isMounted = true;
    const fetchShippingEstimate = async () => {
      setDeliveryDetailsExpanded(true);
      setShippingLoading(true);
      setShippingError(null);

      try {
        const res = await apiFetch('/api/shipping/estimate', {
          method: 'POST',
          body: JSON.stringify({
            destinationPincode: activePincode,
            orderValue: subtotal,
            paymentType: paymentMethod === 'COD' ? 'COD' : 'Pre-paid',
            items: safeCartItems.map((item) => ({
              productId: item.productId || item.product?.id,
              quantity: item.quantity,
              weight: item.product?.weight ? Number(item.product.weight) : undefined
            }))
          })
        });

        const data = await res.json();
        if (!isMounted) return;

        if (!res.ok) {
          setShippingEstimate(null);
          setShippingError(data.error || data.details || 'Shipping rate calculation failed.');
        } else if (!data.serviceable) {
          setShippingEstimate(null);
          const providerState = (data.providers && typeof data.providers === 'object') ? data.providers : null;
          const providerMessages = providerState
            ? Object.entries(providerState)
                .filter(([, value]: any[]) => value && !value.success && value.message)
                .map(([key, value]: any[]) => {
                  const errorType = value?.diagnostic?.errorType || value?.errorType || 'UPSTREAM_ERROR';
                  if (key === 'delhivery') {
                    if (errorType === 'CONFIG_ERROR') return 'Delhivery is not configured correctly.';
                    if (errorType === 'AUTH_ERROR') return 'Delhivery authentication failed.';
                    if (errorType === 'FORBIDDEN') return 'Delhivery is currently unavailable (access denied by courier service).';
                    if (errorType === 'WRONG_ENDPOINT') return 'Delhivery shipping endpoint is misconfigured.';
                    if (errorType === 'BAD_REQUEST') return 'Delhivery request is invalid.';
                    if (errorType === 'NETWORK_ERROR') return 'Delhivery shipping service is temporarily unavailable.';
                    return 'Delhivery is currently unavailable (courier service error).';
                  }
                  if (errorType === 'CONFIG_ERROR') return 'NimbusPost authentication is not configured.';
                  if (errorType === 'AUTH_ERROR') return 'NimbusPost authentication failed.';
                  if (errorType === 'FORBIDDEN') return 'NimbusPost access is denied by the courier service.';
                  if (errorType === 'WRONG_ENDPOINT') return 'NimbusPost endpoint is misconfigured.';
                  if (errorType === 'BAD_REQUEST') return 'NimbusPost request is invalid.';
                  if (errorType === 'NETWORK_ERROR') return 'NimbusPost shipping service is temporarily unavailable.';
                  return 'NimbusPost is currently unavailable (courier service error).';
                })
            : [];
          const realError = providerMessages[0] || (data.error || data.remarks || 'This delivery address is not serviceable by our shipping partners.');
          setShippingError(realError);
        } else {
          setShippingEstimate(data);
          setShippingError(null);
          if (data.options && data.options.length > 0) {
            const currentValid = data.options.some((o: any) => o.id === selectedShippingOptionId);
            if (!currentValid) {
              setSelectedShippingOptionId(data.options[0].id);
            }
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Delhivery live estimation error:', err);
        setShippingError(err.message || 'Error checking Delhivery shipping rates.');
        setShippingEstimate(null);
      } finally {
        if (isMounted) setShippingLoading(false);
      }
    };

    fetchShippingEstimate();

    return () => {
      isMounted = false;
    };
  }, [activePincode, cartWeightGrams, isOpen]);

  if (!isOpen) return null;

  // Totals
  const subtotal = cartSummary?.subtotal ?? safeCartItems.reduce(
    (acc, item) => acc + (item.product ? ((item.product.salePrice || item.product.price) * item.quantity) : 0),
    0
  );
  const tax = cartSummary?.tax ?? Math.round(
    safeCartItems.reduce((total, item) => {
      return (
        total +
        ((item.product?.salePrice || item.product?.price || 0) * item.quantity * (item.taxPercentage ?? item.product?.taxPercentage ?? 0)) / 100
      );
    }, 0)
  );

  const availableShippingOptions = shippingEstimate?.options || [];
  const selectedShippingOption = availableShippingOptions.find((o: any) => o.id === selectedShippingOptionId) || availableShippingOptions[0];
  const shippingFee = (shippingEstimate && shippingEstimate.serviceable && !shippingError && selectedShippingOption) ? selectedShippingOption.charge : 0;
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
    if (created && created.id) {
      setLiveAddresses((prev) => [...prev.filter((a) => a.id !== created.id), created]);
      setSelectedAddressId(created.id);
    }
    setShowAddAddressForm(false);
  };

  const handleExecuteCheckout = async () => {
    setCheckoutError(null);

    if (safeCartItems.length === 0) {
      setCheckoutError('Your cart is empty. Please add items to your cart before proceeding to checkout.');
      return;
    }

    if (!currentUser && !getStoredToken()) {
      setCheckoutError('Authentication required. Please log in.');
      return;
    }

    const chosenAddress = addressList.find((a) => a.id === selectedAddressId) || addressList[0];
    if (!chosenAddress && addressList.length > 0) {
      setCheckoutError('Please select or add a shipping address.');
      return;
    }

    setIsProcessingOrder(true);

    try {
      const checkoutRes = await apiFetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          addressId: chosenAddress?.id,
          shippingAddress: chosenAddress || {
            fullName: newFullName || currentUser?.name || 'Customer',
            phone: newPhone || currentUser?.phone || '+91 98765 43210',
            streetAddress: newStreet || 'Standard Address',
            city: newCity || 'City',
            state: newState || 'State',
            postalCode: newPostalCode || '560001',
            country: 'India'
          },
          paymentMethod,
          couponCode: appliedCoupon?.code,
          shippingFee,
          shippingProvider: selectedShippingOption?.provider || 'Delhivery',
          courierName: selectedShippingOption?.name || 'Delhivery Surface',
          estimatedDeliveryDate: shippingEstimate?.estimatedDeliveryDate,
          items: safeCartItems.map((ci) => ({
            productId: ci.productId || ci.product?.id,
            quantity: ci.quantity,
            variantId: ci.variantId,
            customizationText: ci.customizationText || (ci.product?.title || '').includes('• For:') ? (ci.product?.title || '').split('• For:')[1]?.trim() || undefined : undefined
          }))
        })
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutData.success) {
        throw new Error(checkoutData.error || 'Failed to initiate order checkout');
      }

      const orderObj = checkoutData.order;
      setIsProcessingOrder(false);

      if (paymentMethod === 'COD') {
        setCreatedOrder(orderObj);
        onOrderCompleted(orderObj);
        setStep('success');
      } else {
        const rzpRes = await apiFetch('/api/create-order', {
          method: 'POST',
          body: JSON.stringify({
            orderId: orderObj.id,
            amount: orderObj.totalAmount,
            currency: 'INR'
          })
        });

        const rzpData = await rzpRes.json();
        if (!rzpRes.ok) {
          throw new Error(rzpData.error || 'Failed to create Razorpay order');
        }

        const razorpayOrder = {
          ...rzpData,
          orderId: orderObj.id,
          order: orderObj
        };
        setRazorpayOrderDetails(razorpayOrder);
        setCreatedOrder(orderObj);

        // Open Razorpay Standard Checkout JS Modal if script is available
        if (typeof (window as any).Razorpay !== 'undefined') {
          const rzpKey = rzpData.key || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_TLmrZ8JjKdjoRQ';
          const options = {
            key: rzpKey,
            amount: rzpData.amount,
            currency: rzpData.currency || 'INR',
            name: 'NEXRA 3D',
            description: `Payment for Order #${orderObj.orderNumber || orderObj.id}`,
            order_id: rzpData.id || rzpData.order_id || rzpData.razorpayOrderId,
            handler: async function (response: any) {
              setIsProcessingOrder(true);
              setCheckoutError(null);
              try {
                const verifyRes = await apiFetch('/api/verify-payment', {
                  method: 'POST',
                  body: JSON.stringify({
                    orderId: orderObj.id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                  })
                });
                const verifyData = await verifyRes.json();
                setIsProcessingOrder(false);
                if (verifyRes.ok && verifyData.success) {
                  const finalOrder = verifyData.order || orderObj;
                  setCreatedOrder(finalOrder);
                  onOrderCompleted(finalOrder);
                  setStep('success');
                } else {
                  setCheckoutError(verifyData.error || 'Payment signature verification failed');
                  setStep('payment');
                }
              } catch (err: any) {
                console.error('Verify error:', err);
                setCheckoutError(err.message || 'Payment verification failed');
                setIsProcessingOrder(false);
                setStep('payment');
              }
            },
            prefill: {
              name: chosenAddress?.fullName || currentUser?.name || '',
              email: currentUser?.email || '',
              contact: chosenAddress?.phone || currentUser?.phone || ''
            },
            theme: {
              color: '#4f46e5'
            },
            modal: {
              ondismiss: function () {
                setIsProcessingOrder(false);
                setStep('payment');
                setCheckoutError('Payment modal closed by user');
              }
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (resp: any) {
            setIsProcessingOrder(false);
            setStep('payment');
            setCheckoutError(resp.error?.description || 'Payment failed. Please try again.');
          });
          rzp.open();
        } else {
          setStep('razorpay_modal');
        }
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
    const rzpOrderId = razorpayOrderDetails.razorpayOrderId || razorpayOrderDetails.id || razorpayOrderDetails.order_id;
    const mockSignature = `sig_${Math.random().toString(36).substring(2, 12)}`;

    try {
      const res = await apiFetch('/api/verify-payment', {
        method: 'POST',
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

      const finalOrder = data.order || razorpayOrderDetails.order;
      setCreatedOrder(finalOrder);
      onOrderCompleted(finalOrder);
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
      await apiFetch('/api/payments/razorpay/fail', {
        method: 'POST',
        body: JSON.stringify({
          orderId: razorpayOrderDetails.orderId,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-5xl lg:max-w-6xl max-h-[92vh] sm:max-h-[88vh] flex flex-col my-auto rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-lg font-extrabold">256-Bit Encrypted Secure Checkout</h2>
              <p className="text-xs text-slate-400">Order Total: ₹{Number(grandTotal || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {checkoutError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs font-medium flex items-center justify-between gap-3">
              <span>{checkoutError}</span>
              <div className="flex items-center gap-2 shrink-0">
                {(checkoutError.toLowerCase().includes('authentication') || checkoutError.toLowerCase().includes('log in')) && onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-sm"
                  >
                    Log In / Register
                  </button>
                )}
                <button onClick={() => setCheckoutError(null)} className="text-red-600 font-bold hover:underline cursor-pointer">
                  Dismiss
                </button>
              </div>
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

          {/* STEP 1: ADDRESS SELECTION & DELIVERY OPTIONS (2 COLUMNS) */}
          {step === 'address' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Address Selection & Form */}
              <div className="lg:col-span-7 space-y-4">
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
                  {addressList.map((addr) => (
                    <label
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        selectedAddressId === addr.id
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200 shadow-xs'
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="PIN Code (6 digits)"
                          required
                          value={newPostalCode}
                          onChange={async (e) => {
                            const val = e.target.value;
                            setNewPostalCode(val);
                            const clean = val.replace(/\D/g, '');
                            if (clean.length === 6) {
                              const res = await lookupPincode(clean);
                              if (res) {
                                if (res.city) setNewCity(res.city);
                                if (res.state) setNewState(res.state);
                              }
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Auto-fetches City & State</span>
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="City"
                          required
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <select
                          required
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                    >
                      Save Address & Continue
                    </button>
                  </form>
                )}
              </div>

              {/* RIGHT COLUMN: Delivery Options & Order Summary */}
              <div className="lg:col-span-5 space-y-4 bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span>Delivery Details</span>
                  </h3>
                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    Fast Delivery
                  </span>
                </div>

                {(!activePincode || activePincode.length !== 6) && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 text-center">
                    Please select or add a delivery address to view courier shipping options.
                  </div>
                )}

                {activePincode && activePincode.length === 6 && (
                  <div className="space-y-3">
                    {shippingLoading && (
                      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex items-center justify-center space-x-3 text-xs font-bold text-indigo-700">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                        <span>Checking delivery availability & shipping options...</span>
                      </div>
                    )}

                    {!shippingLoading && shippingError && (
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center space-x-3 text-xs font-bold text-rose-700">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <div>
                          <span className="block font-extrabold text-rose-900">{shippingError}</span>
                          <p className="text-[11px] font-normal text-rose-600 mt-0.5">
                            {shippingError.toLowerCase().includes('not serviceable')
                              ? 'Please select another delivery address or pincode.'
                              : 'Please verify delivery details or courier configuration.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {!shippingLoading && shippingEstimate && shippingEstimate.serviceable && (
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 text-xs shadow-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center space-x-1.5 text-emerald-700 font-extrabold text-[11px]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              Delivery Available {shippingEstimate.city ? `to ${shippingEstimate.city}, ${shippingEstimate.state}` : `(PIN: ${activePincode})`}
                            </span>
                          </div>
                          {shippingEstimate.codAvailable && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              COD Available
                            </span>
                          )}
                        </div>

                        {/* Shipping Options Selector */}
                        <div className="space-y-2">
                          {shippingEstimate?.hasMissingWeightOrDims && (
                            <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 flex items-start space-x-2 text-[11px] text-amber-800">
                              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="leading-tight">
                                <span className="font-bold block text-amber-900">Standard Parcel Rate (0.5 kg)</span>
                                <span className="text-[10px] text-amber-700">Item weight & dimensions are not specified in catalog. Rates estimated using standard 0.5 kg parcel defaults.</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                              Select Shipping Option
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">Standard & Express</span>
                          </div>

                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {availableShippingOptions.map((opt: any) => (
                              <label
                                key={opt.id}
                                onClick={() => setSelectedShippingOptionId(opt.id)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                  selectedShippingOptionId === opt.id
                                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-200'
                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5">
                                  <input
                                    type="radio"
                                    name="checkout_shipping_option"
                                    checked={selectedShippingOptionId === opt.id}
                                    onChange={() => setSelectedShippingOptionId(opt.id)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <div>
                                    <span className="font-extrabold text-slate-900 text-xs block">{opt.name}</span>
                                    <span className="text-[10px] text-slate-500">{opt.description || opt.etaText}</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-black text-slate-900 text-xs block">
                                    {opt.charge === 0 ? <span className="text-emerald-600 font-extrabold">FREE</span> : `₹${opt.charge}`}
                                  </span>
                                  <span className="text-[9px] font-semibold text-slate-500">{opt.etaText}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Promo Code / Coupon Box */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      <span>Apply Promo Code / Coupon</span>
                    </div>
                    {appliedCoupon && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                        APPLIED
                      </span>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-mono font-black text-emerald-950 text-sm block">{appliedCoupon.code}</span>
                          <span className="text-[11px] text-emerald-700 font-semibold">Saved ₹{discountAmount} on this order</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (onRemoveCoupon) onRemoveCoupon();
                          setCouponFeedback(null);
                        }}
                        className="text-rose-600 hover:text-rose-800 text-xs font-bold cursor-pointer hover:underline px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!couponCodeInput.trim()) return;
                          setIsApplyingCoupon(true);
                          setCouponFeedback(null);
                          try {
                            if (onApplyCoupon) {
                              const res = await onApplyCoupon(couponCodeInput.trim());
                              if (res.success) {
                                setCouponFeedback({ type: 'success', text: res.message });
                                setCouponCodeInput('');
                              } else {
                                setCouponFeedback({ type: 'error', text: res.message });
                              }
                            } else {
                              setCouponFeedback({ type: 'error', text: 'Coupon service unavailable' });
                            }
                          } catch {
                            setCouponFeedback({ type: 'error', text: 'Error applying coupon' });
                          } finally {
                            setIsApplyingCoupon(false);
                          }
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          placeholder="Enter promo code (e.g. FESTIVE20)"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value)}
                          className="flex-1 bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 uppercase font-mono font-bold focus:outline-hidden focus:border-indigo-600"
                        />
                        <button
                          type="submit"
                          disabled={isApplyingCoupon || !couponCodeInput.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {isApplyingCoupon ? 'Applying...' : 'Apply'}
                        </button>
                      </form>

                      {couponFeedback && (
                        <p className={`text-[11px] font-semibold ${couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {couponFeedback.text}
                        </p>
                      )}

                      {availableCoupons.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/80">
                          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Available Offers:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {availableCoupons.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={async () => {
                                  setCouponCodeInput(c.code);
                                  setIsApplyingCoupon(true);
                                  setCouponFeedback(null);
                                  try {
                                    if (onApplyCoupon) {
                                      const res = await onApplyCoupon(c.code);
                                      if (res.success) {
                                        setCouponFeedback({ type: 'success', text: res.message });
                                        setCouponCodeInput('');
                                      } else {
                                        setCouponFeedback({ type: 'error', text: res.message });
                                      }
                                    }
                                  } catch {
                                    setCouponFeedback({ type: 'error', text: 'Error applying coupon' });
                                  } finally {
                                    setIsApplyingCoupon(false);
                                  }
                                }}
                                className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <span>{c.code}</span>
                                <span className="text-[9px] font-sans font-semibold text-indigo-600">
                                  ({c.discountType === 'PERCENTAGE' || (c as any).type === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`})
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Order Summary Breakdown Box */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs shadow-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated GST Tax</span>
                    <span className="font-semibold text-slate-800">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 items-center">
                    <span className="flex items-center gap-1">
                      <span>Shipping Charge</span>
                      {selectedShippingOption && (
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                          {selectedShippingOption.name}
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-slate-900">
                      {shippingLoading ? (
                        <span className="text-slate-400 italic">Calculating...</span>
                      ) : shippingError ? (
                        <span className="text-rose-600 font-bold">Unserviceable</span>
                      ) : shippingFee === 0 ? (
                        <span className="text-emerald-600 uppercase font-black">FREE</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                    <span>Grand Total</span>
                    <span className="text-indigo-600 text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  disabled={!selectedAddressId && !showAddAddressForm || shippingLoading || Boolean(shippingError) || (activePincode.length === 6 && !shippingEstimate?.serviceable)}
                  onClick={() => setStep('payment')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
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
                  Simulated Razorpay Modal • Order Amount: <strong>₹{Number(grandTotal || 0).toLocaleString('en-IN')}</strong>
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
