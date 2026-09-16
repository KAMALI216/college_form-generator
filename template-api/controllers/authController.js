const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel');

async function login(req, res) {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const admin = await adminModel.findAdminByUsername(String(username).trim());

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: 'ADMIN',
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  login,
};