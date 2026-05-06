const pool = require('../../config/db');
const prisma = require('../lib/prisma');

const getClinicId = async (adminId) => {
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

const getDoctors = async (req, res) => {
  const { clinicId } = req.params;
  try {
    // const result = await pool.query(
    //   `SELECT d.*, 
    //    COALESCE(json_agg(ds ORDER BY ds.day_of_week) FILTER (WHERE ds.id IS NOT NULL), '[]') as schedules
    //    FROM doctors d
    //    LEFT JOIN doctor_schedules ds ON ds.doctor_id = d.id
    //    WHERE d.clinic_id = $1 AND d.is_active = TRUE
    //    GROUP BY d.id ORDER BY d.sort_order, d.full_name`,
    //   [clinicId]
    // );

    const doctors = await prisma.doctors.findMany({
      where: {
        clinic_id: clinicId,
        is_active: true,
      },
      include: {
        doctor_schedules: {
          orderBy: {
            day_of_week: 'asc',
          },
        },
      },
      orderBy: [
        { sort_order: 'asc' },
        { full_name: 'asc' },
      ],
    });
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await prisma.doctors.findFirst({
      where: {
        id: id,
      },
      include: {
        doctor_schedules: {
          orderBy: {
            day_of_week: 'asc',
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (err) {
    console.error(err);
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

  // const client = await pool.connect();
  try {
   
    
    const result = await prisma.$transaction(async (tx) => {

      // 1. Create doctor
      const doctor = await tx.doctors.create({
        data: {
        clinic_id: clinicId,
        full_name,
        profile_image,
        gender,
        date_of_birth,
        qualification,
        specialization,
        sub_specialization,
        
        experience_years: experience_years ? Number(experience_years) : 0,

        designation,
        department,
        medical_registration_number,
        registration_council,
        registration_valid_till,
        email,
        phone,
        bio,
        achievements: achievements ?? [],
        languages_spoken: languages_spoken ?? [],

        consultation_fee: consultation_fee ? Number(consultation_fee) : null,
        online_consultation_fee: online_consultation_fee ? Number(online_consultation_fee) : null,

        consultation_duration: consultation_duration ? Number(consultation_duration) : 20,

        is_featured: is_featured ?? false,
        sort_order: sort_order ? Number(sort_order) : 0,
      }
      });

      // 2. Upsert schedules
      if (schedules && schedules.length > 0) {
        for (const s of schedules) {
          await tx.doctor_schedules.upsert({
            where: {
              doctor_id_day_of_week: {
                doctor_id: doctor.id,
                day_of_week: s.day_of_week,
              },
            },
            update: {
              is_available: s.is_available !== false,
              start_time: s.start_time,
              end_time: s.end_time,
              slot_duration: s.slot_duration ?? 20,
              max_appointments: s.max_appointments ?? 20,
            },
            create: {
              doctor_id: doctor.id,
              clinic_id: clinicId,
              day_of_week: s.day_of_week,
              is_available: s.is_available !== false,
              start_time: s.start_time,
              end_time: s.end_time,
              slot_duration: s.slot_duration ?? 20,
              max_appointments: s.max_appointments ?? 20,
            },
          });
        }
      }

      // 3. Update total doctors
      const count = await tx.doctors.count({
        where: {
          clinic_id: clinicId,
          is_active: true,
        },
      });

      await tx.clinics.update({
        where: { id: clinicId },
        data: { total_doctors: count },
      });

      return doctor;
      res.status(201).json(result);
    });
  } catch (err) {
    // await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const clinicId = await getClinicId(req.user.id);
  
  const { schedules, ...body } = req.body;
  // const fields = Object.keys(updates);
  // const values = fields.map(f => updates[f]);
  // const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

  const allowedFields = [
    'full_name', 'profile_image', 'gender', 'date_of_birth',
    'qualification', 'specialization', 'sub_specialization', 'experience_years',
    'designation', 'department', 'medical_registration_number', 'registration_council',
    'registration_valid_till', 'email', 'phone', 'bio', 'achievements',
    'languages_spoken', 'consultation_fee', 'online_consultation_fee',
    'consultation_duration', 'is_active', 'is_featured', 'sort_order'
  ];

  // ✅ Filter updates
  const updates = {};
  for (let key of Object.keys(body)) {
    if (allowedFields.includes(key)) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0 && !schedules) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  // const client = await pool.connect();
  try {
     const result = await prisma.$transaction(async (tx) => {

      // 1. Update doctor
      const updateResult = await tx.doctors.updateMany({
        where: {
          id: id,
          clinic_id: clinicId,
        },
        data: {
          ...updates,
          updated_at: new Date(),
        },
      });

      if (updateResult.count === 0) {
        throw new Error('Doctor not found');
      }

      // 2. Upsert schedules
      if (schedules && schedules.length > 0) {
        for (const s of schedules) {
          await tx.doctor_schedules.upsert({
            where: {
              doctor_id_day_of_week: {
                doctor_id: id,
                day_of_week: s.day_of_week,
              },
            },
            update: {
              is_available: s.is_available !== false,
              start_time: s.start_time,
              end_time: s.end_time,
              slot_duration: s.slot_duration ?? 20,
              max_appointments: s.max_appointments ?? 20,
            },
            create: {
              doctor_id: id,
              clinic_id: clinicId,
              day_of_week: s.day_of_week,
              is_available: s.is_available !== false,
              start_time: s.start_time,
              end_time: s.end_time,
              slot_duration: s.slot_duration ?? 20,
              max_appointments: s.max_appointments ?? 20,
            },
          });
        }
      }

      // 3. Fetch updated doctor
      const doctor = await tx.doctors.findFirst({
        where: {
          id: id,
          clinic_id: clinicId,
        },
        include: {
          doctor_schedules: {
            orderBy: { day_of_week: 'asc' },
          },
        },
      });

      return doctor;
      res.json(result);
    });

    res.json(result.rows[0]);
  } catch (err) {
    // await client.query('ROLLBACK');
    if (err.message === 'Doctor not found') {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// const deleteDoctor = async (req, res) => {
//   const { id } = req.params;
//   const clinicId = await getClinicId(req.user.id);
//   try {
//     await pool.query('UPDATE doctors SET is_active = FALSE WHERE id = $1 AND clinic_id = $2', [id, clinicId]);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  const clinicId = await getClinicId(req.user.id);

  try {
    const result = await prisma.doctors.updateMany({
      where: {
        id: id,
        clinic_id: clinicId,
      },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getDoctors, getDoctor, addDoctor, updateDoctor, deleteDoctor };
