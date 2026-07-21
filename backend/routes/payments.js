const express = require('express');
const Payment = require('../models/Payment');
const { authenticate, requireRole } = require('../middleware/auth');
const { isValid } = require('../utils/validators');

const router = express.Router();

// Only authenticated customers can create payments.
router.post('/', authenticate, requireRole('customer'), async (req, res, next) => {
  try {
    const { amount, currency, provider, payeeAccountNumber, swiftCode } = req.body;

    if (!isValid('amount', String(amount))) return res.status(400).json({ error: 'Invalid amount' });
    if (!isValid('currencyCode', currency)) return res.status(400).json({ error: 'Invalid currency code' });
    if (!isValid('provider', provider)) return res.status(400).json({ error: 'Invalid provider' });
    if (!isValid('accountNumber', payeeAccountNumber))
      return res.status(400).json({ error: 'Invalid payee account number' });
    if (!isValid('swiftCode', swiftCode)) return res.status(400).json({ error: 'Invalid SWIFT code' });

    const payment = await Payment.create({
      customer: req.user.id,
      amount,
      currency,
      provider,
      payeeAccountNumber,
      swiftCode,
    });

    res.status(201).json({ message: 'Payment submitted', payment });
  } catch (err) {
    next(err);
  }
});

// A customer can view only their own payment history.
router.get('/', authenticate, requireRole('customer'), async (req, res, next) => {
  try {
    const payments = await Payment.find({ customer: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ payments });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
