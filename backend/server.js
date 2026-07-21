require('dotenv').config();
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const staffRoutes = require('./routes/staff');
const logger = require('./utils/logger');

const app = express();

// --- 1. Core body/cookie parsing ---
app.use(express.json({ limit: '10kb' })); // small limit: mitigates payload-based DoS
app.use(cookieParser());

// --- 2. CORS: only allow the known frontend origin, credentials for cookies ---
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'https://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// --- 3. Helmet: security headers ---
// - X-Frame-Options / frame-ancestors 'none' -> mitigates clickjacking
// - HSTS -> forces browsers to only use HTTPS -> mitigates MITM / SSL stripping
// - Content-Security-Policy -> mitigates XSS by restricting script sources
// - X-Content-Type-Options: nosniff, Referrer-Policy, etc. all set by default
app.use(
  helmet({
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// --- 4. Prevent NoSQL injection (strips $ and . from user input) ---
app.use(mongoSanitize());

// --- 5. Prevent XSS by sanitising user input in body/query/params ---
app.use(xssClean());

// --- 6. Prevent HTTP Parameter Pollution ---
app.use(hpp());

// --- 7. Global rate limiting: mitigates DDoS / brute force at the network edge ---
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// --- 8. Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

// --- 9. Central error handler: never leak stack traces to the client ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(err.status || 500).json({ error: 'Something went wrong. Please try again.' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const keyPath = process.env.SSL_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;

  if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const sslOptions = {
      key: fs.readFileSync(path.resolve(keyPath)),
      cert: fs.readFileSync(path.resolve(certPath)),
    };
    https.createServer(sslOptions, app).listen(PORT, () => {
      logger.info(`HTTPS server running on port ${PORT}`);
    });
  } else {
    // Fallback so the app still runs before certs are generated (see ssl/README.md).
    // For the POE submission you must run this over HTTPS - do not demo on http.
    logger.warn('SSL certs not found - falling back to HTTP. See ssl/README.md.');
    http.createServer(app).listen(PORT, () => {
      logger.warn(`HTTP server running on port ${PORT} (NOT SECURE - dev fallback only)`);
    });
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
