const pool = require('../../config/db');

const getClinicId = async (adminId) => {
  const r = await pool.query('SELECT id FROM clinics WHERE admin_id = $1', [adminId]);
  return r.rows[0]?.id;
};

const getServices = async (req, res) => {
  const { clinicId } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.*, sc.name as category_name, sc.icon as category_icon
       FROM services s
       LEFT JOIN service_categories sc ON sc.id = s.category_id
       WHERE s.clinic_id = $1 AND s.is_active = TRUE
       ORDER BY s.sort_order, s.name`,
      [clinicId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addService = async (req, res) => {
  const clinicId = await getClinicId(req.user.id);
  if (!clinicId) return res.status(404).json({ error: 'Clinic not found' });
  
  const { name, description, category_id, duration_minutes, price_min, price_max,
    price_display, image_url, is_featured, sort_order } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO services (clinic_id, name, description, category_id, duration_minutes,
       price_min, price_max, price_display, image_url, is_featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [clinicId, name, description, category_id, duration_minutes || 30,
        price_min, price_max, price_display, image_url, is_featured || false, sort_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const clinicId = await getClinicId(req.user.id);
  const updates = req.body;
  const fields = Object.keys(updates);
  const values = fields.map(f => updates[f]);
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  
  try {
    const result = await pool.query(
      `UPDATE services SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} AND clinic_id = $${fields.length + 2} RETURNING *`,
      [...values, id, clinicId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;
  const clinicId = await getClinicId(req.user.id);
  try {
    await pool.query('UPDATE services SET is_active = FALSE WHERE id = $1 AND clinic_id = $2', [id, clinicId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getCategories = async (req, res) => {
  const { clinicId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM service_categories WHERE clinic_id = $1 ORDER BY sort_order, name',
      [clinicId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addCategory = async (req, res) => {
  const clinicId = await getClinicId(req.user.id);
  const { name, icon, description, sort_order } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO service_categories (clinic_id, name, icon, description, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [clinicId, name, icon, description, sort_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getServices, addService, updateService, deleteService, getCategories, addCategory };
