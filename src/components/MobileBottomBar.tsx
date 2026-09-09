import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { 
  Home, 
  Sparkles, 
  ShoppingBag, 
  Calendar, 
  MessageCircle 
} from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const { 
    currentView, 
    navigateToView, 
    openBooking, 
    clinicInfo, 
    language 
  } = useClinic();

  const handleGoHome = () => {
    navigateToView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoServices = () => {
    if (currentView !== 'home') {
      navigateToView('home');
      setTimeout(() => {
        const el = document.getElementById('services');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('services');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGoProducts = () => {
    navigateToView('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside 
      id="mobile-bottom-navigation-dock"
      aria-label="Mobile Navigation Dock"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around"
      style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* 1. Home */}
      <button
        id="mobile-dock-home-btn"
        type="button"
        onClick={handleGoHome}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
          currentView === 'home'
            ? 'text-teal-600 dark:text-teal-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] leading-tight">
          {language === 'ar' ? 'الرئيسية' : 'Accueil'}
        </span>
      </button>

      {/* 2. Traitements (2x2) */}
      <button
        id="mobile-dock-services-btn"
        type="button"
        onClick={handleGoServices}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all cursor-pointer relative"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 mb-0.5 text-teal-600 dark:text-teal-400" />
          <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-teal-500 text-slate-950 font-extrabold text-[8px] rounded-full">
            2×2
          </span>
        </div>
        <span className="text-[10px] leading-tight">
          {language === 'ar' ? 'العلاجات' : 'Soins'}
        </span>
      </button>

      {/* 3. Center CTA: Prendre RDV */}
      <button
        id="mobile-dock-booking-btn"
        type="button"
        onClick={() => openBooking()}
        className="flex flex-col items-center justify-center -mt-4 transition-transform active:scale-95 cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 border-2 border-white dark:border-slate-900">
          <Calendar className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 mt-0.5 leading-tight">
          {language === 'ar' ? 'موعد' : 'RDV'}
        </span>
      </button>

      {/* 4. Boutique COD (2x2) */}
      <button
        id="mobile-dock-products-btn"
        type="button"
        onClick={handleGoProducts}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
          currentView === 'products'
            ? 'text-teal-600 dark:text-teal-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="absolute -top-1 -right-2.5 px-1 py-0.2 bg-emerald-500 text-white font-extrabold text-[8px] rounded-full">
            COD
          </span>
        </div>
        <span className="text-[10px] leading-tight">
          {language === 'ar' ? 'المتجر' : 'Boutique'}
        </span>
      </button>

      {/* 5. WhatsApp Direct */}
      <a
        id="mobile-dock-whatsapp-link"
        href={`https://wa.me/${clinicInfo.whatsapp.replace('+', '')}?text=${encodeURIComponent(
          language === 'ar'
            ? 'مرحباً عيادة البهجة، أود الاستفسار عن المواعيد أو المنتجات.'
            : 'Bonjour Cabinet Dentaire El Bahdja, je souhaite des renseignements.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-all cursor-pointer"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 mb-0.5" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>
        <span className="text-[10px] leading-tight">
          WhatsApp
        </span>
      </a>
    </aside>
  );
};
