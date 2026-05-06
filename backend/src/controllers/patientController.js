// const pool = require('../../config/db');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// ── OTP HELPERS ──────────────────────────────────────────────────
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const generatePatientToken = (id) =>
  jwt.sign({ id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── REQUEST OTP ──────────────────────────────────────────────────
const requestOTP = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Invalidate old OTPs for this phone
    // await pool.query('UPDATE patient_otp SET is_used = TRUE WHERE phone = $1', [phone]);
    await prisma.patientOtp.updateMany({
      where: { phone, is_used: false },
      data: { is_used: true },
    });

    // await pool.query(
    //   `INSERT INTO patient_otp (phone, otp_code, expires_at) VALUES ($1, $2, $3)`,
    //   [phone, otp, expiresAt]
    // );
    await prisma.patientOtp.create({
      data: {
        phone,
        otp_code: otp,
        expires_at: expiresAt,
      },
    });

    // In production: send SMS. For dev, return in response.
    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // REMOVE in production — only for dev/demo
      dev_otp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── VERIFY OTP & LOGIN ────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  const { phone, otp, full_name, email } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

  try {
    // Check OTP
    // const otpRow = await pool.query(
    //   `SELECT * FROM patient_otp 
    //    WHERE phone = $1 AND otp_code = $2 AND is_used = FALSE AND expires_at > NOW()
    //    ORDER BY created_at DESC LIMIT 1`,
    //   [phone, otp]
    // );

    const otpRow = await prisma.patientOtp.findFirst({
      where: {
        phone,
        otp_code: otp,
        is_used: false,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!otpRow) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP used
    // await pool.query('UPDATE patient_otp SET is_used = TRUE WHERE id = $1', [otpRow.rows[0].id]);
    await prisma.patientOtp.update({
      where: { id: otpRow.id },
      data: { is_used: true },
    });

    // Find or create patient
    // let patient = await pool.query('SELECT * FROM patients WHERE phone = $1', [phone]);

    // if (patient.rows.length === 0) {
    //   // New patient — create with provided details
    //   const result = await pool.query(
    //     `INSERT INTO patients (phone, email, full_name) VALUES ($1, $2, $3) RETURNING *`,
    //     [phone, email || null, full_name || null]
    //   );
    //   patient = result;
    // } else {
    //   // Update last login & fill in name/email if provided
    //   await pool.query(
    //     `UPDATE patients SET last_login = NOW(), 
    //      email = COALESCE(NULLIF($2,''), email),
    //      full_name = COALESCE(NULLIF($3,''), full_name)
    //      WHERE phone = $1`,
    //     [phone, email || '', full_name || '']
    //   );
    //   patient = await pool.query('SELECT * FROM patients WHERE phone = $1', [phone]);
    // }

    let patient = await prisma.patient.upsert({
      where: { phone },
      update: {
        last_login: new Date(),
        email: email ?? undefined,
        full_name: full_name || undefined,
      },
      create: {
        phone,
        email: email || null,
        full_name: full_name || null,
      },
    });

    const p = patient;
    const token = generatePatientToken(p.id);

    res.json({
      token,
      patient: {
        id: p.id,
        phone: p.phone,
        email: p.email,
        full_name: p.full_name,
        is_new: !p.full_name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── GET PATIENT PROFILE ───────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    // const result = await pool.query(
    //   `SELECT id, phone, email, full_name, date_of_birth, gender, blood_group,
    //    address, emergency_contact_name, emergency_contact_phone,
    //    allergies, chronic_conditions, created_at
    //    FROM patients WHERE id = $1`,
    //   [req.patient.id]
    // );
    const result = await prisma.patient.findUnique({
      where: { id: req.patient.id },
      select: {
        id: true,
        phone: true,
        email: true,
        full_name: true,
        date_of_birth: true,
        gender: true,
        blood_group: true,
        address: true,
        emergency_contact_name: true,
        emergency_contact_phone: true,
        allergies: true,
        chronic_conditions: true,
        created_at: true,
      },
    });
    if (!result) return res.status(404).json({ error: 'Patient not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ── UPDATE PATIENT PROFILE ────────────────────────────────────────
const updateProfile = async (req, res) => {
  const {
    full_name, email, date_of_birth, gender, blood_group,
    address, emergency_contact_name, emergency_contact_phone,
    allergies, chronic_conditions
  } = req.body;

  try {
    // const result = await pool.query(
    //   `UPDATE patients SET
    //     full_name = COALESCE($1, full_name),
    //     email = COALESCE($2, email),
    //     date_of_birth = COALESCE($3, date_of_birth),
    //     gender = COALESCE($4, gender),
    //     blood_group = COALESCE($5, blood_group),
    //     address = COALESCE($6, address),
    //     emergency_contact_name = COALESCE($7, emergency_contact_name),
    //     emergency_contact_phone = COALESCE($8, emergency_contact_phone),
    //     allergies = COALESCE($9, allergies),
    //     chronic_conditions = COALESCE($10, chronic_conditions),
    //     updated_at = NOW()
    //    WHERE id = $11 RETURNING *`,
    //   [full_name, email, date_of_birth, gender, blood_group, address,
    //     emergency_contact_name, emergency_contact_phone,
    //     allergies, chronic_conditions, req.patient.id]
    // );
    const result = await prisma.patient.update({
    where: { id: req.patient.id },
    data: {
      full_name: full_name ?? undefined,
      email: email ?? undefined,
      date_of_birth: date_of_birth ?? undefined,
      gender: gender ?? undefined,
      blood_group: blood_group ?? undefined,
      address: address ?? undefined,
      emergency_contact_name: emergency_contact_name ?? undefined,
      emergency_contact_phone: emergency_contact_phone ?? undefined,
      allergies: allergies ?? undefined,
      chronic_conditions: chronic_conditions ?? undefined,
    },
  });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ── GET MY APPOINTMENTS ───────────────────────────────────────────
const getMyAppointments = async (req, res) => {
  const patientId = req.patient.id;
  const { status, clinic_id } = req.query;

  // let conditions = ['a.patient_id = $1'];
  // let values = [patientId];
  // let idx = 2;

  // if (status && status !== 'all') {
  //   conditions.push(`a.status = $${idx++}`);
  //   values.push(status);
  // }
  // if (clinic_id) {
  //   conditions.push(`a.clinic_id = $${idx++}`);
  //   values.push(clinic_id);
  // }

  try {
    // const result = await pool.query(
    //   `SELECT 
    //       a.*,
    //       d.full_name AS doctor_name,
    //       d.specialization AS doctor_specialization,
    //       d.qualification AS doctor_qualification,
    //       d.profile_image AS doctor_image,
    //       d.consultation_fee,
    //       c.clinic_name,
    //       c.clinic_id_slug,
    //       c.phone AS clinic_phone,
    //       c.address_line1,
    //       c.city,
    //       c.state,
    //       c.logo_url AS clinic_logo
    //    FROM appointments a
    //    JOIN doctors d ON d.id = a.doctor_id
    //    JOIN clinics c ON c.id = a.clinic_id
    //    WHERE ${conditions.join(' AND ')}
    //    ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
    //   values
    // );
    const result = await prisma.appointments.findMany({
      where: {
        patient_id: patientId,
        ...(status && status !== 'all' && { status }),
        ...(clinic_id && { clinic_id }),
      },
      include: {
        doctors: {
          select: {
            full_name: true,
            specialization: true,
            qualification: true,
            profile_image: true,
            consultation_fee: true,
          },
        },
        clinics: {
          select: {
            clinic_name: true,
            clinic_id_slug: true,
            phone: true,
            address_line1: true,
            city: true,
            state: true,
            logo_url: true,
          },
        },
      },
      orderBy: [
        { appointment_date: 'desc' },
        { appointment_time: 'desc' },
      ],
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── LOOKUP BY BOOKING REFERENCE (no login needed) ─────────────────
const lookupByRef = async (req, res) => {
  const { ref, phone } = req.query;
  if (!ref || !phone) return res.status(400).json({ error: 'ref and phone required' });

  try {
    // const result = await pool.query(
    //   `SELECT 
    //       a.*,
    //       d.full_name AS doctor_name,
    //       d.specialization AS doctor_specialization,
    //       d.qualification AS doctor_qualification,
    //       c.clinic_name,
    //       c.clinic_id_slug,
    //       c.phone AS clinic_phone,
    //       c.address_line1, c.city, c.state
    //    FROM appointments a
    //    JOIN doctors d ON d.id = a.doctor_id
    //    JOIN clinics c ON c.id = a.clinic_id
    //    WHERE a.booking_reference = $1 AND a.patient_phone = $2`,
    //   [ref.toUpperCase(), phone]
    // );

    const result = await prisma.appointments.findFirst({
      where: {
        booking_reference: ref.toUpperCase(),
        patient_phone: phone,
      },
      include: {
        doctors: true,
        clinics: true,
      },
    });

    if (!result) {
      return res.status(404).json({ error: 'Appointment not found. Check your booking reference and phone number.' });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── PATIENT CANCEL APPOINTMENT ────────────────────────────────────
const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const { cancellation_reason } = req.body;
  const patientId = req.patient.id;

  try {
    // Only allow cancellation of pending/confirmed, and only future appointments
    // const apt = await pool.query(
    //   `SELECT * FROM appointments 
    //    WHERE id = $1 AND patient_id = $2 AND status IN ('pending','confirmed')
    //    AND appointment_date >= CURRENT_DATE`,
    //   [id, patientId]
    // );
    const result = await prisma.$transaction(async (tx) => {
  const apt = await tx.appointments.findFirst({
    where: {
      id,
      patient_id: patientId,
      status: { in: ['pending', 'confirmed'] },
      appointment_date: { gte: new Date() },
    },
  });

  if (!apt) {
  throw { status: 400, message: 'Cannot cancel this appointment' };
  }

  const updated = await tx.appointments.update({
    where: { id },
    data: {
      status: 'cancelled',
      cancellation_reason: cancellation_reason || 'Cancelled by patient',
      cancelled_at: new Date(),
    },
  });

  if (apt.slot_id) {
    await tx.appointment_slots.update({
      where: { id: apt.slot_id },
      data: { is_booked: false },
    });
  }

  return updated;
});
res.json(result)
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
};

// ── LINK GUEST APPOINTMENTS TO PATIENT ───────────────────────────
// Called after patient logs in — links any appointments booked as guest (by phone)
const linkGuestAppointments = async (patientId, phone) => {
  try {
    // await pool.query(
    //   `UPDATE appointments SET patient_id = $1 
    //    WHERE patient_phone = $2 AND patient_id IS NULL`,
    //   [patientId, phone]
    // );
    await prisma.appointments.updateMany({
      where: {
        patient_phone: phone,
        patient_id: null,
      },
      data: {
        patient_id: patientId,
      },
    });
  } catch (err) {
    console.error('Failed to link guest appointments:', err);
  }
};

module.exports = {
  requestOTP, verifyOTP,
  getProfile, updateProfile,
  getMyAppointments, lookupByRef,
  cancelAppointment, linkGuestAppointments,
};
