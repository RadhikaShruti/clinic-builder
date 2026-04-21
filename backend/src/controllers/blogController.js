const pool = require('../../config/db');
const slugify = require('slugify');

const getClinicId = async (adminId) => {
  const r = await pool.query('SELECT id FROM clinics WHERE admin_id = $1', [adminId]);
  return r.rows[0]?.id;
};

const getBlogs = async (req, res) => {
  const { clinicId } = req.params;
  const { status } = req.query;
  try {
    let query = `SELECT id, title, slug, excerpt, cover_image, tags, category, status,
                 author_name, views, published_at, created_at FROM blog_posts
                 WHERE clinic_id = $1`;
    const values = [clinicId];
    if (status) { query += ` AND status = $2`; values.push(status); }
    else { query += ` AND status = 'published'`; }
    query += ` ORDER BY published_at DESC NULLS LAST, created_at DESC`;
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getBlogBySlug = async (req, res) => {
  const { clinicId, slug } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM blog_posts WHERE clinic_id = $1 AND slug = $2 AND status = 'published'`,
      [clinicId, slug]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Post not found' });
    // Increment views
    await pool.query('UPDATE blog_posts SET views = views + 1 WHERE id = $1', [result.rows[0].id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createBlog = async (req, res) => {
  const clinicId = await getClinicId(req.user.id);
  if (!clinicId) return res.status(404).json({ error: 'Clinic not found' });
  
  const { title, excerpt, content, cover_image, tags, category, status, author_name, meta_title, meta_description } = req.body;
  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;
  while (true) {
    const exists = await pool.query('SELECT id FROM blog_posts WHERE clinic_id = $1 AND slug = $2', [clinicId, slug]);
    if (exists.rows.length === 0) break;
    slug = `${baseSlug}-${count++}`;
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO blog_posts (clinic_id, title, slug, excerpt, content, cover_image, tags, category,
       status, author_name, meta_title, meta_description, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [clinicId, title, slug, excerpt, content, cover_image, tags || [],
        category, status || 'draft', author_name, meta_title, meta_description,
        status === 'published' ? new Date() : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateBlog = async (req, res) => {
  const { id } = req.params;
  const clinicId = await getClinicId(req.user.id);
  const updates = req.body;
  if (updates.status === 'published') updates.published_at = new Date();
  
  const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'clinic_id');
  const values = fields.map(f => updates[f]);
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  
  try {
    const result = await pool.query(
      `UPDATE blog_posts SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} AND clinic_id = $${fields.length + 2} RETURNING *`,
      [...values, id, clinicId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;
  const clinicId = await getClinicId(req.user.id);
  try {
    await pool.query('UPDATE blog_posts SET status = $1 WHERE id = $2 AND clinic_id = $3', ['archived', id, clinicId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog };
