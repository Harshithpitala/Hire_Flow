const transporter = require('../config/emailConfig');
const {
  getWelcomeEmailTemplate,
  getPasswordResetTemplate,
  getApplicationStatusTemplate,
  getInterviewScheduledTemplate,
  getPasswordResetOtpTemplate
} = require('../utils/emailTemplates');

/**
 * Generic Base Email Sender
 */
const sendMail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === 'test') {
    return { success: true, messageId: 'mock-test-message-id' };
  }
  try {
    const fromAddress = process.env.EMAIL_FROM || `"HireFlow Platform" <${process.env.SMTP_USER}>`;

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      html,
      text: text || ''
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Dispatched] To: ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Failed] To: ${to} | Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * 1. Dispatch Welcome Email
 */
const sendWelcomeEmail = async (user) => {
  if (!user || !user.email) return;
  const html = getWelcomeEmailTemplate(user.name, user.role);
  return sendMail({
    to: user.email,
    subject: 'Welcome to HireFlow Platform! 🚀',
    html,
    text: `Welcome to HireFlow, ${user.name}! Your account as a ${user.role} has been created.`
  });
};

/**
 * 2. Dispatch Password Reset Link Email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  if (!user || !user.email) return;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
  const html = getPasswordResetTemplate(user.name, resetUrl);

  return sendMail({
    to: user.email,
    subject: 'HireFlow Account - Password Reset Request',
    html,
    text: `Reset your HireFlow password using this link: ${resetUrl} (Valid for 10 minutes)`
  });
};

/**
 * 3. Dispatch Application Status Update Email
 */
const sendApplicationStatusEmail = async (studentUser, jobTitle, companyName, newStatus) => {
  if (!studentUser || !studentUser.email) return;
  const html = getApplicationStatusTemplate(studentUser.name, jobTitle, companyName, newStatus);

  return sendMail({
    to: studentUser.email,
    subject: `Application Update: ${jobTitle} at ${companyName}`,
    html,
    text: `Your application for ${jobTitle} at ${companyName} has been updated to: ${newStatus}.`
  });
};

/**
 * 4. Dispatch Interview Scheduled Email
 */
const sendInterviewScheduledEmail = async (studentUser, jobTitle, companyName, interviewDetails) => {
  if (!studentUser || !studentUser.email) return;
  const html = getInterviewScheduledTemplate(studentUser.name, jobTitle, companyName, interviewDetails);

  return sendMail({
    to: studentUser.email,
    subject: `Interview Scheduled: ${jobTitle} with ${companyName}`,
    html,
    text: `An interview has been scheduled for ${jobTitle} with ${companyName}. Date: ${interviewDetails.scheduledDate}. Link: ${interviewDetails.meetingLink}`
  });
};
/**
 * Dispatch Password Reset OTP Email
 */
const sendPasswordResetOtpEmail = async (user, otp) => {
  if (!user || !user.email) return;
  const html = getPasswordResetOtpTemplate(user.name, otp);

  return sendMail({
    to: user.email,
    subject: `${otp} is your HireFlow verification code`,
    html,
    text: `Your HireFlow password reset OTP code is: ${otp}. It expires in 10 minutes.`
  });
};

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendApplicationStatusEmail,
  sendInterviewScheduledEmail,
  sendPasswordResetOtpEmail
};