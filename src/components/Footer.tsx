import React from 'react';
import { NexraLogo } from './NexraLogo';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Mail, Phone, MapPin, Heart, Sparkles, Boxes, Send, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppFloatingButton';
import { SOCIAL_LINKS } from '../config/social';

interface FooterProps {
  onNavigateHome?: () => void;
  onNavigateShop?: () => void;
  onNavigateServices?: () => void;
  onNavigateAbout?: () => void;
  onNavigateContact?: () => void;
  onRequestQuoteClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateShop,
  onNavigateServices,
  onNavigateAbout,
  onNavigateContact,
  onRequestQuoteClick
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-8 font-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Trust Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Express Shipping Across India</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Dispatched within 24-48 hours with live tracking</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Strict NDA & Security</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Encrypted CAD file processing & Razorpay gateway</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Micron Quality Guarantee</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">CMM inspection & free replacement on manufacturing defects</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">OEM Certified Materials</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Directly sourced resins, filaments & 3D printers</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-xs">
          {/* Brand Overview */}
          <div className="md:col-span-2 space-y-4">
            <NexraLogo variant="dark" size="md" />
            <p className="text-slate-400 leading-relaxed max-w-sm">
              NEXRA 3D is India's premier platform for 3D printed consumer products, customized gifts, idols, home decor, and industrial additive manufacturing services.
            </p>
            <div className="space-y-1.5 text-slate-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Plot no 484, TNGOs Colony, Gachibowli, Hyderabad - 500032</span>
              </div>
              <div className="flex items-center space-x-2">
                <WhatsAppIcon className="w-4 h-4 fill-[#25D366] shrink-0" />
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="https://wa.me/918886149998?text=Hello%20NEXRA%203D%2C%20I%20have%20an%20inquiry%20regarding%203D%20printing%20services."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 font-medium hover:underline"
                  >
                    +91 8886149998
                  </a>
                  <span>/</span>
                  <a
                    href="https://wa.me/918886159998?text=Hello%20NEXRA%203D%2C%20I%20have%20an%20inquiry%20regarding%203D%20printing%20services."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 font-medium hover:underline"
                  >
                    +91 8886159998
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex flex-col text-[11px] space-y-0.5">
                  <span>Sales: <a href="mailto:nexra3d@gmail.com" className="hover:underline text-cyan-400">nexra3d@gmail.com</a></span>
                  <span>Enquiry: Enquiry@nexra3d.in</span>
                  <span>Support: support@nexra3d.in</span>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-2 flex items-center space-x-3">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NEXRA 3D Facebook"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 transform hover:scale-105 border border-slate-700/60"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NEXRA 3D Instagram"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-pink-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 transform hover:scale-105 border border-slate-700/60"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NEXRA 3D LinkedIn"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-500 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 transform hover:scale-105 border border-slate-700/60"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NEXRA 3D YouTube"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 transform hover:scale-105 border border-slate-700/60"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={onNavigateHome} className="hover:text-white transition-colors cursor-pointer">
                  Home Page
                </button>
              </li>
              <li>
                <button onClick={onNavigateShop} className="hover:text-white transition-colors cursor-pointer">
                  E-Commerce Shop
                </button>
              </li>
              <li>
                <button onClick={onNavigateServices} className="hover:text-white transition-colors cursor-pointer">
                  Additive Services
                </button>
              </li>
              <li>
                <button onClick={onNavigateAbout} className="hover:text-white transition-colors cursor-pointer">
                  About NEXRA 3D
                </button>
              </li>
              <li>
                <button onClick={onNavigateContact} className="hover:text-white transition-colors cursor-pointer">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care & Quote CTA */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">On-Demand Manufacturing</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={onRequestQuoteClick} className="text-cyan-400 font-bold hover:underline cursor-pointer flex items-center gap-1">
                  <Send className="w-3 h-3" /> Request Instant CAD Quote
                </button>
              </li>
              <li>
                <button onClick={onNavigateServices} className="hover:text-white transition-colors cursor-pointer text-left block">
                  Precision Tooling & Fixtures
                </button>
              </li>
              <li>
                <button onClick={onNavigateServices} className="hover:text-white transition-colors cursor-pointer text-left block">
                  Aerospace Carbon Fiber Jigs
                </button>
              </li>
              <li>
                <button onClick={onNavigateServices} className="hover:text-white transition-colors cursor-pointer text-left block">
                  Architectural BIM Physical Models
                </button>
              </li>
              <li>
                <button onClick={onNavigateServices} className="hover:text-white transition-colors cursor-pointer text-left block">
                  Castable Jewelry Prototyping
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Engineering Updates</h4>
            <p className="text-slate-400">Subscribe for technical whitepapers, resin guides, and new product dispatches.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to NEXRA 3D engineering updates!'); }} className="space-y-2">
              <input
                type="email"
                placeholder="Enter work email address"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-cyan-500"
              />
              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright & Payment Badge Row */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 NEXRA 3D. All rights reserved.</p>

          {/* Payment Gateways Badges */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Secured By</span>
            <span className="bg-blue-600 text-white font-black px-2 py-0.5 rounded text-[10px]">RAZORPAY</span>
            <span className="bg-slate-800 text-slate-200 font-bold px-2 py-0.5 rounded text-[10px]">UPI</span>
            <span className="bg-slate-800 text-slate-200 font-bold px-2 py-0.5 rounded text-[10px]">VISA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
