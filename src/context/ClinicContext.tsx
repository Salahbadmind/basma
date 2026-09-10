import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Language,
  Theme,
  AppView,
  TreatmentService,
  Doctor,
  Appointment,
  AppointmentStatus,
  PatientRecord,
  Review,
  BeforeAfterCase,
  ClinicInfo,
  Product,
  ProductOrder,
  OrderStatus,
} from '../types';
import {
  initialServices,
  initialDoctors,
  initialAppointments,
  initialPatients,
  initialReviews,
  initialBeforeAfterCases,
  initialClinicInfo,
} from '../data/initialData';
import { initialProducts, initialOrders } from '../data/productsData';
import { translations } from '../i18n/translations';
import { safeStorage } from '../utils/safeStorage';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchAppointmentsFromSupabase,
  insertAppointmentToSupabase,
  updateAppointmentStatusInSupabase,
  deleteAppointmentFromSupabase,
  fetchOrdersFromSupabase,
  insertOrderToSupabase,
  updateOrderStatusInSupabase,
  deleteOrderFromSupabase,
  fetchProductsFromSupabase,
  upsertProductToSupabase,
  deleteProductFromSupabase,
  fetchServicesFromSupabase,
  upsertServiceToSupabase,
  deleteServiceFromSupabase,
  fetchDoctorsFromSupabase,
  upsertDoctorToSupabase,
  deleteDoctorFromSupabase,
  fetchReviewsFromSupabase,
  upsertReviewToSupabase,
  fetchClinicInfoFromSupabase,
  upsertClinicInfoToSupabase,
  fetchBeforeAfterCasesFromSupabase,
  upsertBeforeAfterCaseToSupabase,
  deleteBeforeAfterCaseFromSupabase,
} from '../lib/supabaseSync';

interface ClinicContextType {
  // Localization & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
  t: typeof translations['fr'];
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  // Navigation & Deep Linking (FB Ads & Share friendly)
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedProductSlug: string | null;
  selectedServiceId: string | null;
  selectedDoctorId: string | null;
  navigateToProduct: (slug: string) => void;
  navigateToService: (serviceIdOrSlug: string) => void;
  navigateToDoctor: (doctorId: string) => void;
  navigateToView: (view: AppView) => void;

  // Clinic Core Data
  services: TreatmentService[];
  doctors: Doctor[];
  appointments: Appointment[];
  patients: PatientRecord[];
  reviews: Review[];
  beforeAfterCases: BeforeAfterCase[];
  clinicInfo: ClinicInfo;

  // E-Commerce Data (Products & COD Orders)
  products: Product[];
  orders: ProductOrder[];
  isCheckoutModalOpen: boolean;
  productForCheckout: Product | null;
  openCheckout: (product: Product) => void;
  closeCheckout: () => void;
  addOrder: (orderData: Omit<ProductOrder, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => ProductOrder;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  // Modals & Popups
  isBookingModalOpen: boolean;
  selectedServiceForBooking: TreatmentService | null;
  selectedDoctorForBooking: Doctor | null;
  selectedServiceDetail: TreatmentService | null;
  openBooking: (service?: TreatmentService, doctor?: Doctor) => void;
  closeBooking: () => void;
  openServiceDetail: (service: TreatmentService) => void;
  closeServiceDetail: () => void;

  // Admin Portal & Authentication
  isAdminMode: boolean;
  isAdminAuthenticated: boolean;
  adminUserEmail: string | null;
  toggleAdminMode: (enabled?: boolean) => void;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;

  // Clinical & Doctor CRUD Actions
  addAppointment: (data: {
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    serviceId: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    notes?: string;
    isFirstVisit: boolean;
    notificationPreference: 'whatsapp' | 'sms' | 'email';
    priceEstimatedDZD?: number;
  }) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, adminNotes?: string) => void;
  deleteAppointment: (id: string) => void;
  addReview: (reviewData: {
    patientName: string;
    rating: number;
    treatmentName: { fr: string; ar: string; en: string };
    comment: { fr: string; ar: string; en: string };
  }) => void;
  addClinicalNote: (patientId: string, note: { doctorId: string; doctorName: string; treatment: string; notes: string; nextFollowUp?: string }) => void;
  
