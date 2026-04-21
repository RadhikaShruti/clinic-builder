const pool = require('../../config/db');

// Generate slots for a doctor on a specific date
const generateSlotsForDate = async (doctorId, clinicId, date) => {
  const dayOfWeek = new Date(date).getDay();
  
  const schedule = await pool.query(
    `SELECT * FROM doctor_schedules WHERE doctor_id = $1 AND day_of_week = $2 AND is_available = TRUE`,
    [doctorId, dayOfWeek]
  );
  
  if (!schedule.rows[0]) return [];
  
  const s = schedule.rows[0];
  const slots = [];
  
  const [startH, startM] = s.start_time.split(':').map(Number);
  const [endH, endM] = s.end_time.split(':').map(Number);
  const slotDuration = s.slot_duration || 20;
  
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;
  
  while (current + slotDuration <= end) {
    const sh = String(Math.floor(current / 60)).padStart(2, '0');
    const sm = String(current % 60).padStart(2, '0');
    const eh = String(Math.floor((current + slotDuration) / 60)).padStart(2, '0');
    const em = String((current + slotDuration) % 60).padStart(2, '0');
    
    slots.push({
      doctor_id: doctorId,
      clinic_id: clinicId,
      slot_date: date,
      start_time: `${sh}:${sm}`,
      end_time: `${eh}:${em}`
    });
    current += slotDuration;
  }
  
  // Insert slots (ignore duplicates)
  for (const slot of slots) {
    await pool.query(
      `INSERT INTO appointment_slots (doctor_id, clinic_id, slot_date, start_time, end_time)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (doctor_id, slot_date, start_time) DO NOTHING`,
      [slot.doctor_id, slot.clinic_id, slot.slot_date, slot.start_time, slot.end_time]
    );
  }
  
  return slots;
};

const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return res.status(400).json({ error: 'doctorId and date required' });
  
  try {
    // Generate slots if not exist
    const existing = await pool.query(
      'SELECT id FROM appointment_slots WHERE doctor_id = $1 AND slot_date = $2 LIMIT 1',
      [doctorId, date]
    );
    
    if (existing.rows.length === 0) {
      const doctor = await pool.query('SELECT clinic_id FROM doctors WHERE id = $1', [doctorId]);
      if (doctor.rows[0]) {
        await generateSlotsForDate(doctorId, doctor.rows[0].clinic_id, date);
      }
    }
    
    const slots = await pool.query(
      `SELECT * FROM appointment_slots 
       WHERE doctor_id = $1 AND slot_date = $2 AND is_blocked = FALSE
       ORDER BY start_time`,
      [doctorId, date]
    );
    
    res.json(slots.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const bookAppointment = async (req, res) => {
  const {
    clinic_id, doctor_id, slot_id,
    patient_name, patient_email, patient_phone,
    patient_age, patient_gender, patient_address,
    appointment_date, appointment_time,
    reason_for_visit, symptoms
  } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check slot availability
    if (slot_id) {
      const slotCheck = await client.query(
        'SELECT * FROM appointment_slots WHERE id = $1 FOR UPDATE',
        [slot_id]
      );
      if (!slotCheck.rows[0] || slotCheck.rows[0].is_booked) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Slot is no longer available' });
      }
      // Mark slot as booked
      await client.query('UPDATE appointment_slots SET is_booked = TRUE WHERE id = $1', [slot_id]);
    }
    
    const result = await client.query(
      `INSERT INTO appointments (
        clinic_id, doctor_id, slot_id, patient_name, patient_email, patient_phone,
        patient_age, patient_gender, patient_address, appointment_date, appointment_time,
        reason_for_visit, symptoms, booking_reference
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'')
      RETURNING *`,
      [clinic_id, doctor_id, slot_id || null, patient_name, patient_email, patient_phone,
        patient_age, patient_gender, patient_address, appointment_date, appointment_time,
        reason_for_visit, symptoms]
    );
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  } finally {
    client.release();
  }
};

