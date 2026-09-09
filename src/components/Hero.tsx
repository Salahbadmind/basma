import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { 
  Calendar, 
  MessageCircle, 
  Star, 
  CheckCircle2,
  Clock,
  Users,
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { t, language, openBooking, clinicInfo } = useClinic();

  const mediaUrl = clinicInfo.heroMediaUrl || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1600&auto=format&fit=crop';
  const mediaType = clinicInfo.heroMediaType || 'image';

  return (
    <section id="home" className="relative overflow-hidden text-white pt-16 pb-24 lg:pt-24 lg:pb-32 flex items-center justify-center min-h-[85vh]">
      {/* Background Image or Video with Clean Gradient Overlay (No blur) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {mediaType === 'video' ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover brightness-90"
            src={mediaUrl}
          />
        ) : (
          <img
            src={mediaUrl}
            alt="Clinic Hero Background"
            className="w-full h-full object-cover object-center brightness-90 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-slate-950/30" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold tracking-wide shadow-lg">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{t.hero.badge}</span>
        </div>

        {/* Centered Main Headline & Requested Text */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            <span className="block text-slate-100">{clinicInfo.hero?.titlePart1?.[language] || 'Votre Sourire,'}</span>
            <span className="block bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
              {clinicInfo.hero?.titlePart2?.[language] || 'Notre Expertise.'}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-200 font-normal leading-relaxed max-w-3xl mx-auto pt-2">
            {clinicInfo.hero?.description?.[language] || 'Une dentisterie moderne, sans douleur et personnalisée. Équipements 3D haute technologie et équipe pluridisciplinaire au cœur de Sidi Yahia, Alger.'}
          </p>
        </div>

        {/* Quick Guarantees Bullets */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs sm:text-sm text-teal-200 font-semibold pt-1">
          <span className="flex items-center gap-1.5 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-teal-500/30">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            {language === 'ar' ? 'بروتوكول خالٍ من الألم 100%' : 'Protocole Zéro Douleur'}
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-teal-500/30">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            {language === 'ar' ? 'ماسح ثلاثي الأبعاد 3D CBCT' : 'Imagerie 3D HD & CFAO'}
          </span>
        </div>

        {/* Primary Action Buttons: Book Now + WhatsApp */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            id="hero-book-btn"
            onClick={() => openBooking()}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-base shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 active:scale-98 transition-all flex items-center justify-center gap-3 group cursor-pointer"
          >
            <Calendar className="w-5 h-5 text-slate-950" />
            <span>{t.hero.bookBtn}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            id="hero-whatsapp-btn"
            href={`https://wa.me/${clinicInfo.whatsapp.replace('+', '')}?text=${encodeURIComponent(
              language === 'ar'
                ? 'مرحباً، أود حجز موعد في عيادة البهجة لطب وزراعة الأسنان.'
                : 'Bonjour Cabinet Dentaire El Bahdja, je souhaite réserver une consultation.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-white font-semibold text-base transition-all flex items-center justify-center gap-2.5 group shadow-lg"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping group-hover:bg-emerald-300" />
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>{t.hero.whatsappBtn}</span>
          </a>
        </div>

        {/* Quick Call Emergency Reassurance */}
        <div className="pt-2">
          <p className="text-xs text-slate-300">
            {language === 'ar' ? 'حالة طارئة أو ألم حاد؟ ' : 'Besoin d’un avis urgent ? '}
            <a href={`tel:${clinicInfo.emergencyPhone}`} className="text-teal-300 hover:underline font-bold">
              {t.hero.callEmergency}
            </a>
          </p>
        </div>

        {/* Bottom Trust Indicators Bar (4 Key Trust Metrics) */}
        <div className="mt-16 pt-10 border-t border-slate-700/60 max-w-5xl mx-auto">
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-6">
            {t.hero.trustBarTitle}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Trust 1: Reviews */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 text-center hover:border-teal-500/40 transition-colors shadow-lg">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">4.9 / 5.0</div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">{t.hero.stats.reviews}</div>
            </div>

            {/* Trust 2: Experience */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 text-center hover:border-teal-500/40 transition-colors shadow-lg">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">15+ {language === 'ar' ? 'سنة' : 'Ans'}</div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">{t.hero.stats.experience}</div>
            </div>

            {/* Trust 3: Patients */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 text-center hover:border-teal-500/40 transition-colors shadow-lg">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">12 400+</div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">{t.hero.stats.patients}</div>
            </div>

            {/* Trust 4: Certifications */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 text-center hover:border-teal-500/40 transition-colors shadow-lg">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">ISO & CE</div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">{t.hero.stats.certifications}</div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
