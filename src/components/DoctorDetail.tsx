import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle2, 
  Star, 
  Globe, 
  Share2, 
  Check, 
  MessageCircle, 
  Phone, 
  ChevronRight, 
  Stethoscope, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap
} from 'lucide-react';

export const DoctorDetail: React.FC = () => {
  const { 
    doctors, 
    selectedDoctorId, 
    services, 
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

  // Find the selected doctor by id, or fallback to first
  const doctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  if (!doctor) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-500">Praticien non trouvé.</p>
        <button
          onClick={() => navigateToView('doctors')}
          className="mt-4 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm cursor-pointer"
        >
          Retour à l’équipe
        </button>
      </div>
    );
  }

  const name = doctor.name[language] || doctor.name.fr;
  const title = doctor.title[language] || doctor.title.fr;
  const specialty = doctor.specialty[language] || doctor.specialty.fr;
  const bio = doctor.bio[language] || doctor.bio.fr;
  const qualifications = doctor.qualifications[language] || doctor.qualifications.fr || [];

  const getDayName = (dayIndex: number) => {
    const daysFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (language === 'ar') return daysAr[dayIndex];
    if (language === 'en') return daysEn[dayIndex];
    return daysFr[dayIndex];
  };

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?doctor=${doctor.id}#doctor-${doctor.id}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const whatsappMessage = encodeURIComponent(
    `Bonjour Clinique ${clinicInfo.name}, je souhaite prendre un rendez-vous ou poser une question au ${name}.`
  );
  const whatsappUrl = `https://wa.me/${clinicInfo.whatsapp || clinicInfo.phone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  // Find treatments associated with this doctor's specialty or common procedures
  const doctorTreatments = services.filter(srv => {
    const spec = specialty.toLowerCase();
    const cat = srv.category.toLowerCase();
    if (spec.includes('implant') && cat === 'implantology') return true;
    if (spec.includes('ortho') && cat === 'orthodontics') return true;
    if (spec.includes('esthét') && cat === 'cosmetic') return true;
    if (spec.includes('chirurg') && (cat === 'surgery' || cat === 'implantology')) return true;
    return true;
  }).slice(0, 4);

  // Find cases treated by this doctor
  const doctorCases = beforeAfterCases.filter(c => 
    c.doctorId === doctor.id || 
    (c.doctorName && c.doctorName.toLowerCase().includes(name.toLowerCase().split(' ')[1] || ''))
  );

  // Other doctors in clinic
  const otherDoctors = doctors.filter(d => d.id !== doctor.id);

  return (
    <div className="py-8 sm:py-12 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumbs & Share */}
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
              onClick={() => navigateToView('doctors')}
              className="hover:text-teal-600 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'الأطباء' : 'Équipe Médicale'}
            </button>
            <ChevronRight className="w-3 h-3 rtl:rotate-180" />
            <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">
              {name}
            </span>
          </div>

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
                <span>{language === 'ar' ? 'تم نسخ رابط الملف' : 'Lien copié !'}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'ar' ? 'مشاركة الملف الطبي' : 'Partager ce profil'}</span>
              </>
            )}
          </button>
        </div>

        {/* Doctor Main Profile Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Portrait Column */}
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <img
                  src={doctor.imageUrl}
                  alt={name}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl object-cover object-center shadow-xl border-4 border-white dark:border-slate-800 ring-2 ring-teal-500/30"
                />
                <span className="absolute -bottom-2.5 -right-2.5 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  {doctor.rating} / 5.0
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/60 px-3.5 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <span>{doctor.experienceYears}+ {language === 'ar' ? 'سنوات من الخبرة والممارسة' : 'années d’expérience'}</span>
              </div>

              {/* Languages spoken */}
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Globe className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{doctor.languages.join(' • ')}</span>
              </div>
            </div>

            {/* Profile Info & Booking Action */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  <Stethoscope className="w-4 h-4" />
                  <span>{specialty}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {name}
                </h1>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {title}
                </p>
              </div>

              {/* Bio block */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  <span>{language === 'ar' ? 'نبذة عن الطبيب وفلسفة العلاج' : 'À propos du praticien'}</span>
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{bio}"
                </p>
              </div>

              {/* Quick booking CTA Box */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id={`btn-book-doc-detail-${doctor.id}`}
                  onClick={() => openBooking(undefined, doctor)}
                  className="flex-1 py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 active:scale-98 transition-all cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                  <span>{language === 'ar' ? `حجز موعد مع ${name}` : `Prendre RDV avec ${name}`}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 px-5 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </div>

            </div>

          </div>
        </div>

        {/* Qualifications & Consultation Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Qualifications & Degrees */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-teal-600" />
              <span>{language === 'ar' ? 'المؤهلات العلمية والشهادات' : 'Diplômes & Certifications'}</span>
            </h3>
            
            <ul className="space-y-3">
              {qualifications.map((qual, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{qual}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Consultation Schedule */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>{language === 'ar' ? 'أيام الاستشارة والمواعيد' : 'Jours de Consultation au Cabinet'}</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar' 
                ? 'يستقبل الطبيب المرضى في العيادة خلال الأيام التالية (يرجى الحجز المسبق):'
                : 'Le praticien consulte sur rendez-vous au cabinet selon le planning suivant :'}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {doctor.availableDays.map(day => (
                <span
                  key={day}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  {getDayName(day)}
                </span>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 text-xs text-teal-900 dark:text-teal-300 space-y-1 mt-4">
              <span className="font-bold block">
                {language === 'ar' ? 'ملاحظة للمرضى الجدد:' : 'Information patients :'}
              </span>
              <p>
                {language === 'ar'
                  ? 'يتم تخصيص 45 دقيقة للزيارة الأولى تشمل الفحص الشامل، صور الأشعة الرقمية ومناقشة الخطة العلاجية.'
                  : 'Une première consultation de 45 minutes permet un diagnostic complet avec radiographie numérique et plan de traitement sur-mesure.'}
              </p>
            </div>
          </div>

        </div>

        {/* Treatments performed by this Doctor */}
        {doctorTreatments.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'العلاجات والخدمات التي يقدمها الطبيب' : 'Soins pratiqués par ce praticien'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'ar' ? 'انقر على أي علاج للاطلاع على تفاصيله والأسعار' : 'Cliquez sur un traitement pour voir les détails cliniques et tarifs'}
                </p>
              </div>

              <button
                onClick={() => navigateToView('services')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'ar' ? 'جميع العلاجات' : 'Voir tous les soins'}</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {doctorTreatments.map(srv => (
                <div
                  key={srv.id}
                  onClick={() => navigateToService(srv.slug || srv.id)}
                  className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-200">
                      <img
                        src={srv.imageUrl}
                        alt={srv.name[language]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors line-clamp-1">
                      {srv.name[language]}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {srv.shortDescription[language]}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{srv.durationMinutes} min</span>
                    <span className="font-extrabold text-teal-700 dark:text-teal-400">
                      {srv.priceDZD.toLocaleString()} {t.common.dzd}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Cases performed by this Doctor */}
        {doctorCases.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>{language === 'ar' ? `حالات قبل / بعد بإشراف ${name}` : `Cas Cliniques réalisés par ${name}`}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctorCases.map(c => (
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
                      {c.duration[language] || c.duration.fr}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Doctors to Discover */}
        {otherDoctors.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'أطباء آخرون في الفريق الطبي' : 'Autres membres de l’équipe médicale'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherDoctors.map(other => (
                <div
                  key={other.id}
                  onClick={() => navigateToDoctor(other.id)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <img
                    src={other.imageUrl}
                    alt={other.name[language]}
                    className="w-12 h-12 rounded-xl object-cover border border-teal-500/30"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                      {other.name[language]}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {other.specialty[language]}
                    </p>
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
