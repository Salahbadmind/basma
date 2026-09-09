import { getSupabaseClient } from './supabase';
import { 
  Appointment, 
  ProductOrder, 
  Product, 
  TreatmentService, 
  Doctor, 
  ClinicInfo, 
  Review, 
  OrderStatus, 
  AppointmentStatus,
  BeforeAfterCase 
} from '../types';
import { initialClinicInfo } from '../data/initialData';

// Diagnostic Test Result
export interface SupabaseTestResult {
  success: boolean;
  message: string;
  tables: {
    appointments: boolean | string;
    product_orders: boolean | string;
    products: boolean | string;
    services: boolean | string;
    doctors: boolean | string;
    reviews: boolean | string;
    clinic_info: boolean | string;
    before_after_cases?: boolean | string;
  };
}

export async function testSupabaseConnection(): Promise<SupabaseTestResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase n’est pas configuré. Veuillez entrer votre URL et votre clé Anon.',
      tables: {
        appointments: 'Non configuré',
        product_orders: 'Non configuré',
        products: 'Non configuré',
        services: 'Non configuré',
        doctors: 'Non configuré',
        reviews: 'Non configuré',
        clinic_info: 'Non configuré',
      }
    };
  }

  const checkTable = async (tableName: string): Promise<boolean | string> => {
    try {
      const { error } = await client.from(tableName).select('id').limit(1);
      if (error) {
        return error.message;
      }
      return true;
    } catch (err: any) {
      return err?.message || 'Erreur inconnue';
    }
  };

  const [apts, orders, prods, srvs, docs, revs, info, cases] = await Promise.all([
    checkTable('appointments'),
    checkTable('product_orders'),
    checkTable('products'),
    checkTable('services'),
    checkTable('doctors'),
    checkTable('reviews'),
    checkTable('clinic_info'),
    checkTable('before_after_cases'),
  ]);

  const allPassed = [apts, orders, prods, srvs, docs, revs, info, cases].every(res => res === true);

  return {
    success: allPassed,
    message: allPassed 
      ? '✅ Connexion Supabase établie avec succès ! Toutes les tables sont prêtes.' 
      : '⚠️ Supabase est joignable mais certaines tables manquent ou sont bloquées par RLS. Exécutez le script SQL dans votre éditeur Supabase.',
    tables: {
      appointments: apts,
      product_orders: orders,
      products: prods,
      services: srvs,
      doctors: docs,
      reviews: revs,
      clinic_info: info,
      before_after_cases: cases,
    }
  };
}

// ==========================================
// APPOINTMENTS SYNC
// ==========================================

export async function fetchAppointmentsFromSupabase(): Promise<Appointment[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch appointments error:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      patientName: row.patient_name,
      patientPhone: row.patient_phone,
      patientEmail: row.patient_email || '',
      serviceId: row.service_id,
      doctorId: row.doctor_id,
      date: row.date,
      timeSlot: row.time_slot,
      notes: row.notes || '',
      isFirstVisit: row.is_first_visit ?? true,
      status: row.status as AppointmentStatus,
      createdAt: row.created_at,
      priceEstimatedDZD: row.price_estimated_dzd,
      notificationPreference: row.notification_preference || 'whatsapp',
      adminNotes: row.admin_notes || '',
    }));
  } catch (err) {
    console.warn('Supabase error fetching appointments:', err);
    return null;
  }
}

export async function insertAppointmentToSupabase(apt: Appointment): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('appointments').upsert({
      id: apt.id,
      patient_name: apt.patientName,
      patient_phone: apt.patientPhone,
      patient_email: apt.patientEmail || null,
      service_id: apt.serviceId,
      doctor_id: apt.doctorId,
      date: apt.date,
      time_slot: apt.timeSlot,
      notes: apt.notes || null,
      is_first_visit: apt.isFirstVisit,
      status: apt.status,
      price_estimated_dzd: apt.priceEstimatedDZD || 0,
      notification_preference: apt.notificationPreference,
      admin_notes: apt.adminNotes || null,
    });

    if (error) {
      console.warn('Supabase insert appointment error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insert appointment exception:', err);
    return false;
  }
}

