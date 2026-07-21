process.env.JWT_SECRET = 'test_secret_key_for_ci_only';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Health check', () => {
  it('returns 200 ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Customer registration input validation', () => {
  it('rejects an invalid ID number (RegEx whitelist)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Test User',
      idNumber: '123', // too short - should fail the 13-digit pattern
      accountNumber: '1234567890',
      username: 'testuser1',
      password: 'ValidPass1!',
    });
    expect(res.statusCode).toBe(400);
  });

  it('rejects a weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Test User',
      idNumber: '8001015009087',
      accountNumber: '1234567890',
      username: 'testuser2',
      password: 'weak',
    });
    expect(res.statusCode).toBe(400);
  });

  it('accepts a valid registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Test User',
      idNumber: '8001015009087',
      accountNumber: '1234567890',
      username: 'testuser3',
      password: 'ValidPass1!',
    });
    expect(res.statusCode).toBe(201);
  });
});

describe('Injection attempt rejection', () => {
  it('rejects a NoSQL injection payload in login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: { $ne: null }, accountNumber: { $ne: null }, password: { $ne: null } });
    expect([400, 401]).toContain(res.statusCode);
  });
});

describe('Unauthenticated access', () => {
  it('blocks payment creation without a session', async () => {
    const res = await request(app).post('/api/payments').send({
      amount: 100,
      currency: 'ZAR',
      provider: 'SWIFT',
      payeeAccountNumber: '9876543210',
      swiftCode: 'ABSAZAJJXXX',
    });
    expect(res.statusCode).toBe(401);
  });

  it('blocks staff endpoints without a session', async () => {
    const res = await request(app).get('/api/staff/payments');
    expect(res.statusCode).toBe(401);
  });
});
