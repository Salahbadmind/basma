import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Tag, CheckCircle, Calendar, ArrowRight, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const { services, language, t, openBooking } = useClinic();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const pricingCategories = [
    { id: 'all', label: t.pricingSection.categories.all },
    { id: 'general', label: t.pricingSection.categories.hygiene },
    { id: 'cosmetic', label: t.pricingSection.categories.aesthetic },
    { id: 'implantology', label: t.pricingSection.categories.prosthesis },
    { id: 'orthodontics', label: t.pricingSection.categories.orthodontics },
  ];

  const displayedServices = activeCategory === 'all'
    ? services
    : services.filter((s) => s.category === activeCategory);

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.pricingSection.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.pricingSection.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t.pricingSection.subtitle}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x px-1 sm:flex-wrap mb-6 sm:mb-10">
          {pricingCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Pricing Table / Grid (2x2 on mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 mb-8 sm:mb-12">
          {displayedServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl sm:rounded-3xl p-3 sm:p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2 sm:space-y-4">
                <div className="flex items-start justify-between gap-1 sm:gap-3">
                  <div>
                    <span className="text-[9px] sm:text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
                      {service.category}
                    </span>
                    <h3 className="text-xs sm:text-base font-bold text-slate-900 leading-tight line-clamp-2 min-h-[2rem] sm:min-h-0">
                      {service.name[language]}
                    </h3>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium">{t.common.fromPrice}</span>
                  <div className="text-left sm:text-right">
                    <span className="text-sm sm:text-2xl font-black text-teal-800">
                      {service.priceDZD.toLocaleString()}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 ml-1">{t.common.dzd}</span>
                  </div>
                </div>

                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2 hidden xs:block sm:block">
                  {service.priceNote ? service.priceNote[language] : service.shortDescription[language]}
                </p>

                {/* Inclusions */}
                <ul className="space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs text-slate-600 pt-1 hidden sm:block">
                  {service.benefits[language].slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5 sm:gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 sm:pt-6 mt-3 sm:mt-6 border-t border-slate-100">
                <button
                  onClick={() => openBooking(service)}
                  className="w-full py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-teal-600 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="truncate">{language === 'ar' ? 'حجز' : t.pricingSection.bookConsultation}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer Banner & Personalized Quote CTA */}
        <div className="bg-linear-to-r from-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Devis Médical 100% Transparent</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              {language === 'ar'
                ? 'هل تحتاج إلى خطة علاج متكاملة وتقدير مالي مخصص؟'
                : 'Besoin d’un plan de traitement complet et d’un devis détaillé ?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {t.pricingSection.disclaimer}
            </p>
          </div>

          <button
            onClick={() => openBooking()}
            className="px-6 py-3.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm shrink-0 shadow-lg active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{t.pricingSection.requestQuoteBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
