const express = require('express');
const Payment = require('../models/Payment');
const { authenticate, requireRole } = require('../middleware/auth');
const { isValid } = require('../utils/validators');

const router = express.Router();

// Staff view: all pending/verified transactions awaiting action.
router.get('/payments', authenticate, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: { $in: ['pending', 'verified'] } })
      .populate('customer', 'fullName accountNumber')
      .sort({ createdAt: 1 });
    res.status(200).json({ payments });
  } catch (err) {
    next(err);
  }
});

// Staff verifies the payee account number and SWIFT code match before submission.
router.post(
  '/payments/:id/verify',
  authenticate,
  requireRole('staff', 'admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValid('objectId', id)) return res.status(400).json({ error: 'Invalid payment id' });

      const payment = await Payment.findById(id);
      if (!payment) return res.status(404).json({ error: 'Payment not found' });
      if (payment.status !== 'pending')
        return res.status(409).json({ error: 'Payment is not in a verifiable state' });

      payment.status = 'verified';
      payment.verifiedBy = req.user.id;
      payment.verifiedAt = new Date();
      await payment.save();

      res.status(200).json({ message: 'Payment verified', payment });
    } catch (err) {
      next(err);
    }
  }
);

// Staff submits a verified payment onward to SWIFT. This is the final step -
// the job "ends" here per the brief.
router.post(
  '/payments/:id/submit',
  authenticate,
  requireRole('staff', 'admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValid('objectId', id)) return res.status(400).json({ error: 'Invalid payment id' });

      const payment = await Payment.findById(id);
      if (!payment) return res.status(404).json({ error: 'Payment not found' });
      if (payment.status !== 'verified')
        return res.status(409).json({ error: 'Payment must be verified before submission' });

      // In production this is where you'd call the real SWIFT gateway/API.
      payment.status = 'submitted';
      payment.submittedAt = new Date();
      await payment.save();

      res.status(200).json({ message: 'Payment submitted to SWIFT', payment });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
