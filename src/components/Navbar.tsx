import React, { useState, useEffect, useRef } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Language } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { 
  Phone, 
  Calendar, 
  Menu, 
  X, 
  Globe, 
  Clock, 
  Lock,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  LayoutGrid,
  Home,
  Stethoscope,
  Users,
  Award,
  DollarSign,
  Star,
  Info,
  MapPin,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    t, 
    openBooking, 
    isAdminMode, 
    toggleAdminMode, 
    clinicInfo, 
    currentView, 
    navigateToView,
    theme,
    toggleTheme
  } = useClinic();
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  // Close navigation menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setNavMenuOpen(false);
      }
    };
    if (navMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navMenuOpen]);

  const navLinks = [
    { 
      id: 'home', 
      label: t.nav.home, 
      view: 'home', 
      href: '#home',
      icon: Home,
      desc: language === 'ar' ? 'الصفحة الرئيسية والترحيب' : 'Accueil & présentation',
    },
    { 
      id: 'services', 
      label: t.nav.services, 
      view: 'services', 
      href: '#services',
      icon: Stethoscope,
      desc: language === 'ar' ? 'علاجات، زراعة وتجميل الأسنان' : 'Soins, implants & esthétique',
    },
    { 
      id: 'doctors', 
      label: t.nav.doctors, 
      view: 'doctors', 
      href: '#doctors',
      icon: Users,
      desc: language === 'ar' ? 'فريق أطباء وجراحي الأسنان' : 'Chirurgiens-dentistes qualifiés',
    },
    { 
      id: 'products', 
      label: t.nav.products || 'Boutique (COD)', 
      view: 'products', 
      href: '#products',
      icon: ShoppingBag,
      desc: language === 'ar' ? 'منتجات العناية بالدفع عند الاستلام 58 ولاية' : 'Produits d’hygiène COD 58 Wilayas',
      highlight: true,
      badge: 'COD 58 W'
    },
    { 
      id: 'before-after', 
      label: t.nav.beforeAfter, 
      view: 'before-after', 
      href: '#before-after',
      icon: Award,
      desc: language === 'ar' ? 'حالات سريرية ونتائج حقيقية' : 'Cas cliniques & résultats',
    },
    { 
      id: 'pricing', 
      label: t.nav.pricing, 
      view: 'pricing', 
      href: '#pricing',
      icon: DollarSign,
      desc: language === 'ar' ? 'أسعار شفافة بالدينار الجزائري' : 'Grille tarifaire transparente en DA',
    },
    { 
      id: 'reviews', 
      label: t.nav.reviews, 
      view: 'reviews', 
      href: '#reviews',
      icon: Star,
      desc: language === 'ar' ? 'آراء وتجارب المرضى' : 'Avis vérifiés & témoignages',
    },
    { 
      id: 'about', 
      label: t.nav.about, 
      view: 'about', 
      href: '#about',
      icon: Info,
      desc: language === 'ar' ? 'عن العيادة ومعداتنا المتطورة' : 'À propos du cabinet & matériel',
    },
    { 
      id: 'location', 
      label: t.nav.location, 
      view: 'location', 
      href: '#location',
      icon: MapPin,
      desc: language === 'ar' ? 'العنوان، الخريطة وأوقات العمل' : 'Adresse, Google Maps & horaires',
    },
  ];

  const handleSelectNav = (view: string) => {
    navigateToView(view as any);
    setNavMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Notification / Emergency & Announcement Banner */}
      <div id="top-banner" className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 dark:bg-slate-950 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-medium text-[11px] border border-teal-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              {clinicInfo.city} • {clinicInfo.wilaya || 'Alger'}
            </span>
            {clinicInfo.announcementBanner?.enabled && clinicInfo.announcementBanner?.text?.[language] ? (
              <span className="hidden md:inline text-teal-200/90 font-medium text-[11px] truncate max-w-md">
                {clinicInfo.announcementBanner.text[language]}
              </span>
            ) : (
              <span className="hidden md:inline text-slate-400 text-[11px]">
                <Clock className="w-3.5 h-3.5 inline mr-1 opacity-70" />
                {clinicInfo.openingHours.weekdays}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <a
              id="emergency-top-link"
              href={`tel:${clinicInfo.emergencyPhone}`}
              className="inline-flex items-center gap-1.5 text-rose-300 hover:text-rose-200 transition-colors font-medium text-xs"
            >
              <Phone className="w-3 h-3 text-rose-400" />
              <span>{t.nav.emergency}: {clinicInfo.emergencyPhone}</span>
            </a>

            {/* Quick Admin Toggle (Desktop) */}
            <button
              id="nav-admin-toggle-btn"
              onClick={() => toggleAdminMode()}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                isAdminMode 
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
              title="Accès espace d'administration"
            >
              <Lock className="w-3 h-3" />
              <span>{isAdminMode ? t.nav.backToSite : t.nav.adminPortal}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left Brand Area: Logo + Brand + Menu Trigger */}
            <div className="flex items-center gap-4 lg:gap-6" ref={menuRef}>
              
              {/* Brand Logo & Name */}
              <button 
                id="brand-logo-link" 
                onClick={() => navigateToView('home')} 
                className="flex items-center gap-3 group text-left cursor-pointer shrink-0"
              >
                <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-teal-500 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C7.5 2 4 4.5 4 8c0 3.2 2.2 5.5 3 8.5.8 3 1.5 5.5 5 5.5s4.2-2.5 5-5.5c.8-3 3-5.3 3-8.5 0-3.5-3.5-6-8-6z"/>
                    <path d="M9 10a1.5 1.5 0 0 0 3 0v-2a1.5 1.5 0 0 0-3 0z" opacity="0.6"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {clinicInfo.name[language]}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                    {clinicInfo.tagline?.[language] || (language === 'ar' ? 'مركز زراعة وتجميل الأسنان' : 'Centre d’Excellence & Implantologie')}
                  </span>
                </div>
              </button>

              {/* Navigation Menu Trigger with Icon Next to Logo (Desktop) */}
              <div className="relative hidden sm:block">
                <button
                  id="nav-sections-menu-btn"
                  onClick={() => setNavMenuOpen(!navMenuOpen)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all border cursor-pointer ${
                    navMenuOpen
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 ring-2 ring-teal-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-700 dark:hover:text-teal-300 border-slate-200 dark:border-slate-700'
                  }`}
                  aria-expanded={navMenuOpen}
                  aria-label="Menu des sections"
                >
                  <LayoutGrid className={`w-4 h-4 ${navMenuOpen ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                  <span className="font-semibold">Menu</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${navMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Rich Navigation Dropdown Menu */}
                {navMenuOpen && (
                  <div className="absolute left-0 mt-3 w-[calc(100vw-2rem)] max-w-sm sm:max-w-none sm:w-[540px] md:w-[620px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2">
                    
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {language === 'ar' ? 'أقسام العيادة والخدمات' : 'Sections & Navigation'}
                        </span>
                      </div>
                      <button
                        onClick={() => setNavMenuOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Navigation Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = currentView === link.view;
                        return (
                          <button
                            key={link.id}
                            id={`nav-link-${link.view}`}
                            onClick={() => handleSelectNav(link.view)}
                            className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer border ${
                              isActive
                                ? 'bg-teal-50/90 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 shadow-xs'
                                : 'bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isActive
                                ? 'bg-teal-600 text-white shadow-xs'
                                : link.highlight
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs sm:text-sm font-bold truncate ${
                                  isActive ? 'text-teal-700 dark:text-teal-300' : 'text-slate-900 dark:text-white'
                                }`}>
                                  {link.label}
                                </span>
                                {link.badge && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 uppercase tracking-tight shadow-2xs">
                                    {link.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {link.desc}
                              </p>
                            </div>

                            <ChevronRight className={`w-4 h-4 shrink-0 mt-2.5 transition-transform ${
                              isActive ? 'text-teal-600 dark:text-teal-400 translate-x-0.5' : 'text-slate-400'
                            }`} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Menu Footer with Quick Action */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                        {clinicInfo.address?.[language] || clinicInfo.address?.fr || ''} • {clinicInfo.city}
                      </span>
                      <button
                        onClick={() => {
                          setNavMenuOpen(false);
                          openBooking();
                        }}
                        className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{t.nav.bookAppointment}</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* Right Side Actions: Theme Toggle + Language selector + Quick Boutique Shortcut */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Quick Boutique Shortcut Button */}
              <button
                id="nav-quick-boutique-btn"
                onClick={() => navigateToView('products')}
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  currentView === 'products'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 border-teal-200 dark:border-teal-800/80'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Boutique</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950">
                  COD
                </span>
              </button>

              {/* Theme Toggle (Desktop) */}
              <div className="hidden sm:inline-flex">
                <ThemeToggle />
              </div>

              {/* Language Switcher (Desktop) */}
              <div className="relative hidden sm:block">
                <button
                  id="language-switcher-btn"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                  aria-label="Changer de langue"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>
                    {language === 'fr' ? '🇫🇷 FR' : language === 'ar' ? '🇩🇿 العربية' : '🇬🇧 EN'}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                    <button
                      id="lang-opt-fr"
                      onClick={() => handleLanguageChange('fr')}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer ${
                        language === 'fr' ? 'font-bold text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-slate-700/50' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>🇫🇷</span> Français
                    </button>
                    <button
                      id="lang-opt-ar"
                      onClick={() => handleLanguageChange('ar')}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer ${
                        language === 'ar' ? 'font-bold text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-slate-700/50' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>🇩🇿</span> العربية (RTL)
                    </button>
                    <button
                      id="lang-opt-en"
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer ${
                        language === 'en' ? 'font-bold text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-slate-700/50' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>🇬🇧</span> English
                    </button>
                  </div>
                )}
              </div>

              {/* Single Unified All-in-One Menu Icon Button for Mobile */}
              <button
                id="mobile-unified-menu-btn"
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`sm:hidden p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  mobileMenuOpen
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 ring-2 ring-teal-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                }`}
                aria-expanded={mobileMenuOpen}
                aria-label="Menu principal et paramètres"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white animate-in spin-in-90 duration-200" />
                ) : (
                  <Menu className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Unified Mobile Navigation, Options & Quick Settings Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-unified-nav-drawer"
            className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 max-h-[calc(100vh-5.5rem)] overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              
              {/* 1. Quick Controls Hub: Language + Theme + Admin consolidated */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                  <span>{language === 'ar' ? 'الخيارات السريعة واللغة' : 'Options Rapides & Langue'}</span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    {clinicInfo.city}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Mobile Theme Toggle Button */}
                  <button
                    id="mobile-drawer-theme-btn"
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>{language === 'ar' ? 'وضع نهاري' : 'Mode Clair'}</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        <span>{language === 'ar' ? 'وضع ليلي' : 'Mode Sombre'}</span>
                      </>
                    )}
                  </button>

                  {/* Mobile Admin Portal Shortcut */}
                  <button
                    id="mobile-drawer-admin-btn"
                    type="button"
                    onClick={() => {
                      toggleAdminMode();
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isAdminMode
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isAdminMode ? t.nav.backToSite : t.nav.adminPortal}</span>
                  </button>
                </div>

                {/* Mobile Language Switcher Segmented Control */}
                <div className="pt-0.5">
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 dark:bg-slate-900/80 rounded-xl">
                    <button
                      id="mobile-lang-fr-btn"
                      type="button"
                      onClick={() => handleLanguageChange('fr')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        language === 'fr'
                          ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs scale-102'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span>🇫🇷</span>
                      <span>Français</span>
                    </button>

                    <button
                      id="mobile-lang-ar-btn"
                      type="button"
                      onClick={() => handleLanguageChange('ar')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        language === 'ar'
                          ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs scale-102'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span>🇩🇿</span>
                      <span>العربية</span>
                    </button>

                    <button
                      id="mobile-lang-en-btn"
                      type="button"
                      onClick={() => handleLanguageChange('en')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        language === 'en'
                          ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs scale-102'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span>🇬🇧</span>
                      <span>English</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Navigation Sections Links */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  {language === 'ar' ? 'أقسام العيادة والخدمات' : 'Navigation & Services'}
                </span>
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentView === link.view;
                    return (
                      <button
                        key={`mobile-${link.id}`}
                        id={`mobile-nav-link-${link.view}`}
                        type="button"
                        onClick={() => handleSelectNav(link.view)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer border ${
                          isActive
                            ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-200 font-bold shadow-2xs'
                            : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive 
                              ? 'bg-teal-600 text-white' 
                              : link.highlight
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold">{link.label}</span>
                          {link.badge && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950">
                              {link.badge}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Fast Contact & Appointment Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  id="mobile-menu-book-btn"
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openBooking();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer active:scale-98 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t.nav.bookAppointment}</span>
                </button>

                <a
                  id="mobile-menu-emergency-call"
                  href={`tel:${clinicInfo.emergencyPhone}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.nav.emergency}: {clinicInfo.emergencyPhone}</span>
                </a>
              </div>

            </div>
          </div>
        )}
      </header>
    </>
  );
};

