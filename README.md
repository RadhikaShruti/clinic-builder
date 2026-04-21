# 🏥 ClinicCraft — Clinic Website Builder Platform

A full-stack multi-tenant clinic website builder that lets clinic admins create professional websites with appointment booking, doctor management, and more.

---

## 🛠️ Tech Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | React 18 + Vite (no Tailwind)     |
| Backend  | Node.js + Express.js              |
| Database | PostgreSQL                        |
| Auth     | JWT (JSON Web Tokens)             |
| CSS      | Pure CSS with CSS Variables       |

---

## 📁 Project Structure

```
clinic-builder/
├── database/
│   └── schema.sql          ← Master schema (run this first)
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── config/
│   │   └── db.js
│   └── src/
│       ├── index.js
│       ├── middleware/auth.js
│       ├── routes/index.js
│       └── controllers/
│           ├── authController.js
│           ├── clinicController.js
│           ├── doctorController.js
│           ├── appointmentController.js
│           ├── serviceController.js
│           ├── blogController.js
│           └── uploadController.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── styles/global.css
        ├── utils/api.js
        ├── contexts/AuthContext.jsx
        ├── components/common/Toast.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── AuthPages.jsx
            ├── builder/          ← 9-step onboarding wizard
            ├── dashboard/        ← Admin dashboard panels
            └── clinic/           ← Generated clinic website
```

---

## ⚡ Quick Setup Guide

### Step 1: Install PostgreSQL

Make sure PostgreSQL is installed and running on your machine.

```bash
# Ubuntu/Debian
sudo apt install postgresql

# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Windows: Download from https://www.postgresql.org/download/windows/
```

### Step 2: Create the Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql shell:
CREATE DATABASE clinic_builder;
\q
```

### Step 3: Run the Schema

```bash
psql -U postgres -d clinic_builder -f database/schema.sql
```

You should see: `Schema created successfully!`

### Step 4: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your database credentials:
# DB_PASSWORD=yourpassword
# JWT_SECRET=any-long-random-string
nano .env
```

**Your `.env` should look like:**
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinic_builder
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=mysupersecretkey123456789
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Step 5: Start the Backend

```bash
# In the /backend directory
npm run dev
```

You should see:
```
🏥 Clinic Builder API running on http://localhost:5000
```

### Step 6: Setup Frontend

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

You should see:
```
VITE v5.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 7: Open in Browser

Visit: **http://localhost:5173**

---

## 🧑‍💻 Usage Guide

### Creating a Clinic Website

1. Click **"Get Started"** on the landing page
2. **Sign up** with your email and password
3. You'll be taken to the **9-step wizard**:
   - **Step 1**: Enter clinic name, phone, address
   - **Step 2**: Add services/treatments
   - **Step 3**: Add doctors with their credentials
   - **Step 4**: Select available facilities
   - **Step 5**: Write your About Us / Mission
   - **Step 6**: Set working hours
   - **Step 7**: Choose theme & colors
   - **Step 8**: Preview your website
   - **Step 9**: Publish!

4. Your clinic website is live at: `/clinic/{your-slug}`

### Admin Dashboard

After publishing, access the dashboard at `/dashboard`:
- **Overview**: Stats, recent appointments
- **Appointments**: View, confirm, cancel bookings
- **Doctors**: Add/edit/remove doctors with schedules
- **Services**: Manage treatment listings
- **Blog**: Write and publish articles
- **Settings**: Update clinic info

### Patient Booking

Patients visit `/clinic/{slug}#book` and:
1. Select a doctor
2. Pick date (up to 30 days ahead)
3. Choose an available time slot (auto-generated from doctor schedules)
4. Enter their details
5. Confirm booking — get a unique reference number

---

## 🎨 5 Templates

| Template | Style |
|----------|-------|
| **Modern** | Blue corporate with clean lines |
| **Classic** | Deep purple, sophisticated |
| **Minimal** | Dark charcoal, ultra-clean |
| **Vibrant** | Red-orange, energetic |
| **Elegant** | Gold/amber, luxury feel |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `admin_users` | Clinic owners / admins |
| `clinics` | Core clinic data (multi-tenant) |
| `clinic_themes` | Per-clinic design settings |
| `clinic_working_hours` | Operating hours by day |
| `clinic_certifications` | Accreditations & certificates |
| `doctors` | Doctor profiles with credentials |
| `doctor_schedules` | Weekly availability per doctor |
| `appointment_slots` | Individual bookable time slots |
| `appointments` | Patient bookings |
| `services` | Treatments offered |
| `service_categories` | Service groupings |
| `facilities` | Available amenities |
| `clinic_facilities` | Per-clinic facility selection |
| `blog_posts` | Clinic articles |

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user

### Clinic
- `POST /api/clinic` — Create/Update clinic
- `GET /api/clinic/me` — My clinic (admin)
- `GET /api/clinic/slug/:slug` — Public clinic data
- `POST /api/clinic/publish` — Go live
- `PUT /api/clinic/theme` — Update theme
- `POST /api/clinic/working-hours` — Save hours

### Doctors
- `GET /api/clinic/:id/doctors` — List doctors
- `POST /api/doctors` — Add doctor
- `PUT /api/doctors/:id` — Update doctor

### Appointments
- `GET /api/appointments/slots?doctorId=&date=` — Available slots
- `POST /api/appointments` — Book appointment
- `GET /api/appointments` — List (admin, with filters)
- `PUT /api/appointments/:id/status` — Update status

### Services & Blog
- `GET /api/clinic/:id/services`
- `GET /api/clinic/:id/blog`

---

## ⚠️ Troubleshooting

**"Cannot connect to database"**
- Check PostgreSQL is running: `sudo service postgresql status`
- Verify credentials in `backend/.env`

**"CORS error"**
- Make sure `FRONTEND_URL=http://localhost:5173` in `.env`
- Restart the backend after editing `.env`

**Slots not generating**
- Doctors need weekly schedules set (in the Doctors panel → Edit)
- Only future dates (tomorrow onwards) show slots

**"Clinic not found" on `/clinic/:slug`**
- Make sure you completed the wizard and clicked **Publish**

---

## 📦 Production Build

```bash
# Build frontend
cd frontend && npm run build

# The dist/ folder can be served by Nginx, Vercel, etc.
# Backend should run with: node src/index.js (or PM2)
```

---

## 🙌 Credits

Built with ❤️ using ClinicCraft Platform.
