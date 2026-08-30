const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Role-Based Authorization (RBAC) Test Suite', () => {
  let studentToken;
  let recruiterToken;

  beforeEach(async () => {
    // 1. Create Student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Pooja Sharma',
      email: 'pooja.student@example.com',
      password: 'Password123!',
      role: 'student'
    });
    studentToken = studentRes.body.token;

    // 2. Create Recruiter
    const recruiterRes = await request(app).post('/api/auth/register').send({
      name: 'Marcus Vance',
      email: 'marcus.recruiter@example.com',
      password: 'Password123!',
      role: 'recruiter'
    });
    recruiterToken = recruiterRes.body.token;
  });

  test('GET /api/auth/me - Rejects unauthenticated request without token (401)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/student-only - Student role accesses student route (200)', async () => {
    const res = await request(app)
      .get('/api/auth/student-only')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/auth/recruiter-only - Student role blocked from recruiter route (403)', async () => {
    const res = await request(app)
      .get('/api/auth/recruiter-only')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/admin/overview - Recruiter role blocked from admin console (403)', async () => {
    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toBe(403);
  });
});