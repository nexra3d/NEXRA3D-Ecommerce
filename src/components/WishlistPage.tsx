import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { User, Product } from '../types';

interface WishlistItemData {
  id: string;
  wishlistId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    mrp: number;
    discountPercentage: number;
    stockQuantity: number;
    imageUrl: string;
    isActive: boolean;
    hasVariants: boolean;
    category?: { id: string; name: string; slug: string } | null;
    variants?: Array<{
      id: string;
      sku: string;
      name: string;
      price: number;
      mrp: number;
      stockQuantity: number;
      attributes: any;
      isActive: boolean;
    }>;
  };
}

interface WishlistResponse {
  id: string;
  userId: string;
  items: WishlistItemData[];
  count: number;
}

interface WishlistPageProps {
  currentUser: User | null;
  wishlistData: WishlistResponse | null;
  isLoading: boolean;
  onRemoveFromWishlist: (productId: string) => Promise<void>;
  onClearWishlist: () => Promise<void>;
  onAddToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  onSelectProductForDetails?: (productId: string) => void;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  currentUser,
  wishlistData,
  isLoading,
  onRemoveFromWishlist,
  onClearWishlist,
  onAddToCart,
  onSelectProductForDetails,
  onNavigateHome,
  onNavigateLogin
}) => {
  const [movingProductId, setMovingProductId] = useState<string | null>(null);
  const [selectedVariantIds, setSelectedVariantIds] = useState<Record<string, string>>({});
  const [isClearing, setIsClearing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-6">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Sign in to View Your Wishlist</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Save your favorite items across devices, receive price drop alerts, and move products to your cart easily.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={onNavigateLogin}
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-rose-200 cursor-pointer"
            >
              Sign In to Account
            </button>
            <button
              onClick={onNavigateHome}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-6 py-3.5 rounded-2xl transition-all cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = wishlistData?.items || [];

  const handleMoveToCart = async (item: WishlistItemData) => {
    setErrorMsg(null);
    const product = item.product;

    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const selectedVarId = selectedVariantIds[product.id];
      if (!selectedVarId) {
        if (onSelectProductForDetails) {
          onSelectProductForDetails(product.id);
          return;
        } else {
          setErrorMsg(`Please select a variant for ${product.name}`);
          return;
        }
      }

      setMovingProductId(product.id);
      try {
        await onAddToCart(product.id, selectedVarId, 1);
        await onRemoveFromWishlist(product.id);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to move product to cart');
      } finally {
        setMovingProductId(null);
      }
    } else {
      setMovingProductId(product.id);
      try {
        await onAddToCart(product.id, undefined, 1);
        await onRemoveFromWishlist(product.id);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to move product to cart');
      } finally {
        setMovingProductId(null);
      }
    }
  };

  const handleRemove = async (productId: string) => {
    setErrorMsg(null);
    try {
      await onRemoveFromWishlist(productId);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to remove from wishlist');
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear your entire wishlist?')) return;
    setErrorMsg(null);
    setIsClearing(true);
    try {
      await onClearWishlist();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to clear wishlist');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <span>My Wishlist</span>
            <span className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-bold">
              {wishlistData?.count || 0} {wishlistData?.count === 1 ? 'Item' : 'Items'}
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
            <span>{isClearing ? 'Clearing...' : 'Clear Wishlist'}</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading your wishlist...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto my-8 space-y-6">
          <div className="w-20 h-20 bg-rose-50 text-rose-400 rounded-3xl flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Your Wishlist is Empty</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
              Save your favorite items here while browsing so you can easily find and purchase them later.
            </p>
          </div>
          <button
            onClick={onNavigateHome}
            className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-rose-200 cursor-pointer inline-flex items-center space-x-2"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.product;
            const isMoving = movingProductId === product.id;
            const hasVariants = product.hasVariants && Array.isArray(product.variants) && product.variants.length > 0;
            const isOutOfStock = product.stockQuantity <= 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                {/* Remove button overlay */}
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-rose-600 hover:bg-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  {/* Image banner */}
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    <img
                      src={product.imageUrl || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
                        <span className="text-xs font-black text-white uppercase bg-rose-600 px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    {product.category && (
                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                        {product.category.name}
                      </span>
                    )}

                    <h3
                      onClick={() => onSelectProductForDetails && onSelectProductForDetails(product.id)}
                      className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      {product.name}
                    </h3>

                    {/* Variant dropdown selector if variants present */}
                    {hasVariants && (
                      <div className="pt-1">
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          Select Variant:
                        </label>
                        <select
                          value={selectedVariantIds[product.id] || ''}
                          onChange={(e) =>
                            setSelectedVariantIds({
                              ...selectedVariantIds,
                              [product.id]: e.target.value
                            })
                          }
                          className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-hidden font-medium"
                        >
                          <option value="">-- Choose Variant --</option>
                          {product.variants?.map((v) => (
                            <option key={v.id} value={v.id} disabled={!v.isActive || v.stockQuantity <= 0}>
                              {v.name} - ₹{v.price} ({v.stockQuantity > 0 ? `${v.stockQuantity} left` : 'Out of stock'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline space-x-2 pt-1">
                      <span className="text-base font-black text-slate-900">
                        ₹{Number(product.price || 0).toLocaleString('en-IN')}
                      </span>
                      {product.mrp > product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{Number(product.mrp || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={isMoving || isOutOfStock}
                    className={`w-full font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isMoving ? 'Moving...' : 'Move to Cart'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
