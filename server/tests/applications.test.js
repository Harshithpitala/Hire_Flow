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

describe('Application Pipeline & Duplicate Prevention Test Suite', () => {
  let studentToken;
  let recruiterToken;
  let createdJobId;

  beforeEach(async () => {
    // 1. Register Student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Kunal Deshmukh',
      email: 'kunal.candidate@example.com',
      password: 'Password123!',
      role: 'student'
    });
    studentToken = studentRes.body.token;

    // 2. Register Recruiter
    const recruiterRes = await request(app).post('/api/auth/register').send({
      name: 'Anita Roy',
      email: 'anita.hiring@fintech.com',
      password: 'Password123!',
      role: 'recruiter'
    });
    recruiterToken = recruiterRes.body.token;

    // 3. Create Company
    await request(app)
      .post('/api/recruiters/company')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        name: 'FinTech Innovations',
        description: 'Modern financial services and payment infrastructure.',
        headquarters: 'Mumbai, India',
        industry: 'Financial Technology (FinTech)'
      });

    // 4. Create Job
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);

    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Full-Stack Developer (MERN)',
        description: 'Lead web application development using React, Node.js and MongoDB.',
        location: 'Mumbai, India',
        jobType: 'Full-time',
        workMode: 'On-site',
        experienceLevel: 'Fresher / Entry-Level',
        skillsRequired: ['React', 'Node.js', 'MongoDB'],
        deadline: futureDate.toISOString()
      });

    createdJobId = jobRes.body.data._id;
  });

  test('POST /api/applications - Student submits job application', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        jobId: createdJobId,
        coverLetter: 'I have built multiple full-stack React projects.'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPLIED');
  });

  test('POST /api/applications - Blocks duplicate application by same student (409 Conflict)', async () => {
    // First application
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        jobId: createdJobId,
        coverLetter: 'First submission.'
      });

    // Second application attempt
    const duplicateRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        jobId: createdJobId,
        coverLetter: 'Second submission attempt.'
      });

    expect(duplicateRes.statusCode).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });
});