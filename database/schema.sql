-- ============================================================
-- CLINIC WEBSITE BUILDER PLATFORM - MASTER SCHEMA
-- Run this file to set up the complete database
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DROP TABLES (for fresh setup)
-- ============================================================
DROP TABLE IF EXISTS appointment_slots CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS clinic_facilities CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS doctor_schedules CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS clinic_certifications CASCADE;
DROP TABLE IF EXISTS clinic_working_hours CASCADE;
DROP TABLE IF EXISTS clinic_themes CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS platform_admins CASCADE;

-- ============================================================
-- PLATFORM ADMINS (super admins of the builder platform)
-- ============================================================
CREATE TABLE platform_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADMIN USERS (clinic owners/admins)
-- ============================================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_image TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    reset_token TEXT,
    reset_token_expiry TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLINICS (core clinic data)
-- ============================================================
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    -- Basic Info
    clinic_id_slug VARCHAR(100) UNIQUE NOT NULL, -- used in URL: /clinic/:slug
    clinic_name VARCHAR(255) NOT NULL,
    tagline VARCHAR(500),
    description TEXT,
    -- Contact
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    whatsapp VARCHAR(20),
    -- Address
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    google_maps_link TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    -- About / Mission
    about_us TEXT,
    mission TEXT,
    vision TEXT,
    established_year INTEGER,
    -- Legal / Certifications
    registration_number VARCHAR(100),
    gstin VARCHAR(20),
    -- Media
    logo_url TEXT,
    banner_url TEXT,
    gallery_urls TEXT[], -- array of image URLs
    -- Status
    is_published BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ,
    -- Metadata
    total_patients INTEGER DEFAULT 0,
    total_doctors INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLINIC CERTIFICATIONS & ACCREDITATIONS
-- ============================================================
CREATE TABLE clinic_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255) NOT NULL,
    certificate_number VARCHAR(100),
    issued_date DATE,
    expiry_date DATE,
    certificate_url TEXT, -- uploaded doc
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLINIC WORKING HOURS
-- ============================================================
CREATE TABLE clinic_working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    is_open BOOLEAN DEFAULT TRUE,
    open_time TIME,
    close_time TIME,
    has_break BOOLEAN DEFAULT FALSE,
    break_start TIME,
    break_end TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, day_of_week)
);

-- ============================================================
-- CLINIC THEMES & CUSTOMIZATION
-- ============================================================
CREATE TABLE clinic_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID UNIQUE NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    template_id VARCHAR(50) DEFAULT 'modern', -- modern, classic, minimal, vibrant, elegant
    primary_color VARCHAR(7) DEFAULT '#2563EB',
    secondary_color VARCHAR(7) DEFAULT '#10B981',
    accent_color VARCHAR(7) DEFAULT '#F59E0B',
    background_color VARCHAR(7) DEFAULT '#FFFFFF',
    text_color VARCHAR(7) DEFAULT '#1F2937',
    font_family VARCHAR(100) DEFAULT 'Inter',
    heading_font VARCHAR(100) DEFAULT 'Poppins',
    border_radius VARCHAR(20) DEFAULT '8px',
    custom_css TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SERVICE CATEGORIES
-- ============================================================
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SERVICES / TREATMENTS
-- ============================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 30,
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    price_display VARCHAR(100), -- e.g., "₹500 - ₹2000" or "Contact for pricing"
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCTORS
-- ============================================================
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    -- Personal Info
    full_name VARCHAR(255) NOT NULL,
    profile_image TEXT,
    gender VARCHAR(20),
    date_of_birth DATE,
    -- Professional
    qualification VARCHAR(500) NOT NULL, -- e.g., MBBS, MD
    specialization VARCHAR(255) NOT NULL,
    sub_specialization VARCHAR(255),
    experience_years INTEGER NOT NULL,
    designation VARCHAR(255), -- e.g., Senior Consultant
    department VARCHAR(255),
    -- Registration
    medical_registration_number VARCHAR(100) UNIQUE,
    registration_council VARCHAR(255), -- e.g., MCI, State Medical Council
    registration_valid_till DATE,
    -- Contact
    email VARCHAR(255),
    phone VARCHAR(20),
    -- About
    bio TEXT,
    achievements TEXT[],
    languages_spoken TEXT[],
    -- Consultation
    consultation_fee DECIMAL(10,2),
    online_consultation_fee DECIMAL(10,2),
    consultation_duration INTEGER DEFAULT 20, -- minutes
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCTOR SCHEDULES (weekly recurring)
-- ============================================================
CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_available BOOLEAN DEFAULT TRUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INTEGER DEFAULT 20, -- minutes
    max_appointments INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(doctor_id, day_of_week)
);

