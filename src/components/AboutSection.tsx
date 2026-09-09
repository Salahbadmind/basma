import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  Cpu, 
  Award,
  CheckCircle2
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { language, t } = useClinic();

  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?q=80&w=800&auto=format&fit=crop',
      title: language === 'ar' ? 'صالة الاستقبال والراحة' : 'Espace d’Accueil & Lounge',
    },
    {
      url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop',
      title: language === 'ar' ? 'غرفة الجراحة وزراعة الأسنان' : 'Bloc Chirurgical & Implantologie',
    },
    {
      url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop',
      title: language === 'ar' ? 'وحدة التعقيم الطبي المعتمدة' : 'Unité de Stérilisation Médicale',
    },
    {
      url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=800&auto=format&fit=crop',
      title: language === 'ar' ? 'ماسح ثلاثي الأبعاد 3D CBCT' : 'Scanner 3D & CFAO Numérique',
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.aboutSection.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.aboutSection.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t.aboutSection.subtitle}
          </p>
        </div>

        {/* Story & Philosophy 2-Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {language === 'ar'
                ? 'رعايتكم أولويتنا: طب أسنان حديث، هادئ وخالٍ من الألم تماماً'
                : 'Une dentisterie moderne, humaine et sans anxiété'}
            </h3>
            
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.aboutSection.storyText}
            </p>

            {/* 4 Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                  <HeartHandshake className="w-4 h-4 text-teal-600" />
                  <span>{t.aboutSection.pillars.painless.title}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {t.aboutSection.pillars.painless.desc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                  <Cpu className="w-4 h-4 text-teal-600" />
                  <span>{t.aboutSection.pillars.technology.title}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {t.aboutSection.pillars.technology.desc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>{t.aboutSection.pillars.sterilization.title}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {t.aboutSection.pillars.sterilization.desc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>{t.aboutSection.pillars.transparency.title}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {t.aboutSection.pillars.transparency.desc}
                </p>
              </div>
            </div>

          </div>

          {/* Right Showcase Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-200">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop"
                alt="Cabinet Dentaire El Bahdja Team & Facility"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-xs text-teal-300 font-bold uppercase tracking-wider">
                  Alger • Hydra / Sidi Yahia
                </span>
                <h4 className="text-lg font-bold">Plateau Technique Dentaire de Pointe</h4>
                <p className="text-xs text-slate-300">
                  Conçu selon les exigences européennes de sécurité sanitaire et de confort du patient.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Clinic Photo Tour Gallery */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900">
              {t.aboutSection.galleryTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'جولة مصورة داخل مرافق العيادة الحديثة والمعقمة'
                : 'Visite virtuelle de nos espaces de soins, de stérilisation et de diagnostic.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 h-60">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-xs font-bold block">{img.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
