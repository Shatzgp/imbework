const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    employeeNumber: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['staff', 'admin'], default: 'staff' },
  },
  { timestamps: true }
);

employeeSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
  next();
});

employeeSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

employeeSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

// NOTE: employees are only ever created via seed/seedEmployees.js or an admin
// tool - there is deliberately no public /register endpoint for staff, per
// the brief ("no registration process is possible" for employees).
module.exports = mongoose.model('Employee', employeeSchema);
