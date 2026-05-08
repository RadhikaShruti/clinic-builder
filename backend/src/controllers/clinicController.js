const pool = require('../../config/db');
const slugify = require('slugify');
const prisma = require('../lib/prisma');

const generateSlug = async (name) => {
  let base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let count = 1;
  while (true) {
    // const exists = await pool.query('SELECT id FROM clinics WHERE clinic_id_slug = $1', [slug]);
    const exists = await prisma.clinics.findFirst({where: { clinic_id_slug: slug }});
    if (!exists) break;
    slug = `${base}-${count++}`;
  }
  return slug;
};

// Create or update clinic (onboarding wizard)
const upsertClinic = async (req, res) => {
  const cleanedData = {
        ...req.body,
        established_year: req.body.established_year
          ? parseInt(req.body.established_year)
          : null
      };
  const adminId = req.user.id;
  try {
    // const existing = await pool.query('SELECT id FROM clinics WHERE admin_id = $1', [adminId]);
    const existing = await prisma.clinics.findFirst({where: { admin_id: adminId }});

    if (existing) {
      // Update
      // const clinic = existing.rows[0];
      // const updates = req.body;
      // const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'admin_id');
      // const values = fields.map(f => updates[f]);
      // const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

      
      const updated = await prisma.clinics.update({
        where: { id: existing.id },
          data: {
            ...cleanedData,
            updated_at: new Date(),
            id: undefined,
            admin_id: undefined
          }
        });

      return res.json(updated);
    } else {
      // Create
      const slug = await generateSlug(req.body.clinic_name || 'clinic');
      // const {
      //   clinic_name, tagline, description, phone, email, website, whatsapp,
      //   address_line1, address_line2, city, state, pincode, country,
      //   google_maps_link, about_us, mission, vision, established_year,
      //   registration_number, gstin, logo_url, banner_url
      // } = req.body;

      // const result = await pool.query(
      //   `INSERT INTO clinics (
      //     admin_id, clinic_id_slug, clinic_name, tagline, description, phone, email,
      //     website, whatsapp, address_line1, address_line2, city, state, pincode, country,
      //     google_maps_link, about_us, mission, vision, established_year,
      //     registration_number, gstin, logo_url, banner_url
      //   ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
      //   RETURNING *`,
      //   [adminId, slug, clinic_name, tagline, description, phone, email,
      //     website, whatsapp, address_line1, address_line2, city, state, pincode, country || 'India',
      //     google_maps_link, about_us, mission, vision, established_year,
      //     registration_number, gstin, logo_url, banner_url]
      // );



      // Create default theme
      // await pool.query('INSERT INTO clinic_themes (clinic_id) VALUES ($1)', [result.rows[0].id]);

      const created = await prisma.clinics.create({
        data: {
          ...cleanedData,
          admin_id: adminId,
          clinic_id_slug: slug,
          country: req.body.country || 'India',
          

          // ✅ auto create theme (relation required)
          clinic_themes: {
            create: {}
          }
        }
      });

      return res.status(201).json(created);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

const getMyClinic = async (req, res) => {
  try {
    // const result = await pool.query(
    //   `SELECT c.*, ct.template_id, ct.primary_color, ct.secondary_color, ct.accent_color,
    //    ct.font_family, ct.heading_font, ct.background_color, ct.text_color, ct.border_radius
    //    FROM clinics c LEFT JOIN clinic_themes ct ON ct.clinic_id = c.id
    //    WHERE c.admin_id = $1`,
    //   [req.user.id]
    // );
    const clinic = await prisma.clinics.findFirst({
      where: { admin_id: req.user.id },
      include: {
        clinic_themes: true
      }
    });
    if (!clinic) return res.status(404).json({ error: 'No clinic found' });
    res.json(clinic);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getClinicBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.*, ct.template_id, ct.primary_color, ct.secondary_color, ct.accent_color,
       ct.font_family, ct.heading_font, ct.background_color, ct.text_color, ct.border_radius,
       ct.custom_css
       FROM clinics c LEFT JOIN clinic_themes ct ON ct.clinic_id = c.id
       WHERE c.clinic_id_slug = $1 AND c.is_active = TRUE`,
      [slug]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Clinic not found' });

    const clinic = result.rows[0];

    // Get working hours
    const hours = await pool.query(
      'SELECT * FROM clinic_working_hours WHERE clinic_id = $1 ORDER BY day_of_week',
      [clinic.id]
    );
    clinic.working_hours = hours.rows;

    // Get certifications
    const certs = await pool.query(
      'SELECT * FROM clinic_certifications WHERE clinic_id = $1',
      [clinic.id]
    );
    clinic.certifications = certs.rows;

    res.json(clinic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const publishClinic = async (req, res) => {
  try {
    // const clinic = await pool.query('SELECT id FROM clinics WHERE admin_id = $1', [req.user.id]);
    const clinic = await prisma.clinics.findFirst({
      where: { admin_id: req.user.id }
    });
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    // const result = await pool.query(
    //   `UPDATE clinics SET is_published = TRUE, published_at = NOW() WHERE id = $1 RETURNING clinic_id_slug, is_published`,
    //   [clinic.rows[0].id]
    // );
    const updated = await prisma.clinics.update({
      where: { id: clinic.id },
      data: {
        is_published: true,
        published_at: new Date()
      },
      select: {
        clinic_id_slug: true,
        is_published: true
      }
    });
    res.json({ success: true, ...updated });
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' });
  }
};

const updateTheme = async (req, res) => {
  try {
    // const clinic = await pool.query('SELECT id FROM clinics WHERE admin_id = $1', [req.user.id]);
    const clinic = await prisma.clinics.findFirst({
      where: { admin_id: req.user.id }
    });
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    // const { template_id, primary_color, secondary_color, accent_color,
    //   background_color, text_color, font_family, heading_font, border_radius, custom_css } = req.body;

    // const result = await pool.query(
    //   `UPDATE clinic_themes SET
    //     template_id = COALESCE($1, template_id),
    //     primary_color = COALESCE($2, primary_color),
    //     secondary_color = COALESCE($3, secondary_color),
    //     accent_color = COALESCE($4, accent_color),
    //     background_color = COALESCE($5, background_color),
    //     text_color = COALESCE($6, text_color),
    //     font_family = COALESCE($7, font_family),
    //     heading_font = COALESCE($8, heading_font),
    //     border_radius = COALESCE($9, border_radius),
    //     custom_css = COALESCE($10, custom_css),
    //     updated_at = NOW()
    //    WHERE clinic_id = $11 RETURNING *`,
    //   [template_id, primary_color, secondary_color, accent_color, background_color,
    //     text_color, font_family, heading_font, border_radius, custom_css, clinic.rows[0].id]
    // );
    const updated = await prisma.clinic_themes.upsert({
      where: { clinic_id: clinic.id },
      update: {
        ...req.body,
        updated_at: new Date()
      },
      create: {
        clinic_id:clinic.id,
        ...req.body
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const saveWorkingHours = async (req, res) => {
  const { hours } = req.body; // array of {day_of_week, is_open, open_time, close_time, ...}
  try {
    // const clinic = await pool.query('SELECT id FROM clinics WHERE admin_id = $1', [req.user.id]);
    const clinic = await prisma.clinics.findFirst({
      where: { admin_id: req.user.id }
    });
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    
    const cid = clinic.id;

    // converts the string 9:00 to date
    const toTime = (time) => {
      if (!time) return null;

      // converts "09:00" -> Date object
      return new Date(`1970-01-01T${time}:00.000Z`);
    };

    for (const h of hours) {
      // await pool.query(
      //   `INSERT INTO clinic_working_hours (clinic_id, day_of_week, is_open, open_time, close_time, has_break, break_start, break_end)
      //    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      //    ON CONFLICT (clinic_id, day_of_week) DO UPDATE SET
      //      is_open = EXCLUDED.is_open, open_time = EXCLUDED.open_time,
      //      close_time = EXCLUDED.close_time, has_break = EXCLUDED.has_break,
      //      break_start = EXCLUDED.break_start, break_end = EXCLUDED.break_end`,
      //   [cid, h.day_of_week, h.is_open, h.open_time, h.close_time,
      //     h.has_break || false, h.break_start, h.break_end]
      // );
      await prisma.clinic_working_hours.upsert({
        where: {
          clinic_id_day_of_week: {
            clinic_id: cid,
            day_of_week: h.day_of_week
          }
        },
        update: {
          is_open: h.is_open,
          open_time: toTime(h.close_time),
          close_time: toTime(h.close_time),
          has_break: h.has_break || false,
          break_start: toTime(h.break_start),
          break_end: toTime(h.break_end),
          updated_at: new Date()
        },
        create: {
          clinic_id: cid,
          day_of_week: h.day_of_week,
          is_open: h.is_open,
          open_time: toTime(h.open_time),
          close_time: toTime(h.close_time),
          has_break: h.has_break || false,
          break_start: toTime(h.break_start),
          break_end: toTime(h.break_end)
        }
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const saveFacilities = async (req, res) => {
  const { facilities } = req.body;
  try {
    // const clinic = await pool.query('SELECT id FROM clinics WHERE admin_id = $1', [req.user.id]);
    const clinic = await prisma.clinics.findFirst({
      where: { admin_id: req.user.id }
    });
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    
    const cid = clinic.id;

    // await pool.query('DELETE FROM clinic_facilities WHERE clinic_id = $1', [cid]);
    // for (const f of facilities) {
    //   await pool.query(
    //     `INSERT INTO clinic_facilities (clinic_id, facility_id, custom_name, custom_icon, description)
    //      VALUES ($1, $2, $3, $4, $5)`,
    //     [cid, f.facility_id || null, f.custom_name || null, f.custom_icon || null, f.description || null]
    //   );
    // }
    await prisma.$transaction([
      prisma.clinic_facilities.deleteMany({
        where: { clinic_id: cid }
      }),
      prisma.clinic_facilities.createMany({
        data: facilities.map(f => ({
          clinic_id: cid,
          facility_id: f.facility_id || null,
          custom_name: f.custom_name || null,
          custom_icon: f.custom_icon || null,
          description: f.description || null
        }))
      })
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getClinicFacilities = async (req, res) => {
  const { clinicId } = req.params;
  try {
    // const result = await pool.query(
    //   `SELECT cf.*, f.name as facility_name, f.icon as facility_icon
    //    FROM clinic_facilities cf
    //    LEFT JOIN facilities f ON f.id = cf.facility_id
    //    WHERE cf.clinic_id = $1`,
    //   [clinicId]
    // );
    const facilities = await prisma.clinic_facilities.findMany({
      where: { clinic_id: clinicId },
      include: {
        facilities: {
          select: {
            name: true,
            icon: true
          }
        }
      }
    });
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllFacilities = async (req, res) => {
  try {
    // const result = await pool.query('SELECT * FROM facilities WHERE is_default = TRUE ORDER BY name');
    const facilities = await prisma.facilities.findMany({
      // where: { is_default: true },
      orderBy: { name: 'asc' }
    });
    console.log(facilities);
    res.json(facilities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const saveCertifications = async (req, res) => {
  const { certifications } = req.body;
  try {
    // const clinic = await pool.query('SELECT id FROM clinics WHERE admin_id = $1', [req.user.id]);
    const clinic = await prisma.clinics.findFirst({
      where: { admin_id: req.user.id }
    });
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    
    const cid = clinic.id;

    // for (const cert of certifications) {
    //   if (cert.id) {
    //     await pool.query(
    //       `UPDATE clinic_certifications SET title=$1, issuing_authority=$2, certificate_number=$3,
    //        issued_date=$4, expiry_date=$5 WHERE id=$6 AND clinic_id=$7`,
    //       [cert.title, cert.issuing_authority, cert.certificate_number,
    //         cert.issued_date, cert.expiry_date, cert.id, cid]
    //     );
    //   } else {
    //     await pool.query(
    //       `INSERT INTO clinic_certifications (clinic_id, title, issuing_authority, certificate_number, issued_date, expiry_date)
    //        VALUES ($1,$2,$3,$4,$5,$6)`,
    //       [cid, cert.title, cert.issuing_authority, cert.certificate_number, cert.issued_date, cert.expiry_date]
    //     );
    //   }
    // }
    await prisma.$transaction(
      certifications.map(cert => {
        if (cert.id) {
          // 🔁 update
          return prisma.clinic_certifications.update({
            where: { id: cert.id },
            data: {
              title: cert.title,
              issuing_authority: cert.issuing_authority,
              certificate_number: cert.certificate_number,
              issued_date: cert.issued_date,
              expiry_date: cert.expiry_date
            }
          });
        } else {
          // ➕ create
          return prisma.clinic_certifications.create({
            data: {
              clinic_id: cid,
              title: cert.title,
              issuing_authority: cert.issuing_authority,
              certificate_number: cert.certificate_number,
              issued_date: cert.issued_date,
              expiry_date: cert.expiry_date
            }
          });
        }
      })
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  upsertClinic, getMyClinic, getClinicBySlug, publishClinic,
  updateTheme, saveWorkingHours, saveFacilities, getClinicFacilities,
  getAllFacilities, saveCertifications
};
