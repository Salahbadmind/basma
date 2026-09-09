import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { MessageCircle, X, Send, Sparkles, PhoneCall, Calendar } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { clinicInfo, language, t, openBooking } = useClinic();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const quickPrompts = [
    {
      label: language === 'ar' ? '🦷 حجز موعد عاجل' : '🦷 Prendre un RDV',
      text: language === 'ar' ? 'السلام عليكم، أود حجز موعد استشارة في أقرب وقت.' : 'Bonjour, je souhaite réserver une consultation.',
    },
    {
      label: language === 'ar' ? '💰 استفسار عن الأسعار' : '💰 Demande de devis',
      text: language === 'ar' ? 'مرحباً، أود معرفة تكلفة علاج تجميل / زراعة الأسنان.' : 'Bonjour, je souhaite avoir une estimation de prix pour un soin.',
    },
    {
      label: language === 'ar' ? '🚨 حالة طارئة' : '🚨 Urgence dentaire',
      text: language === 'ar' ? 'عندي ألم شديد في الأسنان، هل لديكم موعد طارئ اليوم؟' : 'J’ai une douleur dentaire aiguë, avez-vous un créneau d’urgence aujourd’hui ?',
    },
  ];

  const handleSend = (textToSend?: string) => {
    const message = textToSend || customMsg || 'Bonjour Cabinet Dentaire El Bahdja';
    const url = `https://wa.me/${clinicInfo.whatsapp.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setCustomMsg('');
  };

  return (
    <div className="fixed bottom-16 sm:bottom-5 right-3 sm:right-5 z-40 flex flex-col items-end">
      
      {/* Interactive Chat Bubble Popup */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-1.5rem)] max-w-sm sm:w-88 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-linear-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                  🦷
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">{clinicInfo.name[language]}</h4>
                <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                  ● En ligne • Réponse en &lt; 15 min
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50 space-y-3 text-xs">
            <div className="p-3 bg-white rounded-2xl shadow-xs border border-slate-100 text-slate-700 leading-relaxed">
              {language === 'ar'
                ? 'مرحباً بكم في عيادة البهجة! كيف يمكننا مساعدتكم اليوم؟'
                : 'Bonjour ! Bienvenue au Cabinet Dentaire El Bahdja. Comment pouvons-nous vous aider ?'}
            </div>

            {/* Quick Choices */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'ar' ? 'خيارات سريعة:' : 'Questions fréquentes :'}
              </span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q.text)}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-between"
                >
                  <span>{q.label}</span>
                  <Send className="w-3 h-3 text-emerald-600 opacity-60" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-2 flex gap-1.5">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Écrivez votre message...'}
                className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSend()}
                className="px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        id="floating-whatsapp-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xl shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        aria-label="Contacter sur WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="hidden sm:inline font-semibold">
          {language === 'ar' ? 'تواصل عبر واتساب' : 'WhatsApp Direct'}
        </span>
      </button>

    </div>
  );
};
