const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12; // bcrypt generates + stores a unique salt per hash automatically

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    idNumber: { type: String, required: true, unique: true }, // stored hashed - see pre-save hook
    accountNumber: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash password before saving. Never store plaintext passwords.
customerSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
  next();
});

customerSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Never let password hash leak into API responses.
customerSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.idNumber; // sensitive PII - don't echo back either
    return ret;
  },
});

module.exports = mongoose.model('Customer', customerSchema);
