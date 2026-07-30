import React, { useEffect, useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Layers,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { Product, ProductReview, ProductVariant } from '../types';
import { useSEO } from '../hooks/useSEO';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, variantId?: string, quantity?: number) => void;
  onBuyNow: (p: Product) => void;
  onSelectRelatedProduct?: (p: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onSelectRelatedProduct
}) => {
  if (!product) return null;

  const imagesList = (product.images && product.images.length > 0)
    ? product.images
    : [product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'];

  const variantsList: ProductVariant[] = product.variants || product.productVariants || [];
  const productName = product.name || product.title || 'Product Item';
  const stockQty = product.stockQuantity ?? product.stock ?? 0;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  useSEO({
    title: `${productName} | NEXRA 3D`,
    description: product.shortDescription || product.description || `Buy ${productName} at NEXRA 3D.`,
    image: imagesList[0],
    productSchema: {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: productName,
      image: imagesList,
      description: product.shortDescription || product.description,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'NEXRA 3D'
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: selectedVariant ? selectedVariant.price : product.price,
        availability: stockQty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      }
    }
  });

  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    setSelectedVariant(variantsList[0] || null);

    try {
      const stored = localStorage.getItem('nexra_recently_viewed');
      let arr: string[] = stored ? JSON.parse(stored) : [];
      arr = arr.filter((id) => id !== product.id);
      arr.unshift(product.id);
      localStorage.setItem('nexra_recently_viewed', JSON.stringify(arr.slice(0, 10)));
    } catch {
      // ignore
    }

    setIsLoadingRelated(true);
    fetch(`/api/products/${product.id}/related?limit=4`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setRelatedProducts(data);
      })
      .catch((err) => console.error('Related products fetch error:', err))
      .finally(() => setIsLoadingRelated(false));

    fetch(`/api/products/${product.id}/reviews`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.reviews) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => console.error('Reviews fetch error:', err));
  }, [product.id, variantsList]);

  const activePrice = selectedVariant ? selectedVariant.price : Number(product.price || 0);
  const activeMrp = selectedVariant ? selectedVariant.mrp : (product.mrp ? Number(product.mrp) : activePrice);
  const activeSku = selectedVariant ? selectedVariant.sku : product.sku;
  const discountPercent = activeMrp > activePrice
    ? Math.round(((activeMrp - activePrice) / activeMrp) * 100)
    : 0;

  const formatINR = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative aspect-4/3 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 group">
                <img
                  src={imagesList[selectedImageIndex] || imagesList[0]}
                  alt={productName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-rose-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-xs z-10">
                    {discountPercent}% OFF
                  </span>
                )}

                <button
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-slate-700 rounded-xl border border-slate-200 shadow-sm backdrop-blur-md transition-opacity z-10 cursor-pointer"
                  title="Expand & Zoom Image"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-slate-800 rounded-full border border-slate-200/80 shadow-md transition-all cursor-pointer z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-slate-800 rounded-full border border-slate-200/80 shadow-md transition-all cursor-pointer z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {imagesList.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {imagesList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        selectedImageIndex === idx ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                  {product.brand || product.category?.name || 'Store Item'} • SKU: {activeSku}
                </span>
                <h1 className="text-2xl font-black text-slate-900 leading-snug">{productName}</h1>
                {product.shortDescription && (
                  <p className="text-xs text-slate-600 mt-1">{product.shortDescription}</p>
                )}
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center text-amber-400 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  <Star className="w-4 h-4 fill-amber-400 mr-1" />
                  <span className="font-extrabold text-slate-900">{product.rating || 4.8}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">{reviews.length} verified reviews</span>
              </div>

              {variantsList.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Select Variant:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {variantsList.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedVariant?.id === variant.id
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {variant.name} ({formatINR(variant.price)})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Price</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-900">{formatINR(activePrice)}</span>
                    {activeMrp > activePrice && (
                      <span className="text-sm text-slate-400 line-through">{formatINR(activeMrp)}</span>
                    )}
                  </div>
                </div>

                <div>
                  {stockQty > 0 ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{stockQty} Units In Stock</span>
                    </span>
                  ) : (
                    <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {stockQty > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-bold text-slate-700 uppercase">Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(stockQty, quantity + 1))}
                      className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onAddToCart(product, selectedVariant?.id, quantity)}
                    disabled={stockQty <= 0}
                    className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => {
                      onBuyNow(product);
                      onClose();
                    }}
                    disabled={stockQty <= 0}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 text-slate-900 fill-slate-900" />
                    <span>Buy Now</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className="flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-rose-600 transition-colors cursor-pointer py-1"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      title="Copy Product Link"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Check out ${productName} on NEXRA 3D: ${window.location.href}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors cursor-pointer"
                      title="Share on WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Genuine Warranty</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <span>10 Days Easy Returns</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Verified Store Item</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Product Details</h3>
            </div>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3">
              <p>{product.description}</p>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <tr key={index} className="border-b border-slate-200/60 last:border-none">
                        <td className="py-2.5 font-bold text-slate-600 w-1/3">{key}</td>
                        <td className="py-2.5 text-slate-900 font-semibold">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {relatedProducts.length > 0 && (
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Related Products</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map((relProd) => {
                  const relImg = relProd.imageUrl || (relProd.images && relProd.images[0]) || '';
                  return (
                    <div
                      key={relProd.id}
                      onClick={() => {
                        if (onSelectRelatedProduct) {
                          onSelectRelatedProduct(relProd);
                        }
                      }}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2 hover:border-indigo-300 transition-all cursor-pointer group"
                    >
                      <div className="aspect-4/3 bg-white rounded-xl overflow-hidden border border-slate-100">
                        <img
                          src={relImg}
                          alt={relProd.name || relProd.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {relProd.name || relProd.title}
                        </h4>
                        <span className="text-xs font-black text-slate-900 block mt-0.5">
                          {formatINR(relProd.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isZoomOpen && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 animate-in fade-in">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={imagesList[selectedImageIndex] || imagesList[0]}
            alt={productName}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
