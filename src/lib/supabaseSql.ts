/**
 * Complete, Production-Ready SQL Script for Supabase SQL Editor
 * Cabinet Dentaire El Bahdja - CMS, Catalog, Appointments, Orders, Cloudflare, Maps, Credentials & Security
 */

export const SUPABASE_CLEAN_RECREATE_SQL = `-- ==============================================================================
-- 🦷 CABINET DENTAIRE EL BAHDJA - RÉINITIALISATION PROPRE & COMPLÈTE (DROP & RECREATE)
-- ==============================================================================
-- Instructions :
-- 1. Ouvrez votre dashboard Supabase : https://supabase.com/dashboard
-- 2. Allez dans "SQL Editor" dans le menu de gauche.
-- 3. Cliquez sur "New Query", collez tout ce script et cliquez sur "RUN".
-- ==============================================================================

-- 0. EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0.1 SUPPRESSION PROPRE DES ANCIENNES TABLES ET CONTRAINTES
DROP TABLE IF EXISTS public.clinic_info CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.product_orders CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.before_after_cases CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;

-- ==============================================================================
-- 1. TABLE : CLINIC_INFO (CMS, Hero, Média Arrière-Plan, Google Maps, Identifiants Admin, R2)
-- ==============================================================================
CREATE TABLE public.clinic_info (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name JSONB NOT NULL DEFAULT '{"fr": "Cabinet Dentaire El Bahdja", "ar": "عيادة البهجة لطب وزراعة الأسنان", "en": "El Bahdja Dental Clinic"}'::jsonb,
    tagline JSONB NOT NULL DEFAULT '{"fr": "Votre Sourire, Notre Expertise", "ar": "ابتسامتكم، خبرتنا وشغفنا", "en": "Your Smile, Our Expertise"}'::jsonb,
    hero JSONB DEFAULT '{"titlePart1": {"fr": "Votre Sourire,", "ar": "ابتسامتك،", "en": "Your Smile,"}, "titlePart2": {"fr": "Notre Expertise.", "ar": "خبرتنا.", "en": "Our Expertise."}, "description": {"fr": "Une dentisterie moderne, sans douleur et personnalisée. Équipements 3D haute technologie et équipe pluridisciplinaire au cœur de Sidi Yahia, Alger.", "ar": "طب أسنان حديث، بدون ألم، ومخصص. معدات ثلاثية الأبعاد عالية التقنية وفريق متعدد التخصصات في قلب سيدي يحيى، الجزائر.", "en": "Modern, painless, and personalized dentistry. High-tech 3D equipment and a multidisciplinary team in the heart of Sidi Yahia, Algiers."}}'::jsonb,
    hero_media_url TEXT DEFAULT 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1600&auto=format&fit=crop',
    hero_media_type TEXT DEFAULT 'image',
    admin_email TEXT DEFAULT 'admin@basma.com',
    admin_password TEXT DEFAULT 'basma123',
    phone TEXT DEFAULT '+213 23 45 67 89',
    emergency_phone TEXT DEFAULT '+213 555 12 34 56',
    whatsapp TEXT DEFAULT '+213555123456',
    email TEXT DEFAULT 'contact@elbahdja-dental.dz',
    address JSONB DEFAULT '{"fr": "14, Boulevard du 11 Décembre 1960 (Face Val d’Hydra / Sidi Yahia), Alger, Algérie", "ar": "14، شارع 11 ديسمبر 1960 (مقابل فال دهيدرا / سيدي يحيى)، الجزائر العاصمة", "en": "14, Boulevard du 11 Decembre 1960 (Opposite Val d’Hydra / Sidi Yahia), Algiers, Algeria"}'::jsonb,
    wilaya TEXT DEFAULT '16 - Alger',
    city TEXT DEFAULT 'Alger',
    country TEXT DEFAULT 'Algérie',
    google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Sidi+Yahia+Hydra+Algiers',
    google_maps_embed_url TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12791.564765942364!2d3.0315758!3d36.7454746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb2f39223f03b%3A0xb3bf9291b8a53ea5!2sHydra%2C%20Alger!5e0!3m2!1sfr!2sdz!4v1700000000000!5m2!1sfr!2sdz',
    social_links JSONB DEFAULT '{"facebook": "https://facebook.com/cabinet.elbahdja.dental", "instagram": "https://instagram.com/elbahdja_dental_clinic", "tiktok": "https://tiktok.com/@elbahdja.dental", "youtube": "https://youtube.com/@elbahdjadental", "linkedin": "https://linkedin.com/company/elbahdja-dental", "whatsapp": "+213555123456"}'::jsonb,
    announcement_banner JSONB DEFAULT '{"enabled": true, "text": {"fr": "⭐ Prise en charge sans attente & Urgences 7j/7 • Matériel 3D dernière génération", "ar": "⭐ استقبال فوري وطوارئ 7/7 • أحدث التقنيات الرقمية ثلاثية الأبعاد", "en": "⭐ Immediate appointments & 7/7 Emergencies • Latest 3D Dental Tech"}}'::jsonb,
    opening_hours JSONB DEFAULT '{"weekdays": "Samedi - Jeudi: 08h30 - 18h30", "friday": "Vendredi: Urgences sur appel", "saturday": "Samedi: 09h00 - 17h00"}'::jsonb,
    parking_info JSONB DEFAULT '{"fr": "Parking sous-terrain privé et gratuit réservé à nos patients avec accès ascenseur.", "ar": "موقف سيارات سفلي مجاني وخاص بمرضى العيادة مع مصعد كهربائي مجهز.", "en": "Private free underground parking reserved for clinic patients with elevator access."}'::jsonb,
    landmarks JSONB DEFAULT '{"fr": "À 200m du Rond-Point Sidi Yahia, face à la banque BDL et l’Ambassade.", "ar": "على بعد 200 متر من محور دوران سيدي يحيى، أمام بنك BDL والحي الدبلوماسي.", "en": "200m from Sidi Yahia roundabout, opposite BDL bank and embassy district."}'::jsonb,
    stats JSONB DEFAULT '{"yearsExperience": 15, "happyPatients": 12450, "patientRating": 4.9, "expertDoctors": 4}'::jsonb,
    cloudflare JSONB DEFAULT '{"accountId": "4083f5348ec93aaa56ce2f38723f81ab", "apiToken": "a2a84908c605943dd4718437b90e840835a71fea330bc0a48c06def5d9b32d8b", "accountHash": "", "deliveryUrl": "https://imagedelivery.net", "r2BucketName": "basma", "customDomain": "https://pub-70361fd9ada342788392ffd9416b3094.r2.dev", "enabled": true}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion de la ligne par défaut
INSERT INTO public.clinic_info (id) VALUES ('default');

-- ==============================================================================
-- 2. TABLE : DOCTORS (Équipe Médicale & Photos Cloudflare)
-- ==============================================================================
CREATE TABLE public.doctors (
    id TEXT PRIMARY KEY,
    name JSONB NOT NULL,
    title JSONB NOT NULL,
    specialty JSONB NOT NULL,
    qualifications JSONB DEFAULT '{"fr": [], "ar": [], "en": []}'::jsonb,
    experience_years INTEGER DEFAULT 5,
    languages TEXT[] DEFAULT ARRAY['Français', 'العربية', 'English'],
    bio JSONB NOT NULL,
    image_url TEXT,
    available_days INTEGER[] DEFAULT ARRAY[0, 1, 2, 3, 4, 6],
    working_hours JSONB DEFAULT '{"start": "08:30", "end": "18:00"}'::jsonb,
    rating NUMERIC(3,2) DEFAULT 4.9,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABLE : SERVICES (Soins, Traitements & Tarifs)
-- ==============================================================================
CREATE TABLE public.services (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name JSONB NOT NULL,
    short_description JSONB NOT NULL,
    full_description JSONB NOT NULL,
    category TEXT DEFAULT 'general',
    price_dzd INTEGER DEFAULT 0,
    price_note JSONB,
    duration_minutes INTEGER DEFAULT 45,
    icon_name TEXT DEFAULT 'Sparkles',
    image_url TEXT,
    benefits JSONB DEFAULT '{"fr": [], "ar": [], "en": []}'::jsonb,
    procedure_steps JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    recommended_doctor_id TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABLE : PRODUCTS (Boutique & Photos Cloudflare)
-- ==============================================================================
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name JSONB NOT NULL,
    subtitle JSONB,
    description JSONB NOT NULL,
    category TEXT DEFAULT 'whitening',
    price_dzd INTEGER NOT NULL DEFAULT 0,
    original_price_dzd INTEGER,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_count INTEGER DEFAULT 50,
    rating NUMERIC(3,2) DEFAULT 4.9,
    reviews_count INTEGER DEFAULT 0,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    features JSONB DEFAULT '{"fr": [], "ar": [], "en": []}'::jsonb,
    how_to_use JSONB,
    doctor_recommendation JSONB,
    badge JSONB,
    is_best_seller BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABLE : APPOINTMENTS (Prise de Rendez-vous Patients)
-- ==============================================================================
CREATE TABLE public.appointments (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_email TEXT,
    service_id TEXT,
    doctor_id TEXT,
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    notes TEXT,
    is_first_visit BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
    price_estimated_dzd INTEGER DEFAULT 0,
    notification_preference TEXT DEFAULT 'whatsapp',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABLE : PRODUCT_ORDERS (Commandes Boutique COD 58 Wilayas)
-- ==============================================================================
CREATE TABLE public.product_orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_phone2 TEXT,
    wilaya_code TEXT,
    wilaya_name TEXT,
    commune TEXT,
    delivery_address TEXT,
    delivery_type TEXT DEFAULT 'home' CHECK (delivery_type IN ('home', 'desk')),
    delivery_fee_dzd INTEGER DEFAULT 500,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal_dzd INTEGER NOT NULL DEFAULT 0,
    total_dzd INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    notes TEXT,
    source TEXT DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. TABLE : REVIEWS (Témoignages & Avis Patients)
-- ==============================================================================
CREATE TABLE public.reviews (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
    date TEXT,
    treatment_name JSONB NOT NULL,
    comment JSONB NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    is_google_review BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. TABLE : BEFORE_AFTER_CASES (Cas Cliniques Avant / Après)
-- ==============================================================================
CREATE TABLE public.before_after_cases (
    id TEXT PRIMARY KEY,
    title JSONB NOT NULL,
    category TEXT NOT NULL,
    before_image TEXT NOT NULL,
    after_image TEXT NOT NULL,
    duration JSONB NOT NULL,
    doctor_id TEXT,
    doctor_name TEXT,
    description JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. TABLE : PATIENTS (Dossiers Médicaux & Antécédents)
-- ==============================================================================
CREATE TABLE public.patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    birth_date TEXT,
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    medical_history TEXT,
    total_visits INTEGER DEFAULT 1,
    last_visit TEXT,
    clinical_notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. INDEXES DE PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON public.appointments (patient_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.product_orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.product_orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.product_orders (created_at DESC);

-- ==============================================================================
-- 11. ACTIVATION ROW LEVEL SECURITY (RLS) & POLITIQUES DE PERMISSION PUBLIQUES
-- ==============================================================================
ALTER TABLE public.clinic_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.before_after_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access on clinic_info" ON public.clinic_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on doctors" ON public.doctors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on product_orders" ON public.product_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on before_after_cases" ON public.before_after_cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access on patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 12. REALTIME PUBLICATION
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'appointments') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'product_orders') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.product_orders;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'clinic_info') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.clinic_info;
    END IF;
END $$;
`;

