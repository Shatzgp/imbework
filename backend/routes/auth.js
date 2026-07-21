const express = require('express');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { PATTERNS, isValid } = require('../utils/validators');
const { loginLimiter } = require('../middleware/security');

const router = express.Router();

function setAuthCookie(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  // HttpOnly: JS can't read it (mitigates XSS token theft)
  // Secure: only sent over HTTPS (mitigates MITM)
  // SameSite=Strict: not sent on cross-site requests (mitigates CSRF / session riding)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const { fullName, idNumber, accountNumber, username, password } = req.body;

    // Whitelist every field against its RegEx pattern before touching the DB.
    if (!isValid('fullName', fullName)) return res.status(400).json({ error: 'Invalid full name' });
    if (!isValid('idNumber', idNumber)) return res.status(400).json({ error: 'Invalid ID number' });
    if (!isValid('accountNumber', accountNumber))
      return res.status(400).json({ error: 'Invalid account number' });
    if (!isValid('username', username)) return res.status(400).json({ error: 'Invalid username' });
    if (!isValid('password', password))
      return res.status(400).json({
        error:
          'Password must be 8+ characters with upper, lower, digit and special character',
      });

    const existing = await Customer.findOne({
      $or: [{ username }, { accountNumber }, { idNumber }],
    });
    if (existing) return res.status(409).json({ error: 'Account already exists' });

    const customer = new Customer({
      fullName,
      idNumber,
      accountNumber,
      username,
      passwordHash: password, // hashed automatically by the pre-save hook
    });
    await customer.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    next(err);
  }
});

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, accountNumber, password } = req.body;

    if (!isValid('username', username) || !isValid('accountNumber', accountNumber)) {
      return res.status(400).json({ error: 'Invalid credentials format' });
    }

    const customer = await Customer.findOne({ username, accountNumber });
    // Generic error message on purpose - don't reveal whether username or
    // password was the wrong part (prevents username enumeration).
    if (!customer || !(await customer.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid username, account number or password' });
    }

    setAuthCookie(res, { id: customer._id, role: 'customer' });
    res.status(200).json({ message: 'Login successful', user: customer });
  } catch (err) {
    next(err);
  }
});

router.post('/employee-login', loginLimiter, async (req, res, next) => {
  try {
    const Employee = require('../models/Employee');
    const { username, password } = req.body;

    if (!isValid('username', username)) {
      return res.status(400).json({ error: 'Invalid credentials format' });
    }

    const employee = await Employee.findOne({ username });
    if (!employee || !(await employee.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    setAuthCookie(res, { id: employee._id, role: employee.role });
    res.status(200).json({ message: 'Login successful', user: employee });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out' });
});

module.exports = router;
