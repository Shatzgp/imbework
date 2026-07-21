const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, required: true }, // ISO 4217, e.g. ZAR, USD
    provider: { type: String, required: true }, // e.g. SWIFT
    payeeAccountNumber: { type: String, required: true },
    swiftCode: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'verified', 'submitted', 'rejected'],
      default: 'pending',
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    verifiedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
