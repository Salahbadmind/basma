import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Star, 
  Check, 
  Share2, 
  Stethoscope, 
  Clock, 
  HelpCircle, 
  Sparkles,
  Award,
  ChevronRight,
  Package,
  Calendar
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { 
    products, 
    selectedProductSlug, 
    language, 
    t, 
    openCheckout, 
    navigateToView,
    navigateToProduct,
    openBooking
  } = useClinic();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Find product by slug or default to first
  const product = products.find(p => p.slug === selectedProductSlug) || products[0];

  const otherProducts = products.filter(p => p.id !== product?.id).slice(0, 3);

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Produit non trouvé.</p>
        <button
          onClick={() => navigateToView('products')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl font-semibold text-sm"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  const name = product.name[language] || product.name.fr;
  const subtitle = product.subtitle?.[language] || product.subtitle?.fr;
  const description = product.description[language] || product.description.fr;
  const features = product.features?.[language] || product.features?.fr || [];
  const howToUse = product.howToUse?.[language] || product.howToUse?.fr;
  const doctorRecommendation = product.doctorRecommendation?.[language] || product.doctorRecommendation?.fr;

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?product=${product.slug}#product-${product.slug}`
    : '';

  const handleCopyFbLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <div className="py-8 sm:py-12 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => navigateToView('home')}
              className="hover:text-teal-600 transition-colors cursor-pointer"
            >
              {t.nav.home}
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button
              onClick={() => navigateToView('products')}
              className="hover:text-teal-600 transition-colors cursor-pointer"
            >
              {t.nav.products || 'Boutique'}
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
              {name}
            </span>
          </div>

          {/* FB Ads Direct Link Helper */}
          <div className="flex items-center gap-2">
            <button
              id="copy-product-page-link"
              onClick={handleCopyFbLink}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-teal-600" />}
              <span>{copiedLink ? t.store.linkCopied : t.store.copyFbLink}</span>
            </button>
          </div>
        </div>

        {/* Main Product Layout (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-4/3 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              
              {/* COD Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-lg bg-teal-600 text-white font-bold text-xs shadow-md">
                  Paiement à la Livraison (COD)
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-teal-600 ring-2 ring-teal-500/30'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Clinical Trust Box */}
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/50 space-y-2">
              <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-sm">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>{t.store.doctorCertified}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {doctorRecommendation || 'Appareil testé cliniquement au sein de notre cabinet pour garantir sécurité de l’émail et efficacité sur le long terme.'}
              </p>
            </div>
          </div>

          {/* Right Column: Details & Fast COD Checkout CTA */}
          <div className="lg:col-span-6 space-y-6">
            
            <div>
              {/* Rating & Review Counter */}
              <div className="flex items-center gap-2 text-sm text-amber-500 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{product.rating} / 5.0</span>
                <span className="text-slate-400 text-xs">({product.reviewsCount} avis vérifiés en Algérie)</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {name}
              </h1>
              {subtitle && (
                <p className="text-sm font-medium text-teal-700 dark:text-teal-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Price Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {product.priceDZD.toLocaleString()} DA
                  </span>
                  {product.originalPriceDZD && (
                    <span className="ml-3 text-sm text-slate-400 line-through font-semibold">
                      {product.originalPriceDZD.toLocaleString()} DA
                    </span>
                  )}
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full">
                  {t.store.inStock} ({product.stockCount} unités)
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                <Truck className="w-3.5 h-3.5 text-teal-600" />
                <span>Livraison 58 Wilayas en 24h-48h avec paiement à la réception du colis.</span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3">
              <button
                id="main-product-order-btn"
                onClick={() => openCheckout(product)}
                className="w-full py-4 px-6 bg-linear-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-teal-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{t.store.orderNowCod}</span>
              </button>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
                  <div className="font-bold text-slate-800 dark:text-slate-200">Garantie 1 An</div>
                  <div className="text-[11px] text-slate-400">Échange direct</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-0.5">
                  <Truck className="w-4 h-4 text-teal-600 mx-auto" />
                  <div className="font-bold text-slate-800 dark:text-slate-200">58 Wilayas</div>
                  <div className="text-[11px] text-slate-400">Domicile ou Bureau</div>
                </div>
              </div>
            </div>

            {/* Description & Features */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Description du Soin
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {description}
                </p>
              </div>

              {features.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    {t.store.productSpecs}
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {howToUse && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.store.howToUse}</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {howToUse}
                  </p>
                </div>
              )}
            </div>

            {/* Consultation Upsell */}
            <div className="p-4 rounded-2xl bg-linear-to-br from-slate-900 to-teal-950 text-white flex items-center justify-between gap-4 shadow-md">
              <div className="space-y-0.5">
                <div className="font-bold text-sm">Besoin d'un diagnostic au cabinet ?</div>
                <div className="text-xs text-teal-200">Prenez rendez-vous avec un de nos chirurgiens-dentistes.</div>
              </div>
              <button
                onClick={() => openBooking()}
                className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl whitespace-nowrap cursor-pointer transition-colors"
              >
                Prendre RDV
              </button>
            </div>

          </div>

        </div>

        {/* Discover Other Products */}
        {otherProducts.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'منتجات أخرى في الصيدلية والعيادة' : 'Découvrez aussi nos autres produits'}
              </h3>
              <button
                onClick={() => navigateToView('products')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'ar' ? 'عرض المتجر بالكامل' : 'Voir toute la boutique'}</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherProducts.map(other => (
                <div
                  key={other.id}
                  onClick={() => navigateToProduct(other.slug)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <img
                      src={other.images[0]}
                      alt={other.name[language]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors line-clamp-1">
                    {other.name[language]}
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{other.category}</span>
                    <span className="font-black text-teal-700 dark:text-teal-400">
                      {other.priceDZD.toLocaleString()} {t.common.dzd}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
