import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { MapPin, Navigation, Car, Clock, Train, Phone, ExternalLink } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const { clinicInfo, language, t } = useClinic();

  const mapsUrl = clinicInfo.googleMapsUrl || 'https://maps.google.com/?q=Sidi+Yahia+Hydra+Algiers';

  return (
    <section id="location" className="py-20 lg:py-28 bg-white dark:bg-slate-950 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-200 dark:border-cyan-800">
            <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{t.locationSection.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.locationSection.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.locationSection.subtitle}
          </p>
        </div>

        {/* 2-Column Grid: Left Details & Schedules, Right Simulated/Embed Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            
            {/* Address & Navigation Card */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {clinicInfo.name[language]}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {clinicInfo.address[language]}
                  </p>
                  <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-1">
                    {clinicInfo.wilaya || '16 - Alger'}, {clinicInfo.city}
                  </p>
                </div>
              </div>

              <a
                id="google-maps-directions-link"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-teal-600/20 active:scale-98 transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>{t.locationSection.getDirections}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            {/* Parking & Landmarks Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 space-y-1">
                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-xs">
                  <Car className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{t.locationSection.parkingTitle}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {clinicInfo.parkingInfo?.[language] || t.locationSection.parkingVal}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                  <Train className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{t.locationSection.landmarksTitle}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {clinicInfo.landmarks?.[language] || t.locationSection.landmarksVal}
                </p>
              </div>
            </div>

            {/* Opening Hours Schedule */}
            <div className="bg-slate-900 dark:bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-md border border-slate-800">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>{t.locationSection.hoursTitle}</span>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-800">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">{language === 'ar' ? 'من السبت إلى الخميس' : 'Samedi - Jeudi'}:</span>
                  <span className="font-bold text-teal-400">{clinicInfo.openingHours.weekdays}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-300">{language === 'ar' ? 'الجمعة' : 'Vendredi'}:</span>
                  <span className="font-bold text-amber-400">{clinicInfo.openingHours.friday}</span>
                </div>

                {clinicInfo.openingHours.saturday && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-300">{language === 'ar' ? 'السبت' : 'Samedi'}:</span>
                    <span className="font-bold text-cyan-400">{clinicInfo.openingHours.saturday}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>{t.nav.emergency} : {clinicInfo.emergencyPhone || clinicInfo.phone}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Google Maps (Iframe Embed OR Vector Interactive Map) */}
          <div className="lg:col-span-7">
            <div className="relative h-full min-h-[380px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-900 flex flex-col justify-between">
              
              {clinicInfo.googleMapsEmbedUrl ? (
                <iframe
                  title="Google Maps Location"
                  src={clinicInfo.googleMapsEmbedUrl}
                  className="w-full h-full min-h-[380px] border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <>
                  {/* Map Graphic Canvas / Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#0d948820_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    
                    {/* Central Clinic Pin Beacon */}
                    <div className="relative flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-teal-500/20 animate-ping absolute -top-3" />
                      
                      <div className="relative z-10 w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-xl flex items-center justify-center border-2 border-white dark:border-slate-800">
                        <MapPin className="w-6 h-6" />
                      </div>

                      <div className="mt-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{clinicInfo.name[language]}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{clinicInfo.address[language]}</p>
                      </div>
                    </div>

                  </div>

                  {/* Top Controls Overlay */}
                  <div className="relative z-20 p-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200 dark:border-slate-700">
                      🗺️ {clinicInfo.wilaya || 'Alger'} ({clinicInfo.city})
                    </span>
                    
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold shadow-xs">
                      ● Ouvert aujourd’hui
                    </span>
                  </div>

                  {/* Bottom Quick Action Overlay */}
                  <div className="relative z-20 p-4 bg-linear-to-t from-white dark:from-slate-950 via-white/80 dark:via-slate-950/80 to-transparent">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white">Repères :</strong> {clinicInfo.landmarks?.[language] || 'Facile d’accès avec stationnement réservé aux patients.'}
                      </div>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-4 py-2 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Ouvrir dans Google Maps
                      </a>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
