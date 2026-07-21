// Central RegEx whitelist patterns.
// Whitelisting (allow only known-good characters) is safer than blacklisting
// (trying to block known-bad ones), because it fails closed instead of open.

const PATTERNS = {
  // Letters, spaces, hyphens and apostrophes only - covers most SA full names.
  fullName: /^[A-Za-z\s'-]{2,100}$/,

  // South African 13-digit ID number.
  idNumber: /^\d{13}$/,

  // Bank account number: 6-20 digits.
  accountNumber: /^\d{6,20}$/,

  // Username: alphanumeric, underscore, dot, 3-30 chars.
  username: /^[A-Za-z0-9._]{3,30}$/,

  // SWIFT/BIC code: 8 or 11 characters, format AAAABBCCXXX.
  swiftCode: /^[A-Za-z]{4}[A-Za-z]{2}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/,

  // ISO 4217 3-letter currency code (e.g. ZAR, USD, EUR).
  currencyCode: /^[A-Z]{3}$/,

  // Positive monetary amount, up to 2 decimal places.
  amount: /^\d{1,12}(\.\d{1,2})?$/,

  // Password: min 8 chars, at least one upper, one lower, one digit, one special.
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/,

  // Payment provider name: letters, spaces, digits, hyphen (e.g. "SWIFT", "Visa Direct").
  provider: /^[A-Za-z0-9\s-]{2,50}$/,

  // MongoDB ObjectId, used when IDs travel through the URL/body.
  objectId: /^[a-f\d]{24}$/i,
};

function isValid(pattern, value) {
  return typeof value === 'string' && PATTERNS[pattern].test(value);
}

module.exports = { PATTERNS, isValid };
