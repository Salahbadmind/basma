import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Phone, MessageCircle, Mail, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { clinicInfo, language, t } = useClinic();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Consultation & Renseignement',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'Consultation & Renseignement',
        message: '',
      });
    }, 4000);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-teal-400" />
            <span>{t.contactSection.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.contactSection.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {t.contactSection.subtitle}
          </p>
        </div>

        {/* 2-Column Grid: Left Contact Channels, Right Interactive Message Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Direct Channels */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Phone Card */}
            <a
              id="contact-card-phone"
              href={`tel:${clinicInfo.phone}`}
              className="group p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-teal-500 transition-all flex items-center gap-4 block"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">{t.contactSection.phoneLabel}</span>
                <span className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                  {clinicInfo.phone}
                </span>
              </div>
            </a>

            {/* WhatsApp Card */}
            <a
              id="contact-card-whatsapp"
              href={`https://wa.me/${clinicInfo.whatsapp.replace('+', '')}?text=${encodeURIComponent(
                language === 'ar' ? 'مرحباً عيادة البهجة، أود الاستفسار عن خدمة طبية.' : 'Bonjour Cabinet El Bahdja, je souhaite un renseignement.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500 transition-all flex items-center gap-4 block"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 fill-emerald-400" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">{t.contactSection.whatsappLabel}</span>
                <span className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {clinicInfo.whatsapp}
                </span>
              </div>
            </a>

            {/* Emergency Line Card */}
            <a
              id="contact-card-emergency"
              href={`tel:${clinicInfo.emergencyPhone}`}
              className="group p-5 rounded-2xl bg-rose-950/30 border border-rose-800/40 hover:border-rose-500 transition-all flex items-center gap-4 block"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <span className="text-xs text-rose-300 block font-medium">{t.contactSection.emergencyPhoneLabel}</span>
                <span className="text-base font-bold text-white group-hover:text-rose-200 transition-colors">
                  {clinicInfo.emergencyPhone}
                </span>
              </div>
            </a>

            {/* Email Card */}
            <a
              id="contact-card-email"
              href={`mailto:${clinicInfo.email}`}
              className="group p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500 transition-all flex items-center gap-4 block"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">{t.contactSection.emailLabel}</span>
                <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {clinicInfo.email}
                </span>
              </div>
            </a>

          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl">
              
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t.contactSection.form.successTitle}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    {t.contactSection.form.successSubtitle}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {language === 'ar' ? 'أرسل لنا رسالة أو استفساراً' : 'Envoyer un message au secrétariat'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {t.contactSection.form.name} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t.contactSection.form.namePlaceholder}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {t.contactSection.form.phone} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t.contactSection.form.phonePlaceholder}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {t.contactSection.form.email}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t.contactSection.form.emailPlaceholder}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {t.contactSection.form.subject}
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="Consultation & Renseignement">Consultation / Renseignement</option>
                        <option value="Devis Implants / Esthétique">Devis Implants / Hollywood Smile</option>
                        <option value="Urgence Dentaire">Urgence Dentaire</option>
                        <option value="Autre demande">Autre demande</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {t.contactSection.form.message} *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t.contactSection.form.messagePlaceholder}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    id="submit-contact-form-btn"
                    className="w-full py-3.5 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t.contactSection.form.submitBtn}</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
