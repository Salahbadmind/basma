import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { Phone, Mail, MapPin, Globe, Shield, Calendar, Clock, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  const { clinicInfo, services, language, setLanguage, t, openBooking, openServiceDetail } = useClinic();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-900">
          
          {/* Col 1: Brand & Presentation (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-teal-500/20">
                🦷
              </div>
              <div>
                <span className="font-bold text-base text-white block">
                  {clinicInfo.name[language]}
                </span>
                <span className="text-[11px] text-teal-400 font-medium">
                  {language === 'ar' ? 'مركز زراعة وتجميل الأسنان' : 'Centre d’Excellence & Implantologie'}
                </span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              {t.footer.desc}
            </p>

            {/* Social Links */}
            {clinicInfo.socialLinks && (
              <div className="flex items-center gap-2 pt-1">
                {clinicInfo.socialLinks.facebook && (
                  <a
                    href={clinicInfo.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-teal-600 hover:text-white text-slate-400 flex items-center justify-center transition-all"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {clinicInfo.socialLinks.instagram && (
                  <a
                    href={clinicInfo.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-pink-600 hover:text-white text-slate-400 flex items-center justify-center transition-all"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {clinicInfo.socialLinks.youtube && (
                  <a
                    href={clinicInfo.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-red-600 hover:text-white text-slate-400 flex items-center justify-center transition-all"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {clinicInfo.socialLinks.linkedin && (
                  <a
                    href={clinicInfo.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-400 flex items-center justify-center transition-all"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  language === 'fr' ? 'bg-teal-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🇫🇷 FR
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  language === 'ar' ? 'bg-teal-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🇩🇿 العربية
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  language === 'en' ? 'bg-teal-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-teal-400 transition-colors">{t.nav.home}</a></li>
              <li><a href="#services" className="hover:text-teal-400 transition-colors">{t.nav.services}</a></li>
              <li><a href="#products" className="hover:text-teal-400 transition-colors">{t.nav.products}</a></li>
              <li><a href="#doctors" className="hover:text-teal-400 transition-colors">{t.nav.doctors}</a></li>
              <li><a href="#before-after" className="hover:text-teal-400 transition-colors">{t.nav.beforeAfter}</a></li>
              <li><a href="#pricing" className="hover:text-teal-400 transition-colors">{t.nav.pricing}</a></li>
              <li><a href="#reviews" className="hover:text-teal-400 transition-colors">{t.nav.reviews}</a></li>
              <li><a href="#location" className="hover:text-teal-400 transition-colors">{t.nav.location}</a></li>
            </ul>
          </div>

          {/* Col 3: Main Treatments (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.treatments}
            </h4>
            <ul className="space-y-1.5 grid grid-cols-1 gap-1">
              {services.slice(0, 7).map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => openServiceDetail(s)}
                    className="text-left text-xs text-slate-400 hover:text-teal-300 transition-colors truncate block w-full cursor-pointer"
                  >
                    • {s.name[language]}
                  </button>
                </li>
              ))}
              <li>
                <a href="#services" className="text-teal-400 font-semibold hover:underline block pt-1">
                  {language === 'ar' ? '← عرض كل العلاجات' : '→ Voir tous les soins'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.contactInfo}
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{clinicInfo.address[language]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`tel:${clinicInfo.phone}`} className="hover:text-teal-300">{clinicInfo.phone}</a>
              </div>
              <div className="flex items-center gap-2 text-rose-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                <span>{t.nav.emergency}: {clinicInfo.emergencyPhone || clinicInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{clinicInfo.openingHours.weekdays}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => openBooking()}
                className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.nav.bookAppointment}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {currentYear} {clinicInfo.name[language]}. {t.footer.rights}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">{t.footer.confidentiality}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
