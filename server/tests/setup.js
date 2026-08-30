// 1. Force critical environment variables before any application imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'hireflow_test_jwt_secret_key_1234567890';
process.env.JWT_EXPIRES_IN = '7d';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'testpassword';
process.env.EMAIL_FROM = 'HireFlow Test <no-reply@hireflow.com>';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

jest.setTimeout(30000);

const connectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
};

const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = {
  connectTestDB,
  clearTestDB,
  closeTestDB
};