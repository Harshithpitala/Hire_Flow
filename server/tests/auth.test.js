const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');
const User = require('../src/models/User');

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Authentication Test Suite', () => {
  const validStudent = {
    name: 'Suresh Raina',
    email: 'suresh.student@example.com',
    password: 'Password123!',
    role: 'student'
  };

  test('POST /api/auth/register - Successfully registers a student user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validStudent);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', validStudent.email);
    expect(res.body.user.role).toBe('student');

    // Confirm password is not returned in response payload
    expect(res.body.user).not.toHaveProperty('password');

    // Confirm record exists in DB with hashed password
    const userInDb = await User.findOne({ email: validStudent.email }).select('+password');
    expect(userInDb).not.toBeNull();
    expect(userInDb.password).not.toBe(validStudent.password);
  });

  test('POST /api/auth/register - Rejects duplicate email registration with 409', async () => {
    await request(app).post('/api/auth/register').send(validStudent);

    const duplicateRes = await request(app)
      .post('/api/auth/register')
      .send(validStudent);

    expect(duplicateRes.statusCode).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  test('POST /api/auth/login - Successfully authenticates and returns JWT', async () => {
    await request(app).post('/api/auth/register').send(validStudent);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: validStudent.email,
        password: validStudent.password
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body).toHaveProperty('token');
  });

  test('GET /api/auth/me - Returns the authenticated user in the client response shape', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validStudent);

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registerRes.body.token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user).toMatchObject({
      email: validStudent.email,
      role: 'student'
    });
  });

  test('POST /api/auth/login - Rejects invalid password credentials with 401', async () => {
    await request(app).post('/api/auth/register').send(validStudent);

    const badLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: validStudent.email,
        password: 'WrongPassword123'
      });

    expect(badLoginRes.statusCode).toBe(401);
    expect(badLoginRes.body.success).toBe(false);
  });
});
