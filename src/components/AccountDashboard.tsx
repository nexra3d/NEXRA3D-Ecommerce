import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Key,
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  UserCheck,
  Save,
  ArrowLeft,
  Clock,
  Phone,
  Plus,
  Trash2,
  Edit3,
  Building2,
  Home,
  Briefcase,
  X
} from 'lucide-react';
import { updateProfileSchema, changePasswordSchema } from '../lib/validation';
import { User, Order, Address } from '../types';

interface AccountDashboardProps {
  user: User | null;
  currentSubSection?: 'overview' | 'profile' | 'password' | 'orders' | 'wishlist' | 'addresses';
  onNavigateSubSection: (section: 'overview' | 'profile' | 'password' | 'orders' | 'wishlist' | 'addresses') => void;
  onUpdateUserSuccess: (user: User) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  onSelectOrderToTrack?: (order: Order) => void;
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({
  user,
  currentSubSection = 'overview',
  onNavigateSubSection,
  onUpdateUserSuccess,
  onLogout,
  onNavigateHome,
  onNavigateLogin,
  onSelectOrderToTrack
}) => {
  // If user is not logged in, show access prompt
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50/50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Authentication Required</h2>
          <p className="text-xs text-slate-600">
            Please log in to your account to view your profile settings and access account management features.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={onNavigateLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-2xl transition-all shadow-sm cursor-pointer"
            >
              Go to Login Page
            </button>
            <button
              onClick={onNavigateHome}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl transition-all cursor-pointer"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile Form state
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(user.avatarUrl || '');
  const [profileAddressLine1, setProfileAddressLine1] = useState(user.addressLine1 || '');
  const [profileAddressLine2, setProfileAddressLine2] = useState(user.addressLine2 || '');
  const [profileCity, setProfileCity] = useState(user.city || '');
  const [profileState, setProfileState] = useState(user.state || '');
  const [profileCountry, setProfileCountry] = useState(user.country || 'India');
  const [profilePostalCode, setProfilePostalCode] = useState(user.postalCode || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      setProfileAvatarUrl(user.avatarUrl || '');
      setProfileAddressLine1(user.addressLine1 || '');
      setProfileAddressLine2(user.addressLine2 || '');
      setProfileCity(user.city || '');
      setProfileState(user.state || '');
      setProfileCountry(user.country || 'India');
      setProfilePostalCode(user.postalCode || '');
    }
  }, [user]);

