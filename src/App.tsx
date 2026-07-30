import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { UserProfileModal } from './components/UserProfileModal';
import { WishlistModal } from './components/WishlistModal';
import { AuthModal } from './components/AuthModal';
import { EmailInboxModal } from './components/EmailInboxModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AccountDashboard } from './components/AccountDashboard';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import { CartPage } from './components/CartPage';
import { WishlistPage } from './components/WishlistPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { ServicesPage } from './components/ServicesPage';
import { ServiceDetailPage } from './components/ServiceDetailPage';
import { AerospacePage } from './components/AerospacePage';
import { QuoteRequestModal } from './components/QuoteRequestModal';
import { Footer } from './components/Footer';

import { AdminLoginPage } from './components/AdminLoginPage';
import { ShieldCheck } from 'lucide-react';
import {
  Product,
  Category,
  User,
  CartItem,
  Address,
  Coupon,
  Order,
  EmailNotification,
  ProductFilterState,
  Service
} from './types';

export default function App() {
  // Navigation / View Router State
  const [currentView, setCurrentView] = useState<
    'home' | 'shop' | 'aerospace' | 'services' | 'service-detail' | 'about' | 'contact' | 'login' | 'register' | 'account' | 'unauthorized' | 'cart' | 'wishlist' | 'admin'
  >('home');
  const [accountSubSection, setAccountSubSection] = useState<'overview' | 'profile' | 'password' | 'orders' | 'wishlist' | 'addresses'>('overview');

  // Global App State
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [cartData, setCartData] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [wishlistData, setWishlistData] = useState<any>(null);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [emails, setEmails] = useState<EmailNotification[]>([]);

  // Filter State
  const [filters, setFilters] = useState<ProductFilterState>({
    sortBy: 'popular',
    inStockOnly: false,
    onSaleOnly: false
  });

  // Modal / Drawer Toggles
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isEmailInboxOpen, setIsEmailInboxOpen] = useState(false);

  // Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteService, setQuoteService] = useState<Service | null>(null);

  // Selected Item Details Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check current session from cookie/JWT
  const checkSession = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUserStr = localStorage.getItem('user');
      let storedUser: User | null = null;
      if (storedUserStr) {
        try { storedUser = JSON.parse(storedUserStr); } catch (e) {}
      }

      const res = await fetch('/api/auth/me', {
        headers: {
          ...(storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {}),
          ...(storedUser ? { 'X-User-Id': storedUser.id, 'X-User-Email': storedUser.email } : {})
        }
      });
      let data: any = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {}
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else if (storedUser) {
        setUser(storedUser);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        try { setUser(JSON.parse(storedUserStr)); } catch (e) {}
      }
    }
  };

  const fetchCart = async () => {
    setIsCartLoading(true);
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartData(data);
        if (data && Array.isArray(data.items)) {
          const legacyItems = data.items.map((i: any) => ({
            id: i.id,
            productId: i.productId,
            product: {
              id: i.product.id,
              title: i.product.name,
              brand: i.product.category?.name || 'Brand',
              price: i.unitPrice,
              salePrice: i.unitPrice,
              mrp: i.unitMrp,
              stock: i.availableStock,
              stockQuantity: i.availableStock,
              images: [i.product.imageUrl],
              imageUrl: i.product.imageUrl
            },
            quantity: i.quantity,
            variantId: i.variantId,
            variant: i.variant
          }));
          setCartItems(legacyItems);
        } else {
          setCartItems([]);
        }
      } else {
        setCartData(null);
        setCartItems([]);
      }
    } catch (err) {
      console.error('Fetch cart error:', err);
    } finally {
      setIsCartLoading(false);
    }
  };

  const fetchWishlist = async () => {
    setIsWishlistLoading(true);
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlistData(data);
        if (data && Array.isArray(data.items)) {
          const ids = data.items.map((i: any) => i.productId);
          setWishlistProductIds(ids);
        } else {
          setWishlistProductIds([]);
        }
      } else {
        setWishlistData(null);
        setWishlistProductIds([]);
      }
    } catch (err) {
      console.error('Fetch wishlist error:', err);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Fetch all products for admin catalog and global store counts
  const fetchAllProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=500&includeInactive=true');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllProducts(data);
      } else if (data && Array.isArray(data.products)) {
        setAllProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching all products:', err);
    }
  };

  // Fetch initial data on boot
  const fetchData = async () => {
    try {
      await checkSession();

      // 1. Fetch Categories
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      setCategories(Array.isArray(catData) ? catData : []);

      // 1a. Fetch All Products
      await fetchAllProducts();

      // 1b. Fetch Services
      try {
        const srvRes = await fetch('/api/services');
        const srvData = await srvRes.json();
        setServices(Array.isArray(srvData) ? srvData : []);
      } catch (e) {
        console.error('Error fetching services:', e);
      }

      // 2. Fetch Coupons
      const coupRes = await fetch('/api/coupons');
      const coupData = await coupRes.json();
      setCoupons(Array.isArray(coupData) ? coupData : []);

      // 3. Fetch Emails
      const emlRes = await fetch('/api/emails');
      const emlData = await emlRes.json();
      setEmails(Array.isArray(emlData) ? emlData : []);

      // 4. Fetch Cart
      await fetchCart();

      // 5. Fetch Wishlist
      await fetchWishlist();

      // 6. Fetch User Addresses
      const addrRes = await fetch('/api/addresses');
      const addrData = await addrRes.json();
      setSavedAddresses(Array.isArray(addrData) ? addrData : []);

      // 7. Fetch Orders
      const ordRes = await fetch('/api/orders');
      const ordData = await ordRes.json();
      setUserOrders(Array.isArray(ordData) ? ordData : []);
    } catch (err) {
      console.error('Error initializing app state:', err);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAdminOpen(false);
      setCurrentView('login');
      showToast('Logged out of account');
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Handle Open Admin Dashboard
  const handleOpenAdmin = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
    setCurrentView('admin');
    setIsAdminOpen(true);
  };

  // Fetch Products whenever filters change
  const fetchFilteredProducts = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', '500');
      if (filters.categoryId) queryParams.append('category', filters.categoryId);
      if (filters.subcategoryId) queryParams.append('subcategory', filters.subcategoryId);
      if (filters.searchQuery) queryParams.append('search', filters.searchQuery);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.inStockOnly) queryParams.append('inStock', 'true');
      if (filters.onSaleOnly) queryParams.append('onSale', 'true');
      if (filters.brands && filters.brands.length > 0) {
        queryParams.append('brands', filters.brands.join(','));
      }

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen for /admin URL route
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path === '/admin/' || path.startsWith('/admin')) {
        setCurrentView('admin');
        setIsAdminOpen(true);
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  // Ensure Admin Dashboard opens when user becomes authenticated as admin on /admin view
  useEffect(() => {
    if (currentView === 'admin' && user?.role === 'ADMIN') {
      setIsAdminOpen(true);
    }
  }, [currentView, user]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [filters]);

  // Scroll to top on view route navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Wishlist Actions
  const handleToggleWishlist = async (productOrId: Product | string) => {
    const prodId = typeof productOrId === 'string' ? productOrId : productOrId.id;
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: prodId })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update wishlist');
        return;
      }
      setWishlistData(data.wishlist);
      if (data.wishlist && Array.isArray(data.wishlist.items)) {
        const ids = data.wishlist.items.map((i: any) => i.productId);
        setWishlistProductIds(ids);
      }
      showToast(data.isWishlisted ? 'Added to Wishlist!' : 'Removed from Wishlist');
    } catch (err) {
      console.error('Toggle wishlist error:', err);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist/items/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to remove from wishlist');
        throw new Error(data.error || 'Failed to remove from wishlist');
      }
      setWishlistData(data);
      if (data && Array.isArray(data.items)) {
        const ids = data.items.map((i: any) => i.productId);
        setWishlistProductIds(ids);
      }
      showToast('Removed from Wishlist');
    } catch (err: any) {
      console.error('Remove wishlist error:', err);
      throw err;
    }
  };

  const handleClearWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist', { method: 'DELETE' });
      const data = await res.json();
      setWishlistData(data);
      setWishlistProductIds([]);
      showToast('Wishlist cleared');
    } catch (err: any) {
      console.error('Clear wishlist error:', err);
      throw err;
    }
  };

  // Cart Actions
  const handleAddToCart = async (productOrId: Product | string, variantIdOrQty?: string | number, quantity = 1) => {
    const prodId = typeof productOrId === 'string' ? productOrId : productOrId.id;
    let actualVariantId: string | undefined = undefined;
    let actualQty = 1;

    if (typeof variantIdOrQty === 'number') {
      actualQty = variantIdOrQty;
    } else {
      actualVariantId = variantIdOrQty;
      actualQty = quantity;
    }

    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: prodId, variantId: actualVariantId, quantity: actualQty })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to add item to cart');
        throw new Error(data.error || 'Failed to add item to cart');
      }
      setCartData(data);
      if (data && Array.isArray(data.items)) {
        const legacyItems = data.items.map((i: any) => ({
          id: i.id,
          productId: i.productId,
          product: {
            id: i.product.id,
            title: i.product.name,
            brand: i.product.category?.name || 'Brand',
            price: i.unitPrice,
            salePrice: i.unitPrice,
            mrp: i.unitMrp,
            stock: i.availableStock,
            stockQuantity: i.availableStock,
            images: [i.product.imageUrl],
            imageUrl: i.product.imageUrl
          },
          quantity: i.quantity,
          variantId: i.variantId,
          variant: i.variant
        }));
        setCartItems(legacyItems);
      }
      showToast('Item added to Shopping Cart!');
    } catch (err: any) {
      console.error('Add to cart error:', err);
      throw err;
    }
  };

  const handleUpdateCartQuantity = async (itemIdOrProductId: string, quantity: number) => {
    let targetItemId = itemIdOrProductId;
    if (cartData && Array.isArray(cartData.items)) {
      const matched = cartData.items.find((i: any) => i.id === itemIdOrProductId || i.productId === itemIdOrProductId);
      if (matched) targetItemId = matched.id;
    }

    try {
      const res = await fetch(`/api/cart/items/${targetItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update item quantity');
        throw new Error(data.error || 'Failed to update item quantity');
      }
      setCartData(data);
      if (data && Array.isArray(data.items)) {
        const legacyItems = data.items.map((i: any) => ({
          id: i.id,
          productId: i.productId,
          product: {
            id: i.product.id,
            title: i.product.name,
            brand: i.product.category?.name || 'Brand',
            price: i.unitPrice,
            salePrice: i.unitPrice,
            mrp: i.unitMrp,
            stock: i.availableStock,
            stockQuantity: i.availableStock,
            images: [i.product.imageUrl],
            imageUrl: i.product.imageUrl
          },
          quantity: i.quantity,
          variantId: i.variantId,
          variant: i.variant
        }));
        setCartItems(legacyItems);
      }
    } catch (err: any) {
      console.error('Update cart quantity error:', err);
      throw err;
    }
  };

  const handleRemoveCartItem = async (itemIdOrProductId: string) => {
    let targetItemId = itemIdOrProductId;
    if (cartData && Array.isArray(cartData.items)) {
      const matched = cartData.items.find((i: any) => i.id === itemIdOrProductId || i.productId === itemIdOrProductId);
      if (matched) targetItemId = matched.id;
    }

    try {
      const res = await fetch(`/api/cart/items/${targetItemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to remove item');
        throw new Error(data.error || 'Failed to remove item');
      }
      setCartData(data);
      if (data && Array.isArray(data.items)) {
        const legacyItems = data.items.map((i: any) => ({
          id: i.id,
          productId: i.productId,
          product: {
            id: i.product.id,
            title: i.product.name,
            brand: i.product.category?.name || 'Brand',
            price: i.unitPrice,
            salePrice: i.unitPrice,
            mrp: i.unitMrp,
            stock: i.availableStock,
            stockQuantity: i.availableStock,
            images: [i.product.imageUrl],
            imageUrl: i.product.imageUrl
          },
          quantity: i.quantity,
          variantId: i.variantId,
          variant: i.variant
        }));
        setCartItems(legacyItems);
      }
      showToast('Item removed from Cart');
    } catch (err: any) {
      console.error('Remove cart item error:', err);
      throw err;
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await fetch('/api/cart', { method: 'DELETE' });
      const data = await res.json();
      setCartData(data);
      setCartItems([]);
      showToast('Cart cleared');
    } catch (err: any) {
      console.error('Clear cart error:', err);
      throw err;
    }
  };

  // Coupon Application
  const handleApplyCoupon = async (code: string) => {
    const subtotal = cartItems.reduce(
      (acc, item) => acc + (item.product.salePrice || item.product.price) * item.quantity,
      0
    );

    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: subtotal })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data.coupon);
        setDiscountAmount(data.discountAmount);
        return { success: true, message: `Coupon applied! Saved ₹${data.discountAmount}` };
      } else {
        return { success: false, message: data.error || 'Invalid Coupon Code' };
      }
    } catch (err) {
      return { success: false, message: 'Server error applying coupon' };
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  // Address Actions
  const handleAddNewAddress = async (addr: Partial<Address>) => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addr)
      });
      const created = await res.json();
      setSavedAddresses([...savedAddresses, created]);
      showToast('New Shipping Address Saved');
      return created;
    } catch (err) {
      console.error(err);
    }
  };

  // Order Complete Listener
  const handleOrderCompleted = async (order: Order) => {
    setUserOrders([order, ...userOrders]);
    setCartItems([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    showToast(`Order #${order.orderNumber} placed successfully!`);

    // Sync fresh email logs & products
    fetchData();
    fetchFilteredProducts();
  };

  // Wishlist products object array
  const safeProducts = Array.isArray(products) ? products : [];
  const safeWishlistIds = Array.isArray(wishlistProductIds) ? wishlistProductIds : [];
  const wishlistProducts = safeProducts.filter((p) => safeWishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Success Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-extrabold px-4 py-3 rounded-2xl shadow-2xl border border-indigo-500 flex items-center space-x-2 animate-in slide-in-from-bottom">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        currentUser={user}
        categories={categories}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlistProductIds.length}
        unreadEmailCount={emails.filter((e) => e.status === 'DELIVERED').length}
        searchQuery={filters.searchQuery || ''}
        onSearchChange={(q) => {
          setFilters({ ...filters, searchQuery: q });
          if (currentView !== 'home' && currentView !== 'shop') setCurrentView('shop');
        }}
        selectedCategoryId={filters.categoryId}
        onCategorySelect={(catId) => {
          setFilters({ ...filters, categoryId: catId, subcategoryId: undefined });
          setCurrentView('shop');
        }}
        onOpenCart={() => setCurrentView('cart')}
        onOpenWishlist={() => setCurrentView('wishlist')}
        onOpenAuth={() => setCurrentView('login')}
        onOpenProfile={() => {
          if (user) {
            setAccountSubSection('overview');
            setCurrentView('account');
          } else {
            setCurrentView('login');
          }
        }}
        onOpenEmails={() => setIsEmailInboxOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenArchDoc={() => {}}
        onQuickUserSwitch={async (role) => {
          const targetEmail = role === 'ADMIN' ? 'admin@store.com' : 'alex@example.com';
          const targetPass = role === 'ADMIN' ? 'admin123' : 'customer123';
          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: targetEmail, password: targetPass })
            });
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              await fetchCart();
              await fetchWishlist();
              showToast(`Switched account to ${role} (${data.user.name})`);
            }
          } catch (err) {
            console.error(err);
          }
        }}
        onNavigateHome={() => setCurrentView('home')}
        onNavigateShop={() => setCurrentView('shop')}
        onNavigateServices={() => setCurrentView('services')}
        onNavigateAerospace={() => {
          setFilters({ ...filters, categoryId: 'cat-aerospace-drones', subcategoryId: undefined });
          setCurrentView('aerospace');
        }}
        onNavigateAbout={() => setCurrentView('about')}
        onNavigateContact={() => setCurrentView('contact')}
        onRequestQuoteClick={() => {
          setQuoteService(null);
          setIsQuoteModalOpen(true);
        }}
        onNavigateLogin={() => setCurrentView('login')}
        onNavigateRegister={() => setCurrentView('register')}
        onNavigateAccount={() => {
          if (user) {
            setAccountSubSection('overview');
            setCurrentView('account');
          } else {
            setCurrentView('login');
          }
        }}
      />

      {/* VIEW ROUTER BODY */}
      {currentView === 'login' && (
        <LoginPage
          onLoginSuccess={(loggedUser) => {
            setUser(loggedUser);
            fetchCart();
            fetchWishlist();
            setCurrentView('home');
            showToast(`Welcome back, ${loggedUser.name}!`);
          }}
          onNavigateRegister={() => setCurrentView('register')}
          onNavigateHome={() => setCurrentView('home')}
        />
      )}

      {currentView === 'register' && (
        <RegisterPage
          onRegisterSuccess={(newUser) => {
            setUser(newUser);
            fetchCart();
            fetchWishlist();
            setCurrentView('home');
            showToast(`Account created successfully! Welcome, ${newUser.name}`);
          }}
          onNavigateLogin={() => setCurrentView('login')}
          onNavigateHome={() => setCurrentView('home')}
        />
      )}

      {currentView === 'account' && (
        <AccountDashboard
          user={user}
          currentSubSection={accountSubSection}
          onNavigateSubSection={(sec) => setAccountSubSection(sec)}
          onUpdateUserSuccess={(updatedUser) => {
            setUser(updatedUser);
            showToast('Account details updated');
          }}
          onLogout={handleLogout}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateLogin={() => setCurrentView('login')}
          onSelectOrderToTrack={(orderToTrack) => setTrackingOrder(orderToTrack)}
        />
      )}

      {currentView === 'unauthorized' && (
        <UnauthorizedPage
          onNavigateHome={() => setCurrentView('home')}
          onNavigateAccount={() => {
            setAccountSubSection('overview');
            setCurrentView('account');
          }}
          onNavigateLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'cart' && (
        <CartPage
          currentUser={user}
          cartData={cartData}
          isLoading={isCartLoading}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'wishlist' && (
        <WishlistPage
          currentUser={user}
          wishlistData={wishlistData}
          isLoading={isWishlistLoading}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCart={async (productId, variantId, quantity) => {
            const product = products.find((p) => p.id === productId);
            if (product) {
              await handleAddToCart(product, variantId, quantity || 1);
            }
          }}
          onClearWishlist={handleClearWishlist}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'admin' && (
        user?.role === 'ADMIN' ? (
          <div className="min-h-[75vh] bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white font-sans">
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg shadow-indigo-900/20">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">NEXRA Admin Portal</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                You are currently logged in as Administrator (<span className="text-emerald-400 font-mono font-bold">{user.email}</span>).
              </p>
              <div className="flex flex-wrap gap-3 justify-center pt-3">
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-900/30 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Launch Admin Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    if (window.location.pathname === '/admin') {
                      window.history.pushState(null, '', '/');
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer border border-slate-700"
                >
                  Back to Main Store
                </button>
              </div>
            </div>
          </div>
        ) : (
          <AdminLoginPage
            onLoginSuccess={(loggedUser) => {
              setUser(loggedUser);
              setIsAdminOpen(true);
              setCurrentView('admin');
              fetchCart();
              fetchWishlist();
              showToast(`Welcome Admin, ${loggedUser.name}!`);
            }}
            onNavigateHome={() => {
              setCurrentView('home');
              if (window.location.pathname === '/admin') {
                window.history.pushState(null, '', '/');
              }
            }}
          />
        )
      )}

      {currentView === 'about' && (
        <AboutPage
          onRequestQuoteClick={() => {
            setQuoteService(null);
            setIsQuoteModalOpen(true);
          }}
          onExploreServices={() => setCurrentView('services')}
        />
      )}

      {currentView === 'contact' && (
        <ContactPage
          onRequestQuoteClick={() => {
            setQuoteService(null);
            setIsQuoteModalOpen(true);
          }}
        />
      )}

      {currentView === 'services' && (
        <ServicesPage
          services={services}
          onSelectServiceForQuote={(srv) => {
            setQuoteService(srv);
            setIsQuoteModalOpen(true);
          }}
          onRequestQuoteClick={() => {
            setQuoteService(null);
            setIsQuoteModalOpen(true);
          }}
          onViewServiceDetail={(srv) => {
            setSelectedService(srv);
            setCurrentView('service-detail');
          }}
        />
      )}

      {currentView === 'service-detail' && selectedService && (
        <ServiceDetailPage
          service={selectedService}
          allServices={services}
          onRequestQuote={(srv) => {
            setQuoteService(srv);
            setIsQuoteModalOpen(true);
          }}
          onBackToServices={() => setCurrentView('services')}
          onSelectService={(srv) => setSelectedService(srv)}
        />
      )}

      {/* Home View */}
      {currentView === 'home' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          <HeroBanner
            categories={categories}
            onSelectCategory={(catId) => {
              setFilters({ ...filters, categoryId: catId });
              setCurrentView('shop');
            }}
            onExploreProducts={() => {
              setFilters({ ...filters, categoryId: undefined });
              setCurrentView('shop');
            }}
            onRequestQuoteClick={() => {
              setQuoteService(null);
              setIsQuoteModalOpen(true);
            }}
            onExploreServices={() => setCurrentView('services')}
          />
        </main>
      )}

      {/* Aerospace / Drones View */}
      {(currentView === 'aerospace' || (currentView === 'shop' && filters.categoryId === 'cat-aerospace-drones')) && (
        <main className="flex-1 w-full">
          <AerospacePage
            onRequestQuote={() => {
              setQuoteService(null);
              setIsQuoteModalOpen(true);
            }}
            onNavigateShop={() => {
              setFilters({ ...filters, categoryId: undefined });
              setCurrentView('shop');
            }}
            onNavigateContact={() => setCurrentView('contact')}
          />
        </main>
      )}

      {/* Shop View */}
      {currentView === 'shop' && filters.categoryId !== 'cat-aerospace-drones' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
          <ProductGrid
            products={products}
            categories={categories}
            filters={filters}
            onFilterChange={(newFilters) => setFilters(newFilters)}
            wishlistProductIds={wishlistProductIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        </main>
      )}

      {/* Global Footer */}
      <Footer
        onNavigateHome={() => setCurrentView('home')}
        onNavigateShop={() => setCurrentView('shop')}
        onNavigateServices={() => setCurrentView('services')}
        onNavigateAbout={() => setCurrentView('about')}
        onNavigateContact={() => setCurrentView('contact')}
        onRequestQuoteClick={() => {
          setQuoteService(null);
          setIsQuoteModalOpen(true);
        }}
      />

      {/* MODALS & DRAWERS */}

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        selectedService={quoteService}
        services={services}
        onQuoteSubmitted={(req) => {
          showToast(`Quote request #${req.id.slice(-6).toUpperCase()} submitted successfully!`);
        }}
      />

      {/* MODALS & DRAWERS */}

      {/* 1. Product Quick View Details Modal */}
      <ProductDetailsModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        isWishlisted={quickViewProduct ? wishlistProductIds.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onBuyNow={(p) => {
          handleAddToCart(p, 1);
          setIsCheckoutOpen(true);
        }}
        onSelectRelatedProduct={(p) => setQuickViewProduct(p)}
      />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        appliedCoupon={appliedCoupon}
        discountAmount={discountAmount}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* 3. Checkout Modal (Razorpay + COD) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        savedAddresses={savedAddresses}
        appliedCoupon={appliedCoupon}
        discountAmount={discountAmount}
        onAddNewAddress={handleAddNewAddress}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* 4. Order Tracking Modal */}
      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />

      {/* 5. Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* 6. User Profile & Order History Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        user={user}
        onClose={() => setIsProfileOpen(false)}
        addresses={savedAddresses}
        orders={userOrders}
        onAddNewAddress={handleAddNewAddress}
        onTrackOrder={(ord) => setTrackingOrder(ord)}
        onLogout={() => {
          handleLogout();
          setIsProfileOpen(false);
        }}
      />

      {/* 7. Auth Login / Register Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => {
          setUser(u);
          fetchCart();
          fetchWishlist();
          setIsAuthOpen(false);
          setIsProfileOpen(false);
          showToast(`Welcome back, ${u.name}!`);
        }}
      />

      {/* 8. Resend Email Logs Inspector Modal */}
      <EmailInboxModal
        isOpen={isEmailInboxOpen}
        onClose={() => setIsEmailInboxOpen(false)}
        emails={emails}
      />

      {/* 9. Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={allProducts.length > 0 ? allProducts : products}
        categories={categories}
        orders={userOrders}
        coupons={coupons}
        onRefreshData={() => {
          fetchData();
          fetchAllProducts();
          fetchFilteredProducts();
        }}
      />
    </div>
  );
}
