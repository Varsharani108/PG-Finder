import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // not configured
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured. In local/dev environments without
 * SMTP credentials, it safely logs the message to the console instead of
 * throwing, so the reset-password flow keeps working end to end.
 */
export async function sendEmail({ to, subject, html }) {
  const t = getTransporter();

  if (!t) {
    console.log("\n[email:dev-fallback] SMTP not configured. Would have sent:");
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body: ${html}\n`);
    return { simulated: true };
  }

  return t.sendMail({
    from: process.env.SMTP_FROM || `"PG Finder" <no-reply@pgfinder.local>`,
    to,
    subject,
    html,
  });
}