export async function updateAppointmentStatusInSupabase(
  id: string,
  status: AppointmentStatus,
  adminNotes?: string
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const updatePayload: any = { status };
    if (adminNotes !== undefined) {
      updatePayload.admin_notes = adminNotes;
    }
    const { error } = await client.from('appointments').update(updatePayload).eq('id', id);
    if (error) {
      console.warn('Supabase update appointment error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase update appointment exception:', err);
    return false;
  }
}

export async function deleteAppointmentFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('appointments').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete appointment error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete appointment exception:', err);
    return false;
  }
}

// ==========================================
// PRODUCT ORDERS SYNC
// ==========================================

export async function fetchOrdersFromSupabase(): Promise<ProductOrder[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('product_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch orders error:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerPhone2: row.customer_phone2,
      wilayaCode: row.wilaya_code,
      wilayaName: row.wilaya_name,
      commune: row.commune,
      deliveryAddress: row.delivery_address,
      deliveryType: row.delivery_type,
      deliveryFeeDZD: row.delivery_fee_dzd,
      items: row.items || [],
      subtotalDZD: row.subtotal_dzd,
      totalDZD: row.total_dzd,
      status: row.status as OrderStatus,
      notes: row.notes,
      createdAt: row.created_at,
      source: row.source,
    }));
  } catch (err) {
    console.warn('Supabase error fetching orders:', err);
    return null;
  }
}

export async function insertOrderToSupabase(order: ProductOrder): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('product_orders').upsert({
      id: order.id,
      order_number: order.orderNumber,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_phone2: order.customerPhone2 || null,
      wilaya_code: order.wilayaCode,
      wilaya_name: order.wilayaName,
      commune: order.commune,
      delivery_address: order.deliveryAddress,
      delivery_type: order.deliveryType,
      delivery_fee_dzd: order.deliveryFeeDZD,
      items: order.items,
      subtotal_dzd: order.subtotalDZD,
      total_dzd: order.totalDZD,
      status: order.status,
      notes: order.notes || null,
      source: order.source || 'website',
    });

    if (error) {
      console.warn('Supabase insert order error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insert order exception:', err);
    return false;
  }
}

export async function updateOrderStatusInSupabase(id: string, status: OrderStatus): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('product_orders').update({ status }).eq('id', id);
    if (error) {
      console.warn('Supabase update order error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase update order exception:', err);
    return false;
  }
}

export async function deleteOrderFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('product_orders').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete order error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete order exception:', err);
    return false;
  }
}

// ==========================================
// PRODUCTS SYNC
// ==========================================

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('products').select('*');
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      subtitle: row.subtitle,
      description: row.description,
      category: row.category,
      priceDZD: row.price_dzd,
      originalPriceDZD: row.original_price_dzd,
      inStock: row.in_stock,
      stockCount: row.stock_count,
      rating: row.rating,
      reviewsCount: row.reviews_count,
      images: row.images || [],
      features: row.features || { fr: [], ar: [], en: [] },
      howToUse: row.how_to_use,
      doctorRecommendation: row.doctor_recommendation,
      badge: row.badge,
      isBestSeller: row.is_best_seller,
    }));
  } catch (err) {
    console.warn('Supabase fetch products error:', err);
    return null;
  }
}

export async function upsertProductToSupabase(prod: Product): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('products').upsert({
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      subtitle: prod.subtitle || null,
      description: prod.description,
      category: prod.category,
      price_dzd: prod.priceDZD,
      original_price_dzd: prod.originalPriceDZD || null,
      in_stock: prod.inStock,
      stock_count: prod.stockCount,
      rating: prod.rating,
      reviews_count: prod.reviewsCount,
      images: prod.images,
      features: prod.features,
      how_to_use: prod.howToUse || null,
      doctor_recommendation: prod.doctorRecommendation || null,
      badge: prod.badge || null,
      is_best_seller: prod.isBestSeller || false,
    });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('products').delete().eq('id', id);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// SERVICES SYNC
// ==========================================

