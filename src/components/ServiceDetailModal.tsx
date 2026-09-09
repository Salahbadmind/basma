import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { 
  X, 
  Clock, 
  Calendar, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const ServiceDetailModal: React.FC = () => {
  const { selectedServiceDetail, closeServiceDetail, openBooking, doctors, language, t } = useClinic();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!selectedServiceDetail) return null;

  const service = selectedServiceDetail;
  const recommendedDoctor = doctors.find((d) => d.id === service.recommendedDoctorId) || doctors[0];

  const handleBookNow = () => {
    closeServiceDetail();
    openBooking(service, recommendedDoctor);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header with Image Banner */}
        <div className="relative h-48 sm:h-56 bg-slate-900 shrink-0">
          <img
            src={service.imageUrl}
            alt={service.name[language]}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/50 to-transparent" />
          
          {/* Close Button */}
          <button
            id="close-service-detail-btn"
            onClick={closeServiceDetail}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Titles */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-1 border border-teal-500/40">
                {service.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {service.name[language]}
              </h2>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-slate-300 block">{t.common.fromPrice}</span>
              <span className="text-xl sm:text-2xl font-black text-teal-400">
                {service.priceDZD.toLocaleString()} {t.common.dzd}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto">
          
          {/* Quick Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <span className="text-slate-400 block">{t.common.duration}</span>
                <span className="font-bold text-slate-800">{service.durationMinutes} {t.common.minutes}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <span className="text-slate-400 block">{language === 'ar' ? 'المعايير' : 'Norme'}</span>
                <span className="font-bold text-slate-800">ISO 9001 / CE</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <span className="text-slate-400 block">{language === 'ar' ? 'الطبيب المختص' : 'Praticien'}</span>
                <span className="font-bold text-slate-800 line-clamp-1">{recommendedDoctor.name[language]}</span>
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              {language === 'ar' ? 'نبذة عن العلاج' : 'Présentation du Soin'}
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {service.fullDescription[language]}
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              {t.serviceDetail.benefits}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {service.benefits[language].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/50 border border-teal-100 text-xs sm:text-sm text-slate-800">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Procedure Steps Workflow */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              {t.serviceDetail.procedureSteps}
            </h3>
            <div className="space-y-3">
              {service.procedureSteps.map((step) => (
                <div key={step.step} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {step.title[language]}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {step.desc[language]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Accordion */}
          {service.faqs && service.faqs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {t.serviceDetail.faqs}
              </h3>
              <div className="space-y-2">
                {service.faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full p-3.5 text-left text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                        {faq.q[language]}
                      </span>
                      {openFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {openFaqIndex === idx && (
                      <div className="p-3.5 pt-0 text-xs text-slate-600 bg-white border-t border-slate-100">
                        {faq.a[language]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Doctor Card */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={recommendedDoctor.imageUrl}
                alt={recommendedDoctor.name[language]}
                className="w-14 h-14 rounded-xl object-cover border border-teal-500/40 shrink-0"
              />
              <div>
                <span className="text-[11px] text-teal-300 font-semibold block">
                  {language === 'ar' ? 'الطبيب الموصى به لهذه الحالة' : 'Spécialiste Référent'}
                </span>
                <h4 className="text-sm font-bold text-white">{recommendedDoctor.name[language]}</h4>
                <p className="text-xs text-slate-400">{recommendedDoctor.title[language]}</p>
              </div>
            </div>

            <button
              onClick={handleBookNow}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.serviceDetail.bookNow}</span>
            </button>
          </div>

        </div>

        {/* Modal Fixed Footer CTA */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={closeServiceDetail}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            {t.common.close}
          </button>

          <button
            id="modal-book-this-service-btn"
            onClick={handleBookNow}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-teal-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{t.serviceDetail.bookNow}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
