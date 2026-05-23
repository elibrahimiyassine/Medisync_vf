import cron from 'node-cron';
import { prisma } from './prisma';
import { sendEmail } from './email';
import { logger } from './logger';

export function scheduleReminders(): void {
  cron.schedule('*/15 * * * *', async () => {
    const now = new Date();

    const windows: Array<[number, string]> = [
      [24 * 60 * 60 * 1000, '24h'],
      [60 * 60 * 1000, '1h'],
    ];

    for (const [offsetMs, label] of windows) {
      const windowStart = new Date(now.getTime() + offsetMs - 10 * 60 * 1000);
      const windowEnd   = new Date(now.getTime() + offsetMs + 10 * 60 * 1000);

      const appointments = await prisma.appointment.findMany({
        where: {
          status: { in: ['CONFIRMED', 'PENDING'] },
          slot: { date: { gte: windowStart, lt: windowEnd } },
        },
        include: {
          patient: { include: { user: true } },
          doctor: true,
          slot: true,
        },
      });

      for (const appt of appointments) {
        try {
          const date = new Date(appt.slot.date).toLocaleDateString('fr-FR');
          const time = appt.slot.startTime;

          await sendEmail({
            to: appt.patient.user.email,
            subject: `Rappel rendez-vous MediSync — dans ${label}`,
            html: `<div style="font-family:sans-serif;background:#070B14;color:#E8F4FD;padding:40px;border-radius:12px;max-width:600px;margin:0 auto;border:1px solid rgba(0,212,255,0.3);">
              <h1 style="color:#00D4FF;text-align:center;">MediSync</h1>
              <h2 style="color:#00F5A0;">Rappel de rendez-vous</h2>
              <p>Cher(e) <strong>${appt.patient.firstName} ${appt.patient.lastName}</strong>,</p>
              <p>Votre rendez-vous est prévu <strong>dans ${label}</strong>.</p>
              <div style="background:#0D1526;border:1px solid rgba(0,212,255,0.2);border-radius:8px;padding:20px;margin:20px 0;">
                <p><strong style="color:#00D4FF;">Médecin :</strong> Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}</p>
                <p><strong style="color:#00D4FF;">Date :</strong> ${date}</p>
                <p><strong style="color:#00D4FF;">Heure :</strong> ${time}</p>
              </div>
              <p>Merci de vous présenter 10 minutes avant l'heure prévue.</p>
              <p style="color:#5A7A9B;font-size:12px;margin-top:30px;">Message automatique MediSync.</p>
            </div>`,
          });

          await prisma.notification.create({
            data: {
              userId: appt.patient.userId,
              message: `Rappel : votre rendez-vous avec Dr. ${appt.doctor.lastName} est dans ${label} (${date} à ${time})`,
              type: 'APPOINTMENT_REMINDER',
              data: { appointmentId: appt.id },
            },
          });
        } catch (err) {
          logger.error(`Reminder failed for appointment ${appt.id}:`, err);
        }
      }
    }
  });

  logger.info('Appointment reminder scheduler started (runs every 15 min)');
}
