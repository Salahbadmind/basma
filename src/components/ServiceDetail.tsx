import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  Check, 
  Phone, 
  MessageCircle, 
  ChevronRight, 
  Stethoscope, 
  FileText, 
  HelpCircle,
  Award,
  Layers,
  Star
} from 'lucide-react';

export const ServiceDetail: React.FC = () => {
  const { 
    services, 
    selectedServiceId, 
    doctors, 
    beforeAfterCases, 
    language, 
    t, 
    openBooking, 
    navigateToView,
    navigateToDoctor,
    navigateToService,
    clinicInfo
  } = useClinic();

  const [copiedLink, setCopiedLink] = useState(false);

  // Find the selected service by id or slug, or fallback to first
  const service = services.find(
    s => s.id === selectedServiceId || s.slug === selectedServiceId
  ) || services[0];

  if (!service) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-500">Traitement non trouvé.</p>
        <button
          onClick={() => navigateToView('services')}
          className="mt-4 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm cursor-pointer"
        >
          Retour aux soins
        </button>
      </div>
    );
  }

  const name = service.name[language] || service.name.fr;
  const shortDesc = service.shortDescription[language] || service.shortDescription.fr;
  const fullDesc = service.fullDescription[language] || service.fullDescription.fr;
  const benefits = service.benefits[language] || service.benefits.fr || [];
  const procedureSteps = service.procedureSteps || [];
  const faqs = service.faqs || [];

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?service=${service.slug || service.id}#service-${service.slug || service.id}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const clinicNameStr = clinicInfo.name[language] || clinicInfo.name.fr;
  const whatsappMessage = encodeURIComponent(
    `Bonjour Clinique ${clinicNameStr}, je souhaite avoir des renseignements ou un devis pour le traitement : ${name}.`
  );
  const whatsappUrl = `https://wa.me/${clinicInfo.whatsapp || clinicInfo.phone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  // Find doctors who perform or specialize in this service category
  const relevantDoctors = doctors.filter(doc => {
    const spec = doc.specialty[language]?.toLowerCase() || '';
    const srvCat = service.category.toLowerCase();
    if (srvCat === 'implantology' && (spec.includes('implant') || spec.includes('chirurg'))) return true;
    if (srvCat === 'orthodontics' && spec.includes('ortho')) return true;
    if (srvCat === 'pediatric' && (spec.includes('péd') || spec.includes('enf'))) return true;
    if (srvCat === 'cosmetic' && (spec.includes('esthét') || spec.includes('sourire'))) return true;
    return true; // if general or broad
  }).slice(0, 2);

  // Find related before-after cases
  const relatedCases = beforeAfterCases.filter(c => {
    const cat = c.category?.toLowerCase() || '';
    const srvCat = service.category?.toLowerCase() || '';
    if (srvCat === 'cosmetic' && (cat.includes('whiten') || cat.includes('veneer') || cat.includes('facette'))) return true;
    if (srvCat === 'implantology' && cat.includes('implant')) return true;
    if (srvCat === 'orthodontics' && cat.includes('ortho')) return true;
    return false;
  });

  // Other treatments to discover
  const otherServices = services.filter(s => s.id !== service.id).slice(0, 3);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'cosmetic': return language === 'ar' ? 'طب الأسنان التجميلي' : 'Dentisterie Esthétique';
      case 'implantology': return language === 'ar' ? 'زراعة الأسنان المتطورة' : 'Implantologie Avancée';
      case 'orthodontics': return language === 'ar' ? 'تقويم الأسنان' : 'Orthodontie & Aligneurs';
      case 'general': return language === 'ar' ? 'علاج وتأهيل الأسنان' : 'Soins Généraux & Prophylaxie';
      case 'surgery': return language === 'ar' ? 'جراحة الفم واللثة' : 'Chirurgie Orale';
      case 'pediatric': return language === 'ar' ? 'طب أسنان الأطفال' : 'Pédodontie';
      default: return language === 'ar' ? 'علاج تخصصي' : 'Soin Spécialisé';
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumbs & Share Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => navigateToView('home')}
              className="hover:text-teal-600 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'الرئيسية' : 'Accueil'}
            </button>
            <ChevronRight className="w-3 h-3 rtl:rotate-180" />
            <button
              onClick={() => navigateToView('services')}
              className="hover:text-teal-600 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'العلاجات' : 'Nos Traitements'}
            </button>
            <ChevronRight className="w-3 h-3 rtl:rotate-180" />
            <span className="font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[200px] sm:max-w-md">
              {name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>{language === 'ar' ? 'تم نسخ الرابط' : 'Lien copié !'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'ar' ? 'مشاركة هذا العلاج' : 'Partager cette page'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Card of the Treatment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Visual Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 aspect-4/3 bg-slate-100 dark:bg-slate-800 group">
              <img
                src={service.imageUrl}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
              
              {/* Top Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-teal-300 text-xs font-bold border border-teal-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{getCategoryLabel(service.category)}</span>
                </span>

                {service.isPopular && (
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold shadow-md">
                    {language === 'ar' ? 'علاج مميز ومطلوب' : 'Très Demandé'}
                  </span>
                )}
              </div>

              {/* Bottom duration & price on image */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{service.durationMinutes} min ({language === 'ar' ? 'جلسة بالعيادة' : 'au cabinet'})</span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-300 block">{t.common.fromPrice}</span>
                  <span className="text-xl font-black text-teal-300">
                    {service.priceDZD.toLocaleString()} {t.common.dzd}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Guarantees bar */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center">
              <div className="space-y-1">
                <ShieldCheck className="w-4 h-4 text-teal-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  {language === 'ar' ? 'تعقيم معتمد' : 'Stérilisation ISO'}
                </p>
              </div>
              <div className="space-y-1 border-x border-slate-200 dark:border-slate-700">
                <Award className="w-4 h-4 text-teal-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  {language === 'ar' ? 'مواد أوروبية' : 'Matériaux CE'}
                </p>
              </div>
              <div className="space-y-1">
                <Stethoscope className="w-4 h-4 text-teal-600 mx-auto" />
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  {language === 'ar' ? 'أطباء مختصون' : 'Spécialistes'}
                </p>
              </div>
            </div>
          </div>

          {/* Details & CTA Column */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{getCategoryLabel(service.category)}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {name}
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {shortDesc}
              </p>
            </div>

            {/* Price Card & Action Buttons */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                    {language === 'ar' ? 'التعريفة التقديرية للعلاج' : 'Tarif estimé de la prestation'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-teal-700 dark:text-teal-300">
                      {service.priceDZD.toLocaleString()} {t.common.dzd}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({language === 'ar' ? 'ابتداءً من' : 'à partir de'})
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{service.durationMinutes} min</span>
                  </div>
                  <span className="text-[11px] block mt-0.5">
                    {language === 'ar' ? 'خطة علاج مفصلة' : 'Bilan & plan inclus'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  id={`btn-book-page-${service.id}`}
                  onClick={() => openBooking(service)}
                  className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 active:scale-98 transition-all cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                  <span>{language === 'ar' ? 'حجز موعد لهذا العلاج' : 'Prendre Rendez-vous pour ce soin'}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{language === 'ar' ? 'استشارة سريعة عبر واتساب' : 'Poser une question via WhatsApp'}</span>
                </a>
              </div>
            </div>

            {/* Key Clinical Benefits */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{language === 'ar' ? 'فوائد ومزايا هذا العلاج' : 'Bénéfices cliniques & esthétiques'}</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Detailed Clinical Sections: Procedure Steps & FAQs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          
          {/* Full Description & Procedure Steps */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              <span>{language === 'ar' ? 'مراحل العلاج في عيادتنا' : 'Déroulement du soin étape par étape'}</span>
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {fullDesc}
            </p>

            <div className="space-y-4 pt-2">
              {procedureSteps.length > 0 ? (
                procedureSteps.map((stepItem, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {stepItem.step || idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {stepItem.title[language] || stepItem.title.fr}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {stepItem.desc[language] || stepItem.desc.fr}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {language === 'ar' ? 'الفحص والتصوير الرقمي 3D' : 'Consultation & Bilan Radiologique'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'ar' ? 'فحص سريري دقيق وتحديد خطة علاجية مخصصة.' : 'Examen clinique approfondi et plan de traitement sur-mesure.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {language === 'ar' ? 'التنفيذ بأحدث التقنيات وبدون ألم' : 'Réalisation du Soin Haute Précision'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'ar' ? 'بروتوكولات حديثة ومريحة تضمن أعلى درجات الدقة.' : 'Matériel de pointe et confort absolu garanti.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {language === 'ar' ? 'المتابعة والتوجيهات الوقائية' : 'Suivi & Contrôle Post-Soin'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'ar' ? 'إرشادات للعناية ومتابعة دورية لضمان استمرارية النتيجة.' : 'Conseils personnalisés pour pérenniser vos résultats.'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Clinical FAQs or Guarantees */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-600" />
              <span>{language === 'ar' ? 'أسئلة شائعة حول هذا العلاج' : 'Questions fréquentes sur ce soin'}</span>
            </h3>

            {faqs.length > 0 ? (
              <div className="space-y-3">
                {faqs.map((faqItem, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {faqItem.q[language] || faqItem.q.fr}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {faqItem.a[language] || faqItem.a.fr}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? 'هل الإجراء مؤلم؟' : 'Le traitement est-il douloureux ?'}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'ar' ? 'لا، نستخدم بروتوكولات تخدير موضعي خفيفة ومتطورة تضمن راحة تامة.' : 'Absolument pas. Nos protocoles d’anesthésie locale moderne assurent un confort total tout au long de la séance.'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? 'كم تدوم النتيجة؟' : 'Combien de temps durent les résultats ?'}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'ar' ? 'تدوم النتائج لسنوات عديدة مع الالتزام بتعليمات النظافة الفموية والزيارة الدورية.' : 'Avec une bonne hygiène bucco-dentaire et un contrôle régulier, les résultats sont très durables.'}
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 text-xs text-teal-900 dark:text-teal-300 space-y-1">
              <span className="font-bold block">
                {language === 'ar' ? 'استفسار مخصص؟' : 'Une question particulière ?'}
              </span>
              <p>
                {language === 'ar' 
                  ? 'فريقنا الطبي جاهز للإجابة على جميع استفساراتكم عبر واتساب أو خلال الزيارة الأولى.'
                  : 'Notre secrétariat médical est disponible par WhatsApp ou téléphone pour vous renseigner.'}
              </p>
            </div>
          </div>

        </div>

        {/* Doctors Specializing in this Service */}
        {relevantDoctors.length > 0 && (
          <div className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'أطباؤنا الممارسون لهذا العلاج' : 'Chirurgiens-dentistes réalisant ce soin'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'ar' ? 'اختر طبيبك المفضل لحجز الموعد مباشرة' : 'Consultez les profils et réservez directement avec le praticien de votre choix'}
                </p>
              </div>

              <button
                onClick={() => navigateToView('doctors')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'ar' ? 'جميع الأطباء' : 'Voir toute l’équipe'}</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relevantDoctors.map(doc => (
                <div
                  key={doc.id}
                  className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={doc.imageUrl}
                      alt={doc.name[language]}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-teal-500/20 shadow-xs"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {doc.name[language]}
                      </h4>
                      <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold">
                        {doc.specialty[language]}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{doc.rating} ({doc.experienceYears}+ {language === 'ar' ? 'سنوات خبرة' : 'ans exp'})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => navigateToDoctor(doc.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {language === 'ar' ? 'الملف الطبي' : 'Profil'}
                    </button>
                    <button
                      onClick={() => openBooking(service, doc)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      {language === 'ar' ? 'حجز معه' : 'Réserver'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Before/After Cases Preview */}
        {relatedCases.length > 0 && (
          <div className="pt-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>{language === 'ar' ? 'نتائج واقعية قبل وبعد لهذا العلاج' : 'Résultats Cliniques Avant / Après'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedCases.slice(0, 2).map(c => (
                <div key={c.id} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative rounded-xl overflow-hidden aspect-4/3">
                      <img src={c.beforeImage} alt="Avant" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 left-1.5 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Avant
                      </span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden aspect-4/3">
                      <img src={c.afterImage} alt="Après" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1.5 right-1.5 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Après
                      </span>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {c.title[language] || c.title.fr}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {c.duration[language] || c.duration.fr} • Dr. {c.doctorName || clinicNameStr}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discover Other Treatments */}
        {otherServices.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'علاجات أخرى قد تهمك' : 'Autres soins proposés au cabinet'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherServices.map(other => (
                <div
                  key={other.id}
                  onClick={() => navigateToService(other.slug || other.id)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-200">
                    <img
                      src={other.imageUrl}
                      alt={other.name[language]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors line-clamp-1">
                    {other.name[language]}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{other.durationMinutes} min</span>
                    <span className="font-extrabold text-teal-700 dark:text-teal-400">
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
