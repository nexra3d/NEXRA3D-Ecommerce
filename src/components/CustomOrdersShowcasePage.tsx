import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Star,
  Search,
  MessageSquare,
  CheckCircle2,
  Send,
  RefreshCw,
  ZoomIn,
  X,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { PublicCustomOrder, PublicCustomOrderReview } from '../types';

interface CustomOrdersShowcasePageProps {
  onRequestQuoteClick: () => void;
  onNavigateHome: () => void;
}

export const CustomOrdersShowcasePage: React.FC<CustomOrdersShowcasePageProps> = ({
  onRequestQuoteClick,
  onNavigateHome
}) => {
  const [orders, setOrders] = useState<PublicCustomOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected order for Lightbox / Details
  const [selectedOrder, setSelectedOrder] = useState<PublicCustomOrder | null>(null);

  // Review submission modal state
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [targetOrderId, setTargetOrderId] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPublicShowcase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/custom-orders/public');
      if (!res.ok) {
        throw new Error('Failed to load custom creations');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err: any) {
      console.error('Error loading custom orders showcase:', err);
      setError('Unable to load custom orders showcase right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicShowcase();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatches = (order.customOrderName || '').toLowerCase().includes(query);
    const reviewMatches = (order.reviews || []).some((r) =>
      (r.comment || '').toLowerCase().includes(query) || (r.reviewerName || '').toLowerCase().includes(query)
    );
    return nameMatches || reviewMatches;
  });

  const handleOpenReviewModal = (orderId?: string) => {
    const selectedId = orderId || (orders.length > 0 ? orders[0].id : '');
    setTargetOrderId(selectedId);
    setReviewerName('');
    setReviewRating(5);
    setReviewComment('');
    setReviewMessage(null);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOrderId.trim()) {
      setReviewMessage({ type: 'error', text: 'Please select a custom creation to review.' });
      return;
    }
    if (!reviewerName.trim() || reviewerName.trim().length < 2) {
      setReviewMessage({ type: 'error', text: 'Please enter your Name (at least 2 characters).' });
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      setReviewMessage({ type: 'error', text: 'Please enter your Review (at least 5 characters).' });
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage(null);

    try {
      const res = await fetch(`/api/custom-orders/${targetOrderId.trim()}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewerName.trim(),
          rating: reviewRating,
          review: reviewComment.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setReviewMessage({
        type: 'success',
        text: data.message || 'Thank you! Your review has been submitted for moderation and will appear once approved.'
      });

      setReviewerName('');
      setReviewComment('');

      setTimeout(() => {
        setShowReviewModal(false);
      }, 2500);
    } catch (err: any) {
      setReviewMessage({ type: 'error', text: err.message || 'Error submitting review.' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Helper for rendering star rating
  const renderStars = (rating: number, max: number = 5) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: max }).map((_, idx) => (
          <Star
            key={idx}
            className={`w-3.5 h-3.5 ${
              idx < Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300 dark:text-slate-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Banner / Breadcrumb Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bespoke 3D Manufacturing Gallery</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Custom Orders Showcase
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                Explore custom manufactured 3D items, functional engineering prototypes, personalized lithophanes, and architectural creations crafted by NEXRA 3D.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenReviewModal()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-cyan-500" />
                <span>Write a Review</span>
              </button>
              <button
                onClick={onRequestQuoteClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-extrabold shadow-sm shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Get a Custom Quote</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search custom creations by name or feedback..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 sm:ml-auto">
              Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'creation' : 'creations'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading bespoke 3D creations...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/30 p-8 shadow-xs max-w-lg mx-auto">
            <p className="text-sm font-semibold text-rose-500 mb-4">{error}</p>
            <button
              onClick={fetchPublicShowcase}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredOrders.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {searchQuery ? 'No matching custom creations' : 'Custom Gallery Updating'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No custom orders found matching "${searchQuery}". Try a different keyword.`
                : 'Check back soon as our team uploads new bespoke 3D projects and verified client reviews.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={onRequestQuoteClick}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Order a Custom Print Now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && !error && filteredOrders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredOrders.map((order) => {
              const reviews = order.reviews || [];
              const avgRating =
                reviews.length > 0
                  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                  : 5;

              return (
                <div
                  key={order.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-xs hover:shadow-lg hover:border-cyan-500/40 dark:hover:border-cyan-500/30 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* 1. Custom Order Picture/Image Container */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-850 overflow-hidden flex items-center justify-center">
                    {order.imageUrl ? (
                      <img
                        src={order.imageUrl}
                        alt={order.customOrderName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          // Hide broken image link gracefully without loading fake stock photos
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6 text-center">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50 text-cyan-500/60" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Custom 3D Print</span>
                        <span className="text-[10px] text-slate-400">NEXRA 3D Workshop</span>
                      </div>
                    )}

                    {/* Quick Lightbox Preview Button */}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      title="Inspect Creation"
                    >
                      <ZoomIn className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>

                  {/* 2. Custom Order Name & Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3
                        onClick={() => setSelectedOrder(order)}
                        className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1"
                        title={order.customOrderName}
                      >
                        {order.customOrderName}
                      </h3>
                    </div>

                    {/* Aggregate rating stars */}
                    <div className="flex items-center gap-2 mb-4">
                      {renderStars(avgRating)}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {avgRating.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    {/* 3. Reviews Section */}
                    <div className="mt-auto border-t border-slate-100 dark:border-slate-800/80 pt-3.5 space-y-2.5">
                      {reviews.length > 0 ? (
                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            {renderStars(reviews[0].rating)}
                            <span className="text-[10px] text-slate-400">
                              {new Date(reviews[0].createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                            {reviews[0].reviewerName || 'Visitor'}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                            "{reviews[0].comment}"
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                            No reviews yet. Be the first to share your thoughts!
                          </p>
                        </div>
                      )}

                      {/* Card Actions */}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenReviewModal(order.id)}
                          className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Review this Order</span>
                        </button>

                        <button
                          onClick={onRequestQuoteClick}
                          className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Request Similar</span>
                          <Send className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Callout: Custom 3D Printing Service */}
        <div className="mt-16 rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 sm:p-12 text-white border border-slate-700/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Bring Your Vision To Life</span>
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              Have an Idea or CAD Model You Want 3D Printed?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We specialize in personalized lithophane lamps, high-detail cosplay replicas, functional industrial brackets in PETG-CF and nylon, customized corporate trophies, and bespoke gifts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={onRequestQuoteClick}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition-all shadow-md shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Instant Inquiry</span>
            </button>
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 transition-colors cursor-pointer"
            >
              Explore Products
            </button>
          </div>
        </div>
      </main>

      {/* Lightbox / High-Res Image Inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
                  Custom Order Preview
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedOrder.customOrderName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-res Image */}
            <div className="relative bg-black flex items-center justify-center max-h-[50vh] overflow-hidden">
              {selectedOrder.imageUrl ? (
                <img
                  src={selectedOrder.imageUrl}
                  alt={selectedOrder.customOrderName}
                  referrerPolicy="no-referrer"
                  className="max-h-[50vh] w-auto object-contain"
                />
              ) : (
                <div className="py-20 text-slate-400 flex flex-col items-center">
                  <ImageIcon className="w-12 h-12 opacity-40 mb-2" />
                  <span className="text-xs">No preview photo attached</span>
                </div>
              )}
            </div>

            {/* Reviews list in modal */}
            <div className="p-5 max-h-56 overflow-y-auto space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Reviews ({selectedOrder.reviews.length})
              </h4>
              {selectedOrder.reviews.length > 0 ? (
                selectedOrder.reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {renderStars(r.rating)}
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                      {r.reviewerName || 'Visitor'}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No reviews submitted yet. Be the first to review!</p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
              <button
                onClick={() => {
                  handleOpenReviewModal(selectedOrder.id);
                  setSelectedOrder(null);
                }}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Write Review for this Order</span>
              </button>

              <button
                onClick={() => {
                  setSelectedOrder(null);
                  onRequestQuoteClick();
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Order Custom Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal - Completely Public, No Login/Verification Required */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Write a Review
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Share your thoughts on NEXRA 3D craftsmanship
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              {/* Order target selection if opened from header */}
              {orders.length > 1 ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Custom Creation *
                  </label>
                  <select
                    value={targetOrderId}
                    onChange={(e) => setTargetOrderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.customOrderName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : targetOrderId && orders.find((o) => o.id === targetOrderId) ? (
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Reviewing: {orders.find((o) => o.id === targetOrderId)?.customOrderName}</span>
                </div>
              ) : null}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Your Name"
                  required
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold ml-2 text-slate-700 dark:text-slate-300">
                    {reviewRating} of 5 stars
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Review *
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Write your review here..."
                  required
                  maxLength={1000}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              {/* Status Message */}
              {reviewMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    reviewMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}
                >
                  {reviewMessage.text}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingReview ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