const getClinicId = async (adminId) => {
  const r = await pool.query('SELECT id FROM clinics WHERE admin_id = $1', [adminId]);
  return r.rows[0]?.id;
};

const getAppointments = async (req, res) => {
  const clinicId = await getClinicId(req.user.id);
  const { status, date, doctor_id, page = 1, limit = 20 } = req.query;
  
  let conditions = ['a.clinic_id = $1'];
  let values = [clinicId];
  let idx = 2;
  
  if (status) { conditions.push(`a.status = $${idx++}`); values.push(status); }
  if (date) { conditions.push(`a.appointment_date = $${idx++}`); values.push(date); }
  if (doctor_id) { conditions.push(`a.doctor_id = $${idx++}`); values.push(doctor_id); }
  
  const offset = (page - 1) * limit;
  
  try {
    const result = await pool.query(
      `SELECT a.*, d.full_name as doctor_name, d.specialization
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );
    
    const count = await pool.query(
      `SELECT COUNT(*) FROM appointments a WHERE ${conditions.join(' AND ')}`,
      values
    );
    
    res.json({ appointments: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes, cancellation_reason } = req.body;
  const clinicId = await getClinicId(req.user.id);
  
  try {
    let extraFields = '';
    let values = [status];
    let idx = 2;
    
    if (admin_notes) { extraFields += `, admin_notes = $${idx++}`; values.push(admin_notes); }
    if (cancellation_reason) { extraFields += `, cancellation_reason = $${idx++}`; values.push(cancellation_reason); }
    if (status === 'confirmed') extraFields += `, confirmed_at = NOW()`;
    if (status === 'cancelled') extraFields += `, cancelled_at = NOW()`;
    if (status === 'completed') extraFields += `, completed_at = NOW()`;
    
    values.push(id, clinicId);
    
    const result = await pool.query(
      `UPDATE appointments SET status = $1${extraFields}, updated_at = NOW()
       WHERE id = $${idx} AND clinic_id = $${idx + 1} RETURNING *`,
      values
    );
    
    // If cancelling, free up the slot
    if (status === 'cancelled' && result.rows[0]?.slot_id) {
      await pool.query('UPDATE appointment_slots SET is_booked = FALSE WHERE id = $1', [result.rows[0].slot_id]);
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const blockSlot = async (req, res) => {
  const { doctor_id, slot_date, start_time, block_reason } = req.body;
  const clinicId = await getClinicId(req.user.id);
  
  try {
    await pool.query(
      `UPDATE appointment_slots SET is_blocked = TRUE, block_reason = $1
       WHERE doctor_id = $2 AND clinic_id = $3 AND slot_date = $4 AND start_time = $5`,
      [block_reason, doctor_id, clinicId, slot_date, start_time]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  const clinicId = await getClinicId(req.user.id);
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [total, todayApts, pending, completed, doctors] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM appointments WHERE clinic_id = $1', [clinicId]),
      pool.query('SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND appointment_date = $2', [clinicId, today]),
      pool.query("SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND status = 'pending'", [clinicId]),
      pool.query("SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND status = 'completed'", [clinicId]),
      pool.query('SELECT COUNT(*) FROM doctors WHERE clinic_id = $1 AND is_active = TRUE', [clinicId]),
    ]);
    
    const recentApts = await pool.query(
      `SELECT a.*, d.full_name as doctor_name FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       WHERE a.clinic_id = $1 ORDER BY a.created_at DESC LIMIT 5`,
      [clinicId]
    );
    
    res.json({
      total_appointments: parseInt(total.rows[0].count),
      today_appointments: parseInt(todayApts.rows[0].count),
      pending_appointments: parseInt(pending.rows[0].count),
      completed_appointments: parseInt(completed.rows[0].count),
      total_doctors: parseInt(doctors.rows[0].count),
      recent_appointments: recentApts.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAvailableSlots, bookAppointment, getAppointments,
  updateAppointmentStatus, blockSlot, getDashboardStats
};
