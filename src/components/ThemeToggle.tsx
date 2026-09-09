import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme, t } = useClinic();
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-sm font-medium transition-all duration-300 ${
        isDark
          ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700 shadow-xs'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-xs'
      } ${className}`}
      title={isDark ? t.nav.themeLight : t.nav.themeDark}
      aria-label={isDark ? t.nav.themeLight : t.nav.themeDark}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-300" />
        )}
      </div>
    </button>
  );
};
