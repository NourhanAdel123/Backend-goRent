import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plain text fallback
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"GoRent Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: text || "",
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send a "Thank you for contacting us" email to the user
 */
export const sendContactConfirmationEmail = async ({ name, email, subject }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2563eb;">GoRent — We've Received Your Message</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for reaching out! We have received your message regarding <strong>"${subject}"</strong> and our team will get back to you as soon as possible.</p>
      <p style="color: #6b7280; font-size: 14px;">If your query is urgent, please reply to this email directly.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">This is an automated message from GoRent. Please do not reply directly to this email unless instructed to do so.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "We received your message — GoRent",
    html,
  });
};

/**
 * Notify the admin that a new contact message was submitted
 */
export const sendAdminContactNotificationEmail = async ({ name, email, subject, message }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #dc2626;">New Contact Message — GoRent</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #374151; width: 100px;">Name:</td>
          <td style="padding: 8px; color: #111827;">${name}</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 8px; font-weight: bold; color: #374151;">Email:</td>
          <td style="padding: 8px; color: #111827;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #374151;">Subject:</td>
          <td style="padding: 8px; color: #111827;">${subject}</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 8px; font-weight: bold; color: #374151; vertical-align: top;">Message:</td>
          <td style="padding: 8px; color: #111827;">${message}</td>
        </tr>
      </table>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">GoRent Admin Notification System</p>
    </div>
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `[GoRent Contact] ${subject}`,
    html,
  });
};