export const SUPABASE_SQL_SCHEMA = SUPABASE_CLEAN_RECREATE_SQL;

export const SUPABASE_MIGRATION_SQL = `-- ==============================================================================
-- 🩹 MISE À NIVEAU RAPIDE SANS PERTE DE DONNÉES (ALTER TABLE)
-- ==============================================================================
-- Exécutez ce script si vous souhaitez garder vos données existantes tout en ajoutant les colonnes manquantes
-- ==============================================================================

ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT '+213555123456';
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '+213 23 45 67 89';
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS emergency_phone TEXT DEFAULT '+213 555 12 34 56';
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS admin_email TEXT DEFAULT 'admin@basma.com';
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS admin_password TEXT DEFAULT 'basma123';
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS wilaya TEXT DEFAULT '16 - Alger';
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Alger';
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Algérie';
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS hero JSONB;
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS hero_media_url TEXT;
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS hero_media_type TEXT DEFAULT 'image';
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS google_maps_embed_url TEXT;
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS social_links JSONB;
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS announcement_banner JSONB;
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS opening_hours JSONB;
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS parking_info JSONB;
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS landmarks JSONB;
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS stats JSONB;
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS cloudflare JSONB;
ALTER TABLE public.clinic_info ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Assurer la clé primaire
ALTER TABLE public.clinic_info DROP CONSTRAINT IF EXISTS clinic_info_pkey;
ALTER TABLE public.clinic_info ADD PRIMARY KEY (id);

-- Assurer l'existence de la ligne par défaut
INSERT INTO public.clinic_info (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 🦷 CAS CLINIQUES AVANT / APRÈS (BEFORE & AFTER)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.before_after_cases (
    id TEXT PRIMARY KEY,
    title JSONB NOT NULL,
    category TEXT NOT NULL,
    before_image TEXT NOT NULL,
    after_image TEXT NOT NULL,
    duration JSONB NOT NULL,
    doctor_id TEXT,
    doctor_name TEXT,
    description JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.before_after_cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access on before_after_cases" ON public.before_after_cases;
CREATE POLICY "Public access on before_after_cases" ON public.before_after_cases FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'before_after_cases') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.before_after_cases;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
`;

export const SUPABASE_BEFORE_AFTER_SQL = `-- ==============================================================================
-- 🦷 TABLE : BEFORE_AFTER_CASES (CAS CLINIQUES AVANT / APRÈS)
-- ==============================================================================
-- 1. Allez dans Supabase > SQL Editor > New Query
-- 2. Collez ce script et cliquez sur RUN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.before_after_cases (
    id TEXT PRIMARY KEY,
    title JSONB NOT NULL,
    category TEXT NOT NULL,
    before_image TEXT NOT NULL,
    after_image TEXT NOT NULL,
    duration JSONB NOT NULL,
    doctor_id TEXT,
    doctor_name TEXT,
    description JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de la sécurité RLS et permissions complètes pour l'administration
ALTER TABLE public.before_after_cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access on before_after_cases" ON public.before_after_cases;
CREATE POLICY "Public access on before_after_cases" ON public.before_after_cases FOR ALL USING (true) WITH CHECK (true);

-- Synchronisation en temps réel (Optionnel)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'before_after_cases') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.before_after_cases;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
`;
