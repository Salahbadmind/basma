import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Shield, Activity, CheckCircle, Info, Stethoscope, Award } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

interface ToothData {
  id: number;
  name: { fr: string; ar: string; en: string };
  type: 'incisor' | 'canine' | 'premolar' | 'molar';
  position: 'upper' | 'lower';
  commonIssues: { fr: string; ar: string; en: string };
  bestTreatment: { fr: string; ar: string; en: string };
  duration: { fr: string; ar: string; en: string };
  successRate: string;
}

const teethDatabase: ToothData[] = [
  // Upper Jaw (1 to 16)
  { id: 11, name: { fr: 'Incisive Centrale Sup.', ar: 'القواطع المركزية العلوية', en: 'Upper Central Incisor' }, type: 'incisor', position: 'upper', commonIssues: { fr: 'Coloration, fracture, espace (diastème)', ar: 'تصبغات، كسور، فراغات', en: 'Discoloration, chipping, gaps' }, bestTreatment: { fr: 'Facettes Céramique Emax / Blanchiment laser', ar: 'فيسيت إيماكس / تبييض بالليزر', en: 'Emax Veneers / Laser Whitening' }, duration: { fr: '1 à 2 séances', ar: '1 إلى جلسة 2', en: '1-2 sessions' }, successRate: '99%' },
  { id: 12, name: { fr: 'Incisive Latérale Sup.', ar: 'القواطع الجانبية العلوية', en: 'Upper Lateral Incisor' }, type: 'incisor', position: 'upper', commonIssues: { fr: 'Usure, forme conoïde, carie interdentaire', ar: 'تآكل، شكل مخروطي، تسوس', en: 'Wear, peg shape, interdental caries' }, bestTreatment: { fr: 'Facettes ou Composite esthétique 3D', ar: 'عدسات أو حشو تجميلي 3D', en: 'Veneers or 3D Composite bonding' }, duration: { fr: '1 séance', ar: 'جلسة واحدة', en: '1 session' }, successRate: '98%' },
  { id: 13, name: { fr: 'Canine Supérieure', ar: 'الناب العلوي', en: 'Upper Canine' }, type: 'canine', position: 'upper', commonIssues: { fr: 'Attrition, sensibilité cervicale', ar: 'تآكل الحواف، حساسية الجذر', en: 'Attrition, cervical sensitivity' }, bestTreatment: { fr: 'Reconstruction esthétique & Gouttière', ar: 'إعادة بناء تجميلي', en: 'Aesthetic restoration & Night guard' }, duration: { fr: '1 séance', ar: 'جلسة واحدة', en: '1 session' }, successRate: '99%' },
  { id: 14, name: { fr: '1ère Prémolaire Sup.', ar: 'الضاحك العلوي الأول', en: 'Upper 1st Premolar' }, type: 'premolar', position: 'upper', commonIssues: { fr: 'Carie profonde, fracture cuspide', ar: 'تسوس عميق، كسر الحدبة', en: 'Deep caries, cusp fracture' }, bestTreatment: { fr: 'Inlay / Onlay Céramique (CFAO)', ar: 'حشوة خزفية Inlay/Onlay', en: 'Ceramic Inlay/Onlay (CAD/CAM)' }, duration: { fr: '1 séance (RDV unique)', ar: 'جلسة واحدة (سريعة)', en: '1 visit (same-day)' }, successRate: '97%' },
  { id: 16, name: { fr: '1ère Molaire Sup.', ar: 'الطاحن العلوي الأول', en: 'Upper 1st Molar' }, type: 'molar', position: 'upper', commonIssues: { fr: 'Pulpite, carie occlusale, besoin de couronne', ar: 'التهاب العصب، تسوس، حاجة لتاج', en: 'Pulpitis, occlusal decay, crown needed' }, bestTreatment: { fr: 'Traitement de canal 3D + Couronne Zircone', ar: 'علاج عصب 3D + تاج زركونيوم', en: '3D Root Canal + Zirconia Crown' }, duration: { fr: '1 à 2 séances', ar: 'جلسة إلى جلستين', en: '1-2 sessions' }, successRate: '96%' },
  // Lower Jaw
  { id: 41, name: { fr: 'Incisive Inférieure', ar: 'القواطع السفلية', en: 'Lower Incisor' }, type: 'incisor', position: 'lower', commonIssues: { fr: 'Tartre, encombrement dentaire, usure', ar: 'ترسبات الجير، ازدحام الأسنان', en: 'Calculus, dental crowding, wear' }, bestTreatment: { fr: 'Détartrage ultrasonique & Orthodontie invisible', ar: 'تنظيف الجير وتقويم شفاف', en: 'Ultrasonic scaling & Clear aligners' }, duration: { fr: '30 min / 3-6 mois', ar: '30 دقيقة / 3-6 أشهر', en: '30 min / 3-6 mos' }, successRate: '99%' },
  { id: 44, name: { fr: 'Prémolaire Inférieure', ar: 'الضاحك السفلي', en: 'Lower Premolar' }, type: 'premolar', position: 'lower', commonIssues: { fr: 'Nécrose pulpaire, fissure', ar: 'موت العصب، تشقق', en: 'Pulp necrosis, micro-crack' }, bestTreatment: { fr: 'Endodontie microscopique & Onlay', ar: 'علاج مجهري وحشوة خزفية', en: 'Microscopic endo & Onlay' }, duration: { fr: '1 séance', ar: 'جلسة واحدة', en: '1 session' }, successRate: '98%' },
  { id: 46, name: { fr: 'Molaire Inférieure (Implant)', ar: 'الطاحن السفلي (مفقود / مزروع)', en: 'Lower Molar (Implant Area)' }, type: 'molar', position: 'lower', commonIssues: { fr: 'Absence dentaire, perte osseuse', ar: 'فقدان سن، تراجع عظمي', en: 'Tooth loss, bone resorption' }, bestTreatment: { fr: 'Implant Titane 3D & Couronne Zircone', ar: 'زراعة تيتانيوم 3D وتاج زركونيوم', en: '3D Titanium Implant & Zirconia Crown' }, duration: { fr: 'Pose 3D + Cicatrisation', ar: 'زرع بالدليل + التئام', en: 'Guided placement + Healing' }, successRate: '98.5%' },
];