-- ============================================================
-- APPOINTMENT SLOTS (generated/blocked slots)
-- ============================================================
CREATE TABLE appointment_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE, -- admin can block slots
    block_reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(doctor_id, slot_date, start_time)
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES appointment_slots(id) ON DELETE SET NULL,
    -- Patient Details
    patient_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    patient_age INTEGER,
    patient_gender VARCHAR(20),
    patient_address TEXT,
    -- Appointment Details
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason_for_visit TEXT,
    symptoms TEXT,
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
    cancellation_reason TEXT,
    -- Admin notes
    admin_notes TEXT,
    prescription_url TEXT,
    -- Booking reference
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    -- Timestamps
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FACILITIES
-- ============================================================
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    description VARCHAR(255),
    is_default BOOLEAN DEFAULT TRUE -- platform-provided vs custom
);

CREATE TABLE clinic_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    custom_name VARCHAR(100), -- for custom facilities
    custom_icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    tags TEXT[],
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
    author_name VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    views INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, slug)
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_clinics_admin_id ON clinics(admin_id);
CREATE INDEX idx_clinics_slug ON clinics(clinic_id_slug);
CREATE INDEX idx_clinics_published ON clinics(is_published);
CREATE INDEX idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX idx_services_clinic_id ON services(clinic_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointment_slots_doctor_date ON appointment_slots(doctor_id, slot_date);
CREATE INDEX idx_blog_posts_clinic ON blog_posts(clinic_id, status);
CREATE INDEX idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);

-- ============================================================
-- SEED DEFAULT FACILITIES
-- ============================================================
INSERT INTO facilities (name, icon, description, is_default) VALUES
('Parking', 'car', 'Ample parking space available', true),
('Pharmacy', 'pill', 'In-house pharmacy for medicines', true),
('Laboratory', 'flask', 'Diagnostic lab & blood tests', true),
('Emergency', 'siren', '24/7 emergency services', true),
('Ambulance', 'ambulance', 'Ambulance service available', true),
('ICU', 'heart-pulse', 'Intensive Care Unit', true),
('OT', 'scissors', 'Operation Theatre', true),
('Cafeteria', 'utensils', 'Food & beverages available', true),
('Wheelchair', 'accessibility', 'Wheelchair accessible', true),
('WiFi', 'wifi', 'Free WiFi for patients', true),
('AC Rooms', 'snowflake', 'Air-conditioned rooms', true),
('X-Ray', 'radio', 'X-Ray & Radiology services', true),
('Ultrasound', 'wave', 'Ultrasound & Imaging', true),
('ECG', 'activity', 'ECG & Cardiology services', true),
('Blood Bank', 'droplets', 'Blood bank available', true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinic_themes_updated_at BEFORE UPDATE ON clinic_themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    ref TEXT;
BEGIN
    ref := 'BK' || TO_CHAR(NOW(), 'YYMMDD') || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
    RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate booking reference
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
        NEW.booking_reference := generate_booking_reference();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_booking_ref BEFORE INSERT ON appointments FOR EACH ROW EXECUTE FUNCTION set_booking_reference();

-- ============================================================
-- VIEWS FOR CONVENIENCE
-- ============================================================

-- Clinic public summary view
CREATE OR REPLACE VIEW clinic_public_view AS
SELECT 
    c.id, c.clinic_id_slug, c.clinic_name, c.tagline, c.description,
    c.phone, c.email, c.address_line1, c.address_line2, c.city, c.state, c.pincode,
    c.google_maps_link, c.logo_url, c.banner_url, c.about_us, c.mission, c.vision,
    c.established_year, c.total_doctors, c.rating, c.review_count, c.is_published,
    ct.template_id, ct.primary_color, ct.secondary_color, ct.accent_color,
    ct.font_family, ct.heading_font, ct.background_color, ct.text_color
FROM clinics c
LEFT JOIN clinic_themes ct ON ct.clinic_id = c.id
WHERE c.is_active = TRUE;

COMMENT ON TABLE clinics IS 'Core clinic data - stores all clinic info for each tenant';
COMMENT ON TABLE doctors IS 'Doctors registered under a clinic with full credentials';
COMMENT ON TABLE appointments IS 'Patient appointment bookings with status tracking';
COMMENT ON TABLE appointment_slots IS 'Individual time slots for doctor availability';
COMMENT ON TABLE blog_posts IS 'Clinic blog/news articles';

SELECT 'Schema created successfully!' AS status;
