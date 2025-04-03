import nodemailer from 'nodemailer';

interface SendEmailOptions {
  caseId: string;
  email: string;
  content: string;
}

export async function sendEmail({ caseId, email, content }: SendEmailOptions): Promise<void> {
  // Create a test account if you don't have SMTP credentials
  // For production, use your actual SMTP settings
  const testAccount = await nodemailer.createTestAccount();

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || testAccount.user,
      pass: process.env.SMTP_PASS || testAccount.pass,
    },
  });

  // Convert HTML content to plain text (simple conversion)
  const plainTextContent = content.replace(/<[^>]*>/g, '');

  // Send the email
  const info = await transporter.sendMail({
    from: `"Case Management System" <${process.env.FROM_EMAIL || 'noreply@example.com'}>`,
    to: email,
    subject: `Case Information - Case ID: ${caseId}`,
    text: plainTextContent,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Case Information</h1>
        <p><strong>Case ID:</strong> ${caseId}</p>
        <p><strong>Email:</strong> ${email}</p>
        <div style="margin-top: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
          ${content}
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          This email was sent automatically from the Case Management System.
        </p>
      </div>
    `,
  });

  // If using ethereal for testing, log the URL where you can preview the email
  if (testAccount) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
}