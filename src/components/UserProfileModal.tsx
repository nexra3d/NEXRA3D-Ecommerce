import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  MapPin,
  Package,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { User, Address, Order } from '../types';
import { INDIAN_STATES, lookupPincode } from '../lib/pincode';

interface UserProfileModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  addresses: Address[];
  orders: Order[];
  onAddNewAddress: (address: Partial<Address>) => Promise<Address>;
  onTrackOrder: (order: Order) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  addresses = [],
  orders = [],
  onAddNewAddress,
  onTrackOrder,
  onLogout
}) => {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeAddresses = Array.isArray(addresses) ? addresses : [];

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newFullName, setNewFullName] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');

  if (!isOpen || !user) return null;

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newPostalCode) return;
    await onAddNewAddress({
      fullName: newFullName,
      phone: newPhone || '+91 98765 43210',
      streetAddress: newStreet,
      city: newCity,
      state: newState || 'Karnataka',
      postalCode: newPostalCode,
      country: 'India',
      type: 'HOME'
    });
    setShowAddAddressForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
              alt={user.name}
              className="w-12 h-12 rounded-xl object-cover bg-indigo-100 border-2 border-indigo-400"
            />
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <span>{user.name}</span>
                <span className="text-[10px] bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                  {user.role}
                </span>
              </h2>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 border-b border-slate-200 px-6 pt-4 bg-slate-50">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors cursor-pointer border-b-2 ${
              activeTab === 'orders'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            Order History ({safeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors cursor-pointer border-b-2 ${
              activeTab === 'addresses'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            Saved Addresses ({safeAddresses.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors cursor-pointer border-b-2 ${
              activeTab === 'profile'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            Account Details
          </button>
        </div>

        {/* Main Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {safeOrders.length > 0 ? (
                safeOrders.map((ord) => (
                  <div key={ord.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 text-sm">{ord.orderNumber}</span>
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {(ord.orderStatus || ord.status || '').replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Placed on {new Date(ord.createdAt).toLocaleDateString()} • {(ord.items || []).length} Items
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-black text-slate-900">
                          ₹{Number(ord.totalAmount || ord.subtotal || 0).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => {
                            onTrackOrder(ord);
                            onClose();
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Track Order</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Thumbnails Preview */}
                    <div className="flex items-center space-x-2 overflow-x-auto pt-1">
                      {(ord.items || []).map((it) => (
                        <div key={it.id} className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1.5 shrink-0 text-xs">
                          <img src={it.productImage || (it.product && it.product.imageUrl)} alt={it.productTitle || (it.product && it.product.name)} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="font-semibold text-slate-800 max-w-[120px] truncate">{it.productTitle || (it.product && it.product.name)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No orders placed yet. Start shopping!
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Your Shipping Addresses</h3>
                <button
                  onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                  className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {showAddAddressForm && (
                <form onSubmit={handleSaveAddress} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Add New Address</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl p-2 text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    required
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="PIN Code"
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
                      className="bg-white border border-slate-200 rounded-xl p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl p-2 text-xs"
                    />
                    <select
                      required
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl p-2 text-xs font-medium"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
                    Save Address
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {safeAddresses.map((addr) => (
                  <div key={addr.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">
                      {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <span className="text-slate-500 font-medium block">Ph: {addr.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-bold text-slate-800">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-800">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-bold text-slate-800">{user.phone || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Role:</span>
                  <span className="font-bold text-indigo-600 uppercase">{user.role}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3 rounded-2xl border border-rose-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
