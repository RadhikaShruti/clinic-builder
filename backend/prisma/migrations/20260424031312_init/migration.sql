-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "profile_image" TEXT,
    "is_verified" BOOLEAN DEFAULT false,
    "verification_token" TEXT,
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMPTZ(6),
    "last_login" TIMESTAMPTZ(6),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_slots" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "slot_date" DATE NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "is_booked" BOOLEAN DEFAULT false,
    "is_blocked" BOOLEAN DEFAULT false,
    "block_reason" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "slot_id" UUID,
    "patient_name" VARCHAR(255) NOT NULL,
    "patient_email" VARCHAR(255) NOT NULL,
    "patient_phone" VARCHAR(20) NOT NULL,
    "patient_age" INTEGER,
    "patient_gender" VARCHAR(20),
    "patient_address" TEXT,
    "appointment_date" DATE NOT NULL,
    "appointment_time" TIME(6) NOT NULL,
    "reason_for_visit" TEXT,
    "symptoms" TEXT,
    "status" VARCHAR(50) DEFAULT 'pending',
    "cancellation_reason" TEXT,
    "admin_notes" TEXT,
    "prescription_url" TEXT,
    "booking_reference" VARCHAR(20) NOT NULL,
    "confirmed_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "tags" TEXT[],
    "category" VARCHAR(100),
    "status" VARCHAR(20) DEFAULT 'draft',
    "author_name" VARCHAR(255),
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "views" INTEGER DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_certifications" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "issuing_authority" VARCHAR(255) NOT NULL,
    "certificate_number" VARCHAR(100),
    "issued_date" DATE,
    "expiry_date" DATE,
    "certificate_url" TEXT,
    "is_verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_facilities" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "facility_id" UUID,
    "custom_name" VARCHAR(100),
    "custom_icon" VARCHAR(50),
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_themes" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "template_id" VARCHAR(50) DEFAULT 'modern',
    "primary_color" VARCHAR(7) DEFAULT '#2563EB',
    "secondary_color" VARCHAR(7) DEFAULT '#10B981',
    "accent_color" VARCHAR(7) DEFAULT '#F59E0B',
    "background_color" VARCHAR(7) DEFAULT '#FFFFFF',
    "text_color" VARCHAR(7) DEFAULT '#1F2937',
    "font_family" VARCHAR(100) DEFAULT 'Inter',
    "heading_font" VARCHAR(100) DEFAULT 'Poppins',
    "border_radius" VARCHAR(20) DEFAULT '8px',
    "custom_css" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_working_hours" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "is_open" BOOLEAN DEFAULT true,
    "open_time" TIME(6),
    "close_time" TIME(6),
    "has_break" BOOLEAN DEFAULT false,
    "break_start" TIME(6),
    "break_end" TIME(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinics" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "clinic_id_slug" VARCHAR(100) NOT NULL,
    "clinic_name" VARCHAR(255) NOT NULL,
    "tagline" VARCHAR(500),
    "description" TEXT,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "website" VARCHAR(255),
    "whatsapp" VARCHAR(20),
    "address_line1" VARCHAR(255) NOT NULL,
    "address_line2" VARCHAR(255),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "pincode" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) DEFAULT 'India',
    "google_maps_link" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "about_us" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "established_year" INTEGER,
    "registration_number" VARCHAR(100),
    "gstin" VARCHAR(20),
    "logo_url" TEXT,
    "banner_url" TEXT,
    "gallery_urls" TEXT[],
    "is_published" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "published_at" TIMESTAMPTZ(6),
    "total_patients" INTEGER DEFAULT 0,
    "total_doctors" INTEGER DEFAULT 0,
    "rating" DECIMAL(3,2) DEFAULT 0,
    "review_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_schedules" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "is_available" BOOLEAN DEFAULT true,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "slot_duration" INTEGER DEFAULT 20,
    "max_appointments" INTEGER DEFAULT 20,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "profile_image" TEXT,
    "gender" VARCHAR(20),
    "date_of_birth" DATE,
    "qualification" VARCHAR(500) NOT NULL,
    "specialization" VARCHAR(255) NOT NULL,
    "sub_specialization" VARCHAR(255),
    "experience_years" INTEGER NOT NULL,
    "designation" VARCHAR(255),
    "department" VARCHAR(255),
    "medical_registration_number" VARCHAR(100),
    "registration_council" VARCHAR(255),
    "registration_valid_till" DATE,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "bio" TEXT,
    "achievements" TEXT[],
    "languages_spoken" TEXT[],
    "consultation_fee" DECIMAL(10,2),
    "online_consultation_fee" DECIMAL(10,2),
    "consultation_duration" INTEGER DEFAULT 20,
    "is_active" BOOLEAN DEFAULT true,
    "is_featured" BOOLEAN DEFAULT false,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50),
    "description" VARCHAR(255),
    "is_default" BOOLEAN DEFAULT true,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_admins" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_categories" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50),
    "description" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "category_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "duration_minutes" INTEGER DEFAULT 30,
    "price_min" DECIMAL(10,2),
    "price_max" DECIMAL(10,2),
    "price_display" VARCHAR(100),
    "image_url" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "is_featured" BOOLEAN DEFAULT false,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "idx_appointment_slots_doctor_date" ON "appointment_slots"("doctor_id", "slot_date");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_slots_doctor_id_slot_date_start_time_key" ON "appointment_slots"("doctor_id", "slot_date", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_booking_reference_key" ON "appointments"("booking_reference");

-- CreateIndex
CREATE INDEX "idx_appointments_clinic_id" ON "appointments"("clinic_id");

-- CreateIndex
CREATE INDEX "idx_appointments_date" ON "appointments"("appointment_date");

-- CreateIndex
CREATE INDEX "idx_appointments_doctor_id" ON "appointments"("doctor_id");

-- CreateIndex
CREATE INDEX "idx_appointments_status" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "idx_blog_posts_clinic" ON "blog_posts"("clinic_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_clinic_id_slug_key" ON "blog_posts"("clinic_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_themes_clinic_id_key" ON "clinic_themes"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_working_hours_clinic_id_day_of_week_key" ON "clinic_working_hours"("clinic_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_clinic_id_slug_key" ON "clinics"("clinic_id_slug");

-- CreateIndex
CREATE INDEX "idx_clinics_admin_id" ON "clinics"("admin_id");

-- CreateIndex
CREATE INDEX "idx_clinics_published" ON "clinics"("is_published");

-- CreateIndex
CREATE INDEX "idx_clinics_slug" ON "clinics"("clinic_id_slug");

-- CreateIndex
CREATE INDEX "idx_doctor_schedules_doctor" ON "doctor_schedules"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_schedules_doctor_id_day_of_week_key" ON "doctor_schedules"("doctor_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_medical_registration_number_key" ON "doctors"("medical_registration_number");

-- CreateIndex
CREATE INDEX "idx_doctors_clinic_id" ON "doctors"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_admins_email_key" ON "platform_admins"("email");

-- CreateIndex
CREATE INDEX "idx_services_clinic_id" ON "services"("clinic_id");

-- AddForeignKey
ALTER TABLE "appointment_slots" ADD CONSTRAINT "appointment_slots_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointment_slots" ADD CONSTRAINT "appointment_slots_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "appointment_slots"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clinic_certifications" ADD CONSTRAINT "clinic_certifications_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clinic_facilities" ADD CONSTRAINT "clinic_facilities_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clinic_facilities" ADD CONSTRAINT "clinic_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clinic_themes" ADD CONSTRAINT "clinic_themes_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clinic_working_hours" ADD CONSTRAINT "clinic_working_hours_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
