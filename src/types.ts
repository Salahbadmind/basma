export type Language = 'fr' | 'ar' | 'en';
export type Theme = 'light' | 'dark';

export type AppView = 'home' | 'products' | 'product-detail' | 'services' | 'doctors' | 'admin' | 'order-success';

export type ProductCategory = 
  | 'all'
  | 'whitening'
  | 'electric_brushes'
  | 'water_flossers'
  | 'orthodontic_care'
  | 'toothpaste_gels'
  | 'mouthguards';

export interface Product {
  id: string;
  slug: string;
  name: {
    fr: string;
    ar: string;
    en: string;
  };
  subtitle: {
    fr: string;
    ar: string;
    en: string;
  };
  description: {
    fr: string;
    ar: string;
    en: string;
  };
  category: ProductCategory;
  priceDZD: number;
  originalPriceDZD?: number; // for discount badge
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  image?: string;
  imageUrl?: string;
  features: {
    fr: string[];
    ar: string[];
    en: string[];
  };
  howToUse?: {
    fr: string;
    ar: string;
    en: string;
  };
  doctorRecommendation?: {
    fr: string;
    ar: string;
    en: string;
  };
  badge?: {
    fr: string;
    ar: string;
    en: string;
  };
  isBestSeller?: boolean;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productSlug?: string;
  productName: string;
  priceDZD: number;
  quantity: number;
  imageUrl?: string;
  image?: string;
}

export interface ProductOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerPhone2?: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  deliveryAddress: string;
  deliveryType: 'home' | 'desk';
  deliveryFeeDZD: number;
  items: OrderItem[];
  subtotalDZD: number;
  totalDZD: number;
  status: OrderStatus;
  notes?: string;
  source?: string; // e.g. 'direct', 'fb_ads', 'tiktok_ads'
  createdAt: string;
}

export type ServiceCategory = 
  | 'all'
  | 'general'
  | 'cosmetic'
  | 'implantology'
  | 'orthodontics'
  | 'pediatric'
  | 'surgery'
  | 'emergency';

export interface TreatmentService {
  id: string;
  slug: string;
  name: {
    fr: string;
    ar: string;
    en: string;
  };
  shortDescription: {
    fr: string;
    ar: string;
    en: string;
  };
  fullDescription: {
    fr: string;
    ar: string;
    en: string;
  };
  category: ServiceCategory;
  priceDZD: number;
  priceNote?: {
    fr: string;
    ar: string;
    en: string;
  };
  durationMinutes: number;
  iconName: string;
  imageUrl: string;
  benefits: {
    fr: string[];
    ar: string[];
    en: string[];
  };
  procedureSteps: {
    step: number;
    title: { fr: string; ar: string; en: string };
    desc: { fr: string; ar: string; en: string };
  }[];
  faqs: {
    q: { fr: string; ar: string; en: string };
    a: { fr: string; ar: string; en: string };
  }[];
  recommendedDoctorId?: string;
  isPopular?: boolean;
}

export interface Doctor {
  id: string;
  name: {
    fr: string;
    ar: string;
    en: string;
  };
  title: {
    fr: string;
    ar: string;
    en: string;
  };
  specialty: {
    fr: string;
    ar: string;
    en: string;
  };
  qualifications: {
    fr: string[];
    ar: string[];
    en: string[];
  };
  experienceYears: number;
  languages: string[];
  bio: {
    fr: string;
    ar: string;
    en: string;
  };
  imageUrl: string;
  availableDays: number[]; // 0 = Sunday, 1 = Monday, ... 6 = Saturday (In Algeria: Sat to Thu usually)
  workingHours: {
    start: string;
    end: string;
  };
  rating: number;
  reviewsCount: number;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  serviceId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30"
  notes?: string;
  isFirstVisit: boolean;
  status: AppointmentStatus;
  createdAt: string;
  notificationPreference: 'whatsapp' | 'sms' | 'email';
  priceEstimatedDZD?: number;
  adminNotes?: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthDate?: string;
  allergies?: string[];
  medicalHistory?: string;
  createdAt: string;
  totalVisits: number;
  lastVisit?: string;
  clinicalNotes: {
    id: string;
    date: string;
    doctorId: string;
    doctorName: string;
    treatment: string;
    notes: string;
    nextFollowUp?: string;
  }[];
}

export interface Review {
  id: string;
  patientName: string;
  rating: number; // 1-5
  date: string;
  treatmentName: {
    fr: string;
    ar: string;
    en: string;
  };
  comment: {
    fr: string;
    ar: string;
    en: string;
  };
  isVerified: boolean;
  isGoogleReview: boolean;
}

export interface BeforeAfterCase {
  id: string;
  title: {
    fr: string;
    ar: string;
    en: string;
  };
  category: string;
  beforeImage: string;
  afterImage: string;
  duration: {
    fr: string;
    ar: string;
    en: string;
  };
  doctorId: string;
  doctorName: string;
  description: {
    fr: string;
    ar: string;
    en: string;
  };
}

export interface ClinicInfo {
  name: {
    fr: string;
    ar: string;
    en: string;
  };
  tagline: {
    fr: string;
    ar: string;
    en: string;
  };
  hero?: {
    titlePart1: {
      fr: string;
      ar: string;
      en: string;
    };
    titlePart2: {
      fr: string;
      ar: string;
      en: string;
    };
    description: {
      fr: string;
      ar: string;
      en: string;
    };
  };
  phone: string;
  emergencyPhone: string;
  whatsapp: string;
  email: string;
  address: {
    fr: string;
    ar: string;
    en: string;
  };
  wilaya?: string;
  city: string;
  country: string;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  announcementBanner?: {
    enabled: boolean;
    text: {
      fr: string;
      ar: string;
      en: string;
    };
  };
  openingHours: {
    weekdays: string;
    friday: string;
    saturday: string;
  };
  parkingInfo: {
    fr: string;
    ar: string;
    en: string;
  };
  landmarks: {
    fr: string;
    ar: string;
    en: string;
  };
  stats: {
    yearsExperience: number;
    happyPatients: number;
    patientRating: number;
    expertDoctors: number;
  };
  heroMediaUrl?: string;
  heroMediaType?: 'image' | 'video';
  adminEmail?: string;
  adminPassword?: string;
  cloudflare?: CloudflareConfig;
}

export interface CloudflareConfig {
  accountId?: string;
  apiToken?: string;
  accountHash?: string;
  deliveryUrl?: string;
  r2BucketName?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
  customDomain?: string;
  enabled?: boolean;
}
