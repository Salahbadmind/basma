import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { Doctor } from '../types';
import { 
  Stethoscope, 
  Award, 
  Clock, 
  Globe, 
  Star, 
  Calendar, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const DoctorsSection: React.FC = () => {
  const { doctors, language, t, openBooking, navigateToDoctor } = useClinic();

  const getDayName = (dayIndex: number) => {
    const daysFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (language === 'ar') return daysAr[dayIndex];
    if (language === 'en') return daysEn[dayIndex];
    return daysFr[dayIndex];
  };

  return (
    <section id="doctors" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
            <span>{t.doctorsSection.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.doctorsSection.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t.doctorsSection.subtitle}
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              id={`doctor-card-${doctor.id}`}
              className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Doctor Top Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div 
                    onClick={() => navigateToDoctor(doctor.id)}
                    className="relative shrink-0 cursor-pointer group/img"
                  >
                    <img
                      src={doctor.imageUrl}
                      alt={doctor.name[language]}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover object-center shadow-md border-2 border-white ring-2 ring-teal-500/20 group-hover/img:scale-103 transition-transform"
                    />
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-slate-950" />
                      {doctor.rating}
                    </span>
                  </div>

                  <div className="text-center sm:text-left space-y-1">
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-100/70 px-2.5 py-0.5 rounded-full mb-1">
                      <Clock className="w-3 h-3" />
                      <span>{doctor.experienceYears}+ {language === 'ar' ? 'سنوات خبرة' : t.doctorsSection.experience}</span>
                    </div>

                    <h3 
                      onClick={() => navigateToDoctor(doctor.id)}
                      className="text-xl font-bold text-slate-900 leading-tight hover:text-teal-600 transition-colors cursor-pointer"
                    >
                      {doctor.name[language]}
                    </h3>
                    <p className="text-xs font-semibold text-teal-800">
                      {doctor.title[language]}
                    </p>
                    <p className="text-xs text-slate-500 pt-0.5">
                      {doctor.specialty[language]}
                    </p>
                  </div>
                </div>

                {/* Bio text */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic border-l-2 border-teal-500/30 pl-3">
                  "{doctor.bio[language]}"
                </p>

                {/* Qualifications & Degrees */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t.doctorsSection.qualifications}</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {doctor.qualifications[language].map((qual, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Available Days & Languages Spoken */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1 font-medium">{t.doctorsSection.workingDays}:</span>
                    <div className="flex flex-wrap gap-1">
                      {doctor.availableDays.map((d) => (
                        <span key={d} className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-medium text-[11px]">
                          {getDayName(d)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1 font-medium">{t.doctorsSection.languages}:</span>
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Globe className="w-3.5 h-3.5 text-teal-600" />
                      <span>{doctor.languages.join(' • ')}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons: Book with this doctor & View Profile */}
              <div className="pt-6 mt-6 border-t border-slate-200/80 flex flex-col sm:flex-row gap-2">
                <button
                  id={`btn-book-doc-${doctor.id}`}
                  onClick={() => openBooking(undefined, doctor)}
                  className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-teal-600/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t.common.bookWithDoctor} {doctor.name[language].split(' ')[1]}</span>
                </button>

                <button
                  id={`btn-profile-doc-${doctor.id}`}
                  onClick={() => navigateToDoctor(doctor.id)}
                  className="py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{language === 'ar' ? 'الملف الطبي' : 'Profil'}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