  // Orders state
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  const fetchUserOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (currentSubSection === 'orders') {
      fetchUserOrders();
    }
  }, [currentSubSection, user]);

  // Addresses State
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address Form Inputs
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreetAddress, setAddrStreetAddress] = useState('');
  const [addrApartment, setAddrApartment] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPostalCode, setAddrPostalCode] = useState('');
  const [addrCountry, setAddrCountry] = useState('India');
  const [addrType, setAddrType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrSubmitLoading, setAddrSubmitLoading] = useState(false);
  const [addrError, setAddrError] = useState('');

  const fetchUserAddresses = async () => {
    if (!user) return;
    setAddressesLoading(true);
    try {
      const res = await fetch(`/api/addresses?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserAddresses(data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (currentSubSection === 'addresses') {
      fetchUserAddresses();
    }
  }, [currentSubSection, user]);

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddrFullName(user?.name || '');
    setAddrPhone(user?.phone || '');
    setAddrStreetAddress('');
    setAddrApartment('');
    setAddrCity('');
    setAddrState('');
    setAddrPostalCode('');
    setAddrCountry('India');
    setAddrType('HOME');
    setAddrIsDefault(userAddresses.length === 0);
    setAddrError('');
    setShowAddressForm(true);
  };

  const openEditAddressModal = (addr: Address) => {
    setEditingAddress(addr);
    setAddrFullName(addr.fullName);
    setAddrPhone(addr.phone);
    setAddrStreetAddress(addr.streetAddress);
    setAddrApartment(addr.apartment || '');
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPostalCode(addr.postalCode);
    setAddrCountry(addr.country || 'India');
    setAddrType(addr.type);
    setAddrIsDefault(addr.isDefault);
    setAddrError('');
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName || !addrPhone || !addrStreetAddress || !addrCity || !addrState || !addrPostalCode) {
      setAddrError('Please fill in all required address fields.');
      return;
    }

    setAddrSubmitLoading(true);
    setAddrError('');

    try {
      const payload = {
        userId: user.id,
        fullName: addrFullName,
        phone: addrPhone,
        streetAddress: addrStreetAddress,
        apartment: addrApartment,
        city: addrCity,
        state: addrState,
        postalCode: addrPostalCode,
        country: addrCountry,
        type: addrType,
        isDefault: addrIsDefault
      };

      let res;
      if (editingAddress) {
        res = await fetch(`/api/addresses/${editingAddress.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        setAddrError(errData.error || 'Failed to save address.');
      } else {
        setShowAddressForm(false);
        fetchUserAddresses();
      }
    } catch (err: any) {
      setAddrError(err.message || 'Server error saving address.');
    } finally {
      setAddrSubmitLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUserAddresses();
      } else {
        alert('Failed to delete address.');
      }
    } catch (err) {
      alert('Error deleting address.');
    }
  };

  const handleSetDefaultAddress = async (addr: Address) => {
    try {
      const res = await fetch(`/api/addresses/${addr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addr, isDefault: true, userId: user.id })
      });
      if (res.ok) {
        fetchUserAddresses();
      }
    } catch (err) {
      console.error('Error setting default address:', err);
    }
  };

  const handleRetryPayment = async (order: Order) => {
    setRetryingOrderId(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}/retry-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to retry payment');
        return;
      }

      // Automatically verify simulated retry payment
      const verifyRes = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          razorpay_order_id: data.razorpayOrderId,
          razorpay_payment_id: `pay_retry_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          razorpay_signature: `sig_retry_${Math.random().toString(36).substring(2, 11)}`
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        alert(`Payment successful for order ${order.orderNumber}! Status updated.`);
        fetchUserOrders();
      } else {
        alert(`Payment retry verification failed: ${verifyData.error}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error retrying payment');
    } finally {
      setRetryingOrderId(null);
    }
  };

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    const validation = updateProfileSchema.safeParse({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      avatarUrl: profileAvatarUrl,
      addressLine1: profileAddressLine1,
      addressLine2: profileAddressLine2,
      city: profileCity,
      state: profileState,
      country: profileCountry,
      postalCode: profilePostalCode
    });

    if (!validation.success) {
      setProfileErrorMsg(validation.error.issues[0]?.message || 'Invalid profile inputs');
      return;
    }

    setProfileLoading(true);

    try {
      const storedToken = localStorage.getItem('auth_token');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {}),
          ...(user ? { 'X-User-Id': user.id, 'X-User-Email': user.email } : {})
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          avatarUrl: profileAvatarUrl,
          addressLine1: profileAddressLine1,
          addressLine2: profileAddressLine2,
          city: profileCity,
          state: profileState,
          country: profileCountry,
          postalCode: profilePostalCode,
          userId: user?.id,
          userEmail: user?.email
        })
      });

      const data = await res.json();
      setProfileLoading(false);

      if (!res.ok) {
        setProfileErrorMsg(data.error || 'Failed to update profile.');
      } else {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          onUpdateUserSuccess(data.user);
        }
        setProfileSuccessMsg('Profile details updated successfully!');
      }
    } catch (err) {
      setProfileLoading(false);
      setProfileErrorMsg('Network error. Unable to update profile.');
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    const validation = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmNewPassword
    });

    if (!validation.success) {
      setPasswordErrorMsg(validation.error.issues[0]?.message || 'Invalid password inputs');
      return;
    }

    setPasswordLoading(true);

    try {
      const storedToken = localStorage.getItem('auth_token');
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {}),
          ...(user ? { 'X-User-Id': user.id, 'X-User-Email': user.email } : {})
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
          userId: user?.id,
          userEmail: user?.email
        })
      });

      const data = await res.json();
      setPasswordLoading(false);

      if (!res.ok) {
        setPasswordErrorMsg(data.error || 'Failed to update password.');
      } else {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        setPasswordSuccessMsg('Your password has been changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      setPasswordLoading(false);
      setPasswordErrorMsg('Network error. Unable to change password.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storefront</span>
        </button>

        <span className="text-xs text-slate-500 font-mono">
          User ID: <span className="font-bold text-slate-800">{user.id}</span>
        </span>
      </div>

      {/* Account Overview Header Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 flex items-center justify-center shrink-0 shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-xl font-black text-white uppercase">
              {user.name.charAt(0)}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user.name}</h1>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  user.role === 'ADMIN'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}
              >
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Member since:{' '}
                <strong className="text-slate-200 font-semibold">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Logout Button */}
        <button
          onClick={onLogout}
          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs px-4 py-2.5 rounded-2xl transition-all flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Grid Layout: Navigation Sidebar + Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-1">
          <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Account Menu
          </div>

          <button
            onClick={() => onNavigateSubSection('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentSubSection === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Account Overview</span>
          </button>

          <button
            onClick={() => onNavigateSubSection('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentSubSection === 'profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => onNavigateSubSection('password')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentSubSection === 'password'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Change Password</span>
          </button>

          <div className="pt-3 px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-2">
            Shopping & Addresses
          </div>

          <button
            onClick={() => onNavigateSubSection('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentSubSection === 'orders' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Orders</span>
          </button>

          <button
            onClick={() => onNavigateSubSection('wishlist')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentSubSection === 'wishlist' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>My Wishlist</span>
          </button>

          <button
            onClick={() => onNavigateSubSection('addresses')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              currentSubSection === 'addresses' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>My Addresses</span>
          </button>
        </div>

        {/* Main Section Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* SECTION 1: ACCOUNT OVERVIEW */}
          {currentSubSection === 'overview' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Account Summary
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-500 font-semibold block">Full Name</span>
                  <span className="text-sm font-extrabold text-slate-900">{user.name}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-500 font-semibold block">Email Address</span>
                  <span className="text-sm font-extrabold text-slate-900">{user.email}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-500 font-semibold block">Mobile Number</span>
                  <span className="text-sm font-extrabold text-slate-900">{user.phone || 'Not provided'}</span>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => onNavigateSubSection('profile')}
                  className="p-5 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 rounded-2xl text-left transition-all cursor-pointer group"
                >
                  <UserCheck className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Update Profile Details</h3>
                  <p className="text-xs text-slate-500 mt-1">Change your full name, email, or mobile number safely.</p>
                </button>

                <button
                  onClick={() => onNavigateSubSection('password')}
                  className="p-5 bg-purple-50/60 hover:bg-purple-50 border border-purple-100 rounded-2xl text-left transition-all cursor-pointer group"
                >
                  <Key className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Security & Password</h3>
                  <p className="text-xs text-slate-500 mt-1">Update your account password with encrypted security.</p>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: PROFILE MANAGEMENT */}
          {currentSubSection === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Profile Settings</h2>
                <p className="text-xs text-slate-500">
                  Manage your personal account details including full name, email address, and mobile number.
                </p>
              </div>

              {profileSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-4 rounded-2xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-4 rounded-2xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={profileAvatarUrl}
                    onChange={(e) => setProfileAvatarUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 mb-3 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Primary Address Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Address Line 1 (Street Address)
                      </label>
                      <input
                        type="text"
                        placeholder="Flat / Building No / Street"
                        value={profileAddressLine1}
                        onChange={(e) => setProfileAddressLine1(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Address Line 2 (Apartment, Suite, Landmark)
                      </label>
                      <input
                        type="text"
                        placeholder="Apartment, Suite, Landmark (Optional)"
                        value={profileAddressLine2}
                        onChange={(e) => setProfileAddressLine2(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="Bengaluru"
                          value={profileCity}
                          onChange={(e) => setProfileCity(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          placeholder="Karnataka"
                          value={profileState}
                          onChange={(e) => setProfileState(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Postal / Pin Code
                        </label>
                        <input
                          type="text"
                          placeholder="560001"
                          value={profilePostalCode}
                          onChange={(e) => setProfilePostalCode(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          placeholder="India"
                          value={profileCountry}
                          onChange={(e) => setProfileCountry(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Account Role (Protected)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.role}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-4 py-3 text-xs font-mono font-extrabold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Account roles are server-controlled and cannot be self-modified by customers.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-md shadow-indigo-100 flex items-center space-x-2 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileLoading ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                </button>
              </form>
            </div>
          )}

          {/* SECTION 3: CHANGE PASSWORD */}
          {currentSubSection === 'password' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-500">
                  Verify your current password and create a new secure password.
                </p>
              </div>

              {passwordSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-4 rounded-2xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-4 rounded-2xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters, letter & number"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-md shadow-indigo-100 flex items-center space-x-2 disabled:opacity-60"
                >
                  <Key className="w-4 h-4" />
                  <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>
          )}

          {/* SECTION 4: MY ORDERS */}
          {currentSubSection === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Order History & Invoices</h2>
                  <p className="text-xs text-slate-500">
                    Track live deliveries, review GST tax invoices, and complete pending/failed payments.
                  </p>
                </div>
                <button
                  onClick={fetchUserOrders}
                  disabled={ordersLoading}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                >
                  {ordersLoading ? 'Refreshing...' : 'Refresh List'}
                </button>
              </div>

              {ordersLoading ? (
                <div className="text-center py-12 text-xs text-slate-500 font-medium">
                  Loading your order history...
                </div>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">No Orders Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You haven't placed any orders yet. Browse our industrial 3D printers and materials to get started!
                  </p>
                  <button
                    onClick={onNavigateHome}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Browse Product Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all space-y-4 bg-slate-50/50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-200/80 pb-3">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">Order ID</span>
                          <span className="font-mono font-extrabold text-slate-900 text-sm">{order.orderNumber}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">Date</span>
                          <span className="font-medium text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">GST Invoice</span>
                          <span className="font-mono text-slate-800 font-bold">{order.invoiceNumber || 'INV-PENDING'}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">Payment Status</span>
                          <span className={`inline-block font-black text-[11px] px-2 py-0.5 rounded ${
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
                          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">Total Amount</span>
                          <span className="font-black text-indigo-600 text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Items row */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 overflow-x-auto">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1.5 shrink-0">
                              <img src={item.productImage} alt={item.productTitle} className="w-8 h-8 rounded-lg object-cover" />
                              <div className="text-[11px] pr-2">
                                <span className="font-bold text-slate-900 block max-w-[120px] truncate">{item.productTitle}</span>
                                <span className="text-slate-500 text-[10px]">Qty: {item.quantity}</span>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-xs text-slate-500 font-bold">+ {order.items.length - 3} more</span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {(order.paymentStatus === 'FAILED' || order.paymentStatus === 'PENDING') && (
                            <button
                              onClick={() => handleRetryPayment(order)}
                              disabled={retryingOrderId === order.id}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              {retryingOrderId === order.id ? 'Retrying...' : 'Retry Payment'}
                            </button>
                          )}

                          {onSelectOrderToTrack && (
                            <button
                              onClick={() => onSelectOrderToTrack(order)}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              View Invoice & Tracking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: MY WISHLIST */}
          {currentSubSection === 'wishlist' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Saved Wishlist Items</h2>
                  <p className="text-xs text-slate-500">Quickly access items you saved for future 3D printing projects.</p>
                </div>
                <button
                  onClick={onNavigateHome}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Products Catalog</span>
                </button>
              </div>

              <div className="text-center py-12 space-y-3 bg-slate-50/50 rounded-2xl border border-slate-200/80">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Explore & Bookmark Printers & Materials</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the heart icon on any product page or catalog listing to save equipment, SLA resins, or engineering thermoplastics to your wishlist.
                </p>
                <button
                  onClick={onNavigateHome}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Catalog</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 6: MY ADDRESSES */}
          {currentSubSection === 'addresses' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Saved Shipping & Billing Addresses</h2>
                  <p className="text-xs text-slate-500">
                    Manage your delivery locations for faster checkout on industrial equipment and consumables.
                  </p>
                </div>
                <button
                  onClick={openAddAddressModal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addressesLoading ? (
                <div className="text-center py-12 text-xs text-slate-500 font-medium">
                  Loading your saved addresses...
                </div>
              ) : userAddresses.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">No Saved Addresses Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Add your facility, warehouse, or office address to streamline order delivery and billing.
                  </p>
                  <button
                    onClick={openAddAddressModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Address</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative rounded-2xl border p-5 transition-all space-y-3 ${
                        addr.isDefault
                          ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            addr.type === 'WORK'
                              ? 'bg-blue-100 text-blue-800'
                              : addr.type === 'HOME'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {addr.type === 'HOME' && <Home className="w-3 h-3 mr-1 inline" />}
                            {addr.type === 'WORK' && <Briefcase className="w-3 h-3 mr-1 inline" />}
                            <span>{addr.type}</span>
                          </span>

                          {addr.isDefault && (
                            <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openEditAddressModal(addr)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                            title="Edit address"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all"
                            title="Delete address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-700">
                        <div className="font-extrabold text-sm text-slate-900">{addr.fullName}</div>
                        <div>
                          {addr.streetAddress}
                          {addr.apartment ? `, ${addr.apartment}` : ''}
                        </div>
                        <div>
                          {addr.city}, {addr.state} - <span className="font-mono font-bold">{addr.postalCode}</span>
                        </div>
                        <div className="text-slate-500">{addr.country}</div>
                        <div className="pt-1 flex items-center text-slate-600 font-medium">
                          <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span>{addr.phone}</span>
                        </div>
                      </div>

                      {!addr.isDefault && (
                        <div className="pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleSetDefaultAddress(addr)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-all cursor-pointer"
                          >
                            Set as Default Address
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add / Edit Address Modal */}
              {showAddressForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 my-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        <span>{editingAddress ? 'Edit Saved Address' : 'Add New Delivery Address'}</span>
                      </h3>
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {addrError && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{addrError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={addrFullName}
                            onChange={(e) => setAddrFullName(e.target.value)}
                            placeholder="e.g. Alex Smith"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={addrPhone}
                            onChange={(e) => setAddrPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={addrStreetAddress}
                          onChange={(e) => setAddrStreetAddress(e.target.value)}
                          placeholder="Plot No., Street / Industrial Area / Landmark"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold text-slate-700 mb-1">
                          Apartment / Suite / Building (Optional)
                        </label>
                        <input
                          type="text"
                          value={addrApartment}
                          onChange={(e) => setAddrApartment(e.target.value)}
                          placeholder="Building 4, Unit B"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={addrCity}
                            onChange={(e) => setAddrCity(e.target.value)}
                            placeholder="Bengaluru"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            value={addrState}
                            onChange={(e) => setAddrState(e.target.value)}
                            placeholder="Karnataka"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={addrPostalCode}
                            onChange={(e) => setAddrPostalCode(e.target.value)}
                            placeholder="560001"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">
                            Country *
                          </label>
                          <input
                            type="text"
                            required
                            value={addrCountry}
                            onChange={(e) => setAddrCountry(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-extrabold text-slate-700 mb-1">
                            Address Tag
                          </label>
                          <select
                            value={addrType}
                            onChange={(e) => setAddrType(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium transition-all focus:outline-hidden"
                          >
                            <option value="HOME">HOME</option>
                            <option value="WORK">WORK / OFFICE</option>
                            <option value="OTHER">OTHER / WAREHOUSE</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="checkbox"
                          id="isDefaultAddr"
                          checked={addrIsDefault}
                          onChange={(e) => setAddrIsDefault(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="isDefaultAddr" className="font-bold text-slate-700 text-xs cursor-pointer">
                          Set as primary default address for checkout
                        </label>
                      </div>

                      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addrSubmitLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100 disabled:opacity-60 flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{addrSubmitLoading ? 'Saving...' : 'Save Address'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