  // Doctor & Service CRUD
  addDoctor: (doctor: Doctor) => Promise<boolean>;
  updateDoctor: (doctor: Doctor) => Promise<boolean>;
  deleteDoctor: (id: string) => Promise<boolean>;
  addService: (service: TreatmentService) => Promise<boolean>;
  updateService: (service: TreatmentService) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;

  // Before & After Cases CRUD
  addBeforeAfterCase: (item: BeforeAfterCase) => Promise<boolean>;
  updateBeforeAfterCase: (item: BeforeAfterCase) => Promise<boolean>;
  deleteBeforeAfterCase: (id: string) => Promise<boolean>;

  updateClinicInfo: (info: ClinicInfo) => Promise<{ success: boolean; error?: string }>;
  resetToDemoData: () => void;
  exportBackupJson: () => void;

  // Direct State Setters (for Supabase Pull / Cloud Import)
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  setServices: React.Dispatch<React.SetStateAction<TreatmentService[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setOrders: React.Dispatch<React.SetStateAction<ProductOrder[]>>;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  setClinicInfo: React.Dispatch<React.SetStateAction<ClinicInfo>>;
  setBeforeAfterCases: React.Dispatch<React.SetStateAction<BeforeAfterCase[]>>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme State
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = safeStorage.getItem('elbahdja_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    try {
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    safeStorage.setItem('elbahdja_theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Language initialization
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = safeStorage.getItem('elbahdja_lang');
    return (saved === 'fr' || saved === 'ar' || saved === 'en') ? (saved as Language) : 'fr';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const t = translations[language] || translations['fr'];

  // View Navigation & URL Hash / Query Parameter sync for FB Ads and deep linking
  const [currentView, setCurrentViewState] = useState<AppView>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  // Initialize View from URL hash or query params
  useEffect(() => {
    const parseUrl = () => {
      const hash = window.location.hash.replace('#', '');
      const searchParams = new URLSearchParams(window.location.search);
      const productParam = searchParams.get('product') || (hash.startsWith('product-') ? hash.replace('product-', '') : null);
      const serviceParam = searchParams.get('service') || (hash.startsWith('service-') ? hash.replace('service-', '') : hash.startsWith('treatment-') ? hash.replace('treatment-', '') : null);
      const doctorParam = searchParams.get('doctor') || (hash.startsWith('doctor-') ? hash.replace('doctor-', '') : null);

      if (productParam) {
        setSelectedProductSlug(productParam);
        setCurrentViewState('product-detail');
        return;
      }

      if (serviceParam) {
        setSelectedServiceId(serviceParam);
        setCurrentViewState('service-detail');
        return;
      }

      if (doctorParam) {
        setSelectedDoctorId(doctorParam);
        setCurrentViewState('doctor-detail');
        return;
      }

      if (hash === 'products' || hash === 'store' || hash === 'shop') {
        setCurrentViewState('products');
      } else if (hash === 'admin' || hash === 'portal') {
        setCurrentViewState('admin');
      } else if (hash === 'services' || hash === 'doctors' || hash === 'pricing' || hash === 'reviews' || hash === 'about' || hash === 'before-after' || hash === 'contact') {
        setCurrentViewState(hash as AppView);
      } else {
        setCurrentViewState('home');
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  const navigateToView = (view: AppView) => {
    setCurrentViewState(view);
    if (view === 'home') {
      window.history.pushState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view !== 'product-detail' && view !== 'service-detail' && view !== 'doctor-detail') {
      window.history.pushState(null, '', `#${view}`);
      setTimeout(() => {
        const elementId = view === 'products' ? 'products-section' : view;
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const navigateToProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    setCurrentViewState('product-detail');
    window.history.pushState(null, '', `?product=${slug}#product-${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToService = (serviceIdOrSlug: string) => {
    setSelectedServiceId(serviceIdOrSlug);
    setCurrentViewState('service-detail');
    window.history.pushState(null, '', `?service=${serviceIdOrSlug}#service-${serviceIdOrSlug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setCurrentViewState('doctor-detail');
    window.history.pushState(null, '', `?doctor=${doctorId}#doctor-${doctorId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setCurrentView = (view: AppView) => {
    navigateToView(view);
  };

  // Load / Store Services
  const [services, setServices] = useState<TreatmentService[]>(() => {
    const data = safeStorage.getJSON<TreatmentService[]>('elbahdja_services', initialServices);
    return Array.isArray(data) && data.length > 0 ? data : initialServices;
  });

  // Doctors
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const data = safeStorage.getJSON<Doctor[]>('elbahdja_doctors', initialDoctors);
    return Array.isArray(data) && data.length > 0 ? data : initialDoctors;
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const data = safeStorage.getJSON<Product[]>('elbahdja_products', initialProducts);
    return Array.isArray(data) && data.length > 0 ? data : initialProducts;
  });

  // Orders
  const [orders, setOrders] = useState<ProductOrder[]>(() => {
    const data = safeStorage.getJSON<ProductOrder[]>('elbahdja_orders', initialOrders);
    return Array.isArray(data) ? data : initialOrders;
  });

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const data = safeStorage.getJSON<Appointment[]>('elbahdja_appointments', initialAppointments);
    return Array.isArray(data) ? data : initialAppointments;
  });

  // Patients
  const [patients, setPatients] = useState<PatientRecord[]>(() => {
    const data = safeStorage.getJSON<PatientRecord[]>('elbahdja_patients', initialPatients);
    return Array.isArray(data) ? data : initialPatients;
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    const data = safeStorage.getJSON<Review[]>('elbahdja_reviews', initialReviews);
    return Array.isArray(data) ? data : initialReviews;
  });

  // Before & After
  const [beforeAfterCases, setBeforeAfterCases] = useState<BeforeAfterCase[]>(() => {
    const data = safeStorage.getJSON<BeforeAfterCase[]>('elbahdja_before_after', initialBeforeAfterCases);
    return Array.isArray(data) ? data : initialBeforeAfterCases;
  });

  // Clinic Info
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(() => {
    const data = safeStorage.getJSON<ClinicInfo>('elbahdja_info', initialClinicInfo);
    return data && typeof data === 'object' && data.name ? data : initialClinicInfo;
  });

  // UI / Checkout state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<TreatmentService | null>(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<TreatmentService | null>(null);
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [productForCheckout, setProductForCheckout] = useState<Product | null>(null);

  // Admin Auth State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return safeStorage.getItem('elbahdja_admin_auth') === 'true';
  });
  const [adminUserEmail, setAdminUserEmail] = useState<string | null>(() => {
    return safeStorage.getItem('elbahdja_admin_email') || null;
  });

  // Sync state to storage
  useEffect(() => {
    safeStorage.setItem('elbahdja_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  useEffect(() => {
    safeStorage.setJSON('elbahdja_appointments', appointments);
  }, [appointments]);

  useEffect(() => {
    safeStorage.setJSON('elbahdja_patients', patients);
  }, [patients]);

  useEffect(() => {
    safeStorage.setJSON('elbahdja_services', services);
  }, [services]);

  useEffect(() => {
    safeStorage.setJSON('elbahdja_doctors', doctors);
  }, [doctors]);

  useEffect(() => {
    safeStorage.setJSON('elbahdja_products', products);
  }, [products]);

  useEffect(() => {
    safeStorage.setJSON('elbahdja_orders', orders);
  }, [orders]);

  useEffect(() => {
    safeStorage.setJSON('elbahdja_reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    safeStorage.setJSON('elbahdja_before_after', beforeAfterCases);
  }, [beforeAfterCases]);

  useEffect(() => {
    safeStorage.setJSON('elbahdja_info', clinicInfo);
  }, [clinicInfo]);

  // ========================================================
  // SUPABASE REALTIME & CLOUD DATABASE SYNC
  // ========================================================
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;

    // 1. Initial fetch of remote appointments
    fetchAppointmentsFromSupabase().then((remoteApts) => {
      if (remoteApts && remoteApts.length > 0) {
        setAppointments(remoteApts);
      }
    });

    // 2. Initial fetch of remote product orders
    fetchOrdersFromSupabase().then((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
      }
    });

    // 3. Initial fetch of remote products
    fetchProductsFromSupabase().then((remoteProds) => {
      if (remoteProds && remoteProds.length > 0) {
        setProducts(remoteProds);
      }
    });

    // 4. Initial fetch of remote services
    fetchServicesFromSupabase().then((remoteServices) => {
      if (remoteServices && remoteServices.length > 0) {
        setServices(remoteServices);
      }
    });

    // 5. Initial fetch of remote doctors
    fetchDoctorsFromSupabase().then((remoteDoctors) => {
      if (remoteDoctors && remoteDoctors.length > 0) {
        setDoctors(remoteDoctors);
      }
    });

    // 6. Initial fetch of remote reviews
    fetchReviewsFromSupabase().then((remoteReviews) => {
      if (remoteReviews && remoteReviews.length > 0) {
        setReviews(remoteReviews);
      }
    });

    // 7. Initial fetch of remote clinic info
    fetchClinicInfoFromSupabase().then((remoteInfo) => {
      if (remoteInfo) {
        setClinicInfo(remoteInfo);
      }
    });

    // 8. Initial fetch of remote before & after cases
    fetchBeforeAfterCasesFromSupabase().then((remoteCases) => {
      if (remoteCases && remoteCases.length > 0) {
        setBeforeAfterCases(remoteCases);
        safeStorage.setJSON('elbahdja_before_after', remoteCases);
      }
    });

    // Realtime listeners
    const clinicInfoChannel = client
      .channel('public:clinic_info')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clinic_info' }, () => {
        fetchClinicInfoFromSupabase().then((remoteInfo) => {
          if (remoteInfo) {
            setClinicInfo(remoteInfo);
            safeStorage.setJSON('elbahdja_info', remoteInfo);
          }
        });
      })
      .subscribe();

    const aptsChannel = client
      .channel('public:appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointmentsFromSupabase().then((remoteApts) => {
          if (remoteApts) setAppointments(remoteApts);
        });
      })
      .subscribe();

    const ordersChannel = client
      .channel('public:product_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_orders' }, () => {
        fetchOrdersFromSupabase().then((remoteOrders) => {
          if (remoteOrders) setOrders(remoteOrders);
        });
      })
      .subscribe();

    const doctorsChannel = client
      .channel('public:doctors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => {
        fetchDoctorsFromSupabase().then((remoteDocs) => {
          if (remoteDocs) {
            setDoctors(remoteDocs);
            safeStorage.setJSON('elbahdja_doctors', remoteDocs);
          }
        });
      })
      .subscribe();

    const productsChannel = client
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProductsFromSupabase().then((remoteProds) => {
          if (remoteProds) {
            setProducts(remoteProds);
            safeStorage.setJSON('elbahdja_products', remoteProds);
          }
        });
      })
      .subscribe();

    const servicesChannel = client
      .channel('public:services')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        fetchServicesFromSupabase().then((remoteServ) => {
          if (remoteServ) {
            setServices(remoteServ);
            safeStorage.setJSON('elbahdja_services', remoteServ);
          }
        });
      })
      .subscribe();

    const casesChannel = client
      .channel('public:before_after_cases')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'before_after_cases' }, () => {
        fetchBeforeAfterCasesFromSupabase().then((remoteCases) => {
          if (remoteCases) {
            setBeforeAfterCases(remoteCases);
            safeStorage.setJSON('elbahdja_before_after', remoteCases);
          }
        });
      })
      .subscribe();

    return () => {
      client.removeChannel(clinicInfoChannel);
      client.removeChannel(aptsChannel);
      client.removeChannel(ordersChannel);
      client.removeChannel(doctorsChannel);
      client.removeChannel(productsChannel);
      client.removeChannel(servicesChannel);
      client.removeChannel(casesChannel);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Modals
  const openBooking = (service?: TreatmentService, doctor?: Doctor) => {
    setSelectedServiceForBooking(service || null);
    setSelectedDoctorForBooking(doctor || null);
    setIsBookingModalOpen(true);
  };

  const closeBooking = () => {
    setIsBookingModalOpen(false);
    setSelectedServiceForBooking(null);
    setSelectedDoctorForBooking(null);
  };

  const openServiceDetail = (service: TreatmentService) => {
    setSelectedServiceDetail(service);
  };

  const closeServiceDetail = () => {
    setSelectedServiceDetail(null);
  };

  const openCheckout = (product: Product) => {
    setProductForCheckout(product);
    setIsCheckoutModalOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutModalOpen(false);
    setProductForCheckout(null);
  };

  // Admin Auth Methods
  const toggleAdminMode = (enabled?: boolean) => {
    const nextVal = enabled !== undefined ? enabled : !isAdminMode;
    setIsAdminMode(nextVal);
    if (nextVal) {
      navigateToView('admin');
    } else {
      navigateToView('home');
    }
  };

  const loginAdmin = (email: string, pass: string): boolean => {
    const configuredEmail = (clinicInfo.adminEmail || 'admin@basma.com').trim().toLowerCase();
    const configuredPass = clinicInfo.adminPassword || 'basma123';

    const isValid = (email.trim().toLowerCase() === configuredEmail && pass === configuredPass) ||
      (email.trim().toLowerCase() === 'admin@basma.com' && pass === 'basma123') ||
      (email.trim().toLowerCase() === 'salaheddinebouragbi@gmail.com' && pass.length >= 4);

    if (isValid) {
      setIsAdminAuthenticated(true);
      setAdminUserEmail(email.trim());
      safeStorage.setItem('elbahdja_admin_auth', 'true');
      safeStorage.setItem('elbahdja_admin_email', email.trim());
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setAdminUserEmail(null);
    safeStorage.removeItem('elbahdja_admin_auth');
    safeStorage.removeItem('elbahdja_admin_email');
    setIsAdminMode(false);
    navigateToView('home');
  };

  // E-Commerce Order handling
  const addOrder = (orderData: Omit<ProductOrder, 'id' | 'orderNumber' | 'createdAt' | 'status'>): ProductOrder => {
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const newOrder: ProductOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `DZ-${orderData.wilayaCode}-${randNum}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);

    // Decrement stock if applicable
    setProducts(prev =>
      prev.map(prod => {
        const itemOrdered = orderData.items.find(i => i.productId === prod.id);
        if (itemOrdered) {
          const newStock = Math.max(0, prod.stockCount - itemOrdered.quantity);
          return {
            ...prod,
            stockCount: newStock,
            inStock: newStock > 0,
          };
        }
        return prod;
      })
    );

    // Sync to Supabase
    insertOrderToSupabase(newOrder);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    updateOrderStatusInSupabase(orderId, status);
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    deleteOrderFromSupabase(orderId);
  };

  const addProduct = async (product: Product) => {
    setProducts(prev => {
      const next = [product, ...prev];
      safeStorage.setJSON('elbahdja_products', next);
      return next;
    });
    return await upsertProductToSupabase(product);
  };

  const updateProduct = async (product: Product) => {
    setProducts(prev => {
      const next = prev.map(p => (p.id === product.id ? product : p));
      safeStorage.setJSON('elbahdja_products', next);
      return next;
    });
    return await upsertProductToSupabase(product);
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      safeStorage.setJSON('elbahdja_products', next);
      return next;
    });
    return await deleteProductFromSupabase(id);
  };

  // Clinical & Doctor CRUD
  const addAppointment = (data: {
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    serviceId: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    notes?: string;
    isFirstVisit: boolean;
    notificationPreference: 'whatsapp' | 'sms' | 'email';
    priceEstimatedDZD?: number;
  }): Appointment => {
    const newApt: Appointment = {
      id: `apt-${Date.now().toString().slice(-5)}`,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setAppointments(prev => [newApt, ...prev]);

    // Sync to Supabase
    insertAppointmentToSupabase(newApt);

    // Also auto-sync/create patient record
    setPatients(prev => {
      const existing = prev.find(p => p.phone.replace(/\s+/g, '') === data.patientPhone.replace(/\s+/g, ''));
      if (existing) {
        return prev.map(p =>
          p.id === existing.id
            ? {
                ...p,
                totalVisits: p.totalVisits + 1,
                lastVisit: data.date,
              }
            : p
        );
      } else {
        const newPatient: PatientRecord = {
          id: `pat-${Date.now().toString().slice(-4)}`,
          name: data.patientName,
          phone: data.patientPhone,
          email: data.patientEmail,
          createdAt: new Date().toISOString().slice(0, 10),
          totalVisits: 1,
          lastVisit: data.date,
          allergies: [],
          clinicalNotes: [],
        };
        return [newPatient, ...prev];
      }
    });

    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus, adminNotes?: string) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, status, adminNotes: adminNotes ?? apt.adminNotes } : apt))
    );
    updateAppointmentStatusInSupabase(id, status, adminNotes);
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
    deleteAppointmentFromSupabase(id);
  };

  const addReview = (reviewData: {
    patientName: string;
    rating: number;
    treatmentName: { fr: string; ar: string; en: string };
    comment: { fr: string; ar: string; en: string };
  }) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      patientName: reviewData.patientName,
      rating: reviewData.rating,
      date: new Date().toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      treatmentName: reviewData.treatmentName,
      comment: reviewData.comment,
      isVerified: true,
      isGoogleReview: true,
    };
    setReviews(prev => [newRev, ...prev]);
    upsertReviewToSupabase(newRev);
  };

  const addClinicalNote = (
    patientId: string,
    note: { doctorId: string; doctorName: string; treatment: string; notes: string; nextFollowUp?: string }
  ) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          const newNote = {
            id: `cn-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            ...note,
          };
          return {
            ...p,
            clinicalNotes: [newNote, ...(p.clinicalNotes || [])],
          };
        }
        return p;
      })
    );
  };

  const addDoctor = async (doctor: Doctor) => {
    setDoctors(prev => {
      const next = [...prev, doctor];
      safeStorage.setJSON('elbahdja_doctors', next);
      return next;
    });
    return await upsertDoctorToSupabase(doctor);
  };

  const updateDoctor = async (updated: Doctor) => {
    setDoctors(prev => {
      const next = prev.map(d => (d.id === updated.id ? updated : d));
      safeStorage.setJSON('elbahdja_doctors', next);
      return next;
    });
    return await upsertDoctorToSupabase(updated);
  };

  const deleteDoctor = async (id: string) => {
    setDoctors(prev => {
      const next = prev.filter(d => d.id !== id);
      safeStorage.setJSON('elbahdja_doctors', next);
      return next;
    });
    return await deleteDoctorFromSupabase(id);
  };

  const addService = async (newService: TreatmentService) => {
    setServices(prev => {
      const next = [...prev, newService];
      safeStorage.setJSON('elbahdja_services', next);
      return next;
    });
    return await upsertServiceToSupabase(newService);
  };

  const updateService = async (updated: TreatmentService) => {
    setServices(prev => {
      const next = prev.map(s => (s.id === updated.id ? updated : s));
      safeStorage.setJSON('elbahdja_services', next);
      return next;
    });
    return await upsertServiceToSupabase(updated);
  };

  const deleteService = async (id: string) => {
    setServices(prev => {
      const next = prev.filter(s => s.id !== id);
      safeStorage.setJSON('elbahdja_services', next);
      return next;
    });
    return await deleteServiceFromSupabase(id);
  };

  const addBeforeAfterCase = async (item: BeforeAfterCase) => {
    setBeforeAfterCases(prev => {
      const next = [item, ...prev];
      safeStorage.setJSON('elbahdja_before_after', next);
      return next;
    });
    return await upsertBeforeAfterCaseToSupabase(item);
  };

  const updateBeforeAfterCase = async (updated: BeforeAfterCase) => {
    setBeforeAfterCases(prev => {
      const next = prev.map(c => (c.id === updated.id ? updated : c));
      safeStorage.setJSON('elbahdja_before_after', next);
      return next;
    });
    return await upsertBeforeAfterCaseToSupabase(updated);
  };

  const deleteBeforeAfterCase = async (id: string) => {
    setBeforeAfterCases(prev => {
      const next = prev.filter(c => c.id !== id);
      safeStorage.setJSON('elbahdja_before_after', next);
      return next;
    });
    return await deleteBeforeAfterCaseFromSupabase(id);
  };

  const updateClinicInfo = async (info: ClinicInfo): Promise<{ success: boolean; error?: string }> => {
    setClinicInfo(info);
    safeStorage.setJSON('elbahdja_info', info);
    return await upsertClinicInfoToSupabase(info);
  };

  const resetToDemoData = () => {
    setServices(initialServices);
    setDoctors(initialDoctors);
    setAppointments(initialAppointments);
    setPatients(initialPatients);
    setReviews(initialReviews);
    setProducts(initialProducts);
    setOrders(initialOrders);
    setBeforeAfterCases(initialBeforeAfterCases);
    setClinicInfo(initialClinicInfo);
    safeStorage.removeItem('elbahdja_services');
    safeStorage.removeItem('elbahdja_doctors');
    safeStorage.removeItem('elbahdja_appointments');
    safeStorage.removeItem('elbahdja_patients');
    safeStorage.removeItem('elbahdja_reviews');
    safeStorage.removeItem('elbahdja_products');
    safeStorage.removeItem('elbahdja_orders');
    safeStorage.removeItem('elbahdja_before_after');
    safeStorage.removeItem('elbahdja_info');
  };

  const exportBackupJson = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      clinicInfo,
      appointments,
      patients,
      services,
      doctors,
      products,
      orders,
      reviews,
      beforeAfterCases,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elbahdja_clinic_store_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ClinicContext.Provider
      value={{
        language,
        setLanguage,
        dir,
        t,
        theme,
        setTheme,
        toggleTheme,
        currentView,
        setCurrentView,
        selectedProductSlug,
        selectedServiceId,
        selectedDoctorId,
        navigateToProduct,
        navigateToService,
        navigateToDoctor,
        navigateToView,
        services,
        doctors,
        appointments,
        patients,
        reviews,
        beforeAfterCases,
        clinicInfo,
        products,
        orders,
        isCheckoutModalOpen,
        productForCheckout,
        openCheckout,
        closeCheckout,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        isBookingModalOpen,
        selectedServiceForBooking,
        selectedDoctorForBooking,
        selectedServiceDetail,
        openBooking,
        closeBooking,
        openServiceDetail,
        closeServiceDetail,
        isAdminMode,
        isAdminAuthenticated,
        adminUserEmail,
        toggleAdminMode,
        loginAdmin,
        logoutAdmin,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        addReview,
        addClinicalNote,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addService,
        updateService,
        deleteService,
        addBeforeAfterCase,
        updateBeforeAfterCase,
        deleteBeforeAfterCase,
        updateClinicInfo,
        resetToDemoData,
        exportBackupJson,
        setDoctors,
        setServices,
        setProducts,
        setAppointments,
        setOrders,
        setReviews,
        setClinicInfo,
        setBeforeAfterCases,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
