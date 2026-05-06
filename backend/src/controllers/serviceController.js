const pool = require('../../config/db');
const prisma = require('../lib/prisma');

const getClinicId = async (adminId) => {
  // const r = await pool.query('SELECT id FROM clinics WHERE admin_id = $1', [adminId]);
  const clinic = await prisma.clinics.findFirst({
    where: {
      admin_id: adminId,
    },
    select: {
      id: true,
    },
  });
  return clinic?.id;
};

const getServices = async (req, res) => {
  const { clinicId } = req.params;
  try {
    // const result = await pool.query(
    //   `SELECT s.*, sc.name as category_name, sc.icon as category_icon
    //    FROM services s
    //    LEFT JOIN service_categories sc ON sc.id = s.category_id
    //    WHERE s.clinic_id = $1 AND s.is_active = TRUE
    //    ORDER BY s.sort_order, s.name`,
    //   [clinicId]
    // );
    const services = await prisma.services.findMany({
      where: {
        clinic_id: clinicId,
        is_active: true,
      },
      include: {
        service_categories: {
          select: {
            name: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { sort_order: 'asc' },
        { name: 'asc' },
      ],
    });

    // reshape response to match your old API format
    const formatted = services.map((s) => ({
      ...s,
      category_name: s.service_categories?.name || null,
      category_icon: s.service_categories?.icon || null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const addService = async (req, res) => {
  const clinicId = await getClinicId(req.user.id);
  if (!clinicId) return res.status(404).json({ error: 'Clinic not found' });
  
  const { name, description, category_id, duration_minutes, price_min, price_max,
    price_display, image_url, is_featured, sort_order } = req.body;
  
  try {
    const service = await prisma.services.create({
      data: {
        clinic_id: clinicId,
        name,
        description,
        category_id,
        duration_minutes: duration_minutes ?? 30,
        price_min,
        price_max,
        price_display,
        image_url,
        is_featured: is_featured ?? false,
        sort_order: sort_order ?? 0,
      },
    });
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const clinicId = await getClinicId(req.user.id);
  // const updates = req.body;
  // const fields = Object.keys(updates);
  // const values = fields.map(f => updates[f]);
  // const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

  const allowedFields = [
    'name',
    'description',
    'duration_minutes',
    'price_min',
    'price_max',
    'price_display',
    'image_url',
    'is_active',
    'is_featured',
    'sort_order',
    'category_id'
  ];

  // ✅ Step 2: Filter req.body
  const updates = {};
  for (let key of Object.keys(req.body)) {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  }
  
  try {
    // const result = await pool.query(
    //   `UPDATE services SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} AND clinic_id = $${fields.length + 2} RETURNING *`,
    //   [...values, id, clinicId]
    // );
    // res.json(result.rows[0]);

    const service = await prisma.services.updateMany({
      where: {
        id: id,
        clinic_id: clinicId,
      },
      data: {
        ...updates,
        updated_at: new Date(),
      },
    });

     const updatedService = await prisma.services.findFirst({
      where: {
        id: id,
        clinic_id: clinicId,
      },
    });

    res.json(updatedService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;
  const clinicId = await getClinicId(req.user.id);
  try {
    // await pool.query('UPDATE services SET is_active = FALSE WHERE id = $1 AND clinic_id = $2', [id, clinicId]);
    const result = await prisma.services.updateMany({
      where: {
        id: id,
        clinic_id: clinicId,
      },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });

    // optional: check if anything was actually updated
    if (result.count === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getCategories = async (req, res) => {
  const { clinicId } = req.params;
  try {
    // const result = await pool.query(
    //   'SELECT * FROM service_categories WHERE clinic_id = $1 ORDER BY sort_order, name',
    //   [clinicId]
    // );
    const categories = await prisma.service_categories.findMany({
      where: {
        clinic_id: clinicId,
      },
      orderBy: [
        { sort_order: 'asc' },
        { name: 'asc' },
      ],
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const addCategory = async (req, res) => {
  const clinicId = await getClinicId(req.user.id);
  const { name, icon, description, sort_order } = req.body;
  try {
    // const result = await pool.query(
    //   'INSERT INTO service_categories (clinic_id, name, icon, description, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    //   [clinicId, name, icon, description, sort_order || 0]
    // );
    const category = await prisma.service_categories.create({
      data: {
        clinic_id: clinicId,
        name,
        icon,
        description,
        sort_order: sort_order ?? 0, // default if not provided
      },
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getServices, addService, updateService, deleteService, getCategories, addCategory };
