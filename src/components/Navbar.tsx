import React, { useState, useEffect } from 'react';
import { NexraLogo } from './NexraLogo';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  SlidersHorizontal,
  Mail,
  ShieldCheck,
  Store,
  Sparkles,
  ChevronDown,
  ChevronRight,
  FileText,
  Boxes,
  Cpu,
  Layers,
  PhoneCall,
  Send,
  Menu,
  X,
  Palette,
  Clock,
  Flame,
  Award,
  Sparkle,
  Plane,
  MapPin,
  Phone
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppFloatingButton';
import { User, Category } from '../types';

interface NavbarProps {
  currentUser: User | null;
  categories: Category[];
  cartCount: number;
  wishlistCount: number;
  unreadEmailCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategoryId: string | undefined;
  onCategorySelect: (catId: string | undefined) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenEmails: () => void;
  onOpenAdmin: () => void;
  onOpenArchDoc: () => void;
  onQuickUserSwitch: (role: 'CUSTOMER' | 'ADMIN') => void;
  onNavigateHome?: () => void;
  onNavigateShop?: () => void;
  onNavigateServices?: () => void;
  onNavigateAerospace?: () => void;
  onNavigateAbout?: () => void;
  onNavigateContact?: () => void;
  onRequestQuoteClick?: () => void;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onNavigateAccount?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  categories,
  cartCount,
  wishlistCount,
  unreadEmailCount,
  searchQuery,
  onSearchChange,
  selectedCategoryId,
  onCategorySelect,
  onOpenCart,
  onOpenWishlist,
  onOpenAuth,
  onOpenProfile,
  onOpenEmails,
  onOpenAdmin,
  onOpenArchDoc,
  onQuickUserSwitch,
  onNavigateHome,
  onNavigateShop,
  onNavigateServices,
  onNavigateAerospace,
  onNavigateAbout,
  onNavigateContact,
  onRequestQuoteClick,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateAccount
}) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);

  // Search Auto Suggestions State
  const [suggestions, setSuggestions] = useState<{ id: string; title: string; slug: string; sku: string; price: number; image: string }[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('nexra_search_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const popularSearches = ['Bambu Lab X1C', 'Photopolymer SLA Resin', 'PLA Filament', 'CAD On-Demand Quote', 'Aerospace Structural Parts', 'Industrial SLS'];

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => (res.ok ? res.json() : { suggestions: [] }))
        .then((data) => {
          if (data && Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
          }
        })
        .catch(() => setSuggestions([]));
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const saveSearchHistory = (term: string) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...searchHistory.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setSearchHistory(updated);
    try {
      localStorage.setItem('nexra_search_history', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const safeCategories = Array.isArray(categories) ? categories : [];

  // Filter main categories for Mega Menu
  const mainCategories = safeCategories.filter(c =>
    ['lamps', 'key-chains', 'idols', 'home-decor', 'anime-figures', 'clocks', 'customized', '3d-printers', 'photopolymer-resins', '3d-printing-filaments'].includes(c.slug)
  );

  const displayCategories = mainCategories.length > 0 ? mainCategories : safeCategories;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs font-header relative">
      {/* Top Contact & Location Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 border-b border-slate-800 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Plot no 484, TNGOs Colony, Gachibowli, Hyderabad - 500046</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/918886149998?text=Hello%20NEXRA%203D%2C%20I%20have%20an%20inquiry%20regarding%203D%20printing%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
              <span>+91 8886149998</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://wa.me/918886159998?text=Hello%20NEXRA%203D%2C%20I%20have%20an%20inquiry%20regarding%203D%20printing%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
              <span>+91 8886159998</span>
            </a>
          </div>
        </div>
      </div>

      {/* Full Header Overlay for Expanded Search */}
      {isSearchExpanded && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Search className="w-5 h-5 text-indigo-600 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery) {
                    saveSearchHistory(searchQuery);
                    if (onNavigateShop) onNavigateShop();
                    setIsSearchExpanded(false);
                  }
                  if (e.key === 'Escape') setIsSearchExpanded(false);
                }}
                placeholder="Search 3D printers, SLA resins, filaments, SKU (e.g. PRN-X1C), or services..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-900 text-sm sm:text-base rounded-xl px-4 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-xs text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer shrink-0"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsSearchExpanded(false)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer shrink-0"
                title="Close Search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto Suggestions List */}
            {suggestions.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-2 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 px-2 tracking-wider">Matching Products</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        saveSearchHistory(s.title);
                        onSearchChange(s.title);
                        if (onNavigateShop) onNavigateShop();
                        setIsSearchExpanded(false);
                      }}
                      className="flex items-center gap-3 p-2 bg-white hover:bg-indigo-50 rounded-xl border border-slate-200/60 cursor-pointer transition-colors group"
                    >
                      {s.image && (
                        <img src={s.image} alt={s.title} className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                      )}
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-1 block">{s.title}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">SKU: {s.sku} • ₹{Number(s.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches & Search History Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
              <span className="font-bold text-slate-500 flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Popular:
              </span>
              {popularSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => {
                    saveSearchHistory(term);
                    onSearchChange(term);
                    if (onNavigateShop) onNavigateShop();
                    setIsSearchExpanded(false);
                  }}
                  className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>

            {searchHistory.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs border-t border-slate-100 pt-2">
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Recent Searches:</span>
                {searchHistory.map((hist, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onSearchChange(hist);
                      if (onNavigateShop) onNavigateShop();
                      setIsSearchExpanded(false);
                    }}
                    className="bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-[11px] font-medium px-2 py-0.5 rounded-md cursor-pointer"
                  >
                    {hist}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-1 sm:gap-4">
          {/* NEXRA 3D Brand Logo */}
          <div className="flex items-center space-x-3 sm:space-x-6 shrink-0">
            <button
              onClick={onNavigateHome || (() => onCategorySelect(undefined))}
              className="flex items-center text-left group cursor-pointer hover:opacity-90 transition-opacity shrink-0"
            >
              <NexraLogo size="md" />
            </button>

            {/* Primary Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 text-xs font-bold text-slate-700 relative">
              <button
                onClick={onNavigateHome}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                HOME
              </button>

              {/* SHOP Mega Menu trigger */}
              <div
                className="relative"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    if (onNavigateShop) onNavigateShop();
                    else onCategorySelect(undefined);
                  }}
                  className={`px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1 ${
                    isMegaMenuOpen ? 'bg-slate-100 text-slate-900' : ''
                  }`}
                >
                  <span>SHOP</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega Menu Dropdown */}
                {isMegaMenuOpen && (
                  <div className="absolute left-0 top-full pt-1 w-[800px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 grid grid-cols-4 gap-6">
                      <div className="col-span-3 grid grid-cols-3 gap-6">
                        {displayCategories.map((cat) => (
                          <div key={cat.id} className="space-y-2">
                            <button
                              onClick={() => {
                                onCategorySelect(cat.id);
                                setIsMegaMenuOpen(false);
                              }}
                              className="font-extrabold text-slate-900 hover:text-cyan-600 text-sm flex items-center justify-between w-full text-left group"
                            >
                              <span>{cat.name}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 transition-transform group-hover:translate-x-0.5" />
                            </button>
                            {cat.subcategories && cat.subcategories.length > 0 ? (
                              <ul className="space-y-1">
                                {cat.subcategories.slice(0, 4).map((sub) => (
                                  <li key={sub.id}>
                                    <button
                                      onClick={() => {
                                        onCategorySelect(cat.id);
                                        setIsMegaMenuOpen(false);
                                      }}
                                      className="text-[11px] text-slate-500 hover:text-slate-900 transition-colors text-left block w-full py-0.5"
                                    >
                                      {sub.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      {/* Mega Menu Featured CTA Banner */}
                      <div className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <h4 className="font-extrabold text-sm leading-snug">
                            Customized 3D Printing
                          </h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Have a custom design or CAD model? Upload your specs for instant manufacturing quote.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            if (onRequestQuoteClick) onRequestQuoteClick();
                            setIsMegaMenuOpen(false);
                          }}
                          className="mt-4 w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Get Instant Quote</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onNavigateServices}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                SERVICES
              </button>

              <button
                onClick={() => {
                  if (onNavigateAerospace) onNavigateAerospace();
                  else onCategorySelect('cat-aerospace-drones');
                }}
                className="px-2.5 py-2 rounded-lg hover:bg-cyan-50 text-cyan-700 hover:text-cyan-900 transition-colors cursor-pointer flex items-center gap-1.5 font-extrabold"
                title="Aerospace Additive Solutions"
              >
                <Plane className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span>AEROSPACE</span>
              </button>

              <button
                onClick={onNavigateAbout}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                ABOUT
              </button>

              <button
                onClick={onNavigateContact}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                CONTACT
              </button>
            </nav>
          </div>

          {/* Desktop Inline Search Bar Trigger */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-2">
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="w-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-2xl px-3.5 py-2 text-left flex items-center gap-2 text-xs text-slate-400 font-medium transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">Search products & services...</span>
            </button>
          </div>

          {/* Action Icons & User Controls (Always Visible & Fully Responsive) */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="md:hidden p-1.5 text-slate-600 hover:text-cyan-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Request Quote Button */}
            <button
              onClick={onRequestQuoteClick}
              className="hidden lg:flex items-center space-x-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Get Quote</span>
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={onOpenWishlist}
              className="relative p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[9px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all shadow-xs cursor-pointer border border-slate-800 shrink-0"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold">{cartCount}</span>
            </button>

            {/* Admin Dashboard button - Only visible when Admin is logged in */}
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={onOpenAdmin}
                className="p-1.5 sm:px-2.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden xl:inline text-xs font-extrabold text-emerald-400">ADMIN</span>
              </button>
            )}

            {/* Logged In Account Controls */}
            {currentUser ? (
              <button
                onClick={onNavigateAccount || onOpenProfile}
                className="flex items-center p-1 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 shrink-0"
                title="Manage Account Profile"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-900 text-cyan-400 font-black flex items-center justify-center text-[11px] sm:text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
              </button>
            ) : (
              <button
                onClick={onNavigateLogin || onOpenAuth}
                className="p-1.5 sm:px-2.5 sm:py-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Log In / Register"
              >
                <UserIcon className="w-4 h-4 text-slate-600" />
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer shrink-0"
              title="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-4 space-y-4 animate-in fade-in duration-200">
            {/* Mobile Search */}
            <div className="relative px-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-slate-100 border border-slate-200 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-hidden"
              />
            </div>

            {/* Mobile Primary Nav Links */}
            <div className="space-y-1 px-2 text-sm font-extrabold text-slate-800">
              <button
                onClick={() => {
                  if (onNavigateHome) onNavigateHome();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                HOME
              </button>

              <button
                onClick={() => {
                  if (onNavigateShop) onNavigateShop();
                  else onCategorySelect(undefined);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                ALL PRODUCTS
              </button>

              {/* Mobile Category Accordion */}
              <div className="pt-2 border-t border-slate-100">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1">
                  Product Categories
                </p>
                {displayCategories.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <button
                      onClick={() => setExpandedMobileCat(expandedMobileCat === cat.id ? null : cat.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg"
                    >
                      <span>{cat.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedMobileCat === cat.id ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedMobileCat === cat.id && (
                      <div className="pl-6 space-y-1 pb-2">
                        <button
                          onClick={() => {
                            onCategorySelect(cat.id);
                            if (onNavigateShop) onNavigateShop();
                            setIsMobileMenuOpen(false);
                          }}
                          className="block text-xs font-bold text-cyan-600 hover:underline py-1"
                        >
                          View All {cat.name}
                        </button>
                        {cat.subcategories?.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              onCategorySelect(cat.id);
                              if (onNavigateShop) onNavigateShop();
                              setIsMobileMenuOpen(false);
                            }}
                            className="block text-xs text-slate-500 hover:text-slate-900 py-1"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (onNavigateServices) onNavigateServices();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                SERVICES
              </button>

              <button
                onClick={() => {
                  if (onNavigateAerospace) onNavigateAerospace();
                  else onCategorySelect('cat-aerospace-drones');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-50 text-cyan-700 font-extrabold flex items-center gap-2"
              >
                <Plane className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>AEROSPACE</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateAbout) onNavigateAbout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                ABOUT US
              </button>

              <button
                onClick={() => {
                  if (onNavigateContact) onNavigateContact();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                CONTACT
              </button>
            </div>
          </div>
        )}
    </header>
  );
};
