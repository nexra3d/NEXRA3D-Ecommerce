import React, { useState, useEffect } from 'react';
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
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Layers,
  ArrowRight,
  Share2,
  Copy,
  Check,
  ThumbsUp,
  Flag,
  Filter
} from 'lucide-react';
import { Product, ProductReview, ProductVariant } from '../types';
import { useSEO } from '../hooks/useSEO';
import { isNameKeychainProduct } from '../lib/personalization';

interface LampOptionItem {
  id: string;
  value: string;
  priceDelta: number;
  sortOrder: number;
  isActive: boolean;
}

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, variantId?: string, quantity?: number, customizationText?: string, selectedColour?: string, selectedWattage?: string) => void;
  onBuyNow: (p: Product, customizationText?: string, selectedColour?: string, selectedWattage?: string) => void;
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
  const rawImages = product?.images && product.images.length > 0
    ? product.images
    : ((product as any)?.productImages && (product as any).productImages.length > 0 ? (product as any).productImages : []);

  const imagesList: string[] = rawImages.length > 0
    ? rawImages.map((img: any) => typeof img === 'string' ? img : (img?.url || '')).filter(Boolean)
    : [product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'];

  const variantsList: ProductVariant[] = product?.variants || product?.productVariants || [];

  const productName = product?.name || product?.title || 'Product Item';
  const stockQty = product?.stockQuantity ?? product?.stock ?? 0;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Related products state
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [ratingSummary, setRatingSummary] = useState({
    averageRating: (product?.reviewCount && product?.reviewCount > 0) ? (product?.rating || 0) : 0,
    totalCount: product?.reviewCount || 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>
  });
  const [starFilter, setStarFilter] = useState<number | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmittedMsg, setReviewSubmittedMsg] = useState(false);
  const [customizationText, setCustomizationText] = useState('');
  const needsCustomization = product ? isNameKeychainProduct(product) : false;

  // SEO Hook
  useSEO({
    title: product ? `${productName} | NEXRA 3D` : 'NEXRA 3D',
    description: product?.shortDescription || product?.description || `Buy ${productName} at NEXRA 3D.`,
    image: imagesList[0],
    productSchema: product ? {
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
    } : undefined
  });

  // Track Recently Viewed & Fetch Reviews
  useEffect(() => {
    if (!product) return;
    setSelectedImageIndex(0);
    setQuantity(1);
    if (variantsList.length > 0) {
      setSelectedVariant(variantsList[0]);
    } else {
      setSelectedVariant(null);
    }

    // Reset reviews state immediately for new product
    setReviews([]);
    setRatingSummary({
      averageRating: (product.reviewCount && product.reviewCount > 0) ? Number(product.rating || 0) : 0,
      totalCount: product.reviewCount || 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });

    // Save to localStorage recently viewed
    try {
      const stored = localStorage.getItem('nexra_recently_viewed');
      let arr: string[] = stored ? JSON.parse(stored) : [];
      arr = arr.filter((id) => id !== product.id);
      arr.unshift(product.id);
      localStorage.setItem('nexra_recently_viewed', JSON.stringify(arr.slice(0, 10)));
    } catch (e) {
      // ignore
    }

    // Fetch related products
    setIsLoadingRelated(true);
    fetch(`/api/products/${product.id}/related?limit=4`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setRelatedProducts(data);
      })
      .catch((err) => console.error('Related products fetch error:', err))
      .finally(() => setIsLoadingRelated(false));

    // Fetch Reviews
    fetch(`/api/products/${product.id}/reviews`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const revs = Array.isArray(data) ? data : (data.reviews || []);
          setReviews(revs);
          if (data.summary) {
            setRatingSummary(data.summary);
          } else if (revs.length > 0) {
            const avg = Number((revs.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / revs.length).toFixed(1));
            setRatingSummary({ averageRating: avg, totalCount: revs.length, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
          } else {
            setRatingSummary({ averageRating: (product.reviewCount && product.reviewCount > 0) ? Number(product.rating || 0) : 0, totalCount: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
          }
        }
      })
      .catch((err) => console.error('Reviews fetch error:', err));
  }, [product?.id]);

  useEffect(() => {
    if (product) {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('product') !== product.id) {
        currentUrl.searchParams.set('product', product.id);
        window.history.replaceState(null, '', currentUrl.toString());
      }
    }
  }, [product?.id]);

  const isLampProduct = (product?.category?.name || '').toLowerCase().includes('lamp') ||
    (product?.name || '').toLowerCase().includes('lamp') ||
    variantsList.some((v) => v.colour || v.wattage || (v.attributes as any)?.colour || (v.attributes as any)?.wattage);

  const [dbColours, setDbColours] = useState<LampOptionItem[]>([]);
  const [dbWattages, setDbWattages] = useState<LampOptionItem[]>([]);
  const [hasLoadedDbOptions, setHasLoadedDbOptions] = useState<boolean>(false);
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [selectedWattage, setSelectedWattage] = useState<string>('');

  useEffect(() => {
    if (!product?.id) {
      setDbColours([]);
      setDbWattages([]);
      setHasLoadedDbOptions(true);
      setSelectedColour('');
      setSelectedWattage('');
      return;
    }

    const controller = new AbortController();

    // CLEAR OLD OPTIONS IMMEDIATELY when product changes to prevent retaining previous product's options
    setDbColours([]);
    setDbWattages([]);
    setHasLoadedDbOptions(false);
    setSelectedColour('');
    setSelectedWattage('');

    fetch(`/api/products/${encodeURIComponent(product.id)}/lamp-options`, {
      signal: controller.signal
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && (Array.isArray(data.colours) || Array.isArray(data.wattages))) {
          const fetchedColours: LampOptionItem[] = Array.isArray(data.colours) ? data.colours : [];
          const fetchedWattages: LampOptionItem[] = Array.isArray(data.wattages) ? data.wattages : [];
          setDbColours(fetchedColours);
          setDbWattages(fetchedWattages);
          setHasLoadedDbOptions(true);

          if (fetchedColours.length > 0) {
            setSelectedColour(fetchedColours[0].value);
          } else {
            setSelectedColour('');
          }

          if (fetchedWattages.length > 0) {
            setSelectedWattage(fetchedWattages[0].value);
          } else {
            setSelectedWattage('');
          }
        } else {
          setDbColours([]);
          setDbWattages([]);
          setHasLoadedDbOptions(true);
          setSelectedColour('');
          setSelectedWattage('');
        }
      })
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          console.warn('[LAMP OPTIONS] Error loading lamp options:', err);
          setDbColours([]);
          setDbWattages([]);
          setHasLoadedDbOptions(true);
          setSelectedColour('');
          setSelectedWattage('');
        }
      });

    return () => {
      controller.abort();
    };
  }, [product?.id]);

  // Extract options strictly belonging to variants of THIS product if DB options aren't present
  const availableColoursFromVariants = Array.from(
    new Set(
      variantsList
        .map((v) => v.colour || (v.attributes as any)?.colour)
        .filter(Boolean) as string[]
    )
  );

  const availableWattagesFromVariants = Array.from(
    new Set(
      variantsList
        .map((v) => v.wattage || (v.attributes as any)?.wattage)
        .filter(Boolean) as string[]
    )
  );

  const colourOptionsList: LampOptionItem[] = (hasLoadedDbOptions && dbColours.length > 0)
    ? dbColours
    : availableColoursFromVariants.map((c, idx) => ({
        id: `col-${idx}`,
        value: c,
        priceDelta: c.toUpperCase().includes('RGB') ? 200 : 0,
        sortOrder: idx + 1,
        isActive: true
      }));

  const wattageOptionsList: LampOptionItem[] = (hasLoadedDbOptions && dbWattages.length > 0)
    ? dbWattages
    : availableWattagesFromVariants.map((w, idx) => {
        let delta = 0;
        const upper = w.toUpperCase().trim();
        if (upper === '7W') delta = 100;
        else if (upper === '9W' || upper.includes('9W')) delta = 150;
        else if (upper === '12W' || upper.includes('12W')) delta = 200;
        else if (upper === '15W' || upper.includes('15W')) delta = 250;
        else if (upper.includes('3IN1') || upper.includes('3-IN-1')) delta = 25;
        else if (upper === '4W') delta = 30;
        return {
          id: `wat-${idx}`,
          value: w,
          priceDelta: delta,
          sortOrder: idx + 1,
          isActive: true
        };
      });

  useEffect(() => {
    if (colourOptionsList.length > 0 && (!selectedColour || !colourOptionsList.some((c) => c.value === selectedColour))) {
      setSelectedColour(colourOptionsList[0].value);
    }
  }, [colourOptionsList]);

  useEffect(() => {
    if (wattageOptionsList.length > 0 && (!selectedWattage || !wattageOptionsList.some((w) => w.value === selectedWattage))) {
      setSelectedWattage(wattageOptionsList[0].value);
    }
  }, [wattageOptionsList]);

  // Sync selected variant when colour or wattage changes
  useEffect(() => {
    if (variantsList.length > 0) {
      const match = variantsList.find(
        (v) =>
          (v.colour === selectedColour || (v.attributes as any)?.colour === selectedColour) &&
          (v.wattage === selectedWattage || (v.attributes as any)?.wattage === selectedWattage)
      );
      if (match) {
        setSelectedVariant(match);
      } else if (!selectedVariant) {
        setSelectedVariant(variantsList[0]);
      }
    }
  }, [selectedColour, selectedWattage, variantsList]);

  if (!product) return null;

  const currentColourItem = colourOptionsList.find((c) => c.value === selectedColour);
  const currentWattageItem = wattageOptionsList.find((w) => w.value === selectedWattage);

  const colourDelta = currentColourItem ? Number(currentColourItem.priceDelta) : 0;
  const wattageDelta = currentWattageItem ? Number(currentWattageItem.priceDelta) : 0;

  const calculatedBasePrice = Number(product.price || 0);
  const activePrice = (selectedVariant ? Number(selectedVariant.price) : calculatedBasePrice) + colourDelta + wattageDelta;
  const activeMrp = (selectedVariant ? Number(selectedVariant.mrp) : (product.mrp ? Number(product.mrp) : calculatedBasePrice)) + colourDelta + wattageDelta;
  const activeSku = selectedVariant ? selectedVariant.sku : (product.sku || 'NX-LMP-SPRL');

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const shareUrl = typeof window !== 'undefined' && product ? `${window.location.origin}/?product=${product.id}` : '';

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const handleCopyLink = () => {
    const urlToCopy = shareUrl || window.location.href;
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddCustomProduct = () => {
    if (!product) return;
    if (needsCustomization && !customizationText.trim()) {
      return;
    }
    onAddToCart(product, selectedVariant?.id, quantity, customizationText.trim(), selectedColour, selectedWattage);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: newReviewRating,
          title: newReviewTitle,
          comment: newReviewComment,
          userName: newReviewName
        })
      });

      const data = await res.json();
      const createdReview = data.review || (data.id ? data : null);
      if (res.ok && createdReview) {
        const updatedRevs = [createdReview, ...reviews];
        setReviews(updatedRevs);
        const newAvg = Number((updatedRevs.reduce((acc, r) => acc + (r.rating || 5), 0) / updatedRevs.length).toFixed(1));
        setRatingSummary({
          averageRating: newAvg,
          totalCount: updatedRevs.length,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
        setNewReviewName('');
        setNewReviewTitle('');
        setNewReviewComment('');
        setReviewSubmittedMsg(true);
        setTimeout(() => setReviewSubmittedMsg(false), 3500);
      }
    } catch (err) {
      console.error('Submit review error:', err);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.helpfulCount !== undefined) {
        setReviews(reviews.map((r) => r.id === reviewId ? { ...r, helpfulCount: data.helpfulCount } : r));
      }
    } catch (e) {
      // ignore
    }
  };

  const handleReportReview = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/report`, { method: 'POST' });
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (e) {
      // ignore
    }
  };

  // Filter & Sort reviews
  const filteredReviews = reviews.filter((r) => {
    if (starFilter !== 'ALL' && r.rating !== starFilter) return false;
    if (verifiedOnly && !r.verifiedPurchase) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    if (sortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const discountPercent = activeMrp > activePrice
    ? Math.round(((activeMrp - activePrice) / activeMrp) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Main Top Grid: Gallery + Purchasing Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Image Gallery with Controls & Zoom */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] min-h-[260px] w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 group flex items-center justify-center p-2">
                <img
                  src={imagesList[selectedImageIndex] || imagesList[0]}
                  alt={productName}
                  className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />

                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-rose-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-xs z-10">
                    {discountPercent}% OFF
                  </span>
                )}

                {/* Zoom Trigger Button */}
                <button
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-slate-700 rounded-xl border border-slate-200 shadow-sm backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                  title="Expand & Zoom Image"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Next / Previous Gallery Nav */}
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

              {/* Thumbnail Gallery Bar */}
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
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Title, Rating, Price, Variants, Stock & Actions */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                  {product.brand || product.category?.name || 'Store Item'} • SKU: {activeSku}
                </span>
                <h1 className="text-2xl font-black text-slate-900 leading-snug">
                  {productName}
                </h1>
                {product.shortDescription && (
                  <p className="text-xs text-slate-600 mt-1">{product.shortDescription}</p>
                )}
              </div>

              {/* Rating & Reviews summary */}
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center text-amber-400 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  <Star className="w-4 h-4 fill-amber-400 mr-1" />
                  <span className="font-extrabold text-slate-900">
                    {reviews.length > 0
                      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                      : (product.reviewCount && product.reviewCount > 0 ? (product.rating || 0).toFixed(1) : '0.0')}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium">({reviews.length} Verified Customer Reviews)</span>
              </div>

              {/* Lamp Options or Standard Variant Selector */}
              {isLampProduct ? (
                <div className="space-y-4 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                  {!hasLoadedDbOptions ? (
                    <div className="text-xs text-slate-500 font-medium animate-pulse py-2 px-1">
                      Loading product options...
                    </div>
                  ) : colourOptionsList.length === 0 && wattageOptionsList.length === 0 ? (
                    <div className="text-xs text-slate-500 font-medium italic py-1 px-1">
                      No customizable lamp options configured for this product.
                    </div>
                  ) : (
                    <>
                      {/* Lamp Colour Selector */}
                      {colourOptionsList.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Lamp Light Colour:</span>
                            </span>
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              {selectedColour || 'Default'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {colourOptionsList.map((colObj) => {
                              const col = colObj.value;
                              const isSel = selectedColour === col;
                              let bgDot = 'bg-amber-300';
                              if (col.toLowerCase().includes('cool')) bgDot = 'bg-sky-200';
                              if (col.toLowerCase().includes('neutral')) bgDot = 'bg-orange-100';
                              if (col.toLowerCase().includes('rgb')) bgDot = 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500';

                              return (
                                <button
                                  key={colObj.id || col}
                                  type="button"
                                  onClick={() => setSelectedColour(col)}
                                  className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                                    isSel
                                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                                  }`}
                                >
                                  <span className={`w-3 h-3 rounded-full shrink-0 ${bgDot} border border-slate-300`} />
                                  <span className="truncate">{col}</span>
                                  {Number(colObj.priceDelta) > 0 && (
                                    <span className={`text-[10px] ml-auto px-1 rounded ${isSel ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                                      +₹{colObj.priceDelta}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Bulb Wattage Selector */}
                      {wattageOptionsList.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span>Bulb Wattage Option:</span>
                            </span>
                            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                              {selectedWattage || 'Default'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {wattageOptionsList.map((wattObj) => {
                              const watt = wattObj.value;
                              const isSel = selectedWattage === watt;
                              const delta = Number(wattObj.priceDelta || 0);
                              return (
                                <button
                                  key={wattObj.id || watt}
                                  type="button"
                                  onClick={() => setSelectedWattage(watt)}
                                  className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                                    isSel
                                      ? 'bg-amber-500 border-amber-500 text-slate-950 font-black shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                                  }`}
                                >
                                  <div>{watt}</div>
                                  <div className="text-[10px] font-normal opacity-80">
                                    {delta === 0 ? 'Included' : delta > 0 ? `+₹${delta}` : `-₹${Math.abs(delta)}`}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : variantsList.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Select Variant:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {variantsList.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedVariant?.id === v.id
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {v.name} ({formatINR(v.price)})
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Price Display */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Price</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-900">
                      {formatINR(activePrice)}
                    </span>
                    {activeMrp > activePrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatINR(activeMrp)}
                      </span>
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

              {/* Quantity Selector */}
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

              {needsCustomization && (
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-slate-700">Name for keychain</label>
                  <input
                    type="text"
                    value={customizationText}
                    onChange={(e) => setCustomizationText(e.target.value.slice(0, 20))}
                    placeholder="Enter name"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Main CTA Buttons */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddCustomProduct}
                    disabled={stockQty <= 0 || (needsCustomization && !customizationText.trim())}
                    className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => {
                      if (needsCustomization && !customizationText.trim()) return;
                      onBuyNow(product, customizationText.trim(), selectedColour, selectedWattage);
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
            </div>
          </div>

          {/* Bottom Tabs: Overview, Specifications, Reviews */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex space-x-4 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-3 text-xs font-extrabold uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
                  activeTab === 'description' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-xs font-extrabold uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
                  activeTab === 'specs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-xs font-extrabold uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
                  activeTab === 'reviews' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'description' && (
              <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                <p>{product.description}</p>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {product.tags.map((tag, i) => (
                      <span key={i} className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {Object.entries(product.specifications || {}).map(([key, val], i) => (
                      <tr key={i} className="border-b border-slate-200/60 last:border-none">
                        <td className="py-2.5 font-bold text-slate-600 w-1/3">{key}</td>
                        <td className="py-2.5 text-slate-900 font-semibold">{String(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Rating Summary Header */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="text-center md:border-r md:border-slate-200 pr-2">
                    <span className="text-4xl font-black text-slate-900 block tracking-tight">
                      {reviews.length > 0
                        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                        : (product.reviewCount && product.reviewCount > 0 ? (product.rating || 0).toFixed(1) : '0.0')}
                    </span>
                    <div className="flex justify-center text-amber-400 my-1">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const avgVal = reviews.length > 0
                          ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
                          : (product.reviewCount && product.reviewCount > 0 ? (product.rating || 0) : 0);
                        return (
                          <Star
                            key={idx}
                            className={`w-4 h-4 ${idx < Math.round(avgVal) ? 'fill-amber-400' : 'text-slate-300'}`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Based on {reviews.length} verified reviews
                    </span>
                  </div>

                  {/* Rating Bars Breakdown */}
                  <div className="space-y-1.5 md:col-span-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length;
                      const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center text-xs space-x-2">
                          <span className="w-12 font-bold text-slate-600">{star} Stars</span>
                          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-slate-500 text-[10px]">{percent}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Filters & Sorting Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-2xl">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" />
                      Filter:
                    </span>
                    {(['ALL', 5, 4, 3, 2, 1] as const).map((star) => (
                      <button
                        key={star}
                        onClick={() => setStarFilter(star)}
                        className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-colors cursor-pointer ${
                          starFilter === star
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {star === 'ALL' ? 'All' : `${star} ★`}
                      </button>
                    ))}
                    <label className="flex items-center gap-1.5 ml-2 cursor-pointer text-slate-700 text-[11px] font-bold">
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Verified Buyers Only</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-1 focus:outline-hidden"
                    >
                      <option value="newest">Newest First</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                      <option value="helpful">Most Helpful</option>
                    </select>
                  </div>
                </div>

                {/* List Reviews */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {filteredReviews.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl">
                      No reviews match your selected filter criteria.
                    </div>
                  ) : (
                    filteredReviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-amber-400">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={`w-3.5 h-3.5 ${idx < rev.rating ? 'fill-amber-400' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                          {rev.title && (
                            <span className="text-xs font-bold text-slate-900">{rev.title}</span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                        {/* Review Helpful & Report Action Row */}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-200/50">
                          <button
                            onClick={() => handleHelpfulVote(rev.id)}
                            className="flex items-center space-x-1 text-slate-500 hover:text-indigo-600 font-semibold cursor-pointer transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful ({rev.helpfulCount || 0})</span>
                          </button>
                          <button
                            onClick={() => handleReportReview(rev.id)}
                            className="flex items-center space-x-1 text-slate-400 hover:text-rose-600 font-semibold cursor-pointer transition-colors"
                          >
                            <Flag className="w-3 h-3" />
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Write Review Form */}
                <form onSubmit={handleAddReview} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                    <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
                    <span>Write a Verified Customer Review</span>
                  </h4>

                  {reviewSubmittedMsg && (
                    <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Thank you! Your review has been published with verified status.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                    />

                    <input
                      type="text"
                      placeholder="Headline / Review Title"
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                    />

                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value={5}>5 Stars (Excellent)</option>
                      <option value={4}>4 Stars (Good)</option>
                      <option value={3}>3 Stars (Average)</option>
                      <option value={2}>2 Stars (Poor)</option>
                      <option value={1}>1 Star (Bad)</option>
                    </select>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Share your technical experience with build quality, printing speed, material compatibility..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Submit Customer Review
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Section 11: Related Products */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Related Products</span>
              </h3>
            </div>

            {isLoadingRelated ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-slate-100 rounded-2xl h-44"></div>
                ))}
              </div>
            ) : relatedProducts.length > 0 ? (
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
                      <div className="aspect-[4/3] min-h-[100px] w-full bg-white rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center p-1">
                        <img
                          src={relImg}
                          alt={relProd.name || relProd.title}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
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
            ) : (
              <p className="text-xs text-slate-400 italic">No other related products in this category.</p>
            )}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal Overlay */}
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