export async function fetchServicesFromSupabase(): Promise<TreatmentService[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('services').select('*');
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortDescription: row.short_description,
      fullDescription: row.full_description,
      category: row.category,
      priceDZD: row.price_dzd,
      priceNote: row.price_note,
      durationMinutes: row.duration_minutes,
      iconName: row.icon_name || 'Sparkles',
      imageUrl: row.image_url,
      benefits: row.benefits || { fr: [], ar: [], en: [] },
      procedureSteps: row.procedure_steps || [],
      faqs: row.faqs || [],
      recommendedDoctorId: row.recommended_doctor_id,
      isPopular: row.is_popular,
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertServiceToSupabase(srv: TreatmentService): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('services').upsert({
      id: srv.id,
      slug: srv.slug,
      name: srv.name,
      short_description: srv.shortDescription,
      full_description: srv.fullDescription,
      category: srv.category,
      price_dzd: srv.priceDZD,
      price_note: srv.priceNote || null,
      duration_minutes: srv.durationMinutes,
      icon_name: srv.iconName,
      image_url: srv.imageUrl,
      benefits: srv.benefits,
      procedure_steps: srv.procedureSteps,
      faqs: srv.faqs,
      recommended_doctor_id: srv.recommendedDoctorId || null,
      is_popular: srv.isPopular || false,
    });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteServiceFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('services').delete().eq('id', id);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// DOCTORS SYNC
// ==========================================

export async function fetchDoctorsFromSupabase(): Promise<Doctor[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('doctors').select('*');
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      title: row.title,
      specialty: row.specialty,
      qualifications: row.qualifications || { fr: [], ar: [], en: [] },
      experienceYears: row.experience_years,
      languages: row.languages || ['Français', 'العربية'],
      bio: row.bio,
      imageUrl: row.image_url,
      availableDays: row.available_days || [0, 1, 2, 3, 4, 6],
      workingHours: row.working_hours || { start: '08:30', end: '18:00' },
      rating: row.rating,
      reviewsCount: row.reviews_count,
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertDoctorToSupabase(doc: Doctor): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('doctors').upsert({
      id: doc.id,
      name: doc.name,
      title: doc.title,
      specialty: doc.specialty,
      qualifications: doc.qualifications,
      experience_years: doc.experienceYears,
      languages: doc.languages,
      bio: doc.bio,
      image_url: doc.imageUrl,
      available_days: doc.availableDays,
      working_hours: doc.workingHours,
      rating: doc.rating,
      reviews_count: doc.reviewsCount,
    });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteDoctorFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('doctors').delete().eq('id', id);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// REVIEWS SYNC
// ==========================================

export async function fetchReviewsFromSupabase(): Promise<Review[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('reviews').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      patientName: row.patient_name,
      rating: row.rating,
      date: row.date,
      treatmentName: row.treatment_name,
      comment: row.comment,
      isVerified: row.is_verified,
      isGoogleReview: row.is_google_review,
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertReviewToSupabase(rev: Review): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('reviews').upsert({
      id: rev.id,
      patient_name: rev.patientName,
      rating: rev.rating,
      date: rev.date,
      treatment_name: rev.treatmentName,
      comment: rev.comment,
      is_verified: rev.isVerified,
      is_google_review: rev.isGoogleReview,
    });
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// CLINIC INFO SYNC
// ==========================================

export async function fetchClinicInfoFromSupabase(): Promise<ClinicInfo | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('clinic_info').select('*').eq('id', 'default').single();
    if (error || !data) return null;

    return {
      ...initialClinicInfo,
      name: data.name || initialClinicInfo.name,
      tagline: data.tagline || initialClinicInfo.tagline,
      hero: data.hero || initialClinicInfo.hero,
      heroMediaUrl: data.hero_media_url || data.heroMediaUrl || initialClinicInfo.heroMediaUrl,
      heroMediaType: data.hero_media_type || data.heroMediaType || initialClinicInfo.heroMediaType,
      adminEmail: data.admin_email || data.adminEmail || initialClinicInfo.adminEmail,
      adminPassword: data.admin_password || data.adminPassword || initialClinicInfo.adminPassword,
      phone: data.phone || initialClinicInfo.phone,
      emergencyPhone: data.emergency_phone || initialClinicInfo.emergencyPhone,
      whatsapp: data.whatsapp || data.social_links?.whatsapp || initialClinicInfo.whatsapp,
      email: data.email || initialClinicInfo.email,
      address: data.address || initialClinicInfo.address,
      wilaya: data.wilaya || initialClinicInfo.wilaya,
      city: data.city || initialClinicInfo.city,
      country: data.country || initialClinicInfo.country,
      googleMapsUrl: data.google_maps_url || initialClinicInfo.googleMapsUrl,
      googleMapsEmbedUrl: data.google_maps_embed_url || initialClinicInfo.googleMapsEmbedUrl,
      socialLinks: data.social_links || initialClinicInfo.socialLinks,
      announcementBanner: data.announcement_banner || initialClinicInfo.announcementBanner,
      openingHours: data.opening_hours || initialClinicInfo.openingHours,
      parkingInfo: data.parking_info || initialClinicInfo.parkingInfo,
      landmarks: data.landmarks || initialClinicInfo.landmarks,
      stats: data.stats || initialClinicInfo.stats,
      cloudflare: data.cloudflare || initialClinicInfo.cloudflare,
    };
  } catch (err) {
    return null;
  }
}

export async function upsertClinicInfoToSupabase(info: ClinicInfo): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase non configuré' };
  try {
    const { error } = await client.from('clinic_info').upsert({
      id: 'default',
      name: info.name,
      tagline: info.tagline,
      hero: info.hero,
      hero_media_url: info.heroMediaUrl,
      hero_media_type: info.heroMediaType,
      admin_email: info.adminEmail,
      admin_password: info.adminPassword,
      phone: info.phone,
      emergency_phone: info.emergencyPhone,
      whatsapp: info.whatsapp,
      email: info.email,
      address: info.address,
      wilaya: info.wilaya,
      city: info.city,
      country: info.country,
      google_maps_url: info.googleMapsUrl,
      google_maps_embed_url: info.googleMapsEmbedUrl,
      social_links: info.socialLinks,
      announcement_banner: info.announcementBanner,
      opening_hours: info.openingHours,
      parking_info: info.parkingInfo,
      landmarks: info.landmarks,
      stats: info.stats,
      cloudflare: info.cloudflare,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) {
      console.warn('Upsert clinic info error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Upsert clinic info exception:', err);
    return { success: false, error: err?.message || 'Erreur inconnue' };
  }
}

// ==========================================
// BEFORE & AFTER CASES SYNC
// ==========================================

export async function fetchBeforeAfterCasesFromSupabase(): Promise<BeforeAfterCase[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('before_after_cases').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      beforeImage: row.before_image,
      afterImage: row.after_image,
      duration: row.duration,
      doctorId: row.doctor_id || '',
      doctorName: row.doctor_name || '',
      description: row.description,
    }));
  } catch (err) {
    return null;
  }
}

