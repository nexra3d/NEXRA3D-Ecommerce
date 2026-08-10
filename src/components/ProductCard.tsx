import React from 'react';
import { Heart, Star, ShoppingBag, Eye, Sparkles, Flame, ShieldAlert } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView
}) => {
  if (!product) return null;

  // Financial formatting using en-IN locale
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const sellingPrice = product.price;
  const mrp = product.mrp || product.price;
  const hasDiscount = mrp > sellingPrice;
  const discountPercent = product.discountPercentage ?? (hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);

  const stockQty = Number(product.stockQuantity ?? product.stock ?? 0);
  const lowStockThreshold = Number(product.lowStockThreshold || 5);
  const isOut = stockQty <= 0;
  const isLowStock = !isOut && stockQty <= lowStockThreshold;

  const getImageUrl = (img: any): string => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (typeof img === 'object' && img.url) return String(img.url);
    return '';
  };

  const primaryImg =
    getImageUrl(product.imageUrl) ||
    getImageUrl(product.images?.[0]) ||
    getImageUrl(product.productImages?.[0]) ||
    'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800';

  const categoryName = product.category?.name || product.brand || 'AeroCore';
  const productName = product.name || product.title || 'Product';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-cyan-500/80 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      <div>
        {/* Product Image Thumbnail */}
        <div className="relative aspect-[4/3] h-52 sm:h-56 w-full bg-slate-50 overflow-hidden cursor-pointer flex items-center justify-center p-2" onClick={() => onQuickView(product)}>
          <img
            src={primaryImg}
            alt={productName}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 items-start">
            {discountPercent > 0 && (
              <span className="bg-rose-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs backdrop-blur-md">
                {discountPercent}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Featured
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                NEW
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-indigo-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" /> Best Seller
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full border backdrop-blur-md transition-all z-10 cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm'
                : 'bg-white/80 border-slate-200 text-slate-500 hover:text-rose-500 hover:bg-white'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Quick View Hover Overlay */}
          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-white/95 backdrop-blur-md text-slate-900 font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center space-x-1.5 border border-slate-200/80">
              <Eye className="w-3.5 h-3.5 text-cyan-600" />
              <span>Quick View</span>
            </span>
          </div>
        </div>

        {/* Info Content */}
        <div className="p-4 space-y-2">
          {/* Category & Stock Status */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-700 uppercase tracking-wide truncate max-w-[60%]">
              {categoryName}
            </span>
            {isOut ? (
              <span className="text-rose-600 font-bold text-[10px] bg-rose-50 px-2 py-0.5 rounded-md">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Only {stockQty} Left
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md">
                In Stock ({stockQty})
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-bold text-slate-900 text-sm line-clamp-2 cursor-pointer hover:text-cyan-600 transition-colors leading-snug"
            title={productName}
          >
            {productName}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              {product.reviewCount && product.reviewCount > 0
                ? Number(product.rating || 0).toFixed(1)
                : '0.0'}
            </span>
            <span className="text-[11px] text-slate-400">({product.reviewCount ?? 0})</span>
          </div>
        </div>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="p-4 pt-0 space-y-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-lg font-black text-slate-900">
            {formatINR(sellingPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              {formatINR(mrp)}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            const hasVariants = (product.variants && product.variants.length > 0) || ((product as any).productVariants && (product as any).productVariants.length > 0);
            if (hasVariants) {
              onQuickView(product);
            } else {
              onAddToCart(product);
            }
          }}
          disabled={isOut}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            !isOut
              ? 'bg-slate-900 hover:bg-cyan-600 text-white shadow-xs hover:shadow-md hover:shadow-cyan-500/20'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{!isOut ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
};
