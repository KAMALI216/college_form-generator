require('dotenv').config();

const bcrypt = require('bcrypt');
const { checkDatabaseConnection } = require('./config/db');
const adminModel = require('./models/adminModel');

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  try {
    await checkDatabaseConnection();

    const existing = await adminModel.findAdminByUsername(username);

    if (existing) {
      console.log(`Admin user "${username}" already exists`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await adminModel.insertAdmin({ username, passwordHash });

    console.log(`Seeded admin user "${username}"`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  }
}

seedAdmin();