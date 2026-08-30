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

describe('Job Lifecycle & Search Test Suite', () => {
  let recruiterToken;

  beforeEach(async () => {
    // 1. Register Recruiter
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Sarah Connor',
      email: 'sarah.recruiter@cyberdyne.com',
      password: 'Password123!',
      role: 'recruiter'
    });
    recruiterToken = regRes.body.token;

    // 2. Set up Company Profile
    await request(app)
      .post('/api/recruiters/company')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        name: 'Cyberdyne Systems',
        description: 'Advanced AI and automated infrastructure systems.',
        headquarters: 'Sunnyvale, CA',
        industry: 'Software Development'
      });
  });

  test('POST /api/jobs - Recruiter successfully posts a new job', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const jobPayload = {
      title: 'Backend Software Engineer',
      description: 'Design and implement REST APIs with Express, Node.js and MongoDB databases.',
      location: 'Bangalore, India',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      experienceLevel: '1-3 Years',
      skillsRequired: ['Node.js', 'Express', 'MongoDB', 'JavaScript'],
      deadline: futureDate.toISOString()
    };

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send(jobPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(jobPayload.title);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  test('POST /api/jobs - Fails when mandatory description is too short (400)', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const invalidPayload = {
      title: 'QA Tester',
      description: 'Too short',
      location: 'Remote',
      deadline: futureDate.toISOString(),
      skillsRequired: ['Testing']
    };

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send(invalidPayload);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/jobs - Returns paginated job search results', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  test('GET /api/jobs/my/listings - Returns recruiter listings instead of treating "my" as a job id', async () => {
    const res = await request(app)
      .get('/api/jobs/my/listings')
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
