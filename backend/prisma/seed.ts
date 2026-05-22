import { PrismaClient, BloodType, SectorType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hash = (p: string) => bcrypt.hash(p, 12);

async function main() {
  console.log('🌱 Seeding MediSync database...');

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@medisync.fr',
      passwordHash: await hash('Admin123!'),
      role: 'ADMIN',
      admin: { create: { firstName: 'Sophie', lastName: 'Martin' } },
    },
  });
  console.log('✅ Admin created');

  // Secretary
  const secUser = await prisma.user.create({
    data: {
      email: 'secretary@medisync.fr',
      passwordHash: await hash('Secretary123!'),
      role: 'SECRETARY',
      secretary: { create: { firstName: 'Marie', lastName: 'Dupont', phone: '01 23 45 67 89' } },
    },
  });

  // Doctors
  const doctors = await Promise.all([
    prisma.user.create({
      data: {
        email: 'dr.chen@medisync.fr',
        passwordHash: await hash('Doctor123!'),
        role: 'DOCTOR',
        doctor: {
          create: {
            firstName: 'Wei',
            lastName: 'Chen',
            specialty: 'Cardiology',
            languages: ['French', 'English', 'Mandarin'],
            sectorType: 'SECTOR_2',
            consultationRate: 60,
            bio: 'Dr. Chen is a renowned cardiologist with 15 years of experience in interventional cardiology and heart failure management.',
            licenseNumber: 'RPPS-10234567',
          },
        },
      },
      include: { doctor: true },
    }),
    prisma.user.create({
      data: {
        email: 'dr.moreau@medisync.fr',
        passwordHash: await hash('Doctor123!'),
        role: 'DOCTOR',
        doctor: {
          create: {
            firstName: 'Claire',
            lastName: 'Moreau',
            specialty: 'General Medicine',
            languages: ['French', 'English'],
            sectorType: 'SECTOR_1',
            consultationRate: 25,
            bio: 'Dr. Moreau provides comprehensive primary care with a focus on preventive medicine and chronic disease management.',
            licenseNumber: 'RPPS-20345678',
          },
        },
      },
      include: { doctor: true },
    }),
    prisma.user.create({
      data: {
        email: 'dr.garcia@medisync.fr',
        passwordHash: await hash('Doctor123!'),
        role: 'DOCTOR',
        doctor: {
          create: {
            firstName: 'Luis',
            lastName: 'Garcia',
            specialty: 'Neurology',
            languages: ['French', 'Spanish', 'English'],
            sectorType: 'SECTOR_3',
            consultationRate: 80,
            bio: 'Dr. Garcia specializes in neurological disorders including epilepsy, migraines, and neurodegenerative diseases.',
            licenseNumber: 'RPPS-30456789',
          },
        },
      },
      include: { doctor: true },
    }),
  ]);
  console.log('✅ 3 doctors created');

  // Patients
  const patientData = [
    { email: 'alice.bernard@email.fr', firstName: 'Alice', lastName: 'Bernard', dob: '1985-03-15', phone: '06 12 34 56 78', blood: 'A_POS' as BloodType, allergies: ['Penicillin'], ssn: '285031234567890' },
    { email: 'pierre.lefort@email.fr', firstName: 'Pierre', lastName: 'Lefort', dob: '1972-08-22', phone: '06 23 45 67 89', blood: 'O_NEG' as BloodType, allergies: [], ssn: '172082345678901' },
    { email: 'isabelle.paul@email.fr', firstName: 'Isabelle', lastName: 'Paul', dob: '1990-11-05', phone: '06 34 56 78 90', blood: 'B_POS' as BloodType, allergies: ['Latex', 'Ibuprofen'], ssn: '290113456789012' },
    { email: 'thomas.roux@email.fr', firstName: 'Thomas', lastName: 'Roux', dob: '1968-06-30', phone: '06 45 67 89 01', blood: 'AB_POS' as BloodType, allergies: [], ssn: '168064567890123' },
    { email: 'emma.durand@email.fr', firstName: 'Emma', lastName: 'Durand', dob: '1995-01-20', phone: '06 56 78 90 12', blood: 'A_NEG' as BloodType, allergies: ['Sulfonamides'], ssn: '295015678901234' },
    { email: 'lucas.simon@email.fr', firstName: 'Lucas', lastName: 'Simon', dob: '2000-09-14', phone: '06 67 89 01 23', blood: 'O_POS' as BloodType, allergies: [], ssn: '200096789012345' },
    { email: 'chloe.martin@email.fr', firstName: 'Chloé', lastName: 'Martin', dob: '1978-04-28', phone: '06 78 90 12 34', blood: 'B_NEG' as BloodType, allergies: ['Aspirin'], ssn: '278047890123456' },
    { email: 'jules.blanc@email.fr', firstName: 'Jules', lastName: 'Blanc', dob: '1955-12-10', phone: '06 89 01 23 45', blood: 'A_POS' as BloodType, allergies: ['Codeine'], ssn: '155128901234567' },
    { email: 'sarah.noir@email.fr', firstName: 'Sarah', lastName: 'Noir', dob: '1988-07-03', phone: '06 90 12 34 56', blood: 'AB_NEG' as BloodType, allergies: [], ssn: '288079012345678' },
    { email: 'marc.grand@email.fr', firstName: 'Marc', lastName: 'Grand', dob: '1963-02-16', phone: '06 01 23 45 67', blood: 'O_POS' as BloodType, allergies: ['Penicillin', 'NSAIDs'], ssn: '163020123456789' },
  ];

  const patients = await Promise.all(
    patientData.map(p =>
      prisma.user.create({
        data: {
          email: p.email,
          passwordHash: bcrypt.hashSync('Patient123!', 12),
          role: 'PATIENT',
          patient: {
            create: {
              firstName: p.firstName,
              lastName: p.lastName,
              dateOfBirth: new Date(p.dob),
              phone: p.phone,
              bloodType: p.blood,
              allergies: p.allergies,
              socialSecurityNumber: p.ssn,
            },
          },
        },
        include: { patient: true },
      })
    )
  );
  console.log('✅ 10 patients created');

  // Time slots for next 7 days
  const slotTimes = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const docUser of doctors) {
    const doc = docUser.doctor!;
    for (let d = 0; d < 14; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const time of slotTimes) {
        const [h, m] = time.split(':').map(Number);
        const endH = m + 30 >= 60 ? h + 1 : h;
        const endM = (m + 30) % 60;
        try {
          await prisma.timeSlot.create({
            data: {
              doctorId: doc.id,
              date,
              startTime: time,
              endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
              duration: 30,
              isAvailable: true,
            },
          });
        } catch {}
      }
    }
  }
  console.log('✅ Time slots created');

  // Create some appointments
  const secretary = await prisma.secretary.findUnique({ where: { userId: secUser.id } });

  const appointmentMeta = [
    { patientIdx: 0, docIdx: 0, motif: 'Chest pain evaluation', status: 'CONFIRMED' as const },
    { patientIdx: 1, docIdx: 1, motif: 'Annual check-up', status: 'CONFIRMED' as const },
    { patientIdx: 2, docIdx: 2, motif: 'Chronic headaches follow-up', status: 'CONFIRMED' as const },
    { patientIdx: 3, docIdx: 0, motif: 'Hypertension management', status: 'PENDING' as const },
    { patientIdx: 4, docIdx: 1, motif: 'Fatigue and general malaise', status: 'CONFIRMED' as const },
    { patientIdx: 5, docIdx: 1, motif: 'Vaccination', status: 'PENDING' as const },
    { patientIdx: 6, docIdx: 2, motif: 'Epilepsy follow-up', status: 'CONFIRMED' as const },
    { patientIdx: 7, docIdx: 0, motif: 'Post-cardiac surgery follow-up', status: 'COMPLETED' as const },
    { patientIdx: 8, docIdx: 1, motif: 'Thyroid check', status: 'COMPLETED' as const },
    { patientIdx: 9, docIdx: 2, motif: 'Migraine assessment', status: 'COMPLETED' as const },
  ];

  const allSlots = await prisma.timeSlot.findMany({ orderBy: { date: 'asc' }, take: 30 });
  const appointments = [];

  for (let i = 0; i < appointmentMeta.length && i < allSlots.length; i++) {
    const meta = appointmentMeta[i];
    const slot = allSlots[i * 3];
    const patient = patients[meta.patientIdx].patient!;
    const doctor = doctors[meta.docIdx].doctor!;

    try {
      const appt = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          secretaryId: secretary!.id,
          slotId: slot.id,
          motif: meta.motif,
          status: meta.status,
        },
      });
      await prisma.timeSlot.update({ where: { id: slot.id }, data: { isAvailable: false } });
      appointments.push(appt);
    } catch {}
  }
  console.log('✅ 10 appointments created');

  // Medical records for completed appointments
  for (let i = 7; i <= 9; i++) {
    const appt = appointments[i];
    if (!appt) continue;

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        appointmentId: appt.id,
        diagnosis: ['Hypertensive crisis', 'Hypothyroidism', 'Chronic migraine'][i - 7],
        notes: 'Patient responded well to initial treatment. Follow-up in 3 months.',
        symptoms: [['dizziness', 'chest tightness'], ['fatigue', 'weight gain'], ['severe headache', 'nausea']][i - 7],
        vitals: { bp: '140/90', hr: 78, temp: 37.2, o2: 98 },
      },
    });

    await prisma.prescription.create({
      data: {
        medicalRecordId: record.id,
        doctorId: appt.doctorId,
        patientId: appt.patientId,
        medications: [
          [{ name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' }],
          [{ name: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily (morning)', duration: '90 days' }],
          [{ name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed (max 2/day)', duration: '30 days' }, { name: 'Topiramate', dosage: '25mg', frequency: 'Twice daily', duration: '60 days' }],
        ][i - 7],
        instructions: 'Take with water. Do not exceed recommended dose.',
      },
    });
  }
  console.log('✅ Medical records and prescriptions created');

  // Invoices
  for (let i = 7; i <= 9; i++) {
    const appt = appointments[i];
    const patient = patients[appointmentMeta[i].patientIdx].patient!;
    const doctor = doctors[appointmentMeta[i].docIdx].doctor!;

    await prisma.invoice.create({
      data: {
        patientId: patient.id,
        appointmentId: appt.id,
        acts: [{ description: 'Consultation', amount: doctor.consultationRate }, { description: 'ECG', amount: 15 }],
        amount: doctor.consultationRate + 15,
        status: i === 7 ? 'PAID' : 'PENDING',
        paidAt: i === 7 ? new Date() : null,
      },
    });
  }
  console.log('✅ Invoices created');

  // Reviews
  await prisma.review.create({
    data: {
      patientId: patients[7].patient!.id,
      doctorId: doctors[0].doctor!.id,
      appointmentId: appointments[7].id,
      rating: 5,
      comment: 'Excellent doctor, very attentive and professional. Highly recommend!',
    },
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: patients[0].id, message: 'Your appointment has been confirmed for tomorrow at 09:00', type: 'APPOINTMENT_CONFIRMED' },
      { userId: patients[1].id, message: 'Reminder: Your appointment is in 24 hours', type: 'APPOINTMENT_REMINDER' },
      { userId: doctors[0].id, message: 'New patient appointment request from Alice Bernard', type: 'APPOINTMENT_BOOKED' },
    ],
  });
  console.log('✅ Notifications created');

  // Rooms
  await prisma.room.createMany({
    data: [
      { name: 'Consultation Room 1', equipment: ['Examination table', 'ECG machine', 'Stethoscope'] },
      { name: 'Consultation Room 2', equipment: ['Examination table', 'Blood pressure monitor'] },
      { name: 'Cardiology Suite', equipment: ['Echo machine', 'Stress test equipment', 'Defibrillator'] },
      { name: 'Neurology Suite', equipment: ['EEG machine', 'MRI viewer', 'Neurological test kit'] },
    ],
  });
  console.log('✅ Rooms created');

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin:     admin@medisync.fr     / Admin123!');
  console.log('Secretary: secretary@medisync.fr / Secretary123!');
  console.log('Doctor 1:  dr.chen@medisync.fr   / Doctor123!');
  console.log('Doctor 2:  dr.moreau@medisync.fr / Doctor123!');
  console.log('Doctor 3:  dr.garcia@medisync.fr / Doctor123!');
  console.log('Patient 1: alice.bernard@email.fr / Patient123!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
