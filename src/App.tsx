/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { DoctorsSection } from './components/DoctorsSection';
import { BeforeAfterSection } from './components/BeforeAfterSection';
import { PricingSection } from './components/PricingSection';
import { AboutSection } from './components/AboutSection';
import { ReviewsSection } from './components/ReviewsSection';
import { LocationSection } from './components/LocationSection';
import { ContactSection } from './components/ContactSection';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { BookingWizardModal } from './components/BookingWizardModal';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { ProductsCatalog } from './components/ProductsCatalog';
import { ProductDetail } from './components/ProductDetail';
import { CheckoutModal } from './components/CheckoutModal';
import { MobileBottomBar } from './components/MobileBottomBar';

const MainClinicApp: React.FC = () => {
  const { isAdminMode, isAdminAuthenticated, currentView } = useClinic();

  if (isAdminMode) {
    if (!isAdminAuthenticated) {
      return <AdminLogin />;
    }
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-teal-500 selection:text-white transition-colors duration-300 pb-14 sm:pb-0">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Sections based on currentView */}
      <main>
        {currentView === 'product-detail' ? (
          /* Single Dedicated Product Page for FB Ads */
          <ProductDetail />
        ) : currentView === 'products' ? (
          /* Full Store Products Catalog */
          <ProductsCatalog />
        ) : (
          /* Clinic Full Showcase Landing */
          <>
            <Hero />
            <ServicesSection />
            <ProductsCatalog />
            <DoctorsSection />
            <BeforeAfterSection />
            <PricingSection />
            <AboutSection />
            <ReviewsSection />
            <LocationSection />
            <ContactSection />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating CTAs & Interactive Modals */}
      <FloatingWhatsApp />
      <MobileBottomBar />
      <BookingWizardModal />
      <ServiceDetailModal />
      <CheckoutModal />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <MainClinicApp />
    </ClinicProvider>
  );
}
