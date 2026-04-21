const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

const authCtrl = require('../controllers/authController');
const clinicCtrl = require('../controllers/clinicController');
const doctorCtrl = require('../controllers/doctorController');
const serviceCtrl = require('../controllers/serviceController');
const appointmentCtrl = require('../controllers/appointmentController');
const blogCtrl = require('../controllers/blogController');
const { upload, uploadFile } = require('../controllers/uploadController');

// ── AUTH ──────────────────────────────────────────────────────
router.post('/auth/signup', authCtrl.signup);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticate, authCtrl.getMe);

// ── FILE UPLOAD ───────────────────────────────────────────────
router.post('/upload', authenticate, upload.single('file'), uploadFile);

// ── CLINIC (Admin) ────────────────────────────────────────────
router.post('/clinic', authenticate, clinicCtrl.upsertClinic);
router.put('/clinic', authenticate, clinicCtrl.upsertClinic);
router.get('/clinic/me', authenticate, clinicCtrl.getMyClinic);
router.post('/clinic/publish', authenticate, clinicCtrl.publishClinic);
router.put('/clinic/theme', authenticate, clinicCtrl.updateTheme);
router.post('/clinic/working-hours', authenticate, clinicCtrl.saveWorkingHours);
router.post('/clinic/facilities', authenticate, clinicCtrl.saveFacilities);
router.post('/clinic/certifications', authenticate, clinicCtrl.saveCertifications);

// ── CLINIC (Public) ───────────────────────────────────────────
router.get('/clinic/slug/:slug', clinicCtrl.getClinicBySlug);
router.get('/facilities', clinicCtrl.getAllFacilities);
router.get('/clinic/:clinicId/facilities', clinicCtrl.getClinicFacilities);

// ── DOCTORS (Admin) ───────────────────────────────────────────
router.post('/doctors', authenticate, doctorCtrl.addDoctor);
router.put('/doctors/:id', authenticate, doctorCtrl.updateDoctor);
router.delete('/doctors/:id', authenticate, doctorCtrl.deleteDoctor);

// ── DOCTORS (Public) ──────────────────────────────────────────
router.get('/clinic/:clinicId/doctors', doctorCtrl.getDoctors);
router.get('/doctors/:id', doctorCtrl.getDoctor);

// ── SERVICES (Admin) ─────────────────────────────────────────
router.post('/services', authenticate, serviceCtrl.addService);
router.put('/services/:id', authenticate, serviceCtrl.updateService);
router.delete('/services/:id', authenticate, serviceCtrl.deleteService);
router.post('/categories', authenticate, serviceCtrl.addCategory);

// ── SERVICES (Public) ────────────────────────────────────────
router.get('/clinic/:clinicId/services', serviceCtrl.getServices);
router.get('/clinic/:clinicId/categories', serviceCtrl.getCategories);

// ── APPOINTMENTS ─────────────────────────────────────────────
router.get('/appointments/slots', appointmentCtrl.getAvailableSlots);
router.post('/appointments', appointmentCtrl.bookAppointment);

// Admin
router.get('/appointments', authenticate, appointmentCtrl.getAppointments);
router.put('/appointments/:id/status', authenticate, appointmentCtrl.updateAppointmentStatus);
router.post('/appointments/block-slot', authenticate, appointmentCtrl.blockSlot);
router.get('/dashboard/stats', authenticate, appointmentCtrl.getDashboardStats);

// ── BLOG (Admin) ─────────────────────────────────────────────
router.post('/blog', authenticate, blogCtrl.createBlog);
router.put('/blog/:id', authenticate, blogCtrl.updateBlog);
router.delete('/blog/:id', authenticate, blogCtrl.deleteBlog);

// Blog public
router.get('/clinic/:clinicId/blog', blogCtrl.getBlogs);
router.get('/clinic/:clinicId/blog/:slug', blogCtrl.getBlogBySlug);

module.exports = router;
