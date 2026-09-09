import React, { useState, useMemo, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  Appointment, 
  AppointmentStatus, 
  PatientRecord, 
  TreatmentService, 
  Doctor, 
  Product, 
  ProductOrder, 
  OrderStatus,
  ClinicInfo
} from '../../types';
import { algeriaWilayas } from '../../data/algeriaWilayas';
import { ImageUploadPicker } from './ImageUploadPicker';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseSettingsModal } from './SupabaseSettingsModal';
import { CloudflareSettingsModal } from './CloudflareSettingsModal';
import { BeforeAfterManager } from './BeforeAfterManager';
import { getCloudflareConfig } from '../../lib/cloudflare';
import { 
  Lock, 
  Calendar, 
  Users, 
  Stethoscope, 
  DollarSign, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  MessageCircle, 
  Plus, 
  Download, 
  Edit3, 
  FileText, 
  Eye, 
  EyeOff,
  Video,
  X, 
  AlertTriangle, 
  ArrowLeft, 
  ShoppingBag, 
  Truck, 
  Trash2, 
  Copy, 
  Check, 
  LogOut, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Share2, 
  Save, 
  Navigation,
  Database,
  Cloud,
  Code2,
  ExternalLink
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    appointments, 
    updateAppointmentStatus, 
    deleteAppointment,
    patients, 
    addClinicalNote,
    doctors, 
    addDoctor,
    updateDoctor,
    deleteDoctor,
    services, 
    updateService, 
    addService,
    deleteService,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    deleteOrder,
    clinicInfo, 
    updateClinicInfo,
    beforeAfterCases,
    toggleAdminMode, 
    logoutAdmin,
    language,
    t 
  } = useClinic();

  // Supabase & Cloudflare Settings Modals
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);

  // Active Sub-tab in Admin
  const [activeTab, setActiveTab] = useState<'appointments' | 'orders' | 'doctors' | 'services' | 'products' | 'patients' | 'before_after' | 'cms_settings'>('appointments');

  // Appointments Filter State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [searchPatient, setSearchPatient] = useState<string>('');

  // Orders Filter State
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderWilayaFilter, setOrderWilayaFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Selected Patient for Clinical Record View
  const [selectedPatientForModal, setSelectedPatientForModal] = useState<PatientRecord | null>(null);
  const [newNoteTreatment, setNewNoteTreatment] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteDoctorId, setNewNoteDoctorId] = useState(doctors[0]?.id || '');

  // Doctor Add / Edit Modal
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [docFormData, setDocFormData] = useState({
    nameFr: '',
    nameAr: '',
    nameEn: '',
    titleFr: '',
    titleAr: '',
    titleEn: '',
    specialtyFr: '',
    specialtyAr: '',
    specialtyEn: '',
    experienceYears: 5,
    languages: ['Arabe', 'Français'],
    bioFr: '',
    bioAr: '',
    bioEn: '',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
    workingHoursStart: '08:30',
    workingHoursEnd: '16:30',
  });

  // Treatment / Service Add / Edit Modal
  const [editingService, setEditingService] = useState<TreatmentService | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    nameFr: '',
    nameAr: '',
    nameEn: '',
    shortDescFr: '',
    shortDescAr: '',
    shortDescEn: '',
    category: 'general' as any,
    priceDZD: 5000,
    durationMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
    benefitsFr: '',
  });

  // Product Add / Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productFormData, setProductFormData] = useState({
    nameFr: '',
    nameAr: '',
    nameEn: '',
    subtitleFr: '',
    subtitleAr: '',
    subtitleEn: '',
    descriptionFr: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'whitening' as any,
    priceDZD: 4500,
    originalPriceDZD: 6500,
    stockCount: 50,
    inStock: true,
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
    badgeFr: 'Top Vente',
    badgeAr: 'الأكثر طلباً',
    doctorRecFr: 'Testé et recommandé par nos chirurgiens-dentistes.',
  });

  // CMS Settings Form State
  const [cmsData, setCmsData] = useState<ClinicInfo>(() => clinicInfo);
  const [cmsSavedToast, setCmsSavedToast] = useState(false);
  const [cmsSaveResult, setCmsSaveResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Global Admin Toast
  const [globalToast, setGlobalToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setGlobalToast({ message, type });
    setTimeout(() => {
      setGlobalToast(null);
    }, 4500);
  };

  useEffect(() => {
    setCmsData(clinicInfo);
  }, [clinicInfo]);

  // Statistics
  const stats = useMemo(() => {
    const totalApt = appointments.length;
    const pendingApt = appointments.filter((a) => a.status === 'pending').length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const orderRevenue = orders
      .filter((o) => o.status === 'delivered' || o.status === 'confirmed' || o.status === 'shipped')
      .reduce((acc, o) => acc + o.totalDZD, 0);

    return { totalApt, pendingApt, totalOrders, pendingOrders, orderRevenue };
  }, [appointments, orders]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchStatus = statusFilter === 'all' || apt.status === statusFilter;
      const matchDoc = doctorFilter === 'all' || apt.doctorId === doctorFilter;
      const q = searchPatient.toLowerCase().trim();
      const matchSearch = !q || apt.patientName.toLowerCase().includes(q) || apt.patientPhone.includes(q) || apt.id.toLowerCase().includes(q);
      return matchStatus && matchDoc && matchSearch;
    });
  }, [appointments, statusFilter, doctorFilter, searchPatient]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
      const matchWilaya = orderWilayaFilter === 'all' || ord.wilayaCode === orderWilayaFilter;
      const q = orderSearch.toLowerCase().trim();
      const matchSearch = !q || 
        ord.customerName.toLowerCase().includes(q) || 
        ord.customerPhone.includes(q) || 
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.commune.toLowerCase().includes(q);
      return matchStatus && matchWilaya && matchSearch;
    });
  }, [orders, orderStatusFilter, orderWilayaFilter, orderSearch]);

  // Generate WhatsApp Reminder Text for Appointments
  const getWhatsAppReminderUrl = (apt: Appointment) => {
    const serviceObj = services.find((s) => s.id === apt.serviceId);
    const serviceName = serviceObj ? serviceObj.name[language] : 'Consultation';
    const doctorObj = doctors.find((d) => d.id === apt.doctorId);
    const docName = doctorObj ? doctorObj.name[language] : 'Dr. Ahmed Benali';

    const msg =
      language === 'ar'
        ? `تذكير بموعد عيادة البهجة لطب الأسنان 🦷\n\nأهلاً بك سيد/ة ${apt.patientName}،\nنذكركم بموعدكم يوم ${apt.date} على الساعة ${apt.timeSlot} مع ${docName} (${serviceName}).\n📍 العنوان: سيدي يحيى / حيدرة، الجزائر.\nيرجى تأكيد حضوركم بالرد على هذه الرسالة.`
        : `Rappel de rendez-vous Cabinet Dentaire El Bahdja 🦷\n\nBonjour M./Mme ${apt.patientName},\nNous vous rappelons votre rendez-vous le ${apt.date} à ${apt.timeSlot} avec ${docName} pour : ${serviceName}.\n📍 Adresse : Sidi Yahia / Hydra, Alger.\nMerci de confirmer votre présence en répondant à ce message.`;

    const cleanPhone = apt.patientPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('213') ? cleanPhone : `213${cleanPhone.replace(/^0/, '')}`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
  };

  // Generate WhatsApp Confirmation Text for Orders
  const getWhatsAppOrderConfirmationUrl = (ord: ProductOrder) => {
    const itemsList = ord.items
      .map(i => {
        let pName = '';
        if (typeof i.productName === 'string') {
          pName = i.productName;
        } else if (i.productName && typeof i.productName === 'object') {
          pName = (i.productName as any)[language] || (i.productName as any).fr || '';
        }
        return `${pName || 'Produit'} (x${i.quantity})`;
      })
      .join(', ');
    const msg =
      language === 'ar'
        ? `مرحباً بك سيد/ة ${ord.customerName}،\n\nنؤكد استلام طلبيتكم رقم [${ord.orderNumber}] من متجر عيادة البهجة لطب الأسنان 🦷\n📦 المنتجات: ${itemsList}\n📍 التوصيل: ولاية ${ord.wilayaName} (${ord.commune})\n💰 المبلغ الإجمالي عند الاستلام: ${ord.totalDZD.toLocaleString()} دج.\n\nهل تؤكدون عنوان الاستلام لبدء الشحن الفوري؟`
        : `Bonjour M./Mme ${ord.customerName},\n\nNous confirmons votre commande [${ord.orderNumber}] sur la boutique Cabinet Dentaire El Bahdja 🦷\n📦 Articles : ${itemsList}\n📍 Livraison : Wilaya ${ord.wilayaName} (${ord.commune})\n💰 Total à payer à la livraison : ${ord.totalDZD.toLocaleString()} DA.\n\nMerci de confirmer pour lancer l'expédition immédiate.`;

    const cleanPhone = ord.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('213') ? cleanPhone : `213${cleanPhone.replace(/^0/, '')}`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
  };

  // Doctor Form Handlers
  const handleOpenDoctorModal = (doc?: Doctor) => {
    if (doc) {
      setEditingDoctor(doc);
      setDocFormData({
        nameFr: doc.name.fr,
        nameAr: doc.name.ar,
        nameEn: doc.name.en,
        titleFr: doc.title.fr,
        titleAr: doc.title.ar,
        titleEn: doc.title.en,
        specialtyFr: doc.specialty.fr,
        specialtyAr: doc.specialty.ar,
        specialtyEn: doc.specialty.en,
        experienceYears: doc.experienceYears,
        languages: doc.languages,
        bioFr: doc.bio.fr,
        bioAr: doc.bio.ar,
        bioEn: doc.bio.en,
        imageUrl: doc.imageUrl,
        workingHoursStart: doc.workingHours.start,
        workingHoursEnd: doc.workingHours.end,
      });
    } else {
      setEditingDoctor(null);
      setDocFormData({
        nameFr: '',
        nameAr: '',
        nameEn: '',
        titleFr: 'Chirurgien-Dentiste',
        titleAr: 'طبيب جراح أسنان',
        titleEn: 'Dental Surgeon',
        specialtyFr: 'Dentisterie Esthétique & Soins',
        specialtyAr: 'طب وتجميل الأسنان',
        specialtyEn: 'Aesthetic Dentistry',
        experienceYears: 5,
        languages: ['Arabe', 'Français'],
        bioFr: 'Praticien expérimenté et diplômé avec formation continue internationale.',
        bioAr: 'طبيب متميز حاصل على شهادات تخصص وتكوين مستمر في طب الأسنان الحديث.',
        bioEn: 'Experienced practitioner with continuous international education in modern dentistry.',
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
        workingHoursStart: '08:30',
        workingHoursEnd: '16:30',
      });
    }
    setIsDoctorModalOpen(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFormData.nameFr.trim()) return;

    if (editingDoctor) {
      await updateDoctor({
        ...editingDoctor,
        name: { fr: docFormData.nameFr, ar: docFormData.nameAr || docFormData.nameFr, en: docFormData.nameEn || docFormData.nameFr },
        title: { fr: docFormData.titleFr, ar: docFormData.titleAr, en: docFormData.titleEn },
        specialty: { fr: docFormData.specialtyFr, ar: docFormData.specialtyAr, en: docFormData.specialtyEn },
        experienceYears: Number(docFormData.experienceYears),
        languages: docFormData.languages,
        bio: { fr: docFormData.bioFr, ar: docFormData.bioAr, en: docFormData.bioEn },
        imageUrl: docFormData.imageUrl,
        workingHours: {
          ...editingDoctor.workingHours,
          start: docFormData.workingHoursStart,
          end: docFormData.workingHoursEnd,
        },
      });
      showToast('Praticien mis à jour et synchronisé avec Supabase !', 'success');
    } else {
      const newDoc: Doctor = {
        id: `doc-${Date.now().toString().slice(-4)}`,
        name: { fr: docFormData.nameFr, ar: docFormData.nameAr || docFormData.nameFr, en: docFormData.nameEn || docFormData.nameFr },
        title: { fr: docFormData.titleFr, ar: docFormData.titleAr, en: docFormData.titleEn },
        specialty: { fr: docFormData.specialtyFr, ar: docFormData.specialtyAr, en: docFormData.specialtyEn },
        qualifications: { fr: ['Diplôme d’État', 'Formation Continue'], ar: ['شهادة دكتوراه دولة', 'تكوين مستمر'], en: ['State Doctorate', 'Continuous Education'] },
        experienceYears: Number(docFormData.experienceYears),
        languages: docFormData.languages,
        bio: { fr: docFormData.bioFr, ar: docFormData.bioAr, en: docFormData.bioEn },
        imageUrl: docFormData.imageUrl,
        availableDays: [6, 0, 1, 2, 3],
        workingHours: {
          start: docFormData.workingHoursStart,
          end: docFormData.workingHoursEnd,
        },
        rating: 5.0,
        reviewsCount: 1,
      };
      await addDoctor(newDoc);
      showToast('Nouveau praticien enregistré et synchronisé avec Supabase !', 'success');
    }
    setIsDoctorModalOpen(false);
  };

  // Treatment / Service Form Handlers
  const handleOpenServiceModal = (serv?: TreatmentService) => {
    if (serv) {
      setEditingService(serv);
      setServiceFormData({
        nameFr: serv.name.fr,
        nameAr: serv.name.ar,
        nameEn: serv.name.en,
        shortDescFr: serv.shortDescription.fr,
        shortDescAr: serv.shortDescription.ar,
        shortDescEn: serv.shortDescription.en,
        category: serv.category,
        priceDZD: serv.priceDZD,
        durationMinutes: serv.durationMinutes,
        imageUrl: serv.imageUrl,
        benefitsFr: serv.benefits.fr.join('\n'),
      });
    } else {
      setEditingService(null);
      setServiceFormData({
        nameFr: '',
        nameAr: '',
        nameEn: '',
        shortDescFr: '',
        shortDescAr: '',
        shortDescEn: '',
        category: 'general',
        priceDZD: 4000,
        durationMinutes: 30,
        imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
        benefitsFr: 'Diagnostic précis\nMatériel stérile de pointe\nTraitement 100% sans douleur',
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.nameFr.trim()) return;

    const benefitsArrayFr = serviceFormData.benefitsFr.split('\n').filter(b => b.trim().length > 0);

    if (editingService) {
      await updateService({
        ...editingService,
        name: { fr: serviceFormData.nameFr, ar: serviceFormData.nameAr || serviceFormData.nameFr, en: serviceFormData.nameEn || serviceFormData.nameFr },
        shortDescription: { fr: serviceFormData.shortDescFr, ar: serviceFormData.shortDescAr || serviceFormData.shortDescFr, en: serviceFormData.shortDescEn || serviceFormData.shortDescFr },
        category: serviceFormData.category,
        priceDZD: Number(serviceFormData.priceDZD),
        durationMinutes: Number(serviceFormData.durationMinutes),
        imageUrl: serviceFormData.imageUrl,
        benefits: {
          ...editingService.benefits,
          fr: benefitsArrayFr,
        },
      });
      showToast('Soin mis à jour et synchronisé avec Supabase !', 'success');
    } else {
      const newServ: TreatmentService = {
        id: `srv-${Date.now().toString().slice(-4)}`,
        slug: serviceFormData.nameFr.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: { fr: serviceFormData.nameFr, ar: serviceFormData.nameAr || serviceFormData.nameFr, en: serviceFormData.nameEn || serviceFormData.nameFr },
        shortDescription: { fr: serviceFormData.shortDescFr, ar: serviceFormData.shortDescAr || serviceFormData.shortDescFr, en: serviceFormData.shortDescEn || serviceFormData.shortDescFr },
        fullDescription: { fr: serviceFormData.shortDescFr, ar: serviceFormData.shortDescAr || serviceFormData.shortDescFr, en: serviceFormData.shortDescEn || serviceFormData.shortDescFr },
        category: serviceFormData.category,
        priceDZD: Number(serviceFormData.priceDZD),
        durationMinutes: Number(serviceFormData.durationMinutes),
        iconName: 'Sparkles',
        imageUrl: serviceFormData.imageUrl,
        benefits: {
          fr: benefitsArrayFr,
          ar: ['تشخيص دقيق', 'أحدث التقنيات الطبية', 'علاج بدون ألم'],
          en: ['Accurate diagnosis', 'Latest technology', '100% painless treatment'],
        },
        procedureSteps: [],
        faqs: [],
        isPopular: false,
      };
      await addService(newServ);
      showToast('Nouveau soin enregistré et synchronisé avec Supabase !', 'success');
    }
    setIsServiceModalOpen(false);
  };

  // Product Add / Edit Modal Handlers
  const handleOpenProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProductFormData({
        nameFr: prod.name.fr,
        nameAr: prod.name.ar,
        nameEn: prod.name.en,
        subtitleFr: prod.subtitle.fr,
        subtitleAr: prod.subtitle.ar,
        subtitleEn: prod.subtitle.en,
        descriptionFr: prod.description.fr,
        descriptionAr: prod.description.ar,
        descriptionEn: prod.description.en,
        category: prod.category,
        priceDZD: prod.priceDZD,
        originalPriceDZD: prod.originalPriceDZD || prod.priceDZD,
        stockCount: prod.stockCount,
        inStock: prod.inStock,
        imageUrl: prod.images[0] || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
        badgeFr: prod.badge?.fr || 'Top Vente',
        badgeAr: prod.badge?.ar || 'الأكثر طلباً',
        doctorRecFr: prod.doctorRecommendation?.fr || 'Recommandé par nos spécialistes.',
      });
    } else {
      setEditingProduct(null);
      setProductFormData({
        nameFr: '',
        nameAr: '',
        nameEn: '',
        subtitleFr: 'Produit dentaire professionnel certifié',
        subtitleAr: 'منتج معتمد بجودة احترافية',
        subtitleEn: 'Certified professional dental product',
        descriptionFr: 'Formule professionnelle approuvée pour une hygiène dentaire optimale à domicile.',
        descriptionAr: 'تركيبة احترافية معتمدة للحفاظ على صحة وجمال أسنانكم في المنزل.',
        descriptionEn: 'Approved professional formula for optimal home oral healthcare.',
        category: 'whitening',
        priceDZD: 4500,
        originalPriceDZD: 6500,
        stockCount: 50,
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
        badgeFr: 'Top Vente',
        badgeAr: 'الأكثر طلباً',
        doctorRecFr: 'Testé et recommandé par nos dentistes.',
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.nameFr.trim()) return;

    if (editingProduct) {
      await updateProduct({
        ...editingProduct,
        name: {
          fr: productFormData.nameFr,
          ar: productFormData.nameAr || productFormData.nameFr,
          en: productFormData.nameEn || productFormData.nameFr,
        },
        subtitle: {
          fr: productFormData.subtitleFr,
          ar: productFormData.subtitleAr || productFormData.subtitleFr,
          en: productFormData.subtitleEn || productFormData.subtitleFr,
        },
        description: {
          fr: productFormData.descriptionFr,
          ar: productFormData.descriptionAr || productFormData.descriptionFr,
          en: productFormData.descriptionEn || productFormData.descriptionFr,
        },
        category: productFormData.category,
        priceDZD: Number(productFormData.priceDZD),
        originalPriceDZD: Number(productFormData.originalPriceDZD),
        stockCount: Number(productFormData.stockCount),
        inStock: Number(productFormData.stockCount) > 0,
        images: [productFormData.imageUrl],
        badge: {
          fr: productFormData.badgeFr,
          ar: productFormData.badgeAr,
          en: productFormData.badgeFr,
        },
        doctorRecommendation: {
          fr: productFormData.doctorRecFr,
          ar: productFormData.doctorRecFr,
          en: productFormData.doctorRecFr,
        },
      });
      showToast('Produit mis à jour et synchronisé avec Supabase !', 'success');
    } else {
      const newProd: Product = {
        id: `prod-${Date.now().toString().slice(-4)}`,
        slug: productFormData.nameFr.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: {
          fr: productFormData.nameFr,
          ar: productFormData.nameAr || productFormData.nameFr,
          en: productFormData.nameEn || productFormData.nameFr,
        },
        subtitle: {
          fr: productFormData.subtitleFr,
          ar: productFormData.subtitleAr || productFormData.subtitleFr,
          en: productFormData.subtitleEn || productFormData.subtitleFr,
        },
        description: {
          fr: productFormData.descriptionFr,
          ar: productFormData.descriptionAr || productFormData.descriptionFr,
          en: productFormData.descriptionEn || productFormData.descriptionFr,
        },
        category: productFormData.category,
        priceDZD: Number(productFormData.priceDZD),
        originalPriceDZD: Number(productFormData.originalPriceDZD),
        inStock: Number(productFormData.stockCount) > 0,
        stockCount: Number(productFormData.stockCount),
        images: [productFormData.imageUrl],
        rating: 4.9,
        reviewsCount: 1,
        isBestSeller: true,
        badge: {
          fr: productFormData.badgeFr,
          ar: productFormData.badgeAr,
          en: productFormData.badgeFr,
        },
        doctorRecommendation: {
          fr: productFormData.doctorRecFr,
          ar: productFormData.doctorRecFr,
          en: productFormData.doctorRecFr,
        },
        features: {
          fr: ['Qualité clinique garantie', 'Paiement à la livraison', 'Livraison 58 wilayas'],
          ar: ['جودة طبية مضمونة', 'الدفع عند الاستلام', 'توصيل لـ 58 ولاية'],
          en: ['Clinical quality guaranteed', 'Cash on delivery', 'Delivery to all 58 wilayas'],
        },
        howToUse: {
          fr: 'Utiliser selon les recommandations de votre dentiste.',
          ar: 'يستخدم حسب إرشادات الطبيب.',
          en: 'Use as directed by your dentist.',
        },
      };
      await addProduct(newProd);
      showToast('Nouveau produit enregistré et synchronisé avec Supabase !', 'success');
    }
    setIsProductModalOpen(false);
  };

  // CMS Settings Save Handler
  const handleSaveCmsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateClinicInfo(cmsData);
    setCmsSaveResult(res);
    setCmsSavedToast(true);
    setTimeout(() => {
      setCmsSavedToast(false);
      setCmsSaveResult(null);
    }, 5000);
  };

  const navGroups = [
    {
      title: 'ACTIVITÉ CLINIQUE',
      items: [
        {
          id: 'appointments' as const,
          label: 'Rendez-vous',
          icon: Calendar,
          count: appointments.length,
          badge: stats.pendingApt > 0 ? `${stats.pendingApt} attente` : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        {
          id: 'orders' as const,
          label: 'Commandes COD (58 W)',
          icon: ShoppingBag,
          count: orders.length,
          badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} à valider` : null,
          badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
        },
        {
          id: 'patients' as const,
          label: 'Dossiers Patients',
          icon: FileText,
          count: patients.length,
          badge: null,
          badgeColor: '',
        },
      ],
    },
    {
      title: 'ÉQUIPE & CATALOGUES',
      items: [
        {
          id: 'doctors' as const,
          label: 'Chirurgiens-Dentistes',
          icon: Users,
          count: doctors.length,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'services' as const,
          label: 'Soins & Tarifs DZD',
          icon: Stethoscope,
          count: services.length,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'products' as const,
          label: 'Boutique Produits',
          icon: ShoppingBag,
          count: products.length,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'before_after' as const,
          label: 'Avant / Après (Cas Cliniques)',
          icon: Sparkles,
          count: beforeAfterCases.length,
          badge: null,
          badgeColor: '',
        },
      ],
    },
    {
      title: 'GESTION DE LA CLINIQUE',
      items: [
        {
          id: 'cms_settings' as const,
          label: 'Paramètres CMS & Contact',
          icon: Settings,
          count: null,
          badge: null,
          badgeColor: '',
        },
      ],
    },
  ];

  const currentTabLabel = useMemo(() => {
    for (const group of navGroups) {
      const match = group.items.find(i => i.id === activeTab);
      if (match) return match.label;
    }
    return 'Tableau de Bord';
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-72 xl:w-80 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 lg:h-screen lg:sticky lg:top-0 flex flex-col justify-between shrink-0 z-30">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 to-cyan-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-teal-500/20">
                <Lock className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white tracking-tight truncate max-w-[170px]">
                  {clinicInfo.name[language]}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-teal-400 font-semibold tracking-wide uppercase">
                    Admin Pro
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleAdminMode(false)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
              title={t.nav.backToSite}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-linear-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/25'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                        {item.count !== null && !item.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.count}
                          </span>
                        )}
                        <ChevronRight className={`w-3 h-3 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-600'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Quick Controls */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-2.5">

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleAdminMode(false)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.nav.backToSite}</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/60 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col bg-slate-900 relative">
        
        {/* Floating Global Toast Notification */}
        {globalToast && (
          <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300 max-w-md shadow-2xl">
            <div className={`px-4 py-3 rounded-2xl border flex items-center gap-3 backdrop-blur-md ${
              globalToast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-emerald-900/30'
                : globalToast.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-900/30'
                : 'bg-cyan-950/95 border-cyan-500/50 text-cyan-200 shadow-cyan-900/30'
            }`}>
              {globalToast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : globalToast.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
              )}
              <div className="text-xs font-semibold flex-1 leading-snug">
                {globalToast.message}
              </div>
              <button
                onClick={() => setGlobalToast(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Top App Bar */}
        <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-white">
              {currentTabLabel}
            </h2>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px] font-medium border border-slate-700">
              Cabinet Dentaire El Bahdja
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => toggleAdminMode(false)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voir le site</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 space-y-6">
          
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Rendez-vous Total</span>
              <div className="text-2xl font-black text-white">{stats.totalApt}</div>
              <div className="text-[11px] text-amber-400">{stats.pendingApt} en attente</div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-1">
              <span className="text-xs text-teal-300 font-medium">Commandes Boutique (COD)</span>
              <div className="text-2xl font-black text-teal-400">{stats.totalOrders}</div>
              <div className="text-[11px] text-slate-400">{stats.pendingOrders} à confirmer par tél</div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-1">
              <span className="text-xs text-cyan-300 font-medium">Chiffre Boutique Validé</span>
              <div className="text-2xl font-black text-cyan-400">{stats.orderRevenue.toLocaleString()} DA</div>
              <div className="text-[11px] text-slate-400">Livraison 58 Wilayas</div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-1">
              <span className="text-xs text-amber-300 font-medium">Base Médicale & Produits</span>
              <div className="text-2xl font-black text-white">{doctors.length} Dr • {services.length} Soins</div>
              <div className="text-[11px] text-teal-400">{products.length} Produits au catalogue</div>
            </div>
          </div>

        {/* TAB 1: APPOINTMENTS MANAGER */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  placeholder="Rechercher patient, tél..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="all">Tous statuts ({appointments.length})</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmés</option>
                  <option value="completed">Honorés</option>
                  <option value="cancelled">Annulés</option>
                </select>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Traitement & Médecin</th>
                      <th className="py-3 px-4">Date & Heure</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Aucun rendez-vous trouvé avec ces critères.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => {
                        const serviceObj = services.find((s) => s.id === apt.serviceId);
                        const doctorObj = doctors.find((d) => d.id === apt.doctorId);
                        return (
                          <tr key={apt.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">{apt.patientName}</div>
                              <div className="text-[11px] text-slate-400">{apt.patientPhone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-teal-300">{serviceObj?.name[language] || apt.serviceId}</div>
                              <div className="text-[11px] text-slate-400">{doctorObj?.name[language] || apt.doctorId}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-200">{apt.date}</div>
                              <div className="text-[11px] text-teal-400">{apt.timeSlot}</div>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={apt.status}
                                onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors ${
                                  apt.status === 'confirmed'
                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                    : apt.status === 'pending'
                                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                    : apt.status === 'completed'
                                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                                    : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                                }`}
                              >
                                <option value="pending" className="bg-slate-900 text-amber-300">⏳ En attente</option>
                                <option value="confirmed" className="bg-slate-900 text-emerald-300">✅ Confirmé</option>
                                <option value="completed" className="bg-slate-900 text-cyan-300">🎉 Honoré</option>
                                <option value="cancelled" className="bg-slate-900 text-rose-300">❌ Annulé</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <a
                                href={`tel:${apt.patientPhone}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600/80 hover:bg-teal-600 text-white text-[11px] font-semibold transition-colors"
                                title={`Appeler ${apt.patientName} (${apt.patientPhone})`}
                              >
                                <Phone className="w-3 h-3" />
                                <span>Appeler</span>
                              </a>

                              <a
                                href={getWhatsAppReminderUrl(apt)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-semibold transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span className="hidden md:inline">WhatsApp</span>
                              </a>

                              <button
                                onClick={() => {
                                  deleteAppointment(apt.id);
                                }}
                                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer inline-flex items-center"
                                title="Supprimer ce rendez-vous"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STORE ORDERS MANAGER (COD - 58 WILAYAS) */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Rechercher client, réf DZ, tél, commune..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="all">Tous statuts ({orders.length})</option>
                  <option value="pending">En attente (À appeler)</option>
                  <option value="confirmed">Confirmées (Prêtes)</option>
                  <option value="shipped">Expédiées (En cours)</option>
                  <option value="delivered">Livrées (Encaissées)</option>
                  <option value="cancelled">Annulées</option>
                </select>

                <select
                  value={orderWilayaFilter}
                  onChange={(e) => setOrderWilayaFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="all">Toutes Wilayas (58)</option>
                  {algeriaWilayas.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {w.nameFr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Réf & Date</th>
                      <th className="py-3 px-4">Client & Contact</th>
                      <th className="py-3 px-4">Wilaya & Commune</th>
                      <th className="py-3 px-4">Produits</th>
                      <th className="py-3 px-4">Total (COD)</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions Rapides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Aucune commande trouvée.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-amber-400">{ord.orderNumber}</div>
                            <div className="text-[11px] text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{ord.customerName}</div>
                            <div className="text-[11px] text-teal-400">{ord.customerPhone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200">
                              {ord.wilayaCode} - {ord.wilayaName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {ord.commune} ({ord.deliveryType === 'home' ? 'Domicile' : 'Bureau'})
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {ord.items.map((it, idx) => {
                              const nameStr = typeof it.productName === 'object' && it.productName !== null
                                ? ((it.productName as Record<string, string>)[language] || (it.productName as Record<string, string>).fr || '')
                                : it.productName;
                              return (
                                <div key={idx} className="text-slate-200">
                                  {nameStr} <span className="font-bold text-teal-400">x{it.quantity}</span>
                                </div>
                              );
                            })}
                          </td>
                          <td className="py-3 px-4 font-bold text-teal-300">
                            {ord.totalDZD.toLocaleString()} DA
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.status}
                              onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-200 focus:ring-1 focus:ring-teal-500"
                            >
                              <option value="pending">⏳ En attente</option>
                              <option value="confirmed">✅ Confirmé</option>
                              <option value="shipped">🚚 Expédié</option>
                              <option value="delivered">🎉 Livré & Encaissé</option>
                              <option value="cancelled">❌ Annulé</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <a
                              href={`tel:${ord.customerPhone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600/80 hover:bg-teal-600 text-white text-[11px] font-semibold transition-colors"
                              title={`Appeler ${ord.customerName} (${ord.customerPhone})`}
                            >
                              <Phone className="w-3 h-3" />
                              <span className="hidden sm:inline">Appeler</span>
                            </a>

                            <a
                              href={getWhatsAppOrderConfirmationUrl(ord)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-semibold transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>

                            <button
                              onClick={() => {
                                deleteOrder(ord.id);
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer inline-flex items-center"
                              title="Supprimer cette commande"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOCTORS & STAFF CRUD */}
        {activeTab === 'doctors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div>
                <h3 className="font-bold text-white text-base">Gestion de l'Équipe Médicale</h3>
                <p className="text-xs text-slate-400">Ajoutez, modifiez ou organisez les chirurgiens-dentistes et plannings.</p>
              </div>
              <button
                id="add-doctor-btn"
                onClick={() => handleOpenDoctorModal()}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Praticien</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex flex-col justify-between space-y-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={doc.imageUrl}
                      alt={doc.name[language] || doc.name.fr}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-600 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{doc.name[language] || doc.name.fr}</h4>
                      <p className="text-xs text-teal-400 font-medium">{doc.specialty[language] || doc.specialty.fr}</p>
                      <p className="text-[11px] text-slate-400">{doc.experienceYears} ans d'expérience</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Horaires :</span>
                      <span className="font-semibold">{doc.workingHours.start} – {doc.workingHours.end}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Langues :</span>
                      <span>{doc.languages.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                    <button
                      onClick={() => handleOpenDoctorModal(doc)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={async () => {
                        await deleteDoctor(doc.id);
                        showToast('Praticien supprimé de la base de données.', 'info');
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SERVICES & TARIFS CRUD */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div>
                <h3 className="font-bold text-white text-base">Catalogue des Soins & Tarifs (DZD)</h3>
                <p className="text-xs text-slate-400">Ajoutez de nouveaux soins, modifiez les tarifs indicatifs en Dinars et durées.</p>
              </div>
              <button
                id="add-service-btn"
                onClick={() => handleOpenServiceModal()}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Traitement</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((serv) => (
                <div key={serv.id} className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={serv.imageUrl}
                      alt={serv.name[language] || serv.name.fr}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-600 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{serv.name[language] || serv.name.fr}</h4>
                      <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-800">
                        {serv.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {serv.shortDescription[language] || serv.shortDescription.fr}
                  </p>

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-700">
                    <div className="text-base font-extrabold text-cyan-300">
                      {serv.priceDZD.toLocaleString()} DA
                    </div>
                    <span className="text-xs text-slate-400">{serv.durationMinutes} min</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                    <button
                      onClick={() => handleOpenServiceModal(serv)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modifier Tarif & Soin</span>
                    </button>
                    <button
                      onClick={async () => {
                        await deleteService(serv.id);
                        showToast('Soin supprimé de la base de données.', 'info');
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PRODUCTS CATALOG CRUD (BOUTIQUE COD) */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div>
                <h3 className="font-bold text-white text-base">Gestion des Produits Boutique (Paiement à la Livraison)</h3>
                <p className="text-xs text-slate-400">Gérez le catalogue, les stocks, les prix en DA, les photos et les fiches descriptives.</p>
              </div>
              <button
                id="add-product-btn"
                onClick={() => handleOpenProductModal()}
                className="px-4 py-2.5 rounded-xl bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Produit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div key={prod.id} className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={prod.images[0]}
                      alt={prod.name[language] || prod.name.fr}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-600 shrink-0 bg-white/5"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{prod.name[language] || prod.name.fr}</h4>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xs font-bold text-teal-400">{prod.priceDZD.toLocaleString()} DA</span>
                        {prod.originalPriceDZD && prod.originalPriceDZD > prod.priceDZD && (
                          <span className="text-[10px] text-slate-400 line-through">{prod.originalPriceDZD.toLocaleString()} DA</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-1">
                        Stock : <span className={`font-bold ${prod.stockCount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{prod.stockCount} unités</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {prod.subtitle?.[language] || prod.subtitle?.fr || prod.description?.[language] || prod.description?.fr}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                    <button
                      onClick={() => handleOpenProductModal(prod)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={async () => {
                        await deleteProduct(prod.id);
                        showToast('Produit supprimé de la base de données.', 'info');
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer"
                      title="Supprimer ce produit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PATIENT MEDICAL RECORDS */}
        {activeTab === 'patients' && (
          <div className="space-y-4">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-white text-base">Dossiers Médicaux & Suivi Clinique</h3>
              <p className="text-xs text-slate-400">Historique des visites, antécédents et fiches patients créées automatiquement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((pat) => (
                <div key={pat.id} className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{pat.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                      {pat.totalVisits} visites
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div>📞 {pat.phone}</div>
                    {pat.lastVisit && <div>Dernier soin : <span className="text-slate-200">{pat.lastVisit}</span></div>}
                    {pat.allergies && pat.allergies.length > 0 && (
                      <div className="text-rose-400">⚠️ Alertes : {pat.allergies.join(', ')}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: BEFORE & AFTER CLINICAL CASES */}
        {activeTab === 'before_after' && (
          <BeforeAfterManager onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} />
        )}

        {/* TAB 7: CMS CLINIC SETTINGS */}
        {activeTab === 'cms_settings' && (
          <div className="space-y-6">
            
            {/* Header & Save notification */}
            <div className="bg-linear-to-r from-teal-950/80 to-slate-900 border border-teal-800/60 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-teal-400" />
                  <span>Paramètres Généraux du Cabinet & CMS</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Modifiez le nom du cabinet, l'adresse, les numéros de téléphone et d'urgences, les liens de réseaux sociaux, les cartes Google Maps et les horaires.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {cmsSavedToast && (
                  <div className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 animate-in fade-in ${
                    cmsSaveResult?.success ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {cmsSaveResult?.success 
                        ? 'Enregistré & synchronisé sur Supabase !' 
                        : `Enreg. local OK, mais échec Supabase: ${cmsSaveResult?.error || 'Non configuré'}`}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSaveCmsSettings}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-600/30 transition-all cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveCmsSettings} className="space-y-6 text-xs">
              

              {/* Section 0: Admin Security & Credentials (Separated at top) */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-teal-500/50 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>🔐</span> Sécurité & Identifiants Admin (Email & Mot de passe)
                  </h4>
                  <span className="text-[10px] text-teal-400 font-semibold bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                    Table Supabase: clinic_info
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Email Administrateur</label>
                    <input
                      type="email"
                      value={cmsData.adminEmail || ''}
                      onChange={e => setCmsData({ ...cmsData, adminEmail: e.target.value })}
                      placeholder="admin@basma.com"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500"
                    />
                    <p className="text-[10px] text-slate-400">Email utilisé pour se connecter à l'espace d'administration.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Mot de passe Administrateur</label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={cmsData.adminPassword || ''}
                        onChange={e => setCmsData({ ...cmsData, adminPassword: e.target.value })}
                        placeholder="Nouveau mot de passe"
                        className="w-full px-3 py-2 pr-10 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        title={showAdminPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">Ce mot de passe est enregistré de manière sécurisée dans la table clinic_info.</p>
                  </div>
                </div>
              </div>

              {/* Section 1: Nom & Slogan */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h4 className="font-bold text-white text-sm border-b border-slate-700 pb-2 flex items-center gap-2">
                  <span>🏛️</span> Nom du Cabinet & Slogans
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Nom du Cabinet (Français) *</label>
                    <input
                      type="text"
                      required
                      value={cmsData.name.fr}
                      onChange={e => setCmsData({ ...cmsData, name: { ...cmsData.name, fr: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Nom du Cabinet (العربية)</label>
                    <input
                      type="text"
                      value={cmsData.name.ar}
                      onChange={e => setCmsData({ ...cmsData, name: { ...cmsData.name, ar: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500 text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Nom du Cabinet (English)</label>
                    <input
                      type="text"
                      value={cmsData.name.en}
                      onChange={e => setCmsData({ ...cmsData, name: { ...cmsData.name, en: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Slogan (Français)</label>
                    <input
                      type="text"
                      value={cmsData.tagline.fr}
                      onChange={e => setCmsData({ ...cmsData, tagline: { ...cmsData.tagline, fr: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Slogan (العربية)</label>
                    <input
                      type="text"
                      value={cmsData.tagline.ar}
                      onChange={e => setCmsData({ ...cmsData, tagline: { ...cmsData.tagline, ar: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Slogan (English)</label>
                    <input
                      type="text"
                      value={cmsData.tagline.en}
                      onChange={e => setCmsData({ ...cmsData, tagline: { ...cmsData.tagline, en: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 1.5: Textes de la page d'accueil (Hero) */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h4 className="font-bold text-white text-sm border-b border-slate-700 pb-2 flex items-center gap-2">
                  <span>✨</span> Textes d'Accueil (Section Héro)
                </h4>

                {/* Title Part 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Titre partie 1 (Français)</label>
                    <input
                      type="text"
                      value={cmsData.hero?.titlePart1?.fr || 'Votre Sourire,'}
                      onChange={e => setCmsData({ ...cmsData, hero: { ...cmsData.hero, titlePart1: { ...cmsData.hero?.titlePart1, fr: e.target.value } as any } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Titre partie 1 (العربية)</label>
                    <input
                      type="text"
                      value={cmsData.hero?.titlePart1?.ar || 'ابتسامتك،'}
                      onChange={e => setCmsData({ ...cmsData, hero: { ...cmsData.hero, titlePart1: { ...cmsData.hero?.titlePart1, ar: e.target.value } as any } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Titre partie 1 (English)</label>
                    <input
                      type="text"
                      value={cmsData.hero?.titlePart1?.en || 'Your Smile,'}
                      onChange={e => setCmsData({ ...cmsData, hero: { ...cmsData.hero, titlePart1: { ...cmsData.hero?.titlePart1, en: e.target.value } as any } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Title Part 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-teal-300 font-semibold">Titre partie 2 (Français)</label>
                    <input
                      type="text"
                      value={cmsData.hero?.titlePart2?.fr || 'Notre Expertise.'}
                      onChange={e => setCmsData({ ...cmsData, hero: { ...cmsData.hero, titlePart2: { ...cmsData.hero?.titlePart2, fr: e.target.value } as any } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-teal-500/30 rounded-xl text-teal-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-teal-300 font-semibold">Titre partie 2 (العربية)</label>
                    <input
                      type="text"
                      value={cmsData.hero?.titlePart2?.ar || 'خبرتنا.'}
                      onChange={e => setCmsData({ ...cmsData, hero: { ...cmsData.hero, titlePart2: { ...cmsData.hero?.titlePart2, ar: e.target.value } as any } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-teal-500/30 rounded-xl text-teal-300 text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-teal-300 font-semibold">Titre partie 2 (English)</label>
                    <input
                      type="text"
                      value={cmsData.hero?.titlePart2?.en || 'Our Expertise.'}
                      onChange={e => setCmsData({ ...cmsData, hero: { ...cmsData.hero, titlePart2: { ...cmsData.hero?.titlePart2, en: e.target.value } as any } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-teal-500/30 rounded-xl text-teal-300"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Paragraphe (Français)</label>
                    <textarea
                      value={cmsData.hero?.description?.fr || 'Une dentisterie moderne, sans douleur et personnalisée. Équipements 3D haute technologie et équipe pluridisciplinaire au cœur de Sidi Yahia, Alger.'}
                      onChange={e => setCmsData({ ...cmsData, hero: { ...cmsData.hero, description: { ...cmsData.hero?.description, fr: e.target.value } as any } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white h-20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Paragraphe (العربية)</label>
                    <textarea
                      value={cmsData.hero?.description?.ar || 'طب أسنان حديث، بدون ألم، ومخصص. معدات ثلاثية الأبعاد عالية التقنية وفريق متعدد التخصصات في قلب سيدي يحيى، الجزائر.'}
                      onChange={e => setCmsData({ ...cmsData, hero: { ...cmsData.hero, description: { ...cmsData.hero?.description, ar: e.target.value } as any } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-right h-20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Paragraphe (English)</label>
                    <textarea
                      value={cmsData.hero?.description?.en || 'Modern, painless, and personalized dentistry. High-tech 3D equipment and a multidisciplinary team in the heart of Sidi Yahia, Algiers.'}
                      onChange={e => setCmsData({ ...cmsData, hero: { ...cmsData.hero, description: { ...cmsData.hero?.description, en: e.target.value } as any } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white h-20"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Urgences */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h4 className="font-bold text-white text-sm border-b border-slate-700 pb-2 flex items-center gap-2">
                  <span>📞</span> Coordonnées & Téléphone Urgences
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Téléphone Fixe / Accueil</label>
                    <input
                      type="text"
                      value={cmsData.phone}
                      onChange={e => setCmsData({ ...cmsData, phone: e.target.value })}
                      placeholder="+213 23 45 67 89"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-rose-300 font-semibold">🚨 Ligne Urgences 24/7 (Bannière)</label>
                    <input
                      type="text"
                      value={cmsData.emergencyPhone}
                      onChange={e => setCmsData({ ...cmsData, emergencyPhone: e.target.value })}
                      placeholder="+213 555 12 34 56"
                      className="w-full px-3 py-2 bg-slate-900 border border-rose-800/60 rounded-xl text-rose-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-emerald-300 font-semibold">WhatsApp Direct (+213...)</label>
                    <input
                      type="text"
                      value={cmsData.whatsapp}
                      onChange={e => setCmsData({ ...cmsData, whatsapp: e.target.value })}
                      placeholder="+213555123456"
                      className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/60 rounded-xl text-emerald-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Email de Contact</label>
                    <input
                      type="email"
                      value={cmsData.email}
                      onChange={e => setCmsData({ ...cmsData, email: e.target.value })}
                      placeholder="contact@elbahdja-dental.dz"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Localisation & Adresse */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h4 className="font-bold text-white text-sm border-b border-slate-700 pb-2 flex items-center gap-2">
                  <span>📍</span> Adresse, Ville, Wilaya & Parking
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Wilaya</label>
                    <input
                      type="text"
                      value={cmsData.wilaya || '16 - Alger'}
                      onChange={e => setCmsData({ ...cmsData, wilaya: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Ville / Commune</label>
                    <input
                      type="text"
                      value={cmsData.city}
                      onChange={e => setCmsData({ ...cmsData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Pays</label>
                    <input
                      type="text"
                      value={cmsData.country}
                      onChange={e => setCmsData({ ...cmsData, country: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Adresse Complète (Français)</label>
                    <textarea
                      rows={2}
                      value={cmsData.address.fr}
                      onChange={e => setCmsData({ ...cmsData, address: { ...cmsData.address, fr: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Adresse Complète (العربية)</label>
                    <textarea
                      rows={2}
                      value={cmsData.address.ar}
                      onChange={e => setCmsData({ ...cmsData, address: { ...cmsData.address, ar: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Points de Repère / Proximité (Français)</label>
                    <input
                      type="text"
                      value={cmsData.landmarks.fr}
                      onChange={e => setCmsData({ ...cmsData, landmarks: { ...cmsData.landmarks, fr: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Information Parking & Accès</label>
                    <input
                      type="text"
                      value={cmsData.parkingInfo.fr}
                      onChange={e => setCmsData({ ...cmsData, parkingInfo: { ...cmsData.parkingInfo, fr: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Google Maps Link & Iframe */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h4 className="font-bold text-white text-sm border-b border-slate-700 pb-2 flex items-center gap-2">
                  <span>🗺️</span> Google Maps & Itinéraire
                </h4>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Lien Direct Google Maps (Bouton "Itinéraire")</label>
                    <input
                      type="url"
                      value={cmsData.googleMapsUrl || 'https://maps.google.com/?q=Sidi+Yahia+Hydra+Algiers'}
                      onChange={e => setCmsData({ ...cmsData, googleMapsUrl: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">URL Embed Carte Google Maps (Iframe intégrée)</label>
                    <input
                      type="url"
                      value={cmsData.googleMapsEmbedUrl || ''}
                      onChange={e => setCmsData({ ...cmsData, googleMapsEmbedUrl: e.target.value })}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Horaires de Travail */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h4 className="font-bold text-white text-sm border-b border-slate-700 pb-2 flex items-center gap-2">
                  <span>⏰</span> Jours & Horaires de Travail
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Semaine (Samedi - Jeudi)</label>
                    <input
                      type="text"
                      value={cmsData.openingHours.weekdays}
                      onChange={e => setCmsData({ ...cmsData, openingHours: { ...cmsData.openingHours, weekdays: e.target.value } })}
                      placeholder="Samedi - Jeudi: 08h30 - 18h30"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-amber-300 font-semibold">Vendredi / Permanence</label>
                    <input
                      type="text"
                      value={cmsData.openingHours.friday}
                      onChange={e => setCmsData({ ...cmsData, openingHours: { ...cmsData.openingHours, friday: e.target.value } })}
                      placeholder="Vendredi: Urgences sur appel"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Samedi (Spécial)</label>
                    <input
                      type="text"
                      value={cmsData.openingHours.saturday}
                      onChange={e => setCmsData({ ...cmsData, openingHours: { ...cmsData.openingHours, saturday: e.target.value } })}
                      placeholder="Samedi: 09h00 - 17h00"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Liens Réseaux Sociaux */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h4 className="font-bold text-white text-sm border-b border-slate-700 pb-2 flex items-center gap-2">
                  <span>📱</span> Réseaux Sociaux & Pages Officielles
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Facebook Page URL</label>
                    <input
                      type="url"
                      value={cmsData.socialLinks?.facebook || ''}
                      onChange={e => setCmsData({
                        ...cmsData,
                        socialLinks: { ...cmsData.socialLinks, facebook: e.target.value }
                      })}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Instagram Profile URL</label>
                    <input
                      type="url"
                      value={cmsData.socialLinks?.instagram || ''}
                      onChange={e => setCmsData({
                        ...cmsData,
                        socialLinks: { ...cmsData.socialLinks, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">TikTok Profile URL</label>
                    <input
                      type="url"
                      value={cmsData.socialLinks?.tiktok || ''}
                      onChange={e => setCmsData({
                        ...cmsData,
                        socialLinks: { ...cmsData.socialLinks, tiktok: e.target.value }
                      })}
                      placeholder="https://tiktok.com/@..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">YouTube Channel URL</label>
                    <input
                      type="url"
                      value={cmsData.socialLinks?.youtube || ''}
                      onChange={e => setCmsData({
                        ...cmsData,
                        socialLinks: { ...cmsData.socialLinks, youtube: e.target.value }
                      })}
                      placeholder="https://youtube.com/@..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">LinkedIn URL</label>
                    <input
                      type="url"
                      value={cmsData.socialLinks?.linkedin || ''}
                      onChange={e => setCmsData({
                        ...cmsData,
                        socialLinks: { ...cmsData.socialLinks, linkedin: e.target.value }
                      })}
                      placeholder="https://linkedin.com/..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 7: Bandeau d'Annonce Supérieur */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>📢</span> Bandeau d'Annonce Supérieur (En haut du site)
                  </h4>
                  <label className="flex items-center gap-2 text-xs font-semibold text-teal-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cmsData.announcementBanner?.enabled ?? true}
                      onChange={e => setCmsData({
                        ...cmsData,
                        announcementBanner: {
                          enabled: e.target.checked,
                          text: cmsData.announcementBanner?.text || { fr: '', ar: '', en: '' }
                        }
                      })}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Afficher le bandeau</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Texte d'annonce (Français)</label>
                    <input
                      type="text"
                      value={cmsData.announcementBanner?.text?.fr || ''}
                      onChange={e => setCmsData({
                        ...cmsData,
                        announcementBanner: {
                          enabled: cmsData.announcementBanner?.enabled ?? true,
                          text: {
                            fr: e.target.value,
                            ar: cmsData.announcementBanner?.text?.ar || '',
                            en: cmsData.announcementBanner?.text?.en || '',
                          }
                        }
                      })}
                      placeholder="Ex: ⭐ Prise en charge sans attente & Urgences 7j/7"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Texte d'annonce (العربية)</label>
                    <input
                      type="text"
                      value={cmsData.announcementBanner?.text?.ar || ''}
                      onChange={e => setCmsData({
                        ...cmsData,
                        announcementBanner: {
                          enabled: cmsData.announcementBanner?.enabled ?? true,
                          text: {
                            fr: cmsData.announcementBanner?.text?.fr || '',
                            ar: e.target.value,
                            en: cmsData.announcementBanner?.text?.en || '',
                          }
                        }
                      })}
                      placeholder="مثال: ⭐ استقبال فوري وطوارئ 7/7"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Section 8: Statistiques Clés */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
                <h4 className="font-bold text-white text-sm border-b border-slate-700 pb-2 flex items-center gap-2">
                  <span>📊</span> Chiffres & Statistiques Clés
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Années d'expérience</label>
                    <input
                      type="number"
                      value={cmsData.stats.yearsExperience}
                      onChange={e => setCmsData({
                        ...cmsData,
                        stats: { ...cmsData.stats, yearsExperience: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Patients soignés</label>
                    <input
                      type="number"
                      value={cmsData.stats.happyPatients}
                      onChange={e => setCmsData({
                        ...cmsData,
                        stats: { ...cmsData.stats, happyPatients: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Note moyenne Google</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cmsData.stats.patientRating}
                      onChange={e => setCmsData({
                        ...cmsData,
                        stats: { ...cmsData.stats, patientRating: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Nombre de spécialistes</label>
                    <input
                      type="number"
                      value={cmsData.stats.expertDoctors}
                      onChange={e => setCmsData({
                        ...cmsData,
                        stats: { ...cmsData.stats, expertDoctors: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 9: Hero Background Media (Image ou Vidéo) */}
              <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700 pb-3 gap-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>🎬</span> Arrière-plan Hero (Image ou Vidéo)
                  </h4>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setCmsData({ ...cmsData, heroMediaType: 'image' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        cmsData.heroMediaType !== 'video'
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Photo / Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCmsData({ ...cmsData, heroMediaType: 'video' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        cmsData.heroMediaType === 'video'
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Vidéo en boucle</span>
                    </button>
                  </div>
                </div>

                {cmsData.heroMediaType === 'video' ? (
                  <div className="space-y-3">
                    <ImageUploadPicker
                      label="Sélectionner la vidéo d'arrière-plan du Hero (MP4 / WebM)"
                      value={cmsData.heroMediaUrl || ''}
                      onChange={val => setCmsData({ ...cmsData, heroMediaUrl: val, heroMediaType: 'video' })}
                      accept="video/*"
                      helperText="Choisissez ou déposez une vidéo d'arrière-plan (MP4, WebM) depuis votre appareil."
                    />

                    {/* Live Video Preview */}
                    {cmsData.heroMediaUrl && (
                      <div className="pt-2">
                        <label className="text-[11px] text-slate-400 font-semibold block mb-1">Aperçu direct de la vidéo :</label>
                        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-56">
                          <video
                            key={cmsData.heroMediaUrl}
                            src={cmsData.heroMediaUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <ImageUploadPicker
                      label="Sélectionner l'image d'arrière-plan du Hero"
                      folder="hero"
                      value={cmsData.heroMediaUrl || ''}
                      onChange={val => setCmsData({ ...cmsData, heroMediaUrl: val, heroMediaType: 'image' })}
                      accept="image/*"
                      helperText="Choisissez ou déposez une photo d'arrière-plan depuis votre appareil."
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-600/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer tous les paramètres CMS</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </main>
      </div>

      {/* DOCTOR ADD / EDIT MODAL */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingDoctor ? 'Modifier le Praticien' : 'Ajouter un Nouveau Praticien'}
              </h3>
              <button onClick={() => setIsDoctorModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nom complet (Français) *</label>
                <input
                  type="text"
                  required
                  value={docFormData.nameFr}
                  onChange={e => setDocFormData({ ...docFormData, nameFr: e.target.value })}
                  placeholder="Ex: Dr. Ahmed Benali"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nom complet (العربية)</label>
                <input
                  type="text"
                  value={docFormData.nameAr}
                  onChange={e => setDocFormData({ ...docFormData, nameAr: e.target.value })}
                  placeholder="مثال: د. أحمد بن علي"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500 text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Spécialité (Français)</label>
                  <input
                    type="text"
                    value={docFormData.specialtyFr}
                    onChange={e => setDocFormData({ ...docFormData, specialtyFr: e.target.value })}
                    placeholder="Implantologie & Esthétique"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Années d'expérience</label>
                  <input
                    type="number"
                    value={docFormData.experienceYears}
                    onChange={e => setDocFormData({ ...docFormData, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <ImageUploadPicker
                label="Photo du Praticien"
                folder="doctors"
                value={docFormData.imageUrl}
                onChange={val => setDocFormData({ ...docFormData, imageUrl: val })}
                helperText="Choisissez un portrait clair du praticien depuis votre téléphone ou PC."
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Début consultation</label>
                  <input
                    type="text"
                    value={docFormData.workingHoursStart}
                    onChange={e => setDocFormData({ ...docFormData, workingHoursStart: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Fin consultation</label>
                  <input
                    type="text"
                    value={docFormData.workingHoursEnd}
                    onChange={e => setDocFormData({ ...docFormData, workingHoursEnd: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Enregistrer Praticien
                </button>
                <button
                  type="button"
                  onClick={() => setIsDoctorModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE ADD / EDIT MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingService ? 'Modifier Traitement & Tarif' : 'Ajouter un Nouveau Traitement'}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nom du Soin (Français) *</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.nameFr}
                  onChange={e => setServiceFormData({ ...serviceFormData, nameFr: e.target.value })}
                  placeholder="Ex: Blanchiment Dentaire Laser"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nom du Soin (العربية)</label>
                <input
                  type="text"
                  value={serviceFormData.nameAr}
                  onChange={e => setServiceFormData({ ...serviceFormData, nameAr: e.target.value })}
                  placeholder="مثال: تبييض الأسنان بالليزر"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Tarif Indicatif (DA) *</label>
                  <input
                    type="number"
                    required
                    value={serviceFormData.priceDZD}
                    onChange={e => setServiceFormData({ ...serviceFormData, priceDZD: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Durée estimée (minutes)</label>
                  <input
                    type="number"
                    value={serviceFormData.durationMinutes}
                    onChange={e => setServiceFormData({ ...serviceFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description courte</label>
                <textarea
                  rows={2}
                  value={serviceFormData.shortDescFr}
                  onChange={e => setServiceFormData({ ...serviceFormData, shortDescFr: e.target.value })}
                  placeholder="Explication claire du traitement..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <ImageUploadPicker
                label="Photo d'illustration du soin"
                folder="services"
                value={serviceFormData.imageUrl}
                onChange={val => setServiceFormData({ ...serviceFormData, imageUrl: val })}
                helperText="Sélectionnez une image d'illustration du traitement depuis votre appareil."
              />

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Enregistrer Traitement
                </button>
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit (Boutique)'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nom du Produit (Français) *</label>
                <input
                  type="text"
                  required
                  value={productFormData.nameFr}
                  onChange={e => setProductFormData({ ...productFormData, nameFr: e.target.value })}
                  placeholder="Ex: Kit Blanchiment Dentaire LED 32X"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nom du Produit (العربية)</label>
                <input
                  type="text"
                  value={productFormData.nameAr}
                  onChange={e => setProductFormData({ ...productFormData, nameAr: e.target.value })}
                  placeholder="مثال: طقم تبييض الأسنان بالضوء الأزرق"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Catégorie</label>
                  <select
                    value={productFormData.category}
                    onChange={e => setProductFormData({ ...productFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="whitening">✨ Blanchiment & Éclat</option>
                    <option value="electric_brushes">⚡ Brosses à Dents Électriques</option>
                    <option value="water_flossers">💦 Hydropulseurs / Jet Dentaire</option>
                    <option value="orthodontic_care">🦷 Soins Aligneurs & Orthodontie</option>
                    <option value="toothpaste_gels">🌿 Dentifrices & Gels Spécifiques</option>
                    <option value="mouthguards">🛡️ Gouttières & Protection</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Stock disponible (unités)</label>
                  <input
                    type="number"
                    required
                    value={productFormData.stockCount}
                    onChange={e => setProductFormData({ ...productFormData, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-teal-400 font-semibold">Prix de Vente (DA) *</label>
                  <input
                    type="number"
                    required
                    value={productFormData.priceDZD}
                    onChange={e => setProductFormData({ ...productFormData, priceDZD: Number(e.target.value) })}
                    placeholder="4500"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Ancien Prix Barré (DA)</label>
                  <input
                    type="number"
                    value={productFormData.originalPriceDZD}
                    onChange={e => setProductFormData({ ...productFormData, originalPriceDZD: Number(e.target.value) })}
                    placeholder="6500"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <ImageUploadPicker
                label="Photo Principale du Produit"
                folder="products"
                value={productFormData.imageUrl}
                onChange={val => setProductFormData({ ...productFormData, imageUrl: val })}
                required
                helperText="Prenez ou choisissez une photo nette du produit depuis votre téléphone ou PC."
              />

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Badge promotionnel (ex: Top Vente)</label>
                <input
                  type="text"
                  value={productFormData.badgeFr}
                  onChange={e => setProductFormData({ ...productFormData, badgeFr: e.target.value })}
                  placeholder="Top Vente"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Avis / Recommandation Médicale</label>
                <input
                  type="text"
                  value={productFormData.doctorRecFr}
                  onChange={e => setProductFormData({ ...productFormData, doctorRecFr: e.target.value })}
                  placeholder="Recommandé pour un résultat blanc éclatant sans sensibilité."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Enregistrer Produit
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supabase Settings & Diagnostic Modal */}
      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onOpenCloudflare={() => setIsCloudflareModalOpen(true)}
      />

      {/* Cloudflare Settings & Image Hosting Modal */}
      <CloudflareSettingsModal
        isOpen={isCloudflareModalOpen}
        onClose={() => setIsCloudflareModalOpen(false)}
      />

    </div>
  );
};
