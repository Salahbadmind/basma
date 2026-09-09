import React, { useState, useMemo } from 'react';
import { useClinic } from '../context/ClinicContext';
import { TreatmentService, ServiceCategory } from '../types';
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Layers, 
  Heart, 
  Flame, 
  CheckCircle, 
  Info,
  Calendar
} from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const { services, language, t, openBooking, openServiceDetail } = useClinic();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: ServiceCategory; label: string }[] = [
    { id: 'all', label: t.common.filterAll },
    { id: 'cosmetic', label: t.common.filterCosmetic },
    { id: 'implantology', label: t.common.filterImplantology },
    { id: 'orthodontics', label: t.common.filterOrthodontics },
    { id: 'general', label: t.common.filterGeneral },
    { id: 'surgery', label: t.common.filterSurgery },
    { id: 'pediatric', label: t.common.filterPediatric },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchesCategory = selectedCategory === 'all' || srv.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        srv.name[language].toLowerCase().includes(q) ||
        srv.shortDescription[language].toLowerCase().includes(q) ||
        srv.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery, language]);

  return (
    <section id="services" className="py-20 lg:py-28 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.servicesSection.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.servicesSection.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t.servicesSection.subtitle}
          </p>
        </div>

        {/* Search Bar & Category Filter Pills */}
        <div className="space-y-6 mb-10">
          
          {/* Search Input */}
          <div className="max-w-md mx-auto relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="services-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.servicesSection.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x px-1 sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`filter-cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20 scale-102'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Services Count Banner */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 sm:mb-6 px-1">
          <span>
            {filteredServices.length} {t.servicesSection.allCount}
          </span>
          <span className="hidden sm:inline italic">
            {t.servicesSection.priceNotice}
          </span>
        </div>

        {/* Services Grid (2x2 on mobile, responsive) */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              id={`service-card-${service.slug}`}
              className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-teal-300/80 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Service Image Header with Badges */}
                <div className="relative h-28 sm:h-48 overflow-hidden bg-slate-100">
                  <img
                    src={service.imageUrl}
                    alt={service.name[language]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-transparent to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between gap-1">
                    <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-semibold flex items-center gap-0.5 sm:gap-1 shadow-xs">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-teal-300" />
                      <span>{service.durationMinutes}m</span>
                    </span>

                    {service.isPopular && (
                      <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-amber-500 text-slate-950 text-[9px] sm:text-[11px] font-bold shadow-xs">
                        {language === 'ar' ? 'مميز' : 'Populaire'}
                      </span>
                    )}
                  </div>

                  {/* Price Tag in DZD */}
                  <div className="absolute bottom-1.5 sm:bottom-3 left-1.5 sm:left-3 right-1.5 sm:right-3 flex items-center justify-between text-white">
                    <span className="text-[10px] sm:text-xs text-slate-200 font-medium hidden xs:inline sm:inline">{t.common.fromPrice}</span>
                    <span className="text-xs sm:text-lg font-extrabold text-teal-300 bg-slate-900/90 px-1.5 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg border border-teal-500/30 whitespace-nowrap shadow-xs ml-auto xs:ml-0">
                      {service.priceDZD.toLocaleString()} {t.common.dzd}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-2.5 sm:p-5 space-y-1.5 sm:space-y-3">
                  <h3 className="text-xs sm:text-lg font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors line-clamp-2 min-h-[2rem] sm:min-h-0">
                    {service.name[language]}
                  </h3>
                  
                  <p className="text-[10px] sm:text-sm text-slate-600 line-clamp-2 leading-relaxed hidden xs:block sm:block">
                    {service.shortDescription[language]}
                  </p>

                  {/* Benefit Preview */}
                  <ul className="space-y-1 pt-0.5 text-[10px] sm:text-xs text-slate-700 hidden sm:block">
                    {service.benefits[language].slice(0, 2).map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-2 sm:p-5 pt-0 sm:pt-0 border-t border-slate-100 flex flex-col sm:flex-row gap-1 sm:gap-2 mt-auto">
                {/* Direct Book Button */}
                <button
                  id={`btn-book-service-${service.slug}`}
                  onClick={() => openBooking(service)}
                  className="w-full py-1.5 sm:py-2.5 px-2 rounded-lg sm:rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-xs shadow-teal-600/20 transition-all cursor-pointer"
                >
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate">{language === 'ar' ? 'حجز موعد' : 'Réserver'}</span>
                </button>

                {/* Details Button */}
                <button
                  id={`btn-details-${service.slug}`}
                  onClick={() => openServiceDetail(service)}
                  className="w-full sm:w-auto py-1 sm:py-2.5 px-2 rounded-lg sm:rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 text-[10px] sm:text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{language === 'ar' ? 'تفاصيل' : 'Détails'}</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <p className="text-slate-500 text-sm">
              {language === 'ar'
                ? 'لم يتم العثور على أي علاج يطابق بحثك.'
                : 'Aucun traitement ne correspond à votre recherche.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              {language === 'ar' ? 'عرض جميع العلاجات' : 'Réinitialiser les filtres'}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
