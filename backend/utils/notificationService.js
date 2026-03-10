const nodemailer = require("nodemailer");

/*
========================================
SMTP CONFIGURATION
Reads credentials from .env
========================================
*/

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/*
========================================
VERIFY SMTP CONNECTION
Runs once when server starts
========================================
*/

transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

/*
========================================
GENERIC EMAIL FUNCTION
Used by all notifications
========================================
*/

async function sendEmail(to, subject, message) {
  try {

    const mailOptions = {
      from: `"TestTrack Pro" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: message
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);

  } catch (err) {

    console.error("Email send error:", err);

  }
}

/*
========================================
BUG ASSIGNED EMAIL
========================================
*/

async function notifyBugAssigned(email, bugId) {

  const subject = "New Bug Assigned";

  const message = `
Hello,

A new bug has been assigned to you.

Bug ID: ${bugId}

Please check the bug tracker for more details.

Regards,
TestTrack Pro
`;

  await sendEmail(email, subject, message);
}

/*
========================================
BUG STATUS CHANGE EMAIL
========================================
*/

async function notifyBugStatusChange(email, bugId, status) {

  const subject = "Bug Status Updated";

  const message = `
Hello,

Bug ${bugId} status has been updated.

New Status: ${status}

Please review the update in TestTrack Pro.

Regards,
TestTrack Pro
`;

  await sendEmail(email, subject, message);
}

/*
========================================
TEST RUN ASSIGNED EMAIL
========================================
*/

async function notifyTestAssigned(email, runName) {

  const subject = "New Test Run Assigned";

  const message = `
Hello,

You have been assigned to a new test run.

Test Run: ${runName}

Please login to TestTrack Pro to start testing.

Regards,
TestTrack Pro
`;

  await sendEmail(email, subject, message);
}

/*
========================================
RETEST REQUEST EMAIL
========================================
*/

async function notifyRetest(email, bugId) {

  const subject = "Re-test Requested";

  const message = `
Hello,

A re-test has been requested.

Bug ID: ${bugId}

Please re-execute the test case and update the result.

Regards,
TestTrack Pro
`;

  await sendEmail(email, subject, message);
}

/*
========================================
MENTION EMAIL
========================================
*/

async function notifyMention(email, bugId) {

  const subject = "You were mentioned in a comment";

  const message = `
Hello,

You were mentioned in a comment.

Reference: ${bugId}

Please check the discussion in TestTrack Pro.

Regards,
TestTrack Pro
`;

  await sendEmail(email, subject, message);
}

/*
========================================
EXPORT FUNCTIONS
========================================
*/

module.exports = {
  sendEmail,
  notifyBugAssigned,
  notifyBugStatusChange,
  notifyTestAssigned,
  notifyRetest,
  notifyMention
};