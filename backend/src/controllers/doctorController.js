const pool = require('../../config/db');

const getClinicId = async (adminId) => {
  const r = await pool.query('SELECT id FROM clinics WHERE admin_id = $1', [adminId]);
  return r.rows[0]?.id;
};

const getDoctors = async (req, res) => {
  const { clinicId } = req.params;
  try {
    const result = await pool.query(
      `SELECT d.*, 
       COALESCE(json_agg(ds ORDER BY ds.day_of_week) FILTER (WHERE ds.id IS NOT NULL), '[]') as schedules
       FROM doctors d
       LEFT JOIN doctor_schedules ds ON ds.doctor_id = d.id
       WHERE d.clinic_id = $1 AND d.is_active = TRUE
       GROUP BY d.id ORDER BY d.sort_order, d.full_name`,
      [clinicId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT d.*, 
       COALESCE(json_agg(ds ORDER BY ds.day_of_week) FILTER (WHERE ds.id IS NOT NULL), '[]') as schedules
       FROM doctors d
       LEFT JOIN doctor_schedules ds ON ds.doctor_id = d.id
       WHERE d.id = $1 GROUP BY d.id`,
      [id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Doctor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addDoctor = async (req, res) => {
  const clinicId = await getClinicId(req.user.id);
  if (!clinicId) return res.status(404).json({ error: 'Clinic not found' });
  
  const {
    full_name, profile_image, gender, date_of_birth,
    qualification, specialization, sub_specialization, experience_years,
    designation, department, medical_registration_number, registration_council,
    registration_valid_till, email, phone, bio, achievements, languages_spoken,
    consultation_fee, online_consultation_fee, consultation_duration,
    is_featured, sort_order, schedules
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO doctors (
        clinic_id, full_name, profile_image, gender, date_of_birth,
        qualification, specialization, sub_specialization, experience_years,
        designation, department, medical_registration_number, registration_council,
        registration_valid_till, email, phone, bio, achievements, languages_spoken,
        consultation_fee, online_consultation_fee, consultation_duration,
        is_featured, sort_order
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
      RETURNING *`,
      [clinicId, full_name, profile_image, gender, date_of_birth,
        qualification, specialization, sub_specialization, experience_years || 0,
        designation, department, medical_registration_number, registration_council,
        registration_valid_till, email, phone, bio, achievements || [], languages_spoken || [],
        consultation_fee, online_consultation_fee, consultation_duration || 20,
        is_featured || false, sort_order || 0]
    );
    const doctor = result.rows[0];

    // Save schedules
    if (schedules && schedules.length > 0) {
      for (const s of schedules) {
        await client.query(
          `INSERT INTO doctor_schedules (doctor_id, clinic_id, day_of_week, is_available, start_time, end_time, slot_duration, max_appointments)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (doctor_id, day_of_week) DO UPDATE SET
             is_available=EXCLUDED.is_available, start_time=EXCLUDED.start_time,
             end_time=EXCLUDED.end_time, slot_duration=EXCLUDED.slot_duration,
             max_appointments=EXCLUDED.max_appointments`,
          [doctor.id, clinicId, s.day_of_week, s.is_available !== false,
            s.start_time, s.end_time, s.slot_duration || 20, s.max_appointments || 20]
        );
      }
    }

    await client.query('UPDATE clinics SET total_doctors = (SELECT COUNT(*) FROM doctors WHERE clinic_id = $1 AND is_active = TRUE) WHERE id = $1', [clinicId]);
    await client.query('COMMIT');
    res.status(201).json(doctor);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  } finally {
    client.release();
  }
};

const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const clinicId = await getClinicId(req.user.id);
  
  const { schedules, ...updates } = req.body;
  const fields = Object.keys(updates);
  const values = fields.map(f => updates[f]);
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE doctors SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} AND clinic_id = $${fields.length + 2} RETURNING *`,
      [...values, id, clinicId]
    );

    if (schedules && schedules.length > 0) {
      for (const s of schedules) {
        await client.query(
          `INSERT INTO doctor_schedules (doctor_id, clinic_id, day_of_week, is_available, start_time, end_time, slot_duration, max_appointments)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (doctor_id, day_of_week) DO UPDATE SET
             is_available=EXCLUDED.is_available, start_time=EXCLUDED.start_time,
             end_time=EXCLUDED.end_time, slot_duration=EXCLUDED.slot_duration`,
          [id, clinicId, s.day_of_week, s.is_available !== false,
            s.start_time, s.end_time, s.slot_duration || 20, s.max_appointments || 20]
        );
      }
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  const clinicId = await getClinicId(req.user.id);
  try {
    await pool.query('UPDATE doctors SET is_active = FALSE WHERE id = $1 AND clinic_id = $2', [id, clinicId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getDoctors, getDoctor, addDoctor, updateDoctor, deleteDoctor };
