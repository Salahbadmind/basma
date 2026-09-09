import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Sparkles, Clock, UserCheck, ShieldCheck, ChevronLeft, ChevronRight, Box } from 'lucide-react';
import { Interactive3DTeeth } from './Interactive3DTeeth';

export const BeforeAfterSection: React.FC = () => {
  const { beforeAfterCases, language, t } = useClinic();
  const [activeMode, setActiveMode] = useState<'cases' | '3d_teeth'>('cases');
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCase = beforeAfterCases[activeCaseIndex] || beforeAfterCases[0];

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <section id="before-after" className="py-20 lg:py-28 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>{t.beforeAfterSection.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.beforeAfterSection.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {t.beforeAfterSection.subtitle}
          </p>
        </div>

        {/* Mode Switcher: Cases vs 3D Teeth */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveMode('cases')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMode === 'cases'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'ar' ? 'معرض حالات قبل وبعد' : language === 'fr' ? 'Galerie Avant / Après' : 'Before / After Gallery'}</span>
          </button>
          
          <button
            onClick={() => setActiveMode('3d_teeth')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMode === '3d_teeth'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>{language === 'ar' ? 'محاكي الأسنان 3D' : language === 'fr' ? 'Simulateur 3D Dents' : '3D Teeth Simulator'}</span>
          </button>
        </div>

        {activeMode === '3d_teeth' ? (
          <div className="max-w-5xl mx-auto">
            <Interactive3DTeeth />
          </div>
        ) : (
          <>
            {/* Case Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {beforeAfterCases.map((item, idx) => (
                <button
                  key={item.id}
                  id={`tab-case-${item.id}`}
                  onClick={() => {
                    setActiveCaseIndex(idx);
                    setSliderPosition(50);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeCaseIndex === idx
                      ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30 font-bold scale-102'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {item.title[language].split(' - ')[0]}
                </button>
              ))}
            </div>

            {/* Main Interactive Comparison Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
              
              {/* Slider Stage (Left 7 Cols) */}
              <div className="lg:col-span-7">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700 select-none bg-slate-950">
                  
                  <div
                    ref={containerRef}
                    className="relative h-[340px] sm:h-[420px] w-full cursor-ew-resize overflow-hidden"
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                  >
                    {/* AFTER Image (Full background) */}
                    <img
                      src={activeCase.afterImage}
                      alt="After smile treatment"
                      className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                      draggable={false}
                    />
                    
                    {/* AFTER Label */}
                    <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-lg bg-teal-600/90 backdrop-blur-md text-white text-xs font-bold shadow-md">
                      {t.beforeAfterSection.afterLabel} ✨
                    </div>

                    {/* BEFORE Image (Clipped overlay) */}
                    <div
                      className="absolute inset-0 overflow-hidden pointer-events-none"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={activeCase.beforeImage}
                        alt="Before smile treatment"
                        className="absolute inset-0 w-full h-full object-cover object-center max-w-none pointer-events-none"
                        style={{
                          width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                          height: '100%',
                        }}
                        draggable={false}
                      />
                      {/* BEFORE Label */}
                      <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-slate-200 text-xs font-bold shadow-md">
                        {t.beforeAfterSection.beforeLabel}
                      </div>
                    </div>

                    {/* Vertical Divider Handle */}
                    <div
                      className="absolute top-0 bottom-0 z-30 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-teal-500 cursor-ew-resize">
                        <div className="flex items-center gap-0.5 text-slate-700">
                          <ChevronLeft className="w-3.5 h-3.5 -mr-1" />
                          <ChevronRight className="w-3.5 h-3.5 -ml-1" />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Slider Helper caption */}
                  <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-center text-xs text-slate-400">
                    <span>↔ {t.beforeAfterSection.sliderInstruction}</span>
                  </div>

                </div>
              </div>

              {/* Case Clinical Breakdown (Right 5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-slate-700 space-y-4">
                  
                  <div>
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-1">
                      {activeCase.category}
                    </span>
                    <h3 className="text-xl font-bold text-white leading-snug">
                      {activeCase.title[language]}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activeCase.description[language]}
                  </p>

                  {/* Metadata Pills */}
                  <div className="space-y-2 pt-2 border-t border-slate-700/80 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        {t.beforeAfterSection.treatmentDuration}
                      </span>
                      <span className="font-semibold text-white">{activeCase.duration[language]}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                        {t.beforeAfterSection.practitioner}
                      </span>
                      <span className="font-semibold text-teal-300">{activeCase.doctorName}</span>
                    </div>
                  </div>

                </div>

                {/* Informed Patient Consent Notice */}
                <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/40 text-teal-200 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    {t.beforeAfterSection.consentNotice}
                  </p>
                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </section>
  );
};
