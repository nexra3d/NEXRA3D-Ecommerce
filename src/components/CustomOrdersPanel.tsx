import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  CreditCard,
  Phone,
  Mail,
  FileText,
  Truck,
  Building,
  Ban,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Trash2
} from 'lucide-react';
import { CustomOrder, CustomOrderDeliveryType, CustomOrderPaymentStatus } from '../types';

interface CustomOrdersPanelProps {
  getAuthHeaders: (extra?: Record<string, string>) => Record<string, string>;
  onOrderPaid?: () => void;
  onOrdersChange?: () => void;
  initialCreateOpen?: boolean;
}

export const CustomOrdersPanel: React.FC<CustomOrdersPanelProps> = ({
  getAuthHeaders,
  onOrderPaid,
  onOrdersChange,
  initialCreateOpen = false
}) => {
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CustomOrderPaymentStatus>('ALL');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(initialCreateOpen);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [deliveryType, setDeliveryType] = useState<CustomOrderDeliveryType>('STORE_PICKUP');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active QR View Modal State
  const [activeQrOrder, setActiveQrOrder] = useState<CustomOrder | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Custom Orders from server
  const fetchCustomOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/custom-orders', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCustomOrders(data);
        }
      }
    } catch (err) {
      console.error('Failed to load custom orders from database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  // Real-time polling when a QR modal is open and in AWAITING_PAYMENT status
  useEffect(() => {
    if (activeQrOrder && activeQrOrder.paymentStatus === 'AWAITING_PAYMENT') {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/admin/custom-orders/${activeQrOrder.id}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
          });
          if (res.ok) {
            const updated = await res.json();
            if (updated && updated.paymentStatus !== activeQrOrder.paymentStatus) {
              setActiveQrOrder(updated);
              setCustomOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
              if (updated.paymentStatus === 'PAID') {
                if (onOrderPaid) onOrderPaid();
              }
            }
          }
        } catch (e) {
          // silent error in polling
        }
      }, 3500);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [activeQrOrder]);

  // Handle Form Submission: Create Order & Generate Razorpay QR
  const handleCreateCustomOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Strict validation matching prompt specifications
    if (!customerName.trim() || customerName.trim().length < 2) {
      setFormError('Customer Name is required (minimum 2 characters).');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      setFormError('Custom Amount in ₹ is required (minimum ₹1).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/custom-orders', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: cleanPhone,
          email: email.trim() || undefined,
          description: description.trim() || undefined,
          amount: numAmount,
          deliveryType,
          notes: notes.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create custom order');
      }

      if (data.customOrder) {
        // Prepend to orders list
        setCustomOrders((prev) => [data.customOrder, ...prev]);

        // Reset form
        setCustomerName('');
        setPhone('');
        setEmail('');
        setDescription('');
        setAmount('');
        setDeliveryType('STORE_PICKUP');
        setNotes('');
        setShowCreateModal(false);

        // Open QR Presentation card
        setActiveQrOrder(data.customOrder);
        setActionFeedback('Payment QR generated successfully! Settlement linked to your Razorpay account.');
        setTimeout(() => setActionFeedback(null), 5000);
        if (onOrdersChange) onOrdersChange();
      }
    } catch (err: any) {
      setFormError(err.message || 'Error generating Razorpay QR code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy payment link to clipboard
  const handleCopyLink = (linkToCopy?: string) => {
    const link = linkToCopy || activeQrOrder?.paymentLink || '';
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Download QR image
  const handleDownloadQr = () => {
    if (!activeQrOrder?.qrImageUrl) return;
    const link = document.createElement('a');
    link.href = activeQrOrder.qrImageUrl;
    link.download = `Nexra3D-CustomOrder-${activeQrOrder.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check / Verify Payment status manually
  const handleVerifyStatus = async (orderId: string) => {
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/admin/custom-orders/${orderId}/verify-status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.customOrder) {
        setCustomOrders((prev) => prev.map((o) => (o.id === data.customOrder.id ? data.customOrder : o)));
        if (activeQrOrder?.id === data.customOrder.id) {
          setActiveQrOrder(data.customOrder);
        }
        setActionFeedback(data.message || 'Payment status updated.');
        setTimeout(() => setActionFeedback(null), 4000);
        if (onOrdersChange) onOrdersChange();
        if (data.customOrder.paymentStatus === 'PAID' && onOrderPaid) {
          onOrderPaid();
        }
      } else {
        setActionFeedback(data.error || 'Payment has not been credited yet.');
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err: any) {
      setActionFeedback('Verification check failed: ' + err.message);
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setIsVerifying(false);
    }
  };

  // Cancel / Expire QR action
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to deactivate and expire this QR code? The customer will no longer be able to pay with it.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/custom-orders/${orderId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.customOrder) {
        setCustomOrders((prev) => prev.map((o) => (o.id === data.customOrder.id ? data.customOrder : o)));
        if (activeQrOrder?.id === data.customOrder.id) {
          setActiveQrOrder(data.customOrder);
        }
        setActionFeedback('QR Code deactivated successfully.');
        setTimeout(() => setActionFeedback(null), 3000);
        if (onOrdersChange) onOrdersChange();
      }
    } catch (err: any) {
      alert('Error cancelling order: ' + err.message);
    }
  };

  // Mark as Paid (Admin In-Person / Counter Override)
  const handleMarkAsPaid = async (orderId: string) => {
    if (!window.confirm('Mark this custom order as Paid? (Use if customer paid directly via counter cash, terminal, or direct transfer)')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/custom-orders/${orderId}/mark-paid`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.customOrder) {
        setCustomOrders((prev) => prev.map((o) => (o.id === data.customOrder.id ? data.customOrder : o)));
        if (activeQrOrder?.id === data.customOrder.id) {
          setActiveQrOrder(data.customOrder);
        }
        setActionFeedback('Custom order marked as Paid ✅');
        setTimeout(() => setActionFeedback(null), 4000);
        if (onOrdersChange) onOrdersChange();
        if (onOrderPaid) onOrderPaid();
      }
    } catch (err: any) {
      alert('Error marking as paid: ' + err.message);
    }
  };

  // Delete Expired or Cancelled Custom Order
  // Permanently removes the record and releases its order sequence number for reuse
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete custom order ${orderId}?\n\nIts sequence number will be released for reuse in subsequent orders.`)) {
      return;
    }

    setIsDeletingId(orderId);
    try {
      const res = await fetch(`/api/admin/custom-orders/${orderId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setCustomOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (activeQrOrder?.id === orderId) {
          setActiveQrOrder(null);
        }
        setActionFeedback(`Order ${orderId} deleted. Sequence number released for reuse.`);
        setTimeout(() => setActionFeedback(null), 4000);
        if (onOrdersChange) onOrdersChange();
        if (onOrderPaid) onOrderPaid();
      } else {
        alert(data.error || 'Failed to delete custom order');
      }
    } catch (err: any) {
      alert('Error deleting custom order: ' + err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filtered list
  const filteredOrders = customOrders.filter((ord) => {
    const matchesStatus = statusFilter === 'ALL' || ord.paymentStatus === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      ord.customerName.toLowerCase().includes(query) ||
      ord.phone.includes(query) ||
      (ord.email && ord.email.toLowerCase().includes(query)) ||
      ord.id.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  // Calculate quick metrics
  const totalOrders = customOrders.length;
  const awaitingCount = customOrders.filter((o) => o.paymentStatus === 'AWAITING_PAYMENT').length;
  const paidOrders = customOrders.filter((o) => o.paymentStatus === 'PAID');
  const paidCount = paidOrders.length;
  const totalSettled = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 p-3 rounded-xl flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Custom Orders & Razorpay QR Payments</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  Razorpay Direct Settlement
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Generate one-off orders, create dynamic UPI payment QR codes, and receive direct account settlements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={fetchCustomOrders}
            disabled={isLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Custom Order</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Custom Orders</span>
          <div className="text-xl font-extrabold text-slate-100">{totalOrders}</div>
          <span className="text-[10px] text-slate-500">Bespoke 3D jobs & parts</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Awaiting Payment</span>
          <div className="text-xl font-extrabold text-amber-400 flex items-center gap-1.5">
            <span>{awaitingCount}</span>
            {awaitingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
          </div>
          <span className="text-[10px] text-slate-500">Live QR active</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Paid & Settled</span>
          <div className="text-xl font-extrabold text-emerald-400">{paidCount}</div>
          <span className="text-[10px] text-slate-500">Credited into bank</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Total Settled Revenue</span>
          <div className="text-xl font-extrabold text-indigo-400">₹{totalSettled.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-500">Direct Razorpay account</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/60 border border-slate-700/80 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, phone, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'AWAITING_PAYMENT', 'PAID', 'CANCELLED'] as const).map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {status === 'ALL' && `All (${customOrders.length})`}
                {status === 'AWAITING_PAYMENT' && `Awaiting (${awaitingCount})`}
                {status === 'PAID' && `Paid (${paidCount})`}
                {status === 'CANCELLED' && `Cancelled (${customOrders.filter((o) => o.paymentStatus === 'CANCELLED' || o.paymentStatus === 'EXPIRED').length})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Orders Table / Cards */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Order ID & Date</th>
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Delivery</th>
                <th className="p-3.5">Payment Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <QrCode className="w-8 h-8 text-slate-500" />
                      <p className="font-semibold text-slate-300">No custom orders found.</p>
                      <p className="text-[11px] text-slate-500">
                        {searchQuery ? 'Try adjusting your search query or filters.' : 'Click "+ New Custom Order" above to create one and generate a payment QR.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPaid = order.paymentStatus === 'PAID';
                  const isPastExpiry = Boolean(order.expiresAt && new Date(order.expiresAt).getTime() <= Date.now());
                  const isExpired = order.paymentStatus === 'EXPIRED' || (order.paymentStatus === 'AWAITING_PAYMENT' && isPastExpiry);
                  const isCancelled = order.paymentStatus === 'CANCELLED';
                  const isAwaiting = order.paymentStatus === 'AWAITING_PAYMENT' && !isPastExpiry;
                  const canBeDeleted = isCancelled || isExpired;

                  return (
                    <tr key={order.id} className="hover:bg-slate-750/40 transition-colors">
                      {/* ID & Date */}
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-amber-400 text-xs">
                          {order.id}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{order.customerName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-indigo-400" />
                          <span className="font-mono">{order.phone}</span>
                        </div>
                        {order.email && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{order.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Description */}
                      <td className="p-3.5 max-w-xs">
                        <p className="text-slate-300 line-clamp-2" title={order.description || 'Custom 3D Printing'}>
                          {order.description || 'Custom 3D Printing / Prototype Order'}
                        </p>
                        {order.notes && (
                          <span className="text-[10px] text-slate-400 italic block mt-0.5">
                            Note: {order.notes}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="p-3.5">
                        <span className="text-sm font-extrabold text-slate-100">
                          ₹{Number(order.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Delivery */}
                      <td className="p-3.5">
                        {order.deliveryType === 'STORE_PICKUP' ? (
                          <span className="inline-flex items-center gap-1 bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <Building className="w-3 h-3" />
                            <span>Store Pickup</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-900 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <Truck className="w-3 h-3" />
                            <span>Home Delivery</span>
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Paid ✅</span>
                          </span>
                        )}

                        {isAwaiting && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Awaiting Payment</span>
                            </span>
                            {order.expiresAt && (
                              <span className="block text-[9px] text-amber-400/80 font-mono">
                                1h expiry: {new Date(order.expiresAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        )}

                        {isExpired && (
                          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                            <Clock className="w-3.5 h-3.5 text-rose-400" />
                            <span>Expired</span>
                          </span>
                        )}

                        {isCancelled && !isExpired && (
                          <span className="inline-flex items-center gap-1 bg-slate-700/40 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                            <Ban className="w-3.5 h-3.5 text-slate-400" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View QR Code button */}
                          <button
                            onClick={() => setActiveQrOrder(order)}
                            className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                            title="View Payment QR and Link"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>View QR</span>
                          </button>

                          {/* Verify / Check Status button if Awaiting */}
                          {isAwaiting && (
                            <button
                              onClick={() => handleVerifyStatus(order.id)}
                              disabled={isVerifying}
                              className="p-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
                              title="Check payment status with Razorpay"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                            </button>
                          )}

                          {/* Mark as Paid manual override for cash or in-store */}
                          {isAwaiting && (
                            <button
                              onClick={() => handleMarkAsPaid(order.id)}
                              className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer text-[10px] font-bold"
                              title="Mark as Paid (Counter cash / direct settlement override)"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Cancel / Expire QR button */}
                          {isAwaiting && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="p-1.5 bg-rose-600/10 hover:bg-rose-600/30 text-rose-400 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                              title="Deactivate / Expire QR code"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete button for Cancelled / Expired orders */}
                          {canBeDeleted && (
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={isDeletingId === order.id}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                              title="Delete expired/cancelled custom order & release order number for reuse"
                            >
                              <Trash2 className={`w-3.5 h-3.5 ${isDeletingId === order.id ? 'animate-spin' : ''}`} />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW CUSTOM ORDER & GENERATE QR */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Create New Custom Order</h3>
                  <p className="text-[11px] text-slate-400">Generate a custom Razorpay UPI Payment QR</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormError(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateCustomOrder} className="p-5 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-xs">{formError}</span>
                </div>
              )}

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Varma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono font-bold">+91</span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-3 py-2.5 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">10-digit Indian mobile number</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Customer Email <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Amount in INR */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom Amount in ₹ <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g. 2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-white font-extrabold text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Amount in INR (min ₹1.00). Settles directly into your linked Razorpay bank account.
                </span>
              </div>

              {/* Delivery Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Fulfillment / Delivery Type <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('STORE_PICKUP')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition-all ${
                      deliveryType === 'STORE_PICKUP'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Building className={`w-4 h-4 ${deliveryType === 'STORE_PICKUP' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-xs">Store Pickup</div>
                      <div className="text-[10px] text-slate-400">Gachibowli Center</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('HOME_DELIVERY')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition-all ${
                      deliveryType === 'HOME_DELIVERY'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Truck className={`w-4 h-4 ${deliveryType === 'HOME_DELIVERY' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-xs">Home Delivery</div>
                      <div className="text-[10px] text-slate-400">Courier Shipping</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Order Description / Item Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 4x Carbon-Fiber PLA Propeller Hubs (0.12mm high-precision infill)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Internal Admin Notes <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Walk-in customer, collecting Saturday morning"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Razorpay QR...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Generate Payment QR</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DYNAMIC RAZORPAY PAYMENT QR PRESENTATION CARD */}
      {/* ========================================================================= */}
      {activeQrOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-200 text-xs">
                  Razorpay UPI Payment QR Code
                </span>
              </div>
              <button
                onClick={() => setActiveQrOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-center space-y-4">
              {/* Payment Status Pill */}
              <div className="flex justify-center">
                {activeQrOrder.paymentStatus === 'PAID' ? (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-extrabold animate-bounce">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Payment Received & Settled ✅</span>
                  </div>
                ) : activeQrOrder.paymentStatus === 'EXPIRED' || (activeQrOrder.paymentStatus === 'AWAITING_PAYMENT' && activeQrOrder.expiresAt && new Date(activeQrOrder.expiresAt).getTime() <= Date.now()) ? (
                  <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>QR Code Expired (1-Hour Limit)</span>
                  </div>
                ) : activeQrOrder.paymentStatus === 'CANCELLED' ? (
                  <div className="inline-flex items-center gap-1.5 bg-slate-700/40 text-slate-400 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                    <Ban className="w-4 h-4" />
                    <span>QR Code Deactivated</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>Awaiting UPI Payment Scan</span>
                    {activeQrOrder.expiresAt && (
                      <span className="text-[11px] font-normal text-amber-300/80 ml-1 font-mono">
                        (Expires {new Date(activeQrOrder.expiresAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Amount Display */}
              <div>
                <span className="text-3xl font-black text-white tracking-tight">
                  ₹{Number(activeQrOrder.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Order <strong className="text-amber-400 font-mono">{activeQrOrder.id}</strong> • {activeQrOrder.customerName}
                </span>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-2xl mx-auto w-64 h-64 shadow-2xl flex items-center justify-center border-4 border-indigo-500/30 relative group">
                {activeQrOrder.qrImageUrl ? (
                  <img
                    src={activeQrOrder.qrImageUrl}
                    alt="Razorpay Dynamic Payment QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 text-xs">Generating QR...</div>
                )}

                {activeQrOrder.paymentStatus === 'PAID' && (
                  <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center text-emerald-300 p-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-1" />
                    <span className="font-extrabold text-sm text-white">PAID IN FULL</span>
                    <span className="text-[10px] text-emerald-300/80">Credited to Razorpay Account</span>
                  </div>
                )}
              </div>

              {/* UPI & App Notice */}
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Scan with any UPI App: <strong className="text-slate-200">GPay, PhonePe, Paytm, CRED, or BHIM</strong>.
                Amount is locked to exact order value.
              </p>

              {/* Actions & Links */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink()}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Payment Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-400" />
                        <span>Copy Payment Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadQr}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    title="Download QR code image for customer printing"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {activeQrOrder.paymentLink && (
                  <a
                    href={activeQrOrder.paymentLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold py-2 rounded-xl border border-indigo-500/30 transition-colors flex items-center justify-center gap-1.5 text-xs block"
                  >
                    <span>Open in UPI Mobile App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Live Status Checks & Footer Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                {activeQrOrder.paymentStatus === 'AWAITING_PAYMENT' &&
                 !(activeQrOrder.expiresAt && new Date(activeQrOrder.expiresAt).getTime() <= Date.now()) ? (
                  <>
                    <button
                      onClick={() => handleVerifyStatus(activeQrOrder.id)}
                      disabled={isVerifying}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-semibold cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                      <span>{isVerifying ? 'Checking...' : 'Check Payment Status'}</span>
                    </button>

                    <button
                      onClick={() => handleMarkAsPaid(activeQrOrder.id)}
                      className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      Mark as Paid (Cash/Direct)
                    </button>
                  </>
                ) : activeQrOrder.paymentStatus === 'PAID' ? (
                  <span className="text-[11px] text-slate-400">
                    Settlement recorded on {new Date(activeQrOrder.paidAt || Date.now()).toLocaleDateString('en-IN')}
                  </span>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {activeQrOrder.paymentStatus === 'CANCELLED' ? 'Order cancelled' : 'Payment window expired (60 mins)'}
                    </span>
                    <button
                      onClick={() => handleDeleteOrder(activeQrOrder.id)}
                      disabled={isDeletingId === activeQrOrder.id}
                      className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className={`w-3 h-3 ${isDeletingId === activeQrOrder.id ? 'animate-spin' : ''}`} />
                      <span>Delete Order</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CustomOrdersPanel;
