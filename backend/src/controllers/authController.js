const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const signup = async (req, res) => {
  const { email, password, full_name, phone } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM admin_users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO admin_users (email, password_hash, full_name, phone)
       VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, phone`,
      [email, password_hash, full_name, phone]
    );
    const user = result.rows[0];
    const token = generateToken(user.id);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1 AND is_active = TRUE',
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    await pool.query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = generateToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        profile_image: user.profile_image,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, phone, profile_image, created_at FROM admin_users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { signup, login, getMe };
