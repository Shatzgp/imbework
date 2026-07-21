// Employees have no public registration process (per the brief), so accounts
// must be pre-provisioned by an administrator. Run with: npm run seed

require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const logger = require('../utils/logger');

const STAFF_TO_SEED = [
  {
    fullName: 'Staff Member One',
    employeeNumber: 'EMP1001',
    username: 'staff1',
    passwordHash: 'ChangeMe!2024', // hashed automatically by the model's pre-save hook
    role: 'staff',
  },
  {
    fullName: 'Admin User',
    employeeNumber: 'EMP1000',
    username: 'admin1',
    passwordHash: 'ChangeMe!2024',
    role: 'admin',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const staff of STAFF_TO_SEED) {
    const exists = await Employee.findOne({ username: staff.username });
    if (exists) {
      logger.info(`Skipping ${staff.username} - already exists`);
      continue;
    }
    await Employee.create(staff);
    logger.info(`Created employee ${staff.username}`);
  }

  await mongoose.disconnect();
  logger.info('Seeding complete. Change these passwords before any real deployment.');
}

seed().catch((err) => {
  logger.error('Seeding failed', { error: err.message });
  process.exit(1);
});
