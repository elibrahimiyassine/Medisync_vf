import nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"MediSync" <${process.env.SMTP_USER}>`,
      ...options,
    });
    logger.info(`Email sent to ${options.to}`);
  } catch (err) {
    logger.error('Failed to send email:', err);
  }
};

export const sendAppointmentConfirmation = async (
  email: string,
  patientName: string,
  doctorName: string,
  date: string,
  time: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Appointment Confirmed — MediSync',
    html: `
      <div style="font-family: 'DM Sans', sans-serif; background: #070B14; color: #E8F4FD; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(0,212,255,0.3);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00D4FF; font-size: 28px;">MediSync</h1>
          <p style="color: #5A7A9B;">Your Health, Our Priority</p>
        </div>
        <h2 style="color: #00F5A0;">Appointment Confirmed!</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment has been confirmed with the following details:</p>
        <div style="background: #0D1526; border: 1px solid rgba(0,212,255,0.2); border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong style="color: #00D4FF;">Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong style="color: #00D4FF;">Date:</strong> ${date}</p>
          <p><strong style="color: #00D4FF;">Time:</strong> ${time}</p>
        </div>
        <p>Please arrive 10 minutes early. Contact us if you need to reschedule.</p>
        <p style="color: #5A7A9B; font-size: 12px; margin-top: 30px;">This is an automated message from MediSync. Please do not reply.</p>
      </div>
    `,
  });
};

export const sendInvoiceEmail = async (
  email: string,
  patientName: string,
  doctorName: string,
  date: string,
  invoiceNumber: string,
  amount: number,
  acts: Array<{ description: string; amount: number }>
): Promise<void> => {
  const actsRows = acts.map(a =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid rgba(0,212,255,0.1);">${a.description}</td>
     <td style="padding:8px 12px;border-bottom:1px solid rgba(0,212,255,0.1);text-align:right;">${a.amount.toFixed(2)} DH</td></tr>`
  ).join('');
  await sendEmail({
    to: email,
    subject: `Facture MediSync — ${invoiceNumber}`,
    html: `<div style="font-family:'DM Sans',sans-serif;background:#070B14;color:#E8F4FD;padding:40px;border-radius:12px;max-width:600px;margin:0 auto;border:1px solid rgba(0,212,255,0.3);">
      <h1 style="color:#00D4FF;text-align:center;">MediSync</h1>
      <h2 style="color:#00F5A0;">Votre facture #${invoiceNumber}</h2>
      <p>Cher(e) <strong>${patientName}</strong>,</p>
      <p>Veuillez trouver ci-dessous votre facture du <strong>${date}</strong>.</p>
      <div style="background:#0D1526;border:1px solid rgba(0,212,255,0.2);border-radius:8px;padding:20px;margin:20px 0;">
        <p><strong style="color:#00D4FF;">Médecin :</strong> Dr. ${doctorName}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          <thead><tr style="background:rgba(0,212,255,0.08);">
            <th style="padding:8px 12px;text-align:left;color:#00D4FF;font-size:12px;">Acte</th>
            <th style="padding:8px 12px;text-align:right;color:#00D4FF;font-size:12px;">Montant</th>
          </tr></thead>
          <tbody>${actsRows}</tbody>
        </table>
        <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(0,245,160,0.08);border-radius:6px;margin-top:12px;">
          <strong>Total</strong><strong style="color:#00F5A0;">${amount.toFixed(2)} DH</strong>
        </div>
      </div>
      <p style="color:#5A7A9B;font-size:12px;margin-top:30px;">Message automatique MediSync. Merci de ne pas y répondre.</p>
    </div>`,
  });
};

export const sendPasswordResetEmail = async (email: string, resetUrl: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Password Reset — MediSync',
    html: `
      <div style="font-family: sans-serif; background: #070B14; color: #E8F4FD; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00D4FF;">Reset Your Password</h1>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #00D4FF, #7B61FF); color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};
