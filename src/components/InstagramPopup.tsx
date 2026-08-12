import React, { useEffect } from 'react';
import { X, Instagram, ExternalLink } from 'lucide-react';
import { SOCIAL_LINKS, INSTAGRAM_HANDLE } from '../config/social';

interface InstagramPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstagramPopup: React.FC<InstagramPopupProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scrolling while popup is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle ESC key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFollowClick = () => {
    window.open(SOCIAL_LINKS.instagram, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Instagram Promotion"
    >
      <div
        className="bg-white rounded-[28px] max-w-[440px] w-[calc(100%-30px)] sm:w-full overflow-hidden shadow-2xl relative border border-slate-100 transform transition-all duration-300 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Close promotion modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center space-y-4">
          {/* Circular Instagram Badge Area */}
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 shadow-xl shadow-pink-500/20 flex items-center justify-center mx-auto mt-2">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-pink-600">
              <Instagram className="w-10 h-10" />
            </div>
          </div>

          {/* Instagram Handle & Text */}
          <div className="space-y-1.5 px-2">
            <span className="inline-block px-3 py-1 bg-pink-50 text-pink-600 rounded-full font-black text-xs tracking-wide uppercase border border-pink-100">
              {INSTAGRAM_HANDLE}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              New launches &amp; offers — first on Instagram.
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-xs mx-auto">
              Join our community for exclusive 3D printing sneak peeks, discounts, and custom creation guides!
            </p>
          </div>

          {/* Gradient Action Button */}
          <div className="pt-2 pb-1">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleFollowClick}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:via-pink-700 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer no-underline"
              aria-label="Follow NEXRA 3D on Instagram"
            >
              <Instagram className="w-5 h-5" />
              <span>Follow on Instagram</span>
              <ExternalLink className="w-4 h-4 opacity-80" />
            </a>
          </div>

          {/* Dismiss Text */}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer py-1"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
