import React from 'react';

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.808 0-3.585-.486-5.143-1.405l-.368-.218-3.822 1.002 1.02-3.725-.239-.38a9.88 9.88 0 0 1-1.515-5.26c0-5.455 4.436-9.89 9.89-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.992c0 5.455-4.437 9.891-9.892 9.891m0-18.067a8.17 8.17 0 0 0-5.783 2.397 8.173 8.173 0 0 0-2.398 5.781c0 1.62.482 3.203 1.393 4.561l.152.227-.617 2.253 2.308-.605.22.13a8.163 8.163 0 0 0 4.725 1.483c4.512 0 8.182-3.67 8.182-8.18 0-2.187-.852-4.243-2.397-5.788a8.16 8.16 0 0 0-5.784-2.399" />
  </svg>
);

export const WhatsAppFloatingButton: React.FC = () => {
  const whatsappUrl = "https://wa.me/918886159998?text=Hello%20NEXRA%203D%2C%20I%20have%20an%20inquiry%20regarding%203D%20printing%20services.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 group flex items-center justify-center p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border border-emerald-400/30"
      style={{ backgroundColor: '#25D366' }}
    >
      <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 fill-white shrink-0" />
      
      {/* Tooltip on hover */}
      <span className="absolute right-full mr-3 bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none border border-slate-800">
        Chat on WhatsApp
      </span>
    </a>
  );
};
