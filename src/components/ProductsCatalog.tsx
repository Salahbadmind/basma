import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { ProductCategory, Product } from '../types';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Truck, 
  ShieldCheck, 
  Star, 
  Sparkles, 
  Check, 
  Share2, 
  ExternalLink,
  ArrowRight,
  Stethoscope
} from 'lucide-react';

export const ProductsCatalog: React.FC = () => {
  const { 
    products, 
    language, 
    t, 
    openCheckout, 
    navigateToProduct 
  } = useClinic();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const categories: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: t.store.categories.all },
    { id: 'whitening', label: t.store.categories.whitening },
    { id: 'electric_brushes', label: t.store.categories.electric_brushes },
    { id: 'water_flossers', label: t.store.categories.water_flossers },
    { id: 'toothpaste_gels', label: t.store.categories.toothpaste_gels },
    { id: 'orthodontic_care', label: t.store.categories.orthodontic_care },
    { id: 'mouthguards', label: t.store.categories.mouthguards },
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const name = (product.name[language] || product.name.fr).toLowerCase();
    const desc = (product.description[language] || product.description.fr).toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || name.includes(query) || desc.includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleCopyFbLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?product=${slug}#product-${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2500);
    });
  };

  return (
    <section id="products-section" className="py-16 bg-slate-50 dark:bg-slate-900/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
            <ShoppingBag className="w-3.5 h-3.5" />
            {t.store.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.store.title}
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.store.subtitle}
          </p>

          {/* Trust Value Badges (58 Wilayas & COD) */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs">
              <Truck className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.store.delivery58}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.store.codGuarantee}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
              <span>{language === 'ar' ? 'معتمد من أطبائنا' : 'Recommandé par nos Médecins'}</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          
          {/* Search Box */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="products-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.store.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Categories Pill Navigation */}
          <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-2 scrollbar-none touch-pan-x px-1">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-filter-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

        </div>

        {/* Products Grid - 2x2 layout on mobile */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {language === 'ar' ? 'لم يتم العثور على أي منتج مطابق' : 'Aucun produit trouvé'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ar' ? 'جرب البحث بكلمات أخرى أو اختر فئة مختلفة' : 'Essayez une autre recherche ou une autre catégorie.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
            {filteredProducts.map(product => {
              const name = product.name[language] || product.name.fr;
              const subtitle = product.subtitle?.[language] || product.subtitle?.fr || '';
              const badge = product.badge?.[language] || product.badge?.fr;
              const isCopied = copiedSlug === product.slug;

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.slug}`}
                  onClick={() => navigateToProduct(product.slug)}
                  className="group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
                >
                  {/* Image Container with Badge */}
                  <div className="relative aspect-square sm:aspect-4/3 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount or Custom Badge */}
                    {badge && (
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-amber-500 text-slate-950 text-[9px] sm:text-[11px] font-extrabold rounded-md sm:rounded-lg shadow-xs">
                        {badge}
                      </span>
                    )}

                    {/* Stock Status Tag */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                      {product.inStock ? (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500/90 text-white text-[9px] sm:text-[10px] font-bold rounded-md backdrop-blur-xs flex items-center gap-0.5 sm:gap-1 shadow-xs">
                          <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-white animate-pulse"></span>
                          COD
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-rose-500/90 text-white text-[9px] sm:text-[10px] font-bold rounded-md shadow-xs">
                          {t.store.outOfStock}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-3">
                    
                    <div>
                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-500 mb-0.5 sm:mb-1">
                        <div className="hidden sm:flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <div className="flex sm:hidden items-center">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs">
                          {product.rating}
                        </span>
                        <span className="text-slate-400 text-[9px] sm:text-[11px]">
                          ({product.reviewsCount})
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <h3 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-tight min-h-[2rem] sm:min-h-0 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {name}
                      </h3>
                      {subtitle && (
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 hidden xs:block sm:block">
                          {subtitle}
                        </p>
                      )}
                    </div>

                    {/* Pricing & CTA Section */}
                    <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-700/80 space-y-1.5 sm:space-y-2.5">
                      
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                        <div>
                          <span className="text-xs sm:text-lg font-extrabold text-teal-700 dark:text-teal-400 leading-none">
                            {product.priceDZD.toLocaleString()} DA
                          </span>
                          {product.originalPriceDZD && (
                            <span className="block sm:inline sm:ml-1.5 text-[9px] sm:text-xs text-slate-400 line-through">
                              {product.originalPriceDZD.toLocaleString()} DA
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          58 Wilayas
                        </span>
                      </div>

                      {/* Action Buttons: Fast Buy (COD) + Copy Link */}
                      <div className="flex items-center gap-1 sm:gap-1.5 pt-0.5">
                        <button
                          id={`buy-btn-${product.id}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCheckout(product);
                          }}
                          className="flex-1 py-1.5 sm:py-2 px-1.5 sm:px-3 bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-[11px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all active:scale-98 cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span className="truncate">{language === 'ar' ? 'طلب الآن' : t.store.orderNowCod}</span>
                        </button>

                        <button
                          id={`copy-ad-link-${product.id}`}
                          type="button"
                          onClick={(e) => handleCopyFbLink(product.slug, e)}
                          className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700'
                              : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                          title={t.store.copyFbLink}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {isCopied && (
                        <p className="text-[9px] sm:text-[10px] text-center font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                          {t.store.linkCopied}
                        </p>
                      )}

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
