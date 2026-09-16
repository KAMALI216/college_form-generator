const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body || {};

    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({ message: 'full_name is required' });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: 'email is required' });
    }

    if (!password) {
      return res.status(400).json({ message: 'password is required' });
    }

    const existingRows = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [String(email).trim().toLowerCase()]);

    if (existingRows.length) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [String(full_name).trim(), String(email).trim().toLowerCase(), passwordHash, 'USER']
    );

    return res.status(201).json({
      message: 'User registered successfully',
      id: result.insertId,
    });
  } catch (error) {
    console.error('user register error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !String(email).trim() || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const rows = await query(
      'SELECT id, full_name, email, password, role FROM users WHERE email = ? AND role = ? LIMIT 1',
      [String(email).trim().toLowerCase(), 'USER']
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken(user);

    return res.status(200).json({
      token,
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });
  } catch (error) {
    console.error('user login error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;