export async function upsertBeforeAfterCaseToSupabase(item: BeforeAfterCase): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('before_after_cases').upsert({
      id: item.id,
      title: item.title,
      category: item.category,
      before_image: item.beforeImage,
      after_image: item.afterImage,
      duration: item.duration,
      doctor_id: item.doctorId || null,
      doctor_name: item.doctorName || null,
      description: item.description,
    });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteBeforeAfterCaseFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('before_after_cases').delete().eq('id', id);
    return !error;
  } catch (err) {
    return false;
  }
}

// ==========================================
// PUSH ALL LOCAL DATA TO SUPABASE (BULK SEED / SYNC)
// ==========================================

export async function pushAllDataToSupabase(data: {
  doctors: Doctor[];
  services: TreatmentService[];
  products: Product[];
  appointments: Appointment[];
  orders: ProductOrder[];
  reviews: Review[];
  clinicInfo: ClinicInfo;
  beforeAfterCases?: BeforeAfterCase[];
}): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase n’est pas configuré.' };
  }

  try {
    // 1. Doctors
    for (const doc of data.doctors) {
      await upsertDoctorToSupabase(doc);
    }
    // 2. Services
    for (const srv of data.services) {
      await upsertServiceToSupabase(srv);
    }
    // 3. Products
    for (const prod of data.products) {
      await upsertProductToSupabase(prod);
    }
    // 4. Reviews
    for (const rev of data.reviews) {
      await upsertReviewToSupabase(rev);
    }
    // 5. Clinic info
    await upsertClinicInfoToSupabase(data.clinicInfo);

    // 6. Before & After cases
    if (data.beforeAfterCases && data.beforeAfterCases.length > 0) {
      for (const item of data.beforeAfterCases) {
        await upsertBeforeAfterCaseToSupabase(item);
      }
    }

    // 7. Appointments
    for (const apt of data.appointments) {
      await insertAppointmentToSupabase(apt);
    }
    // 8. Orders
    for (const ord of data.orders) {
      await insertOrderToSupabase(ord);
    }

    return { success: true, message: 'Toutes les données ont été envoyées vers votre base Supabase avec succès !' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erreur lors de l’envoi des données.' };
  }
}
