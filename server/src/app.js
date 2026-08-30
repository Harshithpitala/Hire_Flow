const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Middleware & Routers
const { globalLimiter } = require('./middleware/security');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Set Security HTTP Headers
app.use(helmet());

// 2. CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Apply Global Rate Limiting to /api
app.use('/api', globalLimiter);

// 4. Request Body Parsers with limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Safe NoSQL Sanitizer (Sanitizes req.body and req.params without touching immutable req.query)
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (/^\$/.test(key) || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  next();
});

// 6. API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// 7. Catch-All 404 & Centralized Error Handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;