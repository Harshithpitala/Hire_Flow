const nodemailer = require('nodemailer');

const port = parseInt(process.env.SMTP_PORT, 10) || 587;
const isSecure = port === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: port,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'testpassword'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Skip connection verification when running automated tests
if (process.env.NODE_ENV !== 'test') {
  transporter.verify((error) => {
    if (error) {
      console.error('[Nodemailer] SMTP Connection Error:', error.message);
    } else {
      console.log(`[Nodemailer] SMTP Transporter ready (${process.env.SMTP_HOST}:${port})`);
    }
  });
}

module.exports = transporter;