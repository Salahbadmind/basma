import React from 'react';
import { motion } from 'motion/react';
import { useClinic } from '../context/ClinicContext';

export const Rotating3DToothHero: React.FC = () => {
  const { language } = useClinic();

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Outer Decorative Gradient Glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-600 rounded-3xl blur-md opacity-40 animate-pulse" />

      {/* Main Card Container */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-teal-500/40 shadow-2xl p-8 flex flex-col items-center justify-center min-h-[440px]">
        
        {/* 360° Rotating Real 3D Tooth Stage */}
        <div className="relative my-6 flex items-center justify-center">
          
          {/* Glowing Aura behind tooth */}
          <div className="absolute w-56 h-56 bg-teal-400/25 rounded-full blur-3xl animate-pulse" />

          {/* Rotating Real 3D Tooth Container */}
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{
              rotateY: { duration: 10, repeat: Infinity, ease: 'linear' }
            }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-52 h-52 flex items-center justify-center filter drop-shadow-[0_20px_35px_rgba(20,184,166,0.4)]"
          >
            <div className="w-full h-full rounded-2xl overflow-hidden border border-teal-400/40 bg-slate-900/80 p-2 shadow-2xl flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1606811841689-23dfddce6395?q=80&w=800&auto=format&fit=crop"
                alt="Real 3D White Tooth Model"
                className="w-full h-full object-cover rounded-xl filter brightness-110 contrast-105"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Orbiting Laser Ring */}
          <div className="absolute inset-0 border border-teal-500/40 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '12s' }}>
            <div className="absolute -top-1.5 left-1/2 w-3.5 h-3.5 bg-teal-300 rounded-full shadow-[0_0_12px_#2dd4bf]" />
          </div>

        </div>

        {/* Bottom Status Info */}
        <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-teal-400 animate-ping" />
            <span className="text-xs font-bold text-slate-100">
              {language === 'ar' ? 'محاكاة عيادة رقمية 3D' : language === 'fr' ? 'Simulation 3D HD Rotative' : '3D Rotating Medical Model'}
            </span>
          </div>
          <span className="text-xs text-teal-300 font-extrabold px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30">
            360° Rotatif
          </span>
        </div>

      </div>
    </div>
  );
};
