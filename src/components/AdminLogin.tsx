import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Lock, Mail, Key, Shield, ArrowRight, X, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, toggleAdminMode, language, t } = useClinic();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(email, password);
    if (!success) {
      setError(true);
    } else {
      setError(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white mx-auto shadow-md shadow-teal-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.adminAuth.loginTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.adminAuth.loginSubtitle}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{t.adminAuth.errorInvalid}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.adminAuth.emailLabel}</span>
            </label>
            <input
              id="admin-email-input"
              type="email"
              required
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError(false);
              }}
              placeholder={t.adminAuth.emailPlaceholder}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.adminAuth.passwordLabel}</span>
            </label>
            <div className="relative">
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder={t.adminAuth.passwordPlaceholder}
                className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-hidden"
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            className="w-full py-3 bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-sm rounded-xl shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <span>{t.adminAuth.loginBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => toggleAdminMode(false)}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            {t.nav.backToSite}
          </button>
        </div>

      </div>
    </div>
  );
};
