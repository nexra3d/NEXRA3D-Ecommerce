import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts = [],
  onRemoveFromWishlist,
  onAddToCart
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-lg font-extrabold">Your Wishlist ({wishlistProducts.length})</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3">
          {wishlistProducts.length > 0 ? (
            wishlistProducts.map((p) => (
              <div
                key={p.id}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-14 h-14 object-contain p-1 rounded-xl border border-slate-200 bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase block">{p.brand}</span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{p.title}</h4>
                    <span className="text-xs font-black text-slate-900 block mt-0.5">
                      ₹{Number(p.salePrice || p.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      onAddToCart(p);
                      onRemoveFromWishlist(p);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>

                  <button
                    onClick={() => onRemoveFromWishlist(p)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <Heart className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Your wishlist is currently empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
