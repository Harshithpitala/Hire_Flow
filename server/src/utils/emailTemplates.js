/**
 * HTML Template for New User Registration
 */
exports.getWelcomeEmailTemplate = (name, role) => {
  const formattedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Candidate';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background-color: #4F46E5; color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; line-height: 1.6; }
          .highlight-box { background-color: #EEF2FF; border-left: 4px solid #4F46E5; padding: 14px 18px; margin: 20px 0; border-radius: 4px; }
          .footer { padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to HireFlow</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name || 'User'}</strong>,</p>
            <p>Welcome aboard! Your HireFlow account has been created with the role of <strong>${formattedRole}</strong>.</p>
            <div class="highlight-box">
              <p style="margin: 0;">You can now complete your portfolio profile, track live application pipelines, and schedule interviews seamlessly.</p>
            </div>
            <p>If you have questions or encounter issues, reply directly to this email for support.</p>
            <p>Best regards,<br/>The HireFlow Placement Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HireFlow Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * HTML Template for Password Reset Flow
 */
exports.getPasswordResetTemplate = (name, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background-color: #4F46E5; color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; line-height: 1.6; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background-color: #4F46E5; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
          .url-box { background: #f8fafc; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 13px; color: #64748b; margin-top: 12px; }
          .footer { padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name || 'User'}</strong>,</p>
            <p>We received a request to reset your HireFlow account credentials. Click the button below to set a new password:</p>
            <div class="btn-container">
              <a href="${resetUrl}" target="_blank" class="btn">Reset My Password</a>
            </div>
            <p style="font-size: 14px; margin-bottom: 4px;">Or copy and paste this verification URL into your browser:</p>
            <div class="url-box">${resetUrl}</div>
            <p style="font-size: 13px; color: #dc2626; margin-top: 20px;">⏱️ This reset link is valid for 10 minutes. If you did not request this change, you can safely ignore this message.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HireFlow Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * HTML Template for Application Status Transitions
 */
exports.getApplicationStatusTemplate = (name, jobTitle, companyName, newStatus) => {
  const formattedStatus = newStatus ? newStatus.replace(/_/g, ' ') : 'Updated';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background-color: #4F46E5; color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; line-height: 1.6; }
          .status-badge { display: inline-block; background-color: #EEF2FF; color: #4F46E5; font-weight: 700; padding: 6px 14px; border-radius: 20px; margin: 10px 0; border: 1px solid #C7D2FE; }
          .footer { padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name || 'Candidate'}</strong>,</p>
            <p>There has been a status update on your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
            <p>New Stage: <span class="status-badge">${formattedStatus}</span></p>
            <p>You can track complete timeline details and review feedback in your student dashboard.</p>
            <p>Best regards,<br/>${companyName} Recruitment Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HireFlow Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * HTML Template for Scheduled Video/Technical Interviews
 */
exports.getInterviewScheduledTemplate = (name, jobTitle, companyName, interviewDetails = {}) => {
  const { scheduledDate, durationMinutes, meetingLink, interviewerName, notes } = interviewDetails;

  const formattedDate = scheduledDate
    ? new Date(scheduledDate).toLocaleString()
    : 'To be announced';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background-color: #10B981; color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; line-height: 1.6; }
          .details-card { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 18px; border-radius: 6px; margin: 20px 0; }
          .btn-container { text-align: center; margin: 24px 0; }
          .btn { background-color: #10B981; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
          .footer { padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Interview Invitation 📅</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name || 'Candidate'}</strong>,</p>
            <p>You have been invited for an interview for <strong>${jobTitle}</strong> with <strong>${companyName}</strong>.</p>
            <div class="details-card">
              <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
              <p style="margin: 4px 0;"><strong>Duration:</strong> ${durationMinutes || 45} Minutes</p>
              ${interviewerName ? `<p style="margin: 4px 0;"><strong>Interviewer:</strong> ${interviewerName}</p>` : ''}
              ${notes ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            ${
              meetingLink
                ? `<div class="btn-container"><a href="${meetingLink}" target="_blank" class="btn">Join Interview Room</a></div>`
                : ''
            }
            <p>Please make sure you join 5 minutes early with your camera and microphone tested.</p>
            <p>Best regards,<br/>${companyName} Recruitment Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HireFlow Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
/**
 * HTML Template for 6-Digit Password Reset OTP
 */
exports.getPasswordResetOtpTemplate = (name, otp) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333333; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background-color: #4F46E5; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { padding: 30px 24px; text-align: center; }
          .otp-box { background: #EEF2FF; border: 2px dashed #4F46E5; border-radius: 8px; padding: 18px 24px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4F46E5; display: inline-block; margin: 20px 0; }
          .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HireFlow Verification Code</h1>
          </div>
          <div class="content">
            <p style="margin: 0; font-size: 16px;">Hi <strong>${name || 'User'}</strong>,</p>
            <p style="color: #64748b; margin-top: 6px;">Use the following One-Time Password (OTP) to reset your account password:</p>
            <div class="otp-box">${otp}</div>
            <p style="font-size: 13px; color: #dc2626; margin-top: 10px;">⏱️ This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HireFlow Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};