export const Interactive3DTeeth: React.FC = () => {
  const { language } = useClinic();
  const [selectedTooth, setSelectedTooth] = useState<ToothData>(teethDatabase[0]);
  const [activeArch, setActiveArch] = useState<'upper' | 'lower'>('upper');
  const [viewMode, setViewMode] = useState<'anatomy' | 'treatment' | 'simulation'>('anatomy');

  const filteredTeeth = teethDatabase.filter(t => t.position === activeArch);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>{language === 'ar' ? 'نموذج الأسنان والتشخيص الذكي' : language === 'fr' ? 'Simulateur 3D & Anatomie Dentaire' : '3D Dental Anatomy & Simulator'}</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            {language === 'ar' ? 'استكشف صحة أسنانك تفاعلياً' : language === 'fr' ? 'Explorez l’anatomie et les soins par dent' : 'Interactive Dental Arch & Treatment Map'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'ar' ? 'انقر على أي سن لعرض التشخيص الموصى به والعلاج الرقمي ثلاثي الأبعاد.' : language === 'fr' ? 'Cliquez sur une dent de l’arcade pour découvrir le traitement CFAO / 3D idéal.' : 'Click any tooth on the arch to inspect personalized 3D clinical solutions.'}
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 self-start">
          <button
            onClick={() => setViewMode('anatomy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'anatomy' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            {language === 'ar' ? 'التشريح' : language === 'fr' ? 'Anatomie' : 'Anatomy'}
          </button>
          <button
            onClick={() => setViewMode('treatment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'treatment' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            {language === 'ar' ? 'العلاج 3D' : language === 'fr' ? 'Soins 3D' : '3D Care'}
          </button>
          <button
            onClick={() => setViewMode('simulation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'simulation' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            {language === 'ar' ? 'المحاكاة' : language === 'fr' ? 'Simulation' : 'Simulation'}
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Dental Arch Visualizer (Left 7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/60 rounded-2xl p-6 border border-slate-800/80 flex flex-col items-center justify-center relative min-h-[320px]">
          
          {/* Arch Switcher */}
          <div className="flex items-center gap-2 mb-6 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveArch('upper')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeArch === 'upper' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              {language === 'ar' ? 'الوسادة العلوية' : language === 'fr' ? 'Arcade Supérieure' : 'Upper Arch'}
            </button>
            <button
              onClick={() => setActiveArch('lower')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeArch === 'lower' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              {language === 'ar' ? 'الوسادة السفلية' : language === 'fr' ? 'Arcade Inférieure' : 'Lower Arch'}
            </button>
          </div>

          {/* Interactive Teeth Map */}
          <div className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-6">
            {filteredTeeth.map((tooth) => {
              const isSelected = selectedTooth.id === tooth.id;
              return (
                <motion.button
                  key={tooth.id}
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTooth(tooth)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/50'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-teal-400'
                  }`}>
                    {tooth.id}
                  </div>
                  <span className="text-[11px] font-medium text-center truncate max-w-[90px]">
                    {tooth.name[language]}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-teal-400 animate-ping" />
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>{language === 'ar' ? 'انقر على رقم السن لتغيير تفاصيل التشخيص والعلاج الفوري' : language === 'fr' ? 'Cliquez sur une dent pour afficher le protocole clinique 3D' : 'Click any tooth tile to inspect clinical protocol'}</span>
          </div>

        </div>

        {/* Selected Tooth Clinical Card (Right 5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl p-6 border border-teal-500/30 space-y-5 relative">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/30">
                {selectedTooth.type.toUpperCase()} • ID #{selectedTooth.id}
              </span>
              <h4 className="text-lg font-bold text-white mt-1.5">
                {selectedTooth.name[language]}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">
              {selectedTooth.successRate}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-1 font-semibold">
                {language === 'ar' ? 'المشاكل الشائعة:' : language === 'fr' ? 'Problèmes fréquents :' : 'Common Issues:'}
              </span>
              <p className="text-slate-200 font-medium">
                {selectedTooth.commonIssues[language]}
              </p>
            </div>

            <div className="bg-teal-950/30 p-3 rounded-xl border border-teal-800/40">
              <span className="text-teal-400 block mb-1 font-semibold flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" />
                {language === 'ar' ? 'العلاج الموصى به (CFAO / 3D):' : language === 'fr' ? 'Traitement Recommandé 3D :' : 'Recommended 3D Treatment:'}
              </span>
              <p className="text-white font-bold">
                {selectedTooth.bestTreatment[language]}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                {language === 'ar' ? 'المدة الزمنية:' : language === 'fr' ? 'Durée estimée :' : 'Est. Duration:'}
              </span>
              <span className="font-semibold text-white">{selectedTooth.duration[language]}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-teal-400" />
                {language === 'ar' ? 'نسبة نجاح الزرع / العلاج:' : language === 'fr' ? 'Taux de réussite clinique :' : 'Clinical Success Rate:'}
              </span>
              <span className="font-bold text-teal-300">{selectedTooth.successRate}</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="#appointment"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{language === 'ar' ? 'حجز موعد لهذا العلاج' : language === 'fr' ? 'Réserver une consultation pour ce soin' : 'Book Consultation for This Treatment'}</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
